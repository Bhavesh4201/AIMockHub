import axios from "axios";

const ResumeAnalyzer = "http://0.0.0.0:8000";
const Question_gen = "http://0.0.0.0:8001"


const aiService = {

  analyzResume: async (filePath) => {
    const res = await axios.post(`${ResumeAnalyzer}/api/analyze_resume`, {
      file_path: filePath,
    });
    return res.data;
  },
  generateQuestions: async (skills) =>{
    const res = await axios.post(`${Question_gen}/api/question_generator`,{
      skills : skills
    });
    return res.data
  }
};

export default aiService; 
