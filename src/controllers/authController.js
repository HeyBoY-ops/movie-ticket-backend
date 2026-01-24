import bcrypt from "bcryptjs";
import prisma from "../config/db.js";
import { generateToken } from "../utils/generateToken.js";

/* =======================
        SIGNUP
   ======================= */
export const signup = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const displayName = name || username;

    if (!displayName || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required." });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return res.status(409).json({ message: "User already exists." });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create user - role based on email (admin for a@gmail.com)
    const user = await prisma.user.create({
      data: {
        name: displayName,
        email,
        password: hash,
        role: email === "a@gmail.com" ? "ADMIN" : "USER",
      },
    });

    // Generate token with role
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Safe user object
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role, // <-- IMPORTANT
    };

    res.status(201).json({
      message: "Signup successful",
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* =======================
        LOGIN
   ======================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required." });

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return res.status(401).json({ message: "Invalid credentials." });

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Invalid credentials." });

    // Token with role
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Return safe user object INCLUDING ROLE ⬇
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role, // <-- IMPORTANT
    };

    res.status(200).json({
      message: "Login successful",
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* =======================
    GET LOGGED-IN USER
   ======================= */
export const me = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true, // <-- IMPORTANT
        createdAt: true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (err) {
    console.error("ME endpoint error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
