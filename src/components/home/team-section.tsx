import Link from "next/link";
import { Users, ArrowRight, Sparkles } from "lucide-react";
import { LinkedInIcon } from "@/components/icons/social-icons";

interface TeamMemberItem {
  id: string;
  name: string;
  photoUrl?: string | null;
  designation: string;
  organisation?: string | null;
  linkedinUrl?: string | null;
  category: string;
}

interface TeamSectionProps {
  studentHeads: TeamMemberItem[];
}

export function TeamSection({ studentHeads }: TeamSectionProps) {
  if (!studentHeads || studentHeads.length === 0) return null;

  return (
    <section className="py-16 md:py-24 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Student Leadership</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Student Heads & Core Team
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              The driving engine behind E-Cell VIT initiatives, buildathons, and startup summits.
            </p>
          </div>
          <Link
            href="/team"
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 group"
          >
            <span>Meet the full team</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {studentHeads.map((head) => (
            <div
              key={head.id}
              className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-lg hover:border-indigo-500/40 transition-all duration-200 flex items-start gap-4"
            >
              {/* Student avatar placeholder */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center shrink-0 font-bold text-lg shadow-md">
                <Sparkles className="w-6 h-6 text-amber-300" />
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {head.name}
                  </h3>
                  {head.linkedinUrl && (
                    <a
                      href={head.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-blue-500 transition-colors"
                      aria-label={`${head.name} LinkedIn Profile`}
                    >
                      <LinkedInIcon className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 line-clamp-1">
                  {head.designation}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {head.organisation || "E-Cell VIT Mumbai"}
                </p>
                <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                  {head.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
