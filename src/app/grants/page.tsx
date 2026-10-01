import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  getPublicGrants,
  getPublicGrantChecklist,
  getPublicCategories,
  getPublicSiteSettings,
} from "@/lib/db/public-queries";
import {
  ShieldAlert,
  Search,
  ExternalLink,
  Calendar,
  AlertTriangle,
  Clock,
  Sparkles,
  Building,
  CheckCircle2,
} from "lucide-react";
import { GrantChecklistTool } from "@/components/grants/checklist-tool";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Government Grants & Funding Directory | E-Cell VIT Mumbai",
    description: "Verified directory of central and state government funding schemes for collegiate startups, including SISFS, BIRAC BIG, DST PRAYAS, and MSInS.",
  };
}

export default async function GrantsPage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string; stage?: string; agency?: string; search?: string }>;
}) {
  const { sector, stage, agency, search } = await searchParams;

  const [settings, grants, checklistItems, categories] = await Promise.all([
    getPublicSiteSettings(),
    getPublicGrants({ sector, stage, agency, search }),
    getPublicGrantChecklist(),
    getPublicCategories("grant_sector"),
  ]);

  const thresholdDays = settings?.outdatedGrantThresholdDays || 90;
  const now = new Date();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-indigo-500 selection:text-white">
      <Navbar
        logoUrl={settings?.logoUrl}
        siteName={settings?.siteName}
        tagline={settings?.tagline}
      />

      <main className="flex-1 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Government Grant Ecosystem</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Government Grants & Schemes
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300">
              Curated, verified non-dilutive grant schemes from DPIIT, DST, BIRAC, and Maharashtra State Innovation Society.
            </p>
          </div>

          {/* Mandatory Guidance Disclaimer Banner */}
          <div className="p-5 rounded-3xl bg-amber-500/[0.08] border border-amber-500/25 flex items-start gap-3.5 shadow-sm text-amber-800 dark:text-amber-300">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
            <div className="text-xs sm:text-sm leading-relaxed">
              <strong className="block font-bold mb-0.5">Official Guidance Disclaimer:</strong>
              Information is provided for general guidance only. Please verify eligibility, deadlines and requirements on the official government portal before applying. E-Cell VIT does not guarantee availability of any scheme.
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-lg">
            <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="search"
                  defaultValue={search || ""}
                  placeholder="Search schemes, agencies..."
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                name="sector"
                defaultValue={sector || "all"}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Innovation Sectors</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                name="stage"
                defaultValue={stage || "all"}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Venture Stages</option>
                <option value="Idea to Prototype">Idea to Prototype (PoC)</option>
                <option value="Early Stage">Early Stage / Prototype to Market</option>
              </select>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
                >
                  Apply Filters
                </button>
                <Link
                  href="/grants"
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 flex items-center justify-center"
                >
                  Reset
                </Link>
              </div>
            </form>
          </div>

          {/* Grants Cards */}
          <div className="space-y-6">
            {grants.map((grant) => {
              // 1. Check if outdated (> 90 days)
              const lastVerified = new Date(grant.lastVerifiedAt);
              const daysSinceVerification = Math.floor(
                (now.getTime() - lastVerified.getTime()) / (1000 * 60 * 60 * 24)
              );
              const isOutdated = daysSinceVerification > thresholdDays;

              // 2. Check if expired (ONLY for fixed date/datetime types)
              let isExpired = false;
              let deadlineDisplay = "Rolling Application Window";

              if (grant.deadlineType === "fixed_date" || grant.deadlineType === "fixed_datetime") {
                if (grant.deadlineAt) {
                  const deadlineDate = new Date(grant.deadlineAt);
                  isExpired = deadlineDate < now;
                  deadlineDisplay = `${deadlineDate.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })} (IST Asia/Kolkata)`;
                }
              } else if (grant.deadlineType === "rolling") {
                deadlineDisplay = "Rolling / Open Throughout Year";
              } else if (grant.deadlineType === "until_funds_last") {
                deadlineDisplay = "Until Allocated Incubator Funds Last";
              } else {
                deadlineDisplay = "Not Specified (Check Portal)";
              }

              return (
                <div
                  key={grant.id}
                  className="p-8 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-xl space-y-6 hover:border-indigo-500/30 transition-all"
                >
                  {/* Top Bar: Agency & Deadline Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                        {grant.sector}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {grant.agency}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isExpired ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          Expired for Current Cycle
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{deadlineDisplay}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Funding */}
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                      {grant.schemeName}
                    </h2>
                    <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-500/[0.06] border border-indigo-500/15 inline-block text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-300">
                      Funding Amount: {grant.fundingRange}
                    </div>
                  </div>

                  {/* Key details grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-white/[0.03] space-y-1">
                      <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">
                        Eligibility Criteria
                      </span>
                      <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                        {grant.eligibility}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-white/[0.03] space-y-1">
                      <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">
                        Application Window
                      </span>
                      <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                        {grant.applicationWindow}
                      </p>
                    </div>
                  </div>

                  {/* Outdated warning if > 90 days */}
                  {isOutdated && (
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>
                        May be outdated — last verified {daysSinceVerification} days ago. Verify deadlines on the official portal.
                      </span>
                    </div>
                  )}

                  {/* Verification info & Mandatory Official Source Button */}
                  <div className="pt-4 border-t border-slate-200/60 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="text-slate-400 text-[11px]">
                      <span>Last Verified: </span>
                      <strong className="text-slate-600 dark:text-slate-300">
                        {lastVerified.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </strong>
                      <span> by {grant.verifiedBy}</span>
                    </div>

                    {/* Official Portal Button */}
                    <a
                      href={grant.officialSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
                    >
                      <span>Apply on {grant.sourceTitle}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Document Checklist Tool */}
          <div className="pt-10">
            <GrantChecklistTool items={checklistItems} />
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
