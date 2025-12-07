import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/InterviewContext";

import HomePage from "./page/HomePage";
import InterviewPage from "./page/InterviewPage";
import FeedbackPage from "./page/FeedbackPage";
import LoginPage from "./page/LoginPage";
import RegisterPage from "./page/RegisterPage";
import NotFound from "./page/NotFound";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <>
      {isAuthenticated && location.pathname !== "/login" && location.pathname !== "/register" && <Navbar />}

      <Routes>
        {/* AUTH PAGES */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* PROTECTED PAGES */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <InterviewPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/feedback"
          element={
            <ProtectedRoute>
              <FeedbackPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
