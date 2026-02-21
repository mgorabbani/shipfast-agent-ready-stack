import { z } from "zod"

export const createCheckoutSchema = z.object({
  priceId: z.string().min(1),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
})
export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>
