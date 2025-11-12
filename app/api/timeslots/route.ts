import { NextResponse } from "next/server"
import { withAdminAuth, withAuth, type AuthenticatedRequest } from "@/lib/auth-middleware"
import { getDatabase } from "@/lib/db"

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const db = await getDatabase()
    const { searchParams } = new URL(req.url)

    const serviceId = searchParams.get("serviceId")
    const date = searchParams.get("date")
    const available = searchParams.get("available")

    const query: any = {}
    if (serviceId) query.serviceId = serviceId
    if (date) {
      const dateObj = new Date(date)
      const nextDay = new Date(dateObj)
      nextDay.setDate(nextDay.getDate() + 1)
      query.date = { $gte: dateObj, $lt: nextDay }
    }
    if (available !== null) query.available = available === "true"

    const timeslots = await db.collection("timeslots").find(query).sort({ date: 1, startTime: 1 }).toArray()

    return NextResponse.json({ timeslots }, { status: 200 })
  } catch (error) {
    console.error("Get timeslots error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

export const POST = withAdminAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json()
    const { serviceId, date, startTime, endTime } = body

    // Validate required fields
    if (!serviceId || !date || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const timeRegex = /^\d{2}:\d{2}$/
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json({ error: "Invalid time format (use HH:mm)" }, { status: 400 })
    }

    const db = await getDatabase()
    const result = await db.collection("timeslots").insertOne({
      serviceId,
      date: new Date(date),
      startTime,
      endTime,
      available: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json(
      {
        message: "Time slot created successfully",
        timeslot: {
          _id: result.insertedId,
          serviceId,
          date: new Date(date),
          startTime,
          endTime,
          available: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create timeslot error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
