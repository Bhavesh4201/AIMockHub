import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },

  question_text: String,   // snapshot saved so even if Q changes, session stays correct
  userAnswer: String,
  correctAnswer: String,
  difficulty: String,

  emotionData: { type: Object },  // raw emotion + face-api data
  behaviorScore: Number,          // processed score 0–1
  timestamp: { type: Date, default: Date.now }
});

const interviewSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  startTime: { type: Date, default: Date.now },
  endTime: Date,

  questions: [answerSchema],    // contains all answers for this session

  overallEmotionSummary: { type: Object },
  overallScore: Number           // computed after interview
});

export const InterviewSession =
  mongoose.model("InterviewSession", interviewSessionSchema);
