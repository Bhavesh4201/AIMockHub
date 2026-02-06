import React, { useState, useEffect } from "react";
import { feedbackAPI } from "../services/api.js";
import { useAuth } from "../context/InterviewContext";

// Helper function to generate percentage-based emotion data from answer text
const generateEmotionDataFromText = (answerText) => {
  if (!answerText || !answerText.trim()) {
    return {
      predominantEmotion: "neutral",
      avgConfidence: 50,
      avgStress: 50,
      avgEngagement: 50,
      source: "text_analysis_fallback"
    };
  }

  const text = answerText.toLowerCase();
  const words = text.split(/\s+/);
  const wordCount = words.length;
  const charCount = text.length;

  // Confidence indicators (positive words/phrases)
  const confidenceIndicators = [
    "definitely", "certainly", "absolutely", "sure", "confident",
    "know", "understand", "clear", "obvious", "straightforward",
    "would", "will", "can", "should", "implement", "use", "create",
    "build", "develop", "design", "architect", "solution"
  ];
  
  // Stress/uncertainty indicators (negative words/phrases)
  const stressIndicators = [
    "maybe", "perhaps", "might", "could", "not sure", "uncertain",
    "think", "guess", "probably", "possibly", "difficult", "hard",
    "challenge", "problem", "issue", "error", "bug", "don't know",
    "unsure", "confused", "complicated", "complex"
  ];
  
  // Engagement indicators (detailed explanations, examples)
  const engagementIndicators = [
    "example", "instance", "case", "scenario", "because", "since",
    "therefore", "however", "additionally", "furthermore", "also",
    "first", "second", "then", "next", "finally", "step", "process",
    "approach", "method", "technique", "way", "how"
  ];

  // Count matches
  let confidenceScore = 0;
  let stressScore = 0;
  let engagementScore = 0;

  words.forEach(word => {
    if (confidenceIndicators.some(ind => word.includes(ind))) confidenceScore++;
    if (stressIndicators.some(ind => word.includes(ind))) stressScore++;
    if (engagementIndicators.some(ind => word.includes(ind))) engagementScore++;
  });

  // Calculate percentages based on text analysis
  // Confidence: Based on positive indicators and answer length (longer = more confident)
  const confidenceBase = Math.min(confidenceScore * 10, 40);
  const lengthBonus = Math.min(wordCount / 5, 30); // Up to 30% for detailed answers
  const avgConfidence = Math.min(50 + confidenceBase + lengthBonus - (stressScore * 5), 95);

  // Stress: Based on uncertainty indicators
  const stressBase = Math.min(stressScore * 8, 50);
  const avgStress = Math.min(30 + stressBase, 90);

  // Engagement: Based on detailed explanations and examples
  const engagementBase = Math.min(engagementScore * 8, 40);
  const detailBonus = wordCount > 50 ? 20 : wordCount > 20 ? 10 : 0;
  const avgEngagement = Math.min(40 + engagementBase + detailBonus, 95);

  // Determine predominant emotion based on scores
  let predominantEmotion = "neutral";
  if (avgConfidence >= 70 && avgStress < 40) {
    predominantEmotion = "confident";
  } else if (avgConfidence < 50 || avgStress > 60) {
    predominantEmotion = "uncertain";
  } else if (avgEngagement >= 70) {
    predominantEmotion = "engaged";
  }

  return {
    predominantEmotion,
    avgConfidence: Math.round(avgConfidence),
    avgStress: Math.round(avgStress),
    avgEngagement: Math.round(avgEngagement),
    emotionCounts: { [predominantEmotion]: 1 },
    totalSamples: 1,
    duration: 0,
    emotionHistory: [predominantEmotion],
    source: "text_analysis_fallback",
    analysisNote: "Emotion data estimated from answer text analysis (video tracking unavailable)"
  };
};

const FeedbackDashboard = ({ sessionId, questionId, userAnswer, savedFeedback, emotionData }) => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState(savedFeedback || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load saved feedback if available
  useEffect(() => {
    if (savedFeedback) {
      // Convert saved feedback format to display format
      const displayFeedback = {
        feedback: savedFeedback.feedback_text || savedFeedback.feedback_data?.feedback,
        strengths: savedFeedback.strengths || [],
        improvements: savedFeedback.improvements || [],
        emotion_improvements: savedFeedback.emotion_improvements || [],
        score: savedFeedback.score
      };
      setFeedback(displayFeedback);
    }
  }, [savedFeedback]);

  const generateFeedback = async () => {
    if (!userAnswer || !userAnswer.trim()) {
      setError("No answer provided");
      return;
    }

    if (!sessionId || !questionId || !user?.id) {
      setError("Session, question, and user information required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Get final emotion data if available - try multiple sources
      let finalEmotionData = emotionData;
      
      if (!finalEmotionData && window.getQuestionEmotionData) {
        finalEmotionData = window.getQuestionEmotionData();
      }
      
      // Fallback: Generate percentage-based emotion data from answer text
      if (!finalEmotionData) {
        finalEmotionData = generateEmotionDataFromText(userAnswer);
      }
      
      const res = await feedbackAPI.generate(
        userAnswer, 
        sessionId, 
        questionId, 
        user.id,
        finalEmotionData
      );
      
      if (res.data.success) {
        const feedbackData = res.data.data;
        
        // Format feedback for display
        const displayFeedback = {
          feedback: feedbackData.feedback || feedbackData.feedback_text,
          strengths: feedbackData.strengths || [],
          improvements: feedbackData.improvements || [],
          emotion_improvements: feedbackData.emotion_improvements || [],
          score: feedbackData.score
        };
        setFeedback(displayFeedback);
      } else {
        setError(res.data.message || "Failed to generate feedback");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error generating feedback");
      console.error("Feedback error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Generating feedback...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <p className="text-red-800 text-sm">{error}</p>
      </div>
    );
  }

  if (!feedback && !loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600 text-sm mb-3">Click the button below to generate feedback for your answer.</p>
        <button
          onClick={generateFeedback}
          disabled={!userAnswer || !userAnswer.trim() || !sessionId || !questionId || !user?.id}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
        >
          Generate Feedback
        </button>
      </div>
    );
  }

  // Check if feedback has any content to display
  const hasContent = typeof feedback === "string" || 
    (feedback && (
      feedback.feedback || 
      (feedback.strengths && ((Array.isArray(feedback.strengths) && feedback.strengths.length > 0) || (!Array.isArray(feedback.strengths) && feedback.strengths))) ||
      (feedback.improvements && ((Array.isArray(feedback.improvements) && feedback.improvements.length > 0) || (!Array.isArray(feedback.improvements) && feedback.improvements))) ||
      (feedback.emotion_improvements && Array.isArray(feedback.emotion_improvements) && feedback.emotion_improvements.length > 0) ||
      (feedback.score !== undefined && feedback.score !== null)
    ));

  if (!hasContent) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Feedback</h3>
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-800 text-sm">Feedback generated but no content available. Check console for details.</p>
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(feedback, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Feedback</h3>
        {savedFeedback && userAnswer && sessionId && questionId && user?.id && (
          <button
            onClick={generateFeedback}
            disabled={loading}
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
            title="Regenerate feedback"
          >
            {loading ? "Regenerating..." : "Regenerate"}
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {typeof feedback === "string" ? (
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{feedback}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Main feedback text */}
            {feedback.feedback && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Overall Feedback:</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{feedback.feedback}</p>
              </div>
            )}
            
            {/* Score */}
            {feedback.score !== undefined && feedback.score !== null && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800">
                  Score: <span className="text-lg font-bold">{feedback.score}%</span>
                </p>
              </div>
            )}
            
            {/* Strengths */}
            {feedback.strengths && (
              (Array.isArray(feedback.strengths) && feedback.strengths.length > 0) || 
              (!Array.isArray(feedback.strengths) && feedback.strengths)
            ) ? (
              <div>
                <h4 className="font-semibold text-green-700 mb-2">Strengths:</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {Array.isArray(feedback.strengths) 
                    ? feedback.strengths.map((item, idx) => <li key={idx}>{item}</li>)
                    : <li>{feedback.strengths}</li>
                  }
                </ul>
              </div>
            ) : null}
            
            {/* Improvements */}
            {feedback.improvements && (
              (Array.isArray(feedback.improvements) && feedback.improvements.length > 0) || 
              (!Array.isArray(feedback.improvements) && feedback.improvements)
            ) ? (
              <div>
                <h4 className="font-semibold text-orange-700 mb-2">Areas for Improvement:</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {Array.isArray(feedback.improvements)
                    ? feedback.improvements.map((item, idx) => <li key={idx}>{item}</li>)
                    : <li>{feedback.improvements}</li>
                  }
                </ul>
              </div>
            ) : null}
            
            {/* Emotion Improvements */}
            {feedback.emotion_improvements && 
             Array.isArray(feedback.emotion_improvements) && 
             feedback.emotion_improvements.length > 0 ? (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-700 mb-2">Interview Presence & Emotional Performance:</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {feedback.emotion_improvements.map((item, idx) => (
                    <li key={idx} className="text-gray-800">{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackDashboard;

