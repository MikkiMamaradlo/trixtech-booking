import { NextResponse } from "next/server"
import { withAdminAuth, type AuthenticatedRequest } from "@/lib/auth-middleware"
import { getDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"
import stripe from "@/lib/stripe"

export const POST = withAdminAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json()
    const { paymentId, reason } = body

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 })
    }

    const db = await getDatabase()

    const payment = await db.collection("payments").findOne({ _id: new ObjectId(paymentId) })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      reason: (reason as any) || "requested_by_customer",
    })

    // Update payment status
    await db.collection("payments").updateOne(
      { _id: new ObjectId(paymentId) },
      {
        $set: {
          status: "refunded",
          updatedAt: new Date(),
        },
      },
    )

    // Free up timeslot
    const booking = await db.collection("bookings").findOne({ _id: new ObjectId(payment.bookingId) })

    if (booking) {
      await db
        .collection("timeslots")
        .updateOne({ _id: new ObjectId(booking.timeSlotId) }, { $set: { available: true, updatedAt: new Date() } })

      await db.collection("bookings").updateOne(
        { _id: booking._id },
        {
          $set: {
            status: "cancelled",
            paymentStatus: "refunded",
            updatedAt: new Date(),
          },
        },
      )
    }

    return NextResponse.json(
      {
        message: "Refund processed successfully",
        refund,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Refund error:", error)
    return NextResponse.json({ error: "Failed to process refund" }, { status: 500 })
  }
})
