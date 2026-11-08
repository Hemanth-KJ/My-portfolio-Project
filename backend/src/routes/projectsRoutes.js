
import express from "express";

import {
  getProjectsPage,
  updateProjectsPageController,
} from "../controllers/projectsController.js";

import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

// =========================================================
// PUBLIC ROUTE
// =========================================================

router.get("/", getProjectsPage);

// =========================================================
// ADMIN ROUTE
// =========================================================

router.put(
  "/",
  adminAuthMiddleware,
  updateProjectsPageController
);

export default router;
