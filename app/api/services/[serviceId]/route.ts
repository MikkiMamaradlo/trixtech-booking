import { NextResponse } from "next/server"
import { withAdminAuth, withAuth, type AuthenticatedRequest } from "@/lib/auth-middleware"
import { getDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

interface RouteParams {
  params: { serviceId: string }
}

export const GET = withAuth(async (req: AuthenticatedRequest, { params }: RouteParams) => {
  try {
    const db = await getDatabase()
    const service = await db.collection("services").findOne({ _id: new ObjectId(params.serviceId) })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    return NextResponse.json(service, { status: 200 })
  } catch (error) {
    console.error("Get service error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

export const PUT = withAdminAuth(async (req: AuthenticatedRequest, { params }: RouteParams) => {
  try {
    const body = await req.json()
    const { name, description, category, price, duration, image, available } = body

    const db = await getDatabase()
    const updateData: any = { updatedAt: new Date() }

    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (category) updateData.category = category
    if (price !== undefined) updateData.price = Number.parseFloat(price)
    if (duration !== undefined) updateData.duration = Number.parseInt(duration, 10)
    if (image !== undefined) updateData.image = image
    if (available !== undefined) updateData.available = available

    const result = await db
      .collection("services")
      .findOneAndUpdate({ _id: new ObjectId(params.serviceId) }, { $set: updateData }, { returnDocument: "after" })

    if (!result.value) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Service updated successfully", service: result.value }, { status: 200 })
  } catch (error) {
    console.error("Update service error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

export const DELETE = withAdminAuth(async (req: AuthenticatedRequest, { params }: RouteParams) => {
  try {
    const db = await getDatabase()

    const result = await db.collection("services").deleteOne({ _id: new ObjectId(params.serviceId) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    await db.collection("timeslots").deleteMany({ serviceId: params.serviceId })
    await db.collection("bookings").deleteMany({ serviceId: params.serviceId })

    return NextResponse.json({ message: "Service deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Delete service error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
