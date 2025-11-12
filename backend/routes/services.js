import express from "express"
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from "../controllers/serviceController.js"
import { authenticate, authorize } from "../middleware/auth.js"

const router = express.Router()

router.get("/", getAllServices)
router.get("/:id", getServiceById)
router.post("/", authenticate, authorize(["admin"]), createService)
router.put("/:id", authenticate, authorize(["admin"]), updateService)
router.delete("/:id", authenticate, authorize(["admin"]), deleteService)

export default router
