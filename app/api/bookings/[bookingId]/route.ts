import { NextResponse } from "next/server"
import { withAuth, type AuthenticatedRequest } from "@/lib/auth-middleware"
import { getDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

interface RouteParams {
  params: { bookingId: string }
}

export const GET = withAuth(async (req: AuthenticatedRequest, { params }: RouteParams) => {
  try {
    const db = await getDatabase()
    const booking = await db.collection("bookings").findOne({ _id: new ObjectId(params.bookingId) })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (req.user!.userId !== booking.userId && req.user!.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(booking, { status: 200 })
  } catch (error) {
    console.error("Get booking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

export const PUT = withAuth(async (req: AuthenticatedRequest, { params }: RouteParams) => {
  try {
    const body = await req.json()
    const { status, notes } = body

    const db = await getDatabase()
    const booking = await db.collection("bookings").findOne({ _id: new ObjectId(params.bookingId) })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (req.user!.userId !== booking.userId && req.user!.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const updateData: any = { updatedAt: new Date() }
    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes

    const result = await db
      .collection("bookings")
      .findOneAndUpdate({ _id: new ObjectId(params.bookingId) }, { $set: updateData }, { returnDocument: "after" })

    return NextResponse.json({ message: "Booking updated successfully", booking: result.value }, { status: 200 })
  } catch (error) {
    console.error("Update booking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

export const DELETE = withAuth(async (req: AuthenticatedRequest, { params }: RouteParams) => {
  try {
    const db = await getDatabase()
    const booking = await db.collection("bookings").findOne({ _id: new ObjectId(params.bookingId) })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (req.user!.userId !== booking.userId && req.user!.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await db
      .collection("bookings")
      .updateOne({ _id: new ObjectId(params.bookingId) }, { $set: { status: "cancelled", updatedAt: new Date() } })

    await db
      .collection("timeslots")
      .updateOne({ _id: new ObjectId(booking.timeSlotId) }, { $set: { available: true, updatedAt: new Date() } })

    return NextResponse.json({ message: "Booking cancelled successfully" }, { status: 200 })
  } catch (error) {
    console.error("Cancel booking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
