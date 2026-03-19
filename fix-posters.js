
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

async function fixPosters() {
  console.log("Fixing Movie Posters...");

  // Get ALL movies to inspect JS-side
  const movies = await prisma.movie.findMany();

  console.log(`Checking ${movies.length} movies...`);

  for (const movie of movies) {
    // Fix condition: poster missing OR is a placeholder
    const isPlaceholder = movie.posterUrl && movie.posterUrl.includes("placehold.co");
    const isMissing = !movie.posterUrl || movie.posterUrl === "";

    if (!isMissing && !isPlaceholder) {
      continue;
    }

    if (movie.category === "EVENT") {
      // Manual fix for Known Events
      if (movie.title.includes("Sunburn")) {
        await prisma.movie.update({
          where: { id: movie.id },
          data: { posterUrl: "https://wanderon-images.gumlet.io/blogs/new/2024/09/sunburn-arena-ft.-alan-walker-timing-and-date.png" }
        });
        console.log(`✅ Fixed Event: ${movie.title}`);
      } else {
        console.log(`ℹ️ Skipping Event without known manual poster: ${movie.title}`);
      }
      continue;
    }

    try {
      console.log(`Fetching poster for: ${movie.title}`);
      const searchRes = await axios.get(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movie.title)}`
      );

      if (searchRes.data.results && searchRes.data.results.length > 0) {
        const tmdbMovie = searchRes.data.results[0];
        if (tmdbMovie.poster_path) {
          const posterUrl = `${IMAGE_BASE_URL}${tmdbMovie.poster_path}`;

          await prisma.movie.update({
            where: { id: movie.id },
            data: { posterUrl: posterUrl }
          });
          console.log(`✅ Updated: ${movie.title} -> ${posterUrl}`);
        } else {
          console.log(`⚠️ No poster found in TMDB for: ${movie.title}`);
        }
      } else {
        console.log(`❌ Movie not found in TMDB: ${movie.title}`);
      }
    } catch (err) {
      console.error(`Error processing ${movie.title}:`, err.message);
    }
  }

  console.log("Poster fix complete.");
}

fixPosters()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
