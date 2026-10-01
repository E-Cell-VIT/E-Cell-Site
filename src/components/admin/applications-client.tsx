"use client";

import React, { useState } from "react";
import {
  FileCheck2,
  Search,
  Download,
  FileDown,
  Trash2,
  X,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface ApplicationItem {
  id: string;
  startupName: string;
  founderNames: string;
  founderEmail: string;
  founderPhone: string;
  departmentBatch: string;
  domain: string;
  oneLineSummary: string;
  stage: string;
  pitchDeckPath: string | null;
  pitchDeckFilename: string | null;
  status: string;
  internalNotes: string | null;
  createdAt: string | Date;
  accessLogs?: Array<{ id: string; adminEmail: string; timestamp: string | Date }>;
}

interface ApplicationsClientProps {
  initialApplications: ApplicationItem[];
  isSuperAdmin: boolean;
}

export function ApplicationsClient({
  initialApplications,
  isSuperAdmin,
}: ApplicationsClientProps) {
  const [applications, setApplications] = useState<ApplicationItem[]>(initialApplications);
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [noteText, setNoteText] = useState("");
  const [updating, setUpdating] = useState(false);

  const filtered = applications.filter((app) => {
    if (filterStatus !== "all" && app.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        app.startupName.toLowerCase().includes(q) ||
        app.founderNames.toLowerCase().includes(q) ||
        app.founderEmail.toLowerCase().includes(q) ||
        app.domain.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleSelectApp = (app: ApplicationItem) => {
    setSelectedApp(app);
    setNoteText(app.internalNotes || "");
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedApp) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/applications/${selectedApp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === selectedApp.id ? { ...a, status: newStatus } : a))
        );
        setSelectedApp((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/applications/${selectedApp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internalNotes: noteText }),
      });
      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === selectedApp.id ? { ...a, internalNotes: noteText } : a))
        );
        setSelectedApp((prev) => (prev ? { ...prev, internalNotes: noteText } : null));
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this application?")) return;
    try {
      const res = await fetch(`/api/admin/applications/${id}`, { method: "DELETE" });
      if (res.ok) {
        setApplications((prev) => prev.filter((a) => a.id !== id));
        if (selectedApp?.id === id) setSelectedApp(null);
      }
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (filterStatus !== "all") params.set("status", filterStatus);
    window.location.href = `/api/admin/applications/export?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileCheck2 className="w-6 h-6 text-amber-500" />
            <span>Incubation Cohort Applications</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review student startup submissions and evaluate confidential pitch decks
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Applications CSV</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by startup name, founder, domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Statuses</option>
          <option value="Pending">Pending Review</option>
          <option value="Shortlisted">Shortlisted</option>
          <option value="Accepted">Accepted for Incubation</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-lg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No incubation applications found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100/70 dark:bg-white/[0.02] border-b border-slate-200/80 dark:border-white/10 text-[11px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Startup</th>
                  <th className="py-3 px-4">Founders</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Domain</th>
                  <th className="py-3 px-4">Deck</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filtered.map((app) => {
                  const dateStr = new Date(app.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  });

                  return (
                    <tr
                      key={app.id}
                      onClick={() => handleSelectApp(app)}
                      className="hover:bg-indigo-50/40 dark:hover:bg-white/[0.02] cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <span>{app.startupName}</span>
                        <span className="block text-[11px] text-slate-400 font-normal truncate max-w-[200px]">
                          {app.oneLineSummary}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {app.founderNames}
                        </span>
                        <span className="text-[11px] text-slate-400">{app.founderEmail}</span>
                      </td>

                      <td className="py-3.5 px-4">{app.departmentBatch}</td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                          {app.domain}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {app.pitchDeckPath ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            PDF
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">None</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            app.status === "Pending"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : app.status === "Shortlisted"
                              ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                              : app.status === "Accepted"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        {dateStr}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectApp(app);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Application Drawer/Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="relative w-full max-w-xl bg-surface border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 text-foreground max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold">Application Evaluation</h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-400 font-semibold block">Startup Name</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedApp.startupName}
                </span>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold block mt-0.5">
                  {selectedApp.domain} • Stage: {selectedApp.stage}
                </span>
              </div>

              {/* Founder contacts (Protected within admin) */}
              <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5 space-y-2 text-xs">
                <span className="block font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                  Founder Contacts (Private Table)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block">Founders:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{selectedApp.founderNames}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Department/Batch:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{selectedApp.departmentBatch}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Email:</span>
                    <a href={`mailto:${selectedApp.founderEmail}`} className="text-indigo-500 underline font-semibold">
                      {selectedApp.founderEmail}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Phone:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{selectedApp.founderPhone}</strong>
                  </div>
                </div>
              </div>

              {/* Pitch Summary */}
              <div>
                <span className="text-xs text-slate-400 font-semibold block mb-1">
                  Elevator Pitch / Problem Statement
                </span>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
                  {selectedApp.oneLineSummary}
                </p>
              </div>

              {/* Authenticated Pitch Deck Download */}
              <div>
                <span className="text-xs text-slate-400 font-semibold block mb-1">
                  Confidential Pitch Deck File
                </span>
                {selectedApp.pitchDeckPath ? (
                  <a
                    href={`/api/files/private/${selectedApp.pitchDeckPath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500/50 flex items-center justify-between text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileDown className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <div>
                        <span>{selectedApp.pitchDeckFilename || "Pitch_Deck.pdf"}</span>
                        <span className="block text-[10px] text-slate-400 font-normal">
                          Protected private download • Logged for audit
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white text-[11px]">
                      Download PDF
                    </span>
                  </a>
                ) : (
                  <p className="text-xs text-slate-400 italic">No pitch deck uploaded with this application.</p>
                )}
              </div>

              {/* Lifecycle status buttons */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Update Application Status:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Pending", val: "Pending" },
                    { label: "Shortlisted", val: "Shortlisted" },
                    { label: "Accepted", val: "Accepted" },
                    { label: "Rejected", val: "Rejected" },
                  ].map((s) => (
                    <button
                      key={s.val}
                      type="button"
                      disabled={updating}
                      onClick={() => handleUpdateStatus(s.val)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        selectedApp.status === s.val
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                          : "border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Internal Notes */}
              <div className="space-y-1 pt-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Evaluation Committee Notes (Private):
                </label>
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Record panelist scores, mentor feedback, incubator terms..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                <button
                  type="button"
                  disabled={updating}
                  onClick={handleSaveNotes}
                  className="mt-1 px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
                >
                  Save Committee Notes
                </button>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => handleDelete(selectedApp.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Application</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="ml-auto px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
