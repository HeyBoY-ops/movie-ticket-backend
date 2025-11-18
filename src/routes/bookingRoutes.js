import express from "express";
import {
  createBooking,
  getBookings,
  cancelBooking,
  getBooking,
} from "../controllers/bookingController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createBooking);
router.get("/", authMiddleware, getBookings);
router.get("/:id", authMiddleware, getBooking);
router.post("/:id/cancel", authMiddleware, cancelBooking);

export default router;
