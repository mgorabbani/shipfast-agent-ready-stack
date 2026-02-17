<p align="center">
  <h1 align="center">🚀 ShipFast Stack</h1>
  <p align="center">
    <strong>The fullstack starter that actually ships.</strong><br/>
    Production-grade. AI-powered. Claude Code-ready. Fork it. Build it. Ship it.
  </p>
  <p align="center">
    <a href="#quick-start">Quick Start</a> · <a href="#whats-inside">What's Inside</a> · <a href="#ai-superpowers">AI Superpowers</a> · <a href="docs/ARCHITECTURE.md">Architecture</a> · <a href="docs/CONTRIBUTING.md">Contributing</a>
  </p>
</p>

---

> **Stop scaffolding. Start building.** ShipFast Stack gives you a battle-tested monorepo with auth, database, API, mobile app, and AI dev tools — so you can focus on what makes your app unique.

## ✨ Why ShipFast Stack?

Most starters give you a todo app and wish you luck. ShipFast Stack gives you **production infrastructure**:

🔐 **Auth that actually works** — JWT + refresh token rotation + RBAC. Not a "TODO: add auth" comment.

🤖 **AI-First DX** — Every package has a `CLAUDE.md` file that teaches Claude Code your architecture. Ask it to "add a posts feature" and watch it follow your patterns perfectly.

📱 **Ship everywhere** — iOS, Android, and Web from one codebase. Expo SDK 52 + React Native.

🔒 **Type-safe from DB to UI** — Drizzle ORM types flow through Zod schemas to your React components. One typo? TypeScript catches it everywhere.

🎨 **AI Image Generation** — Built-in Claude Code skill for generating images via OpenAI's GPT Image API. Just say `/generate-image a hero banner for my landing page`.

## 🏗️ What's Inside

```
shipfast-stack/
├── 🤖 CLAUDE.md                  # AI knows your whole project
├── apps/
│   ├── 🔥 api/                   # Fastify v5 REST API
│   │   ├── CLAUDE.md             # AI knows your API patterns
│   │   └── src/
│   │       ├── plugins/          # auth, db, cors
│   │       └── routes/           # auth, profile, items (CRUD example)
│   └── 📱 mobile/                # Expo app (iOS/Android/Web)
│       ├── CLAUDE.md             # AI knows your mobile patterns
│       ├── app/                  # File-based routing
│       ├── lib/                  # API client, auth, query client
│       └── components/
├── packages/
│   ├── 🗄️ db/                    # Drizzle ORM + PostgreSQL
│   │   ├── CLAUDE.md             # AI knows your schema conventions
│   │   └── src/schema/
│   └── 📦 shared/                # Zod schemas + constants
│       └── CLAUDE.md             # AI knows what goes where
├── 🎨 .claude/skills/            # AI skills (image generation, etc.)
├── docs/
│   ├── ARCHITECTURE.md           # Full architecture deep-dive
│   └── CONTRIBUTING.md
├── scripts/seed.ts
├── docker-compose.yml
└── turbo.json
```

## ⚡ Tech Stack

| Layer | What You Get |
|-------|-------------|
| **API** | Fastify v5 · TypeScript · JWT + Refresh Tokens · RBAC |
| **Mobile/Web** | Expo SDK 52 · React Native · Expo Router v4 |
| **Database** | PostgreSQL 16 · Drizzle ORM · Type-safe migrations |
| **Data Fetching** | TanStack Query v5 · Auto token refresh on 401 |
| **Validation** | Zod schemas shared between client & server |
| **Build** | Turborepo · npm workspaces · Parallel builds |
| **AI Dev** | CLAUDE.md files · Image generation skill |

## 🚀 Quick Start

Get up and running in under 2 minutes:

```bash
# Clone it
git clone https://github.com/YOUR_USERNAME/shipfast-stack.git
cd shipfast-stack

# Install everything
npm install

# Start PostgreSQL
docker compose up -d

# Configure
cp .env.example .env

# Create tables
npm run db:push

# Seed demo data
npm run db:seed

# Launch! 🎉
npm run dev
```

**That's it.** API on `http://localhost:3000`. Expo on `http://localhost:8081`.

Login with `demo@shipfast.dev` / `password123`

## 🤖 AI Superpowers

This isn't just a starter — it's an **AI-native development environment**. Every package includes a `CLAUDE.md` file that gives Claude Code deep understanding of your codebase.

### CLAUDE.md Files

| File | What It Teaches Claude |
|------|----------------------|
| `CLAUDE.md` | Project overview, conventions, commands, feature workflow |
| `apps/api/CLAUDE.md` | Route patterns, plugin architecture, auth flow, validation |
| `apps/mobile/CLAUDE.md` | Expo Router, TanStack Query, auth, component patterns |
| `packages/db/CLAUDE.md` | Schema conventions, migrations, query patterns |
| `packages/shared/CLAUDE.md` | What belongs here, schema patterns, constants |

### Built-in Skills

| Skill | What It Does |
|-------|-------------|
| `/generate-image` | Creates images via OpenAI GPT Image API with smart prompt engineering |

### Try It

Open the project in Claude Code and try these:

```
> Add a posts feature with title, content, and author
> Generate an image for the app splash screen
> Add a notifications system with push support
```

Claude will follow the established patterns in your CLAUDE.md files automatically.

## 🛠️ Adding a New Feature

ShipFast Stack has a clear feature development workflow. Follow this order:

```
1. Schema     → packages/db/src/schema/my-feature.ts
2. Migration  → npm run db:generate && npm run db:migrate
3. Validation → packages/shared/src/schemas/my-feature.ts
4. API Route  → apps/api/src/routes/my-feature.ts → register in index.ts
5. Screen     → apps/mobile/app/(tabs)/my-feature/index.tsx
```

Or just tell Claude Code what you want and let the CLAUDE.md files guide it.

## ✅ What's Included

**Authentication & Security**
- [x] JWT access tokens (15 min expiry)
- [x] Refresh token rotation (7 day expiry)
- [x] Role-based access control (RBAC)
- [x] Secure token storage (SecureStore native / localStorage web)

**Data Layer**
- [x] Type-safe database queries (Drizzle ORM)
- [x] Zod validation shared between client & server
- [x] PostgreSQL with Docker Compose
- [x] Database seed script

**Mobile & Web**
- [x] Cross-platform (iOS / Android / Web)
- [x] File-based routing (Expo Router v4)
- [x] TanStack Query with auto cache invalidation
- [x] Auto token refresh on 401 responses

**Developer Experience**
- [x] CLAUDE.md files for AI-assisted development
- [x] Image generation skill
- [x] Turborepo parallel builds
- [x] Full CRUD example (Items)
- [x] Architecture documentation

## 🤝 Contributing

We love contributions! Check out our [Contributing Guide](docs/CONTRIBUTING.md) to get started.

1. Fork the repo
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## ⭐ Show Your Support

If ShipFast Stack helped you ship faster, give it a star! It helps others find this project.

## 📄 License

MIT — do whatever you want with it. Build something great.

---

<p align="center">
  <strong>Built with ❤️ and Claude Code</strong><br/>
  <sub>Stop configuring. Start shipping.</sub>
</p>
