import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UAParser } from "ua-parser-js";
import User from "../models/User.js";
import Session from "../models/Session.js";
import { sendPasswordResetEmail } from "../services/emailService.js";
import { logAudit } from "../utils/auditLogger.js";

// ── Helper: sign JWT ───────────────────────────────────────────
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// ── Helper: get client IP address ──────────────────────────────
const getClientIP = (req) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "Unknown";
  return ip;
};

// ── Helper: parse user agent ───────────────────────────────────
const parseUserAgent = (userAgent) => {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  return {
    browser:
      `${result.browser.name || "Unknown"} ${result.browser.version || ""}`.trim(),
    os: `${result.os.name || "Unknown"} ${result.os.version || ""}`.trim(),
    device: result.device.type || "desktop",
  };
};

// ── Helper: build safe user response (no password) ────────────
const userResponse = (user, token) => ({
  token,
  user: {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    status: user.status,
    department: user.department,
    profileImage: user.profileImage,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
  },
});

// ──────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ──────────────────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const ipAddress = getClientIP(req);

  // Validation
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    "+password",
  );

  if (!user) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  // Check if user is deleted
  if (user.deletedAt) {
    res.status(401);
    throw new Error("Account has been deleted");
  }

  // Check if user is active
  if (user.status !== "Active") {
    res.status(401);
    throw new Error(
      `Account is ${user.status.toLowerCase()}. Please contact administrator.`,
    );
  }

  // Check if account is locked
  if (
    user.accountLockedUntil &&
    new Date(user.accountLockedUntil) > new Date()
  ) {
    res.status(401);
    throw new Error("Account is temporarily locked. Please try again later.");
  }

  const isPasswordValid = await user.matchPassword(password);

  if (!isPasswordValid) {
    // Increment failed attempts
    user.failedLoginAttempts += 1;

    // Lock account after 5 failed attempts
    if (user.failedLoginAttempts >= 5) {
      user.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    }

    await user.save();
    res.status(401);
    throw new Error("Invalid credentials");
  }

  // Reset failed attempts on successful login
  user.failedLoginAttempts = 0;
  user.accountLockedUntil = undefined;

  const deviceInfo = parseUserAgent(req.headers["user-agent"]);

  // Update last login
  user.lastLogin = new Date();
  user.lastLoginIP = ipAddress;
  user.lastLoginDevice = deviceInfo.browser;
  await user.save();

  // Sign JWT
  const token = signToken(user._id);

  console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
  console.log("Generated token:", token);

  // Create session
  const session = await Session.create({
    user: user._id,
    userAgent: req.headers["user-agent"] || "",
    browser: deviceInfo.browser,
    os: deviceInfo.os,
    device: deviceInfo.device,
    ipAddress,
    isActive: true,
    loginTime: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  // Log successful login
  await logAudit({
    action: "LOGIN",
    performedBy: user._id,
    details: `Login successful from ${deviceInfo.browser} on ${deviceInfo.os}`,
    ipAddress,
    userAgent: req.headers["user-agent"],
  });

  res.json(userResponse(user, token));
});

// ──────────────────────────────────────────────────────────────────
// GET /api/auth/me
// ──────────────────────────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user || user.deletedAt) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(userResponse(user, req.token));
});

// ──────────────────────────────────────────────────────────────────
// POST /api/auth/logout
// ──────────────────────────────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
  // Deactivate all user sessions
  await Session.updateMany(
    { user: req.user.id, isActive: true },
    { isActive: false, logoutTime: new Date() },
  );

  res.json({ message: "Logged out successfully" });
});

// ──────────────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// ──────────────────────────────────────────────────────────────────
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user || user.deletedAt) {
    res.status(404);
    throw new Error("User not found");
  }

  const resetToken = user.generateResetToken();
  await user.save();

  try {
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    throw err;
  }

  res.json({ message: "Password reset email sent" });
});

// ──────────────────────────────────────────────────────────────────
// POST /api/auth/reset-password/:token
// ──────────────────────────────────────────────────────────────────
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    res.status(400);
    throw new Error("Passwords are required");
  }

  if (password !== confirmPassword) {
    res.status(400);
    throw new Error("Passwords do not match");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired token");
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.failedLoginAttempts = 0;
  user.accountLockedUntil = undefined;
  await user.save();

  const newToken = signToken(user._id);
  res.json(userResponse(user, newToken));
});

// ──────────────────────────────────────────────────────────────────
// PATCH /api/auth/profile
// Update current user's profile (fullName, email, phone)
// ──────────────────────────────────────────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, email, phone } = req.body;
  const ipAddress = getClientIP(req);

  const user = await User.findById(req.user.id);

  if (!user || user.deletedAt) {
    res.status(404);
    throw new Error("User not found");
  }

  // Track old values for audit
  const oldValues = {
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
  };

  // Update allowed fields
  if (fullName && fullName.trim()) {
    user.fullName = fullName.trim();
  }

  if (email && email.trim()) {
    const newEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({
      email: newEmail,
      _id: { $ne: user._id },
    });
    if (existingUser) {
      res.status(400);
      throw new Error("Email already in use");
    }
    user.email = newEmail;
  }

  if (phone !== undefined) {
    user.phone = phone?.trim() || "";
  }

  await user.save();

  // Log update
  await logAudit({
    action: "PROFILE_UPDATED",
    performedBy: req.user.id,
    details: "User updated own profile",
    ipAddress,
    userAgent: req.headers["user-agent"],
    oldValues,
    newValues: {
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
    },
  });

  res.json(userResponse(user, req.token));
});

// ──────────────────────────────────────────────────────────────────
// PATCH /api/auth/profile-image
// Update current user's profile image
// ──────────────────────────────────────────────────────────────────
export const updateProfileImage = asyncHandler(async (req, res) => {
  const ipAddress = getClientIP(req);

  if (!req.file) {
    res.status(400);
    throw new Error("No image file provided");
  }

  const user = await User.findById(req.user.id);

  if (!user || user.deletedAt) {
    res.status(404);
    throw new Error("User not found");
  }

  try {
    // Import cloudinary upload utility
    const { uploadImageToCloudinary } =
      await import("../utils/cloudinaryUpload.js");

    const imageUrl = await uploadImageToCloudinary(req.file, "user_profiles");

    user.profileImage = imageUrl;
    await user.save();

    // Log update
    await logAudit({
      action: "PROFILE_IMAGE_UPDATED",
      performedBy: req.user.id,
      details: "User updated profile image",
      ipAddress,
      userAgent: req.headers["user-agent"],
    });

    res.json(userResponse(user, req.token));
  } catch (err) {
    throw err;
  }
});

// Aliases for route compatibility
export const loginUser = login;
export const logoutUser = logout;
export const getCurrentUser = getMe;
