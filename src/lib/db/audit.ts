import { prisma } from "./client";

const SENSITIVE_FIELDS = new Set([
  "password",
  "passwordHash",
  "password_hash",
  "email",
  "phone",
  "founderEmails",
  "founderPhones",
  "founder_emails",
  "founder_phones",
  "internalNotes",
  "internal_notes",
  "verificationNote",
  "verification_note",
  "pitchDeckPath",
  "pitch_deck_path",
  "details",
  "session",
  "secret",
]);

export interface AuditLogParams {
  adminUserId?: string | null;
  adminEmail?: string | null;
  action: "create" | "update" | "archive" | "restore" | "delete" | "publish" | "status_change";
  contentType: string;
  recordId: string;
  changedFields?: string[];
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export function sanitizeValues(values?: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!values) return null;
  const sanitized: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(values)) {
    if (SENSITIVE_FIELDS.has(key)) {
      sanitized[key] = "[REDACTED]";
    } else if (val instanceof Date) {
      sanitized[key] = val.toISOString();
    } else if (typeof val === "object" && val !== null) {
      sanitized[key] = "[OBJECT]";
    } else {
      sanitized[key] = val;
    }
  }

  return sanitized;
}

export const redactSensitiveData = sanitizeValues;

export async function logAdminAction(params: AuditLogParams) {
  try {
    const sanitizedOld = sanitizeValues(params.oldValues);
    const sanitizedNew = sanitizeValues(params.newValues);

    return await prisma.auditLog.create({
      data: {
        adminUserId: params.adminUserId || null,
        adminEmail: params.adminEmail || null,
        action: params.action,
        contentType: params.contentType,
        recordId: params.recordId,
        changedFields: params.changedFields ? JSON.stringify(params.changedFields) : null,
        oldValues: sanitizedOld ? JSON.stringify(sanitizedOld) : null,
        newValues: sanitizedNew ? JSON.stringify(sanitizedNew) : null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    });
  } catch (err) {
    // Non-blocking log failure in development, but print warning
    console.error("Failed to write audit log entry:", err);
    return null;
  }
}
