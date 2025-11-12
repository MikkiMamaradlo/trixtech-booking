import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = process.env.MONGODB_DB_NAME || "trixtech"

async function initializeDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db(DB_NAME)

    console.log("[v0] Initializing TRIXTECH database...")

    // Create collections with validation schemas
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    // Users collection
    if (!collectionNames.includes("users")) {
      await db.createCollection("users", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["email", "password", "firstName", "lastName", "role", "createdAt"],
            properties: {
              email: { bsonType: "string", pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" },
              password: { bsonType: "string" },
              firstName: { bsonType: "string" },
              lastName: { bsonType: "string" },
              phone: { bsonType: "string" },
              role: { enum: ["customer", "admin"] },
              profilePicture: { bsonType: "string" },
              bio: { bsonType: "string" },
              createdAt: { bsonType: "date" },
              updatedAt: { bsonType: "date" },
            },
          },
        },
      })
      await db.collection("users").createIndex({ email: 1 }, { unique: true })
      console.log("[v0] Created users collection")
    }

    // Services collection
    if (!collectionNames.includes("services")) {
      await db.createCollection("services", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["name", "category", "price", "duration", "createdBy"],
            properties: {
              name: { bsonType: "string" },
              description: { bsonType: "string" },
              category: { bsonType: "string" },
              price: { bsonType: "number" },
              duration: { bsonType: "int" },
              image: { bsonType: "string" },
              available: { bsonType: "bool" },
              createdBy: { bsonType: "objectId" },
              createdAt: { bsonType: "date" },
              updatedAt: { bsonType: "date" },
            },
          },
        },
      })
      console.log("[v0] Created services collection")
    }

    // Time Slots collection
    if (!collectionNames.includes("timeslots")) {
      await db.createCollection("timeslots")
      await db.collection("timeslots").createIndex({ serviceId: 1, date: 1 })
      console.log("[v0] Created timeslots collection")
    }

    // Bookings collection
    if (!collectionNames.includes("bookings")) {
      await db.createCollection("bookings")
      await db.collection("bookings").createIndex({ userId: 1 })
      await db.collection("bookings").createIndex({ serviceId: 1 })
      await db.collection("bookings").createIndex({ status: 1 })
      console.log("[v0] Created bookings collection")
    }

    // Payments collection
    if (!collectionNames.includes("payments")) {
      await db.createCollection("payments")
      await db.collection("payments").createIndex({ bookingId: 1 })
      await db.collection("payments").createIndex({ userId: 1 })
      await db.collection("payments").createIndex({ status: 1 })
      console.log("[v0] Created payments collection")
    }

    // Reviews collection
    if (!collectionNames.includes("reviews")) {
      await db.createCollection("reviews")
      await db.collection("reviews").createIndex({ serviceId: 1 })
      await db.collection("reviews").createIndex({ userId: 1 })
      console.log("[v0] Created reviews collection")
    }

    // Admin logs collection
    if (!collectionNames.includes("adminlogs")) {
      await db.createCollection("adminlogs")
      await db.collection("adminlogs").createIndex({ adminId: 1 })
      await db.collection("adminlogs").createIndex({ createdAt: -1 })
      console.log("[v0] Created adminlogs collection")
    }

    console.log("[v0] Database initialization completed successfully")
  } catch (error) {
    console.error("[v0] Database initialization error:", error)
    throw error
  } finally {
    await client.close()
  }
}

initializeDatabase()
