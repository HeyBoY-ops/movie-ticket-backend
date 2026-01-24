import { prisma } from "../server.js";

export const getTheaters = async (req, res) => {
  try {
    const theaters = await prisma.theater.findMany();
    res.json(theaters);
  } catch (error) {
    console.error("Error fetching theaters:", error);
    res.status(500).json({ error: "Failed to fetch theaters" });
  }
};

export const createTheater = async (req, res) => {
  try {
    const { name, city, address, total_screens } = req.body;
    if (!name || !city || !address) {
      return res.status(400).json({ error: "Name, city, and address are required" });
    }
    const theater = await prisma.theater.create({
      data: {
        name,
        city,
        address,
        total_screens: total_screens || 1,
        ownerId: req.user ? req.user.id : null, // Link to creator
      }
    });
    res.status(201).json(theater);
  } catch (error) {
    console.error("Error creating theater:", error);
    res.status(500).json({ error: "Failed to create theater" });
  }
};

export const updateTheater = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Invalid theater ID" });

    const theater = await prisma.theater.findUnique({ where: { id } });

    if (!theater) return res.status(404).json({ error: "Theater not found" });

    // Ownership Check
    if (req.user.role !== "ADMIN" && theater.ownerId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden - You do not own this theater" });
    }

    const updatedTheater = await prisma.theater.update({
      where: { id },
      data: req.body,
    });
    res.status(200).json(updatedTheater);
  } catch (error) {
    console.error("Error updating theater:", error);
    if (error.code === "P2025") return res.status(404).json({ error: "Theater not found" });
    res.status(500).json({ error: "Failed to update theater" });
  }
};

export const deleteTheater = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Invalid theater ID" });

    // Check if theater exists
    const theater = await prisma.theater.findUnique({
      where: { id },
      include: { shows: true },
    });

    if (!theater) {
      return res.status(404).json({ error: "Theater not found" });
    }

    // Ownership Check (Bypass for Admin)
    // Note: Assuming req.user is populated by authMiddleware
    if (req.user.role !== "ADMIN") {
      // If not admin, must be owner
      if (theater.ownerId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden - You do not own this theater" });
      }
    }

    // Delete all associated shows and bookings first (cascade delete)
    if (theater.shows && theater.shows.length > 0) {
      // Delete all bookings for these shows
      const showIds = theater.shows.map((show) => show.id);
      await prisma.booking.deleteMany({
        where: { show_id: { in: showIds } },
      });

      // Delete all shows
      await prisma.show.deleteMany({
        where: { theater_id: id },
      });
    }

    // Now delete the theater
    await prisma.theater.delete({ where: { id } });
    res.status(200).json({ message: "Theater deleted successfully" });
  } catch (error) {
    console.error("Error deleting theater:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Theater not found" });
    }
    res.status(500).json({ error: error.message || "Failed to delete theater" });
  }
};





const abc = { a: 1, b: 2, c: [1, 3, 4] }