
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Routes
import authRoutes from "./routes/authRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";

dotenv.config();

const app = express();
export const prisma = new PrismaClient();


// middleware setup
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));


app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://movie-ticket-app-drab.vercel.app",
      "https://movie-ticket-backend-d25t.onrender.com"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);



app.get("/", (req, res) => {
  res.send("Backend running with Prisma + MongoDB");
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

//avoid prisma crashes
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit();
});