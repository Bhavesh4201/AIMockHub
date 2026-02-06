import aiService from "../services/aiService.js";
import { Feedback } from "../models/Feedback.models.js";
import { InterviewSession } from "../models/interviewSession.model.js";

export const feedbackGenerater = async(req, res) => {
  try {
    const { text_ans, session_id, question_id, user_id, emotion_data } = req.body;
    
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
    const aiFeedback = await aiService.feedbackGenerater(text_ans, emotion_data);
    
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

        // Store only essential emotion metrics, not full history arrays
        const emotionSummary = emotion_data ? {
          predominantEmotion: emotion_data.predominantEmotion || "neutral",
          avgConfidence: emotion_data.avgConfidence || 0,
          avgStress: emotion_data.avgStress || 0,
          avgEngagement: emotion_data.avgEngagement || 0,
          source: emotion_data.source || "video_tracking"
        } : null;

        const feedbackToSave = {
          user_id,
          session_id,
          question_id,
          user_answer: text_ans,
          feedback_text: typeof feedbackData === 'string' ? feedbackData : feedbackData.feedback || '',
          strengths: Array.isArray(feedbackData.strengths) ? feedbackData.strengths : (feedbackData.strengths ? [feedbackData.strengths] : []),
          improvements: Array.isArray(feedbackData.improvements) ? feedbackData.improvements : (feedbackData.improvements ? [feedbackData.improvements] : []),
          emotion_improvements: Array.isArray(feedbackData.emotion_improvements) ? feedbackData.emotion_improvements : [],
          score: feedbackData.score,
          emotion: emotionSummary ? [emotionSummary.predominantEmotion] : [],
          // Store only essential feedback data, not full duplicate object
          feedback_data: {
            emotion_summary: emotionSummary,
            emotion_improvements: feedbackData.emotion_improvements || []
          }
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

