
import express from "express";

import {
  getEducation,
  updateEducation,
} from "../controllers/educationController.js";

import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

// Public Education page
router.get("/", getEducation);

// Protected Education update
router.put("/", adminAuthMiddleware, updateEducation);

export default router;
