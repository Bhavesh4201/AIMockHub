import axios from "axios";
import { config } from "../config/env.js";

const ResumeAnalyzer = config.RESUME_ANALYZER_URL;
const Question_gen = config.QUESTION_GEN_URL;
const feedback_gen = config.FEEDBACK_GEN_URL;


const aiService = {

  analyzResume: async (filePath) => {
    try {
      const res = await axios.post(`${ResumeAnalyzer}/api/analyze_resume`, {
        file_path: filePath,
      }, {
        timeout: 30000 // 30 second timeout
      });
      return res.data;
    } catch (error) {
      console.error("Error analyzing resume:", error.message);
      throw new Error(`Resume analysis failed: ${error.message}`);
    }
  },
  
  generateQuestions: async (skills) => {
    try {
      const res = await axios.post(`${Question_gen}/api/question_generator`, {
        skills: skills
      }, {
        timeout: 30000
      });
      return res.data;
    } catch (error) {
      console.error("Error generating questions:", error.message);
      throw new Error(`Question generation failed: ${error.message}`);
    }
  },
  
  feedbackGenerater: async (text_ans, emotion_data) => {
    try {
      const payload = {
        text: text_ans,
        emotion_data: emotion_data || null
      };
      const res = await axios.post(`${feedback_gen}/api/feedbacke_generator`, payload, {
        timeout: 30000
      });
      return res.data;
    } catch (error) {
      console.error("Error generating feedback:", error.response?.status, error.response?.data, error.message);
      throw new Error(`Feedback generation failed: ${error.message}`);
    }
  }
};

export default aiService; 
