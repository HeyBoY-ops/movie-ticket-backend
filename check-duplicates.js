
import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function run() {
  console.log("Checking for duplicate movies...");

  const movies = await prisma.movie.findMany({
    select: { id: true, title: true }
  });

  const titleCounts = {};
  const duplicates = [];

  for (const m of movies) {
    if (titleCounts[m.title]) {
      duplicates.push(m.title);
    }
    titleCounts[m.title] = (titleCounts[m.title] || 0) + 1;
  }

  if (duplicates.length > 0) {
    console.log(`Found ${duplicates.length} duplicate entries (showing uniq titles):`);
    console.log([...new Set(duplicates)]);
  } else {
    console.log("No duplicate titles found.");
  }

  console.log(`Total movies: ${movies.length}`);
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
