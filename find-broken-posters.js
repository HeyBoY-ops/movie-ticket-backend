
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function checkUrls() {
  console.log("Checking Poster URL Validity...");

  // Check all movies
  const movies = await prisma.movie.findMany();
  const broken = [];
  const working = [];

  for (const movie of movies) {
    if (!movie.posterUrl) {
      console.log(`❌ MISSING: ${movie.title} (ID: ${movie.id}) - URL is null/empty`);
      broken.push(movie.title);
      continue;
    }

    try {
      await axios.head(movie.posterUrl, { timeout: 3000 });
      // console.log(`✅ OK: ${movie.title}`);
      working.push(movie.title);
    } catch (error) {
      console.log(`❌ BROKEN: ${movie.title} (ID: ${movie.id}) - ${error.message} - URL: ${movie.posterUrl}`);
      broken.push(movie.title);
    }
  }

  console.log("\nSummary:");
  console.log(`Working: ${working.length}`);
  console.log(`Broken/Missing: ${broken.length}`);
  console.log("Broken Titles:", JSON.stringify(broken, null, 2));
}

checkUrls()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
