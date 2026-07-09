import express from "express";
import {
  listAuditLogs,
  getAuditLog,
  getUserAuditLogs,
  getAuditLogStats,
  clearOldAuditLogs,
} from "../controllers/auditLogsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { superAdminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All audit log routes — SuperAdmin only
router.use(protect, superAdminOnly);

// List all audit logs
router.get("/", listAuditLogs);

// Get audit log statistics
router.get("/stats/summary", getAuditLogStats);

// Get all logs for a specific user
router.get("/user/:userId", getUserAuditLogs);

// Get specific audit log
router.get("/:id", getAuditLog);

// Clear old audit logs
router.delete("/", clearOldAuditLogs);

export default router;
