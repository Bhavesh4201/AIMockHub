import React, { useState } from "react";
import FeedbackDashboard from "./FeedbackDashboard";

const QuestionCard = ({ question, onAnswerSubmit, sessionId }) => {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer.trim()) {
      return;
    }

    if (onAnswerSubmit) {
      onAnswerSubmit({
        questionId: question._id || question.id,
        userAnswer: answer,
        question_text: question.question_text,
        difficulty: question.difficulty,
      });
    }

    setSubmitted(true);
    setShowFeedback(true);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty || "Medium"}
            </span>
            {question.skill && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {question.skill}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            {question.question_text}
          </h3>
        </div>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
              Your Answer:
            </label>
            <textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            Submit Answer
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-sm font-medium text-gray-700 mb-2">Your Answer:</p>
            <p className="text-gray-800 whitespace-pre-wrap">{answer}</p>
          </div>
          
          {showFeedback && (
            <FeedbackDashboard
              sessionId={sessionId}
              questionId={question._id || question.id}
              userAnswer={answer}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
