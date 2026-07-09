import { useState, useCallback } from "react";
import * as auditService from "@/services/auditLogsService";

export const useAuditLogs = () => {
  const [logs, setLogs] = useState([]);
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
  // Fetch audit logs with filtering
  // ─────────────────────────────────────────────────────────────
  const fetchLogs = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await auditService.listAuditLogs(params);
      setLogs(data.logs);
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
  // Get specific audit log
  // ─────────────────────────────────────────────────────────────
  const getLog = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const log = await auditService.getAuditLog(id);
      return log;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Get user's audit logs
  // ─────────────────────────────────────────────────────────────
  const getUserLogs = useCallback(async (userId, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await auditService.getUserAuditLogs(userId, params);
      setLogs(data.logs);
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
  // Get audit log statistics
  // ─────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async (days = 30) => {
    setLoading(true);
    setError(null);
    try {
      const data = await auditService.getAuditLogStats(days);
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
  // Clear old audit logs
  // ─────────────────────────────────────────────────────────────
  const clearOldLogs = useCallback(async (days = 90) => {
    setLoading(true);
    setError(null);
    try {
      const response = await auditService.clearOldAuditLogs(days);
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
    logs,
    loading,
    error,
    pagination,
    stats,
    fetchLogs,
    getLog,
    getUserLogs,
    fetchStats,
    clearOldLogs,
  };
};
