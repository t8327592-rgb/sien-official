# Retire receipt number issuance

Apply before deploying the new application. `scripts/audit-migrations.mjs --deployment --apply`
checks and applies the known non-destructive SQL in a transaction. It does not delete or
update customer rows. Read-only verification is available without `--apply`.

The historical `receiptNumber` column is made nullable; existing values are retained
but no longer read, displayed, searched, or issued by the application. The
`SubmissionReceipt` table continues to hold idempotency hashes, the server-side quote,
and the original consent record. These are required to prevent duplicate submissions.

Rollback: deploying the old application is schema-compatible because it supplies a
number for new rows. Do not restore `NOT NULL` while new rows have a null number.
Restoring the constraint would require a separately reviewed backfill; no automatic
backfill or data removal is included.

Old queued customer receipt emails are skipped by the new worker and marked
`SKIPPED`, never delivered or exposed as a retryable action. Already sent historical
emails and Discord messages are not modified.
