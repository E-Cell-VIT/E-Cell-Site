"use client";

import React, { useState } from "react";
import {
  Download,
  Database,
  FileSpreadsheet,
  FileCode,
  HardDrive,
  Terminal,
  Copy,
  Check,
  Shield,
  Layers,
  Calendar,
  Users,
  Inbox,
  FileText,
  Coins,
} from "lucide-react";

interface ExportCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  typeKey: string;
}

function ExportCard({ title, description, icon: Icon, typeKey }: ExportCardProps) {
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [downloadingJson, setDownloadingJson] = useState(false);

  const handleDownload = (format: "csv" | "json") => {
    if (format === "csv") setDownloadingCsv(true);
    else setDownloadingJson(true);

    window.location.href = `/api/admin/export?type=${typeKey}&format=${format}`;

    setTimeout(() => {
      setDownloadingCsv(false);
      setDownloadingJson(false);
    }, 1500);
  };

  return (
    <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-neutral-800 rounded-lg text-brand-teal">
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-white text-base">{title}</h3>
        </div>
        <p className="text-xs text-neutral-400 mb-4">{description}</p>
      </div>

      <div className="flex gap-2 pt-2 border-t border-neutral-800/60">
        <button
          onClick={() => handleDownload("csv")}
          disabled={downloadingCsv}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 rounded-lg transition-colors border border-neutral-700 disabled:opacity-50"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          {downloadingCsv ? "Exporting..." : "CSV"}
        </button>
        <button
          onClick={() => handleDownload("json")}
          disabled={downloadingJson}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 rounded-lg transition-colors border border-neutral-700 disabled:opacity-50"
        >
          <FileCode className="w-3.5 h-3.5 text-blue-400" />
          {downloadingJson ? "Exporting..." : "JSON"}
        </button>
      </div>
    </div>
  );
}

export function ExportAdminClient() {
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [copiedRestore, setCopiedRestore] = useState(false);

  const copyToClipboard = (text: string, isBackup: boolean) => {
    navigator.clipboard.writeText(text);
    if (isBackup) {
      setCopiedBackup(true);
      setTimeout(() => setCopiedBackup(false), 2000);
    } else {
      setCopiedRestore(true);
      setTimeout(() => setCopiedRestore(false), 2000);
    }
  };

  const exportEntities = [
    {
      title: "Startups & Ventures",
      description: "All registered student and alumni ventures, verification badges, and private founder details.",
      icon: Layers,
      typeKey: "startups",
    },
    {
      title: "Events & Workshops",
      description: "Summit schedules, speaker sessions, hackathons, and podium winner team rosters.",
      icon: Calendar,
      typeKey: "events",
    },
    {
      title: "Inquiries & Leads",
      description: "Connect modal inquiries, student messages, mentor/investor engagement requests.",
      icon: Inbox,
      typeKey: "leads",
    },
    {
      title: "Incubation Cohort Applications",
      description: "Detailed pitch applications, founder contacts, stage, and pitch deck filenames.",
      icon: Database,
      typeKey: "applications",
    },
    {
      title: "Articles & Editorial",
      description: "Published and draft educational blogs, author credits, tags, and reading times.",
      icon: FileText,
      typeKey: "blogs",
    },
    {
      title: "Grants & Funding Schemes",
      description: "Government and institutional funding schemes, eligibility rules, and checklists.",
      icon: Coins,
      typeKey: "grants",
    },
    {
      title: "Team & Leadership Directory",
      description: "Faculty advisors, mentors, current student council heads, and past alumni cohorts.",
      icon: Users,
      typeKey: "team",
    },
    {
      title: "Security Audit Logs",
      description: "Tamper-evident record of all administrative actions with redacted values.",
      icon: Shield,
      typeKey: "audit_logs",
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Download className="w-6 h-6 text-brand-teal" />
          Data Export & Full System Backup
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Export administrative datasets to CSV and JSON formats, or create encrypted local disk backups.
        </p>
      </div>

      {/* Grid of export cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {exportEntities.map((item) => (
          <ExportCard key={item.typeKey} {...item} />
        ))}
      </div>

      {/* CLI Full Backup & Restore Panel */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-neutral-800 rounded-xl text-brand-gold">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Full Local System Backup (CLI)</h2>
            <p className="text-xs text-neutral-400">
              Backs up the entire SQLite database (<code>./data/ecell.db</code>) and local storage (<code>./storage/</code>) into a single timestamped zip file in <code>./backups/</code>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-neutral-950 rounded-xl p-4 border border-neutral-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-neutral-300">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-brand-teal" /> Run Full Backup
              </span>
              <button
                onClick={() => copyToClipboard("npm run backup", true)}
                className="text-neutral-400 hover:text-white flex items-center gap-1"
              >
                {copiedBackup ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedBackup ? "Copied" : "Copy"}
              </button>
            </div>
            <code className="block bg-neutral-900 p-2.5 rounded text-xs text-emerald-400 font-mono">
              npm run backup
            </code>
            <p className="text-[11px] text-neutral-500">
              Creates <code>./backups/ecell-backup-YYYY-MM-DD-HHMMSS.zip</code>
            </p>
          </div>

          <div className="bg-neutral-950 rounded-xl p-4 border border-neutral-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-neutral-300">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-brand-gold" /> Restore from Archive
              </span>
              <button
                onClick={() => copyToClipboard("npm run restore -- backups/<filename>.zip", false)}
                className="text-neutral-400 hover:text-white flex items-center gap-1"
              >
                {copiedRestore ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedRestore ? "Copied" : "Copy"}
              </button>
            </div>
            <code className="block bg-neutral-900 p-2.5 rounded text-xs text-brand-gold font-mono truncate">
              npm run restore -- backups/filename.zip
            </code>
            <p className="text-[11px] text-neutral-500">
              Safely restores database and private uploads with automatic rollback on error.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
