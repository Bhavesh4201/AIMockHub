import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  skill: { type: String, required: true },

  question_text: { type: String, required: true },

  answer: { type: String }, 

  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium"
  },

  createdAt: { type: Date, default: Date.now }
});

export const Question = mongoose.model("Question", questionSchema);
