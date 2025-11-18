import express from "express";
import {
  getTheaters,
  createTheater,
  updateTheater,
  deleteTheater,
} from "../controllers/theaterController.js";

const router = express.Router();

router.get("/", getTheaters);
router.post("/", createTheater);
router.put("/:id", updateTheater);
router.delete("/:id", deleteTheater);

export default router;
