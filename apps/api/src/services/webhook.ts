import crypto from "crypto"
import { eq, and } from "drizzle-orm"
import { webhookEndpoints, webhookDeliveries } from "@shipfast/db"
import type { Database } from "@shipfast/db"

export async function dispatchWebhookEvent(
  db: Database,
  opts: { event: string; payload: Record<string, unknown>; userId: string },
) {
  // Find all active endpoints for this user that subscribe to this event
  const endpoints = await db
    .select()
    .from(webhookEndpoints)
    .where(and(eq(webhookEndpoints.userId, opts.userId), eq(webhookEndpoints.isActive, true)))

  const matchingEndpoints = endpoints.filter((ep) =>
    ep.events.includes(opts.event) || ep.events.includes("*"),
  )

  const payloadStr = JSON.stringify(opts.payload)

  for (const endpoint of matchingEndpoints) {
    const signature = crypto
      .createHmac("sha256", endpoint.secret)
      .update(payloadStr)
      .digest("hex")

    // Record delivery attempt
    const [delivery] = await db
      .insert(webhookDeliveries)
      .values({
        endpointId: endpoint.id,
        event: opts.event,
        payload: payloadStr,
      })
      .returning()

    try {
      const res = await fetch(endpoint.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
          "X-Webhook-Event": opts.event,
        },
        body: payloadStr,
        signal: AbortSignal.timeout(10000),
      })

      await db
        .update(webhookDeliveries)
        .set({
          statusCode: String(res.status),
          response: await res.text().catch(() => ""),
          deliveredAt: new Date(),
        })
        .where(eq(webhookDeliveries.id, delivery.id))
    } catch (err: any) {
      await db
        .update(webhookDeliveries)
        .set({
          statusCode: "0",
          response: err.message,
        })
        .where(eq(webhookDeliveries.id, delivery.id))
    }
  }
}
