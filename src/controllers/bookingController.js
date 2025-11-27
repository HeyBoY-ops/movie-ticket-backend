import { prisma } from "../server.js";

export const createBooking = async (req, res) => {
  const { show_id, seats, payment_method } = req.body;
  const user_id = req.user.id;

  const show = await prisma.show.findUnique({ where: { id: show_id } });

  const alreadyBooked = show.booked_seats || [];

  const conflict = seats.some((s) => alreadyBooked.includes(s));
  if (conflict) return res.status(400).json({ message: "Seat already booked" });

  const newBookedSeats = [...alreadyBooked, ...seats];

  await prisma.show.update({
    where: { id: show_id },
    data: { booked_seats: newBookedSeats },
  });

  const booking = await prisma.booking.create({
    data: {
      user_id,
      show_id,
      seats,
      total_amount: req.body.total_amount || (seats.length * show.price),
      payment_method,
      booking_status: "confirmed",
    },
  });

  res.json(booking);
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
