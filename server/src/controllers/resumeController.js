import path from "path";
import fs from "fs";
import os from "os";
import { User } from "../models/User.models.js";
import aiService from "../services/aiService.js";

async function resumeKeyExtract(req, res) {
  let tempFilePath = null;

  try {
    // Verify user is authenticated and matches the userId in params
    const authenticatedUserId = req.user?.id;
    const userId = req.params.id;

    // Check if authenticated user matches the userId in URL
    if (authenticatedUserId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only upload resume for your own account"
      });
    }

    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Store resume file in MongoDB
    user.resume = {
      filename: file.originalname,
      fileType: file.mimetype,
      size: file.size,
      uploadedAt: new Date(),
      fileData: file.buffer, // Store binary file data in MongoDB
      analysis: { tech_skills: [], soft_skills: [], projects: [] }
    };
    await user.save();

    // Create temporary file for AI service analysis
    tempFilePath = path.join(os.tmpdir(), `resume-${userId}-${Date.now()}.pdf`);
    fs.writeFileSync(tempFilePath, file.buffer);

    /*** call to python microservice ****/
    const analysis = await aiService.analyzResume(tempFilePath);

    // Handle different response formats
    const data = analysis.data || analysis || {};
    const techSkills = data.tech_skills || [];
    const softSkills = data.soft_skills || [];
    const projects = data.projects || [];

    user.resume.analysis = {
      tech_skills: techSkills,
      soft_skills: softSkills,
      projects: projects
    };
    const normalizedSkills = techSkills.map(s => s.toLowerCase());
    user.skills = Array.from(new Set([...(user.skills || []), ...normalizedSkills]));
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Resume uploaded and analyzed successfully",
      data: {
        skills: user.resume.analysis,
        userSkills: user.skills
      }
    });

  } catch (error) {
    console.error("Error analyzing resume:", error);

    res.status(500).json({
      success: false,
      message: "Error analyzing resume",
      error: error.message
    });
  } finally {
    // Clean up temporary file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (unlinkError) {
        console.error("Error deleting temporary file:", unlinkError);
      }
    }
  }
}

export default resumeKeyExtract;
