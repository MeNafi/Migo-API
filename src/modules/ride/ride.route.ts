import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { rideController } from "./ride.controller";

const router = Router();
const anyUser = auth(Role.PASSENGER, Role.COMMUTER, Role.ADMIN, Role.SUPER_ADMIN);
const commuter = auth(Role.COMMUTER, Role.ADMIN, Role.SUPER_ADMIN);

router.get("/", anyUser, rideController.list);
router.get("/:rideId", anyUser, rideController.get);
router.post("/:rideId/accept", commuter, rideController.accept);
router.post("/:rideId/reject", commuter, rideController.reject);
router.post("/:rideId/confirm", anyUser, rideController.confirm);
router.post("/:rideId/start", commuter, rideController.start);
router.post("/:rideId/complete", commuter, rideController.complete);
router.post("/:rideId/cancel", anyUser, rideController.cancel);
router.post("/:rideId/no-show", anyUser, rideController.noShow);
router.get("/:rideId/timeline", anyUser, rideController.timeline);
router.get("/:rideId/otp", anyUser, rideController.otp);
router.post("/:rideId/otp/verify", commuter, rideController.verifyOtp);
router.post("/:rideId/location", commuter, rideController.saveLocation);
router.get("/:rideId/location", anyUser, rideController.latestLocation);
router.get("/:rideId/location/history", anyUser, rideController.locationHistory);
router.post("/:rideId/location/share", anyUser, rideController.share);
router.delete("/:rideId/location/share", anyUser, rideController.revokeShare);

export const rideRoutes = router;
