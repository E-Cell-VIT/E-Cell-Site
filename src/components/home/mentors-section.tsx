import Link from "next/link";
import { Award, ArrowRight, UserCheck } from "lucide-react";
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

interface MentorsSectionProps {
  mentors: TeamMemberItem[];
}

export function MentorsSection({ mentors }: MentorsSectionProps) {
  if (!mentors || mentors.length === 0) return null;

  return (
    <section className="py-16 md:py-24 border-b border-slate-200/80 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-bold uppercase tracking-wider mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Guidance & Advisory</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Advisory Board & Mentors
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Distinguished faculty leaders and industry experts steering student entrepreneurship.
            </p>
          </div>
          <Link
            href="/team"
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 group"
          >
            <span>View full council</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((member) => (
            <div
              key={member.id}
              className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-lg hover:border-indigo-500/40 transition-all duration-200 flex items-start gap-4"
            >
              {/* Avatar placeholder / photo */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 font-bold text-lg shadow-md">
                <UserCheck className="w-7 h-7" />
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {member.name}
                  </h3>
                  {member.linkedinUrl && (
                    <a
                      href={member.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-blue-500 transition-colors"
                      aria-label={`${member.name} LinkedIn Profile`}
                    >
                      <LinkedInIcon className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 line-clamp-1">
                  {member.designation}
                </p>
                {member.organisation && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {member.organisation}
                  </p>
                )}
                <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                  {member.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
