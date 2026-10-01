"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  UserPlus,
  KeyRound,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  Lock,
  UserCheck,
  UserX,
} from "lucide-react";

interface AdminUserItem {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  mustChangePassword: boolean;
  failedLoginAttempts: number;
  lockedUntil: string | Date | null;
  lastLoginAt: string | Date | null;
  createdAt: string | Date;
}

interface UsersAdminClientProps {
  initialUsers: AdminUserItem[];
  currentAdminId: string;
}

export function UsersAdminClient({
  initialUsers,
  currentAdminId,
}: UsersAdminClientProps) {
  const [users, setUsers] = useState<AdminUserItem[]>(initialUsers);

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "editor",
  });

  // Reset Password Modal
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<AdminUserItem | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");

      setUsers((prev) => [data.user, ...prev]);
      setCreateModalOpen(false);
      setCreateForm({ name: "", email: "", password: "", role: "editor" });
      setSuccessMsg("Admin user created successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (u: AdminUserItem) => {
    if (u.id === currentAdminId) {
      alert("You cannot deactivate your own account.");
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !u.active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      setUsers((prev) => prev.map((item) => (item.id === u.id ? { ...item, active: !item.active } : item)));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleChangeRole = async (u: AdminUserItem, newRole: string) => {
    if (u.id === currentAdminId && newRole !== "super_admin") {
      alert("You cannot demote your own Super Admin account.");
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role");

      setUsers((prev) => prev.map((item) => (item.id === u.id ? { ...item, role: newRole } : item)));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/admin/users/${resetTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");

      setResetModalOpen(false);
      setResetTarget(null);
      setNewPassword("");
      alert("Password has been reset successfully. User must change password upon next login.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (u: AdminUserItem) => {
    if (u.id === currentAdminId) {
      alert("You cannot delete your own account.");
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete administrator account for ${u.email}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete user");

      setUsers((prev) => prev.filter((item) => item.id !== u.id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-teal" />
            Admin Users & Role Control
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Super Admin exclusive portal for creating credentials, enforcing RBAC roles, and resetting passwords.
          </p>
        </div>
        <button
          onClick={() => {
            setErrorMsg("");
            setCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-navy hover:bg-brand-navy/80 text-white rounded-lg font-medium text-sm transition-all border border-brand-teal/30 shadow-lg shadow-black/20"
        >
          <UserPlus className="w-4 h-4 text-brand-teal" />
          Add Admin User
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          {successMsg}
        </div>
      )}

      {/* Table */}
      <div className="bg-neutral-900/40 rounded-xl border border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-neutral-950/80 text-xs uppercase text-neutral-400 border-b border-neutral-800 font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-3">Administrator</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Account Status</th>
                <th className="px-4 py-3">Last Login</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              {users.map((u) => {
                const isSelf = u.id === currentAdminId;
                return (
                  <tr key={u.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="px-4 py-3 font-sans">
                      <div className="font-medium text-white flex items-center gap-2">
                        {u.name}
                        {isSelf && (
                          <span className="text-[10px] bg-brand-teal/10 text-brand-teal px-1.5 py-0.5 rounded border border-brand-teal/30">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-400 font-mono">{u.email}</div>
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <select
                        value={u.role}
                        disabled={isSelf}
                        onChange={(e) => handleChangeRole(u, e.target.value)}
                        className={`text-xs px-2.5 py-1 rounded-md font-semibold focus:outline-none ${
                          u.role === "super_admin"
                            ? "bg-purple-500/10 text-purple-300 border border-purple-500/30"
                            : "bg-neutral-800 text-neutral-300 border border-neutral-700"
                        } disabled:opacity-80`}
                      >
                        <option value="editor">Editor</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 font-sans">
                      {u.active ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
                          <AlertCircle className="w-3 h-3" /> Deactivated
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-400 font-mono">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString("en-IN") : "Never"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-sans">
                        <button
                          onClick={() => {
                            setResetTarget(u);
                            setNewPassword("");
                            setErrorMsg("");
                            setResetModalOpen(true);
                          }}
                          title="Reset Password"
                          className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded transition-colors"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        {!isSelf && (
                          <>
                            <button
                              onClick={() => handleToggleActive(u)}
                              title={u.active ? "Deactivate Account" : "Reactivate Account"}
                              className={`p-1.5 rounded transition-colors ${
                                u.active
                                  ? "text-neutral-400 hover:text-rose-400 hover:bg-neutral-800"
                                  : "text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800"
                              }`}
                            >
                              {u.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u)}
                              title="Delete Admin"
                              className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-brand-teal" />
              Add Administrator
            </h2>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                  placeholder="e.g. Aditi Shah"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                  placeholder="name@vit.edu.in"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Initial Password * (Min 8 chars)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Role
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                >
                  <option value="editor">Editor (Content Management)</option>
                  <option value="super_admin">Super Admin (Full RBAC + Audit + Delete)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-brand-navy hover:bg-brand-navy/80 text-white text-sm rounded-lg font-medium border border-brand-teal/40 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalOpen && resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setResetModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-400" />
              Reset Password
            </h2>
            <p className="text-xs text-neutral-400 mb-4">
              Setting new credentials for <strong className="text-white">{resetTarget.email}</strong>.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  New Password * (Min 8 chars)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-black text-sm font-semibold rounded-lg disabled:opacity-50"
                >
                  {loading ? "Resetting..." : "Set New Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
