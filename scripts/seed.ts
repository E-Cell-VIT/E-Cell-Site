import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("\n==================================================");
  console.log("  E-Cell VIT Mumbai — Database Seeder");
  console.log("  Rule: All data marked with explicit placeholders");
  console.log("==================================================\n");

  // 1. Site Settings
  console.log("🌱 Seeding Site Settings...");
  await prisma.siteSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteName: "E-Cell VIT Mumbai",
      tagline: "LEARN • BUILD • NETWORK • LEAD",
      aboutText:
        "[Placeholder: About E-Cell VIT - The Entrepreneurship Cell of Vidyalankar Institute of Technology, Wadala, Mumbai is a student-driven organization committed to cultivating an entrepreneurial mindset, supporting student innovations, and connecting campus innovators with industry ecosystems.]",
      missionText:
        "[Placeholder: Mission - To empower aspiring student founders with resources, mentorship, industry networks, and pre-incubation infrastructure to transform groundbreaking ideas into sustainable enterprises.]",
      visionText:
        "[Placeholder: Vision - To establish Vidyalankar Institute of Technology as a premier hub of innovation, deep-tech research commercialization, and student-led venture creation in Mumbai.]",
      contactEmail: "ecell@vit.edu.in",
      contactPhone: "+91 22 2416 1126",
      instagramUrl: "https://instagram.com/ecell_vit",
      linkedinUrl: "https://linkedin.com/company/ecell-vit-mumbai",
      youtubeUrl: "https://youtube.com/@ecellvit",
      twitterUrl: "https://x.com/ecell_vit",
      campusMapUrl:
        "https://maps.google.com/?q=Vidyalankar+Institute+of+Technology+Wadala+Mumbai",
      heroTitle: "Fostering the Next Generation of Founders",
      heroSubtitle:
        "Vidyalankar Institute of Technology's premier entrepreneurship cell. From ideation and prototyping to government grants and startup incubation.",
      manualStats: JSON.stringify([
        { label: "Aspiring Students Engaged", value: "2,500+" },
        { label: "Industry Mentors Onboarded", value: "35+" },
        { label: "Workshops & Bootcamps", value: "24+" },
        { label: "Venture Pre-Incubations", value: "18+" },
      ]),
      outdatedGrantThresholdDays: 90,
    },
  });

  // 2. Categories
  console.log("🌱 Seeding Categories...");
  const categories = [
    // Startup Domains
    { name: "Artificial Intelligence & ML", slug: "ai-ml", type: "startup_domain", displayOrder: 1 },
    { name: "HealthTech & BioTech", slug: "healthtech", type: "startup_domain", displayOrder: 2 },
    { name: "FinTech & Web3", slug: "fintech", type: "startup_domain", displayOrder: 3 },
    { name: "EdTech & Learning", slug: "edtech", type: "startup_domain", displayOrder: 4 },
    { name: "SaaS & Enterprise Tools", slug: "saas", type: "startup_domain", displayOrder: 5 },
    { name: "CleanTech & Sustainability", slug: "cleantech", type: "startup_domain", displayOrder: 6 },
    { name: "Hardware & IoT", slug: "hardware-iot", type: "startup_domain", displayOrder: 7 },

    // Event Categories
    { name: "Flagship Summit", slug: "flagship-summit", type: "event_category", displayOrder: 1 },
    { name: "Hackathon & Buildathon", slug: "hackathon", type: "event_category", displayOrder: 2 },
    { name: "Speaker Session & AMA", slug: "speaker-session", type: "event_category", displayOrder: 3 },
    { name: "Pitch Competition", slug: "pitch-competition", type: "event_category", displayOrder: 4 },
    { name: "Founder Workshop", slug: "founder-workshop", type: "event_category", displayOrder: 5 },

    // Grant Sectors
    { name: "DeepTech & Hardware", slug: "deeptech-hardware", type: "grant_sector", displayOrder: 1 },
    { name: "Biotechnology & Health", slug: "biotechnology-health", type: "grant_sector", displayOrder: 2 },
    { name: "Agriculture & Rural Tech", slug: "agriculture-tech", type: "grant_sector", displayOrder: 3 },
    { name: "Cross-Sector Innovation", slug: "cross-sector-innovation", type: "grant_sector", displayOrder: 4 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  // 3. Startups (with private details in separate table)
  console.log("🌱 Seeding Placeholder Startups...");
  const sampleStartups = [
    {
      name: "[Placeholder: NeuroPulse Diagnostics]",
      slug: "neuropulse-diagnostics",
      domain: "HealthTech & BioTech",
      oneLineSummary:
        "[Placeholder: AI-assisted rapid EEG anomaly screening device for community health clinics]",
      fullDescription:
        "[Placeholder: NeuroPulse Diagnostics is developing a portable, low-cost edge AI diagnostic device for point-of-care neuro-screening. The proprietary hardware captures 8-channel EEG signals and runs quantized deep learning inference on-chip.]",
      startupStatus: "Currently Working",
      publicationStatus: "Published",
      isFeatured: true,
      displayOrder: 1,
      founderPublicInfo:
        "[Placeholder: Founder A (Biomedical Engg / Batch 2025), Founder B (Electronics Engg / Batch 2025)]",
      msmeStatus: "Registered",
      msmeNumber: "[Placeholder: UDYAM-MH-01-XXXXXXX]",
      showMsmeNumber: false,
      dpiitStatus: "Registration Pending",
      dpiitNumber: null,
      showDpiitNumber: false,
      isEcellVerified: true,
      isMsmeVerified: true,
      isDpiitVerified: false,
      verifiedBy: "E-Cell Verification Committee",
      verifiedAt: new Date("2026-08-15"),
      verificationNote: "[Private Note: MSME certificate verified with Ministry of MSME portal.]",
      founderEmails: "founder.a@example.com, founder.b@example.com",
      founderPhones: "+91 98200 XXXXX, +91 98201 XXXXX",
      internalNotes: "[Private Note: Working prototype demonstrated at VIT Innovation Lab.]",
    },
    {
      name: "[Placeholder: AgroSense Labs]",
      slug: "agrosense-labs",
      domain: "Hardware & IoT",
      oneLineSummary:
        "[Placeholder: Solar-powered micro-weather sensors and soil moisture telemetry for precision farming]",
      fullDescription:
        "[Placeholder: AgroSense builds low-cost multi-spectral soil telemetry probes that transmit real-time moisture, NPK, and microclimate indicators via LoRaWAN to rural farmer cooperatives.]",
      startupStatus: "Currently Working",
      publicationStatus: "Published",
      isFeatured: true,
      displayOrder: 2,
      founderPublicInfo:
        "[Placeholder: Founder C (Information Tech / Batch 2026), Founder D (EXTC / Batch 2026)]",
      msmeStatus: "Registered",
      msmeNumber: "[Placeholder: UDYAM-MH-02-XXXXXXX]",
      showMsmeNumber: true,
      dpiitStatus: "Registered",
      dpiitNumber: "[Placeholder: DIPPXXXXX]",
      showDpiitNumber: true,
      isEcellVerified: true,
      isMsmeVerified: true,
      isDpiitVerified: true,
      verifiedBy: "E-Cell Verification Committee",
      verifiedAt: new Date("2026-07-20"),
      verificationNote: "[Private Note: Both Udyam and DPIIT certificates verified on official portals.]",
      founderEmails: "founder.c@example.com",
      founderPhones: "+91 98330 XXXXX",
      internalNotes: "[Private Note: Pilot deployment conducted with 5 farmers in Maharashtra.]",
    },
    {
      name: "[Placeholder: DevMatrix Cloud]",
      slug: "devmatrix-cloud",
      domain: "SaaS & Enterprise Tools",
      oneLineSummary:
        "[Placeholder: Autonomous continuous testing and visual regression platform for engineering teams]",
      fullDescription:
        "[Placeholder: DevMatrix Cloud automates end-to-end integration workflows and detects frontend regressions using headless browser clusters and structural DOM diffing.]",
      startupStatus: "Alumni / Scaled",
      publicationStatus: "Published",
      isFeatured: true,
      displayOrder: 3,
      founderPublicInfo:
        "[Placeholder: Alumni Founder E (Computer Engg / Batch 2023), Alumni Founder F (IT / Batch 2023)]",
      msmeStatus: "Registered",
      msmeNumber: "[Placeholder: UDYAM-MH-03-XXXXXXX]",
      showMsmeNumber: true,
      dpiitStatus: "Registered",
      dpiitNumber: "[Placeholder: DIPPXXXXX]",
      showDpiitNumber: true,
      isEcellVerified: true,
      isMsmeVerified: true,
      isDpiitVerified: true,
      verifiedBy: "E-Cell Alumni Desk",
      verifiedAt: new Date("2026-06-10"),
      verificationNote: "[Private Note: VIT alumni venture. Successfully raised angel round.]",
      founderEmails: "founder.e@example.com",
      founderPhones: "+91 98190 XXXXX",
      internalNotes: "[Private Note: Serving 20+ mid-market customers.]",
    },
  ];

  for (const s of sampleStartups) {
    const { founderEmails, founderPhones, internalNotes, ...publicData } = s;
    const startup = await prisma.startup.upsert({
      where: { slug: s.slug },
      update: publicData,
      create: publicData,
    });

    await prisma.startupPrivate.upsert({
      where: { startupId: startup.id },
      update: { founderEmails, founderPhones, internalNotes },
      create: {
        startupId: startup.id,
        founderEmails,
        founderPhones,
        internalNotes,
      },
    });
  }

  // 4. Events
  console.log("🌱 Seeding Placeholder Events...");
  const sampleEvents = [
    {
      title: "[Placeholder: E-Summit 2026 - Ideate, Innovate, Ignite]",
      slug: "e-summit-2026",
      coverImageUrl: null,
      eventDate: new Date("2026-11-15T09:30:00+05:30"),
      venue: "VIT Auditorium & Campus Plaza, Wadala, Mumbai",
      category: "Flagship Summit",
      eventStatus: "Upcoming",
      publicationStatus: "Published",
      isFeatured: true,
      displayOrder: 1,
      description:
        "[Placeholder: The annual flagship entrepreneurship conclave of VIT Mumbai bringing together venture capitalists, startup founders, student innovators, and policymakers for panel discussions, pitching arenas, and networking conclaves.]",
      reportPdfUrl: null,
      registrationUrl: "https://unstop.com/e/placeholder-e-summit-vit",
    },
    {
      title: "[Placeholder: HackVIT Innovation Hackathon 2026]",
      slug: "hackvit-hackathon-2026",
      coverImageUrl: null,
      eventDate: new Date("2026-08-22T10:00:00+05:30"),
      venue: "Vidyalankar Institute of Technology - Innovation Center",
      category: "Hackathon & Buildathon",
      eventStatus: "Past",
      publicationStatus: "Published",
      isFeatured: true,
      displayOrder: 2,
      description:
        "[Placeholder: A 36-hour intense hackathon where 60+ student teams engineered solutions across FinTech, HealthTech, Sustainable Energy, and Open Innovation.]",
      reportPdfUrl: null,
      registrationUrl: null,
    },
    {
      title: "[Placeholder: PitchPerfect - Seed Funding Bootcamp]",
      slug: "pitchperfect-bootcamp-2026",
      coverImageUrl: null,
      eventDate: new Date("2026-06-18T14:00:00+05:30"),
      venue: "Seminar Hall 1, M-Block, VIT Mumbai",
      category: "Pitch Competition",
      eventStatus: "Past",
      publicationStatus: "Published",
      isFeatured: false,
      displayOrder: 3,
      description:
        "[Placeholder: Masterclass and investor simulation workshop focused on financial modeling, term-sheet fundamentals, and live pitch deck reviews with venture mentors.]",
      reportPdfUrl: null,
      registrationUrl: null,
    },
  ];

  for (const ev of sampleEvents) {
    const event = await prisma.event.upsert({
      where: { slug: ev.slug },
      update: ev,
      create: ev,
    });

    // If past hackathon, seed winners
    if (ev.slug === "hackvit-hackathon-2026") {
      const existingWinners = await prisma.eventWinner.count({ where: { eventId: event.id } });
      if (existingWinners === 0) {
        await prisma.eventWinner.createMany({
          data: [
            {
              eventId: event.id,
              rank: 1,
              teamName: "[Placeholder: Team Apex Innovators]",
              projectTitle: "[Placeholder: Offline Decentralized Emergency Mesh Network]",
              prize: "[Placeholder: Cash Prize & Incubation Support]",
              displayOrder: 1,
            },
            {
              eventId: event.id,
              rank: 2,
              teamName: "[Placeholder: Team BioSphere]",
              projectTitle: "[Placeholder: Biodegradable Packaging from Agricultural Waste]",
              prize: "[Placeholder: Cash Prize & Prototype Grant Assistance]",
              displayOrder: 2,
            },
            {
              eventId: event.id,
              rank: 3,
              teamName: "[Placeholder: Team FinSense]",
              projectTitle: "[Placeholder: Micro-Credit Scoring via Alternative Data]",
              prize: "[Placeholder: Cash Prize]",
              displayOrder: 3,
            },
          ],
        });
      }
    }
  }

  // 5. Government Grants
  console.log("🌱 Seeding Government Grants (Marked: To be verified by admin)...");
  const sampleGrants = [
    {
      schemeName: "Startup India Seed Fund Scheme (SISFS)",
      slug: "startup-india-seed-fund-scheme-sisfs",
      agency: "DPIIT, Ministry of Commerce and Industry",
      sector: "Cross-Sector Innovation",
      stage: "Early Stage / Prototype to Market",
      fundingRange: "[Placeholder: Grant up to ₹20 Lakhs for validation/PoC, Debt/Convertible debentures up to ₹50 Lakhs — To be verified by admin]",
      eligibility:
        "[Placeholder: DPIIT-recognized startup incorporated not more than 2 years ago, with an innovative product/technology with market viability — To be verified by admin]",
      applicationWindow: "Rolling application window via approved incubators",
      officialSourceUrl: "https://seedfund.startupindia.gov.in/",
      sourceTitle: "Official SISFS Portal (DPIIT)",
      deadlineType: "rolling",
      deadlineAt: null,
      lastVerifiedAt: new Date(),
      verifiedBy: "E-Cell Grants Desk",
      publicationStatus: "Published",
      displayOrder: 1,
    },
    {
      schemeName: "BIRAC Biotechnology Ignition Grant (BIG)",
      slug: "birac-biotechnology-ignition-grant-big",
      agency: "Biotechnology Industry Research Assistance Council (BIRAC), DBT",
      sector: "Biotechnology & Health",
      stage: "Proof of Concept / Early Prototype",
      fundingRange: "[Placeholder: Up to ₹50 Lakhs grant-in-aid — To be verified by admin]",
      eligibility:
        "[Placeholder: Indian biotech startup or individual entrepreneur working on biotechnology, diagnostics, or bio-pharma innovation — To be verified by admin]",
      applicationWindow: "Bi-annual call for proposals (typically Jan and July)",
      officialSourceUrl: "https://birac.nic.in/big.php",
      sourceTitle: "BIRAC Official Portal (Dept of Biotechnology)",
      deadlineType: "rolling",
      deadlineAt: null,
      lastVerifiedAt: new Date(),
      verifiedBy: "E-Cell Grants Desk",
      publicationStatus: "Published",
      displayOrder: 2,
    },
    {
      schemeName: "Maharashtra State Innovation Society (MSInS) Seed Grant",
      slug: "msins-seed-grant-maharashtra",
      agency: "Maharashtra State Innovation Society, Govt of Maharashtra",
      sector: "Cross-Sector Innovation",
      stage: "Early Stage / Pre-Incubation",
      fundingRange: "[Placeholder: Grant assistance through Maharashtra Virtual Incubator / Start-up Week — To be verified by admin]",
      eligibility:
        "[Placeholder: Startups registered in the State of Maharashtra with verified MSME/DPIIT credentials — To be verified by admin]",
      applicationWindow: "Annual Maharashtra Startup Week and partner incubation rounds",
      officialSourceUrl: "https://msins.in/",
      sourceTitle: "MSInS Official Portal (Govt of Maharashtra)",
      deadlineType: "rolling",
      deadlineAt: null,
      lastVerifiedAt: new Date(),
      verifiedBy: "E-Cell Grants Desk",
      publicationStatus: "Published",
      displayOrder: 3,
    },
    {
      schemeName: "DST NIDHI-PRAYAS Scheme",
      slug: "dst-nidhi-prayas-scheme",
      agency: "Department of Science and Technology (DST), Govt of India",
      sector: "DeepTech & Hardware",
      stage: "Idea to Prototype (Proof of Concept)",
      fundingRange: "[Placeholder: Prototype grant up to ₹10 Lakhs — To be verified by admin]",
      eligibility:
        "[Placeholder: Student innovator or hardware entrepreneur converting innovative scientific/engineering ideas into a working physical prototype — To be verified by admin]",
      applicationWindow: "Periodic call for proposals via designated PRAYAS Centers (PC)",
      officialSourceUrl: "https://www.nidhi-prayas.org/",
      sourceTitle: "DST NIDHI-PRAYAS Official Portal",
      deadlineType: "rolling",
      deadlineAt: null,
      lastVerifiedAt: new Date(),
      verifiedBy: "E-Cell Grants Desk",
      publicationStatus: "Published",
      displayOrder: 4,
    },
  ];

  for (const g of sampleGrants) {
    const grant = await prisma.grant.upsert({
      where: { slug: g.slug },
      update: g,
      create: g,
    });

    const checklistCount = await prisma.grantChecklistItem.count({ where: { grantId: grant.id } });
    if (checklistCount === 0) {
      await prisma.grantChecklistItem.createMany({
        data: [
          {
            grantId: grant.id,
            itemText: "DPIIT Certificate of Recognition (PDF format)",
            category: "Statutory Documents",
            displayOrder: 1,
          },
          {
            grantId: grant.id,
            itemText: "Proof of Concept / Technical Architecture Whitepaper",
            category: "Technical Proposal",
            displayOrder: 2,
          },
          {
            grantId: grant.id,
            itemText: "Detailed 12-Month Fund Utilization & Milestones Plan",
            category: "Financials",
            displayOrder: 3,
          },
          {
            grantId: grant.id,
            itemText: "Founder Identification & Academic Credential Verification",
            category: "Team Credentials",
            displayOrder: 4,
          },
        ],
      });
    }
  }

  // 6. Team Members
  console.log("🌱 Seeding Team Members...");
  const sampleTeam = [
    {
      name: "[Placeholder: Dr. Faculty Advisor Name]",
      photoUrl: null,
      designation: "[Placeholder: Professor & Head of Department]",
      organisation: "Vidyalankar Institute of Technology",
      linkedinUrl: "https://linkedin.com/in/placeholder-faculty",
      category: "Faculty Advisor",
      academicYear: "2026-27",
      isCurrent: true,
      displayOrder: 1,
      publicationStatus: "Published",
    },
    {
      name: "[Placeholder: Mentor Industry Leader Name]",
      photoUrl: null,
      designation: "[Placeholder: Partner & Venture Builder]",
      organisation: "[Placeholder: Venture Partners India]",
      linkedinUrl: "https://linkedin.com/in/placeholder-mentor",
      category: "Industry Mentor",
      academicYear: "2026-27",
      isCurrent: true,
      displayOrder: 2,
      publicationStatus: "Published",
    },
    {
      name: "[Placeholder: Student Head Name]",
      photoUrl: null,
      designation: "Overall Student Convener & President",
      organisation: "E-Cell VIT Mumbai",
      linkedinUrl: "https://linkedin.com/in/placeholder-student-lead",
      category: "Student Head",
      academicYear: "2026-27",
      isCurrent: true,
      displayOrder: 3,
      publicationStatus: "Published",
    },
    {
      name: "[Placeholder: Student Head Name - Tech & Product]",
      photoUrl: null,
      designation: "Head of Technology & Incubation Support",
      organisation: "E-Cell VIT Mumbai",
      linkedinUrl: "https://linkedin.com/in/placeholder-tech-lead",
      category: "Student Head",
      academicYear: "2026-27",
      isCurrent: true,
      displayOrder: 4,
      publicationStatus: "Published",
    },
    {
      name: "[Placeholder: Student Lead - Corporate Relations]",
      photoUrl: null,
      designation: "Head of Strategic Partnerships & Sponsorships",
      organisation: "E-Cell VIT Mumbai",
      linkedinUrl: "https://linkedin.com/in/placeholder-relations-lead",
      category: "Core Team",
      academicYear: "2026-27",
      isCurrent: true,
      displayOrder: 5,
      publicationStatus: "Published",
    },
  ];

  for (const t of sampleTeam) {
    const existing = await prisma.teamMember.findFirst({
      where: { name: t.name, academicYear: t.academicYear },
    });
    if (!existing) {
      await prisma.teamMember.create({ data: t });
    }
  }

  // 7. Blogs
  console.log("🌱 Seeding Placeholder Blogs...");
  const sampleBlogs = [
    {
      title: "[Placeholder: Demystifying DPIIT Recognition & Tax Benefits for College Founders]",
      slug: "demystifying-dpiit-recognition-for-student-founders",
      coverImageUrl: null,
      excerpt:
        "[Placeholder: A comprehensive step-by-step breakdown on securing DPIIT startup recognition, Section 80-IAC tax exemptions, and government seed grants while still studying at VIT.]",
      content: `## Navigating Startup Registration as a Student

Starting a company while enrolled at Vidyalankar Institute of Technology offers tremendous opportunities, but navigating official Indian regulatory frameworks requires clarity.

### Why DPIIT Recognition Matters
The Department for Promotion of Industry and Internal Trade (DPIIT) provides official recognition to innovative startups in India. Key benefits include:
- Eligibility for Startup India Seed Fund Scheme (SISFS)
- Self-certification under labor and environmental laws
- Fast-tracked patent examination with up to 80% rebate in filing fees
- Exemption under Section 56(2)(viib) of the Income Tax Act (Angel Tax exemption)

### Udyam MSME vs DPIIT Recognition
Many student entrepreneurs confuse Udyam registration with Startup India recognition.
- **Udyam (MSME):** Categorizes business based on investment in plant/machinery and annual turnover. Essential for priority sector lending, collateral-free credit (CGTMSE), and MSME vendor exemptions.
- **DPIIT (Startup India):** Specifically focuses on innovation, development, and scalable commercial potential.

[Placeholder: Full article text detailing application checklists, common rejection grounds, and incubator endorsement procedures.]`,
      authorName: "[Placeholder: E-Cell Research Editorial Desk]",
      authorRole: "Venture Research Fellow",
      authorBio:
        "[Placeholder: E-Cell VIT's venture research team publishing actionable playbooks for early-stage collegiate founders.]",
      tags: "DPIIT, Startup India, MSME, Student Founders, Grants",
      readTimeMinutes: 5,
      publicationStatus: "Published",
      isFeatured: true,
      publishedAt: new Date("2026-09-10T11:00:00+05:30"),
    },
    {
      title: "[Placeholder: From Campus Project to Market: 5 Steps to Building Hardware at VIT]",
      slug: "from-campus-project-to-market-hardware-vit",
      coverImageUrl: null,
      excerpt:
        "[Placeholder: How engineering students can utilize VIT laboratory infrastructure, fab labs, and DST PRAYAS grants to transition capstone projects into commercial prototypes.]",
      content: `## Transforming Academic Engineering Projects into Ventures

Final-year capstone projects in engineering colleges frequently conclude after examinations. However, with the appropriate methodology and support from E-Cell VIT, technical projects can become high-value commercial ventures.

### Key Milestones
1. **Customer Discovery & Problem Validation:** Talking to 30+ potential industry users before manufacturing PCB boards.
2. **Bill of Materials (BOM) Optimization:** Shifting from hobbyist development boards to industrial microcontrollers.
3. **Intellectual Property Assessment:** Filing provisional patents prior to public project exhibitions.
4. **Pre-Incubation at VIT:** Accessing 3D printing labs, rapid prototyping stations, and mentorship.

[Placeholder: Full article text with actionable advice from alumni founders.]`,
      authorName: "[Placeholder: Innovation & Labs Committee]",
      authorRole: "Technical Director",
      authorBio: "[Placeholder: Overseeing pre-incubation prototyping at VIT.]",
      tags: "Hardware, DeepTech, Prototyping, DST PRAYAS, VIT Labs",
      readTimeMinutes: 4,
      publicationStatus: "Published",
      isFeatured: true,
      publishedAt: new Date("2026-08-28T15:30:00+05:30"),
    },
  ];

  for (const b of sampleBlogs) {
    await prisma.blog.upsert({
      where: { slug: b.slug },
      update: b,
      create: b,
    });
  }

  console.log("\n==================================================");
  console.log("✅ Database successfully seeded with sample data!");
  console.log("ℹ️  Note: No admin account was created (Rule 3).");
  console.log("👉 Run 'npm run create-admin' to create your Super Admin.");
  console.log("==================================================\n");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
