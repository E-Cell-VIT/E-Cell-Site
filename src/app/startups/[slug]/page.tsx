import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getPublicStartupBySlug, getPublicSiteSettings } from "@/lib/db/public-queries";
import {
  ArrowLeft,
  Rocket,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  Building,
  Users,
} from "lucide-react";
import { LinkedInIcon, TwitterXIcon } from "@/components/icons/social-icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const startup = await getPublicStartupBySlug(slug);

  if (!startup) {
    return { title: "Startup Not Found | E-Cell VIT Mumbai" };
  }

  return {
    title: `${startup.name} | VIT Startups Directory`,
    description: startup.oneLineSummary,
  };
}

export default async function StartupDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [settings, startup] = await Promise.all([
    getPublicSiteSettings(),
    getPublicStartupBySlug(slug),
  ]);

  if (!startup) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-indigo-500 selection:text-white">
      <Navbar
        logoUrl={settings?.logoUrl}
        siteName={settings?.siteName}
        tagline={settings?.tagline}
      />

      <main className="flex-1 py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/startups"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Startups Directory</span>
          </Link>

          {/* Profile Header */}
          <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-2xl mb-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                {startup.domain}
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                {startup.startupStatus}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-lg font-black text-2xl">
                {startup.name.charAt(1) || "S"}
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {startup.name}
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1">
                  {startup.oneLineSummary}
                </p>
              </div>
            </div>

            {/* Public Founder Information */}
            <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5 flex items-start gap-3">
              <Users className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  Founding Team (Department & Batch)
                </span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {startup.founderPublicInfo}
                </p>
              </div>
            </div>

            {/* External Links */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {startup.websiteUrl && (
                <a
                  href={startup.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
                >
                  <span>Visit Company Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {startup.linkedinUrl && (
                <a
                  href={startup.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-slate-300 dark:border-white/10 hover:border-blue-500 text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-colors"
                  aria-label="LinkedIn Profile"
                >
                  <LinkedInIcon className="w-4 h-4" />
                </a>
              )}

              {startup.twitterUrl && (
                <a
                  href={startup.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-slate-300 dark:border-white/10 hover:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-white transition-colors"
                  aria-label="X Profile"
                >
                  <TwitterXIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-4 mb-10">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Venture Overview & Technology
            </h2>
            <div className="p-8 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 leading-relaxed text-slate-700 dark:text-slate-300 text-base">
              {startup.fullDescription}
            </div>
          </div>

          {/* Regulatory & Verification Information */}
          <div className="p-8 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-lg space-y-6 mb-12">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-500" />
              <span>Statutory Registration & E-Cell Verification Status</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-white/[0.03] space-y-1">
                <span className="text-slate-400 font-semibold block">MSME / Udyam Registration</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">
                  {startup.msmeStatus}
                  {startup.msmeNumber ? ` • ${startup.msmeNumber}` : ""}
                </span>
                <span className="text-[11px] text-slate-500">Ministry of Micro, Small and Medium Enterprises</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-white/[0.03] space-y-1">
                <span className="text-slate-400 font-semibold block">Startup India Recognition</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">
                  {startup.dpiitStatus}
                  {startup.dpiitNumber ? ` • ${startup.dpiitNumber}` : ""}
                </span>
                <span className="text-[11px] text-slate-500">DPIIT, Ministry of Commerce and Industry</span>
              </div>
            </div>

            {/* Badges row with explicit disclaimer */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-white/10 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {startup.isEcellVerified && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                    <ShieldCheck className="w-4 h-4" />
                    <span>E-Cell Profile Verified</span>
                  </span>
                )}
                {startup.isMsmeVerified && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>MSME Verified</span>
                  </span>
                )}
                {startup.isDpiitVerified && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>DPIIT Verified</span>
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
                * Note: "Verified by E-Cell" means the listed registration and academic credentials were authenticated by the E-Cell verification committee; it is not a financial guarantee or commercial endorsement of the company.
              </p>
            </div>
          </div>
        </div>
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
