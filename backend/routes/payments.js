import express from "express"
import { createPaymentIntent, confirmPayment, getPayments } from "../controllers/paymentController.js"
import { authenticate } from "../middleware/auth.js"

const router = express.Router()

router.post("/create-intent", authenticate, createPaymentIntent)
router.post("/confirm", authenticate, confirmPayment)
router.get("/", authenticate, getPayments)

export default router
