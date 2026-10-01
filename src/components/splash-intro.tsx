"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

interface SplashIntroProps {
  forceShow?: boolean;
  onFinish?: () => void;
  logoUrl?: string | null;
}

export function SplashIntro({
  forceShow = false,
  onFinish,
  logoUrl,
}: SplashIntroProps) {
  const [visible, setVisible] = useState(false);
  const displayLogo = logoUrl || "/logo.svg";

  useEffect(() => {
    // If forced to replay, show immediately
    if (forceShow) {
      setVisible(true);
      return;
    }

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setVisible(false);
      onFinish?.();
      return;
    }

    // Check sessionStorage
    const hasSeenSplash = sessionStorage.getItem("ecell_splash_seen");
    if (!hasSeenSplash) {
      setVisible(true);
    } else {
      onFinish?.();
    }
  }, [forceShow, onFinish]);

  useEffect(() => {
    if (!visible) return;

    // Auto-dismiss after 3.8 seconds
    const timer = setTimeout(() => {
      dismissSplash();
    }, 3800);

    return () => clearTimeout(timer);
  }, [visible]);

  const dismissSplash = () => {
    sessionStorage.setItem("ecell_splash_seen", "true");
    setVisible(false);
    onFinish?.();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20, transition: { duration: 0.8, ease: "easeInOut" } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070A12] text-white overflow-hidden pointer-events-auto"
        >
          {/* Ambient Lighting Gradients */}
          <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-amber-500/15 blur-[120px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-600/10 blur-[150px] pointer-events-none" />

          {/* Always Visible Skip Button */}
          <div className="absolute top-6 right-6 z-20">
            <button
              onClick={dismissSplash}
              type="button"
              className="group flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full border border-white/10 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white backdrop-blur-md transition-all shadow-lg active:scale-95"
            >
              <span>Skip Intro</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Center Brand Animation Sequence */}
          <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-xl">
            {/* Animated Logo Container */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 1.0, ease: "easeOut" }}
              className="relative p-6 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl mb-6"
            >
              <Image
                src={displayLogo}
                alt="E-Cell VIT Mumbai"
                width={360}
                height={90}
                priority
                className="h-16 sm:h-20 w-auto object-contain"
              />
            </motion.div>

            {/* Tagline Reveal */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="space-y-3"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Entrepreneurship Cell • VIT Wadala</span>
              </div>

              <motion.h1
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4, duration: 0.7 }}
                className="text-lg sm:text-2xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400"
              >
                LEARN • BUILD • NETWORK • LEAD
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.0, duration: 0.6 }}
                className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto"
              >
                Empowering student innovators and founders from classroom to commercial venture.
              </motion.p>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              className="mt-8 w-48 h-1 rounded-full bg-white/10 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 via-amber-500 to-cyan-400"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3.4, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
