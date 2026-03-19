
import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function run() {
  console.log("Debugging Movie Data...");

  const movies = await prisma.movie.findMany({
    take: 5
  });

  console.log(JSON.stringify(movies, null, 2));
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
