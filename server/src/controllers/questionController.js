
import aiService from "../services/aiService.js";

export const generateQuestions = async (req, res) => {
  try {
    const questions = await aiService.generateQuestions();

    return res.json({
      success: true,
      data : questions
    });

  } catch (error) {
    console.error("Error generating questions:", error.message);
    res.status(500).json({ error: "Failed to generate questions" });
  }
};
