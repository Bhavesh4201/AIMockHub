import React, { useState, useEffect } from "react";
import { useAuth } from "../context/InterviewContext";
import { questionAPI, interviewAPI } from "../services/api.js";
import VideoRecorder from "./VideoRecorder";
import FeedbackDashboard from "./FeedbackDashboard";

const InterviewUI = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [currentQuestionEmotionData, setCurrentQuestionEmotionData] = useState(null);

  // Reset answer and emotion data when question changes
  useEffect(() => {
    setAnswer("");
    setSubmitted(false);
    setCurrentQuestionEmotionData(null);
  }, [currentQuestionIndex]);
  
  // Handle emotion data updates from VideoRecorder
  const handleEmotionDataUpdate = (emotionData) => {
    if (emotionData) {
      setCurrentQuestionEmotionData(emotionData);
    }
  };

  useEffect(() => {
    if (user?.id && !interviewStarted) {
      initializeInterview();
    }
  }, [user, interviewStarted]);


  const initializeInterview = async () => {
    if (!user?.id) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Start interview session
      const sessionRes = await interviewAPI.startSession(user.id);
      if (sessionRes.data.success) {
        setSessionId(sessionRes.data.data.sessionId);
      }

      // Generate questions
      const questionsRes = await questionAPI.generate(user.id);
      if (questionsRes.data.success) {
        const questionsData = questionsRes.data.data || [];
        setQuestions(questionsData);
        setInterviewStarted(true);
      } else {
        setError("Failed to generate questions");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to initialize interview");
      console.error("Interview initialization error:", err);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswerToServer = async (answerData) => {
    if (!sessionId) return;

    try {
      const payload = {
        ...answerData,
        emotionData: currentQuestionEmotionData || {},
        behaviorScore: (currentQuestionEmotionData && currentQuestionEmotionData.avgConfidence) ? currentQuestionEmotionData.avgConfidence : 0,
      };
      await interviewAPI.submitAnswer(sessionId, payload);
    } catch (err) {
      console.error("[InterviewUI] Error submitting answer:", err);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      endInterview();
    }
  };

  const endInterview = async () => {
    if (!sessionId) return;

    try {
      await interviewAPI.endSession(sessionId, {
        overallEmotionSummary: {},
        overallScore: 0,
      });
      setInterviewEnded(true);
    } catch (err) {
      console.error("Error ending interview:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing interview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (interviewEnded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-white rounded-lg shadow-md p-8 max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Interview Completed!</h2>
          <p className="text-gray-600 mb-6">Thank you for completing the interview.</p>
          <button
            onClick={() => window.location.href = "/feedback"}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            View Feedback
          </button>
        </div>
      </div>
    );
  }

  const handleAnswerChange = (newAnswer) => {
    setAnswer(newAnswer);
  };

  const handleAnswerSubmit = async () => {
    if (!answer.trim()) {
      alert("Please enter your answer before submitting");
      return;
    }

    // Capture final emotion data before submitting
    const finalEmotionData = currentQuestionEmotionData || 
      (window.getQuestionEmotionData ? window.getQuestionEmotionData() : null);
    
    // Update state with final emotion data if we got it
    if (finalEmotionData && !currentQuestionEmotionData) {
      setCurrentQuestionEmotionData(finalEmotionData);
    }

    await submitAnswerToServer({
      questionId: currentQuestion._id || currentQuestion.id,
      userAnswer: answer,
      question_text: currentQuestion.question_text,
      difficulty: currentQuestion.difficulty,
    });

    setSubmitted(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswer("");
      setSubmitted(false);
    } else {
      endInterview();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">
            {questions.length === 0 ? "No questions available. Please upload a resume first." : "Loading question..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Progress */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-2xl font-bold text-gray-800">Interview Session</h1>
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Question and Answer (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  currentQuestion.difficulty === "easy" ? "bg-green-100 text-green-800" :
                  currentQuestion.difficulty === "medium" ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {currentQuestion.difficulty || "Medium"}
                </span>
                {currentQuestion.skill && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {currentQuestion.skill}
                  </span>
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-6 break-words">
                {currentQuestion.question_text || currentQuestion.question || currentQuestion.text || "Question text not available"}
              </h2>

              {/* Answer Input */}
              {!submitted ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Answer:
                    </label>
                    <textarea
                      id="answer"
                      value={answer}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      placeholder="Type your answer here. Be detailed and specific..."
                      rows={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleAnswerSubmit}
                      disabled={!answer.trim()}
                      className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                    >
                      Submit Answer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 mb-2">Your Answer:</p>
                    <p className="text-gray-800 whitespace-pre-wrap">{answer}</p>
                  </div>
                  
                  {/* Feedback Section */}
                  <FeedbackDashboard
                    sessionId={sessionId}
                    questionId={currentQuestion._id || currentQuestion.id}
                    userAnswer={answer}
                    emotionData={currentQuestionEmotionData}
                  />
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium rounded-lg transition-colors"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={handleNext}
                      className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                    >
                      {currentQuestionIndex === questions.length - 1 ? "Finish Interview →" : "Next Question →"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Video Recorder (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
              <VideoRecorder 
                sessionId={sessionId} 
                questionId={currentQuestion._id || currentQuestion.id}
                onEmotionDataUpdate={handleEmotionDataUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewUI;

