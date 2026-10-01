"use client";

import React, { useState } from "react";
import {
  FolderTree,
  Plus,
  Edit3,
  Trash2,
  X,
  Archive,
  RotateCcw,
  Layers,
  Calendar,
  Coins,
} from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  type: string;
  isArchived: boolean;
  displayOrder: number;
}

interface CategoriesAdminClientProps {
  initialCategories: CategoryItem[];
  isSuperAdmin: boolean;
}

const CATEGORY_TABS = [
  { key: "startup_domain", label: "Startup Domains", icon: Layers },
  { key: "event_category", label: "Event Categories", icon: Calendar },
  { key: "grant_sector", label: "Grant Sectors", icon: Coins },
];

export function CategoriesAdminClient({
  initialCategories,
  isSuperAdmin,
}: CategoriesAdminClientProps) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [activeTab, setActiveTab] = useState<string>("startup_domain");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialForm = {
    name: "",
    slug: "",
    type: "startup_domain",
    isArchived: false,
    displayOrder: 0,
  };

  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const filteredCategories = categories.filter((c) => c.type === activeTab);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ ...initialForm, type: activeTab });
    setErrorMsg("");
    setFormOpen(true);
  };

  const handleOpenEdit = (c: CategoryItem) => {
    setEditingId(c.id);
    setFormData({
      name: c.name,
      slug: c.slug,
      type: c.type,
      isArchived: c.isArchived,
      displayOrder: c.displayOrder,
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
      setFormData((prev) => ({ ...prev, name: val, slug: slugVal }));
    } else {
      setFormData((prev) => ({ ...prev, name: val }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const url = editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save category");

      if (editingId) {
        setCategories((prev) => prev.map((c) => (c.id === editingId ? data.category : c)));
      } else {
        setCategories((prev) => [...prev, data.category]);
      }

      setFormOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit category");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleArchive = async (c: CategoryItem) => {
    try {
      const res = await fetch(`/api/admin/categories/${c.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: !c.isArchived }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update category");

      setCategories((prev) => prev.map((item) => (item.id === c.id ? data.category : item)));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (c: CategoryItem) => {
    if (!confirm(`Are you sure you want to permanently remove category "${c.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories/${c.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      setCategories((prev) => prev.filter((item) => item.id !== c.id));
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
            <FolderTree className="w-6 h-6 text-brand-teal" />
            Taxonomy & Categories
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Organize startup industries, event formats, and grant funding sectors.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-navy hover:bg-brand-navy/80 text-white rounded-lg font-medium text-sm transition-all border border-brand-teal/30 shadow-lg shadow-black/20"
        >
          <Plus className="w-4 h-4 text-brand-teal" />
          Add Category
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800 gap-2">
        {CATEGORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? "border-brand-teal text-white bg-neutral-900/40"
                  : "border-transparent text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className="text-xs bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded-full">
                {categories.filter((c) => c.type === tab.key).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-neutral-900/40 rounded-xl border border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-neutral-950/80 text-xs uppercase text-neutral-400 border-b border-neutral-800 font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-3">Category Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Display Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-500 font-sans">
                    No categories in this group yet. Click "Add Category" to create one.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="px-4 py-3 font-sans font-medium text-white">
                      {c.name}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-400">
                      {c.slug}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-300">
                      {c.displayOrder}
                    </td>
                    <td className="px-4 py-3 font-sans">
                      {c.isArchived ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
                          Archived
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-sans">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          title="Edit Category"
                          className="p-1.5 text-neutral-400 hover:text-brand-teal hover:bg-neutral-800 rounded transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleArchive(c)}
                          title={c.isArchived ? "Restore to Active" : "Archive"}
                          className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded transition-colors"
                        >
                          {c.isArchived ? (
                            <RotateCcw className="w-4 h-4" />
                          ) : (
                            <Archive className="w-4 h-4" />
                          )}
                        </button>
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleDelete(c)}
                            title="Delete Category"
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

      {/* Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setFormOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-brand-teal" />
              {editingId ? "Edit Category" : "Add Category"}
            </h2>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                  placeholder="e.g. EdTech / Artificial Intelligence"
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
                  placeholder="edtech"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Category Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-teal"
                >
                  <option value="startup_domain">Startup Domain</option>
                  <option value="event_category">Event Category</option>
                  <option value="grant_sector">Grant Sector</option>
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

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isArchived"
                  checked={formData.isArchived}
                  onChange={(e) => setFormData({ ...formData, isArchived: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-teal border-neutral-800 bg-neutral-950 focus:ring-brand-teal"
                />
                <label htmlFor="isArchived" className="text-xs text-neutral-300 font-medium cursor-pointer">
                  Archive this category (hide from public dropdowns)
                </label>
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
                  {loading ? "Saving..." : editingId ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
