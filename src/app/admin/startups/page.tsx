import React from "react";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminStartups } from "@/lib/db/admin-queries";
import { getPublicCategories } from "@/lib/db/public-queries";
import { StartupsAdminClient } from "@/components/admin/startups-admin-client";

export const dynamic = "force-dynamic";

export default async function AdminStartupsPage() {
  const admin = await requireAdmin();
  const [startups, categories] = await Promise.all([
    getAdminStartups(),
    getPublicCategories("startup_domain"),
  ]);

  return (
    <StartupsAdminClient
      initialStartups={startups as any}
      categories={categories}
      isSuperAdmin={admin.role === "super_admin"}
    />
  );
}
