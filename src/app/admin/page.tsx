import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminOverviewMetrics } from "@/lib/db/admin-queries";
import {
  Inbox,
  FileCheck2,
  Rocket,
  Calendar,
  BookOpen,
  History,
  ArrowRight,
  Plus,
  Shield,
  Clock,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const admin = await requireAdmin();
  const metrics = await getAdminOverviewMetrics();

  const statCards = [
    {
      label: "Total Leads",
      value: metrics.totalLeads,
      badge: `${metrics.unreadLeads} unread`,
      badgeColor: metrics.unreadLeads > 0 ? "bg-rose-500/10 text-rose-500" : "bg-slate-500/10 text-slate-400",
      href: "/admin/leads",
      icon: Inbox,
      color: "text-rose-500",
    },
    {
      label: "Incubation Applications",
      value: metrics.pendingApplications,
      badge: "Pending Review",
      badgeColor: metrics.pendingApplications > 0 ? "bg-amber-500/10 text-amber-500" : "bg-slate-500/10 text-slate-400",
      href: "/admin/applications",
      icon: FileCheck2,
      color: "text-amber-500",
    },
    {
      label: "Active Startups",
      value: metrics.activeStartups,
      badge: "Published",
      badgeColor: "bg-cyan-500/10 text-cyan-500",
      href: "/admin/startups",
      icon: Rocket,
      color: "text-cyan-500",
    },
    {
      label: "Published Events",
      value: metrics.publishedEvents,
      badge: "Public Site",
      badgeColor: "bg-indigo-500/10 text-indigo-500",
      href: "/admin/events",
      icon: Calendar,
      color: "text-indigo-500",
    },
    {
      label: "Published Blogs",
      value: metrics.publishedBlogs,
      badge: "Guides & Articles",
      badgeColor: "bg-emerald-500/10 text-emerald-500",
      href: "/admin/blogs",
      icon: BookOpen,
      color: "text-emerald-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Welcome back, {admin.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            E-Cell VIT Central Administration • Role: <strong className="uppercase">{admin.role}</strong>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/startups"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage Startups</span>
          </Link>
          <Link
            href="/admin/events"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Manage Events</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="p-5 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`p-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${card.badgeColor}`}>
                  {card.badge}
                </span>
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {card.value}
                </span>
                <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  {card.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two Column Layout: Quick Actions & Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Quick Actions & System Overview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Administrative Quick Links</span>
            </h2>

            <div className="grid grid-cols-1 gap-2.5 text-xs font-semibold">
              <Link
                href="/admin/leads"
                className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5 hover:border-indigo-500/50 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Inbox className="w-4 h-4 text-rose-500" />
                  <span>Review Incoming Inquiries & Export CSV</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/admin/applications"
                className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5 hover:border-indigo-500/50 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck2 className="w-4 h-4 text-amber-500" />
                  <span>Incubation Applications & Pitch Decks</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/admin/settings"
                className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5 hover:border-indigo-500/50 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  <span>Site Settings, Logo & Manual Stats</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/admin/export"
                className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5 hover:border-indigo-500/50 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <History className="w-4 h-4 text-cyan-500" />
                  <span>Export Data & Download Backups</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Recent Activity Feed (Audit Log) */}
        <div className="lg:col-span-7">
          <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-500" />
                <span>Recent Administrative Activity</span>
              </h2>
              {admin.role === "super_admin" && (
                <Link
                  href="/admin/audit-logs"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                >
                  View full audit log
                </Link>
              )}
            </div>

            {metrics.recentAuditLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No administrative actions recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.recentAuditLogs.map((log) => {
                  const logTime = new Date(log.timestamp).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={log.id}
                      className="p-3 rounded-2xl bg-slate-100/60 dark:bg-white/[0.02] border border-slate-200/40 dark:border-white/5 flex items-center justify-between text-xs gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10">
                            {log.action}
                          </span>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400 truncate">
                            {log.contentType}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                          By: {log.adminEmail || "System"}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{logTime}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
