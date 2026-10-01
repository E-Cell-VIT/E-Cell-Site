"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Rocket, Calendar, Building2 } from "lucide-react";

interface HeroSectionProps {
  logoUrl?: string | null;
  tagline?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  onOpenConnect?: () => void;
}

export function HeroSection({
  logoUrl,
  tagline = "LEARN • BUILD • NETWORK • LEAD",
  heroTitle = "Empowering Student Innovators & Founders",
  heroSubtitle = "Vidyalankar Institute of Technology's premier entrepreneurship hub fostering startup excellence, innovation, and leadership.",
  onOpenConnect,
}: HeroSectionProps) {
  const displayLogo = logoUrl || "/logo.svg";

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200/80 dark:border-white/10">
      {/* Background Radial Glow Effects */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-500/15 via-cyan-500/10 to-transparent blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute -top-10 -right-20 w-80 h-80 bg-amber-500/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Animated Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-semibold mb-8 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>Vidyalankar Institute of Technology, Wadala, Mumbai</span>
        </div>

        {/* Dynamic Logo Presentation */}
        <div className="flex justify-center mb-8">
          <div className="p-4 sm:p-6 rounded-3xl glass-panel shadow-2xl hover:scale-105 transition-transform duration-300">
            <Image
              src={displayLogo}
              alt="E-Cell VIT Mumbai Logo"
              width={420}
              height={105}
              priority
              className="h-16 sm:h-20 md:h-24 w-auto object-contain"
            />
          </div>
        </div>

        {/* Tagline */}
        <p className="text-sm sm:text-base font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 dark:from-amber-400 dark:via-rose-400 dark:to-indigo-400 uppercase mb-4">
          {tagline}
        </p>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
          {heroTitle}
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {heroSubtitle}
        </p>

        {/* CTAs (Explore Startups, View Events, Connect) */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/startups"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95"
          >
            <Rocket className="w-4 h-4 text-cyan-300" />
            <span>Explore Startups</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-slate-100 transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>View Events</span>
          </Link>

          {onOpenConnect && (
            <button
              type="button"
              onClick={onOpenConnect}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm border border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 transition-all hover:scale-105 active:scale-95"
            >
              <Building2 className="w-4 h-4" />
              <span>Connect With Us</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
