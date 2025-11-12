import { NextResponse } from "next/server"
import { withAdminAuth, type AuthenticatedRequest } from "@/lib/auth-middleware"
import { getDatabase } from "@/lib/db"

export const GET = withAdminAuth(async (req: AuthenticatedRequest) => {
  try {
    const db = await getDatabase()
    const startTime = Date.now()

    await db.admin().ping()
    const dbLatency = Date.now() - startTime

    const collections = await db.listCollections().toArray()
    const collectionStats = await Promise.all(
      collections.map(async (col) => {
        const count = await db.collection(col.name).countDocuments()
        return { name: col.name, count }
      }),
    )

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date(),
        database: {
          connected: true,
          latency: `${dbLatency}ms`,
          collections: collectionStats,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date(),
        error: "Database connection failed",
      },
      { status: 500 },
    )
  }
})
