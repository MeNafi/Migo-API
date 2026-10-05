import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { AuthUser } from "../../types";

const assertOwner = async (vehicleId: string, user: AuthUser) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId }, include: { documents: true, verifications: true } });
  if (!vehicle) throw new AppError(httpStatus.NOT_FOUND, "Vehicle not found");
  if (vehicle.ownerId !== user.id && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new AppError(httpStatus.FORBIDDEN, "You do not own this vehicle");
  }
  return vehicle;
};

const create = (ownerId: string, payload: any) =>
  prisma.vehicle.create({
    data: { ...payload, ownerId },
  });

const listMine = (ownerId: string) =>
  prisma.vehicle.findMany({
    where: { ownerId, isActive: true },
    include: { documents: true },
    orderBy: { createdAt: "desc" },
  });

const addDocument = async (vehicleId: string, user: AuthUser, payload: any) => {
  await assertOwner(vehicleId, user);
  const document = await prisma.vehicleDocument.create({
    data: { vehicleId, ...payload },
  });
  await prisma.verification.create({
    data: {
      userId: user.id,
      vehicleId,
      type: payload.type === "LICENSE" ? "LICENSE" : "VEHICLE",
      documentUrls: [payload.fileUrl],
    },
  });
  return document;
};

const verification = (vehicleId: string, user: AuthUser) => assertOwner(vehicleId, user);

const resubmit = async (vehicleId: string, user: AuthUser) => {
  const vehicle = await assertOwner(vehicleId, user);
  const latest = await prisma.verification.findFirst({
    where: { vehicleId },
    orderBy: { createdAt: "desc" },
  });
  if (latest && latest.status !== "REJECTED" && latest.status !== "RESUBMISSION_REQUESTED") {
    throw new AppError(httpStatus.CONFLICT, "Current verification is not awaiting resubmission");
  }
  return prisma.verification.create({
    data: {
      userId: user.id,
      vehicleId,
      type: "VEHICLE",
      documentUrls: latest?.documentUrls ?? [],
      notes: "Resubmitted by commuter",
    },
  });
};

const update = async (vehicleId: string, user: AuthUser, payload: any) => {
  await assertOwner(vehicleId, user);
  return prisma.vehicle.update({ where: { id: vehicleId }, data: payload });
};

const remove = async (vehicleId: string, user: AuthUser) => {
  const vehicle = await assertOwner(vehicleId, user);
  const rideCount = await prisma.ride.count({
    where: { route: { vehicleId }, status: { in: ["REQUESTED", "ACCEPTED", "CONFIRMED", "ARRIVING", "STARTED"] } },
  });
  if (rideCount) throw new AppError(httpStatus.CONFLICT, "Vehicle is attached to an active ride");
  return prisma.vehicle.update({ where: { id: vehicle.id }, data: { isActive: false } });
};

export const vehicleService = {
  create,
  listMine,
  get: assertOwner,
  update,
  remove,
  addDocument,
  verification,
  resubmit,
};
