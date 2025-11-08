import mongoose from "mongoose";

const TestSessionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    score: { type: Number, default: 0 },
    data: { type: date, default: Date.now },
  },
  { timestamps: true }
);

export const TestSession = mongoose.model("TestSession" , TestSessionSchema);