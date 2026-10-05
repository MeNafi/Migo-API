import { OAuth2Client } from "google-auth-library";
import httpStatus from "http-status";
import { Role } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import config from "../config";
import { AppError } from "../utils/AppError";
import { comparePassword, hashPassword, randomOtp, randomToken, sha256 } from "../utils/hash";
import { jwtUtils } from "../utils/jwt";
import { notifyUser } from "../lib/notify";

const googleClient = config.google_client_id ? new OAuth2Client(config.google_client_id) : null;

const sanitizeUser = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    omit: { passwordHash: true },
    include: { profile: true },
  });
};

const issueTokens = async (user: { id: string; email: string; role: Role }, name: string, meta?: { userAgent?: string; ip?: string }) => {
  const jwtPayload = { id: user.id, email: user.email, role: user.role, name };
  const accessToken = jwtUtils.createToken(jwtPayload, config.jwt_access_secret, config.jwt_access_expires_in);
  const refreshToken = jwtUtils.createToken(jwtPayload, config.jwt_refresh_secret, config.jwt_refresh_expires_in);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: meta?.userAgent,
      ip: meta?.ip,
    },
  });

  return { accessToken, refreshToken };
};

const register = async (role: Role, payload: { fullName: string; email: string; phone?: string; password: string; gender?: string }) => {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: payload.email }, payload.phone ? { phone: payload.phone } : undefined].filter(Boolean) as any },
  });
  if (existing) {
    throw new AppError(httpStatus.CONFLICT, "An account with this email or phone already exists");
  }

  const passwordHash = await hashPassword(payload.password);
  const user = await prisma.user.create({
    data: {
      email: payload.email.toLowerCase(),
      phone: payload.phone,
      passwordHash,
      role,
      profile: {
        create: {
          fullName: payload.fullName,
          gender: payload.gender,
        },
      },
    },
  });

  const tokens = await issueTokens(user, payload.fullName);
  const safe = await sanitizeUser(user.id);
  return { user: safe, ...tokens };
};

const login = async (payload: { email?: string; phone?: string; password: string }, meta?: { userAgent?: string; ip?: string }) => {
  const user = await prisma.user.findFirst({
    where: payload.email ? { email: payload.email.toLowerCase() } : { phone: payload.phone },
    include: { profile: true },
  });
  if (!user || !user.passwordHash) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
  }
  if (user.status !== "ACTIVE") {
    throw new AppError(httpStatus.FORBIDDEN, "Account is not active");
  }
  const matched = await comparePassword(payload.password, user.passwordHash);
  if (!matched) throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const tokens = await issueTokens(user, user.profile?.fullName || "Migo User", meta);
  return { user: await sanitizeUser(user.id), ...tokens };
};

const googleLogin = async (idToken: string, preferredRole?: "PASSENGER" | "COMMUTER") => {
  if (!googleClient || !config.google_client_id) {
    throw new AppError(httpStatus.SERVICE_UNAVAILABLE, "Google OAuth is not configured");
  }
  const ticket = await googleClient.verifyIdToken({ idToken, audience: config.google_client_id });
  const payload = ticket.getPayload();
  if (!payload?.email) throw new AppError(httpStatus.UNAUTHORIZED, "Google token is invalid");

  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId: payload.sub }, { email: payload.email.toLowerCase() }] },
    include: { profile: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: payload.email.toLowerCase(),
        googleId: payload.sub,
        role: preferredRole || "PASSENGER",
        emailVerifiedAt: new Date(),
        profile: {
          create: {
            fullName: payload.name || "Migo User",
            photoUrl: payload.picture,
          },
        },
      },
      include: { profile: true },
    });
  } else if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId: payload.sub, emailVerifiedAt: user.emailVerifiedAt || new Date() },
      include: { profile: true },
    });
  }

  const tokens = await issueTokens(user, user.profile?.fullName || "Migo User");
  return { user: await sanitizeUser(user.id), ...tokens };
};

const refresh = async (incoming?: string) => {
  if (!incoming) throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token is required");
  const verified = jwtUtils.verifyToken(incoming, config.jwt_refresh_secret);
  if (!verified.success) throw new AppError(httpStatus.UNAUTHORIZED, "Invalid refresh token");

  const stored = await prisma.refreshToken.findFirst({
    where: { tokenHash: sha256(incoming), revokedAt: null },
  });
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token has been revoked or expired");
  }

  const user = await prisma.user.findUnique({ where: { id: stored.userId }, include: { profile: true } });
  if (!user || user.status !== "ACTIVE") throw new AppError(httpStatus.FORBIDDEN, "Account is not active");

  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
  const tokens = await issueTokens(user, user.profile?.fullName || "Migo User");
  return tokens;
};

const logout = async (incoming?: string, userId?: string) => {
  if (incoming) {
    await prisma.refreshToken.updateMany({
      where: { tokenHash: sha256(incoming) },
      data: { revokedAt: new Date() },
    });
  } else if (userId) {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
};

const sendEmailVerification = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const token = randomToken().slice(0, 12).toUpperCase();
  await prisma.otpCode.create({
    data: {
      userId,
      email: user.email,
      purpose: "EMAIL_VERIFY",
      codeHash: sha256(token),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  });
  return config.dev_return_otp ? { token } : { sent: true };
};

const confirmEmail = async (userId: string, token: string) => {
  const record = await prisma.otpCode.findFirst({
    where: {
      userId,
      purpose: "EMAIL_VERIFY",
      consumedAt: null,
      expiresAt: { gt: new Date() },
      codeHash: sha256(token),
    },
    orderBy: { createdAt: "desc" },
  });
  if (!record) throw new AppError(httpStatus.BAD_REQUEST, "Invalid or expired verification token");
  await prisma.$transaction([
    prisma.otpCode.update({ where: { id: record.id }, data: { consumedAt: new Date() } }),
    prisma.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } }),
  ]);
};

const sendOtp = async (phone: string, purpose: string) => {
  const recent = await prisma.otpCode.count({
    where: { phone, purpose, createdAt: { gt: new Date(Date.now() - 10 * 60 * 1000) } },
  });
  if (recent >= 5) throw new AppError(httpStatus.TOO_MANY_REQUESTS, "Too many OTP requests");

  const code = randomOtp();
  await prisma.otpCode.create({
    data: {
      phone,
      purpose,
      codeHash: sha256(code),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });
  return config.dev_return_otp ? { phone, code, expiresInMinutes: 10 } : { phone, sent: true };
};

const verifyOtp = async (phone: string, code: string, purpose: string) => {
  const record = await prisma.otpCode.findFirst({
    where: { phone, purpose, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!record) throw new AppError(httpStatus.BAD_REQUEST, "Invalid or expired OTP");
  if (record.attempts >= 5) throw new AppError(httpStatus.TOO_MANY_REQUESTS, "OTP locked. Request a new one");
  if (record.codeHash !== sha256(code)) {
    await prisma.otpCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }
  await prisma.otpCode.update({ where: { id: record.id }, data: { consumedAt: new Date() } });
  await prisma.user.updateMany({ where: { phone }, data: { phoneVerifiedAt: new Date() } });
  return { verified: true };
};

const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return { sent: true };
  const token = randomToken();
  await prisma.otpCode.create({
    data: {
      userId: user.id,
      email: user.email,
      purpose: "PASSWORD_RESET",
      codeHash: sha256(token),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  });
  await notifyUser({
    userId: user.id,
    type: "SYSTEM",
    title: "Password reset requested",
    body: "A password reset was requested for your Migo account.",
  });
  return config.dev_return_otp ? { token } : { sent: true };
};

const resetPassword = async (token: string, password: string) => {
  const record = await prisma.otpCode.findFirst({
    where: { purpose: "PASSWORD_RESET", consumedAt: null, expiresAt: { gt: new Date() }, codeHash: sha256(token) },
  });
  if (!record?.userId) throw new AppError(httpStatus.BAD_REQUEST, "Invalid or expired reset token");
  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.otpCode.update({ where: { id: record.id }, data: { consumedAt: new Date() } }),
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.refreshToken.updateMany({ where: { userId: record.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
  ]);
};

const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.passwordHash) throw new AppError(httpStatus.BAD_REQUEST, "This account uses Google sign-in");
  const ok = await comparePassword(currentPassword, user.passwordHash);
  if (!ok) throw new AppError(httpStatus.BAD_REQUEST, "Current password is incorrect");
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(newPassword) } });
};

export const authService = {
  register,
  login,
  googleLogin,
  refresh,
  logout,
  sendEmailVerification,
  confirmEmail,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  changePassword,
  sanitizeUser,
};
