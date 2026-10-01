"use client";

import React, { useState } from "react";
import {
  Users,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Upload,
  RefreshCw,
  ExternalLink,
  GraduationCap,
  Briefcase,
  Award,
} from "lucide-react";
import { LinkedInIcon } from "@/components/icons/social-icons";

interface TeamMemberItem {
  id: string;
  name: string;
  photoUrl: string | null;
  designation: string;
  organisation: string | null;
  linkedinUrl: string | null;
  category: string;
  academicYear: string;
  isCurrent: boolean;
  publicationStatus: string;
  displayOrder: number;
}

interface TeamAdminClientProps {
  initialMembers: TeamMemberItem[];
  isSuperAdmin: boolean;
}

const CATEGORIES = [
  "Faculty Advisor",
  "Industry Mentor",
  "Student Head",
  "Core Team",
];

export function TeamAdminClient({ initialMembers, isSuperAdmin }: TeamAdminClientProps) {
  const [members, setMembers] = useState<TeamMemberItem[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterYear, setFilterYear] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialForm = {
    name: "",
    photoUrl: "",
    designation: "",
    organisation: "",
    linkedinUrl: "",
    category: "Student Head",
    academicYear: "2026-27",
    isCurrent: true,
    publicationStatus: "Published",
    displayOrder: 0,
  };

  const [formData, setFormData] = useState(initialForm);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Rollover Modal
  const [rolloverModalOpen, setRolloverModalOpen] = useState(false);
  const [newYearInput, setNewYearInput] = useState("2027-28");
  const [rolloverLoading, setRolloverLoading] = useState(false);

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState<TeamMemberItem | null>(null);

  // Extract distinct academic years
  const academicYears = Array.from(new Set(members.map((m) => m.academicYear))).sort().reverse();

  const filteredMembers = members.filter((m) => {
    if (filterCategory !== "all" && m.category !== filterCategory) return false;
    if (filterYear !== "all" && m.academicYear !== filterYear) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.name.toLowerCase().includes(q);
      const matchDesig = m.designation.toLowerCase().includes(q);
      const matchOrg = (m.organisation || "").toLowerCase().includes(q);
      if (!matchName && !matchDesig && !matchOrg) return false;
    }
    return true;
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(initialForm);
    setErrorMsg("");
    setFormOpen(true);
  };

  const handleOpenEdit = (m: TeamMemberItem) => {
    setEditingId(m.id);
    setFormData({
      name: m.name,
      photoUrl: m.photoUrl || "",
      designation: m.designation,
      organisation: m.organisation || "",
      linkedinUrl: m.linkedinUrl || "",
      category: m.category,
      academicYear: m.academicYear,
      isCurrent: m.isCurrent,
      publicationStatus: m.publicationStatus,
      displayOrder: m.displayOrder,
    });
    setErrorMsg("");
    setFormOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("subfolder", "team");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setFormData((prev) => ({ ...prev, photoUrl: data.url }));
    } catch (err: any) {
      alert("Error uploading image: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const url = editingId ? `/api/admin/team/${editingId}` : "/api/admin/team";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save team member");

      if (editingId) {
        setMembers((prev) => prev.map((m) => (m.id === editingId ? data.member : m)));
      } else {
        setMembers((prev) => [...prev, data.member]);
      }

      setFormOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit team member");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const res = await fetch(`/api/admin/team/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      setMembers((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRollover = async () => {
    setRolloverLoading(true);
    try {
      const res = await fetch("/api/admin/team/rollover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newAcademicYear: newYearInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rollover failed");

      alert(`Rollover completed! ${data.count} members moved to alumni cohort.`);
      // Update local state: mark all student heads and core team as isCurrent = false
      setMembers((prev) =>
        prev.map((m) =>
          m.category === "Student Head" || m.category === "Core Team"
            ? { ...m, isCurrent: false }
            : m
        )
      );
      setRolloverModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRolloverLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-teal" />
            Team & Leadership Directory
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Manage Faculty Advisors, Mentors, Student Heads, and Core Team members.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRolloverModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg font-medium text-xs transition-colors border border-neutral-700"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            Start New Academic Year
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-navy hover:bg-brand-navy/80 text-white rounded-lg font-medium text-sm transition-all border border-brand-teal/30 shadow-lg shadow-black/20"
          >
            <Plus className="w-4 h-4 text-brand-teal" />
            Add Member
          </button>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by name, role, organisation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-brand-teal"
          />
        </div>

        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-brand-teal"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-brand-teal"
          >
            <option value="all">All Academic Years</option>
            {academicYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-neutral-900/40 rounded-xl border border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-neutral-950/80 text-xs uppercase text-neutral-400 border-b border-neutral-800 font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Designation / Org</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Academic Year</th>
                <th className="px-4 py-3">Cohort Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-500 font-sans">
                    No team members found matching filters.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {m.photoUrl ? (
                          <img
                            src={m.photoUrl}
                            alt={m.name}
                            className="w-8 h-8 rounded-full object-cover border border-neutral-700"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-semibold text-brand-teal border border-neutral-700 font-sans">
                            {m.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-sans font-medium text-white flex items-center gap-1.5">
                            {m.name}
                            {m.linkedinUrl && (
                              <a
                                href={m.linkedinUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-neutral-400 hover:text-brand-teal"
                              >
                                <LinkedInIcon className="w-3.5 h-3.5 inline" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <div className="text-white text-xs">{m.designation}</div>
                      {m.organisation && (
                        <div className="text-[11px] text-neutral-400">{m.organisation}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-sans text-xs">
                      <span className="bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded">
                        {m.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-400 font-mono">
                      {m.academicYear}
                    </td>
                    <td className="px-4 py-3 font-sans">
                      {m.isCurrent ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                          Active Council
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
                          Past Council
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-sans">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          title="Edit Member"
                          className="p-1.5 text-neutral-400 hover:text-brand-teal hover:bg-neutral-800 rounded transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(m)}
                          title="Delete Member"
                          className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl my-8 p-6 shadow-2xl relative">
            <button
              onClick={() => setFormOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-teal" />
              {editingId ? "Edit Team Member" : "Add Team Member"}
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
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                    placeholder="e.g. Dr. Rajesh Kumar"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Designation / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                    placeholder="e.g. Faculty In-Charge / President"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Organisation / Dept
                  </label>
                  <input
                    type="text"
                    value={formData.organisation}
                    onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                    placeholder="e.g. Dept of Computer Engineering"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Photo URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                    placeholder="https://... or upload local image"
                  />
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    {uploading ? "Uploading..." : "Upload"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Academic Year *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-teal"
                    placeholder="2026-27"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isCurrent"
                    checked={formData.isCurrent}
                    onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-teal border-neutral-800 bg-neutral-950 focus:ring-brand-teal"
                  />
                  <label htmlFor="isCurrent" className="text-xs text-neutral-300 font-medium cursor-pointer">
                    Current Active Cohort
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Publication Status
                  </label>
                  <select
                    value={formData.publicationStatus}
                    onChange={(e) => setFormData({ ...formData, publicationStatus: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
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
                  className="px-5 py-2 bg-brand-navy hover:bg-brand-navy/80 text-white text-sm rounded-lg font-medium transition-colors border border-brand-teal/40 disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingId ? "Save Changes" : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rollover Academic Year Modal */}
      {rolloverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-amber-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-amber-400 mb-2 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-400" />
              Start New Academic Year
            </h3>
            <p className="text-sm text-neutral-300 mb-4">
              This action will mark all current Student Heads and Core Team members as past council
              (<code>isCurrent = false</code>), preserving them in the public historical team archive.
            </p>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              New Academic Year Label:
            </label>
            <input
              type="text"
              value={newYearInput}
              onChange={(e) => setNewYearInput(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white font-mono mb-4 focus:outline-none focus:border-brand-teal"
              placeholder="e.g. 2027-28"
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRolloverModalOpen(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={rolloverLoading}
                onClick={handleRollover}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-semibold text-sm rounded-lg disabled:opacity-40 transition-colors"
              >
                {rolloverLoading ? "Processing..." : "Confirm Rollover"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Member Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-500" />
              Delete Member?
            </h3>
            <p className="text-sm text-neutral-300 mb-4">
              Are you sure you want to remove <strong className="text-white">{deleteTarget.name}</strong> from the team list?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
