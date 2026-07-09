import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogOut, User, Shield, ChevronDown, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import GlobalSearch from "@/components/common/GlobalSearch";
import UserAvatar from "@/components/common/UserAvatar";

const ROLE_BADGE = {
  SuperAdmin: "bg-violet-500/20 text-violet-300",
  Admin:      "bg-sky-500/20 text-sky-300",
  Manager:    "bg-emerald-500/20 text-emerald-300",
  Accountant: "bg-green-500/20 text-green-300",
  Sales:      "bg-blue-500/20 text-blue-300",
};

export default function TopBar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = React.useState(false);
  const dropRef = React.useRef(null);

  const title = location.pathname === "/"
    ? "Dashboard"
    : location.pathname.replace("/", "").replace(/-/g, " ");

  // Close dropdown on outside click
  React.useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-center px-4 md:px-6"
      style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)" }}>

      {/* Breadcrumb - Left */}
      <div className="absolute left-4 md:left-6 hidden items-center gap-1 text-sm text-gray-400 md:flex">
        <span>Workspace</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-gray-800 capitalize">{title}</span>
      </div>

      {/* Search - Center */}
      <div className="relative w-full max-w-md">
        <GlobalSearch />
      </div>

      {/* Profile - Right */}
      <div className="absolute right-4 md:right-6 flex items-center gap-1">

        {/* Profile dropdown */}
        <div className="relative ml-1" ref={dropRef}>
          <button
            onClick={() => setDropOpen(!dropOpen)}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 hover:bg-gray-100 transition"
          >
            {/* Use UserAvatar to show profile image or initials */}
            <UserAvatar user={user} size="sm" />
            <div className="hidden text-left lg:block">
              <p className="text-xs font-semibold text-gray-800 leading-tight">{user?.fullName}</p>
              <p className={`mt-0.5 rounded-full px-1.5 py-px text-[9px] font-semibold capitalize ${ROLE_BADGE[user?.role]}`}>
                {user?.role}
              </p>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${dropOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown */}
          {dropOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl py-1.5 shadow-xl"
              style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)" }}>

              {/* User info */}
              <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <p className="text-xs font-semibold text-gray-800">{user?.fullName}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{user?.email}</p>
                <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize ${ROLE_BADGE[user?.role]}`}>
                  {user?.role}
                </span>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button
                  onClick={() => { setDropOpen(false); navigate("/profile"); }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 transition"
                >
                  <User className="h-3.5 w-3.5 text-gray-400" />
                  My Profile
                </button>

                {user?.role === "SuperAdmin" && (
                  <button
                    onClick={() => { setDropOpen(false); navigate("/superadmin"); }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 transition"
                  >
                    <Shield className="h-3.5 w-3.5 text-violet-400" />
                    Super Admin Panel
                  </button>
                )}
              </div>

              {/* Logout */}
              <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }} className="py-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-red-500 hover:bg-red-50 transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
