-- Stop issuing receipt numbers without deleting historical data.
-- Rollback requires filling NULLs before restoring NOT NULL; never reset the database.
ALTER TABLE "SubmissionReceipt" ALTER COLUMN "receiptNumber" DROP NOT NULL;
