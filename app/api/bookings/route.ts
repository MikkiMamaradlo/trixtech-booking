import { NextResponse } from "next/server"
import { withAuth, type AuthenticatedRequest } from "@/lib/auth-middleware"
import { getDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const db = await getDatabase()
    const { searchParams } = new URL(req.url)

    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Number.parseInt(searchParams.get("limit") || "10", 10))
    const status = searchParams.get("status")

    const query: any = {}
    if (req.user!.role !== "admin") {
      query.userId = req.user!.userId
    }
    if (status) query.status = status

    const total = await db.collection("bookings").countDocuments(query)
    const bookings = await db
      .collection("bookings")
      .find(query)
      .sort({ bookingDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    return NextResponse.json(
      {
        bookings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Get bookings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json()
    const { serviceId, timeSlotId, notes } = body

    // Validate required fields
    if (!serviceId || !timeSlotId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()

    const service = await db.collection("services").findOne({ _id: new ObjectId(serviceId) })
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    const timeslot = await db.collection("timeslots").findOne({ _id: new ObjectId(timeSlotId) })
    if (!timeslot || !timeslot.available) {
      return NextResponse.json({ error: "Time slot not available" }, { status: 400 })
    }

    const result = await db.collection("bookings").insertOne({
      userId: req.user!.userId,
      serviceId,
      timeSlotId,
      status: "pending",
      bookingDate: timeslot.date,
      notes: notes || "",
      totalPrice: service.price,
      paymentStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Update timeslot availability
    await db
      .collection("timeslots")
      .updateOne({ _id: new ObjectId(timeSlotId) }, { $set: { available: false, updatedAt: new Date() } })

    return NextResponse.json(
      {
        message: "Booking created successfully",
        booking: {
          _id: result.insertedId,
          userId: req.user!.userId,
          serviceId,
          timeSlotId,
          status: "pending",
          bookingDate: timeslot.date,
          notes,
          totalPrice: service.price,
          paymentStatus: "pending",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create booking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
