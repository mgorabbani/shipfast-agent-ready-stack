import { z } from "zod"

export const createItemSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
})
export type CreateItemInput = z.infer<typeof createItemSchema>

export const updateItemSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(["active", "archived"]).optional(),
})
export type UpdateItemInput = z.infer<typeof updateItemSchema>
