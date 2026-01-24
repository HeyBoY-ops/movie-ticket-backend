import { prisma } from "../server.js";

// Verify an Entity (User or Organization)
export const verifyEntity = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID required" });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });

    res.json({ message: "Entity verified successfully", user: updatedUser });
  } catch (error) {
    console.error("Verify Entity Error:", error);
    res.status(500).json({ error: "Failed to verify entity" });
  }
};

// Ban User (Delete user -> Cascades to data due to relations or manual cleanup)
// Note: Prisma relations might not cascade automatically depending on schema setup.
// We'll do manual cleanup for safety similar to deleteTheater.
export const banUser = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID required" });

    // 1. Find user to check role/existence
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { bookings: true }
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    // 2. Cascade cleanup
    // Delete bookings
    await prisma.booking.deleteMany({ where: { user_id: userId } });

    // If Organization? We should clean up Theaters/Movies/Shows?
    // Current setup: Movies/Theaters don't strictly link to User (ownerId is not in schema provided earlier!?)
    // Wait, let's re-verify schema.
    // Schema in view_file earlier: Movie and Theater do NOT have `ownerId` or relation to User.
    // Ah, wait. The prompt said "IF user is ORGANIZATION -> Force check ownerId".
    // But the schema I read in Step 159 DOES NOT have `ownerId` in Theater or Movie.
    // This implies the current codebase might be missing that link or I missed it.
    // Let's re-read Step 159 carefully.
    // Step 159 Schema:
    // model Theater { id, name, city, address ... shows } -> No ownerId.
    // model Movie { id, title ... } -> No ownerId.
    // So "ownership" concept might be missing or implied?
    // User Request said: "Organization... Can Create/Edit/Delete ONLY their own Theaters..."
    // If schema lacks ownerId, I cannot implement ownership check yet!
    // I should PROBABLY ADD ownerId to Theater/Movie if it's missing, OR the user assumes it exists.
    // Given the prompt: "Step 3... Organization -> Force check: where: { id: theaterId, ownerId: req.user.id}".
    // The user IMPLIES ownerId exists or wants me to implement it?
    // But the prompt "Step 1: Schema Update" ONLY mentioned adding `isFlagged`.
    // It did NOT explicitly say "Add ownerId".
    // Hmmm. If I don't add ownerId, I can't restrict to "their own".
    // I will double check if I missed ownerId in schema.
    // If it's truly missing, I should add it to fulfill the "Organization (The Creator)" requirement.
    // I'll add `ownerId` to Theater and possibly Movie.
    // For now, in `banUser`, I will just delete the user.

    await prisma.user.delete({ where: { id: userId } });

    res.json({ message: "User banned and deleted successfully" });
  } catch (error) {
    console.error("Ban User Error:", error);
    res.status(500).json({ error: "Failed to ban user" });
  }
};

// Remove Content (Movie/Show) logic
export const removeContent = async (req, res) => {
  try {
    const { type, id } = req.body; // type: 'movie' | 'show' | 'event'
    if (!id || !type) return res.status(400).json({ error: "ID and Type required" });

    if (type === 'movie') {
      // Delete movie (cascades shows?)
      // Schema: Movie -> Shows.
      // First delete shows for this movie
      await prisma.show.deleteMany({ where: { movie_id: id } });
      await prisma.movie.delete({ where: { id } });
    } else if (type === 'show') {
      await prisma.show.delete({ where: { id } });
    } else {
      return res.status(400).json({ error: "Invalid content type" });
    }

    res.json({ message: "Content removed successfully" });
  } catch (error) {
    console.error("Remove Content Error:", error);
    res.status(500).json({ error: "Failed to remove content" });
  }
};
