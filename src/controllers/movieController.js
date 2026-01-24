import { prisma } from "../server.js";

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
      where.genre = { contains: genre, mode: "insensitive" };
    }

    if (language) {
      where.language = { equals: language, mode: "insensitive" };
    }

    if (category) {
      where.category = { equals: category };
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
        orderBy = { release_date: "desc" }; // Assuming release_date exists, or fall back to created_at
        break;
    }

    // Handle case where release_date might not exist on model, fallback to id for stability if needed
    // But assuming standard schema from context

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

export const createMovie = async (req, res) => {
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
      category,
    } = req.body;

    if (!title) return res.status(400).json({ error: "Title is required" });

    const movie = await prisma.movie.create({
      data: {
        title,
        description,
        language,
        poster_url,
        trailer_url,
        director,
        genre: Array.isArray(genre) ? genre : [genre], // Ensure array
        cast: Array.isArray(cast) ? cast : [cast], // Ensure array (Json type but usually array)
        duration: duration ? Number(duration) : null,
        rating: rating ? Number(rating) : null,
        release_date: release_date ? new Date(release_date) : null,
        category: category || "MOVIE",
      },
    });

    res.status(201).json(movie);
  } catch (error) {
    console.error("Error creating movie:", error);
    res.status(500).json({ error: "Failed to create movie" });
  }
};

export const updateMovie = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Invalid movie ID" });

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
    if (data.release_date) data.release_date = new Date(data.release_date);

    const movie = await prisma.movie.update({ where: { id }, data });
    res.status(200).json(movie);
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

    // Delete all associated shows and bookings first (cascade delete)
    if (movie.shows && movie.shows.length > 0) {
      // Delete all bookings for these shows
      const showIds = movie.shows.map((show) => show.id);
      await prisma.booking.deleteMany({
        where: { show_id: { in: showIds } },
      });

      // Delete all shows
      await prisma.show.deleteMany({
        where: { movie_id: id },
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
