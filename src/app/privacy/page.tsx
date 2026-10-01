import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getPublicSiteSettings } from "@/lib/db/public-queries";
import { Shield, Sparkles, ArrowRight, Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Privacy Policy | E-Cell VIT Mumbai",
    description: "Official Privacy Policy of E-Cell VIT Mumbai covering personal data collection, pitch deck confidentiality, retention rules, and data subject rights.",
  };
}

export default async function PrivacyPage() {
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
              <Shield className="w-3.5 h-3.5" />
              <span>Data Protection & Privacy</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Last updated: October 2026 • Effective for E-Cell Vidyalankar Institute of Technology, Wadala, Mumbai
            </p>
          </div>

          <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-xl space-y-8 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                1. Information We Collect
              </h2>
              <p>
                The Entrepreneurship Cell (E-Cell) of Vidyalankar Institute of Technology collects only data required to facilitate student mentorship, event participation, incubation cohorts, and official inquiries:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li><strong>Public Inquiries & Connect Requests:</strong> Full name, email address, optional phone number, institutional role (student, alumni, mentor, investor), and message details.</li>
                <li><strong>Incubation Applications:</strong> Startup name, founder names, contact details, academic department and graduation batch, venture domain, stage of maturity, and uploaded PDF pitch decks.</li>
                <li><strong>Technical Logs:</strong> IP address and browser user-agent collected solely for rate limiting, bot protection, and access audit verification.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                2. Pitch Deck Confidentiality & Access Control
              </h2>
              <p>
                We recognize that startup pitch decks contain sensitive intellectual property and proprietary trade concepts. E-Cell VIT enforces strict technical safeguards:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>Pitch decks are stored on an isolated private storage filesystem (`./storage/private/`) that is never indexed, cached, or served through public web routes.</li>
                <li>Access is restricted exclusively to authenticated E-Cell administrators and assigned faculty evaluation panelists.</li>
                <li>Every download or view event is recorded in an immutable audit log storing the reviewer identity and timestamp.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                3. Purpose of Processing & Data Retention
              </h2>
              <p>
                We do not sell, rent, or monetize personal information. Data is used exclusively to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>Evaluate incubation cohort eligibility and organize mentoring clinics.</li>
                <li>Respond to sponsorship, speaker, and partnership requests.</li>
                <li>Maintain historical records of university startup alumni.</li>
              </ul>
              <p className="text-xs pt-1">
                Data is retained for the duration of the applicant's academic cycle or active venture incubation, after which archived contact records can be purged upon request.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                4. Your Privacy Rights & Data Deletion
              </h2>
              <p>
                You have the right to inspect, correct, or request the deletion of your personal data or pitch deck submissions at any time without penalty.
              </p>
              <div className="pt-2">
                <Link
                  href="/privacy-request"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Submit Data Privacy Request</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </section>

            <section className="space-y-3 border-t border-slate-200 dark:border-white/10 pt-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                5. Contact the Data Custodian
              </h2>
              <p className="text-xs">
                For questions regarding data practices or institutional governance:
              </p>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                E-Cell Data Desk • Vidyalankar Institute of Technology, Wadala, Mumbai 400037 • Email: ecell@vit.edu.in
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
