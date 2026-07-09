import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// Full-screen spinner shown while token is being validated on startup
function AuthLoader() {
  return (
    <div className="flex h-screen w-screen items-center justify-center"
      style={{ background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 100%)" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
        <p className="text-xs text-slate-500">Verifying session…</p>
      </div>
    </div>
  );
}

// Redirects to /signin if not authenticated
// Shows loader while token is being validated (prevents flash to login on refresh)
export function RequireAuth() {
  const { isAuthenticated, initializing } = useAuth();
  if (initializing) return <AuthLoader />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/signin" replace />;
}

// Redirects to / if not SuperAdmin
export function RequireSuperAdmin() {
  const { isAuthenticated, isSuperAdmin, initializing } = useAuth();
  if (initializing) return <AuthLoader />;
  if (!isAuthenticated) return <Navigate to="/signin" replace />;
  if (!isSuperAdmin)    return <Navigate to="/" replace />;
  return <Outlet />;
}

// Redirects already-authenticated users away from auth pages
export function RedirectIfAuth() {
  const { isAuthenticated, initializing } = useAuth();
  if (initializing) return <AuthLoader />;
  if (!isAuthenticated) return <Outlet />;
  return <Navigate to="/" replace />;
}
