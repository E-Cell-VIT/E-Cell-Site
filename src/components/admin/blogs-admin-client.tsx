"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  Eye,
  Edit3,
  Archive,
  RotateCcw,
  Trash2,
  X,
  Star,
  Clock,
  Tag,
  Upload,
} from "lucide-react";

interface BlogItem {
  id: string;
  title: string;
  slug: string;
  coverImageUrl: string | null;
  excerpt: string;
  content: string;
  authorName: string;
  authorRole: string | null;
  authorBio: string | null;
  tags: string;
  readTimeMinutes: number;
  publicationStatus: string;
  isFeatured: boolean;
  publishedAt: string | Date | null;
  createdAt: string | Date;
}

interface BlogsAdminClientProps {
  initialBlogs: BlogItem[];
  isSuperAdmin: boolean;
}

export function BlogsAdminClient({ initialBlogs, isSuperAdmin }: BlogsAdminClientProps) {
  const [blogs, setBlogs] = useState<BlogItem[]>(initialBlogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPub, setFilterPub] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialForm = {
    title: "",
    slug: "",
    coverImageUrl: "",
    excerpt: "",
    content: "",
    authorName: "",
    authorRole: "",
    authorBio: "",
    tags: "Entrepreneurship, Innovation",
    readTimeMinutes: 3,
    publicationStatus: "Draft",
    isFeatured: false,
  };

  const [formData, setFormData] = useState(initialForm);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Permanent Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BlogItem | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const filteredBlogs = blogs.filter((b) => {
    if (filterPub !== "all" && b.publicationStatus !== filterPub) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = b.title.toLowerCase().includes(q);
      const matchAuthor = b.authorName.toLowerCase().includes(q);
      const matchTags = b.tags.toLowerCase().includes(q);
      if (!matchTitle && !matchAuthor && !matchTags) return false;
    }
    return true;
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(initialForm);
    setErrorMsg("");
    setFormOpen(true);
  };

  const handleOpenEdit = (b: BlogItem) => {
    setEditingId(b.id);
    setFormData({
      title: b.title,
      slug: b.slug,
      coverImageUrl: b.coverImageUrl || "",
      excerpt: b.excerpt,
      content: b.content,
      authorName: b.authorName,
      authorRole: b.authorRole || "",
      authorBio: b.authorBio || "",
      tags: b.tags,
      readTimeMinutes: b.readTimeMinutes,
      publicationStatus: b.publicationStatus,
      isFeatured: b.isFeatured,
    });
    setErrorMsg("");
    setFormOpen(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!editingId) {
      const slugVal = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({ ...prev, title: val, slug: slugVal }));
    } else {
      setFormData((prev) => ({ ...prev, title: val }));
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const readTime = Math.max(1, Math.ceil(words / 200));
    setFormData((prev) => ({
      ...prev,
      content: text,
      readTimeMinutes: readTime,
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("subfolder", "blogs");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setFormData((prev) => ({ ...prev, coverImageUrl: data.url }));
    } catch (err: any) {
      alert("Error uploading cover image: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const url = editingId ? `/api/admin/blogs/${editingId}` : "/api/admin/blogs";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save blog");

      if (editingId) {
        setBlogs((prev) => prev.map((b) => (b.id === editingId ? data.blog : b)));
      } else {
        setBlogs((prev) => [data.blog, ...prev]);
      }

      setFormOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit blog");
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (b: BlogItem) => {
    if (!confirm(`Are you sure you want to archive "${b.title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/blogs/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "archive" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to archive");
      setBlogs((prev) => prev.map((item) => (item.id === b.id ? data.blog : item)));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRestore = async (b: BlogItem) => {
    try {
      const res = await fetch(`/api/admin/blogs/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to restore");
      setBlogs((prev) => prev.map((item) => (item.id === b.id ? data.blog : item)));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteTarget) return;
    if (deleteConfirmText !== "DELETE") {
      alert("You must type DELETE exactly to confirm.");
      return;
    }

    try {
      const res = await fetch(`/api/admin/blogs/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: deleteConfirmText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      setBlogs((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      setDeleteConfirmText("");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-brand-teal" />
            Articles & Insights
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Publish educational content, founder spotlight stories, and startup guides.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-navy hover:bg-brand-navy/80 text-white rounded-lg font-medium text-sm transition-all border border-brand-teal/30 shadow-lg shadow-black/20"
        >
          <Plus className="w-4 h-4 text-brand-teal" />
          Write Article
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by title, author, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-brand-teal"
          />
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

        <div className="flex items-center text-xs text-neutral-400 px-2">
          <span>
            Showing <strong className="text-white">{filteredBlogs.length}</strong> of {blogs.length} articles
          </span>
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-neutral-900/40 rounded-xl border border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-neutral-950/80 text-xs uppercase text-neutral-400 border-b border-neutral-800 font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-3">Article</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Read Time</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              {filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                    No articles found matching filters.
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-sans font-medium text-white flex items-center gap-2">
                        {b.title}
                        {b.isFeatured && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">
                            <Star className="w-2.5 h-2.5 fill-current" /> Featured
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-500 font-mono truncate max-w-sm">
                        /blogs/{b.slug}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <div className="text-white text-xs">{b.authorName}</div>
                      {b.authorRole && <div className="text-[11px] text-neutral-400">{b.authorRole}</div>}
                    </td>
                    <td className="px-4 py-3 font-sans text-xs text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-neutral-500" />
                        {b.readTimeMinutes} min
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {b.tags.split(",").slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-sans font-medium ${
                          b.publicationStatus === "Published"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : b.publicationStatus === "Draft"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                        }`}
                      >
                        {b.publicationStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-sans">
                        {b.publicationStatus === "Published" && (
                          <Link
                            href={`/blogs/${b.slug}`}
                            target="_blank"
                            title="View Public Page"
                            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}
                        <button
                          onClick={() => handleOpenEdit(b)}
                          title="Edit Article"
                          className="p-1.5 text-neutral-400 hover:text-brand-teal hover:bg-neutral-800 rounded transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {b.publicationStatus !== "Archived" ? (
                          <button
                            onClick={() => handleArchive(b)}
                            title="Archive"
                            className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded transition-colors"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestore(b)}
                            title="Restore to Draft"
                            className="p-1.5 text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800 rounded transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        {isSuperAdmin && (
                          <button
                            onClick={() => {
                              setDeleteTarget(b);
                              setDeleteConfirmText("");
                              setDeleteModalOpen(true);
                            }}
                            title="Permanent Delete (Super Admin)"
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
              <FileText className="w-5 h-5 text-brand-teal" />
              {editingId ? "Edit Article" : "Create New Article"}
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
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleTitleChange}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                    placeholder="e.g. Navigating Startup Grants in 2026"
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
                    placeholder="navigating-startup-grants-2026"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Cover Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.coverImageUrl}
                    onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
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

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Excerpt / Short Summary *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                  placeholder="A concise 1-2 sentence overview shown in blog previews..."
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-neutral-300">
                    Content (Markdown / Text) *
                  </label>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Estimated Read Time: {formData.readTimeMinutes} min
                  </span>
                </div>
                <textarea
                  required
                  rows={10}
                  value={formData.content}
                  onChange={handleContentChange}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm text-white font-mono focus:outline-none focus:border-brand-teal leading-relaxed"
                  placeholder="## Introduction&#10;&#10;Write the full article content here with markdown headings, lists, and quotes..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Author Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Author Role / Dept
                  </label>
                  <input
                    type="text"
                    value={formData.authorRole}
                    onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                    placeholder="e.g. Lead, Technical Cell"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                    placeholder="Funding, Guide, Incubation"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Publication Status
                  </label>
                  <select
                    value={formData.publicationStatus}
                    onChange={(e) => setFormData({ ...formData, publicationStatus: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                  >
                    <option value="Draft">Draft (Internal Only)</option>
                    <option value="Published">Published (Public)</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-teal border-neutral-800 bg-neutral-950 focus:ring-brand-teal"
                  />
                  <label htmlFor="isFeatured" className="text-xs text-neutral-300 font-medium cursor-pointer">
                    Feature on Home Page Carousel
                  </label>
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
                  {loading ? "Saving..." : editingId ? "Save Changes" : "Create Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Super Admin Permanent Delete Modal */}
      {deleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-rose-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-rose-400 mb-2 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-500" />
              Permanent Deletion (Super Admin)
            </h3>
            <p className="text-sm text-neutral-300 mb-4">
              You are about to permanently delete{" "}
              <strong className="text-white">"{deleteTarget.title}"</strong>. This action cannot be
              undone and will be permanently recorded in the audit log.
            </p>
            <p className="text-xs text-neutral-400 mb-2">
              Type <strong className="text-rose-400">DELETE</strong> to confirm:
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
