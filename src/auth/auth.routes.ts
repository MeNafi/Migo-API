import { Router } from "express";
import { Role } from "../../generated/prisma/enums";
import { authController } from "./auth.controller";
import { validateRequest } from "../middlewares/validateRequest";
import { auth } from "../middlewares/auth";
import { authLimiter, otpLimiter } from "../middlewares/rateLimiter";
import {
  changePasswordSchema,
  confirmEmailSchema,
  forgotPasswordSchema,
  googleSchema,
  loginSchema,
  otpSendSchema,
  otpVerifySchema,
  registerSchema,
  resetPasswordSchema,
} from "./auth.validation";

const router = Router();

router.post("/register/passenger", authLimiter, validateRequest(registerSchema), authController.registerPassenger);
router.post("/register/commuter", authLimiter, validateRequest(registerSchema), authController.registerCommuter);
router.post("/login", authLimiter, validateRequest(loginSchema), authController.login);
router.post("/google", authLimiter, validateRequest(googleSchema), authController.google);
router.post("/refresh", authController.refresh);
router.post("/logout", auth(Role.PASSENGER, Role.COMMUTER, Role.ADMIN, Role.SUPER_ADMIN), authController.logout);
router.get("/me", auth(Role.PASSENGER, Role.COMMUTER, Role.ADMIN, Role.SUPER_ADMIN), authController.me);
router.post("/verify-email/send", auth(Role.PASSENGER, Role.COMMUTER, Role.ADMIN, Role.SUPER_ADMIN), authController.sendEmailVerification);
router.post("/verify-email/confirm", auth(Role.PASSENGER, Role.COMMUTER, Role.ADMIN, Role.SUPER_ADMIN), validateRequest(confirmEmailSchema), authController.confirmEmail);
router.post("/otp/send", otpLimiter, validateRequest(otpSendSchema), authController.sendOtp);
router.post("/otp/verify", otpLimiter, validateRequest(otpVerifySchema), authController.verifyOtp);
router.post("/password/forgot", authLimiter, validateRequest(forgotPasswordSchema), authController.forgotPassword);
router.post("/password/reset", authLimiter, validateRequest(resetPasswordSchema), authController.resetPassword);
router.patch("/password/change", auth(Role.PASSENGER, Role.COMMUTER, Role.ADMIN, Role.SUPER_ADMIN), validateRequest(changePasswordSchema), authController.changePassword);

export const authRoutes = router;
