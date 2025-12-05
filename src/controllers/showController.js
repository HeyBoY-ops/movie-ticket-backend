import { prisma } from "../server.js";

export const getShows = async (req, res) => {
  try {
    const { movie_id } = req.query;
    const where = movie_id ? { movie_id } : {};
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
        movie_id,
        theater_id,
        screen_number: screen_number || 1,
        show_date: new Date(show_date),
        show_time,
        total_seats: total_seats || 100,
        price: Number(price),
        booked_seats: [],
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
    if (data.show_date) {
      data.show_date = new Date(data.show_date);
    }
    if (data.price) {
      data.price = Number(data.price);
    }
    
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
      where: { show_id: id },
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
