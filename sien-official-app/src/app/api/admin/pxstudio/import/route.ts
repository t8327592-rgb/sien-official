import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/admin-api-auth";
import { ApiError, apiErrorResponse, readJson, textField } from "@/lib/api-input";
import { buildPxPreview, parsePxCsv, pxValues, signPxPreview, validatePxDecisions, verifyPxPreview } from "@/lib/pxstudio-import";
import { pxDifference } from "@/lib/pxstudio-shared";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await readJson(request, 3 * 1024 * 1024);
    if (!["preview", "commit"].includes(String(body.action))) throw new ApiError(400, "操作を確認してください。");
    const csv = body.csv;
    const { rows, fileHash, previewHash } = parsePxCsv(csv);
    const fileName = textField(body, "fileName", true, 200);
    if (body.action === "preview") {
      const [entries, existing] = await Promise.all([
        prisma.pxEntry.findMany({ orderBy: { id: "asc" } }),
        prisma.pxImport.findUnique({ where: { fileHash }, select: { id: true } }),
      ]);
      const expiresAt = Date.now() + 30 * 60 * 1000;
      return Response.json({ success: true, preview: { rows: buildPxPreview(rows, entries), fileHash,
        expiresAt, token: signPxPreview(previewHash, entries, expiresAt), alreadyImported: !!existing } }, { headers: { "Cache-Control": "no-store" } });
    }
    if (body.confirmed !== true) throw new ApiError(400, "照合結果と金額の注意事項を確認してください。");
    const result = await prisma.$transaction(async tx => {
      // Serializes all PXstudio writers; preview is read-only and checked again under this lock.
      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended('pxstudio-import-v1', 0))`;
      const existing = await tx.pxImport.findUnique({ where: { fileHash } });
      if (existing) return { id: existing.id, added: existing.added, updated: existing.updated, skipped: existing.skipped, replayed: true };
      const entries = await tx.pxEntry.findMany({ orderBy: { id: "asc" } });
      verifyPxPreview(body.token, body.expiresAt, previewHash, entries);
      const decisions = validatePxDecisions(body.decisions, buildPxPreview(rows, entries), entries);
      const added = decisions.filter(d => d.action === "add").length;
      const updated = decisions.filter(d => d.action === "update").length;
      const skipped = decisions.length - added - updated;
      const batch = await tx.pxImport.create({ data: { fileHash, fileName, rawCsv: csv as string,
        rowCount: rows.length, added, updated, skipped, warningCount: rows.filter(r => pxDifference(r) !== 0).length } });
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i], decision = decisions[i];
        const data = { ...pxValues(row), fingerprint: row.fingerprint, rawCells: row.rawCells };
        let entryId: string | undefined;
        const before = decision.action === "update" ? entries.find(e => e.id === decision.targetId)! : undefined;
        if (decision.action === "add") entryId = (await tx.pxEntry.create({ data })).id;
        if (before) entryId = (await tx.pxEntry.update({ where: { id: before.id }, data: { ...data, version: { increment: 1 } } })).id;
        await tx.pxImportChange.create({ data: { importId: batch.id, rowNumber: i + 1, action: decision.action,
          entryId, ...(before ? { before: { ...pxValues(before), rawCells: before.rawCells, version: before.version } } : {}),
          after: { ...pxValues(row), rawCells: row.rawCells } } });
      }
      return { id: batch.id, added, updated, skipped, replayed: false };
    }, { maxWait: 10000, timeout: 60000 });
    return Response.json({ success: true, result });
  } catch (error) {
    return apiErrorResponse(error) ?? Response.json({ success: false, error: "CSVを保存できませんでした。取り込み履歴を確認してから再試行してください。" }, { status: 500 });
  }
}
