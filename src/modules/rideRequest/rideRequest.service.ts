import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { matchService } from "../match/match.service";
import { getPagination, paginationMeta } from "../../utils/pagination";
import { AuthUser } from "../../types";

const create = (passengerId: string, payload: any) =>
  prisma.rideRequest.create({
    data: {
      passengerId,
      pickupName: payload.pickupName,
      pickupLat: payload.pickupLat,
      pickupLng: payload.pickupLng,
      destinationName: payload.destinationName,
      destinationLat: payload.destinationLat,
      destinationLng: payload.destinationLng,
      date: new Date(payload.date),
      time: payload.time,
      seats: payload.seats || 1,
      notes: payload.notes,
      isRecurring: payload.isRecurring || false,
      recurringDays: payload.recurringDays || [],
    },
  });

const list = async (user: AuthUser, query: Record<string, unknown>) => {
  const { page, limit, skip } = getPagination(query);
  const where =
    user.role === "ADMIN" || user.role === "SUPER_ADMIN"
      ? {}
      : user.role === "COMMUTER"
        ? { matches: { some: { route: { ownerId: user.id } } } }
        : { passengerId: user.id };

  const [items, total] = await Promise.all([
    prisma.rideRequest.findMany({
      where,
      include: { matches: { orderBy: { score: "desc" }, take: 3, include: { route: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.rideRequest.count({ where }),
  ]);
  return { items, meta: paginationMeta(page, limit, total) };
};

const get = async (requestId: string, user: AuthUser) => {
  const request = await prisma.rideRequest.findUnique({
    where: { id: requestId },
    include: { matches: { include: { route: true }, orderBy: { score: "desc" } }, passenger: { include: { profile: true } } },
  });
  if (!request) throw new AppError(httpStatus.NOT_FOUND, "Request not found");
  const allowed =
    request.passengerId === user.id ||
    user.role === "ADMIN" ||
    user.role === "SUPER_ADMIN" ||
    request.matches.some((m) => m.route.ownerId === user.id);
  if (!allowed) throw new AppError(httpStatus.FORBIDDEN, "Not allowed");
  return request;
};

const update = async (requestId: string, userId: string, payload: any) => {
  const request = await prisma.rideRequest.findUnique({ where: { id: requestId } });
  if (!request || request.passengerId !== userId) throw new AppError(httpStatus.FORBIDDEN, "Not your request");
  if (request.status !== "OPEN" && request.status !== "MATCHED") {
    throw new AppError(httpStatus.CONFLICT, "Only pending requests can be updated");
  }
  return prisma.rideRequest.update({ where: { id: requestId }, data: payload });
};

const cancel = async (requestId: string, user: AuthUser) => {
  const request = await prisma.rideRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new AppError(httpStatus.NOT_FOUND, "Request not found");
  if (request.passengerId !== user.id && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new AppError(httpStatus.FORBIDDEN, "Not allowed");
  }
  return prisma.rideRequest.update({ where: { id: requestId }, data: { status: "CANCELLED" } });
};

export const rideRequestService = {
  create,
  list,
  get,
  update,
  cancel,
  match: matchService.generateForRequest,
  matches: matchService.listForRequest,
};
