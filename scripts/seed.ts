import "dotenv/config"
import { createDb, users, items } from "@shipfast/db"
import bcrypt from "bcryptjs"

const db = createDb(process.env.DATABASE_URL!)

async function seed() {
  console.log("Seeding database...")

  // Create demo user
  const passwordHash = await bcrypt.hash("password123", 10)

  const [user] = await db
    .insert(users)
    .values({
      email: "demo@shipfast.dev",
      username: "demo",
      passwordHash,
      firstName: "Demo",
      lastName: "User",
      role: "admin",
    })
    .onConflictDoNothing()
    .returning()

  if (user) {
    console.log(`Created user: ${user.email}`)

    // Create sample items
    await db.insert(items).values([
      { name: "First item", description: "This is a sample item", userId: user.id },
      { name: "Second item", description: "Another sample item", userId: user.id },
    ])
    console.log("Created sample items")
  } else {
    console.log("Demo user already exists, skipping")
  }

  console.log("Seed complete!")
  process.exit(0)
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
