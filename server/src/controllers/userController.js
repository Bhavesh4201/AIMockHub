import { User } from "../models/User.models.js";

export const userRegister = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ massage: "User already exists" });
    } else {
      const user = await User.create({ username, email, password });
      res.status(201).json({ massage: " User register successfully", user });
    }
  } catch (error) {
    res.status(500).json({ massage: error._massage });
    console.log(error);
  }
};
