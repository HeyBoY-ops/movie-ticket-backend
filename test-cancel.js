
import axios from 'axios';
import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const API_URL = "http://localhost:5050/api";

async function run() {
  console.log("Starting Cancellation Test...");

  // 1. Setup User & Auth
  const user = await prisma.user.findFirst();
  const secret = "Abhishek@1234";
  const token = jwt.sign({ id: user.id }, secret, { expiresIn: '1h' });
  const headers = { Authorization: `Bearer ${token}` };

  // 2. Create a "Future" Show (Tomorrow)
  const movie = await prisma.movie.findFirst();
  const theater = await prisma.theater.findFirst();

  if (!movie || !theater) { console.error("No movie/theater"); return; }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const show = await prisma.show.create({
    data: {
      movieId: movie.id,
      theaterId: theater.id,
      screenNumber: 1,
      showDate: tomorrow,
      showTime: "10:00 AM",
      totalSeats: 100,
      bookedSeats: [],
      price: 250
    }
  });
  console.log("Created Future Show:", show.id);

  // 3. Create Booking
  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      showId: show.id,
      seats: ["F1"],
      totalAmount: 250,
      paymentMethod: "test",
      bookingStatus: "confirmed"
    }
  });
  console.log("Created Booking:", booking.id);

  // 4. Try to Cancel (Should Succeed)
  try {
    console.log("Attempting cancellation...");
    const res = await axios.post(`${API_URL}/bookings/${booking.id}/cancel`, {}, { headers });
    console.log("✅ Cancellation Success:", res.data.bookingStatus);
  } catch (e) {
    console.error("❌ Cancellation Failed:", e.response?.data || e.message);
  }

  // 5. Cleanup
  await prisma.booking.delete({ where: { id: booking.id } });
  await prisma.show.delete({ where: { id: show.id } });
}

run();
