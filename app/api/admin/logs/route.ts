import { NextResponse } from "next/server"
import { withAdminAuth, type AuthenticatedRequest } from "@/lib/auth-middleware"
import { getDatabase } from "@/lib/db"

export const GET = withAdminAuth(async (req: AuthenticatedRequest) => {
  try {
    const db = await getDatabase()
    const { searchParams } = new URL(req.url)

    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Number.parseInt(searchParams.get("limit") || "10", 10))
    const action = searchParams.get("action")
    const adminId = searchParams.get("adminId")

    const query: any = {}
    if (action) query.action = action
    if (adminId) query.adminId = adminId

    const total = await db.collection("adminlogs").countDocuments(query)
    const logs = await db
      .collection("adminlogs")
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    return NextResponse.json(
      {
        logs,
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
    console.error("Get admin logs error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
