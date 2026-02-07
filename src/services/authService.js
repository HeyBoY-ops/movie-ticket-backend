import prisma from "../config/db.js";
import bcrypt from "bcryptjs";

export const registerOrganization = async (data) => {
  const { name, email, password, organizationDetails } = data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("User already exists");

  const hash = await bcrypt.hash(password, 10);

  return await prisma.user.create({
    data: {
      name,
      email,
      password: hash,
      role: "ORGANIZATION",
      verificationStatus: "PENDING",
      organizationDetails
    }
  });
};
