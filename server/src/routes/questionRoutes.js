import express, { Router } from "express";
import { generateQuestions } from "../controllers/questionController";


const router = express.Router();

router.post("/generate", generateQuestions)


export default router;

