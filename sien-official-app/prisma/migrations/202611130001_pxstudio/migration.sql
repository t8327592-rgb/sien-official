-- Additive only. This migration does not read or modify existing financial tables.
CREATE TABLE "PxEntry" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sentOn" VARCHAR(10) NOT NULL,
  "songTitle" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "clientName" TEXT NOT NULL,
  "gross" INTEGER NOT NULL,
  "fee" INTEGER NOT NULL,
  "withholding" INTEGER NOT NULL,
  "net" INTEGER NOT NULL,
  "paymentStatus" TEXT NOT NULL,
  "fingerprint" TEXT NOT NULL,
  "rawCells" JSONB NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "PxEntry_sentOn_idx" ON "PxEntry"("sentOn");
CREATE INDEX "PxEntry_fingerprint_idx" ON "PxEntry"("fingerprint");

CREATE TABLE "PxImport" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "fileHash" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "rawCsv" TEXT NOT NULL,
  "rowCount" INTEGER NOT NULL,
  "added" INTEGER NOT NULL,
  "updated" INTEGER NOT NULL,
  "skipped" INTEGER NOT NULL,
  "warningCount" INTEGER NOT NULL,
  "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "PxImport_fileHash_key" ON "PxImport"("fileHash");

CREATE TABLE "PxImportChange" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "importId" TEXT NOT NULL,
  "rowNumber" INTEGER NOT NULL,
  "action" TEXT NOT NULL,
  "entryId" TEXT,
  "before" JSONB,
  "after" JSONB NOT NULL,
  CONSTRAINT "PxImportChange_importId_fkey" FOREIGN KEY ("importId") REFERENCES "PxImport"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "PxImportChange_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "PxEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "PxImportChange_importId_rowNumber_key" ON "PxImportChange"("importId", "rowNumber");
CREATE INDEX "PxImportChange_entryId_idx" ON "PxImportChange"("entryId");
