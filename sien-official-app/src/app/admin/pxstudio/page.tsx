import { requireAdminPage } from "@/lib/admin-page-auth";
import { prisma } from "@/lib/prisma";
import { PxStudioClient } from "@/components/admin/pxstudio/PxStudioClient";

export const dynamic = "force-dynamic";

export default async function PxStudioPage() {
  await requireAdminPage();
  const [entries, history] = await Promise.all([
    prisma.pxEntry.findMany({ orderBy: [{ sentOn: "desc" }, { id: "asc" }] }),
    prisma.pxImport.findMany({ orderBy: { importedAt: "desc" }, take: 20,
      select: { id: true, fileName: true, importedAt: true, rowCount: true, added: true, updated: true, skipped: true, warningCount: true,
        changes: { where: { action: "update" }, orderBy: { rowNumber: "asc" }, take: 100, select: { rowNumber: true, before: true, after: true } } } }),
  ]);
  return <PxStudioClient entries={entries.map(e => ({ id: e.id, version: e.version, fingerprint: e.fingerprint,
    sentOn: e.sentOn, songTitle: e.songTitle, category: e.category, clientName: e.clientName,
    gross: e.gross, fee: e.fee, withholding: e.withholding, net: e.net, paymentStatus: e.paymentStatus }))}
    history={history.map(h => ({ ...h, importedAt: h.importedAt.toISOString() }))} />;
}
