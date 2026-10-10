import { NextFunction, Request, Response } from "express";
import { Role } from "../../generated/prisma/enums";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import config from "../config";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";

export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer")
        ? req.headers.authorization.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are not logged in. Please log in to access this resource");
    }

    const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);
    if (!verifiedToken.success) {
      throw new AppError(httpStatus.UNAUTHORIZED, verifiedToken.error || "Invalid token");
    }

    const { email, id, role } = verifiedToken.data as JwtPayload;
    if (requiredRoles.length && !requiredRoles.includes(role as Role)) {
      throw new AppError(httpStatus.FORBIDDEN, "Forbidden. You don't have permission to access this resource");
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
    if (!user) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User not found. Please log in again.");
    }
    if (user.status === "BLOCKED" || user.status === "SUSPENDED") {
      throw new AppError(httpStatus.FORBIDDEN, "Your account has been suspended. Please contact support");
    }
    if (email && user.email !== email) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token payload");
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.profile?.fullName || (verifiedToken.data as JwtPayload).name || "Migo User",
      role: user.role,
    }; 
    
    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    req.user = {
      id: user.id,
      email: user.email,
      name: profile?.fullName || "Migo User",
      role: user.role,
    };

    next();
  });
};

export const optionalAuth = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken
    ? req.cookies.accessToken
    : req.headers.authorization?.startsWith("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : undefined;

  if (!token) return next();
  const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);
  if (verifiedToken.success) {
    const { id } = verifiedToken.data as JwtPayload;
    const user = await prisma.user.findUnique({ where: { id }, include: { profile: true } });
    if (user && user.status === "ACTIVE") {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.profile?.fullName || "Migo User",
        role: user.role,
      };
    }
  }
  next();
});
