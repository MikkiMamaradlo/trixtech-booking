import { NextResponse } from "next/server"
import { withAuth, type AuthenticatedRequest } from "@/lib/auth-middleware"
import { getDatabase } from "@/lib/db"

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const db = await getDatabase()
    const { searchParams } = new URL(req.url)

    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Number.parseInt(searchParams.get("limit") || "10", 10))

    const query: any = {}
    if (req.user!.role !== "admin") {
      query.userId = req.user!.userId
    }

    const total = await db.collection("payments").countDocuments(query)
    const payments = await db
      .collection("payments")
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    return NextResponse.json(
      {
        payments,
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
    console.error("Get payments error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
