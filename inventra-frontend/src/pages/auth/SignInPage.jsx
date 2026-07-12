import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Sparkles, Package, TrendingUp, BarChart3, ShoppingCart } from "lucide-react";
import { useAuth, ROLE_HOME } from "@/hooks/useAuth";

const features = [
  { icon: Package,      label: "Real-time Inventory Tracking" },
  { icon: ShoppingCart, label: "Sales & Purchase Management" },
  { icon: BarChart3,    label: "Advanced Reports & Analytics" },
  { icon: TrendingUp,   label: "Profit & Loss Monitoring" },
];

export default function SignInPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [email,    setEmail]    = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw,   setShowPw]   = React.useState(false);
  const [error,    setError]    = React.useState("");
  const [loading,  setLoading]  = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Email and password are required"); return; }
    setError("");
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      // Redirect based on role - ROLE_HOME maps role to path
      const destination = ROLE_HOME[user.role] ?? "/";
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">

      {/* -- LEFT PANEL -- */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0b1120 0%, #0d1a3a 50%, #0b1120 100%)" }}
      >
        {/* Blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #38bdf8, transparent 70%)" }} />
        <div className="pointer-events-none absolute top-1/3 -right-32 h-80 w-80 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }} />
        <div className="pointer-events-none absolute -bottom-20 left-1/4 h-72 w-72 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #38bdf8, transparent 70%)" }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3 mt-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: "linear-gradient(135deg, #38bdf8, #6366f1)", boxShadow: "0 0 20px rgba(56,189,248,0.4)" }}>
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-base font-bold text-white">Inventra POS</p>
            <p className="text-[11px] text-slate-500">Inventory - Sales - Ledger</p>
          </div>
        </div>

        {/* Content: Text on left, Stat boxes on right */}
        <div className="relative z-10 mt-4 flex gap-8 items-start">
          {/* Left: Headline + Description */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold leading-tight text-white">
              Manage your entire<br />
              <span style={{ background: "linear-gradient(90deg, #38bdf8, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                inventory business
              </span><br />
              in one place.
            </h1>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-sm">
            Track stock levels, manage sales & purchases, generate invoices, and monitor your financials - all from a single dashboard.
            </p>
            <div className="mt-8 space-y-3">
              {features.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.2)" }}>
                    <Icon className="h-3.5 w-3.5 text-sky-400" />
                  </div>
                  <span className="text-sm text-slate-300">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Stat boxes - Hidden on screens < 1280px */}
          <div className="hidden xl:flex flex-col gap-4 shrink-0">
            <div className="w-52 rounded-2xl p-4 opacity-80"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Sample Stock Value</p>
              <p className="mt-1 text-2xl font-bold text-white">2.4K units</p>
              <p className="mt-1 text-xs text-emerald-400">In current inventory</p>
            </div>
            <div className="w-52 rounded-2xl p-4 opacity-70"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Low Stock Items</p>
              <p className="mt-1 text-2xl font-bold text-amber-400">14</p>
              <p className="mt-1 text-xs text-slate-400">Needs reorder</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-600">Copyright 2026 Inventra POS - All rights reserved</p>
      </div>

      {/* -- RIGHT PANEL -- */}
      <div
        className="flex flex-1 items-center justify-center p-6"
        style={{ background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 100%)" }}
      >
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(135deg, #38bdf8, #6366f1)" }}>
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <p className="text-base font-bold text-white">inventra POS</p>
          </div>

          {/* Card */}
          <div className="rounded-2xl p-8"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}>

            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="mt-1 text-sm text-slate-400">Sign in to your inventra POS account</p>

            {error && (
              <div className="mt-4 rounded-xl px-4 py-3 text-sm text-red-300"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Email */}
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

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPw ? "text" : "password"} required autoComplete="current-password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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
              </div>

              {/* Forgot */}
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs text-sky-400 hover:text-sky-300 transition">
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit" disabled={loading}
                className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-all disabled:opacity-60"
                style={{
                  background: loading ? "rgba(56,189,248,0.4)" : "linear-gradient(135deg, #38bdf8, #6366f1)",
                  boxShadow: "0 4px 20px rgba(56,189,248,0.25)",
                }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
