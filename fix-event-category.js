
import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("Fixing Event Categories...");

  // Update known events to have category "EVENT"
  // We can identify them by title keywords or specific titles from seedEvent.js
  const eventTitles = [
    "Sunburn Arena Ft. Alan Walker",
    "NH7 Weekender",
    "Coldplay: Music of the Spheres World Tour",
    "Bollywood Night",
    "EDM Festival",
    "Jazz & Blues Festival",
    "Rock Fest India",
    "Classical Music Evening",
    "Hip Hop & Rap Showcase",
    "Folk & Fusion Festival",
    "Electronic Music Night"
  ];

  const result = await prisma.movie.updateMany({
    where: {
      title: {
        in: eventTitles
        // Or specific regex if needed, but 'in' is safer for now
      }
    },
    data: {
      category: "EVENT"
    }
  });

  console.log(`Updated ${result.count} movies to category 'EVENT'.`);

  // Also try to catch any that have "Event" in genre but still MOVIE category
  const genreFix = await prisma.movie.updateMany({
    where: {
      genre: { has: "Event" },
      category: "MOVIE"
    },
    data: {
      category: "EVENT"
    }
  });

  console.log(`Updated ${genreFix.count} additional movies based on Genre.`);

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
