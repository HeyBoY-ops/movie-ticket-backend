
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const moviesList = [
  { title: "Inception", genre: ["Sci-Fi", "Action"], language: "English", rating: 8.8, duration: 148 },
  { title: "The Dark Knight", genre: ["Action", "Crime"], language: "English", rating: 9.0, duration: 152 },
  { title: "Interstellar", genre: ["Sci-Fi", "Drama"], language: "English", rating: 8.6, duration: 169 },
  { title: "Parasite", genre: ["Thriller", "Drama"], language: "Korean", rating: 8.6, duration: 132 },
  { title: "Avengers: Endgame", genre: ["Action", "Sci-Fi"], language: "English", rating: 8.4, duration: 181 },
  { title: "Jawan", genre: ["Action", "Thriller"], language: "Hindi", rating: 7.5, duration: 169 },
  { title: "Pathaan", genre: ["Action", "Thriller"], language: "Hindi", rating: 7.0, duration: 146 },
  { title: "RRR", genre: ["Action", "Drama"], language: "Telugu", rating: 8.0, duration: 187 },
  { title: "KGF: Chapter 2", genre: ["Action", "Crime"], language: "Kannada", rating: 8.3, duration: 168 },
  { title: "Dangal", genre: ["Biography", "Sport"], language: "Hindi", rating: 8.4, duration: 161 },
  { title: "Baahubali 2: The Conclusion", genre: ["Action", "Fantasy"], language: "Telugu", rating: 8.2, duration: 167 },
  { title: "3 Idiots", genre: ["Comedy", "Drama"], language: "Hindi", rating: 8.4, duration: 170 },
  { title: "Spider-Man: Across the Spider-Verse", genre: ["Animation", "Action"], language: "English", rating: 8.7, duration: 140 },
  { title: "Oppenheimer", genre: ["Biography", "Drama"], language: "English", rating: 8.6, duration: 180 },
  { title: "Barbie", genre: ["Comedy", "Fantasy"], language: "English", rating: 7.0, duration: 114 },
  { title: "The Godfather", genre: ["Crime", "Drama"], language: "English", rating: 9.2, duration: 175 },
  { title: "Pulp Fiction", genre: ["Crime", "Drama"], language: "English", rating: 8.9, duration: 154 },
  { title: "Sita Ramam", genre: ["Romance", "Drama"], language: "Telugu", rating: 8.6, duration: 163 },
  { title: "Kantara", genre: ["Action", "Thriller"], language: "Kannada", rating: 8.3, duration: 148 },
  { title: "Vikram", genre: ["Action", "Thriller"], language: "Tamil", rating: 8.3, duration: 175 },
  { title: "Drishyam 2", genre: ["Crime", "Thriller"], language: "Hindi", rating: 8.2, duration: 140 },
  { title: "Sholay", genre: ["Action", "Adventure"], language: "Hindi", rating: 8.1, duration: 204 },
  { title: "Lagaan", genre: ["Drama", "Sport"], language: "Hindi", rating: 8.1, duration: 224 },
  { title: "Gully Boy", genre: ["Drama", "Music"], language: "Hindi", rating: 7.9, duration: 154 },
  { title: "PK", genre: ["Comedy", "Drama"], language: "Hindi", rating: 8.1, duration: 153 },
  { title: "Queen", genre: ["Comedy", "Drama"], language: "Hindi", rating: 8.1, duration: 146 },
  { title: "Andhadhun", genre: ["Crime", "Thriller"], language: "Hindi", rating: 8.2, duration: 139 },
  { title: "Tumbbad", genre: ["Horror", "Fantasy"], language: "Hindi", rating: 8.2, duration: 104 },
  { title: "Gangs of Wasseypur", genre: ["Action", "Crime"], language: "Hindi", rating: 8.2, duration: 321 },
  { title: "Zindagi Na Milegi Dobara", genre: ["Comedy", "Drama"], language: "Hindi", rating: 8.2, duration: 155 },
  { title: "Yeh Jawaani Hai Deewani", genre: ["Romance", "Drama"], language: "Hindi", rating: 7.2, duration: 160 },
  { title: "Chennai Express", genre: ["Action", "Comedy"], language: "Hindi", rating: 6.0, duration: 141 },
  { title: "Kabir Singh", genre: ["Romance", "Drama"], language: "Hindi", rating: 7.0, duration: 173 },
  { title: "Animal", genre: ["Action", "Drama"], language: "Hindi", rating: 6.5, duration: 201 },
  { title: "Dunki", genre: ["Comedy", "Drama"], language: "Hindi", rating: 7.0, duration: 161 },
  { title: "Tiger 3", genre: ["Action", "Thriller"], language: "Hindi", rating: 6.5, duration: 154 },
  { title: "Rocky Aur Rani Kii Prem Kahaani", genre: ["Romance", "Comedy"], language: "Hindi", rating: 6.8, duration: 168 },
  { title: "Gadar 2", genre: ["Action", "Drama"], language: "Hindi", rating: 5.8, duration: 170 },
  { title: "OMG 2", genre: ["Comedy", "Drama"], language: "Hindi", rating: 7.6, duration: 156 },
  { title: "Brahmastra: Part One - Shiva", genre: ["Fantasy", "Action"], language: "Hindi", rating: 5.6, duration: 167 },
  { title: "Bhool Bhulaiyaa 2", genre: ["Horror", "Comedy"], language: "Hindi", rating: 5.7, duration: 143 },
  { title: "War", genre: ["Action", "Thriller"], language: "Hindi", rating: 6.5, duration: 154 },
  { title: "Bajrangi Bhaijaan", genre: ["Action", "Drama"], language: "Hindi", rating: 8.1, duration: 163 },
  { title: "Sultan", genre: ["Action", "Drama"], language: "Hindi", rating: 7.0, duration: 170 },
  { title: "Sanju", genre: ["Biography", "Drama"], language: "Hindi", rating: 7.6, duration: 161 },
  { title: "Padmaavat", genre: ["Drama", "Romance"], language: "Hindi", rating: 7.0, duration: 164 },
  { title: "Uri: The Surgical Strike", genre: ["Action", "Drama"], language: "Hindi", rating: 8.2, duration: 138 },
  { title: "Kahaani", genre: ["Thriller", "Mystery"], language: "Hindi", rating: 8.1, duration: 122 },
  { title: "Barfi!", genre: ["Comedy", "Drama"], language: "Hindi", rating: 8.1, duration: 151 },
  { title: "Rockstar", genre: ["Drama", "Music"], language: "Hindi", rating: 7.7, duration: 159 }
];

const seedDummyMovies = async () => {
  try {
    console.log("🎬 Seeding dummy movies...");

    // 1. Ensure Theaters Exist
    let theaters = await prisma.theater.findMany();
    if (theaters.length === 0) {
      console.log("⚠️ No theaters found. Creating defaults...");
      const defaultTheaters = [
        { name: "PVR Icon", city: "Mumbai", address: "Infiniti Mall, Andheri", totalScreens: 5 },
        { name: "INOX Megaplex", city: "Mumbai", address: "Inorbit Mall, Malad", totalScreens: 11 },
        { name: "Cinepolis", city: "Delhi-NCR", address: "DLF Place, Saket", totalScreens: 6 },
        { name: "PVR Directors Cut", city: "Delhi-NCR", address: "Ambience Mall, Vasant Kunj", totalScreens: 4 },
        { name: "IMAX Wadala", city: "Mumbai", address: "Wadala, Mumbai", totalScreens: 5 },
        { name: "PVR Koramangala", city: "Bengaluru", address: "Koramangala, Bengaluru", totalScreens: 7 }
      ];

      for (const t of defaultTheaters) {
        await prisma.theater.create({ data: t });
      }
      theaters = await prisma.theater.findMany();
    }
    console.log(`Using ${theaters.length} theaters.`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const m of moviesList) {
      // Idempotency
      const existing = await prisma.movie.findFirst({ where: { title: m.title } });
      let movie = existing;

      if (!existing) {
        movie = await prisma.movie.create({
          data: {
            title: m.title,
            description: `This is a placeholder description for ${m.title}. It is a ${m.genre.join(", ")} movie.`,
            genre: m.genre,
            language: m.language,
            duration: m.duration,
            rating: m.rating,
            posterUrl: `https://placehold.co/300x450/000000/FFF?text=${encodeURIComponent(m.title)}`,
            trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Rick Roll default
            releaseDate: new Date("2023-01-01"),
            director: "Famous Director",
            cast: ["Star Actor 1", "Star Actor 2"],
            isFlagged: false,
            category: "MOVIE"
          }
        });
        console.log(`✅ Created movie: ${m.title}`);
        addedCount++;
      } else {
        console.log(`⏩ Movie ${m.title} exists.`);
        skippedCount++;
      }

      // Schedule Shows
      // Pick 2 random theaters
      const shuffledTheaters = [...theaters].sort(() => 0.5 - Math.random());
      const selectedTheaters = shuffledTheaters.slice(0, 2);

      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dates = [today, tomorrow];
      const showTimes = [
        { time: "10:00 AM", price: 150 },
        { time: "01:00 PM", price: 200 },
        { time: "04:00 PM", price: 250 },
        { time: "07:00 PM", price: 300 },
        { time: "10:00 PM", price: 350 }
      ];

      for (const theater of selectedTheaters) {
        for (const date of dates) {
          // 2 shows per day per theater
          const slots = showTimes.sort(() => 0.5 - Math.random()).slice(0, 2);
          for (const slot of slots) {
            await prisma.show.create({
              data: {
                movieId: movie.id,
                theaterId: theater.id,
                screenNumber: Math.floor(Math.random() * 5) + 1,
                showDate: date,
                showTime: slot.time,
                totalSeats: 100,
                price: slot.price,
                bookedSeats: []
              }
            });
          }
        }
      }
    }

    console.log(`\n🎉 Seeding Complete! Added: ${addedCount}, Skipped: ${skippedCount}. Shows created.`);

  } catch (e) {
    console.error("❌ Seeding failed:", e);
  } finally {
    await prisma.$disconnect();
  }
};

seedDummyMovies();
