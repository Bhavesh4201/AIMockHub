# Architecture Analysis: AIMockHub

## Overview
AIMockHub is an AI-powered mock interview platform that analyzes resumes, generates interview questions, conducts video-based interviews with emotion detection, and provides AI-generated feedback.

---

## 📁 Folder Structure Analysis

### 1. **ai_services/** - Python Microservices (FastAPI)

#### Purpose
Independent Python microservices that handle AI-powered analysis and generation tasks.

#### Services

##### **emotion_analyzer** (Port: Not explicitly set, likely 8003)
- **Main File**: `main.py`
- **Functionality**: 
  - Analyzes video/audio for emotion detection
  - Face detection and behavioral analysis
  - Currently minimal implementation (only ping endpoint)
- **Utils**:
  - `video_processing.py` - Video analysis utilities
  - `face_detection.py` - Face detection (empty)
  - `audio_analysis.py` - Audio processing
  - `llm_prompt_templatas/` - Prompt templates for behavioral and technical analysis
- **Status**: ⚠️ **Incomplete** - Main service not fully implemented

##### **resume_analyzer** (Port: 8000)
- **Main File**: `main.py`
- **Functionality**:
  - Extracts text from PDF resumes
  - Analyzes and extracts technical skills, soft skills, and projects
  - Uses hybrid approach: keyword matching + Gemini LLM refinement
- **Utils**:
  - `pdf_parser.py` - PDF text extraction
  - `skill_extractor.py` - Skill extraction using keyword matching and Gemini API
- **Dependencies**: PyMuPDF, Google Generative AI, spaCy
- **Status**: ✅ **Functional**

##### **question_generator** (Port: 8001)
- **Main File**: `main.py`
- **Functionality**:
  - Generates 5 interview questions based on user skills
  - Uses Gemini 2.5 Flash model
  - Returns structured JSON with question_id, question, difficulty, skill_area
  - Has fallback mock questions if API fails
- **Features**:
  - Mix of difficulties (1 Easy, 2-3 Medium, 1-2 Hard)
  - Scenario-based practical questions
  - JSON-only output format
- **Status**: ✅ **Functional** (with mock fallback)

##### **feedback_generator** (Port: 8002)
- **Main File**: `main.py`
- **Functionality**:
  - Generates detailed feedback on interview answers
  - Incorporates emotion data in analysis
  - Returns structured feedback with strengths, improvements, and score
- **Utils**:
  - `feedback_prompt.py` - Creates detailed feedback prompts
- **Features**:
  - Technical accuracy evaluation
  - Communication clarity assessment
  - Scoring system (0-100)
  - Constructive, actionable feedback
- **Status**: ✅ **Functional**

#### Technology Stack
- **Framework**: FastAPI
- **AI/ML**: Google Gemini 2.5 Flash API
- **Other**: PyMuPDF, spaCy, NLTK, NumPy

---

### 2. **server/** - Node.js/Express Backend

#### Purpose
Main backend API server that orchestrates the microservices and manages data persistence.

#### Architecture

##### **Entry Point**
- `server.js` - Starts Express server, connects to MongoDB
- `app.js` - Express app configuration, middleware, routes

##### **Routes** (`src/routes/`)
- `userRouters.js` - Authentication (register, login, verify)
- `resumeRoutes.js` - Resume upload and analysis
- `questionRoutes.js` - Question generation
- `interviewRoutes.js` - Interview session management
- `feedbackRoutes.js` - Feedback generation and retrieval
- `emotionRoutes.js` - ⚠️ Commented out (not active)

##### **Controllers** (`src/controllers/`)
- `userController.js` - User registration, login, token verification
- `resumeController.js` - Resume upload, file handling, skill extraction
- `questionController.js` - Question generation from user skills
- `interviewController.js` - Session lifecycle (start, answer, end, retrieve)
- `feedbackController.js` - Feedback generation and retrieval
- `emotionController.js` - Emotion analysis (not actively used)

##### **Models** (`src/models/`)
- `User.models.js` - User schema with resume and skills
- `Question.models.js` - Interview questions schema
- `interviewSession.model.js` - Interview session tracking
- `Feedback.models.js` - Feedback storage

##### **Services** (`src/services/`)
- `aiService.js` - **Core Integration Service**
  - Communicates with Python microservices
  - Methods: `analyzResume()`, `generateQuestions()`, `feedbackGenerater()`
  - Handles HTTP requests to FastAPI services
- `emotionService.js` - Emotion analysis service
- `dbService.js` - Database utilities

##### **Middleware** (`src/middleware/`)
- `authMiddleware.js` - JWT token verification

##### **Config** (`src/config/`)
- `db.js` - MongoDB connection
- `env.js` - Environment variable management

#### Technology Stack
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (jsonwebtoken), bcrypt
- **File Upload**: Multer
- **HTTP Client**: Axios

#### API Endpoints
```
POST   /api/user/register
POST   /api/user/login
GET    /api/user/verify

POST   /api/resume/:id/key
POST   /api/questions/:id/generater

POST   /api/interview/:userId/start
POST   /api/interview/:sessionId/answer
POST   /api/interview/:sessionId/end
GET    /api/interview/:userId/sessions

POST   /api/feedback/generate
GET    /api/feedback/session/:sessionId
```

---

### 3. **client/** - React Frontend

#### Purpose
User-facing web application for the interview platform.

#### Architecture

##### **Entry Point**
- `main.jsx` - React app initialization with providers
- `App.jsx` - Main routing configuration

##### **Pages** (`src/page/`)
- `HomePage.jsx` - Dashboard/home
- `LoginPage.jsx` - User authentication
- `RegisterPage.jsx` - User registration
- `InterviewPage.jsx` - Interview interface wrapper
- `FeedbackPage.jsx` - Feedback display
- `NotFound.jsx` - 404 page

##### **Components** (`src/components/`)
- `InterviewUI.jsx` - **Main Interview Interface**
  - Question display and navigation
  - Answer submission
  - Progress tracking
  - Integrates VideoRecorder and FeedbackDashboard
- `VideoRecorder.jsx` - Video recording with emotion detection
- `FeedbackDashboard.jsx` - Real-time feedback display
- `QuestionCard.jsx` - Question display component
- `ResumeUpload.jsx` - Resume upload interface
- `Navbar.jsx` - Navigation bar
- `ProtectedRoute.jsx` - Route protection for authenticated users
- `ErrorBoundary.jsx` - Error handling

##### **Context** (`src/context/`)
- `InterviewContext.jsx` - **Global State Management**
  - Authentication state
  - User data
  - Login/logout/register functions
  - Token management (cookies)

##### **Services** (`src/services/`)
- `api.js` - **API Client**
  - Axios instance with interceptors
  - API methods: `authAPI`, `resumeAPI`, `questionAPI`, `interviewAPI`, `feedbackAPI`
  - Automatic token injection
  - Error handling and redirects

##### **Config** (`src/config/`)
- `env.js` - Environment configuration (API base URL)

#### Technology Stack
- **Framework**: React 19.1.1
- **Routing**: React Router DOM 7.10.0
- **Build Tool**: Vite 7.1.7
- **Styling**: Tailwind CSS 4.1.16
- **HTTP Client**: Axios
- **Cookies**: js-cookie
- **Video**: react-webcam, @mediapipe/tasks-vision

#### Features
- ✅ User authentication (login/register)
- ✅ Resume upload and analysis
- ✅ Question generation
- ✅ Video recording with emotion detection
- ✅ Real-time feedback
- ✅ Interview session management
- ✅ Protected routes

---

## 🔄 Data Flow

### 1. **User Registration/Login Flow**
```
Client → Server (POST /api/user/register|login)
  → Server validates credentials
  → Server generates JWT token
  → Server sets httpOnly cookie + returns token
  → Client stores token in cookie
  → Client updates auth context
```

### 2. **Resume Analysis Flow**
```
Client → Server (POST /api/resume/:id/key)
  → Server saves file (Multer)
  → Server calls aiService.analyzResume()
  → aiService → Python microservice (resume_analyzer:8000)
  → Python extracts skills using keyword matching + Gemini
  → Server saves skills to User model
  → Client receives skills data
```

### 3. **Question Generation Flow**
```
Client → Server (POST /api/questions/:id/generater)
  → Server fetches user skills
  → Server calls aiService.generateQuestions()
  → aiService → Python microservice (question_generator:8001)
  → Python generates questions using Gemini
  → Server saves questions to Question model
  → Client receives questions array
```

### 4. **Interview Session Flow**
```
1. Start Session:
   Client → Server (POST /api/interview/:userId/start)
   → Server creates InterviewSession

2. Answer Submission:
   Client → Server (POST /api/interview/:sessionId/answer)
   → Server saves answer + emotion data
   → Client triggers feedback generation

3. Feedback Generation:
   Client → Server (POST /api/feedback/generate)
   → Server calls aiService.feedbackGenerater()
   → aiService → Python microservice (feedback_generator:8002)
   → Python generates feedback using Gemini
   → Server saves feedback to Feedback model
   → Client displays feedback

4. End Session:
   Client → Server (POST /api/interview/:sessionId/end)
   → Server updates session endTime
```

---

## 🔌 Service Communication

### Microservice URLs (from server config)
- **Resume Analyzer**: `RESUME_ANALYZER_URL` (default: `http://localhost:8000`)
- **Question Generator**: `QUESTION_GEN_URL` (default: `http://localhost:8001`)
- **Feedback Generator**: `FEEDBACK_GEN_URL` (default: `http://localhost:8002`)

### Communication Pattern
- **Protocol**: HTTP REST API
- **Format**: JSON
- **Method**: Axios POST requests
- **Timeout**: 30 seconds per request

---

## 🗄️ Database Schema

### User Model
```javascript
{
  username: String,
  email: String (unique),
  password: String (hashed),
  skills: [String],
  resume: {
    url: String,
    filename: String,
    fileType: String,
    size: Number,
    uploadedAt: Date,
    analysis: {
      tech_skills: [String],
      soft_skills: [String],
      projects: [String]
    }
  }
}
```

### Question Model
```javascript
{
  skill: String,
  question_text: String,
  answer: String,
  difficulty: "easy" | "medium" | "hard",
  createdAt: Date
}
```

### InterviewSession Model
```javascript
{
  userId: ObjectId,
  startTime: Date,
  endTime: Date,
  questions: [{
    questionId: ObjectId,
    question_text: String,
    userAnswer: String,
    emotionData: Object,
    behaviorScore: Number,
    timestamp: Date
  }],
  overallEmotionSummary: Object,
  overallScore: Number
}
```

### Feedback Model
```javascript
{
  session_id: ObjectId,
  question_id: ObjectId,
  user_id: ObjectId,
  feedback_text: String,
  strengths: [String],
  improvements: [String],
  score: Number,
  feedback_data: Object
}
```

---

## 🔐 Security Features

1. **Authentication**
   - JWT tokens with 7-day expiration
   - httpOnly cookies (server-side)
   - Client-side cookie backup
   - Token verification middleware

2. **Authorization**
   - Protected routes on frontend
   - User ID validation on backend
   - File upload authorization checks

3. **Password Security**
   - bcrypt hashing (salt rounds: 10)
   - Passwords never returned in responses

4. **CORS Configuration**
   - Configured for specific origin
   - Credentials enabled
   - Specific methods and headers allowed

---

## ⚠️ Issues & Observations

### 1. **Incomplete Services**
- `emotion_analyzer` service is not fully implemented (only ping endpoint)
- Emotion routes are commented out in server
- Face detection utility is empty

### 2. **Error Handling**
- Some services have try-catch but could be more comprehensive
- Client-side error handling exists but could be improved
- No retry logic for microservice calls

### 3. **Code Quality**
- Some commented-out code in question_generator (lines 92-135)
- Inconsistent error response formats
- Missing input validation in some endpoints

### 4. **Configuration**
- Environment variables need to be properly configured
- Microservice URLs should be in .env files
- API keys (GEMINI_API_KEY) required for full functionality

### 5. **Testing**
- No test files found
- No test configuration

---

## 🚀 Deployment Considerations

1. **Environment Variables Required**:
   - MongoDB connection string
   - JWT secret
   - Gemini API key
   - Microservice URLs
   - Client URL for CORS

2. **Ports**:
   - Server: 3000 (default)
   - Client: 5173 (Vite default)
   - Resume Analyzer: 8000
   - Question Generator: 8001
   - Feedback Generator: 8002

3. **Dependencies**:
   - Node.js (for server and client)
   - Python 3.x (for microservices)
   - MongoDB database
   - Virtual environment for Python services

---

## 📊 Summary

### Strengths
✅ Well-structured microservices architecture  
✅ Separation of concerns (AI services, backend, frontend)  
✅ Modern tech stack (React 19, Express 5, FastAPI)  
✅ Comprehensive interview flow implementation  
✅ AI-powered features (Gemini integration)  
✅ Real-time feedback generation  

### Areas for Improvement
⚠️ Complete emotion analyzer service  
⚠️ Add comprehensive error handling  
⚠️ Implement testing suite  
⚠️ Add input validation  
⚠️ Improve code documentation  
⚠️ Add retry logic for microservice calls  
⚠️ Implement rate limiting  
⚠️ Add logging/monitoring  

---

## 🔗 Integration Points

```
┌─────────────┐
│   Client    │ (React + Vite)
│  Port: 5173 │
└──────┬──────┘
       │ HTTP/REST
       │
┌──────▼──────┐
│   Server    │ (Express.js)
│  Port: 3000 │
└──────┬──────┘
       │
       ├───► MongoDB (Database)
       │
       ├───► Resume Analyzer (Python FastAPI :8000)
       ├───► Question Generator (Python FastAPI :8001)
       └───► Feedback Generator (Python FastAPI :8002)
                    │
                    └───► Google Gemini API
```

---

*Analysis Date: 2025*
*Project: AIMockHub - AI-Powered Mock Interview Platform*

