import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
// import { adminMiddleware } from "../middleware/adminMiddleware.js"; 
// ^ Replaced by verifyRole
import { verifyRole } from "../middleware/verifyRole.js";
import { getMovies, getMovie, createMovie, updateMovie, deleteMovie } from "../controllers/movieController.js";

const router = express.Router();

/* ------------------------- HELPERS ------------------------- */


/* ------------------------- GET ALL MOVIES ------------------------- */
router.get("/", getMovies);

/* ------------------------- GET MOVIE BY ID ------------------------- */
router.get("/:id", getMovie);

/* ------------------------- CREATE MOVIE ------------------------- */
router.post("/", authMiddleware, verifyRole(["ADMIN", "ORGANIZATION"]), createMovie);

/* ------------------------- UPDATE MOVIE ------------------------- */
router.put("/:id", authMiddleware, verifyRole(["ADMIN", "ORGANIZATION"]), updateMovie);

/* ------------------------- DELETE MOVIE ------------------------- */
router.delete("/:id", authMiddleware, verifyRole(["ADMIN", "ORGANIZATION"]), deleteMovie);

export default router;
