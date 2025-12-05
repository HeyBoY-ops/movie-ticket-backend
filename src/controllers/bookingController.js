import { prisma } from "../server.js";

export const createBooking = async (req, res) => {
  try {
    const { show_id, seats, payment_method, total_amount } = req.body;
    const user_id = req.user.id;

    if (!show_id || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ error: "Show ID and seats are required" });
    }

    if (!payment_method) {
      return res.status(400).json({ error: "Payment method is required" });
    }

    const show = await prisma.show.findUnique({ 
      where: { id: show_id },
      include: { movie: true, theater: true }
    });

    if (!show) {
      return res.status(404).json({ error: "Show not found" });
    }

    // Normalize booked_seats - handle JSON array or object with set property
    let alreadyBooked = [];
    if (show.booked_seats) {
      if (Array.isArray(show.booked_seats)) {
        alreadyBooked = show.booked_seats;
      } else if (typeof show.booked_seats === 'object' && Array.isArray(show.booked_seats.set)) {
        alreadyBooked = show.booked_seats.set;
      } else if (typeof show.booked_seats === 'object') {
        // Try to parse as JSON if it's a string
        try {
          const parsed = typeof show.booked_seats === 'string' ? JSON.parse(show.booked_seats) : show.booked_seats;
          alreadyBooked = Array.isArray(parsed) ? parsed : [];
        } catch {
          alreadyBooked = [];
        }
      }
    }

    const conflict = seats.some((s) => alreadyBooked.includes(s));
    if (conflict) {
      return res.status(400).json({ error: "One or more seats are already booked" });
    }

    const newBookedSeats = [...alreadyBooked, ...seats];

    // Calculate total amount if not provided
    const calculatedTotal = total_amount || (seats.length * show.price);

    // Update show with new booked seats
    await prisma.show.update({
      where: { id: show_id },
      data: { booked_seats: newBookedSeats },
    });

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        user_id,
        show_id,
        seats,
        total_amount: calculatedTotal,
        payment_method,
        booking_status: "confirmed",
      },
      include: {
        show: {
          include: {
            movie: true,
            theater: true,
          },
        },
      },
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: error.message || "Failed to create booking" });
  }
};

export const getBookings = async (req, res) => {
  const user_id = req.user.id;
  const bookings = await prisma.booking.findMany({
    where: { user_id },
    include: {
      show: {
        include: {
          movie: true,
          theater: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(bookings);
};

export const cancelBooking = async (req, res) => {
  const booking = await prisma.booking.update({
    where: { id: req.params.id },
    data: { booking_status: "cancelled" },
  });

  res.json(booking);
};

export const getBooking = async (req, res) => {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id },
    include: {
      show: {
        include: {
          movie: true,
          theater: true,
        },
      },
    },
  });

  res.json(booking);
};

// Special endpoint for event bookings that creates movie/theater/show if needed
export const createEventBooking = async (req, res) => {
  try {
    const {
      event_title,
      event_description,
      event_image,
      event_date,
      event_time,
      venue_name,
      venue_city,
      venue_address,
      seats,
      payment_method,
      total_amount,
    } = req.body;
    const user_id = req.user.id;

    if (!event_title || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ error: "Event title and seats are required" });
    }

    if (!payment_method) {
      return res.status(400).json({ error: "Payment method is required" });
    }

    // Step 1: Create or find movie
    let movie = await prisma.movie.findFirst({
      where: { title: event_title },
    });

    if (!movie) {
      movie = await prisma.movie.create({
        data: {
          title: event_title,
          description: event_description || `${event_title} - Live Event`,
          genre: ["Event", "Music", "Concert"],
          language: "English",
          duration: 180,
          rating: 5.0,
          poster_url: event_image || "",
          trailer_url: "",
          release_date: event_date ? new Date(event_date) : new Date(),
          director: "Event Organizer",
          cast: ["Various Artists"],
        },
      });
    }

    // Step 2: Create or find theater
    let theater = await prisma.theater.findFirst({
      where: {
        name: venue_name,
        city: venue_city || "Mumbai",
      },
    });

    if (!theater) {
      theater = await prisma.theater.create({
        data: {
          name: venue_name,
          city: venue_city || "Mumbai",
          address: venue_address || `${venue_name}, ${venue_city || "Mumbai"}`,
          total_screens: 1,
        },
      });
    }

    // Step 3: Create or find show
    const showDate = event_date ? new Date(event_date) : new Date();
    showDate.setHours(16, 0, 0, 0); // Default to 4 PM

    let show = await prisma.show.findFirst({
      where: {
        movie_id: movie.id,
        theater_id: theater.id,
        show_date: showDate,
      },
    });

    if (!show) {
      show = await prisma.show.create({
        data: {
          movie_id: movie.id,
          theater_id: theater.id,
          screen_number: 1,
          show_date: showDate,
          show_time: event_time || "4:00 PM",
          total_seats: 5000,
          price: 1500,
          booked_seats: [],
        },
      });
    }

    // Step 4: Create booking
    // Normalize booked_seats
    let alreadyBooked = [];
    if (show.booked_seats) {
      if (Array.isArray(show.booked_seats)) {
        alreadyBooked = show.booked_seats;
      } else if (typeof show.booked_seats === 'object' && Array.isArray(show.booked_seats.set)) {
        alreadyBooked = show.booked_seats.set;
      } else if (typeof show.booked_seats === 'object') {
        try {
          const parsed = typeof show.booked_seats === 'string' ? JSON.parse(show.booked_seats) : show.booked_seats;
          alreadyBooked = Array.isArray(parsed) ? parsed : [];
        } catch {
          alreadyBooked = [];
        }
      }
    }

    const conflict = seats.some((s) => alreadyBooked.includes(s));
    if (conflict) {
      return res.status(400).json({ error: "One or more seats are already booked" });
    }

    const newBookedSeats = [...alreadyBooked, ...seats];

    // Update show with new booked seats
    await prisma.show.update({
      where: { id: show.id },
      data: { booked_seats: newBookedSeats },
    });

    // Calculate total amount if not provided
    const calculatedTotal = total_amount || (seats.length * show.price);

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        user_id,
        show_id: show.id,
        seats,
        total_amount: calculatedTotal,
        payment_method,
        booking_status: "confirmed",
      },
      include: {
        show: {
          include: {
            movie: true,
            theater: true,
          },
        },
      },
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error("Error creating event booking:", error);
    res.status(500).json({ error: error.message || "Failed to create event booking" });
  }
};
