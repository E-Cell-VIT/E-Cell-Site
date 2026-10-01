import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getPublicEventBySlug, getPublicSiteSettings } from "@/lib/db/public-queries";
import {
  Calendar,
  MapPin,
  Tag,
  ArrowLeft,
  Trophy,
  FileDown,
  ExternalLink,
  Award,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);

  if (!event) {
    return { title: "Event Not Found | E-Cell VIT Mumbai" };
  }

  return {
    title: `${event.title} | E-Cell VIT Mumbai`,
    description: event.description.slice(0, 160),
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [settings, event] = await Promise.all([
    getPublicSiteSettings(),
    getPublicEventBySlug(slug),
  ]);

  if (!event) {
    notFound();
  }

  const dateObj = new Date(event.eventDate);
  const formattedDate = dateObj.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-indigo-500 selection:text-white">
      <Navbar
        logoUrl={settings?.logoUrl}
        siteName={settings?.siteName}
        tagline={settings?.tagline}
      />

      <main className="flex-1 py-12 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Events Archive</span>
          </Link>

          {/* Event Header Banner */}
          <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-2xl mb-12 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                {event.category}
              </span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  event.eventStatus === "Upcoming"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10"
                }`}
              >
                {event.eventStatus}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {event.title}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-sm text-slate-600 dark:text-slate-300 border-t border-slate-200/60 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <div>
                  <span className="block text-xs text-slate-400 font-semibold">Date & Time</span>
                  <span>{formattedDate} (IST)</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-rose-500" />
                <div>
                  <span className="block text-xs text-slate-400 font-semibold">Venue</span>
                  <span>{event.venue}</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              {event.registrationUrl && event.eventStatus === "Upcoming" && (
                <a
                  href={event.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-600/25 flex items-center gap-2"
                >
                  <span>Register for Event</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              {event.reportPdfUrl && (
                <a
                  href={event.reportPdfUrl}
                  download
                  className="px-5 py-3 rounded-xl font-semibold text-sm border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 hover:border-indigo-500 text-slate-800 dark:text-slate-200 flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4 text-rose-500" />
                  <span>Download Event Report (PDF)</span>
                </a>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-4 mb-16">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              About This Initiative
            </h2>
            <div className="p-8 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 leading-relaxed text-slate-700 dark:text-slate-300 text-base">
              {event.description}
            </div>
          </div>

          {/* Winners Podium (If competition with winners) */}
          {event.winners && event.winners.length > 0 && (
            <div className="space-y-6 mb-16">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-500" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Winners Podium
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {event.winners.map((winner) => {
                  const medalColors =
                    winner.rank === 1
                      ? "from-amber-400 to-yellow-600 text-amber-950"
                      : winner.rank === 2
                      ? "from-slate-300 to-slate-400 text-slate-950"
                      : "from-amber-600 to-amber-800 text-white";

                  return (
                    <div
                      key={winner.id}
                      className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-lg relative overflow-hidden text-center space-y-3"
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center font-black text-lg bg-gradient-to-tr ${medalColors} shadow-md`}
                      >
                        #{winner.rank}
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {winner.teamName}
                      </h3>

                      <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-white/[0.03] text-xs">
                        <span className="block font-semibold text-slate-400 mb-0.5">
                          Project Title
                        </span>
                        <span className="text-slate-700 dark:text-slate-200 font-medium">
                          {winner.projectTitle}
                        </span>
                      </div>

                      <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold">
                        Prize: {winner.prize}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Photo Gallery with Lightbox */}
          {event.photos && event.photos.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Event Photo Gallery
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {event.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative rounded-2xl overflow-hidden glass-panel border border-slate-200 dark:border-white/10 aspect-video flex items-center justify-center bg-slate-100 dark:bg-white/5"
                  >
                    <img
                      src={photo.photoUrl}
                      alt={photo.caption || event.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {photo.caption && (
                      <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/80 to-transparent text-[11px] text-white">
                        {photo.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
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
