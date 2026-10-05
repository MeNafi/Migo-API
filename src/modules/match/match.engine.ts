import config from "../../config";
import { dayOfWeekFromDate, haversineKm, proximityScore, timeCompatibility } from "../../utils/geo";

type RouteLike = {
  id: string;
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
  contributionBdt: number;
  seats: number;
  status: string;
  ownerId: string;
  schedules: { daysOfWeek: number[]; departureTime: string; isActive: boolean }[];
  availabilities: { date: Date; isAvailable: boolean; seats: number | null }[];
};

type RequestLike = {
  pickupLat: number;
  pickupLng: number;
  destinationLat: number;
  destinationLng: number;
  date: Date | string;
  time: string;
  seats: number;
  passengerId: string;
};

export const scoreRoute = (request: RequestLike, route: RouteLike) => {
  if (route.status !== "ACTIVE") return null;
  if (route.ownerId === request.passengerId) return null;
  if (route.seats < request.seats) return null;

  const date = new Date(request.date);
  const dateKey = date.toISOString().slice(0, 10);
  const override = route.availabilities.find((a) => a.date.toISOString().slice(0, 10) === dateKey);
  if (override && !override.isAvailable) return null;
  if (override?.seats != null && override.seats < request.seats) return null;

  const day = dayOfWeekFromDate(date);
  const activeSchedules = route.schedules.filter((s) => s.isActive);
  const matchingSchedules = activeSchedules.filter((s) => s.daysOfWeek.includes(day));
  if (activeSchedules.length && matchingSchedules.length === 0) return null;

  const departure = matchingSchedules[0]?.departureTime || activeSchedules[0]?.departureTime || request.time;

  const pickupKm = haversineKm(request.pickupLat, request.pickupLng, route.originLat, route.originLng);
  const destKm = haversineKm(request.destinationLat, request.destinationLng, route.destinationLat, route.destinationLng);
  const originAlign = proximityScore(
    haversineKm(request.pickupLat, request.pickupLng, route.originLat, route.originLng),
    8
  );
  const destAlign = proximityScore(
    haversineKm(request.destinationLat, request.destinationLng, route.destinationLat, route.destinationLng),
    8
  );

  const routeSimilarity = Number(((originAlign + destAlign) / 2).toFixed(4));
  const pickupProximity = proximityScore(pickupKm, 5);
  const destProximity = proximityScore(destKm, 6);
  const timeScore = timeCompatibility(request.time, departure, 50);
  const scheduleOverlap = matchingSchedules.length ? 1 : activeSchedules.length ? 0.3 : 0.5;

  const w = config.match_weights;
  const score = Number(
    (
      routeSimilarity * w.routeSimilarity +
      pickupProximity * w.pickupProximity +
      destProximity * w.destProximity +
      timeScore * w.timeCompatibility +
      scheduleOverlap * w.scheduleOverlap
    ).toFixed(4)
  );

  if (score < 0.25) return null;

  return {
    routeId: route.id,
    score,
    routeSimilarity,
    pickupProximity,
    destProximity,
    timeCompatibility: timeScore,
    scheduleOverlap,
    estimatedPickupKm: Number(pickupKm.toFixed(2)),
    estimatedDestKm: Number(destKm.toFixed(2)),
    contributionBdt: route.contributionBdt,
  };
};
