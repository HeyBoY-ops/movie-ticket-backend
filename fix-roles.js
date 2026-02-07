
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Attempting to fix lowercase roles...");

  try {
    // Attempt 1: Fix 'user' -> 'USER'
    // Note: Prisma might block this if it validates the where clause against the enum strictness.
    // If this fails, we might need a workaround.
    const resultUser = await prisma.user.updateMany({
      where: {
        role: "user" // logic: find invalid ones
      },
      data: {
        role: "USER"
      }
    });
    console.log(`Updated ${resultUser.count} users from 'user' to 'USER'`);

    // Attempt 2: Fix 'organization' -> 'ORGANIZATION'
    const resultOrg = await prisma.user.updateMany({
      where: {
        role: "organization"
      },
      data: {
        role: "ORGANIZATION"
      }
    });
    console.log(`Updated ${resultOrg.count} users from 'organization' to 'ORGANIZATION'`);

  } catch (e) {
    console.error("Prisma updateMany failed (likely due to strict Enum validation):", e.message);
    console.log("Trying raw query workaround if applicable (Mongo doesn't support queryRaw for updates easily via Prisma)...");
  } finally {
    await prisma.$disconnect();
  }
}

main();
