import React from "react";
import Link from "next/link";
import { BookOpen, Clock, ArrowRight, User } from "lucide-react";

interface BlogItem {
  id: string;
  title: string;
  slug: string;
  coverImageUrl?: string | null;
  excerpt: string;
  authorName: string;
  authorRole?: string | null;
  tags: string;
  readTimeMinutes: number;
  publishedAt?: Date | string | null;
}

interface FeaturedBlogsSectionProps {
  blogs: BlogItem[];
}

export function FeaturedBlogsSection({ blogs }: FeaturedBlogsSectionProps) {
  if (!blogs || blogs.length === 0) return null;

  return (
    <section className="py-16 md:py-24 border-b border-slate-200/80 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ecosystem Playbooks</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Featured Insights & Guides
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Regulatory breakdowns, grant roadmaps, and founder playbooks written for VIT innovators.
            </p>
          </div>
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 group"
          >
            <span>Read all articles</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

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
                className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-lg hover:border-indigo-500/40 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Tags & Read Time */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap gap-1.5">
                      {blog.tags
                        .split(",")
                        .slice(0, 3)
                        .map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 font-semibold"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                    </div>
                    <span className="flex items-center gap-1 text-slate-400 shrink-0 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{blog.readTimeMinutes} min read</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <Link href={`/blogs/${blog.slug}`}>{blog.title}</Link>
                  </h3>

                  {/* Excerpt */}
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {blog.excerpt}
                  </p>
                </div>

                {/* Author & Footer */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
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
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
