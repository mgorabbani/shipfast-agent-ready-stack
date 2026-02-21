export function passwordResetEmail(resetUrl: string): { subject: string; html: string } {
  return {
    subject: "Reset your password",
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1>Password Reset</h1>
  <p>You requested a password reset. Click the button below to set a new password.</p>
  <a href="${resetUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
    Reset Password
  </a>
  <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
  <p>— The ShipFast Team</p>
</body>
</html>
    `.trim(),
  }
}
