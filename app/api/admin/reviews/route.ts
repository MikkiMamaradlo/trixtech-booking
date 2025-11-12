import { NextResponse } from "next/server"
import { withAdminAuth, type AuthenticatedRequest } from "@/lib/auth-middleware"
import { getDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

export const GET = withAdminAuth(async (req: AuthenticatedRequest) => {
  try {
    const db = await getDatabase()
    const { searchParams } = new URL(req.url)

    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Number.parseInt(searchParams.get("limit") || "10", 10))
    const serviceId = searchParams.get("serviceId")

    const query: any = {}
    if (serviceId) query.serviceId = new ObjectId(serviceId)

    const total = await db.collection("reviews").countDocuments(query)
    const reviews = await db
      .collection("reviews")
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    return NextResponse.json(
      {
        reviews,
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
    console.error("Get reviews error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
