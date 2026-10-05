import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { userController } from "./user.controller";
import { blockSchema, emergencySchema, photoSchema, preferencesSchema, updateMeSchema } from "./user.validation";

const router = Router();
const anyUser = auth(Role.PASSENGER, Role.COMMUTER, Role.ADMIN, Role.SUPER_ADMIN);

router.get("/me", anyUser, userController.getMe);
router.patch("/me", anyUser, validateRequest(updateMeSchema), userController.updateMe);
router.patch("/me/photo", anyUser, validateRequest(photoSchema), userController.updatePhoto);
router.patch("/me/emergency-contact", anyUser, validateRequest(emergencySchema), userController.updateEmergency);
router.get("/me/preferences", anyUser, userController.getPreferences);
router.patch("/me/preferences", anyUser, validateRequest(preferencesSchema), userController.updatePreferences);
router.get("/:userId/reviews", anyUser, userController.getReviews);
router.post("/:userId/block", anyUser, validateRequest(blockSchema), userController.block);
router.delete("/:userId/block", anyUser, userController.unblock);
router.get("/:userId", anyUser, userController.getPublic);

export const userRoutes = router;
