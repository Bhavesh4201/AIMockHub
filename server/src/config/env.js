import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URL', 'jwt_secret'];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars.join(', '));
  console.error('Please check your .env file');
  // Don't exit in development, but warn
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

export const config = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  MONGODB_URL: process.env.MONGODB_URL,
  jwt_secret: process.env.jwt_secret,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  
  // AI Service URLs
  RESUME_ANALYZER_URL: process.env.RESUME_ANALYZER_URL || "http://0.0.0.0:8000",
  QUESTION_GEN_URL: process.env.QUESTION_GEN_URL || "http://0.0.0.0:8001",
  FEEDBACK_GEN_URL: process.env.FEEDBACK_GEN_URL || "http://0.0.0.0:8002",
  
  // File Upload Configuration
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  UPLOADS_DIR: process.env.UPLOADS_DIR || "./uploads",
  
  COOKIE_MAX_AGE: parseInt(process.env.COOKIE_MAX_AGE) || 7 * 24 * 60 * 60 * 1000, // 7 days
};


  
