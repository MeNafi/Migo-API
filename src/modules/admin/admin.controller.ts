import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { adminService } from "./admin.service";

const ok = (res: Response, message: string, data: unknown, meta?: any) =>
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message, data, meta });

export const adminController = {
  users: catchAsync(async (req: Request, res: Response) => {
    const result = await adminService.listUsers(req.query as Record<string, unknown>);
    ok(res, "Users fetched", result.items, result.meta);
  }),
  user: catchAsync(async (req: Request, res: Response) => {
    ok(res, "User fetched", await adminService.getUser(req.params.userId as string));
  }),
  userStatus: catchAsync(async (req: Request, res: Response) => {
    ok(
      res,
      "User status updated",
      await adminService.updateUserStatus(req.user!, req.params.userId as string, req.body.status, req.body.reason, req.ip)
    );
  }),
  userRole: catchAsync(async (req: Request, res: Response) => {
    ok(res, "User role updated", await adminService.updateUserRole(req.user!, req.params.userId as string, req.body.role, req.body.reason));
  }),
  userAudit: catchAsync(async (req: Request, res: Response) => {
    ok(res, "User audit", await adminService.userAudit(req.params.userId as string));
  }),
  verifications: catchAsync(async (req: Request, res: Response) => {
    ok(res, "Verifications fetched", await adminService.listVerifications(req.query as Record<string, unknown>));
  }),
  verification: catchAsync(async (req: Request, res: Response) => {
    const items = await adminService.listVerifications({});
    ok(res, "Verification fetched", items.find((v) => v.id === req.params.verificationId) || null);
  }),
  approveVerification: catchAsync(async (req: Request, res: Response) => {
    ok(res, "Approved", await adminService.decideVerification(req.user!, req.params.verificationId as string, "APPROVED", req.body.reason));
  }),
  rejectVerification: catchAsync(async (req: Request, res: Response) => {
    ok(res, "Rejected", await adminService.decideVerification(req.user!, req.params.verificationId as string, "REJECTED", req.body.reason));
  }),
  resubmitVerification: catchAsync(async (req: Request, res: Response) => {
    ok(
      res,
      "Resubmission requested",
      await adminService.decideVerification(req.user!, req.params.verificationId as string, "RESUBMISSION_REQUESTED", req.body.reason)
    );
  }),
  routes: catchAsync(async (req: Request, res: Response) => {
    ok(res, "Routes fetched", await adminService.listRoutes(req.query as Record<string, unknown>));
  }),
  patchRoute: catchAsync(async (req: Request, res: Response) => {
    const { reason, ...payload } = req.body;
    ok(res, "Route updated", await adminService.patchRoute(req.user!, req.params.routeId as string, payload, reason));
  }),
  rides: catchAsync(async (req: Request, res: Response) => {
    ok(res, "Rides fetched", await adminService.listRides(req.query as Record<string, unknown>));
  }),
  ride: catchAsync(async (req: Request, res: Response) => {
    const rides = await adminService.listRides({});
    ok(res, "Ride fetched", rides.find((r) => r.id === req.params.rideId) || null);
  }),
  cancelRide: catchAsync(async (req: Request, res: Response) => {
    ok(res, "Ride cancelled", await adminService.overrideRide(req.user!, req.params.rideId as string, "CANCELLED", req.body.reason));
  }),
  overrideRide: catchAsync(async (req: Request, res: Response) => {
    ok(res, "Ride status overridden", await adminService.overrideRide(req.user!, req.params.rideId as string, req.body.status, req.body.reason));
  }),
  noShow: catchAsync(async (req: Request, res: Response) => {
    ok(res, "No-show applied", await adminService.overrideRide(req.user!, req.params.rideId as string, "NO_SHOW", req.body.reason));
  }),
  reports: catchAsync(async (req: Request, res: Response) => {
    ok(res, "Reports fetched", await adminService.listReports());
  }),
  report: catchAsync(async (req: Request, res: Response) => {
    const items = await adminService.listReports();
    ok(res, "Report fetched", items.find((r) => r.id === req.params.reportId) || null);
  }),
  resolveReport: catchAsync(async (req: Request, res: Response) => {
    ok(res, "Report resolved", await adminService.resolveReport(req.user!, req.params.reportId as string, req.body.resolution, req.body.reason));
  }),
  disputes: catchAsync(async (req: Request, res: Response) => {
    ok(res, "Disputes fetched", await adminService.listDisputes());
  }),
  dispute: catchAsync(async (req: Request, res: Response) => {
    const items = await adminService.listDisputes();
    ok(res, "Dispute fetched", items.find((d) => d.id === req.params.disputeId) || null);
  }),
  resolveDispute: catchAsync(async (req: Request, res: Response) => {
    ok(res, "Dispute resolved", await adminService.resolveDispute(req.user!, req.params.disputeId as string, req.body.decision, req.body.reason));
  }),
  escalateDispute: catchAsync(async (req: Request, res: Response) => {
    ok(res, "Dispute escalated", await adminService.escalateDispute(req.params.disputeId as string));
  }),
  tickets: catchAsync(async (req: Request, res: Response) => {
    ok(res, "Tickets fetched", await adminService.listTickets());
  }),
  updateTicket: catchAsync(async (req: Request, res: Response) => {
    ok(res, "Ticket updated", await adminService.updateTicket(req.params.ticketId as string, req.body));
  }),
  payments: catchAsync(async (req: Request, res: Response) => {
    ok(res, "Payments fetched", await adminService.listPayments());
  }),
  payment: catchAsync(async (req: Request, res: Response) => {
    const items = await adminService.listPayments();
    ok(res, "Payment fetched", items.find((p) => p.id === req.params.paymentId) || null);
  }),
  retryPayment: catchAsync(async (req: Request, res: Response) => {
    ok(res, "Payment retry armed", await adminService.retryPayment(req.params.paymentId as string));
  }),
  incidents: catchAsync(async (req: Request, res: Response) => {
    ok(res, "Incidents fetched", await adminService.listIncidents());
  }),
  createIncident: catchAsync(async (req: Request, res: Response) => {
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Incident created",
      data: await adminService.createIncident(req.user!, req.body),
    });
  }),
  updateIncident: catchAsync(async (req: Request, res: Response) => {
    ok(res, "Incident updated", await adminService.updateIncident(req.params.incidentId as string, req.body));
  }),
  dashboard: catchAsync(async (req: Request, res: Response) => {
    ok(res, "Dashboard", await adminService.dashboard());
  }),
  analyticsUsers: catchAsync(async (_req: Request, res: Response) => {
    ok(res, "User analytics", await adminService.analyticsUsers());
  }),
  analyticsRides: catchAsync(async (_req: Request, res: Response) => {
    ok(res, "Ride analytics", await adminService.analyticsRides());
  }),
  analyticsMatching: catchAsync(async (_req: Request, res: Response) => {
    ok(res, "Matching analytics", await adminService.analyticsMatching());
  }),
  analyticsPayments: catchAsync(async (_req: Request, res: Response) => {
    ok(res, "Payment analytics", await adminService.analyticsPayments());
  }),
  analyticsRoutes: catchAsync(async (_req: Request, res: Response) => {
    ok(res, "Route analytics", await adminService.analyticsRoutes());
  }),
  auditLogs: catchAsync(async (req: Request, res: Response) => {
    const result = await adminService.auditLogs(req.query as Record<string, unknown>);
    ok(res, "Audit logs", result.items, result.meta);
  }),
  auditLog: catchAsync(async (req: Request, res: Response) => {
    ok(res, "Audit event", await adminService.auditById(req.params.auditId as string));
  }),
};
