import express from "express";
import { getOrgStats } from "../controllers/dashboardController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get Organization Stats (Revenue, Occupancy, etc.)
router.get("/org-stats", authMiddleware, getOrgStats);

export default router;
