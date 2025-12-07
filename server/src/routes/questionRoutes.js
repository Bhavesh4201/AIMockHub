import express, { Router } from "express";
import { generateQuestions } from "../controllers/questionController.js";

const router = express.Router();

router.post("/:id/generater", generateQuestions);

export default router;
