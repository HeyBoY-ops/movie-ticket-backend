
import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const POSTER_MAP = {
  // Global Hits - Verified Working or New Source
  "Inception": "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
  "The Dark Knight": "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg",
  "Interstellar": "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
  "Parasite": "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_.jpg",
  "Avengers: Endgame": "https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_.jpg",
  "Oppenheimer": "https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjUtN2M1MS00MTQ2LTk2ODgtNzc2M2QyZGE5NTVjXkEyXkFqcGdeQXVyNzAwMjU2MTY@._V1_.jpg",
  "Barbie": "https://m.media-amazon.com/images/M/MV5BOWIwZgy0MTEtY2Y1OC00NDMwLWI5OWQtYjYWNGDmYTE4N2FiXkEyXkFqcGdeQXVyMjQ4ODAwMjU@._V1_.jpg",
  "The Godfather": "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
  "Pulp Fiction": "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",

  // Indian Hits - Using Amazon/IMDB reliable mirrors
  "RRR": "https://m.media-amazon.com/images/M/MV5BODUwNDNjYzctODUxNy00ZTA2LWIyYTEtMDc5Y2E5ZjBmNTMzXkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_.jpg",
  "KGF: Chapter 2": "https://m.media-amazon.com/images/M/MV5BMjA2NmZkYmItYTMyZC00ZWMzLWE2YzctOTI3Zgw0MTIxN2VjXkEyXkFqcGdeQXVyMTI1NDEyNTM5._V1_.jpg",
  "K.G.F: Chapter 2": "https://m.media-amazon.com/images/M/MV5BMjA2NmZkYmItYTMyZC00ZWMzLWE2YzctOTI3Zgw0MTIxN2VjXkEyXkFqcGdeQXVyMTI1NDEyNTM5._V1_.jpg",
  "Baahubali 2: The Conclusion": "https://m.media-amazon.com/images/M/MV5BOGNlNmRkMjctNDlxMC00MThhLTgvaGMtYjlkZjlkNjQ0Zjg4XkEyXkFqcGdeQXVyODQ5NDUwMDk@._V1_.jpg",
  "Dangal": "https://m.media-amazon.com/images/M/MV5BMTQ4MzQzMzM2Nl5BMl5BanBnXkFtZTgwMTQ1NzU3MDI@._V1_.jpg",
  "3 Idiots": "https://m.media-amazon.com/images/M/MV5BNzc4ZWQ3NmYtODE0Ny00YTQ4LTlkZmItYTU4ZGQ2ZTFkNDNhXkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_.jpg",
  "Jawan": "https://m.media-amazon.com/images/M/MV5BZOZlMzExYTktOTE4ZC00Zjk3LWJiMTItMWZlODcxN2U3YjdkXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_.jpg",
  "Pathaan": "https://m.media-amazon.com/images/M/MV5BM2QzM2JiNTMtYjU4Ny00MDZkLTk3MmUtYTRjMzVkZGJlNmYyXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_.jpg",
  "Drishyam 2": "https://m.media-amazon.com/images/M/MV5BYmQzYjVjZGItZTAxYi00NTc5LThlZTEtZjJkMGJiNjQyMzliXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_.jpg",
  "Kantara": "https://m.media-amazon.com/images/M/MV5BNjQyNGI5OWEtZjI1Yy00NDVjLWE4MTAtMzRiNjIyYmJlZWFlXkEyXkFqcGdeQXVyMTEzMTI1Mjk3._V1_.jpg",
  "Vikram": "https://m.media-amazon.com/images/M/MV5BMjFlY2E2MDUtYjY2YS00YTk5LTg1ODAtZTc0ZGEzOTZjMWFhXkEyXkFqcGdeQXVyMTI1NDEyNTM5._V1_.jpg",
  "Sita Ramam": "https://m.media-amazon.com/images/M/MV5BN2RjZDJhYzUtOTQ5Yy00ODM3LWE4OGItYjIyY2ljN2MxZDMxXkEyXkFqcGdeQXVyMTA3MDk2NDg2._V1_.jpg",
  "PK": "https://m.media-amazon.com/images/M/MV5BMTYzOTE2NjkxN15BMl5BanBnXkFtZTgwMDgzMTg0MzE@._V1_.jpg",
  "Queen": "https://m.media-amazon.com/images/M/MV5BMTQwOTc0MDIzNV5BMl5BanBnXkFtZTgwODQ0ODAyNzE@._V1_.jpg",
  "Gully Boy": "https://m.media-amazon.com/images/M/MV5BODlmMWQ5OGQtZTU5OS00Zjg0LWE1M2QtZDUxYzI1MmQzMWJhXkEyXkFqcGdeQXVyNDAzNDk0MTQ@._V1_.jpg",

  // Recent Blockbusters
  "Gadar 2": "https://m.media-amazon.com/images/M/MV5BYzA2Nzk5MmYtZWEyOC00YzZkLTk2NWItY2VkYzY1ZjVmNWUxXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_.jpg",
  "Animal": "https://m.media-amazon.com/images/M/MV5BNGViM2M4NmUtMmNkNy00MTQ5LTk5MDYtNmNhODAzODkwOTJlXkEyXkFqcGdeQXVyMTY1NDY4NTIw._V1_.jpg",
  "Dunki": "https://m.media-amazon.com/images/M/MV5BYtmZTI5MjItYzgzMC00MjA4LTg4ZTItMTA4Yzc4ODcyMDY5XkEyXkFqcGdeQXVyMTQ3Mzk2MDg4._V1_.jpg",
  "Tiger 3": "https://m.media-amazon.com/images/M/MV5BMjA4ZGMwN2ItZjU1MS00Yzc5LWI2MzYtN2IyM2U5NDU3Y2M0XkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_.jpg",
  "Rocky Aur Rani Kii Prem Kahaani": "https://m.media-amazon.com/images/M/MV5BNjgxODVjMTMtMTc2MC00NWExLTg4MzgtYTQ5YjkyMmZhYzE0XkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_.jpg",

  // Classics & Hits
  "Kabir Singh": "https://m.media-amazon.com/images/M/MV5BOTAzODEzNDczNl5BMl5BanBnXkFtZTgwMDU1MTk3NzM@._V1_.jpg",
  "Chennai Express": "https://m.media-amazon.com/images/M/MV5BMTczNTI2MjU0N15BMl5BanBnXkFtZTgwDWzM3MTk3MDE@._V1_.jpg",
  "Yeh Jawaani Hai Deewani": "https://m.media-amazon.com/images/M/MV5BMTYwMzM4MjM4OV5BMl5BanBnXkFtZTcwMjgwMzMzOQ@@._V1_.jpg",
  "Zindagi Na Milegi Dobara": "https://m.media-amazon.com/images/M/MV5BZGFhNTYwZmMtNzk4Ny00MTExLThjYjktYjgyODRhMjgyYjA0XkEyXkFqcGdeQXVyNjQ2MjQ5NzM@._V1_.jpg",
  "Gangs of Wasseypur": "https://m.media-amazon.com/images/M/MV5BMTc5NjY4MjUwNF5BMl5BanBnXkFtZTgwODM3NzM5MzE@._V1_.jpg",
  "Tumbbad": "https://m.media-amazon.com/images/M/MV5BMzllZGFhNjItNmI4MC00NmU4LWI2MjAtM2E0MjNkYmU4YjYxXkEyXkFqcGdeQXVyMTQ4NDk1OTM@._V1_.jpg",
  "Andhadhun": "https://m.media-amazon.com/images/M/MV5BZWZhMjhhZmYtOTIzOC00MGYzLWI1OGYtM2ZkN2IxNTI4ZWI3XkEyXkFqcGdeQXVyNDAzNDk0MTQ@._V1_.jpg",

  // Broken Movies Fixed via Verified Sources (IMPAwards & BollywoodHungama)
  "Rockstar": "http://www.impawards.com/intl/india/2011/posters/rockstar.jpg",
  "Kahaani": "http://www.impawards.com/intl/india/2012/posters/kahaani.jpg",
  "Uri: The Surgical Strike": "http://www.impawards.com/intl/india/2019/posters/uri_the_surgical_strike.jpg",
  "Sanju": "http://www.impawards.com/intl/india/2018/posters/sanju.jpg",
  "Brahmastra: Part One - Shiva": "http://www.impawards.com/intl/india/2022/posters/brahmastra_part_one_shiva.jpg",

  "Bhool Bhulaiyaa 2": "https://stat4.bollywoodhungama.in/wp-content/uploads/2022/05/Bhool-Bhulaiyaa-2.jpg",
  "OMG 2": "https://stat4.bollywoodhungama.in/wp-content/uploads/2023/07/OMG-2-1.jpg",

  // Confirmed Working from Previous Batches
  "Barfi!": "https://upload.wikimedia.org/wikipedia/en/2/2e/Barfi%21_poster.jpg",
  "Sultan": "https://upload.wikimedia.org/wikipedia/en/1/1f/Sultan_film_poster.jpg",
  "War": "https://upload.wikimedia.org/wikipedia/en/6/6f/War_official_poster.jpg",
  "Padmaavat": "https://upload.wikimedia.org/wikipedia/en/7/73/Padmaavat_poster.jpg",
  "Bajrangi Bhaijaan": "https://upload.wikimedia.org/wikipedia/en/d/dd/Bajrangi_Bhaijaan_Poster.jpg",
  "Sholay": "https://upload.wikimedia.org/wikipedia/en/5/52/Sholay-poster.jpg",
  "Lagaan": "https://upload.wikimedia.org/wikipedia/en/b/b6/Lagaan_poster.jpg"
};

async function run() {
  console.log("Applying Manual Poster Fixes...");

  const movies = await prisma.movie.findMany();
  let updatedCount = 0;

  for (const movie of movies) {
    // Try exact match or partial match
    let newPoster = POSTER_MAP[movie.title];

    if (!newPoster) {
      // Check for partial match/alias
      const keys = Object.keys(POSTER_MAP);
      const match = keys.find(k => movie.title.includes(k) || k.includes(movie.title));
      if (match) newPoster = POSTER_MAP[match];
    }

    if (newPoster) {
      await prisma.movie.update({
        where: { id: movie.id },
        data: { posterUrl: newPoster }
      });
      console.log(`✅ Updated: ${movie.title}`);
      updatedCount++;
    } else {
      console.log(`⚠️ No manual poster for: ${movie.title} (ID: ${movie.id})`);
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
