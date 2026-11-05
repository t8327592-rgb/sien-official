-- Additive only: legacy Order and BusinessContact values are retained.
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "customerType" TEXT NOT NULL DEFAULT 'PERSONAL';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "companyName" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "businessContactId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "isTest" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "confirmedPrice" INTEGER;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "confirmedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "revenueAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "financeVersion" INTEGER NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS "Order_businessContactId_key" ON "Order"("businessContactId");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Order_businessContactId_fkey' AND conrelid = '"Order"'::regclass) THEN
    ALTER TABLE "Order" ADD CONSTRAINT "Order_businessContactId_fkey" FOREIGN KEY ("businessContactId") REFERENCES "BusinessContact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
CREATE TABLE IF NOT EXISTS "PaymentRecord" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "orderId" TEXT NOT NULL,
  "requestKey" TEXT NOT NULL,
  "kind" TEXT NOT NULL DEFAULT 'RECEIPT',
  "amount" INTEGER NOT NULL,
  "fee" INTEGER NOT NULL DEFAULT 0,
  "withholding" INTEGER NOT NULL DEFAULT 0,
  "paidAt" TIMESTAMP(3) NOT NULL,
  "memo" TEXT,
  "voidedAt" TIMESTAMP(3),
  "voidReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentRecord_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "PaymentRecord_amounts_check" CHECK ("amount" >= 0 AND "fee" >= 0 AND "withholding" >= 0 AND ("amount"::bigint + "fee"::bigint + "withholding"::bigint) BETWEEN 1 AND 2147483647 AND "kind" IN ('RECEIPT', 'REFUND') AND ("kind" <> 'REFUND' OR ("fee" = 0 AND "withholding" = 0)))
);
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentRecord_requestKey_key" ON "PaymentRecord"("requestKey");
CREATE INDEX IF NOT EXISTS "PaymentRecord_orderId_paidAt_idx" ON "PaymentRecord"("orderId", "paidAt");
