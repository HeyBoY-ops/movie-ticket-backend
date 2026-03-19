import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function run() {
  await prisma.movie.updateMany({
    where: { title: "Kahaani" },
    data: { posterUrl: "http://www.impawards.com/intl/india/2012/posters/kahaani.jpg" }
  });
  console.log("✅ Reverted Kahaani poster");
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
