import mongoose from "mongoose";

// makeing a schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: string,
      required: true,
      lowercase: true,
    },
    email: {
      type: string,
      require: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: string,
      require: true,
      lowercase: true,
    },
    resume :{
      url :{type : string},
      skills : [string],
      uploadedAt : {type : Date}
    }
  },
  { timeseries: true }
);

// makeing a model and exporting it
export const User = mongoose.model("User", userSchema);
