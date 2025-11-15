import path from "path"
import { User } from "../models/User.models.js";
import aiService from "../services/aiService.js";

async function resumeKeyExtract(req, res) {
  try {
    const userId = req.params.id;

    const file = req.file;
    const fileUrl = file.path

    let filePath = path.resolve(file.path);
    filePath = filePath.replace(/\\/g, "/");




    if (!file) return res.status(400).json({ massage: "no file uploaded" });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ massage: "User not found" });


    user.resume = {
      url: fileUrl,
      filename: file.originalname,
      fileType: file.mimetype,
      size: file.size,
      uploadedAt: new Date(),
      analysis: { tech_skills: [], soft_skills: [], projects: [] }
    };
    await user.save();
    /*** call to python microservice ****/
    const analysis = await aiService.analyzResume(filePath);
    // console.log(analysis.data);

    const data = analysis.data || {};
    const techSkills = data.tech_skills || [];
    const softSkills = data.soft_skills || [];
    const projects = data.projects || [];
    // console.log(techSkills);

    user.resume.analysis = {
      tech_skills: techSkills,
      soft_skills: softSkills,
      projects: projects
    }
    const normalizedSkills = techSkills.map(s => s.toLowerCase());
    user.skills = Array.from(new Set([...(user.skills || []), ...normalizedSkills]));
    await user.save();

    return res.status(200).json({
      message: "Resume uploaded and analyzed successfully",
      skills: user.resume.analysis,
    })

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error analyzing resume" });
  }
}

export default resumeKeyExtract;
