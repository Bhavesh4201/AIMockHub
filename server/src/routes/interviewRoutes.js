import express from "express";
import { 
  interviewStartSession, 
  interviewAnswerSession, 
  interviewEndSession,
  getUserSessions
} from "../controllers/interviewController.js";

const router = express.Router();

router.post("/:userId/start", interviewStartSession);
router.post("/:sessionId/answer", interviewAnswerSession);
router.post("/:sessionId/end", interviewEndSession);
router.get("/:userId/sessions", getUserSessions);

export default router;

