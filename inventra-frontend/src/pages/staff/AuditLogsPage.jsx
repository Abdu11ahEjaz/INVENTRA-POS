import React, { useState, useEffect } from "react";
import { Eye, Search, Filter } from "lucide-react";
import { useAuditLogs } from "@/hooks/useAuditLogs";

const ACTION_COLORS = {
  USER_CREATED: "bg-green-100 text-green-800",
  USER_UPDATED: "bg-blue-100 text-blue-800",
  USER_DELETED: "bg-red-100 text-red-800",
  USER_ENABLED: "bg-green-100 text-green-800",
  USER_DISABLED: "bg-gray-100 text-gray-800",
  USER_SUSPENDED: "bg-red-100 text-red-800",
  PASSWORD_RESET: "bg-yellow-100 text-yellow-800",
  PASSWORD_CHANGED: "bg-yellow-100 text-yellow-800",
  LOGIN_SUCCESS: "bg-green-100 text-green-800",
  LOGIN_FAILED: "bg-red-100 text-red-800",
  LOGOUT: "bg-gray-100 text-gray-800",
  ROLE_CHANGED: "bg-blue-100 text-blue-800",
  SESSION_TERMINATED: "bg-orange-100 text-orange-800",
};

const AuditLogsPage = () => {
  const { logs, loading, pagination, fetchLogs } = useAuditLogs();
  const [searchUser, setSearchUser] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 50,
      ...(searchUser && { search: searchUser }),
      ...(actionFilter && { action: actionFilter }),
      ...(statusFilter && { status: statusFilter }),
    };
    fetchLogs(params);
  }, [currentPage, searchUser, actionFilter, statusFilter, fetchLogs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Audit Logs</h2>
        <p className="mt-1 text-sm text-gray-600">Track all system activities and user actions</p>
      </div>

      {/* Filters */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user..."
            value={searchUser}
            onChange={(e) => {
              setSearchUser(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Actions</option>
          <option value="LOGIN_SUCCESS">Login Success</option>
          <option value="LOGIN_FAILED">Login Failed</option>
          <option value="LOGOUT">Logout</option>
          <option value="USER_CREATED">User Created</option>
          <option value="USER_UPDATED">User Updated</option>
          <option value="USER_DELETED">User Deleted</option>
          <option value="PASSWORD_RESET">Password Reset</option>
          <option value="ROLE_CHANGED">Role Changed</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Status</option>
          <option value="Success">Success</option>
          <option value="Failure">Failure</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Performed By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Target</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">IP Address</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700">Status</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                  Loading logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                  No audit logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        ACTION_COLORS[log.action] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {log.performedBy?.fullName || "System"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {log.targetUser?.fullName || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono text-xs">
                    {log.ipAddress}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        log.status === "Success"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="View details"
                    >
                      <Eye className="h-4 w-4 text-gray-600" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: Math.min(pagination.pages, 10) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`rounded-md px-3 py-1 text-sm ${
                currentPage === page
                  ? "bg-indigo-600 text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-96 w-full max-w-lg overflow-auto rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold">Audit Log Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Action:</span>
                <span className="ml-2 text-gray-600">{selectedLog.action}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Timestamp:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Performed By:</span>
                <span className="ml-2 text-gray-600">
                  {selectedLog.performedBy?.fullName || "System"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">IP Address:</span>
                <span className="ml-2 font-mono text-xs text-gray-600">{selectedLog.ipAddress}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Details:</span>
                <p className="ml-2 text-gray-600">{selectedLog.details}</p>
              </div>
              {selectedLog.errorMessage && (
                <div>
                  <span className="font-semibold text-gray-700">Error:</span>
                  <p className="ml-2 text-red-600">{selectedLog.errorMessage}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedLog(null)}
              className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
