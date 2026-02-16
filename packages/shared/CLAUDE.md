# Shared Package (@shipfast/shared)

Shared Zod schemas, types, and constants used by both API and mobile app.

## What Belongs Here

- **Zod schemas** for request/response validation (used by API for validation, mobile for type inference).
- **Constants** and enums shared across frontend and backend.
- **Type utilities** derived from Zod schemas.

## What Does NOT Belong Here

- Database-specific types (those live in `@shipfast/db`).
- UI components or API route logic.
- Environment-specific config.

## Schema Conventions

- One file per domain in `src/schemas/` (e.g., `auth.ts`, `items.ts`).
- Export Zod schemas and inferred types together:
  ```typescript
  export const createItemSchema = z.object({ name: z.string().min(1) })
  export type CreateItemInput = z.infer<typeof createItemSchema>
  ```
- Use `.min()`, `.max()`, `.email()` etc. for validation rules — these apply on both client and server.
- Keep schemas focused on the API contract, not internal DB representation.

## Constants

- Define in `src/constants/`.
- Use `as const` for literal arrays that need type inference.
- Export enum-like objects with `satisfies` for type safety.
