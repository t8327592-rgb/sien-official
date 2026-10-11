import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-input";

// PostgreSQL is shared across instances. No process-local counters or trusted
// client-supplied IP headers: a global budget also bounds distributed abuse.
// Table creation belongs to deployment, never to a public request.
export async function cleanupExpiredRateLimits() {
  return prisma.$executeRaw`DELETE FROM "ApiRateLimit" WHERE "key" IN (
    SELECT "key" FROM "ApiRateLimit" WHERE "expiresAt" < NOW() - INTERVAL '1 day'
    ORDER BY "expiresAt" LIMIT 1000
  )`;
}

export async function consumeRateLimit(scope: string, limit: number, seconds: number, identity = "global") {
  const key = `${scope}:${createHash("sha256").update(identity).digest("hex")}`;
  try {
    const rows = await prisma.$queryRaw<{ count: number }[]>`
      INSERT INTO "ApiRateLimit" ("key", "count", "expiresAt")
      VALUES (${key}, 1, NOW() + ${seconds} * INTERVAL '1 second')
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "ApiRateLimit"."expiresAt" <= NOW() THEN 1 ELSE "ApiRateLimit"."count" + 1 END,
        "expiresAt" = CASE WHEN "ApiRateLimit"."expiresAt" <= NOW()
          THEN NOW() + ${seconds} * INTERVAL '1 second' ELSE "ApiRateLimit"."expiresAt" END
      WHERE "ApiRateLimit"."expiresAt" <= NOW() OR "ApiRateLimit"."count" < ${limit}
      RETURNING "count"`;
    if (!rows.length) throw new ApiError(429, "送信回数の上限に達しました。時間をおいて再度お試しください。", seconds);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("Rate limit storage unavailable");
    throw new ApiError(503, "現在送信を受け付けられません。時間をおいて再度お試しください。");
  }
}
