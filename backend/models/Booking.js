import mongoose from "mongoose"

const bookingSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    bookingDate: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    notes: { type: String },
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
    totalPrice: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
  },
  { timestamps: true },
)

export default mongoose.model("Booking", bookingSchema)
