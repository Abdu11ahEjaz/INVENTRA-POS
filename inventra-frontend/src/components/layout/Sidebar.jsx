import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Truck,
  ShoppingCart,
  FileText,
  BookOpen,
  BarChart3,
  Users,
  Settings,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import UserAvatar from "@/components/common/UserAvatar";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(true);
  const [expandedMenu, setExpandedMenu] = React.useState(null);

  const baseMenuItems = [
    {
      label: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: "Inventory",
      path: "/inventory",
      icon: Package,
      badge: null,
    },
    {
      label: "Suppliers",
      path: "/suppliers",
      icon: Truck,
      badge: null,
    },
    {
      label: "Purchases",
      path: "/purchases",
      icon: ShoppingCart,
      badge: null,
    },
    {
      label: "Invoices",
      path: "/invoices",
      icon: FileText,
      badge: null,
    },
    {
      label: "Ledger",
      path: "/ledger",
      icon: BookOpen,
      badge: null,
    },
    {
      label: "Reports",
      path: "/reports",
      icon: BarChart3,
      badge: null,
    },
    {
      label: "Settings",
      path: "/settings",
      icon: Settings,
      badge: null,
    },
  ];

  // Add Staff & Access Management only for SuperAdmin
  const menuItems = user?.role === "SuperAdmin" 
    ? [
        ...baseMenuItems.slice(0, 7), // Dashboard through Reports
        {
          label: "Staff & Access Management",
          path: "/staff",
          icon: Users,
          badge: null,
        },
        baseMenuItems[7], // Settings
      ]
    : baseMenuItems;

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile menu toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar overlay (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 overflow-y-auto bg-linear-to-b from-indigo-950 via-slate-900 to-slate-800 text-white shadow-2xl transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          backgroundImage: "linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%)",
        }}
      >
        {/* Logo section */}
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6 lg:mt-0 mt-14">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-indigo-600 text-sm font-bold">
            IN
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold">Inventra POS</span>
            <span className="text-xs text-gray-400">Point of Sale</span>
          </div>
        </div>

        {/* Navigation menu */}
        <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            // Skip Settings tab - we'll move it to the bottom
            if (item.label === "Settings") {
              return null;
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-indigo-600/40 text-white shadow-lg shadow-indigo-500/20"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {/* Active indicator bar */}
                {active && (
                  <div className="absolute -left-3 top-0 bottom-0 w-1 rounded-r-lg bg-linear-to-b from-indigo-400 to-indigo-500" />
                )}

                <Icon className={`h-5 w-5 ${active ? "text-indigo-300" : "text-gray-400"}`} />
                <span className="flex-1">{item.label}</span>

                {item.badge && (
                  <span className="inline-flex items-center rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-300">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Settings footer - sticky at bottom */}
        <div className="border-t border-white/10 px-4 py-4 flex-shrink-0">
          <Link
            to="/settings"
            onClick={() => setIsOpen(false)}
            className={`relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
              isActive("/settings")
                ? "bg-indigo-600/40 text-white shadow-lg shadow-indigo-500/20"
                : "text-gray-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {/* Active indicator bar */}
            {isActive("/settings") && (
              <div className="absolute -left-3 top-0 bottom-0 w-1 rounded-r-lg bg-linear-to-b from-indigo-400 to-indigo-500" />
            )}

            <Settings className={`h-5 w-5 ${isActive("/settings") ? "text-indigo-300" : "text-gray-400"}`} />
            <span className="flex-1">Settings</span>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
