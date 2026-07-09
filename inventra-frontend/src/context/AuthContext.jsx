import React from "react";
import apiClient from "@/api/axios";

export const AuthContext = React.createContext(undefined);

// Role constants — must match backend enum exactly (PascalCase)
export const ROLES = {
  SUPER_ADMIN: "SuperAdmin",
  ADMIN:       "Admin",
  MANAGER:     "Manager",
  ACCOUNTANT:  "Accountant",
  SALES:       "Sales",
};

// Role-based redirect map
export const ROLE_HOME = {
  SuperAdmin: "/superadmin",
  Admin:      "/",
  Manager:    "/",
  Accountant: "/ledger",
  Sales:      "/sales",
};

export function AuthProvider({ children }) {
  // Start with user from localStorage — avoids flash of login page
  const [user, setUser] = React.useState(() => {
    try {
      const stored = localStorage.getItem("inventra_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // true while we're verifying the stored token on startup
  const [initializing, setInitializing] = React.useState(true);
  const [authLoading,  setAuthLoading]  = React.useState(false);

  // ── On mount: validate stored token with backend ─────────────
  React.useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem("inventra_token");

      if (!token) {
        // No token stored — clear any stale user data and finish
        localStorage.removeItem("inventra_user");
        setUser(null);
        setInitializing(false);
        return;
      }

      try {
        // Verify token is still valid with the backend
        const res = await apiClient.get("/auth/me");
        const userData = res.data.user;

        const safeUser = {
          id:           userData.id || userData._id,
          fullName:     userData.fullName,
          email:        userData.email,
          role:         userData.role,
          isActive:     userData.isActive,
          phone:        userData.phone || "",
          profileImage: userData.profileImage || null,
          createdAt:    userData.createdAt,
        };

        // Refresh localStorage with latest user data from server
        localStorage.setItem("inventra_user", JSON.stringify(safeUser));
        setUser(safeUser);
      } catch {
        // Token is expired or invalid — clear everything
        localStorage.removeItem("inventra_token");
        localStorage.removeItem("inventra_user");
        setUser(null);
      } finally {
        setInitializing(false);
      }
    };

    validateSession();
  }, []); // runs once on mount

  // ── Login ────────────────────────────────────────────────────
  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      const res = await apiClient.post("/auth/login", { email, password });
      // Backend returns: { token, user: { id, fullName, email, role, isActive, createdAt } }
      const { token, user: userData } = res.data;

      localStorage.setItem("inventra_token", token);

      const safeUser = {
        id:       userData.id || userData._id,
        fullName: userData.fullName,
        email:    userData.email,
        role:     userData.role,
        isActive: userData.isActive,
        phone:    userData.phone,
        profileImage: userData.profileImage,
        createdAt: userData.createdAt,
      };

      localStorage.setItem("inventra_user", JSON.stringify(safeUser));
      setUser(safeUser);
      return safeUser;

    } catch (err) {
      // Offline fallback — only when truly no network
      if (!navigator.onLine || err.code === "ERR_NETWORK") {
        const safeUser = offlineLogin(email, password);
        setUser(safeUser);
        return safeUser;
      }
      const msg = err.response?.data?.message || "Invalid email or password";
      throw new Error(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  // ── Logout ───────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem("inventra_token");
    localStorage.removeItem("inventra_user");
    setUser(null);
  };

  // ── Update local user state ───────────────────────────────────
  const updateUser = (updatedUser) => {
    localStorage.setItem("inventra_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN;
  const isAdmin      = user?.role === ROLES.ADMIN || isSuperAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        initializing,       // true while token is being validated on startup
        isAuthenticated: !!user,
        isSuperAdmin,
        isAdmin,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Offline fallback users ────────────────────────────────────
const OFFLINE_USERS = [
  { id: "offline-1", fullName: "Super Admin",    email: "super@inventra.com",    password: "SuperAdmin@123", role: "SuperAdmin",  isActive: true },
  { id: "offline-2", fullName: "Admin User",     email: "admin@inventra.com",    password: "Admin@1234",     role: "Admin",       isActive: true },
  { id: "offline-3", fullName: "Sarah Manager",  email: "manager@inventra.com",  password: "Manager@123",    role: "Manager",     isActive: true },
  { id: "offline-4", fullName: "John Sales",     email: "sales@inventra.com",    password: "Sales@1234",     role: "Sales",       isActive: true },
  { id: "offline-5", fullName: "Ali Accountant", email: "accounts@inventra.com", password: "Accounts@123",   role: "Accountant",  isActive: true },
];

function offlineLogin(email, password) {
  const found = OFFLINE_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!found) throw new Error("Invalid email or password");
  const { password: _pw, ...safeUser } = found;
  localStorage.setItem("inventra_user", JSON.stringify(safeUser));
  return safeUser;
}

export const USERS_DB = OFFLINE_USERS;
