import { z } from "zod";

const lat = z.number().min(-90).max(90);
const lng = z.number().min(-180).max(180);

export const createRouteSchema = z.object({
  body: z.object({
    vehicleId: z.string().uuid().optional(),
    title: z.string().optional(),
    originName: z.string().min(2),
    originLat: lat,
    originLng: lng,
    destinationName: z.string().min(2),
    destinationLat: lat,
    destinationLng: lng,
    polyline: z.string().optional(),
    distanceKm: z.number().positive().optional(),
    durationMin: z.number().int().positive().optional(),
    seats: z.number().int().min(1).max(14),
    contributionBdt: z.number().positive(),
    notes: z.string().optional(),
    schedule: z
      .object({
        daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1),
        departureTime: z.string().regex(/^\d{2}:\d{2}$/),
        returnTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
      })
      .optional(),
  }),
});

export const scheduleSchema = z.object({
  body: z.object({
    daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1),
    departureTime: z.string().regex(/^\d{2}:\d{2}$/),
    returnTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    effectiveFrom: z.string().optional(),
    effectiveTo: z.string().optional(),
  }),
});

export const availabilitySchema = z.object({
  body: z.object({
    date: z.string(),
    isAvailable: z.boolean(),
    seats: z.number().int().min(0).optional(),
    note: z.string().optional(),
  }),
});
