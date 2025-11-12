import { MongoClient, type Db } from "mongodb"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const mongoUrl = process.env.MONGODB_URI
  if (!mongoUrl) {
    throw new Error("MONGODB_URI is not defined in environment variables")
  }

  try {
    const client = new MongoClient(mongoUrl)
    await client.connect()
    const db = client.db(process.env.MONGODB_DB_NAME || "trixtech")

    cachedClient = client
    cachedDb = db

    return { client, db }
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    throw error
  }
}

export async function getDatabase() {
  const { db } = await connectToDatabase()
  return db
}

export async function closeDatabase() {
  if (cachedClient) {
    await cachedClient.close()
    cachedClient = null
    cachedDb = null
  }
}
