"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Search,
  Eye,
  X,
  FileCode,
  Lock,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

interface AuditLogItem {
  id: string;
  adminUserId: string | null;
  adminEmail: string | null;
  action: string;
  contentType: string;
  recordId: string;
  changedFields: string | null;
  oldValues: string | null;
  newValues: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string | Date;
}

interface AuditLogsClientProps {
  initialLogs: AuditLogItem[];
  total: number;
  initialPage: number;
  initialPageSize: number;
}

const ACTION_COLORS: Record<string, string> = {
  create: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  update: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  archive: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  restore: "bg-teal-500/10 text-teal-400 border-teal-500/30",
  delete: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  status_change: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  publish: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
};

export function AuditLogsClient({
  initialLogs,
  total,
  initialPage,
  initialPageSize,
}: AuditLogsClientProps) {
  const [logs, setLogs] = useState<AuditLogItem[]>(initialLogs);
  const [totalCount, setTotalCount] = useState(total);
  const [page, setPage] = useState(initialPage);
  const [pageSize] = useState(initialPageSize);

  const [filterAction, setFilterAction] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const [inspectLog, setInspectLog] = useState<AuditLogItem | null>(null);

  const fetchLogs = async (newPage: number, action = filterAction, type = filterType, search = searchQuery) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: newPage.toString(),
        pageSize: pageSize.toString(),
      });
      if (action !== "all") params.append("action", action);
      if (type !== "all") params.append("contentType", type);
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setLogs(data.logs);
      setTotalCount(data.total);
      setPage(newPage);
    } catch (err: any) {
      alert("Failed to fetch logs: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newAction: string, newType: string) => {
    setFilterAction(newAction);
    setFilterType(newType);
    fetchLogs(1, newAction, newType, searchQuery);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(1, filterAction, filterType, searchQuery);
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const parseJsonSafe = (str: string | null) => {
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return str;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-brand-gold" />
            Security Audit Trail
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Immutable log of all administrative actions, data modifications, and pitch deck access events.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
          <input
            type="text"
            placeholder="Search email, record ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-brand-teal"
          />
        </form>

        <div>
          <select
            value={filterAction}
            onChange={(e) => handleFilterChange(e.target.value, filterType)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-brand-teal"
          >
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="status_change">Status Change</option>
            <option value="archive">Archive</option>
            <option value="restore">Restore</option>
            <option value="delete">Delete</option>
          </select>
        </div>

        <div>
          <select
            value={filterType}
            onChange={(e) => handleFilterChange(filterAction, e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-brand-teal"
          >
            <option value="all">All Entity Types</option>
            <option value="Startup">Startup</option>
            <option value="Event">Event</option>
            <option value="Grant">Grant</option>
            <option value="Blog">Blog</option>
            <option value="TeamMember">TeamMember</option>
            <option value="SiteSetting">SiteSetting</option>
            <option value="Lead">Lead</option>
            <option value="IncubationApplication">IncubationApplication</option>
            <option value="AdminUser">AdminUser</option>
            <option value="Category">Category</option>
            <option value="PrivacyRequest">PrivacyRequest</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-neutral-900/40 rounded-xl border border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-neutral-950/80 text-xs uppercase text-neutral-400 border-b border-neutral-800 font-semibold tracking-wider font-sans">
              <tr>
                <th className="px-4 py-3">Timestamp (IST)</th>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Record ID</th>
                <th className="px-4 py-3 text-right">Inspection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono text-xs">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-500 font-sans">
                    No audit records found matching criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="px-4 py-3 text-neutral-400">
                      {new Date(log.timestamp).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-white font-sans">
                      {log.adminEmail || "System"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full border text-[11px] font-sans font-medium capitalize ${
                          ACTION_COLORS[log.action] || "bg-neutral-800 text-neutral-300 border-neutral-700"
                        }`}
                      >
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-brand-teal font-sans">
                      {log.contentType}
                    </td>
                    <td className="px-4 py-3 text-neutral-400 truncate max-w-xs">
                      {log.recordId}
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      <button
                        onClick={() => setInspectLog(log)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Diff
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-950/60 border-t border-neutral-800 text-xs text-neutral-400 font-sans">
          <span>
            Showing {logs.length} of {totalCount} log entries
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => fetchLogs(page - 1)}
              className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages || loading}
              onClick={() => fetchLogs(page + 1)}
              className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Inspect Log Diff Modal */}
      {inspectLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl my-8 p-6 shadow-2xl relative">
            <button
              onClick={() => setInspectLog(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-brand-teal" />
              Audit Log Detail — #{inspectLog.id}
            </h2>
            <div className="flex flex-wrap gap-4 text-xs text-neutral-400 mb-4 pb-3 border-b border-neutral-800">
              <div>
                <strong>Actor:</strong> {inspectLog.adminEmail || "System"}
              </div>
              <div>
                <strong>Action:</strong> {inspectLog.action}
              </div>
              <div>
                <strong>Entity:</strong> {inspectLog.contentType} ({inspectLog.recordId})
              </div>
              <div>
                <strong>Time:</strong> {new Date(inspectLog.timestamp).toLocaleString("en-IN")}
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded-lg mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Privacy Guarantee:</strong> Passwords, emails, phone numbers, and internal notes are automatically redacted from stored values.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1 font-sans">
                  Previous Values
                </h4>
                <pre className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 text-xs text-neutral-300 overflow-x-auto max-h-80 font-mono">
                  {inspectLog.oldValues
                    ? JSON.stringify(parseJsonSafe(inspectLog.oldValues), null, 2)
                    : "// None (Creation or N/A)"}
                </pre>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1 font-sans">
                  New Values
                </h4>
                <pre className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 text-xs text-emerald-400 overflow-x-auto max-h-80 font-mono">
                  {inspectLog.newValues
                    ? JSON.stringify(parseJsonSafe(inspectLog.newValues), null, 2)
                    : "// None (Deletion or N/A)"}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-4 mt-4 border-t border-neutral-800">
              <button
                onClick={() => setInspectLog(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm rounded-lg"
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
