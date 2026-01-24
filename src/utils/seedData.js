import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const seedData = async () => {
  try {
    const hashedPassword = await bcrypt.hash("password123", 10);

    const users = [
      {
        email: "admin@movieday.com",
        name: "Admin User",
        password: hashedPassword,
        role: "ADMIN",
        isVerified: true,
      },
      {
        email: "inox@partner.com",
        name: "Inox Theater",
        password: hashedPassword,
        role: "ORGANIZATION",
        isVerified: true,
      },
      {
        email: "rohit@user.com",
        name: "Rohit User",
        password: hashedPassword,
        role: "USER",
        isVerified: true,
      },
    ];

    for (const user of users) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          role: user.role,
          isVerified: user.isVerified
        },
        create: user,
      });
    }

    console.log("Seed data upserted successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await prisma.$disconnect();
  }
};

seedData();
