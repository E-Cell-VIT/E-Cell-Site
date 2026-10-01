import React from "react";
import { TrendingUp, Users, Calendar, Award, Zap } from "lucide-react";

interface StatItem {
  id?: string;
  label: string;
  value: string;
}

interface StatsSectionProps {
  automaticStats: StatItem[];
  manualStats: StatItem[];
}

export function StatsSection({ automaticStats, manualStats }: StatsSectionProps) {
  const allStats = [
    ...automaticStats.map((s) => ({ ...s, isAuto: true })),
    ...manualStats.map((s) => ({ ...s, isAuto: false })),
  ];

  return (
    <section className="py-12 bg-gradient-to-b from-indigo-950/20 via-transparent to-transparent border-b border-slate-200/80 dark:border-white/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Impact in Numbers
          </p>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            VIT Entrepreneurship Footprint
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {allStats.map((stat, idx) => (
            <div
              key={stat.label + idx}
              className="p-5 sm:p-6 rounded-2xl glass-panel text-center hover:scale-105 transition-transform duration-200 border border-slate-200 dark:border-white/10"
            >
              <div className="inline-flex p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-3">
                {stat.isAuto ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <Zap className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <div className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {stat.value}
              </div>
              <div className="mt-1 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                {stat.label}
              </div>
              {stat.isAuto && (
                <span className="inline-block mt-2 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Live DB Stat
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
