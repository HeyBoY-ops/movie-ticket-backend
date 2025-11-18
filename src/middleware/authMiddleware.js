import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader =
      req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach user data including role
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,    
    };

    next();
  } catch (err) {
    console.error("JWT Error:", err.message);

    return res.status(401).json({
      message:
        err.name === "TokenExpiredError"
          ? "Token expired, please log in again"
          : "Invalid token",
    });
  }
};

