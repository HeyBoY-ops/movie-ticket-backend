import express from "express";
import { getTheaters, createTheater, updateTheater, deleteTheater } from "../controllers/theaterController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", getTheaters);
router.post("/", authMiddleware, adminMiddleware, createTheater);
router.put("/:id", authMiddleware, adminMiddleware, updateTheater);
router.delete("/:id", authMiddleware, adminMiddleware, deleteTheater);

export default router;
