import express from "express";

import { getSkillsPage } from "../controllers/skillsController.js";

const router = express.Router();

router.get("/", getSkillsPage);

export default router;