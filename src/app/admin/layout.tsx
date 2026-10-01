import React from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata: Metadata = {
  title: "Admin Dashboard | E-Cell VIT Mumbai",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  // Exclude login page from authenticated chrome
  let admin = null;
  try {
    admin = await requireAdmin();
  } catch {
    // If not authenticated, the middleware handles redirect, but in case of layout render:
    admin = null;
  }

  // If no admin and not on login, middleware will redirect.
  // For the login page itself or fallback:
  if (!admin) {
    return <>{children}</>;
  }

  // Fetch real-time badge counters
  const [unreadLeads, pendingApplications] = await Promise.all([
    prisma.lead.count({ where: { isRead: false } }),
    prisma.incubationApplication.count({ where: { status: "Pending" } }),
  ]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground transition-colors selection:bg-indigo-500 selection:text-white">
      <AdminSidebar
        currentAdmin={admin}
        unreadLeadsCount={unreadLeads}
        pendingApplicationsCount={pendingApplications}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-4 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
