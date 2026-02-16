# API App (@shipfast/api)

Fastify v5 REST API with JWT authentication and RBAC.

## Architecture

```
src/
├── index.ts         # Server entry: plugin registration, route mounting
├── plugins/
│   ├── auth.ts     # JWT auth, RBAC decorators
│   ├── db.ts       # Database connection decorator
│   └── cors.ts     # CORS config
└── routes/
    ├── auth.ts     # Register, login, refresh, logout
    ├── profile.ts  # Get/update current user profile
    └── items.ts    # CRUD example route
```

## Plugin Pattern

Plugins decorate the Fastify instance:
```typescript
fastify.register(async (app) => {
  app.decorate("db", createDb(DATABASE_URL))
})
```

Access via `fastify.db`, `fastify.jwt`, etc.

## Route Pattern

Every route file exports a default async function:
```typescript
export default async function itemRoutes(fastify: FastifyInstance) {
  // Add auth hook for all routes in this file
  fastify.addHook("preHandler", fastify.authenticate)

  fastify.get("/", async (request, reply) => {
    const items = await fastify.db.select().from(schema.items)
    return items
  })
}
```

Then register in `index.ts`:
```typescript
fastify.register(itemRoutes, { prefix: "/api/items" })
```

## Auth Flow

1. **Register** — POST `/api/auth/register` → hash password, create user, return tokens.
2. **Login** — POST `/api/auth/login` → verify password, return access + refresh tokens.
3. **Refresh** — POST `/api/auth/refresh` → rotate refresh token, return new pair.
4. **Logout** — POST `/api/auth/logout` → delete refresh tokens.

## Request Validation

Use Zod schemas from `@shipfast/shared`:
```typescript
const body = createItemSchema.parse(request.body)
```

Throw Fastify errors for validation failures:
```typescript
if (!user) {
  return reply.code(404).send({ error: "User not found" })
}
```

## Adding a New Route

1. Create `src/routes/my-feature.ts`.
2. Export default async function.
3. Add `fastify.addHook("preHandler", fastify.authenticate)` if protected.
4. Register in `src/index.ts` with a prefix.

## Type Augmentation

JWT payload is typed via module augmentation in `auth.ts`:
```typescript
declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { userId: string; role: string }
    user: { userId: string; role: string }
  }
}
```
