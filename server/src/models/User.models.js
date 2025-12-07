import mongoose from "mongoose";


const resumeSchema = new mongoose.Schema({
  url: String,
  filename: String,
  fileType: String,
  size: Number,
  uploadedAt: Date,
  analysis: {
    tech_skills: [String],
    soft_skills: [String],
    projects: [String]
  }
}, { _id: false });

// makeing a schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      require: true,
    },
    skills: { type: [String], default: [] },
    resume: { type: resumeSchema, default: null }
  },
  { timestamps: true }
);

// makeing a model and exporting it
export const User = mongoose.model("User", userSchema);
