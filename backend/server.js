import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { connectDB } from "./config/db.js"
import authRoutes from "./routes/auth.js"
import serviceRoutes from "./routes/services.js"
import bookingRoutes from "./routes/bookings.js"
import paymentRoutes from "./routes/payments.js"
import errorHandler from "./middleware/errorHandler.js"
import logger from "./middleware/logger.js"

dotenv.config()

const app = express()

// Connect to MongoDB
await connectDB()

// Middleware
app.use(cors())
app.use(express.json())
app.use(logger)

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/services", serviceRoutes)
app.use("/api/bookings", bookingRoutes)
app.use("/api/payments", paymentRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running" })
})

// Error handling
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
