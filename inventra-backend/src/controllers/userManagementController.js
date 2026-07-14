import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Session from "../models/Session.js";
import { sendWelcomeEmail } from "../services/emailService.js";
import { logAudit } from "../utils/auditLogger.js";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "../utils/cloudinaryUpload.js";

const getClientIP = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
  req.socket.remoteAddress ||
  "Unknown";

// ─────────────────────────────────────────────────────────────
// GET /api/users
// List all users with pagination and filtering
// ─────────────────────────────────────────────────────────────
export const listUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, status, search } = req.query;

  const query = { deletedAt: null };

  if (role) query.role = role;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const users = await User.find(query)
    .select("-password -resetPasswordToken -resetPasswordExpire -accountLockedUntil -failedLoginAttempts")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await User.countDocuments(query);

  res.json({
    users,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// ─────────────────────────────────────────────────────────────
// GET /api/users/:id
// Get single user details
// ─────────────────────────────────────────────────────────────
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "-password -resetPasswordToken -resetPasswordExpire -accountLockedUntil -failedLoginAttempts"
  );

  if (!user || user.deletedAt) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
});

// ─────────────────────────────────────────────────────────────
// POST /api/users
// Create new user (SuperAdmin only, with optional profile image)
// ─────────────────────────────────────────────────────────────
export const createUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, confirmPassword, role, phone, department, status } = req.body;
  const ipAddress = getClientIP(req);

  // Validation
  if (!fullName?.trim()) {
    res.status(400);
    throw new Error("Full name is required");
  }

  if (!email?.trim()) {
    res.status(400);
    throw new Error("Email is required");
  }

  if (!password || password.length < 8) {
    res.status(400);
    throw new Error("Password must be at least 8 characters");
  }

  if (password !== confirmPassword) {
    res.status(400);
    throw new Error("Passwords do not match");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    res.status(400);
    throw new Error("Email already in use");
  }

  // Validate role
  const validRoles = ["SuperAdmin", "Admin", "Manager", "Accountant", "Sales"];
  if (!role || !validRoles.includes(role)) {
    res.status(400);
    throw new Error(`Role must be one of: ${validRoles.join(", ")}`);
  }

  // Cannot create another SuperAdmin
  if (role === "SuperAdmin") {
    const superAdminExists = await User.findOne({ role: "SuperAdmin", deletedAt: null });
    if (superAdminExists) {
      res.status(400);
      throw new Error("SuperAdmin already exists. Cannot create additional SuperAdmins.");
    }
  }

  try {
    let profileImageUrl = null;
    let profileImagePublicId = null;

    // Upload profile image if provided
    if (req.file) {
      try {
        const { url, public_id } = await uploadImageToCloudinary(req.file, "user_profiles");
        profileImageUrl = url;
        profileImagePublicId = public_id;
      } catch (uploadErr) {
        // Don't fail user creation if image upload fails
      }
    }

    // Create user
    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      phone: phone?.trim() || "",
      department: department?.trim() || "",
      status: status || "Active",
      profileImage: profileImageUrl,
      profileImagePublicId: profileImagePublicId,
    });

    // Log user creation
    await logAudit({
      action: "USER_CREATED",
      performedBy: req.user._id,
      targetUser: user._id,
      details: `Created user with role ${role}${profileImageUrl ? " (with profile image)" : ""}`,
      ipAddress,
      userAgent: req.headers["user-agent"],
      newValues: {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });

    // Send welcome email
    try {
      const { sendWelcomeEmail } = await import("../services/emailService.js");
      const loginUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/signin`;
      await sendWelcomeEmail(user.email, user.fullName, loginUrl);
    } catch (emailErr) {
      // Don't fail the user creation if email fails
    }

    // Return user without sensitive fields
    const responseUser = user.toObject();
    delete responseUser.password;
    delete responseUser.resetPasswordToken;
    delete responseUser.resetPasswordExpire;

    res.status(201).json({
      message: "User created successfully",
      user: responseUser,
    });
  } catch (err) {
    // Log failure
    await logAudit({
      action: "USER_CREATED",
      performedBy: req.user._id,
      details: `Failed to create user: ${err.message}`,
      ipAddress,
      userAgent: req.headers["user-agent"],
      status: "Failure",
      errorMessage: err.message,
    });
    throw err;
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/users/:id
// Update user (SuperAdmin only)
// ─────────────────────────────────────────────────────────────
export const updateUser = asyncHandler(async (req, res) => {
  const { fullName, role, phone, department, status } = req.body;
  const ipAddress = getClientIP(req);

  const user = await User.findById(req.params.id);

  if (!user || user.deletedAt) {
    res.status(404);
    throw new Error("User not found");
  }

  // Prevent demoting SuperAdmin
  if (user.role === "SuperAdmin" && role && role !== "SuperAdmin") {
    res.status(400);
    throw new Error("Cannot change SuperAdmin role");
  }

  // Prevent promoting to SuperAdmin
  if (role === "SuperAdmin" && user.role !== "SuperAdmin") {
    res.status(400);
    throw new Error("Cannot promote user to SuperAdmin");
  }

  // Track old values for audit
  const oldValues = {
    fullName: user.fullName,
    role: user.role,
    status: user.status,
    phone: user.phone,
    department: user.department,
  };

  // Update allowed fields
  if (fullName && fullName.trim()) user.fullName = fullName.trim();
  if (role && role !== user.role) user.role = role;
  if (phone !== undefined) user.phone = phone?.trim() || "";
  if (department !== undefined) user.department = department?.trim() || "";
  if (status && ["Active", "Inactive", "Suspended"].includes(status)) {
    user.status = status;
  }

  // Handle profile image upload if provided
  if (req.file) {
    try {
      // Delete old profile image from Cloudinary if it exists
      if (user.profileImagePublicId) {
        try {
          await deleteImageFromCloudinary(user.profileImagePublicId);
        } catch (deleteErr) {
          console.error("Failed to delete old profile image from Cloudinary:", deleteErr.message);
          // Continue - don't fail the upload if deletion fails
        }
      }

      // Upload new image
      const { url, public_id } = await uploadImageToCloudinary(req.file, "user_profiles");
      user.profileImage = url;
      user.profileImagePublicId = public_id;
    } catch (uploadErr) {
      // Don't fail user update if image upload fails
      console.error("Failed to upload profile image:", uploadErr.message);
    }
  }

  await user.save();

  // Log update
  await logAudit({
    action: "USER_UPDATED",
    performedBy: req.user._id,
    targetUser: user._id,
    details: "User information updated" + (req.file ? " (with profile image)" : ""),
    ipAddress,
    userAgent: req.headers["user-agent"],
    oldValues,
    newValues: {
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      phone: user.phone,
      department: user.department,
    },
  });

  const responseUser = user.toObject();
  delete responseUser.password;
  delete responseUser.resetPasswordToken;
  delete responseUser.resetPasswordExpire;

  res.json({
    message: "User updated successfully",
    user: responseUser,
  });
});

// ─────────────────────────────────────────────────────────────
// PATCH /api/users/:id/status
// Change user status (Active/Inactive/Suspended)
// ─────────────────────────────────────────────────────────────
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const ipAddress = getClientIP(req);

  if (!["Active", "Inactive", "Suspended"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status. Must be Active, Inactive, or Suspended");
  }

  const user = await User.findById(req.params.id);

  if (!user || user.deletedAt) {
    res.status(404);
    throw new Error("User not found");
  }

  const oldStatus = user.status;
  user.status = status;
  await user.save();

  // Log status change
  await logAudit({
    action: status === "Suspended" ? "USER_SUSPENDED" : "USER_UPDATED",
    performedBy: req.user._id,
    targetUser: user._id,
    details: `Status changed from ${oldStatus} to ${status}`,
    ipAddress,
    userAgent: req.headers["user-agent"],
    oldValues: { status: oldStatus },
    newValues: { status },
  });

  res.json({
    message: `User status updated to ${status}`,
    user,
  });
});

// ─────────────────────────────────────────────────────────────
// POST /api/users/:id/reset-password
// Reset user password (SuperAdmin only)
// ─────────────────────────────────────────────────────────────
export const resetUserPassword = asyncHandler(async (req, res) => {
  const { newPassword, forceChangeOnNextLogin } = req.body;
  const ipAddress = getClientIP(req);

  if (!newPassword || newPassword.length < 8) {
    res.status(400);
    throw new Error("Password must be at least 8 characters");
  }

  const user = await User.findById(req.params.id);

  if (!user || user.deletedAt) {
    res.status(404);
    throw new Error("User not found");
  }

  user.password = newPassword;
  user.forcePasswordChange = forceChangeOnNextLogin || false;
  user.failedLoginAttempts = 0;
  user.accountLockedUntil = undefined;
  await user.save();

  // Log password reset
  await logAudit({
    action: "PASSWORD_RESET",
    performedBy: req.user._id,
    targetUser: user._id,
    details: `Password reset by admin${forceChangeOnNextLogin ? " - force change on next login" : ""}`,
    ipAddress,
    userAgent: req.headers["user-agent"],
  });

  res.json({ message: "User password reset successfully" });
});

// ─────────────────────────────────────────────────────────────
// POST /api/users/:id/unlock
// Unlock account (SuperAdmin only)
// ─────────────────────────────────────────────────────────────
export const unlockUser = asyncHandler(async (req, res) => {
  const ipAddress = getClientIP(req);

  const user = await User.findById(req.params.id).select("+accountLockedUntil +failedLoginAttempts");

  if (!user || user.deletedAt) {
    res.status(404);
    throw new Error("User not found");
  }

  user.accountLockedUntil = undefined;
  user.failedLoginAttempts = 0;
  await user.save();

  // Log unlock
  await logAudit({
    action: "USER_UPDATED",
    performedBy: req.user._id,
    targetUser: user._id,
    details: "Account unlocked",
    ipAddress,
    userAgent: req.headers["user-agent"],
  });

  res.json({ message: "User account unlocked" });
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/users/:id
// Delete user (SuperAdmin only, soft delete)
// ─────────────────────────────────────────────────────────────
export const deleteUser = asyncHandler(async (req, res) => {
  const ipAddress = getClientIP(req);

  const user = await User.findById(req.params.id);

  if (!user || user.deletedAt) {
    res.status(404);
    throw new Error("User not found");
  }

  // Prevent deleting SuperAdmin
  if (user.role === "SuperAdmin") {
    res.status(400);
    throw new Error("Cannot delete SuperAdmin user");
  }

  // Prevent deleting if only one admin remains and user is admin
  if (user.role === "Admin") {
    const adminCount = await User.countDocuments({ role: "Admin", deletedAt: null });
    if (adminCount <= 1) {
      res.status(400);
      throw new Error("Cannot delete the last Admin user");
    }
  }

  // Delete profile image from Cloudinary if it exists
  if (user.profileImagePublicId) {
    try {
      await deleteImageFromCloudinary(user.profileImagePublicId);
    } catch (deleteErr) {
      console.error("Failed to delete profile image from Cloudinary:", deleteErr.message);
      // Continue - don't fail user deletion if image deletion fails
    }
  }

  // Soft delete
  user.deletedAt = new Date();
  await user.save();

  // Terminate all active sessions
  await Session.updateMany({ user: user._id, isActive: true }, { isActive: false });

  // Log deletion
  await logAudit({
    action: "USER_DELETED",
    performedBy: req.user._id,
    targetUser: user._id,
    details: `User deleted - ${user.fullName}`,
    ipAddress,
    userAgent: req.headers["user-agent"],
  });

  res.json({ message: "User deleted successfully" });
});

// ─────────────────────────────────────────────────────────────
// GET /api/users/:id/sessions
// Get user's active sessions
// ─────────────────────────────────────────────────────────────
export const getUserSessions = asyncHandler(async (req, res) => {
  const sessions = await Session.find({ user: req.params.id, isActive: true }).select(
    "-token"
  );

  res.json(sessions);
});

// ─────────────────────────────────────────────────────────────
// POST /api/users/:id/sessions/:sessionId/terminate
// Force terminate a session
// ─────────────────────────────────────────────────────────────
export const terminateSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const ipAddress = getClientIP(req);

  const session = await Session.findById(sessionId);

  if (!session) {
    res.status(404);
    throw new Error("Session not found");
  }

  session.isActive = false;
  session.logoutTime = new Date();
  await session.save();

  // Log session termination
  await logAudit({
    action: "SESSION_TERMINATED",
    performedBy: req.user._id,
    targetUser: session.user,
    details: "Session force terminated",
    ipAddress,
    userAgent: req.headers["user-agent"],
  });

  res.json({ message: "Session terminated" });
});
