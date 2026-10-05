import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { matchController } from "./match.controller";

const router = Router();
const passenger = auth(Role.PASSENGER, Role.ADMIN, Role.SUPER_ADMIN);
const anyUser = auth(Role.PASSENGER, Role.COMMUTER, Role.ADMIN, Role.SUPER_ADMIN);

router.post("/search", passenger, matchController.search);
router.get("/:matchId", anyUser, matchController.get);
router.post("/:matchId/select", passenger, matchController.select);
router.post("/:matchId/request", passenger, matchController.request);
router.post("/:matchId/refresh", passenger, matchController.refresh);

export const matchRoutes = router;
