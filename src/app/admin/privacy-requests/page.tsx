import React from "react";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminPrivacyRequests } from "@/lib/db/admin-queries";
import { PrivacyRequestsClient } from "@/components/admin/privacy-requests-client";

export const dynamic = "force-dynamic";

export default async function AdminPrivacyRequestsPage() {
  await requireAdmin();
  const { requests, total } = await getAdminPrivacyRequests();

  return (
    <PrivacyRequestsClient
      initialRequests={requests as any}
      total={total}
    />
  );
}
