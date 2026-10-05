import { z } from "zod";

export const updateMeSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(80).optional(),
    bio: z.string().max(500).optional(),
    gender: z.string().optional(),
    dateOfBirth: z.string().optional(),
    phone: z.string().min(10).max(20).optional(),
  }),
});

export const photoSchema = z.object({
  body: z.object({
    photoUrl: z.string().url(),
  }),
});

export const emergencySchema = z.object({
  body: z.object({
    emergencyName: z.string().min(2),
    emergencyPhone: z.string().min(10),
    emergencyRelation: z.string().optional(),
  }),
});

export const preferencesSchema = z.object({
  body: z.object({
    preferredLanguage: z.string().optional(),
    smokingPreference: z.string().optional(),
    musicPreference: z.string().optional(),
    chatPreference: z.string().optional(),
  }),
});

export const blockSchema = z.object({
  body: z.object({
    reason: z.string().max(300).optional(),
  }),
  params: z.object({
    userId: z.string().uuid(),
  }),
});
