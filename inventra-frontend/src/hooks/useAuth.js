import React from "react";
import { AuthContext, ROLES, ROLE_HOME } from "@/context/AuthContext";

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

// Re-export constants so pages can import from one place
export { ROLES, ROLE_HOME };
