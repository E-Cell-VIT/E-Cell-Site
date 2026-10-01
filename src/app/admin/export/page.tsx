import React from "react";
import { requireAdmin } from "@/lib/auth/session";
import { ExportAdminClient } from "@/components/admin/export-admin-client";

export const dynamic = "force-dynamic";

export default async function AdminExportPage() {
  await requireAdmin();

  return <ExportAdminClient />;
}
