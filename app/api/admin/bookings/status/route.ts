import { NextResponse } from "next/server"
import { withAdminAuth, type AuthenticatedRequest } from "@/lib/auth-middleware"
import { getDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

export const PUT = withAdminAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json()
    const { bookingId, status } = body

    // Validate status
    const validStatuses = ["pending", "confirmed", "completed", "cancelled"]
    if (!bookingId || !status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid booking ID or status" }, { status: 400 })
    }

    const db = await getDatabase()

    const result = await db.collection("bookings").findOneAndUpdate(
      { _id: new ObjectId(bookingId) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    if (!result.value) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    await db.collection("adminlogs").insertOne({
      adminId: new ObjectId(req.user!.userId),
      action: "UPDATE_BOOKING_STATUS",
      description: `Updated booking ${bookingId} status to ${status}`,
      targetId: bookingId,
      createdAt: new Date(),
    })

    return NextResponse.json({ message: "Booking status updated successfully", booking: result.value }, { status: 200 })
  } catch (error) {
    console.error("Update booking status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
