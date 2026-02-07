import prisma from "../config/db.js";

export const getShows = async (req, res) => {
  try {
    const { movie_id } = req.query;
    const where = movie_id ? { movieId: movie_id } : {};
    const shows = await prisma.show.findMany({
      where,
      include: { movie: true, theater: true },
    });
    res.json(shows);
  } catch (error) {
    console.error("Error fetching shows:", error);
    res.status(500).json({ error: "Failed to fetch shows" });
  }
};

export const getShow = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Invalid show ID" });

    const show = await prisma.show.findUnique({
      where: { id },
      include: { movie: true, theater: true },
    });

    if (!show) return res.status(404).json({ error: "Show not found" });

    res.json(show);
  } catch (error) {
    console.error("Error fetching show:", error);
    res.status(500).json({ error: "Failed to fetch show" });
  }
};

export const createShow = async (req, res) => {
  try {
    const { show_date, movie_id, theater_id, screen_number, show_time, total_seats, price } = req.body;

    if (!movie_id || !theater_id || !show_date || !show_time || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const show = await prisma.show.create({
      data: {
        movieId: movie_id,
        theaterId: theater_id,
        screenNumber: screen_number || 1,
        showDate: new Date(show_date),
        showTime: show_time,
        totalSeats: total_seats || 100,
        price: Number(price),
        bookedSeats: [],
      },
    });
    res.status(201).json(show);
  } catch (error) {
    console.error("Error creating show:", error);
    res.status(500).json({ error: "Failed to create show" });
  }
};

export const updateShow = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Invalid show ID" });

    const data = { ...req.body };
    // Map input fields manually if they come in as snake_case, or assume camelCase input. 
    // Given the form uses snake_case keys (mostly), we map them.
    if (data.show_date) {
      data.showDate = new Date(data.show_date);
      delete data.show_date;
    }
    if (data.price) data.price = Number(data.price);

    // Map others
    if (data.movie_id) { data.movieId = data.movie_id; delete data.movie_id; }
    if (data.theater_id) { data.theaterId = data.theater_id; delete data.theater_id; }
    if (data.screen_number) { data.screenNumber = data.screen_number; delete data.screen_number; }
    if (data.show_time) { data.showTime = data.show_time; delete data.show_time; }
    if (data.total_seats) { data.totalSeats = data.total_seats; delete data.total_seats; }

    const show = await prisma.show.update({
      where: { id },
      data,
    });
    res.status(200).json(show);
  } catch (error) {
    console.error("Error updating show:", error);
    if (error.code === "P2025") return res.status(404).json({ error: "Show not found" });
    res.status(500).json({ error: "Failed to update show" });
  }
};

export const deleteShow = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Invalid show ID" });

    // Check if show exists
    const show = await prisma.show.findUnique({
      where: { id },
    });

    if (!show) {
      return res.status(404).json({ error: "Show not found" });
    }

    // Delete all associated bookings first
    await prisma.booking.deleteMany({
      where: { showId: id },
    });

    // Now delete the show
    await prisma.show.delete({ where: { id } });
    res.status(200).json({ message: "Show deleted successfully" });
  } catch (error) {
    console.error("Error deleting show:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Show not found" });
    }
    res.status(500).json({ error: error.message || "Failed to delete show" });
  }
};
