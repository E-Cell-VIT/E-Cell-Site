import React from "react";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminUsers } from "@/lib/db/admin-queries";
import { UsersAdminClient } from "@/components/admin/users-admin-client";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const admin = await requireAdmin();

  if (admin.role !== "super_admin") {
    redirect("/admin");
  }

  const users = await getAdminUsers();

  return (
    <UsersAdminClient
      initialUsers={users as any}
      currentAdminId={admin.id}
    />
  );
}
