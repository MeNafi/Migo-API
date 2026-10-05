import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { conversationController } from "./conversation.controller";

const router = Router();
const anyUser = auth(Role.PASSENGER, Role.COMMUTER, Role.ADMIN, Role.SUPER_ADMIN);

router.get("/", anyUser, conversationController.list);
router.post("/", anyUser, conversationController.open);
router.get("/:conversationId", anyUser, conversationController.get);
router.get("/:conversationId/messages", anyUser, conversationController.messages);
router.post("/:conversationId/messages", anyUser, conversationController.send);
router.patch("/:conversationId/read", anyUser, conversationController.read);
router.post("/:conversationId/report", anyUser, conversationController.report);

export const conversationRoutes = router;
