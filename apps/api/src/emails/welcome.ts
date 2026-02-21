export function welcomeEmail(name: string): { subject: string; html: string } {
  return {
    subject: "Welcome to ShipFast!",
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1>Welcome, ${name}!</h1>
  <p>Thanks for signing up. We're excited to have you on board.</p>
  <p>Get started by exploring your dashboard.</p>
  <p>— The ShipFast Team</p>
</body>
</html>
    `.trim(),
  }
}
