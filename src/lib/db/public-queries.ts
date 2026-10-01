import { prisma } from "./client";

/**
 * PUBLIC DATA-ACCESS LAYER
 * 
 * Strict Guarantees:
 * 1. Only records with publicationStatus = 'Published' are queried.
 * 2. Never joins or queries private tables (startup_private, incubation_applications, leads, etc.).
 * 3. Never selects sensitive columns (verificationNote, internalNotes, passwordHash, etc.).
 * 4. Safe for direct use in public server components and public API endpoints.
 */

export async function getPublicSiteSettings() {
  const settings = await prisma.siteSetting.findUnique({
    where: { id: "default" },
    select: {
      siteName: true,
      tagline: true,
      logoUrl: true,
      aboutText: true,
      missionText: true,
      visionText: true,
      contactEmail: true,
      contactPhone: true,
      instagramUrl: true,
      linkedinUrl: true,
      youtubeUrl: true,
      twitterUrl: true,
      campusMapUrl: true,
      heroTitle: true,
      heroSubtitle: true,
      manualStats: true,
      outdatedGrantThresholdDays: true,
    },
  });

  return settings;
}

export async function getPublicStartups(params?: {
  domain?: string;
  status?: string;
  search?: string;
  featuredOnly?: boolean;
}) {
  const where: Record<string, unknown> = {
    publicationStatus: "Published",
  };

  if (params?.featuredOnly) {
    where.isFeatured = true;
  }

  if (params?.domain && params.domain !== "all") {
    where.domain = params.domain;
  }

  if (params?.status && params.status !== "all") {
    where.startupStatus = params.status;
  }

  if (params?.search && params.search.trim()) {
    const q = params.search.trim();
    where.OR = [
      { name: { contains: q } },
      { oneLineSummary: { contains: q } },
      { fullDescription: { contains: q } },
      { domain: { contains: q } },
    ];
  }

  const startups = await prisma.startup.findMany({
    where,
    orderBy: [{ isFeatured: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      domain: true,
      oneLineSummary: true,
      logoUrl: true,
      websiteUrl: true,
      linkedinUrl: true,
      twitterUrl: true,
      startupStatus: true,
      isFeatured: true,
      founderPublicInfo: true,
      msmeStatus: true,
      msmeNumber: true,
      showMsmeNumber: true,
      dpiitStatus: true,
      dpiitNumber: true,
      showDpiitNumber: true,
      isEcellVerified: true,
      isMsmeVerified: true,
      isDpiitVerified: true,
    },
  });

  // Mask registration numbers if show toggle is false
  return startups.map((s) => ({
    ...s,
    msmeNumber: s.showMsmeNumber ? s.msmeNumber : null,
    dpiitNumber: s.showDpiitNumber ? s.dpiitNumber : null,
  }));
}

export async function getPublicStartupBySlug(slug: string) {
  const startup = await prisma.startup.findFirst({
    where: {
      slug,
      publicationStatus: "Published",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      domain: true,
      oneLineSummary: true,
      fullDescription: true,
      logoUrl: true,
      websiteUrl: true,
      linkedinUrl: true,
      twitterUrl: true,
      startupStatus: true,
      isFeatured: true,
      founderPublicInfo: true,
      msmeStatus: true,
      msmeNumber: true,
      showMsmeNumber: true,
      dpiitStatus: true,
      dpiitNumber: true,
      showDpiitNumber: true,
      isEcellVerified: true,
      isMsmeVerified: true,
      isDpiitVerified: true,
      verifiedBy: true,
      verifiedAt: true,
      createdAt: true,
      // NOTE: verificationNote is explicitly OMITTED. It is private.
    },
  });

  if (!startup) return null;

  return {
    ...startup,
    msmeNumber: startup.showMsmeNumber ? startup.msmeNumber : null,
    dpiitNumber: startup.showDpiitNumber ? startup.dpiitNumber : null,
  };
}

export async function getPublicEvents(params?: {
  category?: string;
  status?: string;
  year?: string;
  search?: string;
  featuredOnly?: boolean;
}) {
  const where: Record<string, unknown> = {
    publicationStatus: "Published",
  };

  if (params?.featuredOnly) {
    where.isFeatured = true;
  }

  if (params?.category && params.category !== "all") {
    where.category = params.category;
  }

  if (params?.status && params.status !== "all") {
    where.eventStatus = params.status;
  }

  if (params?.search && params.search.trim()) {
    const q = params.search.trim();
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { venue: { contains: q } },
    ];
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: [{ isFeatured: "desc" }, { eventDate: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      coverImageUrl: true,
      eventDate: true,
      venue: true,
      category: true,
      eventStatus: true,
      isFeatured: true,
      description: true,
      reportPdfUrl: true,
      registrationUrl: true,
    },
  });

  if (params?.year && params.year !== "all") {
    const yr = parseInt(params.year, 10);
    return events.filter((e) => new Date(e.eventDate).getFullYear() === yr);
  }

  return events;
}

export async function getPublicEventBySlug(slug: string) {
  const event = await prisma.event.findFirst({
    where: {
      slug,
      publicationStatus: "Published",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      coverImageUrl: true,
      eventDate: true,
      venue: true,
      category: true,
      eventStatus: true,
      description: true,
      reportPdfUrl: true,
      registrationUrl: true,
      photos: {
        orderBy: { displayOrder: "asc" },
        select: {
          id: true,
          photoUrl: true,
          caption: true,
        },
      },
      winners: {
        orderBy: { rank: "asc" },
        select: {
          id: true,
          rank: true,
          teamName: true,
          projectTitle: true,
          prize: true,
        },
      },
    },
  });

  return event;
}

export async function getPublicBlogs(params?: { search?: string; tag?: string; featuredOnly?: boolean }) {
  const where: Record<string, unknown> = {
    publicationStatus: "Published",
  };

  if (params?.featuredOnly) {
    where.isFeatured = true;
  }

  if (params?.search && params.search.trim()) {
    const q = params.search.trim();
    where.OR = [
      { title: { contains: q } },
      { excerpt: { contains: q } },
      { authorName: { contains: q } },
      { tags: { contains: q } },
    ];
  }

  const blogs = await prisma.blog.findMany({
    where,
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      coverImageUrl: true,
      excerpt: true,
      authorName: true,
      authorRole: true,
      tags: true,
      readTimeMinutes: true,
      publishedAt: true,
    },
  });

  if (params?.tag && params.tag !== "all") {
    return blogs.filter((b) =>
      b.tags.toLowerCase().includes(params.tag!.toLowerCase())
    );
  }

  return blogs;
}

export async function getPublicBlogBySlug(slug: string) {
  const blog = await prisma.blog.findFirst({
    where: {
      slug,
      publicationStatus: "Published",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      coverImageUrl: true,
      excerpt: true,
      content: true,
      authorName: true,
      authorRole: true,
      authorBio: true,
      tags: true,
      readTimeMinutes: true,
      publishedAt: true,
    },
  });

  return blog;
}

export async function getPublicGrants(params?: {
  sector?: string;
  stage?: string;
  agency?: string;
  search?: string;
}) {
  const where: Record<string, unknown> = {
    publicationStatus: "Published",
  };

  if (params?.sector && params.sector !== "all") {
    where.sector = params.sector;
  }

  if (params?.stage && params.stage !== "all") {
    where.stage = params.stage;
  }

  if (params?.agency && params.agency !== "all") {
    where.agency = params.agency;
  }

  if (params?.search && params.search.trim()) {
    const q = params.search.trim();
    where.OR = [
      { schemeName: { contains: q } },
      { agency: { contains: q } },
      { eligibility: { contains: q } },
      { sector: { contains: q } },
    ];
  }

  const grants = await prisma.grant.findMany({
    where,
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      schemeName: true,
      slug: true,
      agency: true,
      sector: true,
      stage: true,
      fundingRange: true,
      eligibility: true,
      applicationWindow: true,
      officialSourceUrl: true,
      sourceTitle: true,
      deadlineType: true,
      deadlineAt: true,
      lastVerifiedAt: true,
      verifiedBy: true,
    },
  });

  return grants;
}

export async function getPublicGrantChecklist(grantId?: string) {
  const items = await prisma.grantChecklistItem.findMany({
    where: {
      isActive: true,
      ...(grantId ? { grantId } : {}),
    },
    orderBy: [{ category: "asc" }, { displayOrder: "asc" }],
    select: {
      id: true,
      grantId: true,
      itemText: true,
      category: true,
      displayOrder: true,
    },
  });

  return items;
}

export async function getPublicTeamMembers(params?: {
  category?: string;
  academicYear?: string;
}) {
  const where: Record<string, unknown> = {
    publicationStatus: "Published",
  };

  if (params?.category && params.category !== "all") {
    where.category = params.category;
  }

  if (params?.academicYear && params.academicYear !== "all") {
    where.academicYear = params.academicYear;
  } else {
    // Default to current members
    where.isCurrent = true;
  }

  const members = await prisma.teamMember.findMany({
    where,
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      photoUrl: true,
      designation: true,
      organisation: true,
      linkedinUrl: true,
      category: true,
      academicYear: true,
      isCurrent: true,
    },
  });

  return members;
}

export async function getPublicTeamAcademicYears() {
  const years = await prisma.teamMember.findMany({
    where: { publicationStatus: "Published" },
    select: { academicYear: true },
    distinct: ["academicYear"],
    orderBy: { academicYear: "desc" },
  });

  return years.map((y) => y.academicYear);
}

export async function getPublicCategories(type?: string) {
  const where: Record<string, unknown> = {
    isArchived: false,
  };

  if (type) {
    where.type = type;
  }

  return prisma.category.findMany({
    where,
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
    },
  });
}

/**
 * Computes homepage statistics:
 * Automatic stats (calculated dynamically from SQLite):
 * - Active startups: Count of published startups with startupStatus = "Currently Working"
 * - Events held: Count of published events with eventStatus = "Past"
 * - Mentors: Count of published team members in "Industry Mentor" or "Faculty Advisor"
 * Combined with manual stats stored in SiteSettings.
 */
export async function getPublicHomepageStats() {
  const [activeStartupsCount, eventsHeldCount, mentorsCount, settings] = await Promise.all([
    prisma.startup.count({
      where: {
        publicationStatus: "Published",
        startupStatus: "Currently Working",
      },
    }),
    prisma.event.count({
      where: {
        publicationStatus: "Published",
        eventStatus: "Past",
      },
    }),
    prisma.teamMember.count({
      where: {
        publicationStatus: "Published",
        category: { in: ["Industry Mentor", "Faculty Advisor"] },
      },
    }),
    getPublicSiteSettings(),
  ]);

  let manualStats: Array<{ label: string; value: string }> = [];
  try {
    if (settings?.manualStats) {
      manualStats = JSON.parse(settings.manualStats);
    }
  } catch {
    manualStats = [];
  }

  return {
    automatic: [
      { id: "active_startups", label: "Active Startups", value: String(activeStartupsCount) },
      { id: "events_held", label: "Events & Workshops Held", value: String(eventsHeldCount) },
      { id: "mentors", label: "Advisors & Industry Mentors", value: String(mentorsCount) },
    ],
    manual: manualStats,
  };
}
