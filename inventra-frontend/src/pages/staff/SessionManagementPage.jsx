import React, { useState, useEffect } from "react";
import { LogOut, RefreshCw, Trash2 } from "lucide-react";
import { useSessions } from "@/hooks/useSessions";

const SessionManagementPage = () => {
  const { sessions, loading, pagination, fetchSessions, terminateSession, stats } = useSessions();
  const [filter, setFilter] = useState("active");
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    const params = {
      page: 1,
      limit: 50,
      isActive: filter === "active",
    };
    fetchSessions(params);
  }, [filter, fetchSessions]);

  const handleTerminate = async (sessionId) => {
    if (window.confirm("Terminate this session?")) {
      try {
        await terminateSession(sessionId);
      } catch (err) {
        // Handle error silently or show toast
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Active Sessions</h2>
        <button
          onClick={() => fetchSessions()}
          className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["active", "inactive"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              filter === f
                ? "bg-indigo-600 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {f === "active" ? "Active" : "Inactive"}
          </button>
        ))}
      </div>

      {/* Sessions Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Browser</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Device</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">IP Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Login Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Last Activity</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                  Loading sessions...
                </td>
              </tr>
            ) : sessions.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                  No sessions found
                </td>
              </tr>
            ) : (
              sessions.map((session) => (
                <tr key={session._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <div>
                      <p className="font-semibold">{session.user.fullName}</p>
                      <p className="text-xs text-gray-500">{session.user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{session.browser || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                    {session.device || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{session.ipAddress}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(session.loginTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(session.lastActivity).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {session.isActive && (
                      <button
                        onClick={() => handleTerminate(session._id)}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Terminate session"
                      >
                        <LogOut className="h-4 w-4 text-red-600" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SessionManagementPage;
