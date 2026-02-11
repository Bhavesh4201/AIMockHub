import mongoose from "mongoose";


const resumeSchema = new mongoose.Schema({
  filename: String,
  fileType: String,
  size: Number,
  uploadedAt: Date,
  fileData: Buffer, // Store binary PDF data in MongoDB
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
