import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { AuthUser } from "../../types";
import { writeAudit } from "../../lib/audit";
import { getPagination, paginationMeta } from "../../utils/pagination";
import { notifyUser } from "../../lib/notify";

const requireReason = (reason?: string) => {
  if (!reason || reason.trim().length < 3) {
    throw new AppError(httpStatus.BAD_REQUEST, "A reason is required for this admin action");
  }
};

const listUsers = async (query: Record<string, unknown>) => {
  const { page, limit, skip } = getPagination(query);
  const where: any = {};
  if (query.role) where.role = query.role;
  if (query.status) where.status = query.status;
  if (query.search) {
    where.OR = [
      { email: { contains: String(query.search), mode: "insensitive" } },
      { phone: { contains: String(query.search) } },
      { profile: { fullName: { contains: String(query.search), mode: "insensitive" } } },
    ];
  }
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      omit: { passwordHash: true },
      include: { profile: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);
  return { items, meta: paginationMeta(page, limit, total) };
};

const getUser = (userId: string) =>
  prisma.user.findUniqueOrThrow({
    where: { id: userId },
    omit: { passwordHash: true },
    include: {
      profile: true,
      vehicles: true,
      routes: true,
      rideRequests: { take: 10, orderBy: { createdAt: "desc" } },
    },
  });

const updateUserStatus = async (actor: AuthUser, userId: string, status: "ACTIVE" | "SUSPENDED" | "BLOCKED", reason: string, ip?: string) => {
  requireReason(reason);
  const before = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const after = await prisma.user.update({ where: { id: userId }, data: { status } });
  await writeAudit({
    actorId: actor.id,
    action: "USER_STATUS",
    targetType: "User",
    targetId: userId,
    before: { status: before.status },
    after: { status },
    reason,
    ip,
  });
  return after;
};

const updateUserRole = async (actor: AuthUser, userId: string, role: "PASSENGER" | "COMMUTER" | "ADMIN", reason: string) => {
  if (actor.role !== "SUPER_ADMIN") throw new AppError(httpStatus.FORBIDDEN, "Super admin only");
  requireReason(reason);
  const before = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const after = await prisma.user.update({ where: { id: userId }, data: { role } });
  await writeAudit({
    actorId: actor.id,
    action: "USER_ROLE",
    targetType: "User",
    targetId: userId,
    before: { role: before.role },
    after: { role },
    reason,
  });
  return after;
};

const userAudit = (userId: string) =>
  prisma.auditLog.findMany({
    where: { OR: [{ targetId: userId }, { actorId: userId }] },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

const listVerifications = (query: Record<string, unknown>) => {
  const status = query.status ? String(query.status) : undefined;
  return prisma.verification.findMany({
    where: status ? { status: status as any } : {},
    include: { user: { include: { profile: true } }, vehicle: true },
    orderBy: { createdAt: "desc" },
  });
};

const decideVerification = async (
  actor: AuthUser,
  verificationId: string,
  decision: "APPROVED" | "REJECTED" | "RESUBMISSION_REQUESTED",
  reason?: string
) => {
  if (decision !== "APPROVED") requireReason(reason);
  const before = await prisma.verification.findUniqueOrThrow({ where: { id: verificationId } });
  const updated = await prisma.verification.update({
    where: { id: verificationId },
    data: {
      status: decision,
      reviewerId: actor.id,
      reviewedAt: new Date(),
      rejectReason: reason,
    },
  });
  if (before.vehicleId && decision === "APPROVED") {
    await prisma.vehicle.update({ where: { id: before.vehicleId }, data: { verificationStatus: "APPROVED" } });
  }
  await writeAudit({
    actorId: actor.id,
    action: "VERIFICATION_DECISION",
    targetType: "Verification",
    targetId: verificationId,
    before: { status: before.status },
    after: { status: decision },
    reason,
  });
  await notifyUser({
    userId: before.userId,
    type: "VERIFICATION",
    title: `Verification ${decision.toLowerCase()}`,
    body: reason || "Your verification was reviewed.",
    data: { verificationId },
  });
  return updated;
};

const listRoutes = (query: Record<string, unknown>) =>
  prisma.commuterRoute.findMany({
    where: query.status ? { status: query.status as any } : {},
    include: { owner: { include: { profile: true } }, schedules: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

const patchRoute = async (actor: AuthUser, routeId: string, payload: any, reason: string) => {
  requireReason(reason);
  const before = await prisma.commuterRoute.findUniqueOrThrow({ where: { id: routeId } });
  const after = await prisma.commuterRoute.update({ where: { id: routeId }, data: payload });
  await writeAudit({
    actorId: actor.id,
    action: "ROUTE_CORRECTION",
    targetType: "Route",
    targetId: routeId,
    before,
    after,
    reason,
  });
  return after;
};

const listRides = (query: Record<string, unknown>) =>
  prisma.ride.findMany({
    where: query.status ? { status: query.status as any } : {},
    include: { route: true, commuter: { include: { profile: true } }, passengers: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

const overrideRide = async (actor: AuthUser, rideId: string, status: any, reason: string) => {
  requireReason(reason);
  const before = await prisma.ride.findUniqueOrThrow({ where: { id: rideId } });
  const after = await prisma.ride.update({ where: { id: rideId }, data: { status } });
  await prisma.rideEvent.create({
    data: { rideId, type: "ADMIN_OVERRIDE", actorId: actor.id, payload: { from: before.status, to: status, reason } },
  });
  await writeAudit({
    actorId: actor.id,
    action: "RIDE_STATUS_OVERRIDE",
    targetType: "Ride",
    targetId: rideId,
    before: { status: before.status },
    after: { status },
    reason,
  });
  return after;
};

const listReports = () => prisma.report.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
const resolveReport = async (actor: AuthUser, reportId: string, resolution: string, reason: string) => {
  requireReason(reason);
  const updated = await prisma.report.update({
    where: { id: reportId },
    data: { status: "RESOLVED", resolution, resolvedById: actor.id, resolvedAt: new Date() },
  });
  await writeAudit({
    actorId: actor.id,
    action: "REPORT_RESOLVE",
    targetType: "Report",
    targetId: reportId,
    after: { resolution },
    reason,
  });
  return updated;
};

const listDisputes = () => prisma.dispute.findMany({ orderBy: { createdAt: "desc" } });
const resolveDispute = async (actor: AuthUser, disputeId: string, decision: string, reason: string) => {
  requireReason(reason);
  const updated = await prisma.dispute.update({
    where: { id: disputeId },
    data: { status: "RESOLVED", decision, reason, assigneeId: actor.id },
  });
  await writeAudit({
    actorId: actor.id,
    action: "DISPUTE_RESOLVE",
    targetType: "Dispute",
    targetId: disputeId,
    after: { decision },
    reason,
  });
  return updated;
};
const escalateDispute = (disputeId: string) =>
  prisma.dispute.update({ where: { id: disputeId }, data: { status: "ESCALATED" } });

const listTickets = () => prisma.supportTicket.findMany({ orderBy: { createdAt: "desc" } });
const updateTicket = (ticketId: string, payload: any) =>
  prisma.supportTicket.update({ where: { id: ticketId }, data: payload });

const listPayments = () => prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { ride: true } });
const retryPayment = (paymentId: string) =>
  prisma.payment.update({ where: { id: paymentId }, data: { status: "PENDING" } });

const listIncidents = () => prisma.incident.findMany({ orderBy: { createdAt: "desc" } });
const createIncident = (actor: AuthUser, payload: any) =>
  prisma.incident.create({
    data: {
      title: payload.title,
      severity: payload.severity || "MEDIUM",
      description: payload.description,
      createdById: actor.id,
    },
  });
const updateIncident = (id: string, payload: any) => prisma.incident.update({ where: { id }, data: payload });

const dashboard = async () => {
  const [users, commuters, rides, completed, pendingVerifications, openReports, payments] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "COMMUTER" } }),
    prisma.ride.count(),
    prisma.ride.count({ where: { status: "COMPLETED" } }),
    prisma.verification.count({ where: { status: "PENDING" } }),
    prisma.report.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
    prisma.payment.groupBy({ by: ["status"], _sum: { amount: true }, _count: true }),
  ]);
  return { users, commuters, rides, completed, pendingVerifications, openReports, payments };
};

const analyticsUsers = async () => {
  const [passengers, commuters, admins, verifiedVehicles] = await Promise.all([
    prisma.user.count({ where: { role: "PASSENGER" } }),
    prisma.user.count({ where: { role: "COMMUTER" } }),
    prisma.user.count({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } } }),
    prisma.vehicle.count({ where: { verificationStatus: "APPROVED" } }),
  ]);
  return { passengers, commuters, admins, verifiedVehicles };
};

const analyticsRides = async () => {
  const grouped = await prisma.ride.groupBy({ by: ["status"], _count: true });
  return grouped;
};

const analyticsMatching = async () => {
  const [matches, accepted] = await Promise.all([
    prisma.rideMatch.count(),
    prisma.rideMatch.count({ where: { status: "ACCEPTED" } }),
  ]);
  const avg = await prisma.rideMatch.aggregate({ _avg: { score: true } });
  return { matches, accepted, acceptanceRate: matches ? accepted / matches : 0, averageScore: avg._avg.score || 0 };
};

const analyticsPayments = async () => {
  const grouped = await prisma.payment.groupBy({ by: ["status"], _count: true, _sum: { amount: true } });
  return grouped;
};

const analyticsRoutes = async () => {
  return prisma.commuterRoute.findMany({
    select: { originName: true, destinationName: true, contributionBdt: true, status: true },
    take: 50,
    orderBy: { createdAt: "desc" },
  });
};

const auditLogs = async (query: Record<string, unknown>) => {
  const { page, limit, skip } = getPagination(query);
  const where: any = {};
  if (query.action) where.action = query.action;
  if (query.targetType) where.targetType = query.targetType;
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.auditLog.count({ where }),
  ]);
  return { items, meta: paginationMeta(page, limit, total) };
};

const auditById = (id: string) => prisma.auditLog.findUniqueOrThrow({ where: { id } });

export const adminService = {
  listUsers,
  getUser,
  updateUserStatus,
  updateUserRole,
  userAudit,
  listVerifications,
  decideVerification,
  listRoutes,
  patchRoute,
  listRides,
  overrideRide,
  listReports,
  resolveReport,
  listDisputes,
  resolveDispute,
  escalateDispute,
  listTickets,
  updateTicket,
  listPayments,
  retryPayment,
  listIncidents,
  createIncident,
  updateIncident,
  dashboard,
  analyticsUsers,
  analyticsRides,
  analyticsMatching,
  analyticsPayments,
  analyticsRoutes,
  auditLogs,
  auditById,
};
