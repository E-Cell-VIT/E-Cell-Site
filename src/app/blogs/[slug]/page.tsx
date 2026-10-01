import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getPublicBlogBySlug, getPublicBlogs, getPublicSiteSettings } from "@/lib/db/public-queries";
import { ArrowLeft, Clock, User, Share2, Tag, BookOpen } from "lucide-react";
import { LinkedInIcon, TwitterXIcon } from "@/components/icons/social-icons";
import { BlogShareButtons } from "@/components/blogs/share-buttons";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getPublicBlogBySlug(slug);

  if (!blog) {
    return { title: "Article Not Found | E-Cell VIT Mumbai" };
  }

  return {
    title: `${blog.title} | E-Cell VIT Insights`,
    description: blog.excerpt,
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [settings, blog, recentBlogs] = await Promise.all([
    getPublicSiteSettings(),
    getPublicBlogBySlug(slug),
    getPublicBlogs(),
  ]);

  if (!blog) {
    notFound();
  }

  const relatedBlogs = recentBlogs.filter((b) => b.slug !== blog.slug).slice(0, 2);

  const dateStr = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Recently Published";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-indigo-500 selection:text-white">
      <Navbar
        logoUrl={settings?.logoUrl}
        siteName={settings?.siteName}
        tagline={settings?.tagline}
      />

      <main className="flex-1 py-12 md:py-20">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Insights & Playbooks</span>
          </Link>

          {/* Article Header */}
          <header className="space-y-6 mb-12">
            <div className="flex flex-wrap items-center gap-2">
              {blog.tags.split(",").map((t, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20"
                >
                  {t.trim()}
                </span>
              ))}
              <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto">
                <Clock className="w-3.5 h-3.5" />
                <span>{blog.readTimeMinutes} min read</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {blog.title}
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {blog.excerpt}
            </p>

            {/* Author info and Share */}
            <div className="pt-6 border-t border-b border-slate-200 dark:border-white/10 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {blog.authorName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    {blog.authorRole && <span>{blog.authorRole} • </span>}
                    <span>{dateStr}</span>
                  </div>
                </div>
              </div>

              {/* Share buttons */}
              <BlogShareButtons title={blog.title} />
            </div>
          </header>

          {/* Article Body */}
          <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-xl prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed space-y-6">
            <div className="whitespace-pre-line text-base sm:text-lg">
              {blog.content}
            </div>
          </div>

          {/* Author Bio Card */}
          {blog.authorBio && (
            <div className="mt-12 p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white flex items-center justify-center font-black shrink-0">
                {blog.authorName.charAt(1) || "A"}
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase font-bold tracking-wider text-indigo-500">
                  About the Author
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {blog.authorName}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {blog.authorBio}
                </p>
              </div>
            </div>
          )}

          {/* Related Articles */}
          {relatedBlogs.length > 0 && (
            <div className="mt-16 pt-10 border-t border-slate-200 dark:border-white/10 space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                <span>Related Insights & Guides</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedBlogs.map((rel) => (
                  <div
                    key={rel.id}
                    className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 hover:border-indigo-500/40 transition-colors"
                  >
                    <span className="text-xs text-slate-400 block mb-2 font-medium">
                      {rel.readTimeMinutes} min read
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white hover:text-indigo-500 transition-colors mb-2">
                      <Link href={`/blogs/${rel.slug}`}>{rel.title}</Link>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {rel.excerpt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
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
