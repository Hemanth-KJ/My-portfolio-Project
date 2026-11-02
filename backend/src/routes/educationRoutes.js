import express from "express";

import {
  getEducation,
} from "../controllers/educationController.js";

const router = express.Router();


// ============================================================
// GET EDUCATION
// ============================================================

router.get("/", getEducation);


export default router;