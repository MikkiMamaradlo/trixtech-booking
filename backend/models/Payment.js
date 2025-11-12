import mongoose from "mongoose"

const paymentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["stripe", "paypal"], default: "stripe" },
    stripePaymentId: { type: String },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  },
  { timestamps: true },
)

export default mongoose.model("Payment", paymentSchema)
