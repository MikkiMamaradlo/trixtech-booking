import { NextResponse } from "next/server"
import { withAdminAuth, type AuthenticatedRequest } from "@/lib/auth-middleware"
import { getDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

interface RouteParams {
  params: { reviewId: string }
}

export const PUT = withAdminAuth(async (req: AuthenticatedRequest, { params }: RouteParams) => {
  try {
    const db = await getDatabase()

    const result = await db.collection("reviews").findOneAndUpdate(
      { _id: new ObjectId(params.reviewId) },
      {
        $set: {
          approved: true,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    if (!result.value) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    await db.collection("adminlogs").insertOne({
      adminId: new ObjectId(req.user!.userId),
      action: "APPROVE_REVIEW",
      description: `Approved review ${params.reviewId}`,
      targetId: params.reviewId,
      createdAt: new Date(),
    })

    return NextResponse.json({ message: "Review approved successfully", review: result.value }, { status: 200 })
  } catch (error) {
    console.error("Approve review error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

export const DELETE = withAdminAuth(async (req: AuthenticatedRequest, { params }: RouteParams) => {
  try {
    const db = await getDatabase()

    const result = await db.collection("reviews").deleteOne({ _id: new ObjectId(params.reviewId) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    await db.collection("adminlogs").insertOne({
      adminId: new ObjectId(req.user!.userId),
      action: "DELETE_REVIEW",
      description: `Deleted review ${params.reviewId}`,
      targetId: params.reviewId,
      createdAt: new Date(),
    })

    return NextResponse.json({ message: "Review deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Delete review error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
