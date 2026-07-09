import { useState, useCallback } from "react";
import * as sessionService from "@/services/sessionService";

export const useSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    pages: 1,
  });
  const [stats, setStats] = useState(null);

  // ─────────────────────────────────────────────────────────────
  // Fetch sessions with filtering
  // ─────────────────────────────────────────────────────────────
  const fetchSessions = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await sessionService.listSessions(params);
      setSessions(data.sessions);
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
  // Get specific session
  // ─────────────────────────────────────────────────────────────
  const getSession = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const session = await sessionService.getSession(id);
      return session;
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
  const terminateSession = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionService.terminateSession(id);
      // Remove session from list
      setSessions((prev) => prev.filter((s) => s._id !== id));
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
  // Terminate all sessions for a user
  // ─────────────────────────────────────────────────────────────
  const terminateAllUserSessions = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionService.terminateAllUserSessions(userId);
      // Remove all sessions for user
      setSessions((prev) => prev.filter((s) => s.user._id !== userId));
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
  // Get session statistics
  // ─────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sessionService.getSessionStats();
      setStats(data);
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
  // Cleanup expired sessions
  // ─────────────────────────────────────────────────────────────
  const cleanupExpired = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionService.cleanupExpiredSessions();
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
    sessions,
    loading,
    error,
    pagination,
    stats,
    fetchSessions,
    getSession,
    terminateSession,
    terminateAllUserSessions,
    fetchStats,
    cleanupExpired,
  };
};
