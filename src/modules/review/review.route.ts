import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { reviewController } from "./review.controller";

const router = Router();
const anyUser = auth(Role.PASSENGER, Role.COMMUTER, Role.ADMIN, Role.SUPER_ADMIN);

router.post("/", anyUser, reviewController.create);
router.get("/ride/:rideId", anyUser, reviewController.byRide);
router.get("/user/:userId", anyUser, reviewController.byUser);
router.patch("/:reviewId", anyUser, reviewController.update);
router.delete("/:reviewId", anyUser, reviewController.remove);

export const reviewRoutes = router;
