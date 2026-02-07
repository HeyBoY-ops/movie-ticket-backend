
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:5050/api';

async function main() {
  console.log("--- Starting Verify Action Debug ---");

  // 1. Login as Admin
  const adminEmail = "a@gmail.com";
  const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: adminEmail,
    password: "password123"
  });
  const token = loginRes.data.token;
  console.log("Admin Logged In.");

  // 2. Create a Dummy Pending Org
  const testEmail = `debug-verify-${Date.now()}@test.com`;
  const org = await prisma.user.create({
    data: {
      name: "To Be Verified",
      email: testEmail,
      password: "hash",
      role: "ORGANIZATION",
      verificationStatus: "PENDING",
      organizationDetails: {
        aadharNumber: "111",
        gstNumber: "222"
      }
    }
  });
  console.log(`Created Pending Org: ${org.id} (${org.email})`);

  // 3. Attempt to Verify (Approve)
  console.log("Attempting to Approve...");
  try {
    const res = await axios.patch(
      `${BASE_URL}/admin/verify-organization/${org.id}`,
      { status: "APPROVED" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("Approval Response Status:", res.status);
    console.log("Approval Response Data:", res.data);

    // 4. Check DB
    const updated = await prisma.user.findUnique({ where: { id: org.id } });
    console.log("Updated Status in DB:", updated.verificationStatus);

    if (updated.verificationStatus === "APPROVED") {
      console.log("✅ SUCCESS: Organization Approved.");
    } else {
      console.error("❌ FAILURE: Status did not change.");
    }

  } catch (error) {
    console.error("❌ API FAILURE:", error.response ? error.response.data : error.message);
  } finally {
    // Cleanup
    await prisma.user.delete({ where: { id: org.id } });
    await prisma.$disconnect();
  }
}

main();
