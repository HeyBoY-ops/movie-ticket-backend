import express from "express";
import { prisma } from "../server.js";

const router = express.Router();

/* ------------------------- HELPERS ------------------------- */

const safeNumber = (value) => {
  const n = Number(value);
  return isNaN(n) ? null : n;
};

/* ------------------------- GET ALL MOVIES ------------------------- */
router.get("/", async (req, res) => {
  try {
    const movies = await prisma.movie.findMany({
      orderBy: { id: "desc" },
    });

    res.status(200).json({ movies });
  } catch (err) {
    console.error("GET /movies error:", err);
    res.status(500).json({ error: "Failed to fetch movies" });
  }
});

/* ------------------------- GET MOVIE BY ID ------------------------- */
router.get("/:id", async (req, res) => {
  const id = safeNumber(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid movie ID" });

  try {
    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        shows: true,
      },
    });

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    res.status(200).json(movie);
  } catch (err) {
    console.error("GET /movies/:id error:", err);
    res.status(500).json({ error: "Failed to fetch movie" });
  }
});

/* ------------------------- CREATE MOVIE ------------------------- */
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      genre,
      language,
      duration,
      rating,
      poster_url,
      trailer_url,
      release_date,
      director,
      cast,
    } = req.body;

    console.log("POST MOVIE HIT");

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const movie = await prisma.movie.create({
      data: {
        title,
        description,
        language,
        poster_url,
        trailer_url,
        director,

        // FIX: convert arrays to strings
        genre: Array.isArray(genre) ? genre.join(", ") : genre,
        cast: Array.isArray(cast) ? cast.join(", ") : cast,

        duration: duration ? Number(duration) : null,
        rating: rating ? Number(rating) : null,
        release_date: release_date ? new Date(release_date) : null,
      },
    });

    res.status(201).json(movie);
  } catch (err) {
    console.error("POST /movies error:", err);
    res.status(500).json({ error: "Failed to create movie" });
  }
});


/* ------------------------- UPDATE MOVIE ------------------------- */
router.put("/:id", async (req, res) => {
  const id = safeNumber(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid movie ID" });

  try {
    const data = { ...req.body };

    // Convert arrays → strings
    if (Array.isArray(data.genre)) data.genre = data.genre.join(", ");
    if (Array.isArray(data.cast)) data.cast = data.cast.join(", ");

    if (data.duration) data.duration = Number(data.duration);
    if (data.rating) data.rating = Number(data.rating);
    if (data.release_date) data.release_date = new Date(data.release_date);

    const movie = await prisma.movie.update({
      where: { id },
      data,
    });

    res.status(200).json(movie);
  } catch (err) {
    console.error("PUT /movies/:id error:", err);

    if (err.code === "P2025")
      return res.status(404).json({ error: "Movie not found" });

    res.status(500).json({ error: "Failed to update movie" });
  }
});


/* ------------------------- DELETE MOVIE ------------------------- */
router.delete("/:id", async (req, res) => {
  const id = safeNumber(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid movie ID" });

  try {
    await prisma.movie.delete({
      where: { id },
    });

    res.json({ message: "Movie deleted" });
  } catch (err) {
    console.error("DELETE /movies/:id error:", err);

    if (err.code === "P2025") {
      return res.status(404).json({ error: "Movie not found" });
    }

    res.status(500).json({ error: "Failed to delete movie" });
  }
});

export default router;
