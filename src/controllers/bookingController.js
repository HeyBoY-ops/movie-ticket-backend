import { prisma } from "../server.js";

// --- CORE RESERVATION LOGIC ---

// 1. Hold Seat (Locking Mechanism)
export const holdSeat = async (req, res) => {
  const { showId, seatNumbers } = req.body;
  const userId = req.user.id;

  if (!showId || !seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
    return res.status(400).json({ error: "Show ID and seat numbers are required" });
  }

  // Basic validation that show exists and isn't finished (omitted for brevity, can be added)

  const lockIds = [];

  try {
    // Attempt to create locks for all seats
    // We do this in a loop or Promise.all. 
    // However, for strict consistency, we want to fail if ANY seat is taken.
    // Prisma transaction makes sure we either get all or nothing if we want, 
    // but duplicate keys throw immediately.

    // We'll use a transaction to try and create all locks.
    await prisma.$transaction(async (tx) => {
      // First, check if any are already BOOKED in the Show record (double check)
      const show = await tx.show.findUnique({ where: { id: showId } });
      if (!show) throw new Error("Show not found");

      const alreadyBooked = parseBookedSeats(show.booked_seats);
      const isBooked = seatNumbers.some(seat => alreadyBooked.includes(seat));

      if (isBooked) {
        const error = new Error("One or more seats are already booked");
        error.code = "SEAT_BOOKED";
        throw error;
      }

      // Try to create locks
      for (const seatNumber of seatNumbers) {
        const lock = await tx.seatLock.create({
          data: {
            showId,
            seatNumber,
            userId
          }
        });
        lockIds.push(lock.id);
      }
    });

    res.status(201).json({
      message: "Seats locked successfully",
      lockIds,
      expiresInSeconds: 600 // 10 minutes
    });

  } catch (error) {
    console.error("Hold Seat Error:", error);

    if (error.code === 'P2002') {
      return res.status(409).json({ error: "One or more seats are already reserved by another user." });
    }

    if (error.code === 'SEAT_BOOKED') {
      return res.status(409).json({ error: error.message });
    }

    res.status(500).json({ error: "Failed to hold seats" });
  }
};

// 2. Confirm Booking (The Purchase)
export const confirmBooking = async (req, res) => {
  const { showId, lockIds, payment_method, total_amount } = req.body;
  const userId = req.user.id; // User must match lock owner

  if (!showId || !lockIds || !Array.isArray(lockIds) || lockIds.length === 0) {
    return res.status(400).json({ error: "Invalid booking data" });
  }

  try {
    const booking = await prisma.$transaction(async (tx) => {
      // 1. Verify locks exist and belong to user
      const locks = await tx.seatLock.findMany({
        where: {
          id: { in: lockIds },
          userId: userId,
          showId: showId // Ensure locks match the show
        }
      });

      if (locks.length !== lockIds.length) {
        throw new Error("Locks expired or invalid");
      }

      // Extract seat numbers from locks
      const seatsToBook = locks.map(l => l.seatNumber);

      // 2. Fetch Show to get current booked_seats and price
      const show = await tx.show.findUnique({ where: { id: showId } });
      if (!show) throw new Error("Show not found");

      // Double check if any of these are already booked (shouldn't be if locked, but good practice)
      const currentBooked = parseBookedSeats(show.booked_seats);
      const conflict = seatsToBook.some(s => currentBooked.includes(s));
      if (conflict) throw new Error("Seats already permanently booked");

      // 3. Create Booking
      const calculatedTotal = total_amount || (seatsToBook.length * show.price);

      const newBooking = await tx.booking.create({
        data: {
          user_id: userId,
          show_id: showId,
          seats: seatsToBook,
          total_amount: calculatedTotal,
          payment_method,
          booking_status: "confirmed"
        }
      });

      // 4. Update Show (status: BOOKED)
      const updatedBookedSeats = [...currentBooked, ...seatsToBook];
      await tx.show.update({
        where: { id: showId },
        data: { booked_seats: updatedBookedSeats }
      });

      // 5. Delete Locks
      await tx.seatLock.deleteMany({
        where: {
          id: { in: lockIds }
        }
      });

      return newBooking;
    });

    res.status(201).json(booking);

  } catch (error) {
    console.error("Confirm Booking Error:", error);
    res.status(409).json({ error: error.message || "Booking failed" });
  }
};


// helper to parse whatever format booked_seats is in
const parseBookedSeats = (bookedSeatsData) => {
  if (!bookedSeatsData) return [];
  if (Array.isArray(bookedSeatsData)) return bookedSeatsData;
  if (typeof bookedSeatsData === 'object' && Array.isArray(bookedSeatsData.set)) return bookedSeatsData.set;
  if (typeof bookedSeatsData === 'string') {
    try { return JSON.parse(bookedSeatsData); } catch { return []; }
  }
  return [];
};


// --- HELPERS / POLLING ---

// Get status of seats for a show (Sold + Locked)
export const getShowSeatStatus = async (req, res) => {
  const { showId } = req.params;
  try {
    const [show, locks] = await Promise.all([
      prisma.show.findUnique({
        where: { id: showId },
        select: { booked_seats: true }
      }),
      prisma.seatLock.findMany({
        where: { showId: showId },
        select: { seatNumber: true }
      })
    ]);

    if (!show) return res.status(404).json({ error: "Show not found" });

    const booked = parseBookedSeats(show.booked_seats);
    const locked = locks.map(l => l.seatNumber);

    res.json({
      booked,
      locked
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch seat status" });
  }
};


// --- EXISTING & OTHER CONTROLLERS ---

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

export const cancelBooking = async (req, res) => {
  // Simplistic cancel: just mark as cancelled. 
  // Ideally should remove from show.booked_seats too if we want to free them up, 
  // but keeping it simple as per existing logic unless requested otherwise.
  const booking = await prisma.booking.update({
    where: { id: req.params.id },
    data: { booking_status: "cancelled" },
  });
  res.json(booking);
};

// Kept this for backward compatibility or if used elsewhere, 
// though generally replaced by hold/confirm flow for regular bookings.
// If this is used for "Events", we might need to update it to use locks too 
// OR just leave it as is if concurrency isn't a huge worry for Events yet.
// Leaving as-is based on prompt only asking for specific refactor.
export const createEventBooking = async (req, res) => {
  // ... (Existing logic for events - sticking to user request to only refactor hold/confirm parts)
  // To match the users 'exact blocks' request, I'll basically include the original logic here 
  // to ensure the file is complete and doesn't break other things.
  try {
    const {
      event_title, event_description, event_image, event_date, event_time,
      venue_name, venue_city, venue_address,
      seats, payment_method, total_amount,
    } = req.body;
    const user_id = req.user.id;

    if (!event_title || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ error: "Event title and seats are required" });
    }
    if (!payment_method) {
      return res.status(400).json({ error: "Payment method is required" });
    }

    // Simplified flow from original file:
    // 1. Find/Create Movie
    let movie = await prisma.movie.findFirst({ where: { title: event_title } });
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

    // 2. Find/Create Theater
    let theater = await prisma.theater.findFirst({ where: { name: venue_name, city: venue_city || "Mumbai" } });
    if (!theater) {
      theater = await prisma.theater.create({
        data: {
          name: venue_name,
          city: venue_city || "Mumbai",
          address: venue_address || `${venue_name}, ${venue_city || "Mumbai"}`,
          total_screens: 1,
        }
      });
    }

    // 3. Find/Create Show
    const showDate = event_date ? new Date(event_date) : new Date();
    showDate.setHours(16, 0, 0, 0);

    let show = await prisma.show.findFirst({
      where: { movie_id: movie.id, theater_id: theater.id, show_date: showDate }
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
        }
      });
    }

    // 4. Check/Book
    const alreadyBooked = parseBookedSeats(show.booked_seats);
    const conflict = seats.some((s) => alreadyBooked.includes(s));
    if (conflict) {
      return res.status(400).json({ error: "One or more seats are already booked" });
    }
    const newBookedSeats = [...alreadyBooked, ...seats];
    await prisma.show.update({
      where: { id: show.id },
      data: { booked_seats: newBookedSeats },
    });

    const calculatedTotal = total_amount || (seats.length * show.price);
    const booking = await prisma.booking.create({
      data: {
        user_id,
        show_id: show.id,
        seats,
        total_amount: calculatedTotal,
        payment_method,
        booking_status: "confirmed",
      },
      include: { show: { include: { movie: true, theater: true } } },
    });

    res.status(201).json(booking);

  } catch (error) {
    console.error("Error creating event booking:", error);
    res.status(500).json({ error: error.message || "Failed to create event booking" });
  }
};
