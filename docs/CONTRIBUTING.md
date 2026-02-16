# Contributing

## Getting Started

1. Fork and clone the repo.
2. Copy `.env.example` to `.env` and configure.
3. `docker compose up -d` to start PostgreSQL.
4. `npm install` to install all dependencies.
5. `npm run db:push` to create tables.
6. `npm run dev` to start all apps.

## Development Workflow

1. Create a feature branch: `git checkout -b feat/my-feature`.
2. Make changes following the patterns in CLAUDE.md files.
3. Test your changes locally.
4. Commit with conventional commits: `feat: add user avatars`.
5. Open a pull request.

## Code Standards

- TypeScript strict mode everywhere.
- Zod for all input validation.
- Drizzle ORM for all database access.
- TanStack Query for all data fetching in mobile.

## Adding a New Feature

Follow the order in the root CLAUDE.md:
1. Schema → 2. Migration → 3. Shared types → 4. API route → 5. Mobile screens.
