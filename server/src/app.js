import express from "express";
import cors from "cors";
import cookie_parser from "cookie-parser"

import resumeRoutes from "./routes/resumeRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import userRouters from "./routes/userRouters.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
// import emotionRoutes from "./routes/emotionRoutes.js";

const app = express();

// CORS configuration to allow credentials
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173", // Vite default port
  credentials: true, // Allow cookies
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(cookie_parser());


app.use("/api/resume", resumeRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/user", userRouters);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/interview", interviewRoutes);
// app.use("/api/emotion", emotionRoutes);


export default app;
