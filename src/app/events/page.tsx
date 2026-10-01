import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getPublicEvents, getPublicCategories, getPublicSiteSettings } from "@/lib/db/public-queries";
import { Calendar, MapPin, Tag, ArrowRight, Search, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Events & Conclaves | E-Cell VIT Mumbai",
    description: "Explore flagship summits, hackathons, pitch bootcamps, and workshops organized by E-Cell VIT Mumbai.",
  };
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; status?: string; year?: string; search?: string }>;
}) {
  const { category, status, year, search } = await searchParams;

  const [settings, events, categories] = await Promise.all([
    getPublicSiteSettings(),
    getPublicEvents({ category, status, year, search }),
    getPublicCategories("event_category"),
  ]);

  const currentYear = new Date().getFullYear();
  const availableYears = [String(currentYear), String(currentYear - 1), String(currentYear - 2)];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-indigo-500 selection:text-white">
      <Navbar
        logoUrl={settings?.logoUrl}
        siteName={settings?.siteName}
        tagline={settings?.tagline}
      />

      <main className="flex-1 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>Campus Conclaves & Bootcamps</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              E-Cell Events & Archives
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300">
              Discover upcoming speaker sessions, buildathons, and annual summits, or browse reports and winner podiums from past events.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-lg mb-10 space-y-4">
            <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="search"
                  defaultValue={search || ""}
                  placeholder="Search events, venues..."
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Status filter */}
              <select
                name="status"
                defaultValue={status || "all"}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Timelines (Upcoming & Past)</option>
                <option value="Upcoming">Upcoming Only</option>
                <option value="Past">Past Archives</option>
              </select>

              {/* Category filter */}
              <select
                name="category"
                defaultValue={category || "all"}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Year filter */}
              <select
                name="year"
                defaultValue={year || "all"}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Years</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>

              <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2 pt-2">
                <Link
                  href="/events"
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300"
                >
                  Clear Filters
                </Link>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
                >
                  Apply Filters
                </button>
              </div>
            </form>
          </div>

          {/* Events Grid */}
          {events.length === 0 ? (
            <div className="py-20 text-center rounded-3xl glass-panel border border-slate-200 dark:border-white/10">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Events Found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                No events matched your filter criteria. Try clearing filters or searching with different keywords.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((ev) => {
                const dateObj = new Date(ev.eventDate);
                const dateStr = dateObj.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <div
                    key={ev.id}
                    className="flex flex-col justify-between rounded-3xl glass-panel p-6 sm:p-7 border border-slate-200 dark:border-white/10 shadow-lg hover:border-indigo-500/40 hover:shadow-2xl transition-all duration-300 group"
                  >
                    <div className="space-y-4">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 truncate">
                          {ev.category}
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                            ev.eventStatus === "Upcoming"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10"
                          }`}
                        >
                          {ev.eventStatus}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        <Link href={`/events/${ev.slug}`}>{ev.title}</Link>
                      </h2>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                        {ev.description}
                      </p>

                      {/* Meta info */}
                      <div className="space-y-1.5 pt-2 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{dateStr}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="truncate">{ev.venue}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs font-semibold">
                      <Link
                        href={`/events/${ev.slug}`}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1.5"
                      >
                        <span>View Details & Report</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      {ev.isFeatured && (
                        <span className="flex items-center gap-1 text-amber-500 font-bold text-[11px]">
                          <Sparkles className="w-3 h-3" />
                          <span>Featured</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer
        logoUrl={settings?.logoUrl}
        siteName={settings?.siteName}
        contactEmail={settings?.contactEmail}
        contactPhone={settings?.contactPhone}
        campusMapUrl={settings?.campusMapUrl}
      />
    </div>
  );
}
