import express from "express";
import { getShows, getShow, createShow, updateShow, deleteShow } from "../controllers/showController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", getShows);
router.get("/:id", getShow);
router.post("/", authMiddleware, adminMiddleware, createShow);
router.put("/:id", authMiddleware, adminMiddleware, updateShow);
router.delete("/:id", authMiddleware, adminMiddleware, deleteShow);

export default router;
