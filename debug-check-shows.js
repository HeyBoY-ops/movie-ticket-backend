
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Checking movies...");
  const movies = await prisma.movie.count();
  console.log(`Found ${movies} movies.`);

  console.log("\nChecking theaters...");
  const theaters = await prisma.theater.findMany();
  console.log(`Found ${theaters.length} theaters.`);

  const cityCounts = {};
  theaters.forEach(t => {
    cityCounts[t.city] = (cityCounts[t.city] || 0) + 1;
  });
  console.log("Theaters by city:", cityCounts);

  console.log("\nChecking shows...");
  const shows = await prisma.show.findMany({
    include: { theater: true }
  });
  console.log(`Found ${shows.length} shows.`);

  const showsByCity = {};
  let nullTheater = 0;
  shows.forEach(s => {
    if (!s.theater) {
      nullTheater++;
    } else {
      const city = s.theater.city;
      showsByCity[city] = (showsByCity[city] || 0) + 1;
    }
  });
  console.log("Shows by city:", showsByCity);
  if (nullTheater > 0) console.log(`Shows with null theater: ${nullTheater}`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
