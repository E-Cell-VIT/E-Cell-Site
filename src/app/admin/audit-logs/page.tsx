import React from "react";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminAuditLogs } from "@/lib/db/admin-queries";
import { AuditLogsClient } from "@/components/admin/audit-logs-client";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage() {
  const admin = await requireAdmin();

  if (admin.role !== "super_admin") {
    redirect("/admin");
  }

  const { logs, total, page, pageSize } = await getAdminAuditLogs({ page: 1, pageSize: 30 });

  return (
    <AuditLogsClient
      initialLogs={logs as any}
      total={total}
      initialPage={page}
      initialPageSize={pageSize}
    />
  );
}
