
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "a@gmail.com";
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    console.log("Admin User found:", user);
    console.log("Role:", user.role);
  } else {
    console.log("Admin user (a@gmail.com) NOT FOUND.");
  }

  await prisma.$disconnect();
}

main();
