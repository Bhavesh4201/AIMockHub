import { InterviewSession } from "../models/interviewSession.model.js";
import { User } from "../models/User.models.js";
import { Question } from "../models/Question.models.js";
import { Feedback } from "../models/Feedback.models.js";

export const interviewStartSession = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const session = await InterviewSession.create({
      userId: user._id,
      startTime: new Date()
    });

    return res.status(201).json({
      success: true,
      message: "Interview session started",
      data: { sessionId: session._id }
    });
  } catch (error) {
    console.error("Error starting interview session:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to start interview session",
      error: error.message 
    });
  }
};

export const interviewAnswerSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId, userAnswer, emotionData, behaviorScore } = req.body;
    
    console.log("[interviewController] Received answer submission for session:", sessionId);
    console.log("[interviewController] Emotion data received:", JSON.stringify(emotionData, null, 2));
    console.log("[interviewController] Behavior score:", behaviorScore);
    console.log("[interviewController] Full payload:", JSON.stringify(req.body, null, 2));

    if (!questionId || !userAnswer) {
      return res.status(400).json({ 
        success: false,
        message: "Question ID and user answer are required" 
      });
    }

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const answerData = {
      questionId: question._id,
      question_text: question.question_text,
      userAnswer,
      correctAnswer: question.answer || "",
      difficulty: question.difficulty,
      emotionData: emotionData || {},
      behaviorScore: behaviorScore || 0,
      timestamp: new Date()
    };

    session.questions.push(answerData);
    await session.save();
    
    console.log("[interviewController] Answer saved successfully. Emotion data stored:", answerData.emotionData);

    return res.status(200).json({
      success: true,
      message: "Answer saved successfully",
      data: answerData
    });
  } catch (error) {
    console.error("[interviewController] Error saving answer:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to save answer",
      error: error.message 
    });
  }
};

export const interviewEndSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { overallEmotionSummary, overallScore } = req.body;

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    session.endTime = new Date();
    if (overallEmotionSummary) session.overallEmotionSummary = overallEmotionSummary;
    if (overallScore !== undefined) session.overallScore = overallScore;
    
    await session.save();

    return res.status(200).json({
      success: true,
      message: "Interview session ended",
      data: session
    });
  } catch (error) {
    console.error("Error ending interview session:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to end interview session",
      error: error.message 
    });
  }
};

export const getUserSessions = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const sessions = await InterviewSession.find({ userId })
      .sort({ startTime: -1 }) // Most recent first
      .populate('userId', 'name email')
      .lean();

    // Get all feedbacks for these sessions
    const sessionIds = sessions.map(s => s._id);
    const feedbacks = await Feedback.find({ 
      session_id: { $in: sessionIds },
      user_id: userId
    }).lean();

    // Create a map of feedback by session_id and question_id
    const feedbackMap = {};
    feedbacks.forEach(fb => {
      const key = `${fb.session_id}_${fb.question_id}`;
      feedbackMap[key] = fb;
    });

    // Format sessions for frontend
    const formattedSessions = sessions.map(session => ({
      id: session._id,
      date: session.startTime,
      endTime: session.endTime,
      overallScore: session.overallScore,
      questions: session.questions.map(q => {
        const feedbackKey = `${session._id}_${q.questionId}`;
        const savedFeedback = feedbackMap[feedbackKey];
        
        return {
          question_id: q.questionId,
          question_text: q.question_text,
          userAnswer: q.userAnswer,
          difficulty: q.difficulty,
          timestamp: q.timestamp,
          feedback: savedFeedback ? {
            feedback_text: savedFeedback.feedback_text,
            strengths: savedFeedback.strengths,
            improvements: savedFeedback.improvements,
            score: savedFeedback.score,
            feedback_data: savedFeedback.feedback_data
          } : null
        };
      })
    }));

    return res.status(200).json({
      success: true,
      data: formattedSessions
    });
  } catch (error) {
    console.error("Error fetching user sessions:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch interview sessions",
      error: error.message 
    });
  }
};    