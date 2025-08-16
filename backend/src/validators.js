import { z } from "zod";

export const emailSchema = z.string().email();
export const nameSchema = z.string().min(2).max(60);
export const addressSchema = z.string().max(400);
export const passwordSchema = z
  .string()
  .min(8)
  .max(16)
  .regex(/[A-Z]/, "Must include at least one uppercase letter")
  .regex(/[^A-Za-z0-9]/, "Must include at least one special character");

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  password: passwordSchema
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1)
});

export const addUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  password: passwordSchema,
  role: z.enum(["ADMIN", "USER", "STORE_OWNER"])
});

export const addStoreSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().optional().nullable(),
  address: addressSchema,
  ownerId: z.string().optional().nullable()
});

export const ratingSchema = z.object({
  storeId: z.string().min(1),
  value: z.number().int().min(1).max(5)
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: passwordSchema
});
