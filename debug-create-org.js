
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Creating test pending organization...");

  const email = `test-org-${Date.now()}@example.com`;

  try {
    const user = await prisma.user.create({
      data: {
        name: "Test Org Owner",
        email: email,
        password: "hashedpassword123", // Dummy hash
        role: "ORGANIZATION",
        verificationStatus: "PENDING",
        organizationDetails: {
          organizationName: "Test Theater",
          address: "123 Test St"
        }
      }
    });
    console.log("Created User:", user);

    // Now verify we can find it
    const found = await prisma.user.findMany({
      where: {
        role: "ORGANIZATION",
        verificationStatus: "PENDING"
      }
    });

    console.log("Found Pending Orgs via Standard Query:", found.length);
    console.log(JSON.stringify(found, null, 2));

  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
