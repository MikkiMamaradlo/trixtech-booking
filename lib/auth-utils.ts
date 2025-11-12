import bcrypt from "bcryptjs"
import { getDatabase } from "./db"
import type { User } from "./models"

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const db = await getDatabase()
    const user = await db.collection("users").findOne({ email })
    return user as User | null
  } catch (error) {
    console.error("Error fetching user by email:", error)
    return null
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const db = await getDatabase()
    const { ObjectId } = await import("mongodb")
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })
    return user as User | null
  } catch (error) {
    console.error("Error fetching user by ID:", error)
    return null
  }
}

export async function createUser(userData: Omit<User, "_id" | "createdAt" | "updatedAt">): Promise<User | null> {
  try {
    const db = await getDatabase()
    const hashedPassword = await hashPassword(userData.password)

    const result = await db.collection("users").insertOne({
      ...userData,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return {
      ...userData,
      _id: result.insertedId.toString(),
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}

export function sanitizeUser(user: User): Omit<User, "password"> {
  const { password, ...sanitized } = user
  return sanitized
}
