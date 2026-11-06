
import express from "express";

import {
  getAbout,
  updateAbout,
} from "../controllers/aboutController.js";

import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

// Public About page.
router.get("/", getAbout);

// Admin-only About editor.
router.put("/", adminAuthMiddleware, updateAbout);

export default router;
