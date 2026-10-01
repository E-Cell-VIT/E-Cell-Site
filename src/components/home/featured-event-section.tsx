import React from "react";
import Link from "next/link";
import { Calendar, MapPin, Tag, ExternalLink, ArrowRight, Sparkles } from "lucide-react";

interface EventItem {
  id: string;
  title: string;
  slug: string;
  coverImageUrl?: string | null;
  eventDate: Date | string;
  venue: string;
  category: string;
  eventStatus: string;
  isFeatured: boolean;
  description: string;
  registrationUrl?: string | null;
}

interface FeaturedEventSectionProps {
  event: EventItem | null;
}

export function FeaturedEventSection({ event }: FeaturedEventSectionProps) {
  if (!event) return null;

  const eventDateObj = new Date(event.eventDate);
  const formattedDate = eventDateObj.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  return (
    <section className="py-16 md:py-24 border-b border-slate-200/80 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Flagship Initiative</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Featured Event
            </h2>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 group"
          >
            <span>View all events & workshops</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Featured Event Card */}
        <div className="relative rounded-3xl glass-panel p-6 sm:p-10 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual Block / Calendar Callout */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-br from-indigo-900/40 via-indigo-950/20 to-slate-900/40 border border-indigo-500/20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <Calendar className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-1">
                Event Date
              </span>
              <span className="text-2xl font-black text-white">
                {eventDateObj.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
              </span>
              <span className="text-xs text-slate-400 mt-1">
                {eventDateObj.getFullYear()}
              </span>

              <div className="mt-4 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {event.eventStatus === "Upcoming" ? "Upcoming Session" : "Past Event Report"}
              </div>
            </div>

            {/* Event Info */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                  <Tag className="w-3 h-3" />
                  {event.category}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {event.venue}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {event.title}
              </h3>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {event.description}
              </p>

              <div className="pt-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Schedule: </span>
                <strong className="text-slate-700 dark:text-slate-200">{formattedDate} (IST)</strong>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-3">
                <Link
                  href={`/events/${event.slug}`}
                  className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
                >
                  <span>View Event Details & Report</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {event.registrationUrl && event.eventStatus === "Upcoming" && (
                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm border border-slate-300 dark:border-white/10 hover:border-indigo-500 text-slate-800 dark:text-slate-200 transition-all flex items-center gap-1.5"
                  >
                    <span>Register on Portal</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
