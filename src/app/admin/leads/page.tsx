import React from "react";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminLeads } from "@/lib/db/admin-queries";
import { LeadsClient } from "@/components/admin/leads-client";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const admin = await requireAdmin();
  const { leads } = await getAdminLeads({ pageSize: 100 });

  return (
    <LeadsClient
      initialLeads={leads as any}
      isSuperAdmin={admin.role === "super_admin"}
    />
  );
}
