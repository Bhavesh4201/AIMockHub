import axios from "axios";
import Cookies from "js-cookie";
import { config } from "../config/env.js";

// Create axios instance with default config
const api = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor to add token if available
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      Cookies.remove("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (email, password) =>
    api.post("/api/user/login", { email, password }),
  register: (userData) =>
    api.post("/api/user/register", userData),
};

export const resumeAPI = {
  upload: (userId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/api/resume/${userId}/key`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export const questionAPI = {
  generate: (userId) =>
    api.post(`/api/questions/${userId}/generater`),
  getAll: () =>
    api.get("/api/questions"),
};

export const interviewAPI = {
  startSession: (userId) =>
    api.post(`/api/interview/${userId}/start`),
  submitAnswer: (sessionId, answerData) =>
    api.post(`/api/interview/${sessionId}/answer`, answerData),
  endSession: (sessionId, summary) =>
    api.post(`/api/interview/${sessionId}/end`, summary),
  getUserSessions: (userId) =>
    api.get(`/api/interview/${userId}/sessions`),
};

export const feedbackAPI = {
  generate: (textAnswer, sessionId, questionId, userId, emotionData) =>
    api.post("/api/feedback/generate", { 
      text_ans: textAnswer,
      session_id: sessionId,
      question_id: questionId,
      user_id: userId,
      emotion_data: emotionData
    }),
  getSessionFeedback: (sessionId) =>
    api.get(`/api/feedback/session/${sessionId}`),
  getQuestionFeedback: (sessionId, questionId) =>
    api.get(`/api/feedback/session/${sessionId}/question/${questionId}`),
};

export default api;

