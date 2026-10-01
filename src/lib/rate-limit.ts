import { prisma } from "./db/client";

interface RateLimitOptions {
  key: string;
  limit: number;
  windowSeconds: number;
}

export async function checkRateLimit({
  key,
  limit,
  windowSeconds,
}: RateLimitOptions): Promise<{ allowed: boolean; remaining: number }> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowSeconds * 1000);

  try {
    const existing = await prisma.rateLimit.findUnique({
      where: { key },
    });

    if (!existing || existing.expiresAt < now) {
      await prisma.rateLimit.upsert({
        where: { key },
        create: {
          key,
          count: 1,
          expiresAt,
        },
        update: {
          count: 1,
          expiresAt,
        },
      });
      return { allowed: true, remaining: limit - 1 };
    }

    if (existing.count >= limit) {
      return { allowed: false, remaining: 0 };
    }

    const updated = await prisma.rateLimit.update({
      where: { key },
      data: {
        count: { increment: 1 },
      },
    });

    return { allowed: true, remaining: Math.max(0, limit - updated.count) };
  } catch (error) {
    console.error("Rate limit check error:", error);
    // Allow request if rate limit check fails to prevent lockout on DB glitches
    return { allowed: true, remaining: 1 };
  }
}

/**
 * Checks honeypot field and submission timing.
 * Real humans take at least 2.5 seconds to fill a form.
 */
export function validateBotProtection({
  honeypot,
  formLoadedAt,
  minDurationSeconds = 2,
}: {
  honeypot?: string;
  formLoadedAt?: number;
  minDurationSeconds?: number;
}): { isBot: boolean; reason?: string } {
  // If hidden honeypot has any text, it's filled by a bot
  if (honeypot && honeypot.trim().length > 0) {
    return { isBot: true, reason: "Spam bot detected." };
  }

  // Minimum time check (forms submitted in < 2 seconds are bot automated)
  if (formLoadedAt) {
    const elapsedSeconds = (Date.now() - formLoadedAt) / 1000;
    if (elapsedSeconds < minDurationSeconds) {
      return { isBot: true, reason: "Form submitted too quickly." };
    }
  }

  return { isBot: false };
}
