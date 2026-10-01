"use client";

import React, { useState } from "react";
import { CheckSquare, Square, Printer, CheckCircle, Sparkles } from "lucide-react";

interface ChecklistItem {
  id: string;
  itemText: string;
  category: string;
}

export function GrantChecklistTool({ items }: { items: ChecklistItem[] }) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const next = new Set(checkedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setCheckedIds(next);
  };

  const completedCount = checkedIds.size;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Group items by category
  const grouped: Record<string, ChecklistItem[]> = {};
  items.forEach((item) => {
    const cat = item.category || "General";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  return (
    <div className="p-8 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-indigo-500" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Grant Application Document Readiness Checklist
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive document preparation tracker for central and state government grant applications.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-1.5 self-start sm:self-auto print:hidden"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>Print Checklist</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-slate-700 dark:text-slate-300">
            Document Readiness Progress: {completedCount} of {totalCount} completed
          </span>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">{progressPercent}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist items by category */}
      <div className="space-y-6 pt-2">
        {Object.entries(grouped).map(([category, catItems]) => (
          <div key={category} className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {category}
            </h4>
            <div className="space-y-2">
              {catItems.map((item) => {
                const isChecked = checkedIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isChecked
                        ? "bg-emerald-500/[0.06] border-emerald-500/30 text-slate-900 dark:text-white"
                        : "bg-slate-50/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-indigo-500/40"
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                    <span className={`text-xs sm:text-sm font-medium ${isChecked ? "line-through text-slate-400" : ""}`}>
                      {item.itemText}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
