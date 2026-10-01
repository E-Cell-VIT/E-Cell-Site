import { prisma } from "./client";
import { logAdminAction } from "./audit";

/**
 * ADMIN DATA-ACCESS LAYER
 * 
 * Strict Guarantees:
 * 1. Admin operations are logged to audit_logs automatically.
 * 2. Sensitive fields are redacted in audit logging.
 * 3. Supports archive/restore and super_admin permanent delete.
 */

// Overview & Metrics
export async function getAdminOverviewMetrics() {
  const [
    totalLeads,
    unreadLeads,
    activeStartups,
    pendingApplications,
    publishedEvents,
    publishedBlogs,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { isRead: false } }),
    prisma.startup.count({ where: { publicationStatus: "Published", startupStatus: "Currently Working" } }),
    prisma.incubationApplication.count({ where: { status: "Pending" } }),
    prisma.event.count({ where: { publicationStatus: "Published" } }),
    prisma.blog.count({ where: { publicationStatus: "Published" } }),
    prisma.auditLog.findMany({
      take: 10,
      orderBy: { timestamp: "desc" },
    }),
  ]);

  return {
    totalLeads,
    unreadLeads,
    activeStartups,
    pendingApplications,
    publishedEvents,
    publishedBlogs,
    recentAuditLogs,
  };
}

// Leads & Inquiries
export async function getAdminLeads(params?: {
  status?: string;
  source?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 25;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (params?.status && params.status !== "all") {
    where.status = params.status;
  }

  if (params?.source && params.source !== "all") {
    where.source = params.source;
  }

  if (params?.search && params.search.trim()) {
    const q = params.search.trim();
    where.OR = [
      { fullName: { contains: q } },
      { email: { contains: q } },
      { message: { contains: q } },
      { areaOfInterest: { contains: q } },
    ];
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.lead.count({ where }),
  ]);

  return { leads, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function updateLeadStatus(
  id: string,
  data: { status?: string; isRead?: boolean; internalNotes?: string },
  admin: { id: string; email: string }
) {
  const old = await prisma.lead.findUnique({ where: { id } });
  const updated = await prisma.lead.update({
    where: { id },
    data,
  });

  await logAdminAction({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action: "status_change",
    contentType: "Lead",
    recordId: id,
    changedFields: Object.keys(data),
    oldValues: old as unknown as Record<string, unknown>,
    newValues: updated as unknown as Record<string, unknown>,
  });

  return updated;
}

// Incubation Applications
export async function getAdminApplications(params?: {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 25;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (params?.status && params.status !== "all") {
    where.status = params.status;
  }

  if (params?.search && params.search.trim()) {
    const q = params.search.trim();
    where.OR = [
      { startupName: { contains: q } },
      { founderNames: { contains: q } },
      { founderEmail: { contains: q } },
      { domain: { contains: q } },
    ];
  }

  const [applications, total] = await Promise.all([
    prisma.incubationApplication.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        accessLogs: {
          orderBy: { timestamp: "desc" },
          take: 5,
        },
      },
    }),
    prisma.incubationApplication.count({ where }),
  ]);

  return { applications, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function updateApplicationStatus(
  id: string,
  data: { status?: string; internalNotes?: string },
  admin: { id: string; email: string }
) {
  const old = await prisma.incubationApplication.findUnique({ where: { id } });
  const updated = await prisma.incubationApplication.update({
    where: { id },
    data,
  });

  await logAdminAction({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action: "status_change",
    contentType: "IncubationApplication",
    recordId: id,
    changedFields: Object.keys(data),
    oldValues: old as unknown as Record<string, unknown>,
    newValues: updated as unknown as Record<string, unknown>,
  });

  return updated;
}

// Pitch Deck Access Logger
export async function logPitchDeckAccess(
  applicationId: string,
  admin: { id: string; email: string },
  meta?: { ipAddress?: string; userAgent?: string }
) {
  await prisma.pitchDeckAccessLog.create({
    data: {
      applicationId,
      adminUserId: admin.id,
      adminEmail: admin.email,
      ipAddress: meta?.ipAddress || null,
      userAgent: meta?.userAgent || null,
    },
  });
}

// Startups
export async function getAdminStartups(params?: {
  publicationStatus?: string;
  startupStatus?: string;
  search?: string;
}) {
  const where: Record<string, unknown> = {};

  if (params?.publicationStatus && params.publicationStatus !== "all") {
    where.publicationStatus = params.publicationStatus;
  }

  if (params?.startupStatus && params.startupStatus !== "all") {
    where.startupStatus = params.startupStatus;
  }

  if (params?.search && params.search.trim()) {
    const q = params.search.trim();
    where.OR = [
      { name: { contains: q } },
      { domain: { contains: q } },
      { founderPublicInfo: { contains: q } },
    ];
  }

  return prisma.startup.findMany({
    where,
    orderBy: [{ isFeatured: "desc" }, { displayOrder: "asc" }, { updatedAt: "desc" }],
    include: {
      privateDetails: true,
    },
  });
}

export async function getAdminStartupById(id: string) {
  return prisma.startup.findUnique({
    where: { id },
    include: {
      privateDetails: true,
    },
  });
}

export async function createAdminStartup(
  data: {
    name: string;
    slug: string;
    domain: string;
    oneLineSummary: string;
    fullDescription: string;
    logoUrl?: string | null;
    websiteUrl?: string | null;
    linkedinUrl?: string | null;
    twitterUrl?: string | null;
    startupStatus: string;
    publicationStatus: string;
    isFeatured?: boolean;
    founderPublicInfo: string;
    msmeStatus?: string;
    msmeNumber?: string | null;
    showMsmeNumber?: boolean;
    dpiitStatus?: string;
    dpiitNumber?: string | null;
    showDpiitNumber?: boolean;
    isEcellVerified?: boolean;
    isMsmeVerified?: boolean;
    isDpiitVerified?: boolean;
    verifiedBy?: string | null;
    verifiedAt?: Date | null;
    verificationNote?: string | null;
    // Private Details
    founderEmails: string;
    founderPhones: string;
    internalNotes?: string | null;
  },
  admin: { id: string; email: string }
) {
  const { founderEmails, founderPhones, internalNotes, ...publicData } = data;

  const startup = await prisma.startup.create({
    data: {
      ...publicData,
      privateDetails: {
        create: {
          founderEmails,
          founderPhones,
          internalNotes,
        },
      },
    },
    include: {
      privateDetails: true,
    },
  });

  await logAdminAction({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action: "create",
    contentType: "Startup",
    recordId: startup.id,
    newValues: { name: startup.name, slug: startup.slug },
  });

  return startup;
}

export async function updateAdminStartup(
  id: string,
  data: {
    name?: string;
    slug?: string;
    domain?: string;
    oneLineSummary?: string;
    fullDescription?: string;
    logoUrl?: string | null;
    websiteUrl?: string | null;
    linkedinUrl?: string | null;
    twitterUrl?: string | null;
    startupStatus?: string;
    publicationStatus?: string;
    isFeatured?: boolean;
    displayOrder?: number;
    founderPublicInfo?: string;
    msmeStatus?: string;
    msmeNumber?: string | null;
    showMsmeNumber?: boolean;
    dpiitStatus?: string;
    dpiitNumber?: string | null;
    showDpiitNumber?: boolean;
    isEcellVerified?: boolean;
    isMsmeVerified?: boolean;
    isDpiitVerified?: boolean;
    verifiedBy?: string | null;
    verifiedAt?: Date | null;
    verificationNote?: string | null;
    // Private details
    founderEmails?: string;
    founderPhones?: string;
    internalNotes?: string | null;
  },
  admin: { id: string; email: string }
) {
  const { founderEmails, founderPhones, internalNotes, ...publicData } = data;

  const old = await prisma.startup.findUnique({
    where: { id },
    include: { privateDetails: true },
  });

  const updated = await prisma.startup.update({
    where: { id },
    data: {
      ...publicData,
      ...(founderEmails !== undefined || founderPhones !== undefined || internalNotes !== undefined
        ? {
            privateDetails: {
              upsert: {
                create: {
                  founderEmails: founderEmails || "",
                  founderPhones: founderPhones || "",
                  internalNotes: internalNotes || null,
                },
                update: {
                  ...(founderEmails !== undefined ? { founderEmails } : {}),
                  ...(founderPhones !== undefined ? { founderPhones } : {}),
                  ...(internalNotes !== undefined ? { internalNotes } : {}),
                },
              },
            },
          }
        : {}),
    },
    include: { privateDetails: true },
  });

  await logAdminAction({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action: "update",
    contentType: "Startup",
    recordId: id,
    changedFields: Object.keys(data),
    oldValues: old as unknown as Record<string, unknown>,
    newValues: updated as unknown as Record<string, unknown>,
  });

  return updated;
}

export async function archiveAdminStartup(id: string, admin: { id: string; email: string }) {
  const updated = await prisma.startup.update({
    where: { id },
    data: { publicationStatus: "Archived" },
  });

  await logAdminAction({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action: "archive",
    contentType: "Startup",
    recordId: id,
  });

  return updated;
}

export async function restoreAdminStartup(id: string, admin: { id: string; email: string }) {
  const updated = await prisma.startup.update({
    where: { id },
    data: { publicationStatus: "Draft" },
  });

  await logAdminAction({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action: "restore",
    contentType: "Startup",
    recordId: id,
  });

  return updated;
}

export async function permanentDeleteStartup(id: string, admin: { id: string; email: string }) {
  const existing = await prisma.startup.findUnique({ where: { id } });
  if (!existing) return null;

  await prisma.startup.delete({
    where: { id },
  });

  await logAdminAction({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action: "delete",
    contentType: "Startup",
    recordId: id,
    oldValues: { name: existing.name },
  });

  return existing;
}

// Events
export async function getAdminEvents(params?: {
  publicationStatus?: string;
  eventStatus?: string;
  search?: string;
}) {
  const where: Record<string, unknown> = {};

  if (params?.publicationStatus && params.publicationStatus !== "all") {
    where.publicationStatus = params.publicationStatus;
  }

  if (params?.eventStatus && params.eventStatus !== "all") {
    where.eventStatus = params.eventStatus;
  }

  if (params?.search && params.search.trim()) {
    const q = params.search.trim();
    where.OR = [
      { title: { contains: q } },
      { venue: { contains: q } },
      { category: { contains: q } },
    ];
  }

  return prisma.event.findMany({
    where,
    orderBy: [{ isFeatured: "desc" }, { eventDate: "desc" }],
    include: {
      photos: true,
      winners: true,
    },
  });
}

// Team Members
export async function getAdminTeamMembers(params?: {
  category?: string;
  academicYear?: string;
  publicationStatus?: string;
}) {
  const where: Record<string, unknown> = {};

  if (params?.publicationStatus && params.publicationStatus !== "all") {
    where.publicationStatus = params.publicationStatus;
  }

  if (params?.category && params.category !== "all") {
    where.category = params.category;
  }

  if (params?.academicYear && params.academicYear !== "all") {
    where.academicYear = params.academicYear;
  }

  return prisma.teamMember.findMany({
    where,
    orderBy: [{ academicYear: "desc" }, { displayOrder: "asc" }],
  });
}

// Blogs
export async function getAdminBlogs(params?: {
  publicationStatus?: string;
  search?: string;
}) {
  const where: Record<string, unknown> = {};

  if (params?.publicationStatus && params.publicationStatus !== "all") {
    where.publicationStatus = params.publicationStatus;
  }

  if (params?.search && params.search.trim()) {
    const q = params.search.trim();
    where.OR = [
      { title: { contains: q } },
      { authorName: { contains: q } },
      { tags: { contains: q } },
    ];
  }

  return prisma.blog.findMany({
    where,
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
  });
}

// Grants
export async function getAdminGrants(params?: {
  publicationStatus?: string;
  sector?: string;
  search?: string;
}) {
  const where: Record<string, unknown> = {};

  if (params?.publicationStatus && params.publicationStatus !== "all") {
    where.publicationStatus = params.publicationStatus;
  }

  if (params?.sector && params.sector !== "all") {
    where.sector = params.sector;
  }

  if (params?.search && params.search.trim()) {
    const q = params.search.trim();
    where.OR = [
      { schemeName: { contains: q } },
      { agency: { contains: q } },
    ];
  }

  return prisma.grant.findMany({
    where,
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    include: {
      checklistItems: true,
    },
  });
}

// Site Settings
export async function getAdminSiteSettings() {
  return prisma.siteSetting.findUnique({
    where: { id: "default" },
  });
}

export async function updateAdminSiteSettings(
  data: Record<string, unknown>,
  admin: { id: string; email: string }
) {
  const old = await prisma.siteSetting.findUnique({ where: { id: "default" } });
  const updated = await prisma.siteSetting.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      siteName: (data.siteName as string) || "E-Cell VIT Mumbai",
      tagline: (data.tagline as string) || "LEARN • BUILD • NETWORK • LEAD",
      aboutText: (data.aboutText as string) || "",
      missionText: (data.missionText as string) || "",
      visionText: (data.visionText as string) || "",
      contactEmail: (data.contactEmail as string) || "ecell@vit.edu.in",
      contactPhone: (data.contactPhone as string) || "+91 22 2416 1126",
      ...data,
    },
    update: data,
  });

  await logAdminAction({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action: "update",
    contentType: "SiteSetting",
    recordId: "default",
    changedFields: Object.keys(data),
    oldValues: old as unknown as Record<string, unknown>,
    newValues: updated as unknown as Record<string, unknown>,
  });

  return updated;
}

// ==========================================
// BLOG MANAGEMENT
// ==========================================

export async function createAdminBlog(
  data: {
    title: string;
    slug: string;
    coverImageUrl?: string | null;
    excerpt: string;
    content: string;
    authorName: string;
    authorRole?: string | null;
    authorBio?: string | null;
    tags: string;
    readTimeMinutes?: number;
    publicationStatus: string;
    isFeatured?: boolean;
    publishedAt?: Date | null;
  },
  admin: { id: string; email: string }
) {
  // Auto-calculate read time if not provided (approx 200 words/min)
  const wordCount = data.content.trim().split(/\s+/).filter(Boolean).length;
  const calculatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  const blog = await prisma.blog.create({
    data: {
      ...data,
      readTimeMinutes: data.readTimeMinutes || calculatedReadTime,
      publishedAt: data.publicationStatus === "Published" ? (data.publishedAt || new Date()) : null,
    },
  });

  await logAdminAction({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action: "create",
    contentType: "Blog",
    recordId: blog.id,
    newValues: { title: blog.title, slug: blog.slug },
  });

  return blog;
}

export async function updateAdminBlog(
  id: string,
  data: {
    title?: string;
    slug?: string;
    coverImageUrl?: string | null;
    excerpt?: string;
    content?: string;
    authorName?: string;
    authorRole?: string | null;
    authorBio?: string | null;
    tags?: string;
    readTimeMinutes?: number;
    publicationStatus?: string;
    isFeatured?: boolean;
    publishedAt?: Date | null;
  },
  admin: { id: string; email: string }
) {
  const old = await prisma.blog.findUnique({ where: { id } });

  // Recalculate read time if content is updated
  let readTimeMinutes = data.readTimeMinutes;
  if (data.content && !readTimeMinutes) {
    const wordCount = data.content.trim().split(/\s+/).filter(Boolean).length;
    readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
  }

  let publishedAt = data.publishedAt;
  if (data.publicationStatus === "Published" && !old?.publishedAt && !publishedAt) {
    publishedAt = new Date();
  }

  const updated = await prisma.blog.update({
    where: { id },
    data: {
      ...data,
      ...(readTimeMinutes ? { readTimeMinutes } : {}),
      ...(publishedAt !== undefined ? { publishedAt } : {}),
    },
  });

  await logAdminAction({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action: "update",
    contentType: "Blog",
    recordId: id,
    changedFields: Object.keys(data),
    oldValues: old as unknown as Record<string, unknown>,
    newValues: updated as unknown as Record<string, unknown>,
  });

  return updated;
}

export async function archiveAdminBlog(id: string, admin: { id: string; email: string }) {
  const updated = await prisma.blog.update({
    where: { id },
    data: { publicationStatus: "Archived" },
  });

  await logAdminAction({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action: "archive",
    contentType: "Blog",
    recordId: id,
  });

  return updated;
}

export async function restoreAdminBlog(id: string, admin: { id: string; email: string }) {
  const updated = await prisma.blog.update({
    where: { id },
    data: { publicationStatus: "Draft" },
  });

  await logAdminAction({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action: "restore",
    contentType: "Blog",
    recordId: id,
  });

  return updated;
}

export async function permanentDeleteBlog(id: string, admin: { id: string; email: string }) {
  const existing = await prisma.blog.findUnique({ where: { id } });
  if (!existing) return null;

  await prisma.blog.delete({ where: { id } });

  await logAdminAction({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action: "delete",
    contentType: "Blog",
    recordId: id,
    oldValues: { title: existing.title },
  });

  return existing;
}

// ==========================================
// GRANTS MANAGEMENT
// ==========================================

export async function createAdminGrant(
  data: {
    schemeName: string;
    slug: string;
    agency: string;
    sector: string;
    stage: string;
    fundingRange: string;
    eligibility: string;
    applicationWindow: string;
    officialSourceUrl: string;
    sourceTitle: string;
    deadlineType: string;
    deadlineAt?: Date | null;
    verifiedBy: string;
    publicationStatus?: string;
    displayOrder?: number;
    checklistItems?: Array<{ itemText: string; category?: string; displayOrder?: number }>;
  },
  admin: { id: string; email: string }
) {
  const { checklistItems, ...grantData } = data;

  const grant = await prisma.grant.create({
    data: {
      ...grantData,
      publicationStatus: grantData.publicationStatus || "Draft",
      lastVerifiedAt: new Date(),
      checklistItems: checklistItems && checklistItems.length > 0 ? {
        create: checklistItems.map((item, idx) => ({
          itemText: item.itemText,
          category: item.category || "General",
          displayOrder: item.displayOrder ?? idx,
          isActive: true,
        })),
      } : undefined,
    },
    include: {
      checklistItems: true,
    },
  });

  await logAdminAction({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action: "create",
    contentType: "Grant",
    recordId: grant.id,
    newValues: { schemeName: grant.schemeName, slug: grant.slug },
  });

  return grant;
}

export async function updateAdminGrant(
  id: string,
  data: {
    schemeName?: string;
    slug?: string;
    agency?: string;
    sector?: string;
    stage?: string;
    fundingRange?: string;
    eligibility?: string;
    applicationWindow?: string;
    officialSourceUrl?: string;
    sourceTitle?: string;
    deadlineType?: string;
    deadlineAt?: Date | null;
    verifiedBy?: string;
    publicationStatus?: string;
    displayOrder?: number;
    checklistItems?: Array<{ id?: string; itemText: string; category?: string; displayOrder?: number; isActive?: boolean }>;
  },
  admin: { id: string; email: string }
) {
  const { checklistItems, ...grantData } = data;
  const old = await prisma.grant.findUnique({ where: { id }, include: { checklistItems: true } });

  // If checklistItems are provided, replace them or update
  if (checklistItems) {
    await prisma.grantChecklistItem.deleteMany({ where: { grantId: id } });
    await prisma.grantChecklistItem.createMany({
      data: checklistItems.map((item, idx) => ({
        grantId: id,
        itemText: item.itemText,
        category: item.category || "General",
        displayOrder: item.displayOrder ?? idx,
        isActive: item.isActive !== undefined ? item.isActive : true,
      })),
    });
  }

  const updated = await prisma.grant.update({
    where: { id },
    data: {
      ...grantData,
      lastVerifiedAt: new Date(),
    },
    include: { checklistItems: true },
  });

  await logAdminAction({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action: "update",
    contentType: "Grant",
    recordId: id,
    changedFields: Object.keys(data),
    oldValues: old as unknown as Record<string, unknown>,
    newValues: updated as unknown as Record<string, unknown>,
  });

  return updated;
}

export async function archiveAdminGrant(id: string, admin: { id: string; email: string }) {
  const updated = await prisma.grant.update({
    where: { id },
    data: { publicationStatus: "Archived" },
  });

  await logAdminAction({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action: "archive",
    contentType: "Grant",
    recordId: id,
  });

  return updated;
}

export async function restoreAdminGrant(id: string, admin: { id: string; email: string }) {
  const updated = await prisma.grant.update({
    where: { id },
    data: { publicationStatus: "Draft" },
  });

  await logAdminAction({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action: "restore",
    contentType: "Grant",
    recordId: id,
  });

  return updated;
}

export async function permanentDeleteGrant(id: string, admin: { id: string; email: string }) {
  const existing = await prisma.grant.findUnique({ where: { id } });
  if (!existing) return null;

  await prisma.grant.delete({ where: { id } });

  await logAdminAction({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action: "delete",
    contentType: "Grant",
    recordId: id,
    oldValues: { schemeName: existing.schemeName },
  });

  return existing;
}

// ==========================================
// TEAM MANAGEMENT
// ==========================================

export async function createAdminTeamMember(
  data: {
    name: string;
    photoUrl?: string | null;
    designation: string;
    organisation?: string | null;
    linkedinUrl?: string | null;
    category: string;
    academicYear?: string;
    isCurrent?: boolean;
    publicationStatus?: string;
    displayOrder?: number;
  },
  admin: { id: string; email: string }
) {
  const member = await prisma.teamMember.create({
    data: {
      ...data,
      academicYear: data.academicYear || "2026-27",
      isCurrent: data.isCurrent !== undefined ? data.isCurrent : true,
      publicationStatus: data.publicationStatus || "Published",
    },
  });

  await logAdminAction({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action: "create",
    contentType: "TeamMember",
    recordId: member.id,
    newValues: { name: member.name, designation: member.designation, category: member.category },
  });

  return member;
}

export async function updateAdminTeamMember(
  id: string,
  data: {
    name?: string;
    photoUrl?: string | null;
    designation?: string;
    organisation?: string | null;
    linkedinUrl?: string | null;
    category?: string;
    academicYear?: string;
    isCurrent?: boolean;
    publicationStatus?: string;
    displayOrder?: number;
  },
  admin: { id: string; email: string }
) {
  const old = await prisma.teamMember.findUnique({ where: { id } });
  const updated = await prisma.teamMember.update({
    where: { id },
    data,
  });

  await logAdminAction({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action: "update",
    contentType: "TeamMember",
    recordId: id,
    changedFields: Object.keys(data),
    oldValues: old as unknown as Record<string, unknown>,
    newValues: updated as unknown as Record<string, unknown>,
  });

  return updated;
}

export async function deleteAdminTeamMember(id: string, admin: { id: string; email: string }) {
  const existing = await prisma.teamMember.findUnique({ where: { id } });
  if (!existing) return null;

  await prisma.teamMember.delete({ where: { id } });

  await logAdminAction({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action: "delete",
    contentType: "TeamMember",
    recordId: id,
    oldValues: { name: existing.name },
  });

  return existing;
}

export async function rolloverAcademicYear(newYear: string, admin: { id: string; email: string }) {
  // Mark previous Student Heads and Core Team members as isCurrent = false
  const updated = await prisma.teamMember.updateMany({
    where: {
      category: { in: ["Student Head", "Core Team"] },
      isCurrent: true,
    },
    data: {
      isCurrent: false,
    },
  });

  await logAdminAction({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action: "update",
    contentType: "TeamMember",
    recordId: "rollover",
    newValues: { newYear, archivedMembersCount: updated.count },
  });

  return { success: true, newYear, count: updated.count };
}

// ==========================================
// CATEGORIES MANAGEMENT
// ==========================================

export async function getAdminCategories(type?: string) {
  const where: Record<string, unknown> = {};
  if (type && type !== "all") {
    where.type = type;
  }
  return prisma.category.findMany({
    where,
    orderBy: [{ type: "asc" }, { displayOrder: "asc" }, { name: "asc" }],
  });
}

export async function createAdminCategory(
  data: { name: string; slug: string; type: string; displayOrder?: number },
  admin: { id: string; email: string }
) {
  const cat = await prisma.category.create({
    data: {
      ...data,
      displayOrder: data.displayOrder || 0,
    },
  });

  await logAdminAction({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action: "create",
    contentType: "Category",
    recordId: cat.id,
    newValues: { name: cat.name, type: cat.type },
  });

  return cat;
}

export async function updateAdminCategory(
  id: string,
  data: { name?: string; slug?: string; isArchived?: boolean; displayOrder?: number },
  admin: { id: string; email: string }
) {
  const old = await prisma.category.findUnique({ where: { id } });
  const updated = await prisma.category.update({
    where: { id },
    data,
  });

  await logAdminAction({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action: "update",
    contentType: "Category",
    recordId: id,
    changedFields: Object.keys(data),
    oldValues: old as unknown as Record<string, unknown>,
    newValues: updated as unknown as Record<string, unknown>,
  });

  return updated;
}

export async function deleteAdminCategory(id: string, admin: { id: string; email: string }) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return null;

  await prisma.category.delete({ where: { id } });

  await logAdminAction({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action: "delete",
    contentType: "Category",
    recordId: id,
    oldValues: { name: existing.name, type: existing.type },
  });

  return existing;
}

// ==========================================
// ADMIN USERS (SUPER ADMIN ONLY)
// ==========================================

export async function getAdminUsers() {
  return prisma.adminUser.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      mustChangePassword: true,
      failedLoginAttempts: true,
      lockedUntil: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function createAdminUser(
  data: { email: string; name: string; passwordHash: string; role: string },
  admin: { id: string; email: string }
) {
  const user = await prisma.adminUser.create({
    data: {
      ...data,
      active: true,
      mustChangePassword: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });

  await logAdminAction({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action: "create",
    contentType: "AdminUser",
    recordId: user.id,
    newValues: { email: user.email, name: user.name, role: user.role },
  });

  return user;
}

export async function updateAdminUser(
  id: string,
  data: {
    name?: string;
    role?: string;
    active?: boolean;
    passwordHash?: string;
    mustChangePassword?: boolean;
    failedLoginAttempts?: number;
    lockedUntil?: Date | null;
  },
  admin: { id: string; email: string }
) {
  const old = await prisma.adminUser.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, active: true },
  });

  const updated = await prisma.adminUser.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      mustChangePassword: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  await logAdminAction({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action: "update",
    contentType: "AdminUser",
    recordId: id,
    changedFields: Object.keys(data).filter((k) => k !== "passwordHash"),
    oldValues: old as unknown as Record<string, unknown>,
    newValues: {
      email: updated.email,
      name: updated.name,
      role: updated.role,
      active: updated.active,
    },
  });

  return updated;
}

export async function deleteAdminUser(id: string, admin: { id: string; email: string }) {
  const existing = await prisma.adminUser.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!existing) return null;

  await prisma.adminUser.delete({ where: { id } });

  await logAdminAction({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action: "delete",
    contentType: "AdminUser",
    recordId: id,
    oldValues: { email: existing.email, name: existing.name },
  });

  return existing;
}

// ==========================================
// AUDIT LOG VIEWER (SUPER ADMIN ONLY)
// ==========================================

export async function getAdminAuditLogs(params?: {
  action?: string;
  contentType?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 30;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (params?.action && params.action !== "all") {
    where.action = params.action;
  }

  if (params?.contentType && params.contentType !== "all") {
    where.contentType = params.contentType;
  }

  if (params?.search && params.search.trim()) {
    const q = params.search.trim();
    where.OR = [
      { adminEmail: { contains: q } },
      { recordId: { contains: q } },
      { newValues: { contains: q } },
      { oldValues: { contains: q } },
    ];
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { timestamp: "desc" },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

// ==========================================
// PRIVACY REQUESTS
// ==========================================

export async function getAdminPrivacyRequests(params?: {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 25;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (params?.status && params.status !== "all") {
    where.status = params.status;
  }

  if (params?.search && params.search.trim()) {
    const q = params.search.trim();
    where.OR = [
      { fullName: { contains: q } },
      { email: { contains: q } },
      { details: { contains: q } },
    ];
  }

  const [requests, total] = await Promise.all([
    prisma.privacyRequest.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.privacyRequest.count({ where }),
  ]);

  return { requests, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function updatePrivacyRequestStatus(
  id: string,
  data: { status?: string; internalNotes?: string },
  admin: { id: string; email: string }
) {
  const old = await prisma.privacyRequest.findUnique({ where: { id } });
  const completedAt = data.status === "Completed" ? new Date() : undefined;

  const updated = await prisma.privacyRequest.update({
    where: { id },
    data: {
      ...data,
      ...(completedAt ? { completedAt } : {}),
    },
  });

  await logAdminAction({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action: "status_change",
    contentType: "PrivacyRequest",
    recordId: id,
    changedFields: Object.keys(data),
    oldValues: old as unknown as Record<string, unknown>,
    newValues: updated as unknown as Record<string, unknown>,
  });

  return updated;
}

// ==========================================
// DATA EXPORT (CSV / JSON)
// ==========================================

export async function getAdminExportData(type: string) {
  switch (type) {
    case "startups":
      return prisma.startup.findMany({
        include: { privateDetails: true },
        orderBy: { name: "asc" },
      });
    case "events":
      return prisma.event.findMany({
        include: { photos: true, winners: true },
        orderBy: { eventDate: "desc" },
      });
    case "leads":
      return prisma.lead.findMany({
        orderBy: { createdAt: "desc" },
      });
    case "applications":
      return prisma.incubationApplication.findMany({
        orderBy: { createdAt: "desc" },
      });
    case "blogs":
      return prisma.blog.findMany({
        orderBy: { createdAt: "desc" },
      });
    case "grants":
      return prisma.grant.findMany({
        include: { checklistItems: true },
        orderBy: { schemeName: "asc" },
      });
    case "team":
      return prisma.teamMember.findMany({
        orderBy: [{ academicYear: "desc" }, { displayOrder: "asc" }],
      });
    case "audit_logs":
      return prisma.auditLog.findMany({
        orderBy: { timestamp: "desc" },
      });
    default:
      return [];
  }
}

