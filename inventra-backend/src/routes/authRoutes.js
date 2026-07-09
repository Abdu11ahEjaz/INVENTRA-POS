import express from "express";
import rateLimit from "express-rate-limit";
import {
  loginUser,
  getCurrentUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  updateProfile,
  updateProfileImage,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadProfileImage as uploadProfileImageMiddleware } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Rate limit login: max 10 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many login attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit forgot-password: max 5 per hour
const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: "Too many reset requests. Please try again in 1 hour." },
});

router.post("/login",                    loginLimiter,  loginUser);
router.post("/forgot-password",          forgotLimiter, forgotPassword);
router.post("/reset-password/:token",                   resetPassword);
router.get("/me",                        protect,       getCurrentUser);
router.patch("/profile",                 protect,       updateProfile);
router.patch("/profile-image",           protect,       uploadProfileImageMiddleware, updateProfileImage);
router.post("/logout",                   protect,       logoutUser);

export default router;
