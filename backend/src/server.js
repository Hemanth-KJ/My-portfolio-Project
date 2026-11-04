import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";

import pool from "./config/db.js";

import homeRoutes from "./routes/homeRoutes.js";
import aboutRoutes from "./routes/aboutRoutes.js";
import educationRoutes from "./routes/educationRoutes.js";
import skillsRoutes from "./routes/skillsRoutes.js";
import projectsRoutes from "./routes/projectsRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;


// =========================================================
// SECURITY
// =========================================================

app.use(helmet());


// =========================================================
// CORS
// =========================================================

const allowedOrigins = [
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);


// =========================================================
// BODY PARSING
// =========================================================

app.use(
  express.json({
    limit: "10kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  })
);


// =========================================================
// LOGGING
// =========================================================

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));


// =========================================================
// HEALTH CHECK
// =========================================================

app.get("/api/v1/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.status(200).json({
      success: true,
      message: "Portfolio API is running",
      database: "connected",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});


// =========================================================
// API ROUTES
// =========================================================

app.use("/api/v1/home", homeRoutes);
app.use("/api/v1/about", aboutRoutes);
app.use("/api/v1/education", educationRoutes);
app.use("/api/v1/skills", skillsRoutes);
app.use("/api/v1/projects", projectsRoutes);
app.use("/api/v1/resume", resumeRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/admin", adminAuthRoutes);


// =========================================================
// 404 HANDLER
// =========================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});


// =========================================================
// GLOBAL ERROR HANDLER
// =========================================================

app.use((error, req, res, next) => {
  console.error("Unhandled server error:", error);

  res.status(error.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message,
  });
});


// =========================================================
// START SERVER
// =========================================================

app.listen(PORT, () => {
  console.log(`Portfolio API running on port ${PORT}`);
});