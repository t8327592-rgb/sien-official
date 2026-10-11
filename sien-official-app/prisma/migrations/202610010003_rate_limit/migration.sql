CREATE TABLE IF NOT EXISTS "ApiRateLimit" (
  "key" TEXT PRIMARY KEY,
  "count" INTEGER NOT NULL,
  "expiresAt" TIMESTAMPTZ(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS "ApiRateLimit_expiresAt_idx" ON "ApiRateLimit"("expiresAt");
