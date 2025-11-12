import { NextResponse } from "next/server"
import { withAuth, type AuthenticatedRequest } from "@/lib/auth-middleware"
import { getUserById, sanitizeUser } from "@/lib/auth-utils"

async function handler(req: AuthenticatedRequest) {
  try {
    const user = await getUserById(req.user!.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const sanitized = sanitizeUser(user)
    return NextResponse.json({ message: "Token is valid", user: sanitized }, { status: 200 })
  } catch (error) {
    console.error("Verify error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const POST = withAuth(handler)
