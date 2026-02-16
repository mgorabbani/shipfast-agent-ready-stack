# Database Package (@shipfast/db)

Drizzle ORM with PostgreSQL. This package owns all database schema, migrations, and the db client.

## Schema Conventions

- One file per domain in `src/schema/` (e.g., `users.ts`, `items.ts`).
- Export everything from `src/schema/index.ts`.
- Use `pgTable` from drizzle-orm/pg-core.
- Use `uuid` for primary keys with `defaultRandom()`.
- Use `timestamp` with `defaultNow()` for `created_at`, `updated_at`.
- Use `pgEnum` for enums — define them in the same file as the table that uses them.
- Add proper indexes for columns used in WHERE clauses.

## Schema Example Pattern

```typescript
import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core"

export const statusEnum = pgEnum("status", ["active", "inactive"])

export const items = pgTable("items", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  status: statusEnum("status").default("active").notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
```

## Migration Workflow

1. Edit schema files in `src/schema/`.
2. Run `npm run db:generate` from root — creates SQL migration in `migrations/`.
3. Review the generated SQL.
4. Run `npm run db:migrate` to apply.
5. Never manually edit migration files after they've been applied.

## Relations

Define relations using `relations()` from drizzle-orm:
```typescript
export const usersRelations = relations(users, ({ many }) => ({
  items: many(items),
}))
```

## Query Patterns

- Use `db.select()` for simple queries.
- Use `db.query.tableName.findMany()` for relational queries.
- Always use parameterized queries (Drizzle handles this automatically).
- For recursive hierarchies, use raw SQL with CTEs via `db.execute(sql\`...\`)`.
