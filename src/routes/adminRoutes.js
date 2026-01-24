import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminCheck.js";
import { verifyEntity, banUser, removeContent } from "../controllers/adminController.js";

const router = express.Router();

// All routes require Admin privileges
router.use(authMiddleware, requireAdmin);

router.post("/verify", verifyEntity);
router.post("/ban", banUser);
router.post("/content/remove", removeContent);

export default router;
