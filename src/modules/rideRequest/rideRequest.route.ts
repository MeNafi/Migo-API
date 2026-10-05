import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { rideRequestController } from "./rideRequest.controller";

const router = Router();
const passenger = auth(Role.PASSENGER, Role.ADMIN, Role.SUPER_ADMIN);
const anyUser = auth(Role.PASSENGER, Role.COMMUTER, Role.ADMIN, Role.SUPER_ADMIN);

router.post("/", passenger, rideRequestController.create);
router.get("/", anyUser, rideRequestController.list);
router.get("/:requestId", anyUser, rideRequestController.get);
router.patch("/:requestId", passenger, rideRequestController.update);
router.post("/:requestId/cancel", anyUser, rideRequestController.cancel);
router.post("/:requestId/match", passenger, rideRequestController.match);
router.get("/:requestId/matches", passenger, rideRequestController.matches);

export const rideRequestRoutes = router;
