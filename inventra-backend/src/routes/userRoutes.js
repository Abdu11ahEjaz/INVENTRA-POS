import express from "express";
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  resetUserPassword,
  unlockUser,
  deleteUser,
  getUserSessions,
  terminateSession,
} from "../controllers/userManagementController.js";
import { protect } from "../middleware/authMiddleware.js";
import { superAdminOnly } from "../middleware/roleMiddleware.js";
import { uploadProfileImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// All user management routes — SuperAdmin only
router.use(protect, superAdminOnly);

// User list and creation (with optional image upload)
router.route("/")
  .get(listUsers)
  .post(uploadProfileImage, createUser);

// Get, update, or delete a specific user
router.route("/:id")
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

// Update user status (Active/Inactive/Suspended)
router.patch("/:id/status", updateUserStatus);

// Reset user password (SuperAdmin only)
router.post("/:id/reset-password", resetUserPassword);

// Unlock user account
router.post("/:id/unlock", unlockUser);

// Get user's active sessions
router.get("/:id/sessions", getUserSessions);

// Terminate a specific session
router.post("/:id/sessions/:sessionId/terminate", terminateSession);

export default router;
