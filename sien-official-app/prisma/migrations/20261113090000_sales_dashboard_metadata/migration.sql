-- Additive dashboard metadata only. No source table changes or data backfill.
CREATE TABLE "SalesReview" (
  "id" TEXT NOT NULL, "mode" TEXT NOT NULL, "directId" TEXT NOT NULL, "pxEntryId" TEXT NOT NULL,
  "status" TEXT NOT NULL, "amount" INTEGER NOT NULL DEFAULT 0, "fee" INTEGER NOT NULL DEFAULT 0,
  "withholding" INTEGER NOT NULL DEFAULT 0, "sourceHash" TEXT NOT NULL, "reason" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SalesReview_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SalesReview_valid" CHECK ("mode" IN ('CASH','REVENUE') AND "status" IN ('PENDING','DISTINCT','DUPLICATE') AND "amount" >= 0 AND "fee" >= 0 AND "withholding" >= 0 AND "version" > 0)
);
CREATE UNIQUE INDEX "SalesReview_mode_directId_pxEntryId_key" ON "SalesReview"("mode", "directId", "pxEntryId");
CREATE INDEX "SalesReview_pxEntryId_idx" ON "SalesReview"("pxEntryId");
CREATE TABLE "SalesPxAccounting" (
  "pxEntryId" TEXT NOT NULL, "revenueOn" VARCHAR(10), "sourceHash" TEXT NOT NULL, "reason" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SalesPxAccounting_pkey" PRIMARY KEY ("pxEntryId")
);
CREATE TABLE "SalesReviewAudit" (
  "id" TEXT NOT NULL, "entityKind" TEXT NOT NULL, "entityKey" TEXT NOT NULL, "before" JSONB, "after" JSONB NOT NULL,
  "reason" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SalesReviewAudit_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SalesReviewAudit_entityKind_entityKey_createdAt_idx" ON "SalesReviewAudit"("entityKind", "entityKey", "createdAt");
