import fs from "fs";
import path from "path";
import crypto from "crypto";

function getStoragePaths() {
  const root = process.cwd();
  const storageRoot = path.join(root, "storage");
  const publicDir = path.join(storageRoot, "public");
  const privateDir = path.join(storageRoot, "private");
  return { storageRoot, publicDir, privateDir };
}

function ensureDirectoriesExist() {
  const { publicDir, privateDir } = getStoragePaths();
  const dirs = [
    publicDir,
    privateDir,
    path.join(publicDir, "logos"),
    path.join(publicDir, "events"),
    path.join(publicDir, "team"),
    path.join(publicDir, "blogs"),
    path.join(publicDir, "reports"),
    path.join(privateDir, "pitch_decks"),
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

export type AllowedMimeType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "application/pdf";

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  detectedMime?: AllowedMimeType;
  extension?: string;
}

/**
 * Checks magic byte signatures for security.
 * Prevents disguised files (e.g. php/html disguised as .jpg).
 */
export function validateMagicBytes(buffer: Buffer): FileValidationResult {
  if (buffer.length < 12) {
    return { valid: false, error: "File too small or empty" };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedMime: "image/jpeg", extension: "jpg" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return { valid: true, detectedMime: "image/png", extension: "png" };
  }

  // WebP: RIFF ... WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { valid: true, detectedMime: "image/webp", extension: "webp" };
  }

  // PDF: %PDF- (25 50 44 46)
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return { valid: true, detectedMime: "application/pdf", extension: "pdf" };
  }

  return {
    valid: false,
    error: "Invalid file signature. Only standard JPG, PNG, WebP, and PDF files are accepted.",
  };
}

export interface SaveFileOptions {
  buffer: Buffer;
  originalFilename: string;
  isPrivate?: boolean;
  subfolder?: "logos" | "events" | "team" | "blogs" | "reports" | "pitch_decks";
  maxSizeBytes?: number;
}

export async function saveFile({
  buffer,
  originalFilename,
  isPrivate = false,
  subfolder = "logos",
  maxSizeBytes,
}: SaveFileOptions): Promise<{ relativePath: string; publicUrl?: string; filename: string }> {
  ensureDirectoriesExist();
  const { publicDir, privateDir } = getStoragePaths();

  // 1. Check size limit
  const limit = maxSizeBytes || (subfolder === "pitch_decks" || subfolder === "reports" ? 10 * 1024 * 1024 : 5 * 1024 * 1024);
  if (buffer.length > limit) {
    const limitMB = Math.round(limit / (1024 * 1024));
    throw new Error(`File exceeds maximum size limit of ${limitMB} MB`);
  }

  // 2. Validate magic bytes
  const validation = validateMagicBytes(buffer);
  if (!validation.valid || !validation.extension) {
    throw new Error(validation.error || "File signature validation failed");
  }

  // If subfolder is pitch_decks, require PDF
  if (subfolder === "pitch_decks" && validation.detectedMime !== "application/pdf") {
    throw new Error("Pitch decks must be in PDF format");
  }

  // 3. Generate randomized collision-safe filename
  const randomId = crypto.randomUUID();
  const safeFilename = `${randomId}.${validation.extension}`;

  const baseDir = isPrivate ? privateDir : publicDir;
  const targetDir = path.join(baseDir, subfolder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filePath = path.join(targetDir, safeFilename);
  await fs.promises.writeFile(filePath, buffer);

  const relativePath = path.join(subfolder, safeFilename).replace(/\\/g, "/");

  if (!isPrivate) {
    return {
      relativePath,
      publicUrl: `/api/files/public/${relativePath}`,
      filename: safeFilename,
    };
  }

  return {
    relativePath,
    filename: safeFilename,
  };
}

export function getStorageFilePath(relativePath: string, isPrivate = false): string | null {
  const { publicDir, privateDir } = getStoragePaths();
  // Normalize and prevent directory traversal
  const safeRelative = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  const baseDir = isPrivate ? privateDir : publicDir;
  const fullPath = path.join(baseDir, safeRelative);

  if (!fullPath.startsWith(baseDir)) {
    return null;
  }

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  return fullPath;
}
