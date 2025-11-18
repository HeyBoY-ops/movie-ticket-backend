
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Routes
import authRoutes from "./routes/authRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";

dotenv.config();

const app = express();
export const prisma = new PrismaClient();   // <<<<<< NEW

// Remove MySQL connectDB (not needed anymore)

// middleware setup
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);



// health check
app.get("/", async (req, res) => {
  try {
    await prisma.$connect();
    res.status(200).send("Backend running with Prisma + MySQL");
  } catch (err) {
    res.status(500).send("DB connection failed");
  }
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
