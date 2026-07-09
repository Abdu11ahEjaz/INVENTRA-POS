import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import apiClient from "@/api/axios";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_HOME } from "@/hooks/useAuth";

export default function ResetPasswordPage() {
  const { token }    = useParams();
  const navigate     = useNavigate();
  const { updateUser } = useAuth();

  const [password,        setPassword]        = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPw,          setShowPw]          = React.useState(false);
  const [showConfirm,     setShowConfirm]     = React.useState(false);
  const [loading,         setLoading]         = React.useState(false);
  const [error,           setError]           = React.useState("");
  const [success,         setSuccess]         = React.useState(false);

  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8)          s++;
    if (/[A-Z]/.test(password))        s++;
    if (/[0-9]/.test(password))        s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }

    setLoading(true);
    try {
      // POST /api/auth/reset-password/:token
      const res = await apiClient.post(`/auth/reset-password/${token}`, {
        password,
        confirmPassword,
      });

      const { token: jwt, user } = res.data;

      // Auto-login after reset
      localStorage.setItem("inventra_token", jwt);
      localStorage.setItem("inventra_user", JSON.stringify(user));
      updateUser(user);

      setSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(ROLE_HOME[user.role] ?? "/", { replace: true });
      }, 2000);

    } catch (err) {
      const msg = err.response?.data?.message || "Reset failed. The link may have expired.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex h-screen w-screen items-center justify-center p-6"
      style={{ background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 100%)" }}
    >
      <div className="pointer-events-none fixed -top-32 -left-32 h-96 w-96 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #38bdf8, transparent 70%)" }} />
      <div className="pointer-events-none fixed -bottom-32 -right-32 h-96 w-96 rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }} />

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "linear-gradient(135deg, #38bdf8, #6366f1)", boxShadow: "0 0 20px rgba(56,189,248,0.4)" }}>
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <p className="text-base font-bold text-white">inventra POS</p>
        </div>

        <div className="rounded-2xl p-8"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}>

          {success ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}>
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Password Reset!</h2>
              <p className="mt-2 text-sm text-slate-400">
                Your password has been updated. Redirecting you now...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)" }}>
                <Lock className="h-5 w-5 text-sky-400" />
              </div>

              <h2 className="text-2xl font-bold text-white">Set new password</h2>
              <p className="mt-2 text-sm text-slate-400">
                Choose a strong password with at least 8 characters.
              </p>

              {error && (
                <div className="mt-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm text-red-300"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {/* New password */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">New Password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPw ? "text" : "password"} required autoComplete="new-password"
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full rounded-xl py-3 pl-10 pr-11 text-sm text-white placeholder-slate-600 outline-none transition"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(56,189,248,0.5)")}
                      onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[1,2,3,4].map((i) => (
                          <div key={i} className="h-1 flex-1 rounded-full transition-all"
                            style={{ background: i <= strength ? strengthColor : "rgba(255,255,255,0.1)" }} />
                        ))}
                      </div>
                      <p className="mt-1 text-[11px]" style={{ color: strengthColor }}>{strengthLabel}</p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">Confirm Password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showConfirm ? "text" : "password"} required autoComplete="new-password"
                      value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full rounded-xl py-3 pl-10 pr-11 text-sm text-white placeholder-slate-600 outline-none transition"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(56,189,248,0.5)")}
                      onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition">
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-all disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #38bdf8, #6366f1)", boxShadow: "0 4px 20px rgba(56,189,248,0.25)" }}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 flex justify-center">
            <Link to="/signin" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
