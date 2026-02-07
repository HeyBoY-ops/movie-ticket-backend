
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:5050/api'; // Assuming standard port, will check server.js

async function main() {
  console.log("--- Starting Full Flow Debug ---");

  // 1. Ensure Admin Exists
  const adminEmail = "a@gmail.com";
  const adminPassword = "password123";

  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!admin) {
    console.log("Creating Admin User...");
    const hash = await bcrypt.hash(adminPassword, 10);
    admin = await prisma.user.create({
      data: {
        name: "Super Admin",
        email: adminEmail,
        password: hash,
        role: "SUPER_ADMIN",
      }
    });
  } else {
    // Reset password to be sure
    const hash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.update({
      where: { email: adminEmail },
      data: { password: hash, role: "SUPER_ADMIN" }
    });
    console.log("Admin User Updated.");
  }

  // 2. Login
  console.log("Logging in as Admin...");
  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: adminEmail,
      password: adminPassword
    });

    const token = loginRes.data.token;
    console.log("Login Successful. Token received.");

    // 3. Fetch Pending Organizations
    console.log("Fetching Pending Organizations...");
    const fetchRes = await axios.get(`${BASE_URL}/admin/pending-organizations`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("Status Code:", fetchRes.status);
    console.log("Data Received:", JSON.stringify(fetchRes.data, null, 2));
    console.log("Count:", fetchRes.data.length);

    if (fetchRes.data.length === 0) {
      console.error("❌ FAILURE: API returned 0 results, but we expect pending orgs!");
    } else {
      console.log("✅ SUCCESS: API returning data.");
    }

  } catch (error) {
    console.error("Error/Failure:", error.response ? error.response.data : error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
