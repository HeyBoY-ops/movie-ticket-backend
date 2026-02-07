import prisma from "../config/db.js";
import { createMovie as createMovieService } from "../services/movieService.js";

export const getMovies = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      genre = "",
      language = "",
      category = "",
      sort_by = "release_date",
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const where = {};

    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    if (genre) {
      // Prisma Mongo: For String[] use 'has'. 'mode: insensitive' is not supported for 'has',
      // so we rely on frontend sending correct casing (Title Case).
      where.genre = { has: genre };
    }

    if (language) {
      where.language = { equals: language, mode: "insensitive" };
    }

    if (category) {
      where.category = { equals: category, mode: "insensitive" };
    }

    if (req.query.ownerId) {
      where.ownerId = req.query.ownerId;
    }

    let orderBy = {};
    switch (sort_by) {
      case "rating":
        orderBy = { rating: "desc" };
        break;
      case "title":
        orderBy = { title: "asc" };
        break;
      case "release_date":
      default:
        orderBy = { releaseDate: "desc" };
        break;
    }

    const [movies, total] = await Promise.all([
      prisma.movie.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy,
      }),
      prisma.movie.count({ where }),
    ]);

    res.json({
      movies,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
    });
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).json({ error: "Failed to fetch movies" });
  }
};

export const getMovie = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Invalid movie ID" });

    const movie = await prisma.movie.findUnique({
      where: { id },
      include: { shows: true },
    });

    if (!movie) return res.status(404).json({ error: "Movie not found" });

    res.status(200).json(movie);
  } catch (error) {
    console.error("Error fetching movie:", error);
    res.status(500).json({ error: "Failed to fetch movie" });
  }
};

// ADD MOVIE (Organization Only)
export const addMovie = async (req, res) => {
  try {
    const newMovie = await createMovieService(req.body, req.user.id);
    res.status(201).json(newMovie);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Movie (Legacy/Public? Keeping for compatibility if needed, but addMovie is the new one)
// Ideally we replace createMovie with addMovie or keep them distinct. 
// For this architecture, addMovie IS createMovie.
export const createMovie = addMovie;

export const updateMovie = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Invalid movie ID" });

    // Check ownership if user is ORGANIZATION
    if (req.user.role === "ORGANIZATION") {
      const movie = await prisma.movie.findUnique({ where: { id } });
      if (!movie) return res.status(404).json({ error: "Movie not found" });

      if (movie.ownerId !== req.user.id) {
        return res.status(403).json({ error: "You are not authorized to update this movie" });
      }
    }

    const data = { ...req.body };
    // Ensure genre is array
    if (data.genre) {
      data.genre = Array.isArray(data.genre) ? data.genre : [data.genre];
    }
    // Cast is Json, but let's keep it as array if passed as such
    if (data.cast && !Array.isArray(data.cast)) {
      data.cast = [data.cast];
    }

    if (data.duration) data.duration = Number(data.duration);
    if (data.rating) data.rating = Number(data.rating);
    if (data.release_date) {
      data.releaseDate = new Date(data.release_date);
      delete data.release_date;
    }

    const updatedMovie = await prisma.movie.update({ where: { id }, data });
    res.status(200).json(updatedMovie);
  } catch (error) {
    console.error("Error updating movie:", error);
    if (error.code === "P2025") return res.status(404).json({ error: "Movie not found" });
    res.status(500).json({ error: "Failed to update movie" });
  }
};

export const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Invalid movie ID" });

    // Check if movie exists
    const movie = await prisma.movie.findUnique({
      where: { id },
      include: { shows: true },
    });

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    // Check ownership if user is ORGANIZATION
    if (req.user.role === "ORGANIZATION" && movie.ownerId !== req.user.id) {
      return res.status(403).json({ error: "You are not authorized to delete this movie" });
    }

    // Delete all associated shows and bookings first (cascade delete)
    if (movie.shows && movie.shows.length > 0) {
      // Delete all bookings for these shows
      const showIds = movie.shows.map((show) => show.id);
      await prisma.booking.deleteMany({
        where: { showId: { in: showIds } },
      });

      // Delete all shows
      await prisma.show.deleteMany({
        where: { movieId: id },
      });
    }

    // Now delete the movie
    await prisma.movie.delete({ where: { id } });
    res.status(200).json({ message: "Movie deleted successfully" });
  } catch (error) {
    console.error("Error deleting movie:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Movie not found" });
    }
    res.status(500).json({ error: error.message || "Failed to delete movie" });
  }
};
