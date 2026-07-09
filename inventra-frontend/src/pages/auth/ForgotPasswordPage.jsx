import React from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";
import apiClient from "@/api/axios";

export default function ForgotPasswordPage() {
  const [email,     setEmail]     = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [error,     setError]     = React.useState("");
  const [loading,   setLoading]   = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // POST /api/auth/forgot-password
      // Always returns 200 regardless of whether email exists (security)
      await apiClient.post("/auth/forgot-password", { email: email.trim() });
      setSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Please try again.";
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
      {/* Blobs */}
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

        {/* Card */}
        <div className="rounded-2xl p-8"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}>

          {!submitted ? (
            <>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)" }}>
                <Mail className="h-5 w-5 text-sky-400" />
              </div>

              <h2 className="text-2xl font-bold text-white">Forgot password?</h2>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Enter your registered email and we'll send you a reset link valid for 15 minutes.
              </p>

              {error && (
                <div className="mt-4 rounded-xl px-4 py-3 text-sm text-red-300"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">Email Address</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email" required autoComplete="email"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@inventra.com"
                      className="w-full rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(56,189,248,0.5)")}
                      onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                    />
                  </div>
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-all disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #38bdf8, #6366f1)", boxShadow: "0 4px 20px rgba(56,189,248,0.25)" }}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}>
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Check your email</h2>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                If <span className="font-medium text-sky-400">{email}</span> is registered,
                a password reset link has been sent. Check your inbox and spam folder.
              </p>
              <p className="mt-3 text-xs text-slate-500">The link expires in 15 minutes.</p>
              <button
                onClick={() => { setSubmitted(false); setEmail(""); }}
                className="mt-4 text-xs text-sky-400 hover:text-sky-300 transition"
              >
                Try a different email
              </button>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <Link to="/signin" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
