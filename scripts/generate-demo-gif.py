#!/usr/bin/env python3
"""Generate a terminal-style animated GIF demo of `npx shipstack-agent init`."""

from PIL import Image, ImageDraw, ImageFont
import os

# --- Config ---
WIDTH = 820
FONT_SIZE = 14
LINE_HEIGHT = 20
PAD_X = 16
PAD_Y = 12
TITLE_BAR_H = 32
CORNER_R = 10
MAX_LINES = 15  # Fixed line count — all frames rendered at this height

# Colors (Catppuccin Mocha-inspired)
BG = (30, 30, 46)
TITLE_BG = (40, 42, 54)
FG = (205, 214, 244)        # default text
DIM = (108, 112, 134)       # dim/comment
GREEN = (166, 227, 161)     # success / selected
CYAN = (137, 220, 235)      # highlights / prompts
YELLOW = (249, 226, 175)    # warnings / emphasis
MAGENTA = (245, 194, 231)   # branding
BLUE = (137, 180, 250)      # links / info
WHITE = (255, 255, 255)

FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
FONT_BOLD_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"

font = ImageFont.truetype(FONT_PATH, FONT_SIZE)
font_bold = ImageFont.truetype(FONT_BOLD_PATH, FONT_SIZE)
font_title = ImageFont.truetype(FONT_BOLD_PATH, 13)

TOTAL_H = TITLE_BAR_H + MAX_LINES * LINE_HEIGHT + PAD_Y * 2


def make_frames():
    frames = []

    # Frame 1: Command typed (700ms)
    frames.append({
        "duration": 700,
        "lines": [
            [(DIM, "$ "), (GREEN, "npx shipstack-agent init")],
        ]
    })

    # Frame 2: Banner appears (1200ms)
    frames.append({
        "duration": 1200,
        "lines": [
            [(DIM, "$ npx shipstack-agent init")],
            [],
            [(MAGENTA, "  ┌─────────────────────────────────────┐")],
            [(MAGENTA, "  │"), (WHITE, "     ShipStack Agent  v0.1.0        "), (MAGENTA, "│")],
            [(MAGENTA, "  │"), (DIM,   "     Production-grade in 2 minutes   "), (MAGENTA, "│")],
            [(MAGENTA, "  └─────────────────────────────────────┘")],
        ]
    })

    # Frame 3: Project name prompt (1500ms)
    frames.append({
        "duration": 1500,
        "lines": [
            [(DIM, "$ npx shipstack-agent init")],
            [],
            [(MAGENTA, "  ┌─────────────────────────────────────┐")],
            [(MAGENTA, "  │"), (WHITE, "     ShipStack Agent  v0.1.0        "), (MAGENTA, "│")],
            [(MAGENTA, "  │"), (DIM,   "     Production-grade in 2 minutes   "), (MAGENTA, "│")],
            [(MAGENTA, "  └─────────────────────────────────────┘")],
            [],
            [(CYAN, "?"), (FG, " What is your project name? "), (GREEN, "acme-app")],
        ]
    })

    # Frame 4: Frontend selection (1800ms)
    frames.append({
        "duration": 1800,
        "lines": [
            [(DIM, "$ npx shipstack-agent init")],
            [],
            [(MAGENTA, "  ┌─────────────────────────────────────┐")],
            [(MAGENTA, "  │"), (WHITE, "     ShipStack Agent  v0.1.0        "), (MAGENTA, "│")],
            [(MAGENTA, "  │"), (DIM,   "     Production-grade in 2 minutes   "), (MAGENTA, "│")],
            [(MAGENTA, "  └─────────────────────────────────────┘")],
            [],
            [(GREEN, "✔"), (FG, " What is your project name? "), (DIM, "acme-app")],
            [(CYAN, "?"), (FG, " Which frontend?")],
            [(CYAN, "❯"), (GREEN, " Vite + React (Web)"), (DIM, "  SPA with TailwindCSS")],
            [(FG, "  Expo (Mobile)"), (DIM, "         iOS, Android, Web")],
        ]
    })

    # Frame 5: Services selection (2200ms)
    frames.append({
        "duration": 2200,
        "lines": [
            [(GREEN, "✔"), (FG, " What is your project name? "), (DIM, "acme-app")],
            [(GREEN, "✔"), (FG, " Which frontend? "), (DIM, "Vite + React (Web)")],
            [],
            [(CYAN, "?"), (FG, " Select services "), (DIM, "(Auth + DB always included)")],
            [(GREEN, "◉"), (GREEN, " Payments (Stripe)"), (DIM, "        checkout + subs")],
            [(GREEN, "◉"), (GREEN, " Email (Resend)")],
            [(FG, "◯ File Storage (S3 / R2)")],
            [(GREEN, "◉"), (GREEN, " AI (OpenAI)")],
            [(FG, "◯ Cron Jobs")],
            [(FG, "◯ Webhooks (outbound)")],
            [(FG, "◯ Rate Limiting")],
        ]
    })

    # Frame 6: Auth providers (1500ms)
    frames.append({
        "duration": 1500,
        "lines": [
            [(GREEN, "✔"), (FG, " What is your project name? "), (DIM, "acme-app")],
            [(GREEN, "✔"), (FG, " Which frontend? "), (DIM, "Vite + React (Web)")],
            [(GREEN, "✔"), (FG, " Services: "), (DIM, "Payments, Email, AI")],
            [],
            [(CYAN, "?"), (FG, " Auth providers:")],
            [(GREEN, "◉"), (GREEN, " Email + Password"), (DIM, "  default")],
            [(GREEN, "◉"), (GREEN, " Google")],
            [(GREEN, "◉"), (GREEN, " GitHub")],
            [(FG, "◯ Magic Link")],
            [(FG, "◯ Two-Factor (2FA)")],
        ]
    })

    # Frame 7: Database selection (1500ms)
    frames.append({
        "duration": 1500,
        "lines": [
            [(GREEN, "✔"), (FG, " What is your project name? "), (DIM, "acme-app")],
            [(GREEN, "✔"), (FG, " Which frontend? "), (DIM, "Vite + React (Web)")],
            [(GREEN, "✔"), (FG, " Services: "), (DIM, "Payments, Email, AI")],
            [(GREEN, "✔"), (FG, " Auth: "), (DIM, "Email+Password, Google, GitHub")],
            [],
            [(CYAN, "?"), (FG, " PostgreSQL setup:")],
            [(CYAN, "❯"), (GREEN, " Neon"), (DIM, "          free tier, serverless")],
            [(FG, "  Railway"), (DIM, "       $5/mo, managed")],
            [(FG, "  Docker (local)"), (DIM, " docker-compose included")],
            [(FG, "  I have a connection string")],
        ]
    })

    # Frame 8: Scaffolding in progress (2000ms)
    frames.append({
        "duration": 2000,
        "lines": [
            [(GREEN, "✔"), (FG, " What is your project name? "), (DIM, "acme-app")],
            [(GREEN, "✔"), (FG, " Which frontend? "), (DIM, "Vite + React (Web)")],
            [(GREEN, "✔"), (FG, " Services: "), (DIM, "Payments, Email, AI")],
            [(GREEN, "✔"), (FG, " Auth: "), (DIM, "Email+Password, Google, GitHub")],
            [(GREEN, "✔"), (FG, " Database: "), (DIM, "Neon (serverless PostgreSQL)")],
            [],
            [(YELLOW, "⠸"), (FG, " Scaffolding monorepo...")],
            [(GREEN, "  ✓"), (DIM, " Created acme-app/")],
            [(GREEN, "  ✓"), (DIM, " Initialized Turborepo + npm workspaces")],
            [(GREEN, "  ✓"), (DIM, " Created apps/api/ (Fastify v5)")],
            [(YELLOW, "  ⠸"), (FG, " Creating apps/web/ (Vite + React)...")],
        ]
    })

    # Frame 9: More scaffolding (2000ms)
    frames.append({
        "duration": 2000,
        "lines": [
            [(GREEN, "✔"), (FG, " Project: "), (DIM, "acme-app")],
            [(GREEN, "✔"), (FG, " Stack: "), (DIM, "Web + Payments, Email, AI")],
            [],
            [(GREEN, "  ✓"), (DIM, " Created acme-app/")],
            [(GREEN, "  ✓"), (DIM, " Initialized Turborepo + npm workspaces")],
            [(GREEN, "  ✓"), (DIM, " Created apps/api/ (Fastify v5)")],
            [(GREEN, "  ✓"), (DIM, " Created apps/web/ (Vite + React)")],
            [(GREEN, "  ✓"), (DIM, " Generated Drizzle schema + migrations")],
            [(GREEN, "  ✓"), (DIM, " Wired Better Auth (email, google, github)")],
            [(GREEN, "  ✓"), (DIM, " Added Stripe checkout + webhook handler")],
            [(GREEN, "  ✓"), (DIM, " Added Resend email service")],
            [(GREEN, "  ✓"), (DIM, " Added OpenAI completion endpoint")],
            [(YELLOW, "  ⠸"), (FG, " Installing dependencies (latest)...")],
        ]
    })

    # Frame 10: AI docs generation (1800ms)
    frames.append({
        "duration": 1800,
        "lines": [
            [(GREEN, "  ✓"), (DIM, " Created apps/web/ (Vite + React)")],
            [(GREEN, "  ✓"), (DIM, " Generated Drizzle schema + migrations")],
            [(GREEN, "  ✓"), (DIM, " Wired Better Auth (email, google, github)")],
            [(GREEN, "  ✓"), (DIM, " Added Stripe checkout + webhook handler")],
            [(GREEN, "  ✓"), (DIM, " Added Resend email service")],
            [(GREEN, "  ✓"), (DIM, " Added OpenAI completion endpoint")],
            [(GREEN, "  ✓"), (DIM, " Installed 247 packages (0 vulnerabilities)")],
            [],
            [(BLUE, "📄"), (FG, " Generating AI documentation...")],
            [(GREEN, "  ✓"), (DIM, " CLAUDE.md")],
            [(GREEN, "  ✓"), (DIM, " docs/PATTERNS.md")],
            [(GREEN, "  ✓"), (DIM, " docs/llms/better-auth.txt")],
            [(GREEN, "  ✓"), (DIM, " docs/llms/stripe.txt")],
            [(GREEN, "  ✓"), (DIM, " docs/llms/resend.txt")],
        ]
    })

    # Frame 11: Done! (3500ms)
    frames.append({
        "duration": 3500,
        "lines": [
            [(GREEN, "  ✓"), (DIM, " Installed 247 packages (0 vulnerabilities)")],
            [(GREEN, "  ✓"), (DIM, " Generated AI docs (CLAUDE.md, PATTERNS.md)")],
            [],
            [(GREEN, "  ┌─────────────────────────────────────┐")],
            [(GREEN, "  │"), (WHITE, "  ✨ acme-app is ready!              "), (GREEN, "│")],
            [(GREEN, "  └─────────────────────────────────────┘")],
            [],
            [(FG, "  Next steps:")],
            [(FG, "    cd "), (CYAN, "acme-app")],
            [(FG, "    npm run "), (CYAN, "dev")],
            [],
            [(DIM, "  Open in Claude Code for AI-assisted development:")],
            [(DIM, "    claude "), (BLUE, "# reads your CLAUDE.md automatically")],
            [],
            [(DIM, "$ "), (GREEN, "▌")],
        ]
    })

    return frames


def draw_frame(lines):
    """Draw a single frame with fixed dimensions."""
    img = Image.new("RGB", (WIDTH, TOTAL_H), BG)
    draw = ImageDraw.Draw(img)

    # Rounded rectangle border
    draw.rounded_rectangle(
        [(0, 0), (WIDTH - 1, TOTAL_H - 1)],
        radius=CORNER_R,
        fill=BG,
        outline=(60, 60, 80),
        width=1,
    )

    # Title bar background
    draw.rounded_rectangle(
        [(0, 0), (WIDTH - 1, TITLE_BAR_H)],
        radius=CORNER_R,
        fill=TITLE_BG,
    )
    draw.rectangle(
        [(0, TITLE_BAR_H - CORNER_R), (WIDTH - 1, TITLE_BAR_H)],
        fill=TITLE_BG,
    )

    # Traffic lights
    for i, color in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        cx = 18 + i * 22
        cy = TITLE_BAR_H // 2
        draw.ellipse([(cx - 6, cy - 6), (cx + 6, cy + 6)], fill=color)

    # Title text
    title = "shipstack-agent — zsh"
    bbox = font_title.getbbox(title)
    tw = bbox[2] - bbox[0]
    draw.text(((WIDTH - tw) // 2, (TITLE_BAR_H - 13) // 2), title, fill=DIM, font=font_title)

    # Content
    y = TITLE_BAR_H + PAD_Y
    for line_parts in lines:
        x = PAD_X
        for color, text in line_parts:
            draw.text((x, y), text, fill=color, font=font)
            bbox = font.getbbox(text)
            x += bbox[2] - bbox[0]
        y += LINE_HEIGHT

    # Re-draw bottom rounded corners over any content overflow
    draw.rounded_rectangle(
        [(0, 0), (WIDTH - 1, TOTAL_H - 1)],
        radius=CORNER_R,
        outline=(60, 60, 80),
        width=1,
    )

    return img


def main():
    frames_data = make_frames()
    images = []
    durations = []

    for fd in frames_data:
        img = draw_frame(fd["lines"])
        images.append(img)
        durations.append(fd["duration"])

    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "demo.gif")

    images[0].save(
        out_path,
        save_all=True,
        append_images=images[1:],
        duration=durations,
        loop=0,
        optimize=True,
    )

    size_kb = os.path.getsize(out_path) / 1024
    print(f"Generated {out_path} ({len(images)} frames, {size_kb:.0f} KB)")


if __name__ == "__main__":
    main()
