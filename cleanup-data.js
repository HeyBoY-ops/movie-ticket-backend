
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const venues = [
  "Mahalaxmi Race Course",
  "Mahalaxmi Lawns",
  "Jawaharlal Nehru Stadium",
  "Mumbai Metropolitan Region",
  "Palace Grounds",
  "Goa International Centre",
  "HITEX Exhibition Centre",
  "Music Academy",
  "DLF Cyber Hub",
  "Jaisalmer Fort",
  "Kitty Su",
  "BKC Ground" // Part of address in one case
];

async function cleanup() {
  console.log("Starting cleanup of potentially invalid theaters...");

  try {
    // Delete theaters matching these names
    const result = await prisma.theater.deleteMany({
      where: {
        name: { in: venues }
      }
    });

    console.log(`Deleted ${result.count} theaters.`);

    // Also checking strict string matches just in case
    // (Prisma deleteMany with 'in' should cover it)

  } catch (error) {
    console.error("Cleanup failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
