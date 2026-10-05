import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { notificationController } from "./notification.controller";

const router = Router();
const anyUser = auth(Role.PASSENGER, Role.COMMUTER, Role.ADMIN, Role.SUPER_ADMIN);
const admin = auth(Role.ADMIN, Role.SUPER_ADMIN);

router.get("/", anyUser, notificationController.list);
router.get("/unread-count", anyUser, notificationController.unread);
router.patch("/read-all", anyUser, notificationController.readAll);
router.patch("/:notificationId/read", anyUser, notificationController.read);
router.post("/:notificationId/resend", admin, notificationController.resend);

export const notificationRoutes = router;
