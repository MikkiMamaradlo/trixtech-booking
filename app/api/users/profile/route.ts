import { NextResponse } from "next/server"
import { withAuth, type AuthenticatedRequest } from "@/lib/auth-middleware"
import { getUserById, sanitizeUser } from "@/lib/auth-utils"
import { getDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

async function getHandler(req: AuthenticatedRequest) {
  try {
    const user = await getUserById(req.user!.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const sanitized = sanitizeUser(user)
    return NextResponse.json(sanitized, { status: 200 })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function updateHandler(req: AuthenticatedRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, phone, bio, profilePicture } = body

    // Validate input
    if (firstName && typeof firstName !== "string") {
      return NextResponse.json({ error: "Invalid firstName" }, { status: 400 })
    }

    const db = await getDatabase()
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (firstName) updateData.firstName = firstName
    if (lastName) updateData.lastName = lastName
    if (phone) updateData.phone = phone
    if (bio !== undefined) updateData.bio = bio
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture

    const result = await db
      .collection("users")
      .findOneAndUpdate({ _id: new ObjectId(req.user!.userId) }, { $set: updateData }, { returnDocument: "after" })

    if (!result.value) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const sanitized = sanitizeUser(result.value)
    return NextResponse.json({ message: "Profile updated successfully", user: sanitized }, { status: 200 })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getHandler)
export const PUT = withAuth(updateHandler)
