import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getPublicSiteSettings } from "@/lib/db/public-queries";
import { FileText, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Terms of Use | E-Cell VIT Mumbai",
    description: "Terms and conditions governing the use of E-Cell VIT Mumbai portal, event registrations, and incubation resources.",
  };
}

export default async function TermsPage() {
  const settings = await getPublicSiteSettings();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-indigo-500 selection:text-white">
      <Navbar
        logoUrl={settings?.logoUrl}
        siteName={settings?.siteName}
        tagline={settings?.tagline}
      />

      <main className="flex-1 py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" />
              <span>Platform Terms</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Terms of Use
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Effective Date: October 2026 • Vidyalankar Institute of Technology, Wadala, Mumbai
            </p>
          </div>

          <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-xl space-y-8 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing this portal or submitting startup profiles, incubation applications, or inquiry requests, you agree to comply with and be bound by these terms. This website is an educational and venture support resource operated under the aegis of Vidyalankar Institute of Technology (VIT).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                2. Government Grants Information Disclaimer
              </h2>
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  Information regarding government grant programs (such as SISFS, BIRAC BIG, DST PRAYAS, or MSInS) is published strictly for informative educational guidance. E-Cell VIT does not administer government funding directly nor guarantee grant approval. Applicants must verify requirements, deadlines, and eligibility criteria on respective official government portals.
                </p>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                3. Intellectual Property Rights of Founders
              </h2>
              <p>
                All student innovators and founders retain complete ownership of their intellectual property, product designs, proprietary source code, and commercial innovations submitted through incubation forms. Participation in E-Cell activities does not grant VIT or E-Cell any equity or copyright in founder intellectual property unless formal incubation contracts are executed.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                4. Code of Conduct
              </h2>
              <p>
                Users interacting with E-Cell events, forums, and competitions agree to maintain academic honesty, refrain from plagiarism or fraudulent credentials, and respect peer founders and industry mentors.
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-200 dark:border-white/10 pt-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                5. Governing Law & Jurisdiction
              </h2>
              <p className="text-xs">
                These terms are governed by the laws of India. Any disputes arising in connection with the platform or university initiatives shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer
        logoUrl={settings?.logoUrl}
        siteName={settings?.siteName}
        contactEmail={settings?.contactEmail}
        contactPhone={settings?.contactPhone}
        campusMapUrl={settings?.campusMapUrl}
      />
    </div>
  );
}
