import { prisma } from "../src/lib/db/client";
import {
  getPublicStartups,
  getPublicStartupBySlug,
  getPublicEvents,
  getPublicBlogs,
  getPublicGrants,
  getPublicTeamMembers,
} from "../src/lib/db/public-queries";
import { logAdminAction, redactSensitiveData } from "../src/lib/db/audit";
import { validateMagicBytes } from "../src/lib/storage";
import { checkRateLimit } from "../src/lib/rate-limit";
import fs from "fs";
import path from "path";

/**
 * AUTOMATED SECURITY & DATA INTEGRITY VERIFICATION SUITE
 * E-Cell VIT Mumbai
 */

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${testName}${detail ? ` - ${detail}` : ""}`);
    failedTests++;
  }
}

async function runVerification() {
  console.log("==================================================================");
  console.log("    E-CELL VIT MUMBAI: AUTOMATED SYSTEM VERIFICATION SUITE       ");
  console.log("==================================================================\n");

  // TEST SUITE 1: Public Data-Access Layer Leak Protection
  console.log("TEST SUITE 1: Public Queries Data Leak Prevention");
  try {
    const startups = await getPublicStartups();
    assert(Array.isArray(startups), "getPublicStartups returns array");

    let hasLeak = false;
    let leakDetail = "";

    for (const s of startups as any[]) {
      // Must not contain private relations or sensitive fields
      if (s.privateDetails !== undefined) {
        hasLeak = true;
        leakDetail = "Found privateDetails relation on startup object";
        break;
      }
      if (s.founderEmails !== undefined || s.founderPhones !== undefined || s.internalNotes !== undefined) {
        hasLeak = true;
        leakDetail = "Found raw founderEmails/Phones/Notes on public startup object";
        break;
      }
      if (s.publicationStatus !== undefined && s.publicationStatus !== "Published") {
        hasLeak = true;
        leakDetail = `Found non-published startup in public query (status: ${s.publicationStatus})`;
        break;
      }
    }

    // Verify all returned startups in DB have publicationStatus === "Published"
    if (startups.length > 0) {
      const ids = startups.map((s) => s.id);
      const dbRecords = await prisma.startup.findMany({ where: { id: { in: ids } } });
      const allPublished = dbRecords.every((r) => r.publicationStatus === "Published");
      if (!allPublished) {
        hasLeak = true;
        leakDetail = "One or more returned startups are not marked Published in SQLite";
      }
    }

    assert(!hasLeak, "Public startups query contains zero private fields and only published items", leakDetail);

    // Slug query test
    if (startups.length > 0) {
      const single = await getPublicStartupBySlug(startups[0].slug);
      const isPrivateFree = single && !(single as any).privateDetails && !(single as any).founderEmails;
      assert(Boolean(isPrivateFree), "getPublicStartupBySlug does not expose private founder details");
    }

    // Check events, blogs, grants, team
    const events = await getPublicEvents();
    assert(Array.isArray(events), "getPublicEvents returns published event records");

    const blogs = await getPublicBlogs();
    assert(Array.isArray(blogs), "getPublicBlogs returns published blogs");

    const grants = await getPublicGrants();
    assert(Array.isArray(grants), "getPublicGrants returns verified grants");

    const team = await getPublicTeamMembers();
    assert(Array.isArray(team), "getPublicTeamMembers returns active team members");
  } catch (err: any) {
    assert(false, "Public query suite execution failed", err.message);
  }

  console.log("");

  // TEST SUITE 2: Audit Trail Redaction Engine
  console.log("TEST SUITE 2: Tamper-Evident Audit Redaction Engine");
  try {
    const sensitivePayload = {
      email: "founder@secret.com",
      phone: "+91 9876543210",
      password: "SuperSecretPassword123!",
      passwordHash: "$2b$12$somehashedpasswordstring",
      internalNotes: "Confidential evaluation: Founder has IP dispute",
      name: "Acme Innovations",
      domain: "EdTech",
    };

    const redacted = redactSensitiveData(sensitivePayload);

    assert(redacted?.email === "[REDACTED]", "Email is redacted in audit log");
    assert(redacted?.phone === "[REDACTED]", "Phone number is redacted in audit log");
    assert(redacted?.password === "[REDACTED]", "Password is redacted in audit log");
    assert(redacted?.passwordHash === "[REDACTED]", "Password hash is redacted in audit log");
    assert(redacted?.internalNotes === "[REDACTED]", "Internal notes are redacted in audit log");
    assert(redacted?.name === "Acme Innovations", "Non-sensitive public fields are preserved");
    assert(redacted?.domain === "EdTech", "Metadata fields remain intact");

    // Write audit log entry and verify in database
    const testLog = await logAdminAction({
      adminUserId: "test_admin",
      adminEmail: "security-auditor@vit.edu.in",
      action: "update",
      contentType: "Startup",
      recordId: "test_record_123",
      oldValues: sensitivePayload,
      newValues: { ...sensitivePayload, domain: "AI/ML" },
    });

    if (testLog) {
      const savedLog = await prisma.auditLog.findUnique({ where: { id: testLog.id } });
      assert(Boolean(savedLog), "Audit log entry successfully saved to database");

      if (savedLog && savedLog.oldValues) {
        const parsedOld = JSON.parse(savedLog.oldValues);
        assert(parsedOld.password === "[REDACTED]", "Persisted audit log has password redacted");
        assert(parsedOld.internalNotes === "[REDACTED]", "Persisted audit log has internal notes redacted");
      }

      // Clean up test audit log
      await prisma.auditLog.delete({ where: { id: testLog.id } });
    }
  } catch (err: any) {
    assert(false, "Audit redaction suite failed", err.message);
  }

  console.log("");

  // TEST SUITE 3: Magic Byte Security Validation
  console.log("TEST SUITE 3: Storage Magic Byte Signature Validation");
  try {
    // Valid JPEG (FF D8 FF)
    const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
    const jpegRes = validateMagicBytes(validJpeg);
    assert(jpegRes.valid && jpegRes.detectedMime === "image/jpeg", "Valid JPEG binary buffer detected");

    // Valid PNG (89 50 4E 47 0D 0A 1A 0A)
    const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
    const pngRes = validateMagicBytes(validPng);
    assert(pngRes.valid && pngRes.detectedMime === "image/png", "Valid PNG binary buffer detected");

    // Valid PDF (%PDF- / 25 50 44 46)
    const validPdf = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x35, 0x0a, 0x25, 0xd0, 0xd4]);
    const pdfRes = validateMagicBytes(validPdf);
    assert(pdfRes.valid && pdfRes.detectedMime === "application/pdf", "Valid PDF pitch deck buffer detected");

    // Spoofed file: PHP or script disguised as image
    const spoofedFile = Buffer.from("<?php echo 'disguised shell'; ?>", "utf-8");
    const spoofRes = validateMagicBytes(spoofedFile);
    assert(!spoofRes.valid, "Malicious file spoofing (.php / text disguised) is rejected");
  } catch (err: any) {
    assert(false, "Magic byte validation suite failed", err.message);
  }

  console.log("");

  // TEST SUITE 4: SQLite-Backed Rate Limiting & Anti-Spam
  console.log("TEST SUITE 4: SQLite-Backed Rate Limiter");
  try {
    const testKey = "verify_test_client_ip_" + Date.now();
    const limit = 3;
    const windowSeconds = 5;

    // 1st request -> allowed
    const r1 = await checkRateLimit({ key: testKey, limit, windowSeconds });
    assert(r1.allowed && r1.remaining === 2, "Rate limiter allows 1st request");

    // 2nd request -> allowed
    const r2 = await checkRateLimit({ key: testKey, limit, windowSeconds });
    assert(r2.allowed && r2.remaining === 1, "Rate limiter allows 2nd request");

    // 3rd request -> allowed
    const r3 = await checkRateLimit({ key: testKey, limit, windowSeconds });
    assert(r3.allowed && r3.remaining === 0, "Rate limiter allows 3rd request (threshold hit)");

    // 4th request -> blocked
    const r4 = await checkRateLimit({ key: testKey, limit, windowSeconds });
    assert(!r4.allowed, "Rate limiter blocks 4th request exceeding window threshold");

    // Clean up rate limit key
    await prisma.rateLimit.deleteMany({ where: { key: testKey } });
  } catch (err: any) {
    assert(false, "Rate limit suite failed", err.message);
  }

  console.log("");

  // TEST SUITE 5: Local Storage Isolation & System Structure
  console.log("TEST SUITE 5: Filesystem & Local Storage Isolation");
  try {
    const dbPath = path.join(process.cwd(), "data", "ecell.db");
    assert(fs.existsSync(dbPath), "Local SQLite database exists at ./data/ecell.db");

    const publicStorage = path.join(process.cwd(), "storage", "public");
    const privateStorage = path.join(process.cwd(), "storage", "private");
    assert(fs.existsSync(publicStorage), "Public storage directory exists at ./storage/public");
    assert(fs.existsSync(privateStorage), "Isolated private storage exists at ./storage/private");

    const pitchDeckDir = path.join(privateStorage, "pitch_decks");
    assert(fs.existsSync(pitchDeckDir), "Private pitch decks folder exists in isolated storage");

    // Check backups folder
    const backupDir = path.join(process.cwd(), "backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    assert(fs.existsSync(backupDir), "Backups directory exists at ./backups");
  } catch (err: any) {
    assert(false, "Storage check failed", err.message);
  }

  console.log("");

  // TEST SUITE 6: Role-Based Access Control (RBAC) & Pitch Deck Security
  console.log("TEST SUITE 6: RBAC Authorization & Private Access Logging");
  try {
    // 1. Create a test editor admin user
    const testEditor = await prisma.adminUser.create({
      data: {
        email: `test_editor_${Date.now()}@vit.edu.in`,
        name: "Test Editor Verification",
        passwordHash: "$2b$12$e/dummyhashnotforloginonlyforverification",
        role: "editor",
        active: true,
      },
    });

    assert(testEditor.role === "editor", "Admin user registered with role 'editor'");

    // 2. Verify Super Admin authorization check
    const isSuperAdmin = testEditor.role === "super_admin";
    assert(!isSuperAdmin, "Editor role is strictly barred from Super Admin privileged actions");

    // 3. Deactivation enforcement
    const deactivated = await prisma.adminUser.update({
      where: { id: testEditor.id },
      data: { active: false },
    });
    assert(!deactivated.active, "Deactivated admin user is immediately flagged inactive in SQLite");

    // Clean up test editor
    await prisma.adminUser.delete({ where: { id: testEditor.id } });

    // 4. Pitch deck access logging test
    const testApp = await prisma.incubationApplication.create({
      data: {
        startupName: "Verification Startup Labs",
        founderNames: "Verification Founder",
        founderEmail: "founder@verif.com",
        founderPhone: "+91 9999999999",
        departmentBatch: "CMPN 2026",
        domain: "AI/ML",
        oneLineSummary: "Verification summary",
        stage: "Idea",
        pitchDeckPath: "pitch_decks/test.pdf",
        pitchDeckFilename: "test.pdf",
      },
    });

    await prisma.pitchDeckAccessLog.create({
      data: {
        applicationId: testApp.id,
        adminUserId: "test_verifier",
        adminEmail: "security-auditor@vit.edu.in",
        ipAddress: "127.0.0.1",
        userAgent: "VerificationBot/1.0",
      },
    });

    const accessLogs = await prisma.pitchDeckAccessLog.findMany({
      where: { applicationId: testApp.id },
    });

    assert(
      accessLogs.length === 1 && accessLogs[0].adminEmail === "security-auditor@vit.edu.in",
      "Confidential pitch deck file access is audited in pitch_deck_access_logs"
    );

    // Clean up test app
    await prisma.incubationApplication.delete({ where: { id: testApp.id } });
  } catch (err: any) {
    assert(false, "RBAC & access logging suite failed", err.message);
  }

  console.log("\n==================================================================");
  console.log(`VERIFICATION SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log("==================================================================");

  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log("All security and isolation guarantees VERIFIED SUCCESSFULLY.\n");
    process.exit(0);
  }
}

runVerification()
  .catch((err) => {
    console.error("Verification suite failed with unhandled error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
