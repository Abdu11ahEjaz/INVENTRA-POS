import React from "react";
import { X, Mail, Phone, Briefcase, Calendar, LogIn } from "lucide-react";
import UserAvatar from "@/components/common/UserAvatar";

const UserDetailsModal = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">User Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* User Avatar */}
          <div className="flex justify-center">
            <UserAvatar user={user} size="lg" />
          </div>

          {/* Name and Email */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">{user.fullName}</h3>
            <p className="text-sm text-gray-600">{user.role}</p>
          </div>

          {/* Details Grid */}
          <div className="space-y-3 border-t border-gray-200 pt-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
              </div>
            </div>

            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{user.phone}</p>
                </div>
              </div>
            )}

            {user.department && (
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="text-sm font-medium text-gray-900">{user.department}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-gray-200">
                {user.status === "Active" ? (
                  <div className="h-2 w-2 rounded-full bg-green-600" />
                ) : user.status === "Suspended" ? (
                  <div className="h-2 w-2 rounded-full bg-red-600" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-gray-600" />
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-sm font-medium text-gray-900">{user.status}</p>
              </div>
            </div>

            {user.lastLogin && (
              <div className="flex items-center gap-3">
                <LogIn className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Last Login</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(user.lastLogin).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Created At</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
