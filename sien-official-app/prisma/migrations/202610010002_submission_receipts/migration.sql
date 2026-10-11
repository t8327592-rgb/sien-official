CREATE TABLE IF NOT EXISTS "SubmissionReceipt" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "requestKey" TEXT NOT NULL,
  "payloadHash" TEXT NOT NULL,
  "receiptNumber" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "quote" JSONB NOT NULL,
  "termsVersion" TEXT,
  "consentedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "SubmissionReceipt_requestKey_key" ON "SubmissionReceipt"("requestKey");
CREATE UNIQUE INDEX IF NOT EXISTS "SubmissionReceipt_receiptNumber_key" ON "SubmissionReceipt"("receiptNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "SubmissionReceipt_entityType_entityId_key" ON "SubmissionReceipt"("entityType", "entityId");
