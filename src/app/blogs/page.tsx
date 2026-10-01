import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getPublicBlogs, getPublicSiteSettings } from "@/lib/db/public-queries";
import { BookOpen, Clock, Search, ArrowRight, User } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Founder Playbooks & Blogs | E-Cell VIT Mumbai",
    description: "Insights, funding guides, and startup playbooks written for student entrepreneurs at Vidyalankar Institute of Technology, Mumbai.",
  };
}

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; tag?: string }>;
}) {
  const { search, tag } = await searchParams;

  const [settings, blogs] = await Promise.all([
    getPublicSiteSettings(),
    getPublicBlogs({ search, tag }),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-indigo-500 selection:text-white">
      <Navbar
        logoUrl={settings?.logoUrl}
        siteName={settings?.siteName}
        tagline={settings?.tagline}
      />

      <main className="flex-1 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Founder Insights & Research</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              E-Cell Insights & Playbooks
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300">
              In-depth articles covering government seed schemes, incubation criteria, IP protection, and founder lessons.
            </p>
          </div>

          {/* Search bar */}
          <div className="max-w-xl mx-auto mb-12">
            <form method="GET" className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="search"
                defaultValue={search || ""}
                placeholder="Search articles, keywords, topics..."
                className="w-full pl-11 pr-24 py-3 rounded-2xl border border-slate-200 dark:border-white/10 glass-panel text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Search
              </button>
            </form>
          </div>

          {/* Blogs Grid */}
          {blogs.length === 0 ? (
            <div className="py-20 text-center rounded-3xl glass-panel border border-slate-200 dark:border-white/10 max-w-lg mx-auto">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Articles Found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Try searching with different terms or check back soon for newly published playbooks.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {blogs.map((blog) => {
                const dateStr = blog.publishedAt
                  ? new Date(blog.publishedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Recent";

                return (
                  <article
                    key={blog.id}
                    className="flex flex-col justify-between rounded-3xl glass-panel p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-lg hover:border-indigo-500/40 hover:shadow-2xl transition-all duration-300 group"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex flex-wrap gap-1.5">
                          {blog.tags
                            .split(",")
                            .slice(0, 3)
                            .map((t, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 font-semibold"
                              >
                                {t.trim()}
                              </span>
                            ))}
                        </div>
                        <span className="flex items-center gap-1 text-slate-400 shrink-0 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{blog.readTimeMinutes} min read</span>
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        <Link href={`/blogs/${blog.slug}`}>{blog.title}</Link>
                      </h2>

                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                        {blog.excerpt}
                      </p>
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                            {blog.authorName}
                          </span>
                          <span className="text-[10px] text-slate-400 block">{dateStr}</span>
                        </div>
                      </div>

                      <Link
                        href={`/blogs/${blog.slug}`}
                        className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1"
                      >
                        <span>Read Article</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </article>
                );
              })}
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
