import React from "react";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminGrants } from "@/lib/db/admin-queries";
import { getPublicCategories } from "@/lib/db/public-queries";
import { GrantsAdminClient } from "@/components/admin/grants-admin-client";

export const dynamic = "force-dynamic";

export default async function AdminGrantsPage() {
  const admin = await requireAdmin();
  const [grants, sectors] = await Promise.all([
    getAdminGrants(),
    getPublicCategories("grant_sector"),
  ]);

  return (
    <GrantsAdminClient
      initialGrants={grants as any}
      sectors={sectors}
      isSuperAdmin={admin.role === "super_admin"}
    />
  );
}
