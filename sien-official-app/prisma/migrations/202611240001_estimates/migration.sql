BEGIN;
CREATE TABLE "Estimate" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "seriesId" TEXT NOT NULL,
  "revision" INTEGER NOT NULL CHECK ("revision" > 0),
  "previousId" TEXT,
  "requestKey" TEXT NOT NULL,
  "payloadHash" TEXT NOT NULL,
  "content" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "Estimate_requestKey_key" ON "Estimate"("requestKey");
CREATE UNIQUE INDEX "Estimate_seriesId_revision_key" ON "Estimate"("seriesId", "revision");
CREATE INDEX "Estimate_createdAt_idx" ON "Estimate"("createdAt");
CREATE TABLE "EstimateOrder" (
  "estimateId" TEXT NOT NULL REFERENCES "Estimate"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  PRIMARY KEY ("estimateId", "orderId")
);
CREATE INDEX "EstimateOrder_orderId_idx" ON "EstimateOrder"("orderId");
COMMIT;
