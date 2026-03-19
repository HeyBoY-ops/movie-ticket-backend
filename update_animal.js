import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function run() {
  await prisma.movie.updateMany({
    where: { title: "Animal" },
    data: { posterUrl: "https://stat4.bollywoodhungama.in/wp-content/uploads/2021/01/Animal-Poster.jpg" }
  });
  console.log("✅ Updated Animal poster");
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
