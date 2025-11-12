import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = process.env.MONGODB_DB_NAME || "trixtech"

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db(DB_NAME)

    console.log("[v0] Seeding TRIXTECH database...")

    // Hash passwords
    const adminPassword = await bcrypt.hash("admin123", 10)
    const customerPassword = await bcrypt.hash("customer123", 10)

    // Clear existing data
    await db.collection("users").deleteMany({})
    await db.collection("services").deleteMany({})
    await db.collection("timeslots").deleteMany({})
    await db.collection("bookings").deleteMany({})
    await db.collection("payments").deleteMany({})
    await db.collection("reviews").deleteMany({})
    await db.collection("adminlogs").deleteMany({})

    // Create admin user
    const adminResult = await db.collection("users").insertOne({
      email: "admin@trixtech.com",
      password: adminPassword,
      firstName: "Admin",
      lastName: "User",
      phone: "+1234567890",
      role: "admin",
      bio: "System Administrator",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const adminId = adminResult.insertedId

    // Create sample customer users
    const customersResult = await db.collection("users").insertMany([
      {
        email: "john@example.com",
        password: customerPassword,
        firstName: "John",
        lastName: "Doe",
        phone: "+1111111111",
        role: "customer",
        bio: "Regular customer",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "jane@example.com",
        password: customerPassword,
        firstName: "Jane",
        lastName: "Smith",
        phone: "+2222222222",
        role: "customer",
        bio: "Loyal customer",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    // Create sample services
    const servicesResult = await db.collection("services").insertMany([
      {
        name: "Basic Haircut",
        description: "Professional haircut for men and women",
        category: "Hair",
        price: 25,
        duration: 30,
        available: true,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Beard Trim",
        description: "Professional beard grooming",
        category: "Grooming",
        price: 15,
        duration: 20,
        available: true,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Hair Coloring",
        description: "Professional hair coloring service",
        category: "Hair",
        price: 60,
        duration: 90,
        available: true,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Massage - 60 min",
        description: "Full body relaxation massage",
        category: "Wellness",
        price: 80,
        duration: 60,
        available: true,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    console.log("[v0] Database seeding completed successfully")
    console.log("[v0] Admin user: admin@trixtech.com / admin123")
    console.log("[v0] Customer users: john@example.com / customer123, jane@example.com / customer123")
  } catch (error) {
    console.error("[v0] Database seeding error:", error)
    throw error
  } finally {
    await client.close()
  }
}

seedDatabase()
