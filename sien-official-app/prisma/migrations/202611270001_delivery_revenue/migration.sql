ALTER TABLE "Order"
  ADD COLUMN "revenueOnHold" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "revenueAdjustment" JSONB;
