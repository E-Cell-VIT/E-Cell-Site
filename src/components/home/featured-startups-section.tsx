import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, ExternalLink, Rocket } from "lucide-react";

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
  dpiitStatus: string;
  dpiitNumber?: string | null;
  isEcellVerified: boolean;
  isMsmeVerified: boolean;
  isDpiitVerified: boolean;
}

interface FeaturedStartupsSectionProps {
  startups: StartupItem[];
}

export function FeaturedStartupsSection({ startups }: FeaturedStartupsSectionProps) {
  if (!startups || startups.length === 0) return null;

  return (
    <section className="py-16 md:py-24 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider mb-2">
              <Rocket className="w-3.5 h-3.5" />
              <span>Campus Innovation</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Featured VIT Startups
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Student and alumni ventures incubated and supported by E-Cell VIT Mumbai.
            </p>
          </div>
          <Link
            href="/startups"
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 group"
          >
            <span>Explore all startups</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Startups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {startups.map((startup) => (
            <div
              key={startup.id}
              className="flex flex-col justify-between rounded-3xl glass-panel p-6 border border-slate-200 dark:border-white/10 shadow-lg hover:border-indigo-500/50 hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="space-y-4">
                {/* Header: Domain & Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 truncate">
                    {startup.domain}
                  </span>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 shrink-0">
                    {startup.startupStatus}
                  </span>
                </div>

                {/* Startup Name */}
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <Link href={`/startups/${startup.slug}`}>
                    {startup.name}
                  </Link>
                </h3>

                {/* One line summary */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                  {startup.oneLineSummary}
                </p>

                {/* Public Founder Information */}
                <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Founders (VIT Dept/Batch)
                  </span>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                    {startup.founderPublicInfo}
                  </p>
                </div>

                {/* Verification Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {startup.isEcellVerified && (
                    <span
                      title="Verified by E-Cell means the listed details were checked by the E-Cell team; it is not a guarantee about the company."
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 cursor-help"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      <span>E-Cell Verified</span>
                    </span>
                  )}
                  {startup.isMsmeVerified && (
                    <span
                      title="Verified by E-Cell against Ministry of MSME registration."
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-help"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>MSME Verified</span>
                    </span>
                  )}
                  {startup.isDpiitVerified && (
                    <span
                      title="Verified by E-Cell against DPIIT Startup India portal."
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 cursor-help"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>DPIIT Verified</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs font-semibold">
                <Link
                  href={`/startups/${startup.slug}`}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1"
                >
                  <span>Read Profile</span>
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
      </div>
    </section>
  );
}
