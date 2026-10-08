import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { paymentLimiter } from "../../middlewares/rateLimiter";
import { paymentController } from "./payment.controller";

const router = Router();
const anyUser = auth(Role.PASSENGER, Role.COMMUTER, Role.ADMIN, Role.SUPER_ADMIN);
const passenger = auth(Role.PASSENGER, Role.ADMIN, Role.SUPER_ADMIN);
const admin = auth(Role.ADMIN, Role.SUPER_ADMIN);

router.post("/checkout", passenger, paymentLimiter, paymentController.checkout);
router.post("/success", paymentController.success);
router.post("/fail", paymentController.fail);
router.post("/cancel", paymentController.cancel);
router.post("/ipn", paymentController.ipn);
router.get("/", anyUser, paymentController.list);
router.get("/:paymentId", anyUser, paymentController.get);
router.get("/:paymentId/status", anyUser, paymentController.status);
router.post("/:paymentId/validate", admin, paymentController.validate);
router.post("/:paymentId/refund", admin, paymentController.refund);

export const paymentRoutes = router;


