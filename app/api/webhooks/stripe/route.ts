import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"
import stripe from "@/lib/stripe"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ""

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get("stripe-signature") || ""

    let event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message)
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    const db = await getDatabase()

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object
        const bookingId = paymentIntent.metadata?.bookingId

        if (bookingId) {
          await db.collection("bookings").updateOne(
            { _id: new ObjectId(bookingId) },
            {
              $set: {
                paymentStatus: "completed",
                status: "confirmed",
                stripePaymentId: paymentIntent.id,
                updatedAt: new Date(),
              },
            },
          )
        }
        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object
        const bookingId = paymentIntent.metadata?.bookingId

        if (bookingId) {
          await db.collection("bookings").updateOne(
            { _id: new ObjectId(bookingId) },
            {
              $set: {
                paymentStatus: "failed",
                updatedAt: new Date(),
              },
            },
          )
        }
        break
      }

      case "charge.refunded": {
        const charge = event.data.object
        const paymentIntentId = charge.payment_intent

        const booking = await db.collection("bookings").findOne({ stripePaymentId: paymentIntentId })

        if (booking) {
          // Free up the timeslot
          await db
            .collection("timeslots")
            .updateOne({ _id: new ObjectId(booking.timeSlotId) }, { $set: { available: true, updatedAt: new Date() } })

          // Update booking status
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
        break
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
