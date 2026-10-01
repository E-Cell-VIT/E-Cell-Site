import React from "react";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminCategories } from "@/lib/db/admin-queries";
import { CategoriesAdminClient } from "@/components/admin/categories-admin-client";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const admin = await requireAdmin();
  const categories = await getAdminCategories();

  return (
    <CategoriesAdminClient
      initialCategories={categories as any}
      isSuperAdmin={admin.role === "super_admin"}
    />
  );
}
