"use client";

import React, { useState } from "react";
import {
  UserCheck,
  Search,
  Eye,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Mail,
  Shield,
} from "lucide-react";

interface PrivacyRequestItem {
  id: string;
  fullName: string;
  email: string;
  requestType: string;
  details: string;
  status: string;
  completedAt: string | Date | null;
  internalNotes: string | null;
  createdAt: string | Date;
}

interface PrivacyRequestsClientProps {
  initialRequests: PrivacyRequestItem[];
  total: number;
}

const STATUS_COLORS: Record<string, string> = {
  New: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  "In Progress": "bg-amber-500/10 text-amber-400 border-amber-500/30",
  Completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
};

export function PrivacyRequestsClient({
  initialRequests,
  total,
}: PrivacyRequestsClientProps) {
  const [requests, setRequests] = useState<PrivacyRequestItem[]>(initialRequests);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [activeItem, setActiveItem] = useState<PrivacyRequestItem | null>(null);
  const [statusInput, setStatusInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [saving, setSaving] = useState(false);

  const filteredRequests = requests.filter((r) => {
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.fullName.toLowerCase().includes(q);
      const matchEmail = r.email.toLowerCase().includes(q);
      const matchDetails = r.details.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchDetails) return false;
    }
    return true;
  });

  const handleOpenDetail = (r: PrivacyRequestItem) => {
    setActiveItem(r);
    setStatusInput(r.status);
    setNotesInput(r.internalNotes || "");
  };

  const handleSaveDetail = async () => {
    if (!activeItem) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/privacy-requests/${activeItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statusInput,
          internalNotes: notesInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update request");

      setRequests((prev) => prev.map((item) => (item.id === activeItem.id ? data.request : item)));
      setActiveItem(data.request);
      alert("Privacy request status updated.");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-brand-teal" />
            DPDP Privacy & Rights Requests
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Incoming data rights requests (Data Access, Correction, Erasure, Consent Withdrawal) submitted by public users.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by user name, email or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-brand-teal"
          />
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-brand-teal"
          >
            <option value="all">All Statuses</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-neutral-900/40 rounded-xl border border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-neutral-950/80 text-xs uppercase text-neutral-400 border-b border-neutral-800 font-semibold tracking-wider font-sans">
              <tr>
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Request Type</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono text-xs">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-500 font-sans">
                    No privacy requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="px-4 py-3 font-sans">
                      <div className="font-medium text-white">{r.fullName}</div>
                      <div className="text-xs text-neutral-400 font-mono">{r.email}</div>
                    </td>
                    <td className="px-4 py-3 font-sans text-xs">
                      <span className="bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-medium">
                        {r.requestType}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans text-xs text-neutral-400 truncate max-w-xs">
                      {r.details}
                    </td>
                    <td className="px-4 py-3 text-neutral-400 font-mono">
                      {new Date(r.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded-full border text-xs font-medium ${
                          STATUS_COLORS[r.status] || "bg-neutral-800 text-neutral-400 border-neutral-700"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      <button
                        onClick={() => handleOpenDetail(r)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl my-8 p-6 shadow-2xl relative">
            <button
              onClick={() => setActiveItem(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-teal" />
              Privacy Rights Request #{activeItem.id.slice(-6)}
            </h2>
            <div className="text-xs text-neutral-400 mb-4 pb-2 border-b border-neutral-800">
              Submitted on {new Date(activeItem.createdAt).toLocaleString("en-IN")}
            </div>

            <div className="space-y-4 text-xs text-neutral-300 font-sans">
              <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 space-y-2">
                <div>
                  <strong className="text-white">Applicant Name:</strong> {activeItem.fullName}
                </div>
                <div>
                  <strong className="text-white">Email Address:</strong> {activeItem.email}
                </div>
                <div>
                  <strong className="text-white">Request Type:</strong> {activeItem.requestType}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  Request Details / User Explanation:
                </label>
                <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 text-neutral-200 whitespace-pre-wrap leading-relaxed">
                  {activeItem.details}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Status
                </label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                >
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Internal Administrative Notes (Private)
                </label>
                <textarea
                  rows={3}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Record verification steps, deletion timestamp, or correspondence log..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm rounded-lg"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveDetail}
                  className="px-5 py-2 bg-brand-navy hover:bg-brand-navy/80 text-white text-sm rounded-lg font-medium border border-brand-teal/40 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Status & Notes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
