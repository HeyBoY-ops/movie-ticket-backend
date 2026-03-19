
import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function run() {
  console.log("Seeding Future Booking...");

  // 1. Get User
  const user = await prisma.user.findFirst();
  if (!user) { console.error("No user found"); return; }

  // 2. Get Movie & Theater
  const movie = await prisma.movie.findFirst();
  const theater = await prisma.theater.findFirst();

  // 3. Create Show for Tomorrow 10 AM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const show = await prisma.show.create({
    data: {
      movieId: movie.id,
      theaterId: theater.id,
      screenNumber: 2,
      showDate: tomorrow,
      showTime: "10:00 AM",
      totalSeats: 100,
      bookedSeats: [],
      price: 300
    }
  });

  // 4. Create Booking
  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      showId: show.id,
      seats: ["A1", "A2"],
      totalAmount: 600,
      paymentMethod: "seed",
      bookingStatus: "confirmed"
    }
  });

  console.log(`✅ Created Booking ${booking.id} for Tomorrow (${tomorrow.toISOString()})`);
  console.log("User should now see this in 'Upcoming' with a Cancel button.");
}

run();
