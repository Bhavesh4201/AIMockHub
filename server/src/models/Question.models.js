import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    skill: {
      type: String,
      require: true,
    },
    question_text: {
      type: String,
      require: true,
    },
    answer: {
      type: String,
      require: true,
    },
    difficulty: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Question = mongoose.mongo("Question" , questionSchema)