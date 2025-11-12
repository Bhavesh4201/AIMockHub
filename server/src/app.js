import express from "express";
import cors from "cors";
import cookie_parser from "cookie-parser"

import resumeRoutes from "./routes/resumeRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import userRouters from "./routes/userRouters.js";
// import feedbackRoutes from "./routes/feedbackRoutes.js";
// import emotionRoutes from "./routes/emotionRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookie_parser());


app.use("/api/resume", resumeRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/user", userRouters)
// app.use("/api/feedback", feedbackRoutes);
// app.use("/api/emotion", emotionRoutes);


export default app;
