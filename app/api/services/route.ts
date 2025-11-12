import { NextResponse } from "next/server"
import { withAdminAuth, withAuth, type AuthenticatedRequest } from "@/lib/auth-middleware"
import { getDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const db = await getDatabase()
    const { searchParams } = new URL(req.url)

    const category = searchParams.get("category")
    const available = searchParams.get("available")
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Number.parseInt(searchParams.get("limit") || "10", 10))

    const query: any = {}
    if (category) query.category = category
    if (available !== null) query.available = available === "true"

    const total = await db.collection("services").countDocuments(query)
    const services = await db
      .collection("services")
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    return NextResponse.json(
      {
        services,
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
    console.error("Get services error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

export const POST = withAdminAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json()
    const { name, description, category, price, duration, image } = body

    // Validate required fields
    if (!name || !category || !price || !duration) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()
    const result = await db.collection("services").insertOne({
      name,
      description: description || "",
      category,
      price: Number.parseFloat(price),
      duration: Number.parseInt(duration, 10),
      image: image || null,
      available: true,
      createdBy: new ObjectId(req.user!.userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json(
      {
        message: "Service created successfully",
        service: {
          _id: result.insertedId,
          name,
          description,
          category,
          price,
          duration,
          image,
          available: true,
          createdBy: req.user!.userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create service error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
