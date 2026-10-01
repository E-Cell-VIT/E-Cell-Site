import React from "react";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminApplications } from "@/lib/db/admin-queries";
import { ApplicationsClient } from "@/components/admin/applications-client";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
  const admin = await requireAdmin();
  const { applications } = await getAdminApplications({ pageSize: 100 });

  return (
    <ApplicationsClient
      initialApplications={applications as any}
      isSuperAdmin={admin.role === "super_admin"}
    />
  );
}
