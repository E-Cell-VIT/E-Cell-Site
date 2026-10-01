"use client";

import React, { useState } from "react";
import {
  Inbox,
  Search,
  Download,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  User,
  Filter,
  Trash2,
  Check,
  X,
  MessageSquare,
  Sparkles,
} from "lucide-react";

interface LeadItem {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  areaOfInterest: string;
  message: string;
  source: string;
  status: string;
  isRead: boolean;
  internalNotes: string | null;
  createdAt: string | Date;
}

interface LeadsClientProps {
  initialLeads: LeadItem[];
  isSuperAdmin: boolean;
}

export function LeadsClient({ initialLeads, isSuperAdmin }: LeadsClientProps) {
  const [leads, setLeads] = useState<LeadItem[]>(initialLeads);
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSource, setFilterSource] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [noteText, setNoteText] = useState("");
  const [updating, setUpdating] = useState(false);

  // Filter leads locally
  const filtered = leads.filter((lead) => {
    if (filterStatus !== "all" && lead.status !== filterStatus) return false;
    if (filterSource !== "all" && lead.source !== filterSource) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        lead.fullName.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.areaOfInterest.toLowerCase().includes(q) ||
        lead.message.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleSelectLead = async (lead: LeadItem) => {
    setSelectedLead(lead);
    setNoteText(lead.internalNotes || "");

    // If unread, mark read automatically
    if (!lead.isRead) {
      try {
        await fetch(`/api/admin/leads/${lead.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isRead: true }),
        });
        setLeads((prev) =>
          prev.map((l) => (l.id === lead.id ? { ...l, isRead: true } : l))
        );
      } catch (e) {
        console.error("Failed to mark read:", e);
      }
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedLead) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/leads/${selectedLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === selectedLead.id ? { ...l, status: newStatus } : l))
        );
        setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/leads/${selectedLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internalNotes: noteText }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === selectedLead.id ? { ...l, internalNotes: noteText } : l))
        );
        setSelectedLead((prev) => (prev ? { ...prev, internalNotes: noteText } : null));
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this inquiry?")) return;
    try {
      const res = await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
        if (selectedLead?.id === id) setSelectedLead(null);
      }
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (filterStatus !== "all") params.set("status", filterStatus);
    if (filterSource !== "all") params.set("source", filterSource);
    window.location.href = `/api/admin/leads/export?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Inbox className="w-6 h-6 text-rose-500" />
            <span>Leads & Inquiries</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage submissions from the "Connect With Us" modal and Contact Us form
          </p>
        </div>

        {/* Real CSV Export */}
        <button
          onClick={handleExportCsv}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Filtered CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads by name, email, interest..."
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
          <option value="Active">Active</option>
          <option value="Contacted">Contacted</option>
          <option value="Closed">Closed</option>
          <option value="Archived">Archived</option>
        </select>

        <select
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Sources</option>
          <option value="connect_modal">Connect Modal</option>
          <option value="contact_form">Contact Form</option>
        </select>
      </div>

      {/* Table of Leads */}
      <div className="rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-lg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No leads found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100/70 dark:bg-white/[0.02] border-b border-slate-200/80 dark:border-white/10 text-[11px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Interest</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filtered.map((lead) => {
                  const dateStr = new Date(lead.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  });

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => handleSelectLead(lead)}
                      className="hover:bg-indigo-50/40 dark:hover:bg-white/[0.02] cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          {!lead.isRead && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Unread" />
                          )}
                          <div>
                            <span>{lead.fullName}</span>
                            <span className="block text-[11px] text-slate-400 font-normal">
                              {lead.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                          {lead.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-[180px] truncate">
                        {lead.areaOfInterest}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {lead.source === "connect_modal" ? "Modal" : "Contact"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            lead.status === "Active"
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              : lead.status === "Contacted"
                              ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                              : lead.status === "Closed"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-slate-500/10 text-slate-400"
                          }`}
                        >
                          {lead.status}
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
                            handleSelectLead(lead);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                        >
                          View
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

      {/* Selected Lead Drawer/Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="relative w-full max-w-lg bg-surface border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 text-foreground max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <h3 className="text-base font-bold">Inquiry Details</h3>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile info */}
            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-400 font-semibold block">Full Name</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedLead.fullName}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block">Email</span>
                  <a
                    href={`mailto:${selectedLead.email}`}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold underline"
                  >
                    {selectedLead.email}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Phone</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">
                    {selectedLead.phone || "Not provided"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block">Role</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedLead.role}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Area of Interest</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedLead.areaOfInterest}</span>
                </div>
              </div>

              {/* Message */}
              <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Full Message
                </span>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {selectedLead.message}
                </p>
              </div>

              {/* Status Selector */}
              <div className="space-y-1 pt-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Lifecycle Status:
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Active", "Contacted", "Closed", "Archived"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={updating}
                      onClick={() => handleUpdateStatus(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        selectedLead.status === st
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                          : "border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Internal Admin Notes */}
              <div className="space-y-1 pt-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Internal Notes (Private - Never shared publicly):
                </label>
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Record call logs, follow-up actions, assigned team members..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                <button
                  type="button"
                  disabled={updating}
                  onClick={handleSaveNotes}
                  className="mt-1 px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
                >
                  Save Internal Notes
                </button>
              </div>
            </div>

            {/* Bottom actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => handleDelete(selectedLead.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Inquiry</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
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
