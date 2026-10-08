import { z } from "zod";

const password = z.string().min(8, "Password must be at least 8 characters");

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(80),
    email: z.string().email(),
    phone: z.string().min(10).max(20).optional(),
    password,
    gender: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
    password: z.string().min(1),
  }).refine((data) => data.email || data.phone, {
    message: "Email or phone is required",
  }),
});

export const googleSchema = z.object({
  body: z.object({
    idToken: z.string().min(10),
    role: z.enum(["PASSENGER", "COMMUTER"]).optional(),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
  }),
});

export const otpSendSchema = z.object({
  body: z.object({
    phone: z.string().min(10).max(20),
    purpose: z.enum(["PHONE_VERIFY", "PASSWORD_RESET"]).default("PHONE_VERIFY"),
  }),
});

export const otpVerifySchema = z.object({
  body: z.object({
    phone: z.string().min(10),
    code: z.string().length(6),
    purpose: z.enum(["PHONE_VERIFY", "PASSWORD_RESET"]).default("PHONE_VERIFY"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(10),
    password,
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: password,
  }),
});

export const confirmEmailSchema = z.object({
  body: z.object({
    token: z.string().min(6),
  }),
});


