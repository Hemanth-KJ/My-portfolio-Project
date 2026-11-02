import express from "express";
import { getProjectsPage } from "../controllers/projectsController.js";

const router = express.Router();


// =========================================================
// GET PROJECTS
// =========================================================

router.get("/", getProjectsPage);


export default router;