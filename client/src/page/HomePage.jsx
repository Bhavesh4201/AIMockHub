import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/InterviewContext";
import ResumeUpload from "../components/ResumeUpload";

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome to AI Mock Interview Hub
          </h1>
          <p className="text-gray-600">
            {user?.email ? `Hello, ${user.email}` : "Prepare for your next interview"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Upload Your Resume
            </h2>
            <p className="text-gray-600 mb-4">
              Upload your resume to extract skills and generate personalized interview questions.
            </p>
            <ResumeUpload />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Start Interview
            </h2>
            <p className="text-gray-600 mb-4">
              Begin your AI-powered mock interview session. Answer questions and receive real-time feedback.
            </p>
            <Link
              to="/interview"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Start Interview
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">1</div>
              <h3 className="font-semibold text-gray-800 mb-2">Upload Resume</h3>
              <p className="text-sm text-gray-600">
                Upload your PDF resume to extract your skills and experience.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">2</div>
              <h3 className="font-semibold text-gray-800 mb-2">Take Interview</h3>
              <p className="text-sm text-gray-600">
                Answer AI-generated questions while being analyzed for behavior and emotions.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">3</div>
              <h3 className="font-semibold text-gray-800 mb-2">Get Feedback</h3>
              <p className="text-sm text-gray-600">
                Receive detailed feedback on your answers and interview performance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
