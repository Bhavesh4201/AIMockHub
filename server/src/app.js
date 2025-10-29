import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// import resumeRoutes from "./routes/resumeRoutes.js";
// import questionRoutes from "./routes/questionRoutes.js";
// import feedbackRoutes from "./routes/feedbackRoutes.js";
// import emotionRoutes from "./routes/emotionRoutes.js";

// dotenv.config();
const app = express();
// app.use(cors());
// app.use(express.json());


app.get('/api/ping', function (req, res) {
    res.json({ status: 'ok' });
});
// app.use("/api/resume", resumeRoutes);
// app.use("/api/questions", questionRoutes);
// app.use("/api/feedback", feedbackRoutes);
// app.use("/api/emotion", emotionRoutes);

export default app;
