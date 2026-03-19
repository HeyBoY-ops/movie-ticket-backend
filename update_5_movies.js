import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const POSTER_MAP = {
  "Rockstar": "https://upload.wikimedia.org/wikipedia/en/6/68/Rockstar-Movie-Poster.jpg",
  "Kahaani": "https://upload.wikimedia.org/wikipedia/en/f/f2/Kahaani_poster.jpg",
  "Uri: The Surgical Strike": "https://upload.wikimedia.org/wikipedia/en/3/3b/URI_-_New_poster.jpg",
  "Sanju": "https://upload.wikimedia.org/wikipedia/en/8/85/Sanju_poster.jpg",
  "Brahmastra: Part One - Shiva": "https://upload.wikimedia.org/wikipedia/en/e/ea/Brahmastra_Part_One_Shiva.jpg"
};

async function run() {
  console.log("Applying Targeted Poster Fixes for 5 Movies...");

  const movies = await prisma.movie.findMany();
  let updatedCount = 0;

  for (const movie of movies) {
    if (POSTER_MAP[movie.title]) {
      const newPoster = POSTER_MAP[movie.title];
      await prisma.movie.update({
        where: { id: movie.id },
        data: { posterUrl: newPoster }
      });
      console.log(`✅ Updated: ${movie.title}`);
      updatedCount++;
    }
  }

  console.log(`\nFixed ${updatedCount} movies.`);
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
