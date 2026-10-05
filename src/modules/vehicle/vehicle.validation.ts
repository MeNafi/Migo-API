import { z } from "zod";

export const createVehicleSchema = z.object({
  body: z.object({
    type: z.enum(["CAR", "BIKE", "MICROBUS", "SUV", "OTHER"]),
    make: z.string().min(1),
    model: z.string().min(1),
    color: z.string().optional(),
    registrationNo: z.string().min(3),
    year: z.number().int().min(1990).max(new Date().getFullYear() + 1).optional(),
    seats: z.number().int().min(1).max(14),
    ac: z.boolean().optional(),
  }),
});

export const updateVehicleSchema = z.object({
  body: createVehicleSchema.shape.body.partial(),
});

export const documentSchema = z.object({
  body: z.object({
    type: z.enum(["REGISTRATION", "INSURANCE", "FITNESS", "PHOTO", "LICENSE"]),
    fileUrl: z.string().url(),
    fileKey: z.string().optional(),
  }),
});
