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

const seedFromTMDB = async () => {
  try {
    console.log("🎬 Fetching Now Playing movies from TMDB...");
    const { data } = await axios.get(
      `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    );

    const movies = data.results;
    console.log(`✨ Found ${movies.length} movies. Starting import...`);

    // Get a theater to schedule shows (Inox or first available)
    let theater = await prisma.theater.findFirst({
      where: { name: { contains: "Inox", mode: "insensitive" } }
    });

    if (!theater) {
      console.log("⚠️ 'Inox Theater' not found. Fetching any theater...");
      theater = await prisma.theater.findFirst();
    }

    if (!theater) {
      console.error("❌ No theaters found in DB. Please run basic seedData.js first.");
      return;
    }

    console.log(`Using Theater: ${theater.name} (${theater.city})`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const tmdbMovie of movies) {
      // 1. Idempotency Check
      const existingMovie = await prisma.movie.findFirst({
        where: { title: tmdbMovie.title },
      });

      if (existingMovie) {
        console.log(`⏩ Skipping '${tmdbMovie.title}' (Already exists)`);
        skippedCount++;
        continue;
      }

      // 2. Fetch Detailed Info (for runtime)
      let runtime = 120; // Default
      try {
        const detailRes = await axios.get(
          `${TMDB_BASE_URL}/movie/${tmdbMovie.id}?api_key=${TMDB_API_KEY}`
        );
        if (detailRes.data.runtime) runtime = detailRes.data.runtime;
      } catch (err) {
        console.warn(`⚠️ Could not fetch runtime for ${tmdbMovie.title}, using default.`);
      }

      // 3. Map Fields
      // Geneva Genre Mapping (Simplified for demo)
      // TMDB Genres: 28=Action, 878=SciFi, 18=Drama, etc.
      // We'll just map IDs to string array if possible or hardcode for now based on some logic if needed.
      // Or better, assume `genre_ids` isn't enough and use genres from detailRes if available.
      // Let's use detail response genres.

      let genres = ["General"];
      try {
        const detailRes = await axios.get(
          `${TMDB_BASE_URL}/movie/${tmdbMovie.id}?api_key=${TMDB_API_KEY}`
        );
        if (detailRes.data.genres) {
          genres = detailRes.data.genres.map(g => g.name);
        }
      } catch (e) {
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
        poster_url: tmdbMovie.poster_path ? `${IMAGE_BASE_URL}${tmdbMovie.poster_path}` : null,
        trailer_url: "", // Not robustly available in list endpoint
        release_date: new Date(tmdbMovie.release_date),
        director: "Unknown", // Requires credits endpoint, skipping for MVP speed
        cast: [], // Requires credits endpoint
        isFlagged: false,
        category: "MOVIE"
      };

      // 4. Create Movie
      const createdMovie = await prisma.movie.create({
        data: movieData
      });
      console.log(`✅ Added Movie: ${createdMovie.title}`);
      addedCount++;

      // 5. Schedule Shows for Tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Reset time to start of day roughly
      const baseDate = tomorrow.toISOString().split('T')[0];

      const showTimes = [
        { time: "10:00 AM", price: 150 + Math.floor(Math.random() * 100) },
        { time: "02:00 PM", price: 200 + Math.floor(Math.random() * 100) },
        { time: "07:00 PM", price: 250 + Math.floor(Math.random() * 100) }
      ];

      for (const slot of showTimes) {
        await prisma.show.create({
          data: {
            movie_id: createdMovie.id,
            theater_id: theater.id,
            screen_number: Math.floor(Math.random() * 5) + 1,
            show_date: new Date(baseDate), // simple date
            show_time: slot.time,
            total_seats: 100,
            price: slot.price,
            booked_seats: []
          }
        });
      }
      console.log(`   🗓️ Scheduled 3 shows for Tomorrow`);
    }

    console.log(`\n🎉 ETL Complete! Added: ${addedCount}, Skipped: ${skippedCount}`);

  } catch (error) {
    console.error("❌ ETL Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
};

seedFromTMDB();
