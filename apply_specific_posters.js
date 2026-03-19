import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const POSTER_MAP = {
  "Gadar 2": "https://upload.wikimedia.org/wikipedia/en/6/62/Gadar_2_film_poster.jpg",
  "Rocky Aur Rani Kii Prem Kahaani": "https://upload.wikimedia.org/wikipedia/en/6/65/Rocky_Aur_Rani_Ki_Prem_Kahani.jpg",
  "Tiger 3": "https://upload.wikimedia.org/wikipedia/en/f/f8/Tiger_3_poster.jpg",
  "Dunki": "https://upload.wikimedia.org/wikipedia/en/4/4f/Dunki_poster.jpg",
  "Animal": "http://www.impawards.com/intl/india/2023/posters/animal_xlg.jpg",
  "Kabir Singh": "https://upload.wikimedia.org/wikipedia/en/d/dc/Kabir_Singh.jpg",
  "Chennai Express": "https://upload.wikimedia.org/wikipedia/en/1/1b/Chennai_Express.jpg",
  "Yeh Jawaani Hai Deewani": "https://upload.wikimedia.org/wikipedia/en/1/15/Yeh_jawani_hai_deewani.jpg",
  "Zindagi Na Milegi Dobara": "https://upload.wikimedia.org/wikipedia/en/1/17/Zindagi_Na_Milegi_Dobara.jpg",
  "Tumbbad": "https://upload.wikimedia.org/wikipedia/en/4/41/Tumbbad_poster.jpg",
  "Queen": "https://upload.wikimedia.org/wikipedia/en/4/45/QueenMoviePoster7thMarch.jpg",
  "Gully Boy": "https://upload.wikimedia.org/wikipedia/en/0/07/Gully_Boy_poster.jpg",
  "Lagaan": "https://upload.wikimedia.org/wikipedia/en/b/b6/Lagaan.jpg",
  "Drishyam 2": "https://upload.wikimedia.org/wikipedia/en/3/3f/Drishyam_2.jpg",
  "Vikram": "https://upload.wikimedia.org/wikipedia/en/9/93/Vikram_2022_poster.jpg",
  "Kantara": "https://upload.wikimedia.org/wikipedia/en/8/84/Kantara_poster.jpeg",
  "Sita Ramam": "https://upload.wikimedia.org/wikipedia/en/1/1d/Sita_Ramam.jpg",
  "Barbie": "https://upload.wikimedia.org/wikipedia/en/0/0b/Barbie_2023_poster.jpg",
  "Spider-Man: Across the Spider-Verse": "https://upload.wikimedia.org/wikipedia/en/b/b4/Spider-Man-_Across_the_Spider-Verse_poster.jpg",
  "3 Idiots": "https://upload.wikimedia.org/wikipedia/en/d/df/3_idiots_poster.jpg",
  "Baahubali 2: The Conclusion": "https://upload.wikimedia.org/wikipedia/en/9/93/Baahubali_2_The_Conclusion_poster.jpg",
  "KGF: Chapter 2": "https://upload.wikimedia.org/wikipedia/en/d/d0/K.G.F_Chapter_2.jpg",
  "Pathaan": "https://upload.wikimedia.org/wikipedia/en/c/c3/Pathaan_film_poster.jpg",
  "Jawan": "https://upload.wikimedia.org/wikipedia/en/3/39/Jawan_film_poster.jpg"
};

async function run() {
  console.log("Applying Targeted Poster Fixes...");

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
    } else {
      // Check for alias (like K.G.F: Chapter 2 instead of KGF: Chapter 2)
      const keys = Object.keys(POSTER_MAP);
      const match = keys.find(k => movie.title.includes(k) || k.includes(movie.title));
      if (match) {
        await prisma.movie.update({
          where: { id: movie.id },
          data: { posterUrl: POSTER_MAP[match] }
        });
        console.log(`✅ Updated via partial match: ${movie.title} (Matched: ${match})`);
        updatedCount++;
      }
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
