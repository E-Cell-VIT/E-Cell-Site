import React from "react";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminEvents } from "@/lib/db/admin-queries";
import { getPublicCategories } from "@/lib/db/public-queries";
import { EventsAdminClient } from "@/components/admin/events-admin-client";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const admin = await requireAdmin();
  const [events, categories] = await Promise.all([
    getAdminEvents(),
    getPublicCategories("event_category"),
  ]);

  return (
    <EventsAdminClient
      initialEvents={events as any}
      categories={categories}
      isSuperAdmin={admin.role === "super_admin"}
    />
  );
}
