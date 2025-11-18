import { User } from "../models/User.models.js";
import {config} from "../config/env.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const userRegister = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ massage: "User already exists" });
    } else {

      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          return res.status(500).json({ massage: "Error generating salt" });
        }
        bcrypt.hash(config.jwt_secret, salt, async (err, hash) => {
          if (err) {
            return res.status(500).json({ massage: "Error hashing password" });
          }
          const user = await User.create({
            username,
            email,
            password: hash
          });
          res.status(201).json({ massage: " User register successfully", user });
          // const token = jwt.sign({ email }, config.jwt_secret);
          // res.cookie("token", token)
        })
      })
    }
  } catch (error) {
    res.status(500).json({ massage: error._massage });
    console.log(error);
  }
};



export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.log("error:", error);
    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};