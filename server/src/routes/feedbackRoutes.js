import express from 'express';
import {
  feedbackGenerater,
  getSessionFeedback,
  getQuestionFeedback
} from '../controllers/feedbackController.js'

const router = express.Router();

router.post('/generate', feedbackGenerater);
router.get('/session/:sessionId', getSessionFeedback);
router.get('/session/:sessionId/question/:questionId', getQuestionFeedback);

export default router