"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Sparkles, RotateCcw } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ConnectModal } from "@/components/layout/connect-modal";

interface NavbarProps {
  logoUrl?: string | null;
  siteName?: string;
  tagline?: string;
  onReplayIntro?: () => void;
}

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Events", href: "/events" },
  { name: "Startups", href: "/startups" },
  { name: "Blogs", href: "/blogs" },
  { name: "Govt Grants", href: "/grants" },
  { name: "Team", href: "/team" },
];

export function Navbar({
  logoUrl,
  siteName = "E-Cell VIT Mumbai",
  onReplayIntro,
}: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  const displayLogo = logoUrl || "/logo.svg";

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-white/10 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="relative h-12 w-auto min-w-[140px] flex items-center">
              <Image
                src={displayLogo}
                alt={`${siteName} Logo`}
                width={200}
                height={50}
                priority
                className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-500/10 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-white/5"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Replay Intro Button */}
            {onReplayIntro && (
              <button
                type="button"
                onClick={onReplayIntro}
                title="Replay Intro Splash"
                aria-label="Replay intro animation"
                className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            {/* Dark/Light Theme Toggle */}
            <ThemeToggle />

            {/* Connect With Us Modal Trigger */}
            <button
              type="button"
              onClick={() => setConnectModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-200 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Connect With Us</span>
            </button>
          </div>

          {/* Mobile Hamburger & Controls */}
          <div className="flex sm:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-white/10 bg-surface/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-200">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-base font-medium transition-colors ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 font-semibold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setConnectModalOpen(true);
                }}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Connect With Us</span>
              </button>

              {onReplayIntro && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onReplayIntro();
                  }}
                  className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs text-slate-500 flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replay Intro Animation</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Connect Modal */}
      <ConnectModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
      />
    </>
  );
}
