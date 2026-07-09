import React, { useState } from "react";
import { Users, Shield, Activity, FileText } from "lucide-react";
import UserListPage from "./UserListPage";
import SessionManagementPage from "./SessionManagementPage";
import AuditLogsPage from "./AuditLogsPage";

const StaffPage = () => {
  const [activeTab, setActiveTab] = useState("users");

  const tabs = [
    {
      id: "users",
      label: "User Management",
      icon: Users,
      component: <UserListPage />,
    },
    {
      id: "sessions",
      label: "Session Management",
      icon: Activity,
      component: <SessionManagementPage />,
    },
    {
      id: "audit",
      label: "Audit Logs",
      icon: FileText,
      component: <AuditLogsPage />,
    },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab);
  const CurrentIcon = currentTab?.icon || Users;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff & Access Management</h1>
          <p className="text-sm text-gray-600">SuperAdmin workspace for user and security management</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 rounded-lg border border-gray-200 bg-gray-50 p-1">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <TabIcon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="rounded-lg bg-white p-6 shadow-sm">{currentTab?.component}</div>
    </div>
  );
};

export default StaffPage;
