import express from "express";
import {
  createBooking,
  createEventBooking,
  getBookings,
  cancelBooking,
  getBooking,
} from "../controllers/bookingController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createBooking);
router.post("/event", authMiddleware, createEventBooking);
router.get("/", authMiddleware, getBookings);
router.get("/:id", authMiddleware, getBooking);
router.post("/:id/cancel", authMiddleware, cancelBooking);

export default router;
