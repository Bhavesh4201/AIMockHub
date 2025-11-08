import mongoose from "mongoose";

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
      lowercase: true,
    },
    resume :{
      url :{type : String},
      skills : [String],
      uploadedAt : {type : Date}
    }
  },
  { timeseries: true }
);

// makeing a model and exporting it
export const User = mongoose.model("User", userSchema);
