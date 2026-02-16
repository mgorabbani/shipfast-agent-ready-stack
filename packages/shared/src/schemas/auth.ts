import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})
export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
})
export type RegisterInput = z.infer<typeof registerSchema>

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  username: z.string().min(3).max(30).optional(),
})
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
