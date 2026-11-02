import express from "express";
import { getResumePage } from "../controllers/resumeController.js";

const router = express.Router();


/* =========================================================
   GET RESUME
========================================================= */

router.get("/", getResumePage);


export default router;