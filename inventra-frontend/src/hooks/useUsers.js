import { useState, useCallback } from "react";
import * as userService from "@/services/userService";

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 1,
  });

  // ─────────────────────────────────────────────────────────────
  // Fetch users with filters
  // ─────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.listUsers(params);
      setUsers(data.users);
      setPagination(data.pagination);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Get user by ID
  // ─────────────────────────────────────────────────────────────
  const getUser = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const user = await userService.getUserById(id);
      return user;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Create new user
  // ─────────────────────────────────────────────────────────────
  const createUser = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.createUser(userData);
      // Add new user to list
      setUsers((prev) => [response.user, ...prev]);
      return response;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Update user
  // ─────────────────────────────────────────────────────────────
  const updateUser = useCallback(async (id, userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.updateUser(id, userData);
      // Update user in list
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? response.user : u))
      );
      return response;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Update user status
  // ─────────────────────────────────────────────────────────────
  const updateUserStatus = useCallback(async (id, status) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.updateUserStatus(id, status);
      // Update user in list
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, status: response.user.status } : u))
      );
      return response;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Reset user password
  // ─────────────────────────────────────────────────────────────
  const resetPassword = useCallback(async (id, newPassword, forceChange = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.resetUserPassword(id, newPassword, forceChange);
      return response;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Unlock user account
  // ─────────────────────────────────────────────────────────────
  const unlockUser = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.unlockUser(id);
      // Update user in list
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, accountLockedUntil: null } : u))
      );
      return response;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Delete user
  // ─────────────────────────────────────────────────────────────
  const deleteUser = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.deleteUser(id);
      // Remove user from list
      setUsers((prev) => prev.filter((u) => u._id !== id));
      return response;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Get user sessions
  // ─────────────────────────────────────────────────────────────
  const getUserSessions = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const sessions = await userService.getUserSessions(id);
      return sessions;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Terminate session
  // ─────────────────────────────────────────────────────────────
  const terminateSession = useCallback(async (userId, sessionId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.terminateSession(userId, sessionId);
      return response;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    getUser,
    createUser,
    updateUser,
    updateUserStatus,
    resetPassword,
    unlockUser,
    deleteUser,
    getUserSessions,
    terminateSession,
  };
};
