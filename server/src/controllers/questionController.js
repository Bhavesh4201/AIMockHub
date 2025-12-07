
import aiService from "../services/aiService.js";
import {User} from "../models/User.models.js"
import {Question} from "../models/Question.models.js"

export const generateQuestions = async (req, res) => {
  try {

    const userId = req.params.id ;
    
    const user = await User.findById(userId)
    if(!user) return res.status(404).json({ message: "User not found"})
      
    const Skills = user.skills
    if(!Skills || Skills.length === 0) return res.status(400).json({ message: "No skills found for user"})
    
    const response = await aiService.generateQuestions(Skills);
    
    // Handle different response formats
    const questions = response.data || response.questions || response || [];
    
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(500).json({ 
        success: false,
        message: "No questions generated" 
      });
    }

    const formater = questions.map(q => ({
      skill: q.skill_area || q.skill || "",
      question_text: q.question || q.question_text || "",
      difficulty: (q.difficulty || "medium").toLowerCase(),
      answer: ''
    }));

    const savedQuestions = await Question.insertMany(formater);

    // Return formatted questions with proper field names
    const formattedQuestions = savedQuestions.map((q, idx) => ({
      _id: q._id,
      id: q._id,
      skill: q.skill,
      question_text: q.question_text,
      difficulty: q.difficulty,
      answer: q.answer || ''
    }));

    return res.json({
      success: true,
      message: "Questions generated successfully",
      data: formattedQuestions,
      count: formattedQuestions.length
    });


  } catch (error) {
    console.error("Error generating questions:", error.message);
    res.status(500).json({ 
      success: false,
      error: "Failed to generate questions",
      message: error.message 
    });
  }
};
