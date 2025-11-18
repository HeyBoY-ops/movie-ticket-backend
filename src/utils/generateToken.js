import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,      // ⭐ include role in token
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};
