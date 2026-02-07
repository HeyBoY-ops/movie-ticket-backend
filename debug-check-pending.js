import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking for pending organizations...");

  try {
    const pendingOrgs = await prisma.user.findMany({
      where: {
        role: "ORGANIZATION",
        verificationStatus: "PENDING"
      }
    });

    console.log(`Found ${pendingOrgs.length} pending organizations manually.`);

    // Simulate what the controller SHOULD do
    if (pendingOrgs.length > 0) {
      console.log("First pending org:", pendingOrgs[0].email);
    } else {
      console.log("No pending organizations found. Try running debug-create-org.js first.");
    }

  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
