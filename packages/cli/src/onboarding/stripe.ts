import { openAndCollect } from "../utils/browser.js"

export async function onboardStripe(): Promise<Record<string, string>> {
  const secretKey = await openAndCollect({
    service: "Stripe",
    url: "https://dashboard.stripe.com/apikeys",
    instructions: [
      "1. Create a Stripe account (or sign in)",
      "2. Go to Developers → API Keys",
      "3. Copy the Secret key (starts with sk_test_ or sk_live_)",
    ],
    envKey: "STRIPE_SECRET_KEY",
    placeholder: "sk_test_...",
  })

  const publishableKey = await openAndCollect({
    service: "Stripe (publishable key)",
    url: "https://dashboard.stripe.com/apikeys",
    instructions: ["Copy the Publishable key from the same page"],
    envKey: "STRIPE_PUBLISHABLE_KEY",
    placeholder: "pk_test_...",
  })

  const webhookSecret = await openAndCollect({
    service: "Stripe Webhook",
    url: "https://dashboard.stripe.com/webhooks",
    instructions: [
      '1. Click "Add endpoint"',
      "2. URL: https://your-domain.com/api/webhooks/stripe",
      "3. Select events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted",
      "4. Copy the Signing secret (whsec_...)",
      "Tip: For local dev, use Stripe CLI: stripe listen --forward-to localhost:3000/api/webhooks/stripe",
    ],
    envKey: "STRIPE_WEBHOOK_SECRET",
    placeholder: "whsec_...",
  })

  return {
    STRIPE_SECRET_KEY: secretKey,
    STRIPE_PUBLISHABLE_KEY: publishableKey,
    STRIPE_WEBHOOK_SECRET: webhookSecret,
  }
}
