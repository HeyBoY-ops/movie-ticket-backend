
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        show: {
          include: {
            movie: true,
            theater: true,
          },
        },
      },
      orderBy: { // We want to see most recent first
        createdAt: 'desc'
      },
      take: 5
    });

    console.log(`Found ${bookings.length} bookings.`);
    if (bookings.length > 0) {
      console.log("Sample Booking:", JSON.stringify(bookings[0], null, 2));
    } else {
      console.log("No bookings found in the database.");
    }

  } catch (error) {
    console.error("Error fetching bookings:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
