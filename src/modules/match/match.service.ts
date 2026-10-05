import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { scoreRoute } from "./match.engine";
import { notifyUser } from "../../lib/notify";

const routeInclude = {
  schedules: true,
  availabilities: true,
  owner: { include: { profile: true } },
  vehicle: true,
} as const;

const persistMatches = async (requestId: string, scored: ReturnType<typeof scoreRoute>[]) => {
  const valid = scored.filter(Boolean) as NonNullable<ReturnType<typeof scoreRoute>>[];
  valid.sort((a, b) => b.score - a.score);

  await prisma.rideMatch.deleteMany({
    where: { requestId, status: { in: ["SUGGESTED", "SELECTED"] } },
  });

  const created = [];
  for (const match of valid.slice(0, 20)) {
    const row = await prisma.rideMatch.upsert({
      where: { requestId_routeId: { requestId, routeId: match.routeId } },
      update: { ...match, status: "SUGGESTED" },
      create: { requestId, ...match },
      include: { route: { include: routeInclude } },
    });
    created.push(row);
  }
  if (created.length) {
    await prisma.rideRequest.update({ where: { id: requestId }, data: { status: "MATCHED" } });
  }
  return created;
};

const search = async (passengerId: string, payload: any) => {
  const request = await prisma.rideRequest.create({
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
  return generateForRequest(request.id, passengerId);
};

const generateForRequest = async (requestId: string, passengerId: string) => {
  const request = await prisma.rideRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new AppError(httpStatus.NOT_FOUND, "Ride request not found");
  if (request.passengerId !== passengerId) throw new AppError(httpStatus.FORBIDDEN, "Not your request");

  const routes = await prisma.commuterRoute.findMany({
    where: { status: "ACTIVE" },
    include: { schedules: true, availabilities: true },
  });
  const scored = routes.map((route) => scoreRoute(request, route));
  return persistMatches(requestId, scored);
};

const listForRequest = (requestId: string) =>
  prisma.rideMatch.findMany({
    where: { requestId },
    include: { route: { include: routeInclude } },
    orderBy: { score: "desc" },
  });

const getMatch = async (matchId: string) => {
  const match = await prisma.rideMatch.findUnique({
    where: { id: matchId },
    include: { route: { include: routeInclude }, request: true },
  });
  if (!match) throw new AppError(httpStatus.NOT_FOUND, "Match not found");
  return match;
};

const selectMatch = async (matchId: string, passengerId: string) => {
  const match = await getMatch(matchId);
  if (match.request.passengerId !== passengerId) throw new AppError(httpStatus.FORBIDDEN, "Not your match");
  return prisma.rideMatch.update({ where: { id: matchId }, data: { status: "SELECTED" } });
};

const requestMatch = async (matchId: string, passengerId: string) => {
  const match = await getMatch(matchId);
  if (match.request.passengerId !== passengerId) throw new AppError(httpStatus.FORBIDDEN, "Not your match");

  const ride = await prisma.$transaction(async (tx) => {
    const updated = await tx.rideMatch.update({
      where: { id: matchId },
      data: { status: "REQUESTED" },
    });
    const created = await tx.ride.create({
      data: {
        requestId: match.requestId,
        matchId: match.id,
        routeId: match.routeId,
        commuterId: match.route.ownerId,
        status: "REQUESTED",
        date: match.request.date,
        departureTime: match.request.time,
        seats: match.request.seats,
        contributionBdt: match.contributionBdt,
        passengers: {
          create: {
            passengerId,
            seats: match.request.seats,
            pickupName: match.request.pickupName,
            pickupLat: match.request.pickupLat,
            pickupLng: match.request.pickupLng,
            dropName: match.request.destinationName,
            dropLat: match.request.destinationLat,
            dropLng: match.request.destinationLng,
          },
        },
        timeline: {
          create: { type: "REQUESTED", actorId: passengerId },
        },
      },
      include: { passengers: true, route: true },
    });
    await tx.conversation.create({
      data: {
        rideId: created.id,
        participantA: passengerId,
        participantB: match.route.ownerId,
      },
    });
    return created;
  });

  await notifyUser({
    userId: match.route.ownerId,
    type: "RIDE_REQUEST",
    title: "New ride request",
    body: "A passenger requested to join your commute.",
    data: { rideId: ride.id, matchId },
  });

  return ride;
};

const refreshMatch = async (matchId: string) => {
  const match = await getMatch(matchId);
  const route = await prisma.commuterRoute.findUniqueOrThrow({
    where: { id: match.routeId },
    include: { schedules: true, availabilities: true },
  });
  const scored = scoreRoute(match.request, route);
  if (!scored) throw new AppError(httpStatus.CONFLICT, "Route is no longer compatible");
  return prisma.rideMatch.update({ where: { id: matchId }, data: scored, include: { route: { include: routeInclude } } });
};

export const matchService = {
  search,
  generateForRequest,
  listForRequest,
  getMatch,
  selectMatch,
  requestMatch,
  refreshMatch,
};
