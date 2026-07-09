import apiClient from "@/api/axios";

const USER_ENDPOINTS = {
  LIST: "/users",
  CREATE: "/users",
  GET: (id) => `/users/${id}`,
  UPDATE: (id) => `/users/${id}`,
  UPDATE_STATUS: (id) => `/users/${id}/status`,
  RESET_PASSWORD: (id) => `/users/${id}/reset-password`,
  UNLOCK: (id) => `/users/${id}/unlock`,
  DELETE: (id) => `/users/${id}`,
  GET_SESSIONS: (id) => `/users/${id}/sessions`,
  TERMINATE_SESSION: (id, sessionId) => `/users/${id}/sessions/${sessionId}/terminate`,
};

// ─────────────────────────────────────────────────────────────
// List all users with pagination and filtering
// ─────────────────────────────────────────────────────────────
export const listUsers = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${USER_ENDPOINTS.LIST}?${queryString}` : USER_ENDPOINTS.LIST;
  const res = await apiClient.get(url);
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// Get single user by ID
// ─────────────────────────────────────────────────────────────
export const getUserById = async (id) => {
  const res = await apiClient.get(USER_ENDPOINTS.GET(id));
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// Create new user (SuperAdmin only, with optional profile image)
// ─────────────────────────────────────────────────────────────
export const createUser = async (userData) => {
  try {
    // Check if userData is FormData (has image) or regular object
    const isFormData = userData instanceof FormData;
    
    const config = isFormData 
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : {};
    
    const res = await apiClient.post(USER_ENDPOINTS.CREATE, userData, config);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// ─────────────────────────────────────────────────────────────
// Update user information (SuperAdmin only)
// ─────────────────────────────────────────────────────────────
export const updateUser = async (id, userData) => {
  const res = await apiClient.put(USER_ENDPOINTS.UPDATE(id), userData);
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// Update user status (Active/Inactive/Suspended)
// ─────────────────────────────────────────────────────────────
export const updateUserStatus = async (id, status) => {
  const res = await apiClient.patch(USER_ENDPOINTS.UPDATE_STATUS(id), { status });
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// Reset user password (SuperAdmin only)
// ─────────────────────────────────────────────────────────────
export const resetUserPassword = async (id, newPassword, forceChangeOnNextLogin = false) => {
  const res = await apiClient.post(USER_ENDPOINTS.RESET_PASSWORD(id), {
    newPassword,
    forceChangeOnNextLogin,
  });
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// Unlock user account
// ─────────────────────────────────────────────────────────────
export const unlockUser = async (id) => {
  const res = await apiClient.post(USER_ENDPOINTS.UNLOCK(id));
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// Delete user (SuperAdmin only, soft delete)
// ─────────────────────────────────────────────────────────────
export const deleteUser = async (id) => {
  const res = await apiClient.delete(USER_ENDPOINTS.DELETE(id));
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// Get user's active sessions
// ─────────────────────────────────────────────────────────────
export const getUserSessions = async (id) => {
  const res = await apiClient.get(USER_ENDPOINTS.GET_SESSIONS(id));
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// Terminate specific session
// ─────────────────────────────────────────────────────────────
export const terminateSession = async (userId, sessionId) => {
  const res = await apiClient.post(
    USER_ENDPOINTS.TERMINATE_SESSION(userId, sessionId)
  );
  return res.data;
};
