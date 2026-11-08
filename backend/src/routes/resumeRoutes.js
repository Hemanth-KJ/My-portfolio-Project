
import express from "express";

import {
  getResumePage,
  updateResumePageController,
} from "../controllers/resumeController.js";

import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

/* =========================================================
   PUBLIC
========================================================= */

router.get("/", getResumePage);

/* =========================================================
   ADMIN
========================================================= */

router.put(
  "/",
  adminAuthMiddleware,
  updateResumePageController
);

export default router;
