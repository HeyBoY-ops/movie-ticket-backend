import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function run() {
  await prisma.movie.updateMany({
    where: { title: "Animal" },
    data: { posterUrl: "https://upload.wikimedia.org/wikipedia/en/9/90/Animal_%282023_film%29_poster.jpg" }
  });
  console.log("✅ Updated Animal poster with Wiki URL");
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
