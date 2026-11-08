
import express from "express";

import {
  getContactPage,
  submitContactMessage,
  updateContactPageController,
} from "../controllers/contactController.js";

import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

/* =========================================================
   PUBLIC ROUTES
========================================================= */

// Fetch Contact page content
router.get("/", getContactPage);

// Submit Contact form message
router.post("/messages", submitContactMessage);

/* =========================================================
   ADMIN ROUTES
========================================================= */

// Update Contact page content
router.put(
  "/",
  adminAuthMiddleware,
  updateContactPageController
);

export default router;
