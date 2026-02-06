import { User } from "../models/User.models.js";
import {config} from "../config/env.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const cookieSettings = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // Only secure in production
  sameSite: process.env.NODE_ENV === "production" ? "none" : "Lax", // Lax for development
  maxAge: 7 * 24 * 60 * 60 * 1000
};


export const userRegister = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    } else {

      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          return res.status(500).json({ message: "Error generating salt" });
        }
        bcrypt.hash(password, salt, async (err, hash) => {
          if (err) {
            return res.status(500).json({ message: "Error hashing password" });
          }
          const user = await User.create({
            username,
            email,
            password: hash
          });
          
          // Generate token for auto-login after registration
          const token = jwt.sign(
            { id: user._id },
            config.jwt_secret,
            { expiresIn: "7d" }
          );

          // Set cookie
          res.cookie('token', token, cookieSettings);
          
          res.status(201).json({ 
            success: true,
            message: "User registered successfully", 
            token: token,
            userId: user._id,
            user: {
              id: user._id,
              email: user.email,
              username: user.username
            }
          });

        })
      })
    }
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
    console.error("User registration error:", error);
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
      config.jwt_secret,
      { expiresIn: "7d" }
    );

    res.cookie('token', token, cookieSettings)
    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token, // Also return token in response for client-side storage
      userId: user._id,
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });

  } catch (error) {
    console.error("User login error:", error);
    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

export const verifyToken = async (req, res) => {
  try {
    // Token is already verified by auth middleware
    // req.user contains the decoded token with user id
    const userId = req.user.id;
    
    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      },
      userId: user._id
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};