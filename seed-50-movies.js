
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!TMDB_API_KEY) {
  console.error("❌ TMDB_API_KEY is missing in .env file");
  process.exit(1);
}

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const seedMovies = async () => {
  try {
    console.log("🎬 Fetching movies from TMDB...");

    const allMovies = [];
    const pages = [1, 2, 3]; // Fetch 3 pages (approx 60 movies)

    for (const page of pages) {
      try {
        const { data } = await axios.get(
          `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
        );
        allMovies.push(...data.results);
      } catch (e) {
        console.error(`Failed to fetch page ${page}:`, e.message);
      }
    }

    console.log(`✨ Found ${allMovies.length} movies in total.`);

    // Get all theaters
    const theaters = await prisma.theater.findMany();
    if (theaters.length === 0) {
      console.error("❌ No theaters found. Please run fix-theaters.js or create theaters first.");
      return;
    }
    console.log(`Using ${theaters.length} theaters for distribution.`);

    let addedCount = 0;
    let skippedCount = 0;

    // Limit to 50 movies max to process (or use all)
    const moviesToProcess = allMovies.slice(0, 50);

    for (const tmdbMovie of moviesToProcess) {
      // 1. Idempotency Check
      const existingMovie = await prisma.movie.findFirst({
        where: { title: tmdbMovie.title },
      });

      let movie = existingMovie;

      if (!existingMovie) {
        // 2. Fetch Detailed Info (for runtime and genres)
        let runtime = 120; // Default
        let genres = ["General"];

        try {
          const detailRes = await axios.get(
            `${TMDB_BASE_URL}/movie/${tmdbMovie.id}?api_key=${TMDB_API_KEY}`
          );
          if (detailRes.data.runtime) runtime = detailRes.data.runtime;
          if (detailRes.data.genres) genres = detailRes.data.genres.map(g => g.name);
        } catch (err) {
          // ignore
        }

        const languages = ["English", "Hindi", "Tamil"];
        const randoLang = languages[Math.floor(Math.random() * languages.length)];

        const movieData = {
          title: tmdbMovie.title,
          description: tmdbMovie.overview,
          genre: genres,
          language: tmdbMovie.original_language === 'en' ? "English" : randoLang,
          duration: runtime,
          rating: tmdbMovie.vote_average,
          posterUrl: tmdbMovie.poster_path ? `${IMAGE_BASE_URL}${tmdbMovie.poster_path}` : null, // Corrected CamelCase
          trailerUrl: "", // Corrected CamelCase
          releaseDate: new Date(tmdbMovie.release_date), // Corrected CamelCase
          director: "Unknown",
          cast: [],
          isFlagged: false,
          category: "MOVIE"
        };

        // 3. Create Movie
        movie = await prisma.movie.create({
          data: movieData
        });
        console.log(`✅ Added Movie: ${movie.title}`);
        addedCount++;
      } else {
        console.log(`⏩ Movie '${tmdbMovie.title}' already exists. Adding shows if needed...`);
        skippedCount++;
      }

      // 4. Schedule Shows
      // Pick 2 random theaters
      const shuffledTheaters = [...theaters].sort(() => 0.5 - Math.random());
      const selectedTheaters = shuffledTheaters.slice(0, 2);

      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dates = [
        { label: "Today", date: today },
        { label: "Tomorrow", date: tomorrow }
      ];

      const showTimes = [
        { time: "10:00 AM", price: 150 + Math.floor(Math.random() * 100) },
        { time: "02:00 PM", price: 200 + Math.floor(Math.random() * 100) },
        { time: "07:00 PM", price: 250 + Math.floor(Math.random() * 100) },
        { time: "10:00 PM", price: 300 + Math.floor(Math.random() * 100) }
      ];

      for (const theater of selectedTheaters) {
        for (const dateObj of dates) {
          // Pick 2 random times slots per day per theater
          const selectedSlots = showTimes.sort(() => 0.5 - Math.random()).slice(0, 2);

          const baseDate = dateObj.date.toISOString().split('T')[0];

          for (const slot of selectedSlots) {
            // Check if show exists
            // (Optimally skip this check for speed if we don't care about duplicates too much, but better to check)
            /*
            const exists = await prisma.show.findFirst({
                where: {
                    movieId: movie.id,
                    theaterId: theater.id,
                    showTime: slot.time,
                    // showDate comparison is tricky with ISO string, but let's try strict date check or just create.
                    // Simpler: Just create.
                }
            });
            */

            await prisma.show.create({
              data: {
                movieId: movie.id, // Corrected CamelCase
                theaterId: theater.id, // Corrected CamelCase
                screenNumber: Math.floor(Math.random() * 5) + 1, // Corrected CamelCase
                showDate: new Date(baseDate), // Corrected CamelCase
                showTime: slot.time, // Corrected CamelCase
                totalSeats: 100, // Corrected CamelCase
                price: slot.price, // Corrected CamelCase
                bookedSeats: [] // Corrected CamelCase
              }
            });
          }
        }
      }
    }

    console.log(`\n🎉 Seeding Complete! Added Movies: ${addedCount}, Skipped: ${skippedCount}`);

  } catch (error) {
    console.error("❌ Seeding Error:", error);
  } finally {
    await prisma.$disconnect();
  }
};

seedMovies();
