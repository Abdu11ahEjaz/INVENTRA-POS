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
// DEPRECATED: Offline fallback is removed. Backend should handle authentication.
// If offline support is needed in the future, use environment variables or secure storage.
const OFFLINE_USERS = [];

function offlineLogin(email, password) {
  throw new Error("Offline login is no longer supported. Please ensure a network connection to authenticate.");
}

export const USERS_DB = OFFLINE_USERS;
