import express from "express";

import {
  getHome,
  updateHome,
} from "../controllers/homeController.js";

import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

// Public endpoint
router.get("/", getHome);

// Protected endpoint
router.put("/", adminAuthMiddleware, updateHome);

export default router;