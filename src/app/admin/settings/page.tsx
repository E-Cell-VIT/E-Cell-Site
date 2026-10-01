import React from "react";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminSiteSettings } from "@/lib/db/admin-queries";
import { SettingsAdminClient } from "@/components/admin/settings-admin-client";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();
  const settings = await getAdminSiteSettings();

  return (
    <SettingsAdminClient
      initialSettings={settings as any}
      isSuperAdmin={admin.role === "super_admin"}
    />
  );
}
