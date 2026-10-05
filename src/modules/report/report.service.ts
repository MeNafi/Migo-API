import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { AuthUser } from "../../types";
import { notifyUser } from "../../lib/notify";

const createReport = (userId: string, payload: any) =>
  prisma.report.create({
    data: {
      reporterId: userId,
      targetUserId: payload.targetUserId,
      rideId: payload.rideId,
      messageId: payload.messageId,
      category: payload.category,
      description: payload.description,
      evidenceUrls: payload.evidenceUrls,
    },
  });

const getReport = async (reportId: string, user: AuthUser) => {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw new AppError(httpStatus.NOT_FOUND, "Report not found");
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  if (report.reporterId !== user.id && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Not allowed");
  return report;
};

const addEvidence = async (reportId: string, user: AuthUser, fileUrl: string) => {
  const report = await getReport(reportId, user);
  const urls = Array.isArray(report.evidenceUrls) ? report.evidenceUrls : [];
  return prisma.report.update({
    where: { id: reportId },
    data: { evidenceUrls: [...urls, fileUrl] },
  });
};

const emergency = async (user: AuthUser, payload: any) => {
  const incident = await prisma.incident.create({
    data: {
      title: "Emergency event",
      severity: "CRITICAL",
      description: payload.description || "User triggered emergency",
      createdById: user.id,
    },
  });
  const admins = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } } });
  await Promise.all(
    admins.map((admin) =>
      notifyUser({
        userId: admin.id,
        type: "SAFETY",
        title: "Emergency alert",
        body: `${user.name} triggered an emergency.`,
        data: { incidentId: incident.id, rideId: payload.rideId },
      })
    )
  );
  return incident;
};

const createTicket = (userId: string, payload: any) =>
  prisma.supportTicket.create({
    data: {
      userId,
      subject: payload.subject,
      category: payload.category || "GENERAL",
      description: payload.description,
    },
  });

const listTickets = (user: AuthUser) => {
  const where = user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? {} : { userId: user.id };
  return prisma.supportTicket.findMany({ where, orderBy: { createdAt: "desc" } });
};

const getTicket = async (ticketId: string, user: AuthUser) => {
  const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new AppError(httpStatus.NOT_FOUND, "Ticket not found");
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  if (ticket.userId !== user.id && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Not allowed");
  return ticket;
};

export const reportService = {
  createReport,
  getReport,
  addEvidence,
  emergency,
  createTicket,
  listTickets,
  getTicket,
};
