import express from "express";
import {
  holdSeat,
  confirmBooking,
  getShowSeatStatus,
  createEventBooking,
  getBookings,
  cancelBooking,
  getBooking,
} from "../controllers/bookingController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/hold", authMiddleware, holdSeat);
router.post("/confirm", authMiddleware, confirmBooking);
router.get("/status/:showId", getShowSeatStatus); // Public or Auth? Usually Public is fine for checking seats

router.post("/event", authMiddleware, createEventBooking);
router.get("/", authMiddleware, getBookings);
router.get("/:id", authMiddleware, getBooking);
router.post("/:id/cancel", authMiddleware, cancelBooking);

export default router;
