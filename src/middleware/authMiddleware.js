import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import prisma from "../config/db.js";

dotenv.config();

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader =
      req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Auth Middleware Error: Auth header missing or malformed", authHeader);
      return res.status(401).json({ message: "Unauthorized: Missing header" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      console.error("Auth Middleware Error: Token missing in Bearer header");
      return res.status(401).json({ message: "Unauthorized: Missing token string" });
    }

    // decode token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("Auth Middleware Error: JWT Verification Failed", err.message);
      throw err;
    }

    // Fetch fresh user data from DB to get real-time verification status
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, verificationStatus: true }
    });

    if (!user) {
      console.error("Auth Middleware Error: User not found in DB for ID:", decoded.id);
      return res.status(401).json({ message: "User not found" });
    }

    // attach user data including computed isVerified
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.verificationStatus === "APPROVED",
    };

    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);

    return res.status(401).json({
      message:
        err.name === "TokenExpiredError"
          ? "Token expired, please log in again"
          : "Invalid token",
    });
  }
};

