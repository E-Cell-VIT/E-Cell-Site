import React from "react";
import { Compass, Target, Eye, Lightbulb } from "lucide-react";

interface AboutSectionProps {
  aboutText?: string;
  missionText?: string;
  visionText?: string;
}

export function AboutSection({
  aboutText = "[Placeholder: About E-Cell VIT - The Entrepreneurship Cell of Vidyalankar Institute of Technology, Wadala, Mumbai is a student-driven organization committed to cultivating an entrepreneurial mindset, supporting student innovations, and connecting campus innovators with industry ecosystems.]",
  missionText = "[Placeholder: Mission - To empower aspiring student founders with resources, mentorship, industry networks, and pre-incubation infrastructure to transform groundbreaking ideas into sustainable enterprises.]",
  visionText = "[Placeholder: Vision - To establish Vidyalankar Institute of Technology as a premier hub of innovation, deep-tech research commercialization, and student-led venture creation in Mumbai.]",
}: AboutSectionProps) {
  return (
    <section className="py-16 md:py-24 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>About The Organization</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Catalyzing Innovation at VIT Mumbai
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {aboutText}
          </p>
        </div>

        {/* Mission and Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {/* Mission Card */}
          <div className="relative group p-8 rounded-3xl glass-panel shadow-xl hover:border-indigo-500/50 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors pointer-events-none" />
            <div className="flex items-center gap-3.5 mb-5">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Our Mission</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Action & Empowerment</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {missionText}
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Lightbulb className="w-4 h-4" />
              <span>Building resilient, scalable collegiate ventures</span>
            </div>
          </div>

          {/* Vision Card */}
          <div className="relative group p-8 rounded-3xl glass-panel shadow-xl hover:border-amber-500/50 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors pointer-events-none" />
            <div className="flex items-center gap-3.5 mb-5">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Our Vision</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Long-term Ecosystem Impact</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {visionText}
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Compass className="w-4 h-4" />
              <span>Positioning Mumbai as an innovation powerhouse</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
