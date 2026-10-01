import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  getPublicTeamMembers,
  getPublicTeamAcademicYears,
  getPublicSiteSettings,
} from "@/lib/db/public-queries";
import { Users, Award, Sparkles, UserCheck, GraduationCap } from "lucide-react";
import { LinkedInIcon } from "@/components/icons/social-icons";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Leadership & Advisory Council | E-Cell VIT Mumbai",
    description: "Meet the faculty advisors, industry venture mentors, and student council heads driving innovation at Vidyalankar Institute of Technology, Mumbai.",
  };
}

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year } = await searchParams;

  const [settings, academicYears, members] = await Promise.all([
    getPublicSiteSettings(),
    getPublicTeamAcademicYears(),
    getPublicTeamMembers({ academicYear: year }),
  ]);

  const selectedYear = year || academicYears[0] || "2026-27";

  // Group members into categories
  const facultyAdvisors = members.filter((m) => m.category === "Faculty Advisor");
  const industryMentors = members.filter((m) => m.category === "Industry Mentor");
  const studentHeads = members.filter((m) => m.category === "Student Head");
  const coreTeam = members.filter((m) => m.category === "Core Team");

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-indigo-500 selection:text-white">
      <Navbar
        logoUrl={settings?.logoUrl}
        siteName={settings?.siteName}
        tagline={settings?.tagline}
      />

      <main className="flex-1 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>Leadership & Advisory</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              The People Behind E-Cell VIT
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300">
              Passionate educators, seasoned industry builders, and visionary student innovators shaping Maharashtra's collegiate venture ecosystem.
            </p>

            {/* Academic Year Filter Bar */}
            <div className="pt-4 flex items-center justify-center gap-2">
              <span className="text-xs text-slate-400 font-semibold mr-1">Academic Year:</span>
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl glass-panel border border-slate-200 dark:border-white/10">
                {academicYears.map((yr) => (
                  <Link
                    key={yr}
                    href={`/team?year=${yr}`}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedYear === yr
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                    }`}
                  >
                    {yr}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* 1. Faculty Advisors */}
          {facultyAdvisors.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-white/10">
                <GraduationCap className="w-6 h-6 text-indigo-500" />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Faculty Advisors
                  </h2>
                  <p className="text-xs text-slate-500">
                    Institutional governance and academic mentorship at VIT Wadala
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {facultyAdvisors.map((member) => (
                  <div
                    key={member.id}
                    className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-lg flex items-start gap-4"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center shrink-0 shadow-md">
                      <GraduationCap className="w-7 h-7" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                          {member.name}
                        </h3>
                        {member.linkedinUrl && (
                          <a
                            href={member.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-blue-500 transition-colors"
                          >
                            <LinkedInIcon className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {member.designation}
                      </p>
                      {member.organisation && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {member.organisation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Industry Mentors */}
          {industryMentors.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-white/10">
                <Award className="w-6 h-6 text-purple-500" />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Industry Mentors & Venture Advisors
                  </h2>
                  <p className="text-xs text-slate-500">
                    Founders, operators, and venture partners coaching our student startups
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {industryMentors.map((member) => (
                  <div
                    key={member.id}
                    className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-lg flex items-start gap-4"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <Award className="w-7 h-7" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                          {member.name}
                        </h3>
                        {member.linkedinUrl && (
                          <a
                            href={member.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-blue-500 transition-colors"
                          >
                            <LinkedInIcon className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                        {member.designation}
                      </p>
                      {member.organisation && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {member.organisation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Student Heads & Council */}
          {studentHeads.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-white/10">
                <Sparkles className="w-6 h-6 text-amber-500" />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Student Heads ({selectedYear})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Lead organizers and team conveners
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {studentHeads.map((member) => (
                  <div
                    key={member.id}
                    className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-lg flex items-start gap-4"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shrink-0 shadow-md">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                          {member.name}
                        </h3>
                        {member.linkedinUrl && (
                          <a
                            href={member.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-blue-500 transition-colors"
                          >
                            <LinkedInIcon className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {member.designation}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {member.organisation || "E-Cell VIT Mumbai"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Core Team */}
          {coreTeam.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-white/10">
                <Users className="w-6 h-6 text-cyan-500" />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Core Team Members ({selectedYear})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Execution, operations, technical systems, and corporate relations
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {coreTeam.map((member) => (
                  <div
                    key={member.id}
                    className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-lg flex items-start gap-4"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <Users className="w-7 h-7" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                          {member.name}
                        </h3>
                        {member.linkedinUrl && (
                          <a
                            href={member.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-blue-500 transition-colors"
                          >
                            <LinkedInIcon className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                        {member.designation}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {member.organisation || "E-Cell VIT Mumbai"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
