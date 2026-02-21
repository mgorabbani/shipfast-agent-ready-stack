import { Resend } from "resend"

export async function sendEmail(
  resend: Resend,
  opts: { to: string; subject: string; html: string; from?: string },
) {
  return resend.emails.send({
    from: opts.from ?? `ShipFast <noreply@${process.env.EMAIL_DOMAIN ?? "example.com"}>`,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  })
}
