import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { AuthUser } from "../../types";
import { haversineKm } from "../../utils/geo";

const assertOwner = async (routeId: string, user: AuthUser) => {
  const route = await prisma.commuterRoute.findUnique({
    where: { id: routeId },
    include: { schedules: true, availabilities: true, vehicle: true, owner: { include: { profile: true } } },
  });
  if (!route) throw new AppError(httpStatus.NOT_FOUND, "Route not found");
  const isOwner = route.ownerId === user.id;
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  return { route, isOwner, isAdmin };
};

const create = async (ownerId: string, payload: any) => {
  const { schedule, ...rest } = payload;
  const distanceKm =
    rest.distanceKm ??
    Number(haversineKm(rest.originLat, rest.originLng, rest.destinationLat, rest.destinationLng).toFixed(2));

  return prisma.commuterRoute.create({
    data: {
      ...rest,
      ownerId,
      distanceKm,
      schedules: schedule
        ? {
            create: {
              daysOfWeek: schedule.daysOfWeek,
              departureTime: schedule.departureTime,
              returnTime: schedule.returnTime,
            },
          }
        : undefined,
    },
    include: { schedules: true, vehicle: true },
  });
};

const listMine = (user: AuthUser) => {
  const where = user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? {} : { ownerId: user.id };
  return prisma.commuterRoute.findMany({
    where,
    include: { schedules: true, vehicle: true },
    orderBy: { createdAt: "desc" },
  });
};

const get = async (routeId: string, user: AuthUser) => {
  const { route } = await assertOwner(routeId, user);
  return route;
};

const update = async (routeId: string, user: AuthUser, payload: any) => {
  const { route, isOwner, isAdmin } = await assertOwner(routeId, user);
  if (!isOwner && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Not allowed");
  return prisma.commuterRoute.update({ where: { id: route.id }, data: payload, include: { schedules: true } });
};

const deactivate = async (routeId: string, user: AuthUser) => {
  const { route, isOwner, isAdmin } = await assertOwner(routeId, user);
  if (!isOwner && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Not allowed");
  return prisma.commuterRoute.update({ where: { id: route.id }, data: { status: "INACTIVE" } });
};

const setStatus = async (routeId: string, user: AuthUser, status: "ACTIVE" | "PAUSED") => {
  const { route, isOwner, isAdmin } = await assertOwner(routeId, user);
  if (!isOwner && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Not allowed");
  return prisma.commuterRoute.update({ where: { id: route.id }, data: { status } });
};

const addSchedule = async (routeId: string, user: AuthUser, payload: any) => {
  const { isOwner, isAdmin } = await assertOwner(routeId, user);
  if (!isOwner && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Not allowed");
  return prisma.routeSchedule.create({ data: { routeId, ...payload } });
};

const listSchedules = async (routeId: string, user: AuthUser) => {
  await assertOwner(routeId, user);
  return prisma.routeSchedule.findMany({ where: { routeId } });
};

const updateSchedule = async (routeId: string, scheduleId: string, user: AuthUser, payload: any) => {
  const { isOwner, isAdmin } = await assertOwner(routeId, user);
  if (!isOwner && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Not allowed");
  return prisma.routeSchedule.update({ where: { id: scheduleId }, data: payload });
};

const deleteSchedule = async (routeId: string, scheduleId: string, user: AuthUser) => {
  const { isOwner, isAdmin } = await assertOwner(routeId, user);
  if (!isOwner && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Not allowed");
  return prisma.routeSchedule.delete({ where: { id: scheduleId } });
};

const setAvailability = async (routeId: string, user: AuthUser, payload: any) => {
  const { isOwner } = await assertOwner(routeId, user);
  if (!isOwner) throw new AppError(httpStatus.FORBIDDEN, "Not allowed");
  return prisma.routeAvailability.upsert({
    where: { routeId_date: { routeId, date: new Date(payload.date) } },
    update: { isAvailable: payload.isAvailable, seats: payload.seats, note: payload.note },
    create: {
      routeId,
      date: new Date(payload.date),
      isAvailable: payload.isAvailable,
      seats: payload.seats,
      note: payload.note,
    },
  });
};

const listAvailability = async (routeId: string, user: AuthUser) => {
  await assertOwner(routeId, user);
  return prisma.routeAvailability.findMany({ where: { routeId }, orderBy: { date: "asc" } });
};

export const routeService = {
  create,
  listMine,
  get,
  update,
  deactivate,
  setStatus,
  addSchedule,
  listSchedules,
  updateSchedule,
  deleteSchedule,
  setAvailability,
  listAvailability,
};
