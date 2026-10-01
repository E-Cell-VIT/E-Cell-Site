"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Rocket,
  Calendar,
  BookOpen,
  Award,
  Users,
  FolderTree,
  Shield,
  Settings,
  UserCheck,
  History,
  Download,
  LogOut,
  ChevronRight,
  Menu,
  X,
  FileCheck2,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface AdminSidebarProps {
  currentAdmin: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  unreadLeadsCount: number;
  pendingApplicationsCount: number;
}

export function AdminSidebar({
  currentAdmin,
  unreadLeadsCount,
  pendingApplicationsCount,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isSuperAdmin = currentAdmin.role === "super_admin";

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  const navItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    {
      label: "Leads & Inquiries",
      href: "/admin/leads",
      icon: Inbox,
      badge: unreadLeadsCount > 0 ? unreadLeadsCount : undefined,
      badgeColor: "bg-rose-500",
    },
    {
      label: "Incubation Applications",
      href: "/admin/applications",
      icon: FileCheck2,
      badge: pendingApplicationsCount > 0 ? pendingApplicationsCount : undefined,
      badgeColor: "bg-amber-500",
    },
    { label: "Startups Directory", href: "/admin/startups", icon: Rocket },
    { label: "Events & Reports", href: "/admin/events", icon: Calendar },
    { label: "Blogs & Insights", href: "/admin/blogs", icon: BookOpen },
    { label: "Government Grants", href: "/admin/grants", icon: Award },
    { label: "Team & Mentors", href: "/admin/team", icon: Users },
    { label: "Categories & Sectors", href: "/admin/categories", icon: FolderTree },
    { label: "Privacy Requests", href: "/admin/privacy-requests", icon: Shield },
    { label: "Site Settings", href: "/admin/settings", icon: Settings },
    { label: "Data Export & Backups", href: "/admin/export", icon: Download },
  ];

  const superAdminItems = [
    { label: "Admin Users", href: "/admin/users", icon: UserCheck },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: History },
  ];

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between p-4 glass-panel border-b border-slate-200 dark:border-white/10">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="E-Cell VIT" width={140} height={35} className="h-8 w-auto object-contain" />
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500">
            Admin
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Desktop */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 flex-col justify-between border-r border-slate-200 dark:border-white/10 bg-surface p-4 transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0 flex" : "-translate-x-full lg:flex hidden"
        }`}
      >
        <div className="space-y-6 overflow-y-auto pr-1">
          {/* Brand header */}
          <div className="flex items-center justify-between px-2 pt-2">
            <Link href="/admin" className="flex items-center gap-2.5">
              <Image src="/logo.svg" alt="E-Cell VIT Logo" width={160} height={40} className="h-8 w-auto object-contain" />
            </Link>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button
                onClick={() => setMobileOpen(false)}
                className="lg:hidden p-1 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Current Admin badge */}
          <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {currentAdmin.name}
              </span>
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                  isSuperAdmin
                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                    : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300"
                }`}
              >
                {currentAdmin.role}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {currentAdmin.email}
            </p>
          </div>

          {/* Main Navigation */}
          <nav className="space-y-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Core Modules
            </span>
            {navItems.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white ${
                        item.badgeColor || "bg-indigo-500"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Super Admin Section */}
            {isSuperAdmin && (
              <div className="pt-4 space-y-1">
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-amber-500">
                  Super Admin
                </span>
                {superAdminItems.map((item) => {
                  const active = pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0 text-amber-500" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>
        </div>

        {/* Bottom bar & Logout */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <span>View Public Site</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
