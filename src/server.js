
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Routes
import authRoutes from "./routes/authRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import theaterRoutes from "./routes/theaterRoutes.js";
import showRoutes from "./routes/showRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();
import prisma from "./config/db.js";
export { prisma };


// middleware setup
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));


app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://movie-ticket-app-drab.vercel.app",
      "https://movie-ticket-backend-d25t.onrender.com",
      "https://movie-ticket-hd97rm242-abhisheks-projects-a1a026b5.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);




app.get("/", (req, res) => {
  res.send("Backend running with Prisma + MongoDB");
});

// DEBUG ENDPOINT
app.get("/api/debug/users", async (req, res) => {
  try {
    const count = await prisma.user.count();
    const users = await prisma.user.findMany({ take: 5 });
    res.json({
      count,
      dbUrl: process.env.DATABASE_URL ? "Loaded" : "Missing",
      sample: users
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/theaters", theaterRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
import dashboardRoutes from "./routes/dashboardRoutes.js";
app.use("/api/dashboard", dashboardRoutes);

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

//avoid prisma crashes
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit();
});