import mongoose from "mongoose"

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true }, // in minutes
    image: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export default mongoose.model("Service", serviceSchema)
