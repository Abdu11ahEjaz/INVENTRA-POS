import apiClient from "@/api/axios";

const AUDIT_ENDPOINTS = {
  LIST: "/audit-logs",
  GET: (id) => `/audit-logs/${id}`,
  GET_USER_LOGS: (userId) => `/audit-logs/user/${userId}`,
  GET_STATS: "/audit-logs/stats/summary",
  CLEAR_OLD: "/audit-logs",
};

// ─────────────────────────────────────────────────────────────
// List all audit logs with filtering
// ─────────────────────────────────────────────────────────────
export const listAuditLogs = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${AUDIT_ENDPOINTS.LIST}?${queryString}` : AUDIT_ENDPOINTS.LIST;
  const res = await apiClient.get(url);
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// Get specific audit log
// ─────────────────────────────────────────────────────────────
export const getAuditLog = async (id) => {
  const res = await apiClient.get(AUDIT_ENDPOINTS.GET(id));
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// Get all audit logs for a specific user
// ─────────────────────────────────────────────────────────────
export const getUserAuditLogs = async (userId, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString 
    ? `${AUDIT_ENDPOINTS.GET_USER_LOGS(userId)}?${queryString}` 
    : AUDIT_ENDPOINTS.GET_USER_LOGS(userId);
  const res = await apiClient.get(url);
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// Get audit log statistics
// ─────────────────────────────────────────────────────────────
export const getAuditLogStats = async (days = 30) => {
  const res = await apiClient.get(`${AUDIT_ENDPOINTS.GET_STATS}?days=${days}`);
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// Clear old audit logs (SuperAdmin only)
// ─────────────────────────────────────────────────────────────
export const clearOldAuditLogs = async (days = 90) => {
  const res = await apiClient.delete(AUDIT_ENDPOINTS.CLEAR_OLD, {
    data: { days },
  });
  return res.data;
};
