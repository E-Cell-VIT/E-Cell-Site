"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Rocket,
  Search,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Building,
  HelpCircle,
} from "lucide-react";
import { IncubationModal } from "./incubation-modal";

interface StartupItem {
  id: string;
  name: string;
  slug: string;
  domain: string;
  oneLineSummary: string;
  startupStatus: string;
  founderPublicInfo: string;
  websiteUrl?: string | null;
  msmeStatus: string;
  msmeNumber?: string | null;
  showMsmeNumber: boolean;
  dpiitStatus: string;
  dpiitNumber?: string | null;
  showDpiitNumber: boolean;
  isEcellVerified: boolean;
  isMsmeVerified: boolean;
  isDpiitVerified: boolean;
}

interface StartupsViewProps {
  startups: StartupItem[];
  categories: Array<{ id: string; name: string }>;
  initialStatus?: string;
  initialDomain?: string;
  initialSearch?: string;
}

export function StartupsView({
  startups,
  categories,
  initialStatus = "all",
  initialDomain = "all",
  initialSearch = "",
}: StartupsViewProps) {
  const [incubationModalOpen, setIncubationModalOpen] = useState(false);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Header & Application CTA */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider">
              <Rocket className="w-3.5 h-3.5" />
              <span>Venture Directory</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              VIT Startups Directory
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300">
              Browse student and alumni ventures innovating across deep-tech, healthcare, hardware, sustainability, and software.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIncubationModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-xl shadow-indigo-600/25 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Apply for Incubation</span>
          </button>
        </div>

        {/* Neutral Registration Resources Panel */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-lg mb-10 bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-500" />
                <span>Official Startup Registration Portals</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
                VIT student founders are encouraged to register their ventures on official Government of India portals for statutory benefits, tax exemptions, and seed grants.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://udyamregistration.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 hover:border-indigo-500 text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <span>Udyam MSME Portal</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>

              <a
                href="https://www.startupindia.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 hover:border-amber-500 text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <span>Startup India (DPIIT)</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-lg mb-10">
          <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="search"
                defaultValue={initialSearch}
                placeholder="Search startups, keywords..."
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              name="status"
              defaultValue={initialStatus}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Stages (Working & Alumni)</option>
              <option value="Currently Working">Currently Working</option>
              <option value="Alumni / Scaled">Alumni / Scaled</option>
              <option value="Idea Stage">Idea Stage</option>
            </select>

            <select
              name="domain"
              defaultValue={initialDomain}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Domains</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
              >
                Apply Filters
              </button>
              <Link
                href="/startups"
                className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 flex items-center justify-center"
              >
                Reset
              </Link>
            </div>
          </form>
        </div>

        {/* Startups Grid */}
        {startups.length === 0 ? (
          <div className="py-20 text-center rounded-3xl glass-panel border border-slate-200 dark:border-white/10">
            <Rocket className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Startups Found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              No ventures match the selected filters. Clear filters to explore all companies.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {startups.map((startup) => (
              <div
                key={startup.id}
                className="flex flex-col justify-between rounded-3xl glass-panel p-6 sm:p-7 border border-slate-200 dark:border-white/10 shadow-lg hover:border-indigo-500/40 hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="space-y-4">
                  {/* Top domain & status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 truncate">
                      {startup.domain}
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 shrink-0">
                      {startup.startupStatus}
                    </span>
                  </div>

                  {/* Startup Name */}
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <Link href={`/startups/${startup.slug}`}>
                      {startup.name}
                    </Link>
                  </h2>

                  {/* Summary */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {startup.oneLineSummary}
                  </p>

                  {/* Public Founder Information */}
                  <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Founders (VIT Dept/Batch)
                    </span>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                      {startup.founderPublicInfo}
                    </p>
                  </div>

                  {/* Statutory Status Badges */}
                  <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <div className="flex items-center justify-between">
                      <span>MSME / Udyam:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {startup.msmeStatus}
                        {startup.msmeNumber ? ` (${startup.msmeNumber})` : ""}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Startup India (DPIIT):</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {startup.dpiitStatus}
                        {startup.dpiitNumber ? ` (${startup.dpiitNumber})` : ""}
                      </span>
                    </div>
                  </div>

                  {/* Verification Badges with Tooltip */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2">
                    {startup.isEcellVerified && (
                      <span
                        title="Verified by E-Cell means the listed details were checked by the E-Cell team; it is not a guarantee about the company."
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 cursor-help"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>E-Cell Verified</span>
                      </span>
                    )}
                    {startup.isMsmeVerified && (
                      <span
                        title="Verified by E-Cell means the listed details were checked against official MSME records."
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-help"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>MSME Verified</span>
                      </span>
                    )}
                    {startup.isDpiitVerified && (
                      <span
                        title="Verified by E-Cell means the listed details were checked against official DPIIT records."
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 cursor-help"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>DPIIT Verified</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs font-semibold">
                  <Link
                    href={`/startups/${startup.slug}`}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1.5"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {startup.websiteUrl && (
                    <a
                      href={startup.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
                    >
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Incubation Modal */}
      <IncubationModal
        isOpen={incubationModalOpen}
        onClose={() => setIncubationModalOpen(false)}
      />
    </>
  );
}
