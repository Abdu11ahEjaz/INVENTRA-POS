import asyncHandler from "express-async-handler";
import User from "../models/User.js";

// GET /api/users
export const getUsers = asyncHandler(async (_req, res) => {
  const users = await User.find()
    .select("-password -resetPasswordToken -resetPasswordExpire")
    .sort("-createdAt");
  res.json(users);
});

// GET /api/users/:id
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password -resetPasswordToken -resetPasswordExpire");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
});

// POST /api/users
export const createUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, role, isActive } = req.body;

  if (!fullName || !email || !password) {
    res.status(400);
    throw new Error("fullName, email and password are required");
  }

  const exists = await User.findOne({ email: email.toLowerCase().trim() });
  if (exists) {
    res.status(400);
    throw new Error("Email is already registered");
  }

  const user = await User.create({
    fullName,
    email,
    password,
    role: role || "Sales",
    isActive: isActive !== undefined ? isActive : true,
  });

  res.status(201).json({
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  });
});

// PUT /api/users/:id
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Prevent modifying the SuperAdmin account's role
  if (user.role === "SuperAdmin" && req.body.role && req.body.role !== "SuperAdmin") {
    res.status(403);
    throw new Error("Cannot change the role of the SuperAdmin account");
  }

  const { fullName, email, password, role, isActive } = req.body;

  if (fullName) user.fullName = fullName;
  if (email) user.email = email.toLowerCase().trim();
  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (password) user.password = password;

  const updated = await user.save();

  res.json({
    id: updated._id,
    fullName: updated.fullName,
    email: updated.email,
    role: updated.role,
    isActive: updated.isActive,
    updatedAt: updated.updatedAt,
  });
});

// DELETE /api/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role === "SuperAdmin") {
    res.status(403);
    throw new Error("The SuperAdmin account cannot be deleted");
  }

  await user.deleteOne();
  res.json({ success: true, message: "User deleted" });
});
