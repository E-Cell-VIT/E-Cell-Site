import type { Metadata } from "next";
import {
  getPublicSiteSettings,
  getPublicHomepageStats,
  getPublicEvents,
  getPublicStartups,
  getPublicTeamMembers,
  getPublicBlogs,
} from "@/lib/db/public-queries";
import { HomeView } from "@/components/home/home-view";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const siteName = settings?.siteName || "E-Cell VIT Mumbai";
  const tagline = settings?.tagline || "LEARN • BUILD • NETWORK • LEAD";

  return {
    title: `${siteName} | ${tagline}`,
    description:
      settings?.aboutText ||
      "Entrepreneurship Cell of Vidyalankar Institute of Technology, Wadala, Mumbai. Empowering student founders, innovators, pre-incubation, and venture excellence.",
    openGraph: {
      title: `${siteName} | ${tagline}`,
      description: "Official Entrepreneurship Cell of Vidyalankar Institute of Technology, Wadala, Mumbai.",
      images: [settings?.logoUrl || "/logo.svg"],
    },
  };
}

export default async function HomePage() {
  const [
    settings,
    stats,
    featuredEvents,
    allUpcomingEvents,
    featuredStartups,
    mentors,
    facultyAdvisors,
    studentHeads,
    featuredBlogs,
  ] = await Promise.all([
    getPublicSiteSettings(),
    getPublicHomepageStats(),
    getPublicEvents({ featuredOnly: true }),
    getPublicEvents({ status: "Upcoming" }),
    getPublicStartups({ featuredOnly: true }),
    getPublicTeamMembers({ category: "Industry Mentor" }),
    getPublicTeamMembers({ category: "Faculty Advisor" }),
    getPublicTeamMembers({ category: "Student Head" }),
    getPublicBlogs({ featuredOnly: true }),
  ]);

  // Use featured event or fallback to the nearest upcoming event or first event
  const primaryEvent =
    featuredEvents[0] || allUpcomingEvents[0] || (await getPublicEvents())[0] || null;

  // Combine faculty advisors and industry mentors for the Advisory Board
  const combinedAdvisors = [...facultyAdvisors, ...mentors].slice(0, 6);

  return (
    <HomeView
      settings={settings}
      stats={stats}
      featuredEvent={primaryEvent}
      featuredStartups={featuredStartups}
      mentors={combinedAdvisors}
      studentHeads={studentHeads}
      featuredBlogs={featuredBlogs}
    />
  );
}
