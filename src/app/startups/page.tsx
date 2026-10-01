import React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getPublicStartups, getPublicCategories, getPublicSiteSettings } from "@/lib/db/public-queries";
import { StartupsView } from "@/components/startups/startups-view";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "VIT Startups Directory | E-Cell VIT Mumbai",
    description: "Explore innovative ventures, deep-tech research spinouts, and student-led enterprises founded at Vidyalankar Institute of Technology, Mumbai.",
  };
}

export default async function StartupsPage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string; status?: string; search?: string }>;
}) {
  const { domain, status, search } = await searchParams;

  const [settings, startups, categories] = await Promise.all([
    getPublicSiteSettings(),
    getPublicStartups({ domain, status, search }),
    getPublicCategories("startup_domain"),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-indigo-500 selection:text-white">
      <Navbar
        logoUrl={settings?.logoUrl}
        siteName={settings?.siteName}
        tagline={settings?.tagline}
      />

      <main className="flex-1">
        <StartupsView
          startups={startups}
          categories={categories}
          initialStatus={status}
          initialDomain={domain}
          initialSearch={search}
        />
      </main>

      <Footer
        logoUrl={settings?.logoUrl}
        siteName={settings?.siteName}
        contactEmail={settings?.contactEmail}
        contactPhone={settings?.contactPhone}
        campusMapUrl={settings?.campusMapUrl}
      />
    </div>
  );
}
