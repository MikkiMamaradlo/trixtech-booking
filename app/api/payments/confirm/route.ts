import { NextResponse } from "next/server"
import { withAuth, type AuthenticatedRequest } from "@/lib/auth-middleware"
import { getDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"
import stripe from "@/lib/stripe"

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json()
    const { paymentIntentId, bookingId } = body

    if (!paymentIntentId || !bookingId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json({ error: "Payment was not successful" }, { status: 400 })
    }

    // Update booking status to confirmed
    const result = await db.collection("bookings").findOneAndUpdate(
      { _id: new ObjectId(bookingId), userId: req.user!.userId },
      {
        $set: {
          paymentStatus: "completed",
          status: "confirmed",
          stripePaymentId: paymentIntentId,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    if (!result.value) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Log payment in payments collection
    await db.collection("payments").insertOne({
      bookingId,
      userId: req.user!.userId,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      stripePaymentIntentId: paymentIntentId,
      status: "succeeded",
      paymentMethod: "stripe",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json(
      {
        message: "Payment confirmed successfully",
        booking: result.value,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Payment confirmation error:", error)
    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 })
  }
})
