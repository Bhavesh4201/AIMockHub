import express from "express";
import { userLogin, userRegister, verifyToken } from "../controllers/userController.js";
import { auth } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/register", userRegister);
router.post("/login", userLogin);
router.get("/verify", auth, verifyToken);

export default router;      

