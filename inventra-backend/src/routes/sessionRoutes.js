import express from "express";
import {
  listSessions,
  getSession,
  terminateSession,
  terminateAllUserSessions,
  getSessionStats,
  cleanupExpiredSessions,
} from "../controllers/sessionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { superAdminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All session management routes — SuperAdmin only
router.use(protect, superAdminOnly);

// List all sessions
router.get("/", listSessions);

// Get session statistics
router.get("/stats/summary", getSessionStats);

// Cleanup expired sessions
router.delete("/cleanup", cleanupExpiredSessions);

// Get specific session
router.get("/:id", getSession);

// Terminate specific session
router.post("/:id/terminate", terminateSession);

// Terminate all sessions for a user
router.post("/user/:userId/terminate-all", terminateAllUserSessions);

export default router;
