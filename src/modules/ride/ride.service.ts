import httpStatus from "http-status";
import { RideStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { AuthUser } from "../../types";
import { notifyUser } from "../../lib/notify";
import { getIO } from "../../socket";
import { randomOtp, randomToken } from "../../utils/hash";
import { getPagination, paginationMeta } from "../../utils/pagination";
import { writeAudit } from "../../lib/audit";

const allowed: Record<string, RideStatus[]> = {
  REQUESTED: ["ACCEPTED", "REJECTED", "CANCELLED", "EXPIRED"],
  ACCEPTED: ["CONFIRMED", "REJECTED", "CANCELLED"],
  CONFIRMED: ["ARRIVING", "CANCELLED"],
  ARRIVING: ["STARTED", "CANCELLED"],
  STARTED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
  REJECTED: [],
  EXPIRED: [],
};

const rideInclude = {
  route: true,
  commuter: { include: { profile: true } },
  passengers: { include: { passenger: { include: { profile: true } } } },
  timeline: { orderBy: { createdAt: "asc" as const } },
  payments: true,
};

const getRideOrThrow = async (rideId: string) => {
  const ride = await prisma.ride.findUnique({ where: { id: rideId }, include: rideInclude });
  if (!ride) throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
  return ride;
};

const assertParticipant = (ride: any, user: AuthUser, commuterOnly = false) => {
  const isPassenger = ride.passengers.some((p: any) => p.passengerId === user.id);
  const isCommuter = ride.commuterId === user.id;
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  if (commuterOnly && !isCommuter && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Commuter only");
  if (!isPassenger && !isCommuter && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Not a ride participant");
  return { isPassenger, isCommuter, isAdmin };
};

const emitStatus = (rideId: string, status: RideStatus) => {
  try {
    getIO()?.to(`ride:${rideId}`).emit("ride:status", { rideId, status });
  } catch {
    /* optional */
  }
};

const list = async (user: AuthUser, query: Record<string, unknown>) => {
  const { page, limit, skip } = getPagination(query);
  const status = query.status as RideStatus | undefined;
  const where =
    user.role === "ADMIN" || user.role === "SUPER_ADMIN"
      ? { ...(status ? { status } : {}) }
      : {
          ...(status ? { status } : {}),
          OR: [{ commuterId: user.id }, { passengers: { some: { passengerId: user.id } } }],
        };
  const [items, total] = await Promise.all([
    prisma.ride.findMany({ where, include: rideInclude, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.ride.count({ where }),
  ]);
  return { items, meta: paginationMeta(page, limit, total) };
};

const get = async (rideId: string, user: AuthUser) => {
  const ride = await getRideOrThrow(rideId);
  assertParticipant(ride, user);
  return ride;
};

const addEvent = (rideId: string, type: string, actorId?: string, payload?: object) =>
  prisma.rideEvent.create({ data: { rideId, type, actorId, payload } });

const accept = async (rideId: string, user: AuthUser) => {
  const ride = await getRideOrThrow(rideId);
  assertParticipant(ride, user, true);
  if (!allowed[ride.status].includes("ACCEPTED")) throw new AppError(httpStatus.CONFLICT, "Invalid status transition");

  const otp = randomOtp();
  const updated = await prisma.$transaction(async (tx) => {
    const next = await tx.ride.update({
      where: { id: rideId },
      data: { status: "ACCEPTED", otpCode: otp, otpExpiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000) },
      include: rideInclude,
    });
    await tx.rideEvent.create({ data: { rideId, type: "ACCEPTED", actorId: user.id } });
    if (ride.matchId) await tx.rideMatch.update({ where: { id: ride.matchId }, data: { status: "ACCEPTED" } });
    return next;
  });

  for (const p of ride.passengers) {
    await notifyUser({
      userId: p.passengerId,
      type: "RIDE_ACCEPTED",
      title: "Ride accepted",
      body: "Your commuter accepted the ride. Confirm to lock the seat.",
      data: { rideId },
    });
  }
  emitStatus(rideId, "ACCEPTED");
  return updated;
};

const reject = async (rideId: string, user: AuthUser) => {
  const ride = await getRideOrThrow(rideId);
  assertParticipant(ride, user, true);
  if (!allowed[ride.status].includes("REJECTED") && !allowed[ride.status].includes("CANCELLED")) {
    throw new AppError(httpStatus.CONFLICT, "Invalid status transition");
  }
  const updated = await prisma.ride.update({
    where: { id: rideId },
    data: { status: "REJECTED", cancelledAt: new Date(), cancelledById: user.id },
    include: rideInclude,
  });
  await addEvent(rideId, "REJECTED", user.id);
  if (ride.matchId) await prisma.rideMatch.update({ where: { id: ride.matchId }, data: { status: "REJECTED" } });
  for (const p of ride.passengers) {
    await notifyUser({
      userId: p.passengerId,
      type: "RIDE_REJECTED",
      title: "Ride declined",
      body: "The commuter declined this request.",
      data: { rideId },
    });
  }
  emitStatus(rideId, "REJECTED");
  return updated;
};

const confirm = async (rideId: string, user: AuthUser) => {
  const ride = await getRideOrThrow(rideId);
  assertParticipant(ride, user);
  if (!allowed[ride.status].includes("CONFIRMED") && ride.status !== "ACCEPTED") {
    throw new AppError(httpStatus.CONFLICT, "Ride must be accepted before confirmation");
  }
  const otp = ride.otpCode || randomOtp();
  const updated = await prisma.ride.update({
    where: { id: rideId },
    data: { status: "CONFIRMED", otpCode: otp, otpExpiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000) },
    include: rideInclude,
  });
  await addEvent(rideId, "CONFIRMED", user.id);
  emitStatus(rideId, "CONFIRMED");
  return updated;
};

const start = async (rideId: string, user: AuthUser, otp?: string) => {
  const ride = await getRideOrThrow(rideId);
  assertParticipant(ride, user, true);
  if (!["CONFIRMED", "ARRIVING"].includes(ride.status)) {
    throw new AppError(httpStatus.CONFLICT, "Ride must be confirmed before start");
  }
  if (ride.otpCode && otp && ride.otpCode !== otp) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid ride OTP");
  }
  const nextStatus: RideStatus = ride.status === "CONFIRMED" && !otp ? "ARRIVING" : "STARTED";
  const updated = await prisma.ride.update({
    where: { id: rideId },
    data: {
      status: nextStatus,
      startedAt: nextStatus === "STARTED" ? new Date() : ride.startedAt,
    },
    include: rideInclude,
  });
  await addEvent(rideId, nextStatus, user.id);
  if (nextStatus === "STARTED") {
    for (const p of ride.passengers) {
      await notifyUser({
        userId: p.passengerId,
        type: "RIDE_STARTED",
        title: "Ride started",
        body: "Your shared commute is on the way.",
        data: { rideId },
      });
    }
  }
  emitStatus(rideId, nextStatus);
  return updated;
};

const complete = async (rideId: string, user: AuthUser) => {
  const ride = await getRideOrThrow(rideId);
  assertParticipant(ride, user, true);
  if (ride.status !== "STARTED") throw new AppError(httpStatus.CONFLICT, "Ride must be started first");
  const updated = await prisma.$transaction(async (tx) => {
    const next = await tx.ride.update({
      where: { id: rideId },
      data: { status: "COMPLETED", completedAt: new Date() },
      include: rideInclude,
    });
    await tx.rideEvent.create({ data: { rideId, type: "COMPLETED", actorId: user.id } });
    await tx.profile.update({
      where: { userId: ride.commuterId },
      data: { completedRides: { increment: 1 } },
    });
    for (const p of ride.passengers) {
      await tx.profile.update({
        where: { userId: p.passengerId },
        data: { completedRides: { increment: 1 } },
      });
    }
    return next;
  });
  for (const p of ride.passengers) {
    await notifyUser({
      userId: p.passengerId,
      type: "RIDE_COMPLETED",
      title: "Ride completed",
      body: "Rate your commuter and settle the contribution.",
      data: { rideId },
    });
  }
  emitStatus(rideId, "COMPLETED");
  return updated;
};

const cancel = async (rideId: string, user: AuthUser, reason?: string) => {
  const ride = await getRideOrThrow(rideId);
  assertParticipant(ride, user);
  if (!allowed[ride.status].includes("CANCELLED")) {
    throw new AppError(httpStatus.CONFLICT, "This ride cannot be cancelled");
  }
  const updated = await prisma.ride.update({
    where: { id: rideId },
    data: { status: "CANCELLED", cancelledAt: new Date(), cancelledById: user.id, cancelReason: reason },
    include: rideInclude,
  });
  await addEvent(rideId, "CANCELLED", user.id, { reason });
  emitStatus(rideId, "CANCELLED");
  return updated;
};

const noShow = async (rideId: string, user: AuthUser, who?: string) => {
  const ride = await getRideOrThrow(rideId);
  assertParticipant(ride, user);
  const updated = await prisma.ride.update({
    where: { id: rideId },
    data: { status: "NO_SHOW", noShowBy: who || user.id, cancelledAt: new Date() },
    include: rideInclude,
  });
  await addEvent(rideId, "NO_SHOW", user.id, { who });
  await writeAudit({
    actorId: user.id,
    action: "RIDE_NO_SHOW",
    targetType: "Ride",
    targetId: rideId,
    reason: who,
  });
  return updated;
};

const timeline = async (rideId: string, user: AuthUser) => {
  const ride = await getRideOrThrow(rideId);
  assertParticipant(ride, user);
  return ride.timeline;
};

const getOtp = async (rideId: string, user: AuthUser) => {
  const ride = await getRideOrThrow(rideId);
  const { isPassenger, isCommuter, isAdmin } = assertParticipant(ride, user);
  if (!ride.otpCode) throw new AppError(httpStatus.BAD_REQUEST, "OTP is not generated yet");
  return {
    rideId,
    masked: isCommuter && !isAdmin ? "******" : undefined,
    otp: isPassenger || isAdmin ? ride.otpCode : undefined,
    expiresAt: ride.otpExpiresAt,
    instruction: isPassenger
      ? "Share this OTP with the commuter to start the ride."
      : "Ask the passenger for the 6-digit OTP, then verify it.",
  };
};

const verifyOtp = async (rideId: string, user: AuthUser, code: string) => {
  const ride = await getRideOrThrow(rideId);
  assertParticipant(ride, user, true);
  if (!ride.otpCode) throw new AppError(httpStatus.BAD_REQUEST, "No OTP on this ride");
  if (ride.otpCode !== code) throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP");
  return start(rideId, user, code);
};

const saveLocation = async (rideId: string, user: AuthUser, payload: { lat: number; lng: number; heading?: number; speed?: number }) => {
  const ride = await getRideOrThrow(rideId);
  assertParticipant(ride, user, true);
  const location = await prisma.rideLocation.create({
    data: { rideId, ...payload },
  });
  try {
    getIO()?.to(`ride:${rideId}`).emit("ride:location:update", location);
  } catch {
    /* optional */
  }
  return location;
};

const latestLocation = async (rideId: string, user: AuthUser) => {
  const ride = await getRideOrThrow(rideId);
  assertParticipant(ride, user);
  return prisma.rideLocation.findFirst({ where: { rideId }, orderBy: { recordedAt: "desc" } });
};

const locationHistory = async (rideId: string, user: AuthUser) => {
  const ride = await getRideOrThrow(rideId);
  assertParticipant(ride, user);
  return prisma.rideLocation.findMany({ where: { rideId }, orderBy: { recordedAt: "asc" }, take: 500 });
};

const share = async (rideId: string, user: AuthUser) => {
  const ride = await getRideOrThrow(rideId);
  assertParticipant(ride, user);
  const token = ride.shareToken || randomToken().slice(0, 16);
  return prisma.ride.update({ where: { id: rideId }, data: { shareToken: token }, select: { id: true, shareToken: true } });
};

const revokeShare = async (rideId: string, user: AuthUser) => {
  const ride = await getRideOrThrow(rideId);
  assertParticipant(ride, user);
  return prisma.ride.update({ where: { id: rideId }, data: { shareToken: null } });
};

export const rideService = {
  list,
  get,
  accept,
  reject,
  confirm,
  start,
  complete,
  cancel,
  noShow,
  timeline,
  getOtp,
  verifyOtp,
  saveLocation,
  latestLocation,
  locationHistory,
  share,
  revokeShare,
};
