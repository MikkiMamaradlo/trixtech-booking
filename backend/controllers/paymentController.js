import Payment from "../models/Payment.js"
import Booking from "../models/Booking.js"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const createPaymentIntent = async (req, res, next) => {
  try {
    const { bookingId } = req.body
    const booking = await Booking.findById(bookingId)
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalPrice * 100),
      currency: "usd",
      metadata: { bookingId: booking._id.toString() },
    })

    res.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    next(error)
  }
}

export const confirmPayment = async (req, res, next) => {
  try {
    const { bookingId, stripePaymentId } = req.body
    const booking = await Booking.findById(bookingId)
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    const payment = await Payment.create({
      bookingId,
      customerId: req.user.id,
      amount: booking.totalPrice,
      stripePaymentId,
      status: "completed",
    })

    await Booking.findByIdAndUpdate(bookingId, { paymentStatus: "paid", status: "confirmed" })

    res.json({ message: "Payment confirmed", payment })
  } catch (error) {
    next(error)
  }
}

export const getPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ customerId: req.user.id })
    res.json(payments)
  } catch (error) {
    next(error)
  }
}
