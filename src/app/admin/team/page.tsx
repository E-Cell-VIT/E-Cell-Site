import React from "react";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminTeamMembers } from "@/lib/db/admin-queries";
import { TeamAdminClient } from "@/components/admin/team-admin-client";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const admin = await requireAdmin();
  const members = await getAdminTeamMembers();

  return (
    <TeamAdminClient
      initialMembers={members as any}
      isSuperAdmin={admin.role === "super_admin"}
    />
  );
}
