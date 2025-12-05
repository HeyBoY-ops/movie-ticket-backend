import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { getMovies, getMovie, createMovie, updateMovie, deleteMovie } from "../controllers/movieController.js";

const router = express.Router();

/* ------------------------- HELPERS ------------------------- */


/* ------------------------- GET ALL MOVIES ------------------------- */
router.get("/", getMovies);

/* ------------------------- GET MOVIE BY ID ------------------------- */
router.get("/:id", getMovie);

/* ------------------------- CREATE MOVIE ------------------------- */
router.post("/", authMiddleware, adminMiddleware, createMovie);

/* ------------------------- UPDATE MOVIE ------------------------- */
router.put("/:id", authMiddleware, adminMiddleware, updateMovie);

/* ------------------------- DELETE MOVIE ------------------------- */
router.delete("/:id", authMiddleware, adminMiddleware, deleteMovie);

export default router;
