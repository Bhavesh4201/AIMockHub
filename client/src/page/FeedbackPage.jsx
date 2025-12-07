import React, { useState, useEffect } from "react";
import { useAuth } from "../context/InterviewContext";
import { interviewAPI } from "../services/api.js";
import FeedbackDashboard from "../components/FeedbackDashboard";

const FeedbackPage = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.id) {
      fetchSessions();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await interviewAPI.getUserSessions(user.id);
      if (res.data.success) {
        setSessions(res.data.data || []);
      } else {
        setError(res.data.message || "Failed to fetch sessions");
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError(err.response?.data?.message || err.message || "Failed to load interview sessions");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800 mb-4">{error}</p>
            <button
              onClick={fetchSessions}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Interview Feedback</h1>
          <p className="text-gray-600">
            Review your interview performance and get detailed feedback
          </p>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              No Interview Sessions Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Complete an interview to see your feedback here.
            </p>
            <a
              href="/interview"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Start Interview
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {sessions.map((session, sessionIdx) => (
              <div key={session.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      Interview Session {sessions.length - sessionIdx}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(session.date).toLocaleDateString()}
                    </p>
                  </div>
                  {session.overallScore && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Overall Score</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {session.overallScore}%
                      </p>
                    </div>
                  )}
                </div>

                {session.questions?.map((q, idx) => (
                  <div key={idx} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Question {idx + 1}
                    </h4>
                    <p className="text-gray-700 mb-2">{q.question_text}</p>
                    {q.userAnswer && (
                      <div className="mb-3 p-3 bg-white rounded border border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-1">Your Answer:</p>
                        <p className="text-gray-800 whitespace-pre-wrap">{q.userAnswer}</p>
                      </div>
                    )}
                    <FeedbackDashboard
                      sessionId={session.id}
                      questionId={q.question_id}
                      userAnswer={q.userAnswer}
                      savedFeedback={q.feedback}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
