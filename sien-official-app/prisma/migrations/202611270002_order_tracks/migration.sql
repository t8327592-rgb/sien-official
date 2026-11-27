ALTER TABLE "Order"
  ADD COLUMN "trackCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "autoTrackRevenue" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "OrderTrack" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "songTitle" TEXT NOT NULL,
  "planName" TEXT NOT NULL,
  "options" TEXT NOT NULL,
  "materialsUrl" TEXT NOT NULL,
  "referenceUrl" TEXT NOT NULL,
  "details" JSONB NOT NULL,
  "price" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "deliveryUrl" TEXT,
  "deliveredAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "OrderTrack_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "OrderTrack_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "OrderTrack_orderId_position_key" ON "OrderTrack"("orderId", "position");
