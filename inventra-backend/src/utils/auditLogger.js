import AuditLog from "../models/AuditLog.js";

/**
 * Log an action to the audit trail
 * @param {Object} params
 * @param {string} params.action - Action type (USER_CREATED, etc.)
 * @param {string} params.performedBy - User ID performing the action
 * @param {string} params.targetUser - User ID being acted upon (optional)
 * @param {string} params.details - Description of the action
 * @param {string} params.ipAddress - IP address of the requester
 * @param {string} params.userAgent - Browser user agent
 * @param {Object} params.oldValues - Previous values (for updates)
 * @param {Object} params.newValues - New values (for updates)
 * @param {string} params.status - Success or Failure
 * @param {string} params.errorMessage - Error message if failure
 */
export const logAudit = async (params) => {
  try {
    const {
      action,
      performedBy,
      targetUser = null,
      details = "",
      ipAddress = "",
      userAgent = "",
      oldValues = null,
      newValues = null,
      status = "Success",
      errorMessage = null,
    } = params;

    await AuditLog.create({
      action,
      performedBy,
      targetUser,
      details,
      ipAddress,
      userAgent,
      oldValues,
      newValues,
      status,
      errorMessage,
    });
  } catch (err) {
    console.error("[Audit] Logging failed:", err.message);
    // Don't throw — audit failures shouldn't break main operations
  }
};

/**
 * Get audit logs with filtering and pagination
 */
export const getAuditLogs = async (filters = {}, page = 1, limit = 50) => {
  const query = {};

  if (filters.action) query.action = filters.action;
  if (filters.performedBy) query.performedBy = filters.performedBy;
  if (filters.targetUser) query.targetUser = filters.targetUser;
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
  }

  const skip = (page - 1) * limit;
  const logs = await AuditLog.find(query)
    .populate("performedBy", "fullName email role")
    .populate("targetUser", "fullName email role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await AuditLog.countDocuments(query);

  return {
    logs,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};
