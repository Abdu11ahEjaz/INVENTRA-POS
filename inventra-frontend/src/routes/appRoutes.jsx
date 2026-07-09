import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { RequireAuth, RequireSuperAdmin, RedirectIfAuth } from "@/components/common/ProtectedRoute";

// ── Lazy-loaded pages ──────────────────────────────────────────
const SignInPage          = lazy(() => import("@/pages/auth/SignInPage"));
const ForgotPasswordPage  = lazy(() => import("@/pages/auth/ForgotPasswordPage"));
const ResetPasswordPage   = lazy(() => import("@/pages/auth/ResetPasswordPage"));
const SuperAdminDashboard = lazy(() => import("@/pages/superadmin/SuperAdminDashboard"));
const DashBoardPage       = lazy(() => import("@/pages/dashboard/DashBoardPage"));
const InventoryPage       = lazy(() => import("@/pages/inventory/InventoryPage"));
const SuppliersPage       = lazy(() => import("@/pages/suppliers/SuppliersPage"));
const PurchasesPage       = lazy(() => import("@/pages/purchases/PurchasesPage"));
const InvoicesPage        = lazy(() => import("@/pages/invoices/InvoicesPage"));
const LedgerPage          = lazy(() => import("@/pages/ledger/LedgerPage"));
const ReportsPage         = lazy(() => import("@/pages/reports/ReportsPage"));
const StaffPage           = lazy(() => import("@/pages/staff/StaffPage"));
const SettingsPage        = lazy(() => import("@/pages/settings/SettingsPage"));
const ProfilePage         = lazy(() => import("@/pages/profile/ProfilePage"));

// ── Loading fallback ───────────────────────────────────────────
const PageLoader = () => (
  <div className="flex h-full items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
  </div>
);

const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* ── Auth (redirect away if logged in) ── */}
      <Route element={<RedirectIfAuth />}>
        <Route path="/signin"                    element={<SignInPage />} />
        <Route path="/forgot-password"           element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token"     element={<ResetPasswordPage />} />
      </Route>

      {/* ── SuperAdmin only ── */}
      <Route element={<RequireSuperAdmin />}>
        <Route path="/superadmin" element={<SuperAdminDashboard />} />
      </Route>

      {/* ── Protected app routes ── */}
      <Route element={<RequireAuth />}>
        <Route element={<MainLayout />}>
          <Route path="/"           element={<DashBoardPage />} />
          <Route path="/dashboard"  element={<DashBoardPage />} />
          <Route path="/inventory"  element={<InventoryPage />} />
          <Route path="/suppliers"  element={<SuppliersPage />} />
          <Route path="/sales"      element={<Navigate to="/invoices" replace />} />
          <Route path="/purchases"  element={<PurchasesPage />} />
          <Route path="/invoices"   element={<InvoicesPage />} />
          <Route path="/ledger"     element={<LedgerPage />} />
          <Route path="/reports"    element={<ReportsPage />} />
          <Route path="/settings"   element={<SettingsPage />} />
          <Route path="/profile"    element={<ProfilePage />} />
        </Route>
      </Route>

      {/* ── Staff & Access Management (SuperAdmin only) ── */}
      <Route element={<RequireSuperAdmin />}>
        <Route element={<MainLayout />}>
          <Route path="/staff"      element={<StaffPage />} />
        </Route>
      </Route>

      {/* ── Fallback: catch all unknown routes ── */}
      <Route path="*" element={<Navigate to="/signin" replace />} />

    </Routes>
  </Suspense>
);

export default AppRoutes;
