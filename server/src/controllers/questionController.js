
import aiService from "../services/aiService.js";

export const generateQuestions = async (req, res) => {
  try {
    const { skills } = req.body;

    const questions = await aiService.generateQuestions(skills);

    return res.json({
      success: true,
      questions
    });

  } catch (error) {
    console.error("Error generating questions:", error.message);
    res.status(500).json({ error: "Failed to generate questions" });
  }
};
