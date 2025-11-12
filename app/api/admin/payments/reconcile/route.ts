import { NextResponse } from "next/server"
import { withAdminAuth, type AuthenticatedRequest } from "@/lib/auth-middleware"
import { getDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

export const POST = withAdminAuth(async (req: AuthenticatedRequest) => {
  try {
    const db = await getDatabase()

    const result = await db.collection("payments").updateMany(
      { status: "pending" },
      {
        $set: {
          status: "processing",
          updatedAt: new Date(),
        },
      },
    )

    await db.collection("adminlogs").insertOne({
      adminId: new ObjectId(req.user!.userId),
      action: "PAYMENT_RECONCILIATION",
      description: `Reconciled ${result.modifiedCount} pending payments`,
      createdAt: new Date(),
    })

    return NextResponse.json(
      {
        message: "Payments reconciled successfully",
        processed: result.modifiedCount,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Payment reconciliation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
