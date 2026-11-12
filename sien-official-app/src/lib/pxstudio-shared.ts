export const PX_HEADERS = ["送金日", "楽曲名", "カテゴリ", "依頼者名", "制作費(円)", "手数料(円)", "源泉徴収(円)", "手取り(円)", "支払いステータス"] as const;
export const PX_MAX_BYTES = 1024 * 1024;
export const PX_MAX_ROWS = 2000;

export type PxValues = {
  sentOn: string; songTitle: string; category: string; clientName: string;
  gross: number; fee: number; withholding: number; net: number; paymentStatus: string;
};
export type PxEntryView = PxValues & { id: string; version: number; fingerprint: string };
export type PxPreviewRow = PxValues & {
  rowNumber: number; difference: number; repeated: boolean;
  exactIds: string[]; candidates: PxEntryView[];
};
export type PxPreview = {
  token: string; expiresAt: number; fileHash: string; alreadyImported: boolean;
  rows: PxPreviewRow[];
};
export type PxDecision = { action: "add" | "skip" | "update"; targetId?: string };
export type PxHistoryView = {
  id: string; fileName: string; importedAt: string;
  rowCount: number; added: number; updated: number; skipped: number; warningCount: number;
};

export function pxDifference(row: PxValues) {
  return row.gross - row.fee - row.withholding - row.net;
}

export function pxMonthlySummary(rows: PxValues[], year: number) {
  const months = Array.from({ length: 12 }, (_, month) => ({ month: month + 1, count: 0, gross: 0, fee: 0, withholding: 0, net: 0, warnings: 0, difference: 0 }));
  for (const row of rows) {
    if (row.sentOn.slice(0, 4) !== String(year)) continue;
    const month = months[Number(row.sentOn.slice(5, 7)) - 1];
    month.count++;
    month.gross += row.gross; month.fee += row.fee;
    month.withholding += row.withholding; month.net += row.net;
    month.difference += pxDifference(row);
    if (pxDifference(row) !== 0) month.warnings++;
  }
  return months;
}
