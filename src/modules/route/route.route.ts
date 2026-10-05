import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { routeController } from "./route.controller";
import { availabilitySchema, createRouteSchema, scheduleSchema } from "./route.validation";

const router = Router();
const anyUser = auth(Role.PASSENGER, Role.COMMUTER, Role.ADMIN, Role.SUPER_ADMIN);
const commuter = auth(Role.COMMUTER, Role.ADMIN, Role.SUPER_ADMIN);

router.post("/", commuter, validateRequest(createRouteSchema), routeController.create);
router.get("/", anyUser, routeController.list);
router.get("/:routeId", anyUser, routeController.get);
router.patch("/:routeId", commuter, routeController.update);
router.delete("/:routeId", commuter, routeController.remove);
router.post("/:routeId/pause", commuter, routeController.pause);
router.post("/:routeId/resume", commuter, routeController.resume);
router.post("/:routeId/schedules", commuter, validateRequest(scheduleSchema), routeController.addSchedule);
router.get("/:routeId/schedules", commuter, routeController.listSchedules);
router.patch("/:routeId/schedules/:scheduleId", commuter, routeController.updateSchedule);
router.delete("/:routeId/schedules/:scheduleId", commuter, routeController.deleteSchedule);
router.post("/:routeId/availability", commuter, validateRequest(availabilitySchema), routeController.setAvailability);
router.get("/:routeId/availability", commuter, routeController.listAvailability);

export const routeRoutes = router;
