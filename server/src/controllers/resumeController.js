import aiService from "../services/aiService.js";
import path from 'path'

async function resumeKeyExtract(req, res) {
  try {

    const filePath = path.resolve(req.file.path);

    const analysis = await aiService.analyzResume(filePath);
      console.log(analysis);
      
    res.json({
      success: true,
      massage: "Resume analyzed successfully",
      data: analysis,
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ success: false, message: "Error analyzing resume" });
  }
}

export default resumeKeyExtract;
