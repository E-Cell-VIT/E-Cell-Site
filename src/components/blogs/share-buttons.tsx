"use client";

import React, { useState } from "react";
import { Copy, Check, MessageCircle } from "lucide-react";
import { LinkedInIcon, TwitterXIcon } from "@/components/icons/social-icons";

export function BlogShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getShareUrl = () => (typeof window !== "undefined" ? window.location.href : "");

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400 font-semibold mr-1">Share:</span>

      {/* Copy Link */}
      <button
        type="button"
        onClick={handleCopy}
        className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
        title="Copy article link"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-500">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Copy Link</span>
          </>
        )}
      </button>

      {/* WhatsApp */}
      <a
        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
          `${title} - Read more on E-Cell VIT Mumbai: ${getShareUrl()}`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:border-emerald-500 hover:text-emerald-500 text-slate-600 dark:text-slate-300 transition-colors"
        title="Share to WhatsApp"
      >
        <MessageCircle className="w-4 h-4 text-emerald-500" />
      </a>

      {/* LinkedIn */}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          getShareUrl()
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:border-blue-500 hover:text-blue-500 text-slate-600 dark:text-slate-300 transition-colors"
        title="Share on LinkedIn"
      >
        <LinkedInIcon className="w-4 h-4 text-blue-500" />
      </a>

      {/* X / Twitter */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
          `${title} by @ecell_vit`
        )}&url=${encodeURIComponent(getShareUrl())}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-800 dark:hover:border-white text-slate-600 dark:text-slate-300 transition-colors"
        title="Share on X"
      >
        <TwitterXIcon className="w-4 h-4" />
      </a>
    </div>
  );
}
