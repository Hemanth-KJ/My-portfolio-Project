
import "dotenv/config";

import express from "express";
import cors from "cors";
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

const app = express();

const PORT = Number(process.env.PORT || 5000);
const isProduction = process.env.NODE_ENV === "production";

// =========================================================
// PROXY CONFIGURATION
// =========================================================

// Render uses a reverse proxy.
// Trust only the first proxy hop.
if (isProduction) {
  app.set("trust proxy", 1);
}

// =========================================================
// SECURITY
// =========================================================

app.disable("x-powered-by");
app.use(helmet());

// =========================================================
// CORS
// =========================================================

const allowedOrigins = [
  "http://localhost:5173",
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean),
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        Object.assign(new Error("Not allowed by CORS"), {
          status: 403,
        })
      );
    },
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
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

app.use(
  morgan(isProduction ? "combined" : "dev")
);

// =========================================================
// HEALTH CHECKS
// =========================================================

// Lightweight health check for Render.
// Does not require a database query.
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Portfolio API is running",
  });
});

// Database health check.
// Preserves your existing endpoint.
app.get("/api/v1/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    return res.status(200).json({
      success: true,
      message: "Portfolio API is running",
      database: "connected",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error(
      "Database health check failed:",
      error.message
    );

    return res.status(503).json({
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
  console.error(
    "Unhandled server error:",
    error.message
  );

  const status =
    Number.isInteger(error.status) &&
    error.status >= 400 &&
    error.status < 600
      ? error.status
      : 500;

  res.status(status).json({
    success: false,
    message:
      isProduction && status === 500
        ? "Internal server error"
        : error.message,
  });
});

// =========================================================
// START SERVER
// =========================================================

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Portfolio API running on port ${PORT}`
  );
});
