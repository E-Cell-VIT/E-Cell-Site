"use client";

import React, { useState } from "react";
import { SplashIntro } from "@/components/splash-intro";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ConnectModal } from "@/components/layout/connect-modal";
import { HeroSection } from "@/components/home/hero-section";
import { AboutSection } from "@/components/home/about-section";
import { StatsSection } from "@/components/home/stats-section";
import { FeaturedEventSection } from "@/components/home/featured-event-section";
import { FeaturedStartupsSection } from "@/components/home/featured-startups-section";
import { MentorsSection } from "@/components/home/mentors-section";
import { TeamSection } from "@/components/home/team-section";
import { FeaturedBlogsSection } from "@/components/home/featured-blogs-section";
import { ContactSection } from "@/components/home/contact-section";

interface HomeViewProps {
  settings: any;
  stats: {
    automatic: Array<{ id: string; label: string; value: string }>;
    manual: Array<{ label: string; value: string }>;
  };
  featuredEvent: any;
  featuredStartups: any[];
  mentors: any[];
  studentHeads: any[];
  featuredBlogs: any[];
}

export function HomeView({
  settings,
  stats,
  featuredEvent,
  featuredStartups,
  mentors,
  studentHeads,
  featuredBlogs,
}: HomeViewProps) {
  const [replaySplash, setReplaySplash] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  const handleReplayIntro = () => {
    setReplaySplash(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-indigo-500 selection:text-white">
      {/* 1. Intro Splash (Plays on first visit per session, does NOT block rendering) */}
      <SplashIntro
        forceShow={replaySplash}
        onFinish={() => setReplaySplash(false)}
        logoUrl={settings?.logoUrl}
      />

      {/* 2. Global Sticky Navbar */}
      <Navbar
        logoUrl={settings?.logoUrl}
        siteName={settings?.siteName}
        tagline={settings?.tagline}
        onReplayIntro={handleReplayIntro}
      />

      {/* 3. Main Home Page Content (Rendered in exact order 1 to 9) */}
      <main className="flex-1">
        {/* 1. Hero */}
        <HeroSection
          logoUrl={settings?.logoUrl}
          tagline={settings?.tagline}
          heroTitle={settings?.heroTitle}
          heroSubtitle={settings?.heroSubtitle}
          onOpenConnect={() => setConnectModalOpen(true)}
        />

        {/* 2. About E-Cell with Mission and Vision */}
        <AboutSection
          aboutText={settings?.aboutText}
          missionText={settings?.missionText}
          visionText={settings?.visionText}
        />

        {/* 3. Stats Strip */}
        <StatsSection
          automaticStats={stats.automatic}
          manualStats={stats.manual}
        />

        {/* 4. Featured Event */}
        <FeaturedEventSection event={featuredEvent} />

        {/* 5. Featured VIT Startups */}
        <FeaturedStartupsSection startups={featuredStartups} />

        {/* 6. Advisory Board and Mentors */}
        <MentorsSection mentors={mentors} />

        {/* 7. Student Heads / Core Team */}
        <TeamSection studentHeads={studentHeads} />

        {/* 8. Featured Blogs / Insights */}
        <FeaturedBlogsSection blogs={featuredBlogs} />

        {/* 9. Contact Us */}
        <ContactSection
          contactEmail={settings?.contactEmail}
          contactPhone={settings?.contactPhone}
          campusMapUrl={settings?.campusMapUrl}
        />
      </main>

      {/* 4. Global Footer */}
      <Footer
        logoUrl={settings?.logoUrl}
        siteName={settings?.siteName}
        contactEmail={settings?.contactEmail}
        contactPhone={settings?.contactPhone}
        campusMapUrl={settings?.campusMapUrl}
        instagramUrl={settings?.instagramUrl}
        linkedinUrl={settings?.linkedinUrl}
        youtubeUrl={settings?.youtubeUrl}
        twitterUrl={settings?.twitterUrl}
        onReplayIntro={handleReplayIntro}
      />

      {/* Connect With Us Modal */}
      <ConnectModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
      />
    </div>
  );
}
