import { NextResponse } from "next/server"
import { withAuth, type AuthenticatedRequest } from "@/lib/auth-middleware"
import { getUserById, sanitizeUser } from "@/lib/auth-utils"
import { getDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

interface RouteParams {
  params: { userId: string }
}

export const GET = withAuth(async (req: AuthenticatedRequest, { params }: RouteParams) => {
  try {
    const { userId } = params

    if (req.user!.userId !== userId && req.user!.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const sanitized = sanitizeUser(user)
    return NextResponse.json(sanitized, { status: 200 })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

export const DELETE = withAuth(async (req: AuthenticatedRequest, { params }: RouteParams) => {
  try {
    const { userId } = params

    if (req.user!.userId !== userId && req.user!.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const db = await getDatabase()
    const result = await db.collection("users").deleteOne({ _id: new ObjectId(userId) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    await db.collection("bookings").deleteMany({ userId })
    await db.collection("reviews").deleteMany({ userId })

    return NextResponse.json({ message: "User account deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
