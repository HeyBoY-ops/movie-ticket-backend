import prisma from "../config/db.js";

export const getOrgStats = async (req, res) => {
  try {
    const orgId = req.user.id;

    // 1. Get all theaters for this org
    const theaters = await prisma.theater.findMany({
      where: { ownerId: orgId },
      include: {
        shows: {
          include: {
            bookings: true
          }
        }
      }
    });

    let totalRevenue = 0;
    let totalTicketsSold = 0;
    let totalSeatsAvailable = 0;
    let totalSeatsBooked = 0;

    // Helper for chart data
    const salesByDate = {};

    const theaterStats = theaters.map(theater => {
      let theaterRevenue = 0;
      let theaterTickets = 0;
      let activeShows = 0;

      theater.shows.forEach(show => {
        // Only count valid bookings
        const validBookings = show.bookings.filter(b => b.bookingStatus === 'confirmed');

        const showRevenue = validBookings.reduce((sum, b) => sum + b.totalAmount, 0);
        const showTickets = validBookings.reduce((sum, b) => sum + b.seats.length, 0);

        theaterRevenue += showRevenue;
        theaterTickets += showTickets;

        // Global sums
        totalRevenue += showRevenue;
        totalTicketsSold += showTickets;
        totalSeatsAvailable += show.totalSeats; // Note: schema says totalSeats (camelCase) or total_seats? Checked schema: totalSeats

        // For simple occupancy, we can use show.booked_seats length if it's reliable, 
        // or sum of confirmed booking seats. Let's use booking seats for consistency with "sold".
        // Schema `booked_seats` is a Json, usually array of strings.
        let bookedCount = 0;
        try {
          const bookedSrc = show.bookedSeats;
          if (Array.isArray(bookedSrc)) bookedCount = bookedSrc.length;
          else if (typeof bookedSrc === 'string') bookedCount = JSON.parse(bookedSrc).length;
        } catch (e) { }

        totalSeatsBooked += bookedCount;

        // Active checks logic (simple check: show date is today or future)
        const showDate = new Date(show.showDate);
        const now = new Date();
        if (showDate >= now.setHours(0, 0, 0, 0)) {
          activeShows++;
        }

        // Chart Data Aggregation
        // Group by Date (YYYY-MM-DD)
        const dateKey = new Date(show.showDate).toISOString().split('T')[0];
        if (!salesByDate[dateKey]) salesByDate[dateKey] = 0;
        salesByDate[dateKey] += showRevenue;
      });

      return {
        id: theater.id,
        name: theater.name,
        city: theater.city,
        revenue: theaterRevenue,
        activeShows
      };
    });

    // Formatting Chart Data
    const chartData = Object.keys(salesByDate).map(date => ({
      name: date,
      sales: salesByDate[date]
    })).sort((a, b) => new Date(a.name) - new Date(b.name));

    // Occupancy Rate
    const occupancyRate = totalSeatsAvailable > 0
      ? ((totalSeatsBooked / totalSeatsAvailable) * 100).toFixed(1)
      : 0;

    res.json({
      totalRevenue,
      totalTicketsSold,
      occupancyRate,
      chartData,
      theaters: theaterStats
    });

  } catch (error) {
    console.error("Get Org Stats Error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};
