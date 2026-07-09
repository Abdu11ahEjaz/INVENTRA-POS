import asyncHandler from "express-async-handler";
import Session from "../models/Session.js";
import User from "../models/User.js";
import { logAudit } from "../utils/auditLogger.js";

const getClientIP = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
  req.socket.remoteAddress ||
  "Unknown";

// GET /api/sessions
export const listSessions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, user, isActive } = req.query;

  const skip = (page - 1) * limit;
  const query = {};
  if (user) query.user = user;
  if (isActive !== undefined) query.isActive = isActive === "true";

  const sessions = await Session.find(query)
    .populate("user", "fullName email role department")
    .select("-token")
    .sort({ loginTime: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Session.countDocuments(query);
  res.json({
    sessions,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
  });
});

// GET /api/sessions/:id
export const getSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id)
    .populate("user", "fullName email role department")
    .select("-token");

  if (!session) {
    res.status(404);
    throw new Error("Session not found");
  }

  res.json(session);
});

// POST /api/sessions/:id/terminate
export const terminateSession = asyncHandler(async (req, res) => {
  const ipAddress = getClientIP(req);

  const session = await Session.findById(req.params.id);
  if (!session) {
    res.status(404);
    throw new Error("Session not found");
  }

  session.isActive = false;
  session.logoutTime = new Date();
  await session.save();

  await logAudit({
    action: "SESSION_TERMINATED",
    performedBy: req.user._id,
    targetUser: session.user,
    details: "Force terminated session",
    ipAddress,
    userAgent: req.headers["user-agent"],
  });

  res.json({ message: "Session terminated successfully", session });
});

// POST /api/sessions/user/:userId/terminate-all
export const terminateAllUserSessions = asyncHandler(async (req, res) => {
  const ipAddress = getClientIP(req);
  const userId = req.params.userId;

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const result = await Session.updateMany(
    { user: userId, isActive: true },
    { isActive: false, logoutTime: new Date() }
  );

  await logAudit({
    action: "SESSION_TERMINATED",
    performedBy: req.user._id,
    targetUser: userId,
    details: `Terminated ${result.modifiedCount} sessions`,
    ipAddress,
    userAgent: req.headers["user-agent"],
  });

  res.json({ message: `Terminated ${result.modifiedCount} session(s)`, terminatedCount: result.modifiedCount });
});

// GET /api/sessions/stats/summary
export const getSessionStats = asyncHandler(async (_req, res) => {
  const activeSessions = await Session.countDocuments({ isActive: true });
  const totalSessions = await Session.countDocuments();

  const sessionsByBrowser = await Session.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$browser", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const sessionsByDevice = await Session.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$device", count: { $sum: 1 } } },
  ]);

  res.json({ activeSessions, totalSessions, sessionsByBrowser, sessionsByDevice });
});

// DELETE /api/sessions/cleanup
export const cleanupExpiredSessions = asyncHandler(async (_req, res) => {
  const result = await Session.deleteMany({ expiresAt: { $lt: new Date() } });
  res.json({ message: "Cleanup complete", deletedCount: result.deletedCount });
});
