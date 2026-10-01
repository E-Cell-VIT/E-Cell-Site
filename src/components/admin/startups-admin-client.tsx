"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Rocket,
  Plus,
  Search,
  ExternalLink,
  Edit3,
  Archive,
  RotateCcw,
  Trash2,
  X,
  CheckCircle,
  Eye,
  ShieldCheck,
  Star,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface StartupData {
  id: string;
  name: string;
  slug: string;
  domain: string;
  oneLineSummary: string;
  fullDescription: string;
  startupStatus: string;
  publicationStatus: string;
  isFeatured: boolean;
  displayOrder: number;
  founderPublicInfo: string;
  msmeStatus: string;
  msmeNumber?: string | null;
  showMsmeNumber: boolean;
  dpiitStatus: string;
  dpiitNumber?: string | null;
  showDpiitNumber: boolean;
  isEcellVerified: boolean;
  isMsmeVerified: boolean;
  isDpiitVerified: boolean;
  websiteUrl?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  privateDetails?: {
    founderEmails?: string;
    founderPhones?: string;
    internalNotes?: string | null;
  } | null;
}

interface StartupsAdminClientProps {
  initialStartups: StartupData[];
  categories: Array<{ id: string; name: string }>;
  isSuperAdmin: boolean;
}

export function StartupsAdminClient({
  initialStartups,
  categories,
  isSuperAdmin,
}: StartupsAdminClientProps) {
  const [startups, setStartups] = useState<StartupData[]>(initialStartups);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPubStatus, setFilterPubStatus] = useState("all");
  const [filterStartupStatus, setFilterStartupStatus] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const initialForm = {
    name: "",
    slug: "",
    domain: categories[0]?.name || "Artificial Intelligence & ML",
    oneLineSummary: "",
    fullDescription: "",
    startupStatus: "Currently Working",
    publicationStatus: "Draft",
    isFeatured: false,
    founderPublicInfo: "",
    msmeStatus: "Unknown",
    msmeNumber: "",
    showMsmeNumber: false,
    dpiitStatus: "Unknown",
    dpiitNumber: "",
    showDpiitNumber: false,
    isEcellVerified: false,
    isMsmeVerified: false,
    isDpiitVerified: false,
    websiteUrl: "",
    linkedinUrl: "",
    twitterUrl: "",
    // Private Details
    founderEmails: "",
    founderPhones: "",
    internalNotes: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const filtered = startups.filter((s) => {
    if (filterPubStatus !== "all" && s.publicationStatus !== filterPubStatus) return false;
    if (filterStartupStatus !== "all" && s.startupStatus !== filterStartupStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!s.name.toLowerCase().includes(q) && !s.domain.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData(initialForm);
    setFormOpen(true);
  };

  const handleOpenEdit = (s: StartupData) => {
    setEditingId(s.id);
    setFormData({
      name: s.name,
      slug: s.slug,
      domain: s.domain,
      oneLineSummary: s.oneLineSummary,
      fullDescription: s.fullDescription,
      startupStatus: s.startupStatus,
      publicationStatus: s.publicationStatus,
      isFeatured: s.isFeatured,
      founderPublicInfo: s.founderPublicInfo,
      msmeStatus: s.msmeStatus,
      msmeNumber: s.msmeNumber || "",
      showMsmeNumber: s.showMsmeNumber,
      dpiitStatus: s.dpiitStatus,
      dpiitNumber: s.dpiitNumber || "",
      showDpiitNumber: s.showDpiitNumber,
      isEcellVerified: s.isEcellVerified,
      isMsmeVerified: s.isMsmeVerified,
      isDpiitVerified: s.isDpiitVerified,
      websiteUrl: s.websiteUrl || "",
      linkedinUrl: s.linkedinUrl || "",
      twitterUrl: s.twitterUrl || "",
      founderEmails: s.privateDetails?.founderEmails || "",
      founderPhones: s.privateDetails?.founderPhones || "",
      internalNotes: s.privateDetails?.internalNotes || "",
    });
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        // Update
        const res = await fetch(`/api/admin/startups/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (res.ok) {
          setStartups((prev) =>
            prev.map((s) => (s.id === editingId ? json.startup : s))
          );
          setFormOpen(false);
        } else {
          alert(json.error || "Update failed");
        }
      } else {
        // Create
        const res = await fetch("/api/admin/startups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (res.ok) {
          setStartups((prev) => [json.startup, ...prev]);
          setFormOpen(false);
        } else {
          alert(json.error || "Creation failed");
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (id: string) => {
    const res = await fetch(`/api/admin/startups/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "archive" }),
    });
    if (res.ok) {
      setStartups((prev) =>
        prev.map((s) => (s.id === id ? { ...s, publicationStatus: "Archived" } : s))
      );
    }
  };

  const handleRestore = async (id: string) => {
    const res = await fetch(`/api/admin/startups/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restore" }),
    });
    if (res.ok) {
      setStartups((prev) =>
        prev.map((s) => (s.id === id ? { ...s, publicationStatus: "Draft" } : s))
      );
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteModalId) return;
    if (deleteConfirmText !== "DELETE") {
      alert("You must type 'DELETE' exactly.");
      return;
    }
    const res = await fetch(`/api/admin/startups/${deleteModalId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmation: "DELETE" }),
    });
    if (res.ok) {
      setStartups((prev) => prev.filter((s) => s.id !== deleteModalId));
      setDeleteModalId(null);
      setDeleteConfirmText("");
    } else {
      const json = await res.json();
      alert(json.error || "Delete failed");
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= startups.length) return;

    const newStartups = [...startups];
    const current = newStartups[index];
    const swap = newStartups[targetIndex];

    const currentOrder = current.displayOrder;
    current.displayOrder = swap.displayOrder;
    swap.displayOrder = currentOrder;

    newStartups[index] = swap;
    newStartups[targetIndex] = current;
    setStartups(newStartups);

    // Save orders
    await Promise.all([
      fetch(`/api/admin/startups/${current.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayOrder: current.displayOrder }),
      }),
      fetch(`/api/admin/startups/${swap.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayOrder: swap.displayOrder }),
      }),
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Rocket className="w-6 h-6 text-cyan-500" />
            <span>Manage Startups</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create, edit, archive, and verify student & alumni startups
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Startup</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search startups by name or domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={filterPubStatus}
          onChange={(e) => setFilterPubStatus(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Publications</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
          <option value="Archived">Archived</option>
        </select>

        <select
          value={filterStartupStatus}
          onChange={(e) => setFilterStartupStatus(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Stages</option>
          <option value="Currently Working">Currently Working</option>
          <option value="Alumni / Scaled">Alumni / Scaled</option>
          <option value="Idea Stage">Idea Stage</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-lg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No startups found. Click "Add New Startup" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100/70 dark:bg-white/[0.02] border-b border-slate-200/80 dark:border-white/10 text-[11px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Startup</th>
                  <th className="py-3 px-4">Domain</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Publication</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filtered.map((s, index) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                    {/* Order up/down */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveOrder(index, "up")}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-20"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === filtered.length - 1}
                          onClick={() => handleMoveOrder(index, "down")}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-20"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        {s.isFeatured && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                        <div>
                          <span>{s.name}</span>
                          <span className="block text-[11px] text-slate-400 font-normal">
                            /{s.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
                        {s.domain}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-medium">{s.startupStatus}</td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          s.publicationStatus === "Published"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : s.publicationStatus === "Draft"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                        }`}
                      >
                        {s.publicationStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-[10px]">
                        {s.isEcellVerified && <span className="text-sky-500 font-bold">E-Cell</span>}
                        {s.isMsmeVerified && <span className="text-emerald-500 font-bold">• MSME</span>}
                        {s.isDpiitVerified && <span className="text-amber-500 font-bold">• DPIIT</span>}
                        {!s.isEcellVerified && !s.isMsmeVerified && !s.isDpiitVerified && (
                          <span className="text-slate-400">Unverified</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Preview button */}
                        <Link
                          href={`/startups/${s.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500"
                          title="Preview public profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300"
                          title="Edit Startup"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Archive or Restore */}
                        {s.publicationStatus !== "Archived" ? (
                          <button
                            type="button"
                            onClick={() => handleArchive(s.id)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-amber-50 dark:hover:bg-amber-500/10 text-amber-600"
                            title="Archive Startup"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRestore(s.id)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600"
                            title="Restore to Draft"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Permanent Delete for Super Admin */}
                        {isSuperAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteModalId(s.id);
                              setDeleteConfirmText("");
                            }}
                            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600"
                            title="Permanently Delete (Super Admin)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Form Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="relative w-full max-w-3xl bg-surface border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-foreground max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <h2 className="text-lg font-bold">
                {editingId ? "Edit Startup Profile" : "Create New Startup Profile"}
              </h2>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Row 1: Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                    Startup Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NeuroPulse Diagnostics"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({
                        ...formData,
                        name,
                        slug: editingId ? formData.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
                      });
                    }}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="neuropulse-diagnostics"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Row 2: Domain & Stages */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                    Domain *
                  </label>
                  <select
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                    Venture Stage *
                  </label>
                  <select
                    value={formData.startupStatus}
                    onChange={(e) => setFormData({ ...formData, startupStatus: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Currently Working">Currently Working</option>
                    <option value="Alumni / Scaled">Alumni / Scaled</option>
                    <option value="Idea Stage">Idea Stage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                    Publication Status *
                  </label>
                  <select
                    value={formData.publicationStatus}
                    onChange={(e) => setFormData({ ...formData, publicationStatus: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Featured checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured-toggle"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="featured-toggle" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Feature on Homepage
                </label>
              </div>

              {/* Public Founder Info */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                  Public Founder Info (Name & Dept/Batch ONLY) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe (CMPN / 2025), Jane Smith (IT / 2026)"
                  value={formData.founderPublicInfo}
                  onChange={(e) => setFormData({ ...formData, founderPublicInfo: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Summaries */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                  One-Line Summary *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Brief pitch for cards..."
                  value={formData.oneLineSummary}
                  onChange={(e) => setFormData({ ...formData, oneLineSummary: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                  Full Technology & Company Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Statutory Registrations */}
              <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 space-y-4">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Statutory Registrations (Independent sets)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* MSME */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      MSME / Udyam Status
                    </label>
                    <select
                      value={formData.msmeStatus}
                      onChange={(e) => setFormData({ ...formData, msmeStatus: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900"
                    >
                      <option value="Unknown">Unknown</option>
                      <option value="Not Registered">Not Registered</option>
                      <option value="Registration Pending">Registration Pending</option>
                      <option value="Registered">Registered</option>
                      <option value="Not Applicable">Not Applicable</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Udyam Number (Optional)"
                      value={formData.msmeNumber}
                      onChange={(e) => setFormData({ ...formData, msmeNumber: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
                    />

                    <label className="flex items-center gap-2 text-[11px] text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showMsmeNumber}
                        onChange={(e) => setFormData({ ...formData, showMsmeNumber: e.target.checked })}
                      />
                      <span>Show Udyam number publicly</span>
                    </label>
                  </div>

                  {/* DPIIT */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      Startup India / DPIIT Status
                    </label>
                    <select
                      value={formData.dpiitStatus}
                      onChange={(e) => setFormData({ ...formData, dpiitStatus: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900"
                    >
                      <option value="Unknown">Unknown</option>
                      <option value="Not Registered">Not Registered</option>
                      <option value="Registration Pending">Registration Pending</option>
                      <option value="Registered">Registered</option>
                      <option value="Not Applicable">Not Applicable</option>
                    </select>

                    <input
                      type="text"
                      placeholder="DPIIT Number (Optional)"
                      value={formData.dpiitNumber}
                      onChange={(e) => setFormData({ ...formData, dpiitNumber: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
                    />

                    <label className="flex items-center gap-2 text-[11px] text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showDpiitNumber}
                        onChange={(e) => setFormData({ ...formData, showDpiitNumber: e.target.checked })}
                      />
                      <span>Show DPIIT number publicly</span>
                    </label>
                  </div>
                </div>

                {/* Verification badges */}
                <div className="pt-2 border-t border-slate-200/40 dark:border-white/5 flex flex-wrap gap-4 text-xs font-semibold">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isEcellVerified}
                      onChange={(e) => setFormData({ ...formData, isEcellVerified: e.target.checked })}
                    />
                    <span>E-Cell Profile Verified</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isMsmeVerified}
                      onChange={(e) => setFormData({ ...formData, isMsmeVerified: e.target.checked })}
                    />
                    <span>MSME Verified</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDpiitVerified}
                      onChange={(e) => setFormData({ ...formData, isDpiitVerified: e.target.checked })}
                    />
                    <span>DPIIT Verified</span>
                  </label>
                </div>
              </div>

              {/* Private Information Section */}
              <div className="p-4 rounded-2xl bg-rose-500/[0.04] border border-rose-500/20 space-y-3">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confidential Founder Contacts (Stored in Private Table)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Founder Email Addresses (Private)
                    </label>
                    <input
                      type="text"
                      placeholder="founder1@example.com, founder2@example.com"
                      value={formData.founderEmails}
                      onChange={(e) => setFormData({ ...formData, founderEmails: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Founder Phone Numbers (Private)
                    </label>
                    <input
                      type="text"
                      placeholder="+91 98XXX XXXXX"
                      value={formData.founderPhones}
                      onChange={(e) => setFormData({ ...formData, founderPhones: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Internal Committee Notes & Feedback (Private)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.internalNotes}
                    onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                    placeholder="Private notes visible only to E-Cell administrators..."
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 resize-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Create Startup"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permanent Delete Modal for Super Admin */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-surface border border-rose-500/30 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-4 text-foreground">
            <h3 className="text-base font-bold text-rose-600">
              Confirm Permanent Deletion
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This action cannot be undone. To prevent accidental data loss, please type <strong className="text-slate-900 dark:text-white">DELETE</strong> to confirm permanent deletion of this startup and its private records.
            </p>

            <input
              type="text"
              placeholder="Type DELETE to confirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-rose-300 dark:border-rose-900/50 bg-slate-50 dark:bg-white/5 font-mono focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== "DELETE"}
                onClick={handlePermanentDelete}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-30"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
