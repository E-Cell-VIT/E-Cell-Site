"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Plus,
  Search,
  Eye,
  Edit3,
  Archive,
  RotateCcw,
  Trash2,
  X,
  Star,
  MapPin,
  Trophy,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface EventItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  eventDate: string | Date;
  venue: string;
  eventStatus: string;
  publicationStatus: string;
  isFeatured: boolean;
  displayOrder: number;
  description: string;
  registrationUrl: string | null;
  reportPdfUrl: string | null;
}

interface EventsAdminClientProps {
  initialEvents: EventItem[];
  categories: Array<{ id: string; name: string }>;
  isSuperAdmin: boolean;
}

export function EventsAdminClient({
  initialEvents,
  categories,
  isSuperAdmin,
}: EventsAdminClientProps) {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPub, setFilterPub] = useState("all");
  const [filterTimeline, setFilterTimeline] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialForm = {
    title: "",
    slug: "",
    category: categories[0]?.name || "Flagship Summit",
    eventDate: new Date().toISOString().slice(0, 16),
    venue: "VIT Campus, Wadala, Mumbai",
    eventStatus: "Upcoming",
    publicationStatus: "Draft",
    isFeatured: false,
    description: "",
    registrationUrl: "",
    reportPdfUrl: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const filtered = events.filter((ev) => {
    if (filterPub !== "all" && ev.publicationStatus !== filterPub) return false;
    if (filterTimeline !== "all" && ev.eventStatus !== filterTimeline) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!ev.title.toLowerCase().includes(q) && !ev.venue.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData(initialForm);
    setFormOpen(true);
  };

  const handleOpenEdit = (ev: EventItem) => {
    setEditingId(ev.id);
    const d = new Date(ev.eventDate);
    const dateFormatted = d.toISOString().slice(0, 16);
    setFormData({
      title: ev.title,
      slug: ev.slug,
      category: ev.category,
      eventDate: dateFormatted,
      venue: ev.venue,
      eventStatus: ev.eventStatus,
      publicationStatus: ev.publicationStatus,
      isFeatured: ev.isFeatured,
      description: ev.description,
      registrationUrl: ev.registrationUrl || "",
      reportPdfUrl: ev.reportPdfUrl || "",
    });
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/admin/events/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (res.ok) {
          setEvents((prev) => prev.map((item) => (item.id === editingId ? json.event : item)));
          setFormOpen(false);
        } else {
          alert(json.error || "Update failed");
        }
      } else {
        const res = await fetch("/api/admin/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (res.ok) {
          setEvents((prev) => [json.event, ...prev]);
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
    const res = await fetch(`/api/admin/events/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "archive" }),
    });
    if (res.ok) {
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, publicationStatus: "Archived" } : e)));
    }
  };

  const handleRestore = async (id: string) => {
    const res = await fetch(`/api/admin/events/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restore" }),
    });
    if (res.ok) {
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, publicationStatus: "Draft" } : e)));
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteModalId || deleteConfirmText !== "DELETE") return;
    const res = await fetch(`/api/admin/events/${deleteModalId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmation: "DELETE" }),
    });
    if (res.ok) {
      setEvents((prev) => prev.filter((e) => e.id !== deleteModalId));
      setDeleteModalId(null);
      setDeleteConfirmText("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-indigo-500" />
            <span>Manage Events & Workshops</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create, schedule, publish and manage summits, bootcamps, and hackathon winners
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Event</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search events by title or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={filterPub}
          onChange={(e) => setFilterPub(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Publications</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
          <option value="Archived">Archived</option>
        </select>

        <select
          value={filterTimeline}
          onChange={(e) => setFilterTimeline(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Timelines</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Past">Past</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-lg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No events found. Click "Add New Event" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100/70 dark:bg-white/[0.02] border-b border-slate-200/80 dark:border-white/10 text-[11px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Publication</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filtered.map((ev) => {
                  const dateStr = new Date(ev.eventDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <tr key={ev.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          {ev.isFeatured && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                          <div>
                            <span>{ev.title}</span>
                            <span className="block text-[11px] text-slate-400 font-normal">
                              {ev.venue}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
                          {ev.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">{dateStr}</td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ev.eventStatus === "Upcoming"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-slate-100 dark:bg-white/10 text-slate-500"
                          }`}
                        >
                          {ev.eventStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ev.publicationStatus === "Published"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : ev.publicationStatus === "Draft"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                          }`}
                        >
                          {ev.publicationStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/events/${ev.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500"
                            title="Preview public event"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(ev)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300"
                            title="Edit Event"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {ev.publicationStatus !== "Archived" ? (
                            <button
                              type="button"
                              onClick={() => handleArchive(ev.id)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-amber-50 dark:hover:bg-amber-500/10 text-amber-600"
                              title="Archive Event"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRestore(ev.id)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600"
                              title="Restore to Draft"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {isSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteModalId(ev.id);
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="relative w-full max-w-2xl bg-surface border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 text-foreground max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <h2 className="text-lg font-bold">{editingId ? "Edit Event" : "Create New Event"}</h2>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. E-Summit 2026"
                    value={formData.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setFormData({
                        ...formData,
                        title,
                        slug: editingId ? formData.slug : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
                      });
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">
                    Timeline *
                  </label>
                  <select
                    value={formData.eventStatus}
                    onChange={(e) => setFormData({ ...formData, eventStatus: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Past">Past</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">
                    Publication Status *
                  </label>
                  <select
                    value={formData.publicationStatus}
                    onChange={(e) => setFormData({ ...formData, publicationStatus: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">
                    Date & Time (IST) *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">
                    Venue *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ev-featured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                />
                <label htmlFor="ev-featured" className="font-semibold text-slate-700 dark:text-slate-200">
                  Feature on Homepage
                </label>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">
                  Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">
                    Registration Portal URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://unstop.com/..."
                    value={formData.registrationUrl}
                    onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">
                    Report PDF URL / Path (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="/api/files/public/reports/..."
                    value={formData.reportPdfUrl}
                    onChange={(e) => setFormData({ ...formData, reportPdfUrl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold border border-slate-200 dark:border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
                >
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md bg-surface border border-rose-500/30 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-rose-600">Delete Event</h3>
            <p className="text-xs text-slate-500">
              Type <strong className="text-slate-900 dark:text-white">DELETE</strong> to permanently delete this event and any attached photos/winners.
            </p>
            <input
              type="text"
              placeholder="Type DELETE"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-rose-300 bg-slate-50 dark:bg-white/5 font-mono"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteModalId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== "DELETE"}
                onClick={handlePermanentDelete}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white disabled:opacity-30"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
