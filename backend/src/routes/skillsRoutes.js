
import express from "express";

import {
  getSkillsPage,
  updateSkillsPage,
} from "../controllers/skillsController.js";

import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

router.get("/", getSkillsPage);

router.put("/", adminAuthMiddleware, updateSkillsPage);

export default router;
