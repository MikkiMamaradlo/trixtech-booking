import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, type JWTPayload } from "./jwt"

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload
}

export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      const authHeader = req.headers.get("authorization")
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 })
      }

      const token = authHeader.substring(7)

      if (!token || token.trim() === "") {
        return NextResponse.json({ error: "Token cannot be empty" }, { status: 401 })
      }

      const payload = verifyToken(token)

      if (!payload) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
      }
      ;(req as AuthenticatedRequest).user = payload
      return handler(req as AuthenticatedRequest)
    } catch (error) {
      console.error("Auth middleware error:", error)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }
  }
}

export function withAdminAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return withAuth(async (req: AuthenticatedRequest) => {
    if (req.user?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }
    return handler(req)
  })
}
