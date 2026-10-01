import React from "react";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminBlogs } from "@/lib/db/admin-queries";
import { BlogsAdminClient } from "@/components/admin/blogs-admin-client";

export const dynamic = "force-dynamic";

export default async function AdminBlogsPage() {
  const admin = await requireAdmin();
  const blogs = await getAdminBlogs();

  return (
    <BlogsAdminClient
      initialBlogs={blogs as any}
      isSuperAdmin={admin.role === "super_admin"}
    />
  );
}
