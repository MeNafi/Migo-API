import { Request, Response } from "express";
import httpStatus from "http-status";
import { Role } from "../../generated/prisma/enums";
import { catchAsync } from "../utils/catchAsync";
import { sendResponse } from "../utils/sendResponse";
import { authService } from "./auth.service";
import config from "../config";

const cookieOptions = {
  httpOnly: true,
  secure: config.env === "production",
  sameSite: (config.env === "production" ? "none" : "lax") as "none" | "lax",
};

const registerPassenger = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.register(Role.PASSENGER, req.body);
  res.cookie("accessToken", result.accessToken, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 });
  res.cookie("refreshToken", result.refreshToken, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 * 7 });
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Passenger registered successfully",
    data: result,
  });
});

const registerCommuter = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.register(Role.COMMUTER, req.body);
  res.cookie("accessToken", result.accessToken, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 });
  res.cookie("refreshToken", result.refreshToken, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 * 7 });
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Commuter registered successfully",
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.login(req.body, {
    userAgent: req.headers["user-agent"],
    ip: req.ip,
  });
  res.cookie("accessToken", result.accessToken, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 });
  res.cookie("refreshToken", result.refreshToken, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 * 7 });
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Logged in successfully",
    data: result,
  });
});

const google = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.googleLogin(req.body.idToken, req.body.role);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Google login successful",
    data: result,
  });
});

const refresh = catchAsync(async (req: Request, res: Response) => {
  const token = req.body.refreshToken || req.cookies.refreshToken;
  const result = await authService.refresh(token);
  res.cookie("accessToken", result.accessToken, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 });
  res.cookie("refreshToken", result.refreshToken, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 * 7 });
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Token refreshed successfully",
    data: result,
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  await authService.logout(req.body.refreshToken || req.cookies.refreshToken, req.user?.id);
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Logged out successfully",
    data: null,
  });
});

const me = catchAsync(async (req: Request, res: Response) => {
  const user = await authService.sanitizeUser(req.user!.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Current user",
    data: user,
  });
});

const sendEmailVerification = catchAsync(async (req: Request, res: Response) => {
  const data = await authService.sendEmailVerification(req.user!.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Verification email sent",
    data,
  });
});

const confirmEmail = catchAsync(async (req: Request, res: Response) => {
  await authService.confirmEmail(req.user!.id, req.body.token);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Email verified",
    data: { verified: true },
  });
});

const sendOtp = catchAsync(async (req: Request, res: Response) => {
  const data = await authService.sendOtp(req.body.phone, req.body.purpose);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "OTP sent",
    data,
  });
});

const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const data = await authService.verifyOtp(req.body.phone, req.body.code, req.body.purpose);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "OTP verified",
    data,
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const data = await authService.forgotPassword(req.body.email);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "If the account exists, a reset token was issued",
    data,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  await authService.resetPassword(req.body.token, req.body.password);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Password reset successfully",
    data: null,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  await authService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Password changed successfully",
    data: null,
  });
});

export const authController = {
  registerPassenger,
  registerCommuter,
  login,
  google,
  refresh,
  logout,
  me,
  sendEmailVerification,
  confirmEmail,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  changePassword,
};

