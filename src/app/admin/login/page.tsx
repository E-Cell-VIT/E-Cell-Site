"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Mail, Loader2, AlertCircle, ArrowLeft, ShieldCheck, Terminal } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      router.push(from);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-background text-foreground relative selection:bg-indigo-500 selection:text-white">
      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Back to site */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Public Website</span>
        </Link>

        {/* Card */}
        <div className="p-8 sm:p-10 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden">
          {/* Brand header */}
          <div className="text-center space-y-3 mb-8">
            <div className="flex justify-center">
              <Image
                src="/logo.svg"
                alt="E-Cell VIT Logo"
                width={200}
                height={50}
                className="h-10 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Admin CMS Portal
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                E-Cell Vidyalankar Institute of Technology, Mumbai
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3.5 text-xs flex items-start gap-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="admin@vit.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Secure Login</span>
                </>
              )}
            </button>
          </form>

          {/* Offline/CLI Help note */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 space-y-2 text-[11px] text-slate-500 dark:text-slate-400 text-center">
            <p className="flex items-center justify-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <Terminal className="w-3.5 h-3.5 text-indigo-500" />
              <span>Offline-Friendly Local Authentication</span>
            </p>
            <p className="leading-relaxed">
              First time setup? Run <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 font-mono text-[10px] text-indigo-600 dark:text-indigo-300 font-bold">npm run create-admin</code> in your terminal.
            </p>
            <p className="leading-relaxed">
              Locked out? Run <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 font-mono text-[10px] text-indigo-600 dark:text-indigo-300 font-bold">npm run reset-admin-password</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
