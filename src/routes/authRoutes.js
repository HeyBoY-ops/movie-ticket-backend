import express from "express";
import { signup, login, me, registerOrganization } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/register-org", registerOrganization);
router.get("/me", authMiddleware, me);

export default router;
