import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { reportController } from "./report.controller";

const router = Router();
const anyUser = auth(Role.PASSENGER, Role.COMMUTER, Role.ADMIN, Role.SUPER_ADMIN);
const admin = auth(Role.ADMIN, Role.SUPER_ADMIN);

router.post("/reports", anyUser, reportController.createReport);
router.get("/reports/:reportId", anyUser, reportController.getReport);
router.patch("/reports/:reportId", admin, reportController.getReport);
router.post("/reports/:reportId/evidence", anyUser, reportController.evidence);
router.post("/safety/emergency", anyUser, reportController.emergency);
router.post("/support/tickets", anyUser, reportController.createTicket);
router.get("/support/tickets", anyUser, reportController.listTickets);
router.get("/support/tickets/:ticketId", anyUser, reportController.getTicket);

export const reportRoutes = router;
