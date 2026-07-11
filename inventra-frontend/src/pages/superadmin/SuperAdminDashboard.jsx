import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Plus, Pencil, Trash2, Shield,
  Eye, EyeOff, Sparkles, LogOut, Save, X,
  ToggleLeft, ToggleRight, RefreshCw,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import apiClient from "@/api/axios";
import { toast } from "sonner";

const ROLES = ["Admin", "Manager", "Accountant", "Sales"];

const ROLE_COLORS = {
  SuperAdmin: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  Admin:      "bg-sky-500/20 text-sky-300 border-sky-500/30",
  Manager:    "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  Accountant: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Sales:      "bg-rose-500/20 text-rose-300 border-rose-500/30",
};

const emptyForm = { fullName: "", email: "", password: "", role: "Sales", isActive: true };

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [users,     setUsers]     = React.useState([]);
  const [fetching,  setFetching]  = React.useState(true);
  const [showForm,  setShowForm]  = React.useState(false);
  const [editId,    setEditId]    = React.useState(null);
  const [form,      setForm]      = React.useState(emptyForm);
  const [showPw,    setShowPw]    = React.useState(false);
  const [saving,    setSaving]    = React.useState(false);
  const [deleteId,  setDeleteId]  = React.useState(null);
  const [deleting,  setDeleting]  = React.useState(false);

  // -- Fetch users ----------------------------------------------
  const fetchUsers = React.useCallback(async () => {
    setFetching(true);
    try {
      const res = await apiClient.get("/users");
      // Backend returns { users, pagination, ... }
      const usersArray = res.data.users || res.data;
      setUsers(Array.isArray(usersArray) ? usersArray : []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load users");
      setUsers([]);
    } finally {
      setFetching(false);
    }
  }, []);

  React.useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // -- Open create form -----------------------------------------
  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowPw(false);
    setShowForm(true);
  };

  // -- Open edit form -------------------------------------------
  const openEdit = (u) => {
    setEditId(u._id || u.id);
    setForm({ fullName: u.fullName, email: u.email, password: "", role: u.role, isActive: u.isActive });
    setShowPw(false);
    setShowForm(true);
  };

  // -- Save (create or update) ----------------------------------
  const handleSave = async () => {
    if (!form.fullName || !form.email) { toast.error("Name and email are required"); return; }
    if (!editId && !form.password)     { toast.error("Password is required for new users"); return; }
    if (form.password && form.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }

    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password; // don't send empty password on edit

      if (editId) {
        await apiClient.put(`/users/${editId}`, payload);
        toast.success("User updated");
      } else {
        await apiClient.post("/users", payload);
        toast.success("User created");
      }
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  // -- Toggle active/inactive -----------------------------------
  const toggleActive = async (u) => {
    try {
      await apiClient.put(`/users/${u._id || u.id}`, { isActive: !u.isActive });
      toast.success(`User ${u.isActive ? "deactivated" : "activated"}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  // -- Delete ---------------------------------------------------
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiClient.delete(`/users/${deleteId}`);
      toast.success("User deleted");
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/signin"); };

  // -- Stats ----------------------------------------------------
  const stats = [
    { label: "Total Users",  value: users.length,                                    color: "#38bdf8" },
    { label: "Active",       value: users.filter(u => u.isActive).length,            color: "#34d399" },
    { label: "Admins",       value: users.filter(u => u.role === "Admin").length,    color: "#818cf8" },
    { label: "Inactive",     value: users.filter(u => !u.isActive).length,           color: "#f87171" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 100%)" }}>

      {/* -- Top bar -- */}
      <header className="flex items-center justify-between px-8 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "linear-gradient(135deg, #38bdf8, #6366f1)", boxShadow: "0 0 16px rgba(56,189,248,0.3)" }}>
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">inventra POS</p>
            <p className="text-[10px] text-violet-400 font-semibold uppercase tracking-wider">Super Admin Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchUsers} className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white transition">
            <RefreshCw className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
              {user?.fullName?.[0] || "S"}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-white">{user?.fullName}</p>
              <p className="text-[10px] text-slate-500">Super Admin</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-white transition">
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">

        {/* Stats */}
        <div className="mb-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="border-border/60 p-5 shadow-soft rounded-lg border bg-card">
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="mt-1 text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Users table */}
        <div className="border-border/60 p-5 shadow-soft rounded-lg border bg-card overflow-hidden">

          <div className="flex items-center justify-between px-0 py-0 -m-5 mb-5 p-5 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-sky-400" />
              <h2 className="text-sm font-semibold text-white">User Management</h2>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-sky-300"
                style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)" }}>
                {users.length} users
              </span>
            </div>
            <button onClick={openCreate}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white transition"
              style={{ background: "linear-gradient(135deg, #38bdf8, #6366f1)", boxShadow: "0 4px 16px rgba(56,189,248,0.2)" }}>
              <Plus className="h-3.5 w-3.5" /> Add User
            </button>
          </div>

          <div className="overflow-x-auto">
            {fetching ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {["Name", "Email", "Role", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id || u.id} className="transition hover:bg-white/2"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                            {u.fullName?.[0] || "?"}
                          </div>
                          <span className="font-medium text-white">{u.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${ROLE_COLORS[u.role] || "bg-slate-500/20 text-slate-300"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => u.role !== "SuperAdmin" && toggleActive(u)}
                          disabled={u.role === "SuperAdmin"}
                          className="flex items-center gap-1.5 text-xs transition disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{ color: u.isActive ? "#34d399" : "#f87171" }}>
                          {u.isActive
                            ? <ToggleRight className="h-4 w-4" />
                            : <ToggleLeft className="h-4 w-4" />}
                          {u.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(u)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-sky-400 transition">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          {u.role !== "SuperAdmin" && (
                            <button onClick={() => setDeleteId(u._id || u.id)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-red-400 transition">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* -- Create / Edit Modal -- */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md border-border/60 p-6 shadow-soft rounded-lg border bg-card">

            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">
                {editId ? "Edit User" : "Create New User"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white transition">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-slate-400">Full Name *</label>
                <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="John Doe"
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-400">Email *</label>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  type="email" placeholder="john@inventra.com"
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-400">
                  Password {editId && <span className="text-slate-600">(leave blank to keep current)</span>}
                </label>
                <div className="relative">
                  <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                    type={showPw ? "text" : "password"} placeholder="Min. 8 characters"
                    className="w-full rounded-xl px-4 py-2.5 pr-10 text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-400">Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)" }}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div>
                  <p className="text-xs font-medium text-white">Account Active</p>
                  <p className="text-[11px] text-slate-500">User can log in when active</p>
                </div>
                <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  style={{ color: form.isActive ? "#34d399" : "#f87171" }}>
                  {form.isActive ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                </button>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowForm(false)}
                className="flex-1 rounded-xl py-2.5 text-sm text-slate-400 hover:text-white transition"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #38bdf8, #6366f1)" }}>
                <Save className="h-3.5 w-3.5" />
                {saving ? "Saving�" : editId ? "Save Changes" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -- Delete Confirm -- */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm border-border/60 p-6 text-center rounded-lg border bg-card">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: "rgba(239,68,68,0.1)" }}>
              <Trash2 className="h-5 w-5 text-red-400" />
            </div>
            <h3 className="text-base font-semibold text-white">Delete User?</h3>
            <p className="mt-1 text-sm text-slate-400">This action cannot be undone.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 rounded-xl py-2.5 text-sm text-slate-400 hover:text-white transition"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
                style={{ background: "rgba(239,68,68,0.8)" }}>
                {deleting ? "Deleting�" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
