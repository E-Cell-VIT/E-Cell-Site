"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  Shield,
  FileText,
  RotateCcw,
  Sparkles,
  Lock,
} from "lucide-react";

interface FooterProps {
  logoUrl?: string | null;
  siteName?: string;
  contactEmail?: string;
  contactPhone?: string;
  campusMapUrl?: string;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
  youtubeUrl?: string | null;
  twitterUrl?: string | null;
  onReplayIntro?: () => void;
}

export function Footer({
  logoUrl,
  siteName = "E-Cell VIT Mumbai",
  contactEmail = "ecell@vit.edu.in",
  contactPhone = "+91 22 2416 1126",
  campusMapUrl = "https://maps.google.com/?q=Vidyalankar+Institute+of+Technology+Wadala+Mumbai",
  instagramUrl = "https://instagram.com/ecell_vit",
  linkedinUrl = "https://linkedin.com/company/ecell-vit-mumbai",
  youtubeUrl = "https://youtube.com/@ecellvit",
  twitterUrl = "https://x.com/ecell_vit",
  onReplayIntro,
}: FooterProps) {
  const displayLogo = logoUrl || "/logo.svg";

  return (
    <footer className="border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#060810] text-slate-600 dark:text-slate-400 text-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Col 1: Brand & Tagline */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src={displayLogo}
                alt={`${siteName} Logo`}
                width={220}
                height={55}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-xs uppercase tracking-widest font-bold text-amber-500 dark:text-amber-400">
              LEARN • BUILD • NETWORK • LEAD
            </p>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 max-w-sm">
              The official Entrepreneurship Cell of Vidyalankar Institute of Technology,
              Wadala, Mumbai. Empowering student innovators from idea validation to incubation and venture capital.
            </p>

            {/* Plain Link to Campus Maps (Offline-friendly, no embed) */}
            <div className="pt-2">
              <a
                href={campusMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 hover:border-indigo-500 text-slate-700 dark:text-slate-200 transition-all hover:shadow-sm"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>View VIT Campus on Google Maps</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Navigation
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Events & Conclaves
                </Link>
              </li>
              <li>
                <Link href="/startups" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  VIT Startups Directory
                </Link>
              </li>
              <li>
                <Link href="/grants" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Government Grants (SISFS / BIG)
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Founder Insights & Playbooks
                </Link>
              </li>
              <li>
                <Link href="/team" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Advisory & Student Council
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Trust */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Legal & Privacy
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <Shield className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Terms of Use</span>
                </Link>
              </li>
              <li>
                <Link href="/privacy-request" className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Exercise Privacy Rights</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-slate-400">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Admin CMS Login</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Official Contact & Socials */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Official Contact
            </h3>
            <div className="space-y-2 text-xs">
              <a
                href={`mailto:${contactEmail}`}
                className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="truncate">{contactEmail}</span>
              </a>
              <a
                href={`tel:${contactPhone}`}
                className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>{contactPhone}</span>
              </a>
              <p className="text-slate-500 text-[11px] pt-1">
                Vidyalankar Educational Campus, Vidyalankar College Marg, Wadala (East), Mumbai 400037
              </p>
            </div>

            {/* Social Links */}
            <div className="pt-2 flex items-center gap-2.5">
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-white/10 hover:border-pink-500 hover:text-pink-500 transition-colors"
                  aria-label="Instagram"
                >
                  <span className="font-bold text-xs">IG</span>
                </a>
              )}
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-white/10 hover:border-blue-500 hover:text-blue-500 transition-colors"
                  aria-label="LinkedIn"
                >
                  <span className="font-bold text-xs">IN</span>
                </a>
              )}
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-white/10 hover:border-red-500 hover:text-red-500 transition-colors"
                  aria-label="YouTube"
                >
                  <span className="font-bold text-xs">YT</span>
                </a>
              )}
              {twitterUrl && (
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-white/10 hover:border-sky-400 hover:text-sky-400 transition-colors"
                  aria-label="X (formerly Twitter)"
                >
                  <span className="font-bold text-xs">𝕏</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} E-Cell VIT Mumbai. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {onReplayIntro && (
              <button
                type="button"
                onClick={onReplayIntro}
                className="flex items-center gap-1.5 hover:text-indigo-500 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Intro</span>
              </button>
            )}
            <span className="text-slate-400">•</span>
            <span>Local Instance (Offline Capable)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
