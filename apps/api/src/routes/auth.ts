import { FastifyInstance } from "fastify"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { users, refreshTokens } from "@shipfast/db"
import { loginSchema, registerSchema } from "@shipfast/shared"
import crypto from "crypto"

export default async function authRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post("/register", async (request, reply) => {
    const body = registerSchema.parse(request.body)

    const existing = await fastify.db
      .select()
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1)

    if (existing.length > 0) {
      return reply.code(409).send({ error: "Email already registered" })
    }

    const passwordHash = await bcrypt.hash(body.password, 10)

    const [user] = await fastify.db
      .insert(users)
      .values({
        email: body.email,
        username: body.username,
        passwordHash,
        firstName: body.firstName,
        lastName: body.lastName,
      })
      .returning()

    const accessToken = fastify.jwt.sign({ userId: user.id, role: user.role })
    const refreshToken = crypto.randomUUID()

    await fastify.db.insert(refreshTokens).values({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } }
  })

  // Login
  fastify.post("/login", async (request, reply) => {
    const body = loginSchema.parse(request.body)

    const [user] = await fastify.db
      .select()
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1)

    if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
      return reply.code(401).send({ error: "Invalid credentials" })
    }

    const accessToken = fastify.jwt.sign({ userId: user.id, role: user.role })
    const refreshToken = crypto.randomUUID()

    await fastify.db.insert(refreshTokens).values({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } }
  })

  // Refresh token
  fastify.post("/refresh", async (request, reply) => {
    const { refreshToken: token } = request.body as { refreshToken: string }

    const [existing] = await fastify.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, token))
      .limit(1)

    if (!existing || existing.expiresAt < new Date()) {
      return reply.code(401).send({ error: "Invalid refresh token" })
    }

    // Delete old token (rotation)
    await fastify.db.delete(refreshTokens).where(eq(refreshTokens.token, token))

    const [user] = await fastify.db
      .select()
      .from(users)
      .where(eq(users.id, existing.userId))
      .limit(1)

    if (!user) {
      return reply.code(401).send({ error: "User not found" })
    }

    const accessToken = fastify.jwt.sign({ userId: user.id, role: user.role })
    const newRefreshToken = crypto.randomUUID()

    await fastify.db.insert(refreshTokens).values({
      userId: user.id,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    return { accessToken, refreshToken: newRefreshToken }
  })

  // Logout
  fastify.post("/logout", async (request, reply) => {
    const { refreshToken: token } = request.body as { refreshToken: string }
    await fastify.db.delete(refreshTokens).where(eq(refreshTokens.token, token))
    return { success: true }
  })
}
