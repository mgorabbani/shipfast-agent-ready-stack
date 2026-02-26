import fs from "fs"
import path from "path"
import type { ProjectConfig } from "../types.js"

export function generateDbSchema(dir: string, config: ProjectConfig) {
  const schemaDir = path.join(dir, "packages/db/src/schema")

  // users.ts
  fs.writeFileSync(
    path.join(schemaDir, "users.ts"),
    `import { pgTable, uuid, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const roleEnum = pgEnum("role", ["user", "admin"])

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const verifications = pgTable("verifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))
`,
  )

  // items.ts (example CRUD model)
  fs.writeFileSync(
    path.join(schemaDir, "items.ts"),
    `import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { users } from "./users"

export const itemStatusEnum = pgEnum("item_status", ["active", "archived"])

export const items = pgTable("items", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: itemStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const itemsRelations = relations(items, ({ one }) => ({
  user: one(users, { fields: [items.userId], references: [users.id] }),
}))
`,
  )

  // index.ts exports
  const exports = ['export * from "./users"', 'export * from "./items"']

  if (config.services.includes("payments")) {
    generateSubscriptionsSchema(schemaDir)
    exports.push('export * from "./subscriptions"')
  }
  if (config.services.includes("storage")) {
    generateFilesSchema(schemaDir)
    exports.push('export * from "./files"')
  }
  if (config.services.includes("webhooks")) {
    generateWebhooksSchema(schemaDir)
    exports.push('export * from "./webhooks"')
  }

  fs.writeFileSync(path.join(schemaDir, "index.ts"), exports.join("\n") + "\n")

  // db/src/index.ts
  fs.writeFileSync(
    path.join(dir, "packages/db/src/index.ts"),
    `import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import * as schema from "./schema"

export function createDb(connectionString: string) {
  const client = postgres(connectionString)
  return drizzle(client, { schema })
}

export type Database = ReturnType<typeof createDb>
export * from "./schema"
`,
  )
}

function generateSubscriptionsSchema(schemaDir: string) {
  fs.writeFileSync(
    path.join(schemaDir, "subscriptions.ts"),
    `import { pgTable, uuid, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { users } from "./users"

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active", "canceled", "past_due", "trialing", "unpaid",
])

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripePriceId: text("stripe_price_id"),
  status: subscriptionStatusEnum("status").default("active").notNull(),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
}))
`,
  )
}

function generateFilesSchema(schemaDir: string) {
  fs.writeFileSync(
    path.join(schemaDir, "files.ts"),
    `import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { users } from "./users"

export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  key: text("key").notNull().unique(),
  filename: text("filename").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const filesRelations = relations(files, ({ one }) => ({
  user: one(users, { fields: [files.userId], references: [users.id] }),
}))
`,
  )
}

function generateWebhooksSchema(schemaDir: string) {
  fs.writeFileSync(
    path.join(schemaDir, "webhooks.ts"),
    `import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { users } from "./users"

export const webhookEndpoints = pgTable("webhook_endpoints", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  url: text("url").notNull(),
  secret: text("secret").notNull(),
  events: text("events").array().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const webhookEndpointsRelations = relations(webhookEndpoints, ({ one }) => ({
  user: one(users, { fields: [webhookEndpoints.userId], references: [users.id] }),
}))
`,
  )
}
