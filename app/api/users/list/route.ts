import { NextResponse } from "next/server"
import { withAdminAuth, type AuthenticatedRequest } from "@/lib/auth-middleware"
import { getDatabase } from "@/lib/db"

export const GET = withAdminAuth(async (req: AuthenticatedRequest) => {
  try {
    const db = await getDatabase()
    const { searchParams } = new URL(req.url)

    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Number.parseInt(searchParams.get("limit") || "10", 10))
    const role = searchParams.get("role")
    const search = searchParams.get("search")

    const query: any = {}
    if (role) query.role = role
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ]
    }

    const total = await db.collection("users").countDocuments(query)
    const users = await db
      .collection("users")
      .find(query)
      .project({ password: 0 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    return NextResponse.json(
      {
        users,
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
    console.error("List users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
