import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { adminController } from "./admin.controller";

const router = Router();
const admin = auth(Role.ADMIN, Role.SUPER_ADMIN);
const superAdmin = auth(Role.SUPER_ADMIN);

router.get("/users", admin, adminController.users);
router.get("/users/:userId", admin, adminController.user);
router.patch("/users/:userId/status", admin, adminController.userStatus);
router.patch("/users/:userId/role", superAdmin, adminController.userRole);
router.get("/users/:userId/audit", admin, adminController.userAudit);

router.get("/verifications", admin, adminController.verifications);
router.get("/verifications/:verificationId", admin, adminController.verification);
router.post("/verifications/:verificationId/approve", admin, adminController.approveVerification);
router.post("/verifications/:verificationId/reject", admin, adminController.rejectVerification);
router.post("/verifications/:verificationId/request-resubmission", admin, adminController.resubmitVerification);

router.get("/routes", admin, adminController.routes);
router.patch("/routes/:routeId", admin, adminController.patchRoute);

router.get("/rides", admin, adminController.rides);
router.get("/rides/:rideId", admin, adminController.ride);
router.post("/rides/:rideId/cancel", admin, adminController.cancelRide);
router.post("/rides/:rideId/status-override", admin, adminController.overrideRide);
router.post("/rides/:rideId/no-show", admin, adminController.noShow);

router.get("/reports", admin, adminController.reports);
router.get("/reports/:reportId", admin, adminController.report);
router.post("/reports/:reportId/resolve", admin, adminController.resolveReport);

router.get("/disputes", admin, adminController.disputes);
router.get("/disputes/:disputeId", admin, adminController.dispute);
router.post("/disputes/:disputeId/resolve", admin, adminController.resolveDispute);
router.post("/disputes/:disputeId/escalate", admin, adminController.escalateDispute);

router.get("/support/tickets", admin, adminController.tickets);
router.patch("/support/tickets/:ticketId", admin, adminController.updateTicket);

router.get("/payments", admin, adminController.payments);
router.get("/payments/:paymentId", admin, adminController.payment);
router.post("/payments/:paymentId/retry", admin, adminController.retryPayment);

router.get("/incidents", admin, adminController.incidents);
router.post("/incidents", admin, adminController.createIncident);
router.patch("/incidents/:incidentId", admin, adminController.updateIncident);

router.get("/dashboard", admin, adminController.dashboard);
router.get("/analytics/users", admin, adminController.analyticsUsers);
router.get("/analytics/rides", admin, adminController.analyticsRides);
router.get("/analytics/matching", admin, adminController.analyticsMatching);
router.get("/analytics/payments", admin, adminController.analyticsPayments);
router.get("/analytics/routes", admin, adminController.analyticsRoutes);
router.get("/audit-logs", admin, adminController.auditLogs);
router.get("/audit-logs/:auditId", admin, adminController.auditLog);

export const adminRoutes = router;
