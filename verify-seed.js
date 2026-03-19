
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Verifying seeded data...");

  const movieCount = await prisma.movie.count();
  const showCount = await prisma.show.count();
  const theaterCount = await prisma.theater.count();

  console.log(`Movies: ${movieCount}`);
  console.log(`Shows: ${showCount}`);
  console.log(`Theaters: ${theaterCount}`);

  if (movieCount >= 50) {
    console.log("✅ Seed success: At least 50 movies found.");
  } else {
    console.log(`⚠️ Seed partial: Found ${movieCount} movies.`);
  }

  // Check show distribution
  const shows = await prisma.show.findMany({
    include: { movie: true, theater: true },
    take: 5
  });

  if (shows.length > 0) {
    console.log("Sample Show:", `${shows[0].movie.title} at ${shows[0].theater.name}`);
  }

}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
