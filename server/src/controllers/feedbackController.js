import aiService from "../services/aiService.js";
import { Feedback } from "../models/Feedback.models.js";
import { InterviewSession } from "../models/interviewSession.model.js";

export const feedbackGenerater = async(req, res) => {
  try {
    const { text_ans, session_id, question_id, user_id, emotion_data } = req.body;
    
    console.log("Feedback Controller - Request body:", { text_ans, session_id, question_id, user_id, emotion_data });
    
    if (!text_ans) {
      return res.status(400).json({ 
        success: false,
        message: "Text answer is required" 
      });
    }

    if (!text_ans.trim()) {
      return res.status(400).json({ 
        success: false,
        message: "Text answer cannot be empty" 
      });
    }

    // Generate feedback using AI service
    console.log("Sending to AI service - text_ans:", text_ans.substring(0, 50) + "...");
    const aiFeedback = await aiService.feedbackGenerater(text_ans, emotion_data);
    console.log("AI service response:", aiFeedback);
    
    // Check if AI service returned an error
    if (!aiFeedback.success) {
      return res.status(500).json({
        success: false,
        error: "Failed to generate feedback",
        message: aiFeedback.error || "AI service returned an error"
      });
    }
    
    // Extract feedback data
    const feedbackData = aiFeedback.data || aiFeedback;
    
    // Save feedback to database if session_id, question_id, and user_id are provided
    if (session_id && question_id && user_id) {
      try {
        // Check if feedback already exists for this question in this session
        const existingFeedback = await Feedback.findOne({
          session_id,
          question_id,
          user_id
        });

        const feedbackToSave = {
          user_id,
          session_id,
          question_id,
          user_answer: text_ans,
          feedback_text: typeof feedbackData === 'string' ? feedbackData : feedbackData.feedback || '',
          strengths: Array.isArray(feedbackData.strengths) ? feedbackData.strengths : (feedbackData.strengths ? [feedbackData.strengths] : []),
          improvements: Array.isArray(feedbackData.improvements) ? feedbackData.improvements : (feedbackData.improvements ? [feedbackData.improvements] : []),
          score: feedbackData.score,
          emotion: emotion_data ? (Array.isArray(emotion_data.emotionHistory) ? emotion_data.emotionHistory : [emotion_data.predominantEmotion]) : [],
          feedback_data: feedbackData
        };

        if (existingFeedback) {
          // Update existing feedback
          Object.assign(existingFeedback, feedbackToSave);
          await existingFeedback.save();
        } else {
          // Create new feedback
          await Feedback.create(feedbackToSave);
        }
      } catch (dbError) {
        console.error("Error saving feedback to database:", dbError);
        // Continue even if DB save fails, still return the feedback
      }
    }

    return res.json({
        success: true,
        data: feedbackData
    });

  } catch (error) {
    console.error("Error generating feedback:", error.message);
    res.status(500).json({ 
      success: false,
      error: "Failed to generate feedback",
      message: error.message 
    });
  }
};

export const getSessionFeedback = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const feedbacks = await Feedback.find({ session_id: sessionId })
      .populate('question_id', 'question_text difficulty')
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: feedbacks
    });
  } catch (error) {
    console.error("Error fetching session feedback:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch feedback",
      error: error.message 
    });
  }
};

export const getQuestionFeedback = async (req, res) => {
  try {
    const { sessionId, questionId } = req.params;
    
    const feedback = await Feedback.findOne({ 
      session_id: sessionId,
      question_id: questionId
    })
      .populate('question_id', 'question_text difficulty')
      .lean();

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error("Error fetching question feedback:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch feedback",
      error: error.message 
    });
  }
};

