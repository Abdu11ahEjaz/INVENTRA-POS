import asyncHandler from "express-async-handler";
import AuditLog from "../models/AuditLog.js";

// GET /api/audit-logs
// List audit logs (SuperAdmin only)
// ─────────────────────────────────────────────────────────────
export const listAuditLogs = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    action,
    performedBy,
    targetUser,
    startDate,
    endDate,
    status,
  } = req.query;

  const query = {};

  if (action) query.action = action;
  if (performedBy) query.performedBy = performedBy;
  if (targetUser) query.targetUser = targetUser;
  if (status) query.status = status;

  // Date range filtering
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const logs = await AuditLog.find(query)
    .populate("performedBy", "fullName email role")
    .populate("targetUser", "fullName email role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await AuditLog.countDocuments(query);

  res.json({
    logs,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// GET /api/audit-logs/:id
// Get specific audit log
// ─────────────────────────────────────────────────────────────
export const getAuditLog = asyncHandler(async (req, res) => {
  const log = await AuditLog.findById(req.params.id)
    .populate("performedBy", "fullName email role")
    .populate("targetUser", "fullName email role");

  if (!log) {
    res.status(404);
    throw new Error("Audit log not found");
  }

  res.json(log);
});

// GET /api/audit-logs/user/:userId
// Get all audit logs for a specific user
// ─────────────────────────────────────────────────────────────
export const getUserAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  const skip = (page - 1) * limit;

  const logs = await AuditLog.find({ targetUser: req.params.userId })
    .populate("performedBy", "fullName email role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await AuditLog.countDocuments({ targetUser: req.params.userId });

  res.json({
    logs,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// GET /api/audit-logs/stats/summary
// Get audit log statistics and summary
// ─────────────────────────────────────────────────────────────
export const getAuditLogStats = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const stats = await AuditLog.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$action",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  const totalLogs = await AuditLog.countDocuments({ createdAt: { $gte: startDate } });

  const failedLogs = await AuditLog.countDocuments({
    createdAt: { $gte: startDate },
    status: "Failure",
  });

  res.json({
    period: `Last ${days} days`,
    totalLogs,
    failedAttempts: failedLogs,
    actionBreakdown: stats,
  });
});

// DELETE /api/audit-logs (with confirmation)
// Clear old audit logs (SuperAdmin only)
// ─────────────────────────────────────────────────────────────
export const clearOldAuditLogs = asyncHandler(async (req, res) => {
  const { days = 90 } = req.body;

  if (!days || days < 30) {
    res.status(400);
    throw new Error("Must provide days >= 30 to prevent accidental deletion");
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const result = await AuditLog.deleteMany({
    createdAt: { $lt: cutoffDate },
  });

  res.json({
    message: `Deleted ${result.deletedCount} audit logs older than ${days} days`,
    deletedCount: result.deletedCount,
  });
});
