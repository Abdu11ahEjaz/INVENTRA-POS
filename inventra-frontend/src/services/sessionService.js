import apiClient from "@/api/axios";

const SESSION_ENDPOINTS = {
  LIST: "/sessions",
  GET: (id) => `/sessions/${id}`,
  TERMINATE: (id) => `/sessions/${id}/terminate`,
  TERMINATE_ALL_USER: (userId) => `/sessions/user/${userId}/terminate-all`,
  GET_STATS: "/sessions/stats/summary",
  CLEANUP: "/sessions/cleanup",
};

// ─────────────────────────────────────────────────────────────
// List all active sessions
// ─────────────────────────────────────────────────────────────
export const listSessions = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${SESSION_ENDPOINTS.LIST}?${queryString}` : SESSION_ENDPOINTS.LIST;
  const res = await apiClient.get(url);
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// Get specific session
// ─────────────────────────────────────────────────────────────
export const getSession = async (id) => {
  const res = await apiClient.get(SESSION_ENDPOINTS.GET(id));
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// Terminate specific session
// ─────────────────────────────────────────────────────────────
export const terminateSession = async (id) => {
  const res = await apiClient.post(SESSION_ENDPOINTS.TERMINATE(id));
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// Terminate all sessions for a user
// ─────────────────────────────────────────────────────────────
export const terminateAllUserSessions = async (userId) => {
  const res = await apiClient.post(SESSION_ENDPOINTS.TERMINATE_ALL_USER(userId));
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// Get session statistics
// ─────────────────────────────────────────────────────────────
export const getSessionStats = async () => {
  const res = await apiClient.get(SESSION_ENDPOINTS.GET_STATS);
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// Cleanup expired sessions
// ─────────────────────────────────────────────────────────────
export const cleanupExpiredSessions = async () => {
  const res = await apiClient.delete(SESSION_ENDPOINTS.CLEANUP);
  return res.data;
};
