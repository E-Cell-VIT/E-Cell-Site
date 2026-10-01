"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Coins,
  Plus,
  Search,
  Eye,
  Edit3,
  Archive,
  RotateCcw,
  Trash2,
  X,
  ExternalLink,
  Calendar,
  AlertTriangle,
  CheckSquare,
} from "lucide-react";

interface ChecklistItem {
  id?: string;
  itemText: string;
  category?: string;
  displayOrder?: number;
}

interface GrantItem {
  id: string;
  schemeName: string;
  slug: string;
  agency: string;
  sector: string;
  stage: string;
  fundingRange: string;
  eligibility: string;
  applicationWindow: string;
  officialSourceUrl: string;
  sourceTitle: string;
  deadlineType: string;
  deadlineAt: string | Date | null;
  lastVerifiedAt: string | Date;
  verifiedBy: string;
  publicationStatus: string;
  displayOrder: number;
  checklistItems?: ChecklistItem[];
}

interface GrantsAdminClientProps {
  initialGrants: GrantItem[];
  sectors: Array<{ id: string; name: string }>;
  isSuperAdmin: boolean;
}

export function GrantsAdminClient({
  initialGrants,
  sectors,
  isSuperAdmin,
}: GrantsAdminClientProps) {
  const [grants, setGrants] = useState<GrantItem[]>(initialGrants);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPub, setFilterPub] = useState("all");
  const [filterSector, setFilterSector] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialForm = {
    schemeName: "",
    slug: "",
    agency: "",
    sector: sectors[0]?.name || "All Sectors",
    stage: "Ideation to Prototype",
    fundingRange: "Up to ₹10 Lakhs",
    eligibility: "DPIIT recognised startups or student innovators",
    applicationWindow: "Rolling / Continuous",
    officialSourceUrl: "",
    sourceTitle: "Official Portal",
    deadlineType: "rolling",
    deadlineAt: "",
    publicationStatus: "Draft",
    displayOrder: 0,
    checklistItems: [
      { itemText: "College Enrollment / Bonafide Certificate", category: "Eligibility" },
      { itemText: "Detailed Project Report (DPR) / Pitch Deck", category: "Documents" },
      { itemText: "Bank Account Details (PFMS compatible)", category: "Financial" },
    ] as ChecklistItem[],
  };

  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GrantItem | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const filteredGrants = grants.filter((g) => {
    if (filterPub !== "all" && g.publicationStatus !== filterPub) return false;
    if (filterSector !== "all" && g.sector !== filterSector) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = g.schemeName.toLowerCase().includes(q);
      const matchAgency = g.agency.toLowerCase().includes(q);
      if (!matchName && !matchAgency) return false;
    }
    return true;
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(initialForm);
    setErrorMsg("");
    setFormOpen(true);
  };

  const handleOpenEdit = (g: GrantItem) => {
    setEditingId(g.id);
    let deadlineStr = "";
    if (g.deadlineAt) {
      const d = new Date(g.deadlineAt);
      deadlineStr = d.toISOString().slice(0, 16);
    }
    setFormData({
      schemeName: g.schemeName,
      slug: g.slug,
      agency: g.agency,
      sector: g.sector,
      stage: g.stage,
      fundingRange: g.fundingRange,
      eligibility: g.eligibility,
      applicationWindow: g.applicationWindow,
      officialSourceUrl: g.officialSourceUrl,
      sourceTitle: g.sourceTitle,
      deadlineType: g.deadlineType,
      deadlineAt: deadlineStr,
      publicationStatus: g.publicationStatus,
      displayOrder: g.displayOrder,
      checklistItems: g.checklistItems && g.checklistItems.length > 0 ? g.checklistItems : initialForm.checklistItems,
    });
    setErrorMsg("");
    setFormOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!editingId) {
      const slugVal = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({ ...prev, schemeName: val, slug: slugVal }));
    } else {
      setFormData((prev) => ({ ...prev, schemeName: val }));
    }
  };

  const addChecklistItem = () => {
    setFormData((prev) => ({
      ...prev,
      checklistItems: [
        ...prev.checklistItems,
        { itemText: "", category: "Documents", displayOrder: prev.checklistItems.length },
      ],
    }));
  };

  const removeChecklistItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      checklistItems: prev.checklistItems.filter((_, idx) => idx !== index),
    }));
  };

  const updateChecklistItem = (index: number, text: string, category?: string) => {
    setFormData((prev) => {
      const updated = [...prev.checklistItems];
      updated[index] = {
        ...updated[index],
        itemText: text,
        category: category || updated[index].category,
      };
      return { ...prev, checklistItems: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const url = editingId ? `/api/admin/grants/${editingId}` : "/api/admin/grants";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save grant");

      if (editingId) {
        setGrants((prev) => prev.map((g) => (g.id === editingId ? data.grant : g)));
      } else {
        setGrants((prev) => [data.grant, ...prev]);
      }

      setFormOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit grant");
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (g: GrantItem) => {
    if (!confirm(`Are you sure you want to archive "${g.schemeName}"?`)) return;
    try {
      const res = await fetch(`/api/admin/grants/${g.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "archive" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to archive");
      setGrants((prev) => prev.map((item) => (item.id === g.id ? data.grant : item)));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRestore = async (g: GrantItem) => {
    try {
      const res = await fetch(`/api/admin/grants/${g.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to restore");
      setGrants((prev) => prev.map((item) => (item.id === g.id ? data.grant : item)));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteTarget) return;
    if (deleteConfirmText !== "DELETE") {
      alert("Type DELETE to confirm");
      return;
    }

    try {
      const res = await fetch(`/api/admin/grants/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: deleteConfirmText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      setGrants((prev) => prev.filter((g) => g.id !== deleteTarget.id));
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      setDeleteConfirmText("");
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
            <Coins className="w-6 h-6 text-brand-gold" />
            Funding & Grants Directory
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Maintain verified government and institutional grant schemes with eligibility and checklists.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-navy hover:bg-brand-navy/80 text-white rounded-lg font-medium text-sm transition-all border border-brand-gold/30 shadow-lg shadow-black/20"
        >
          <Plus className="w-4 h-4 text-brand-gold" />
          Add Grant Scheme
        </button>
      </div>

      {/* Filter Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
          <input
            type="text"
            placeholder="Search scheme name or agency..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-brand-teal"
          />
        </div>

        <div>
          <select
            value={filterSector}
            onChange={(e) => setFilterSector(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-brand-teal"
          >
            <option value="all">All Sectors</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterPub}
            onChange={(e) => setFilterPub(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-brand-teal"
          >
            <option value="all">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-neutral-900/40 rounded-xl border border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-neutral-950/80 text-xs uppercase text-neutral-400 border-b border-neutral-800 font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-3">Scheme & Agency</th>
                <th className="px-4 py-3">Sector</th>
                <th className="px-4 py-3">Funding Range</th>
                <th className="px-4 py-3">Deadline Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              {filteredGrants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-500 font-sans">
                    No grant schemes found matching filters.
                  </td>
                </tr>
              ) : (
                filteredGrants.map((g) => (
                  <tr key={g.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-sans font-medium text-white">{g.schemeName}</div>
                      <div className="text-xs text-neutral-400 font-sans">{g.agency}</div>
                    </td>
                    <td className="px-4 py-3 font-sans text-xs text-neutral-300">
                      <span className="bg-neutral-800 px-2 py-0.5 rounded text-neutral-300">
                        {g.sector}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans text-xs text-brand-gold font-medium">
                      {g.fundingRange}
                    </td>
                    <td className="px-4 py-3 font-sans text-xs">
                      <span className="capitalize text-neutral-400">
                        {g.deadlineType.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-sans font-medium ${
                          g.publicationStatus === "Published"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : g.publicationStatus === "Draft"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                        }`}
                      >
                        {g.publicationStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-sans">
                        <a
                          href={g.officialSourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="Visit Official Source"
                          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleOpenEdit(g)}
                          title="Edit Grant"
                          className="p-1.5 text-neutral-400 hover:text-brand-teal hover:bg-neutral-800 rounded transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {g.publicationStatus !== "Archived" ? (
                          <button
                            onClick={() => handleArchive(g)}
                            title="Archive"
                            className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded transition-colors"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestore(g)}
                            title="Restore"
                            className="p-1.5 text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800 rounded transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        {isSuperAdmin && (
                          <button
                            onClick={() => {
                              setDeleteTarget(g);
                              setDeleteConfirmText("");
                              setDeleteModalOpen(true);
                            }}
                            title="Permanent Delete"
                            className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl my-8 p-6 shadow-2xl relative">
            <button
              onClick={() => setFormOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Coins className="w-5 h-5 text-brand-gold" />
              {editingId ? "Edit Grant Scheme" : "Add Grant Scheme"}
            </h2>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Scheme Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.schemeName}
                    onChange={handleNameChange}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                    placeholder="e.g. NIDHI-PRAYAS"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-teal"
                    placeholder="nidhi-prayas"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Agency / Department *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.agency}
                    onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                    placeholder="e.g. DST / NSTEDB"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Sector *
                  </label>
                  <select
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                  >
                    {sectors.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Stage
                  </label>
                  <input
                    type="text"
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                    placeholder="e.g. Idea to Prototype"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Funding Range *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fundingRange}
                    onChange={(e) => setFormData({ ...formData, fundingRange: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                    placeholder="e.g. Up to ₹10 Lakhs (Grant-in-aid)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Application Window
                  </label>
                  <input
                    type="text"
                    value={formData.applicationWindow}
                    onChange={(e) => setFormData({ ...formData, applicationWindow: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                    placeholder="e.g. Open round the year / Annual Call"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Eligibility Criteria *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.eligibility}
                  onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                  placeholder="Indian citizens with innovative technology idea, students or early stage startups..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Official Portal URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.officialSourceUrl}
                    onChange={(e) => setFormData({ ...formData, officialSourceUrl: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                    placeholder="https://nidhi-prayas.org"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Source Portal Title
                  </label>
                  <input
                    type="text"
                    value={formData.sourceTitle}
                    onChange={(e) => setFormData({ ...formData, sourceTitle: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                    placeholder="e.g. Official DST NIDHI Portal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Deadline Type
                  </label>
                  <select
                    value={formData.deadlineType}
                    onChange={(e) => setFormData({ ...formData, deadlineType: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                  >
                    <option value="rolling">Rolling (Continuous)</option>
                    <option value="fixed_date">Fixed Date</option>
                    <option value="fixed_datetime">Fixed Date & Time</option>
                    <option value="until_funds_last">Until Funds Last</option>
                    <option value="not_specified">Not Specified</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Deadline (IST)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.deadlineAt}
                    onChange={(e) => setFormData({ ...formData, deadlineAt: e.target.value })}
                    disabled={formData.deadlineType === "rolling" || formData.deadlineType === "until_funds_last" || formData.deadlineType === "not_specified"}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal disabled:opacity-30"
                  />
                </div>
              </div>

              {/* Checklist Items Builder */}
              <div className="border border-neutral-800 rounded-xl p-4 bg-neutral-950/40">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-brand-gold" />
                    Document Checklist for Applicants
                  </span>
                  <button
                    type="button"
                    onClick={addChecklistItem}
                    className="text-xs text-brand-teal hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Requirement
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.checklistItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <select
                        value={item.category || "Documents"}
                        onChange={(e) => updateChecklistItem(idx, item.itemText, e.target.value)}
                        className="bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 rounded px-2 py-1.5 focus:outline-none"
                      >
                        <option value="Eligibility">Eligibility</option>
                        <option value="Documents">Documents</option>
                        <option value="Financial">Financial</option>
                        <option value="Technical">Technical</option>
                      </select>
                      <input
                        type="text"
                        value={item.itemText}
                        onChange={(e) => updateChecklistItem(idx, e.target.value)}
                        placeholder="e.g. Bonafide Certificate / PAN Card"
                        className="flex-1 bg-neutral-900 border border-neutral-800 text-xs text-white rounded px-2.5 py-1.5 focus:outline-none focus:border-brand-teal"
                      />
                      <button
                        type="button"
                        onClick={() => removeChecklistItem(idx)}
                        className="text-neutral-500 hover:text-rose-400 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Publication Status
                  </label>
                  <select
                    value={formData.publicationStatus}
                    onChange={(e) => setFormData({ ...formData, publicationStatus: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-brand-navy hover:bg-brand-navy/80 text-white text-sm rounded-lg font-medium transition-colors border border-brand-gold/40 disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingId ? "Save Changes" : "Create Scheme"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-rose-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-rose-400 mb-2 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-500" />
              Permanent Deletion (Super Admin)
            </h3>
            <p className="text-sm text-neutral-300 mb-4">
              Permanently delete scheme <strong className="text-white">"{deleteTarget.schemeName}"</strong>? This will also remove all associated checklist items.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full bg-neutral-950 border border-rose-500/40 rounded-lg px-3 py-2 text-sm text-rose-200 font-mono mb-4 focus:outline-none focus:border-rose-500"
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== "DELETE"}
                onClick={handlePermanentDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-lg disabled:opacity-40 transition-colors"
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
