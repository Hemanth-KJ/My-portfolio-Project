import express from "express";

import {
  getContactPage,
  submitContactMessage,
} from "../controllers/contactController.js";

const router = express.Router();

// GET CONTACT PAGE
router.get("/", getContactPage);

// SUBMIT CONTACT MESSAGE
router.post("/messages", submitContactMessage);

export default router;