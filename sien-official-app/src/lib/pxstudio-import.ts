import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { ApiError } from "./api-input";
import { PX_HEADERS, PX_MAX_BYTES, PX_MAX_ROWS, pxDifference, type PxEntryView, type PxPreview, type PxValues, type PxDecision } from "./pxstudio-shared";

type ParsedRow = PxValues & { rawCells: string[]; fingerprint: string; rowNumber: number };
export const pxHash = (value: string) => createHash("sha256").update(value).digest("hex");
export function pxValues(row: PxValues): PxValues {
  return { sentOn: row.sentOn, songTitle: row.songTitle, category: row.category, clientName: row.clientName,
    gross: row.gross, fee: row.fee, withholding: row.withholding, net: row.net, paymentStatus: row.paymentStatus };
}

// RFC 4180 quoting, embedded newlines and CRLF. Reject malformed CSV rather than shifting columns.
export function parsePxCsv(csv: unknown) {
  if (typeof csv !== "string" || !csv.length || Buffer.byteLength(csv, "utf8") > PX_MAX_BYTES) throw new ApiError(400, "CSVは空でない1MB以下のUTF-8ファイルを指定してください。");
  if (csv.includes("\0") || csv.includes("\ufffd")) throw new ApiError(400, "CSVの文字コードを確認してください。UTF-8に対応しています。");
  const input = csv.replace(/^\uFEFF/, "");
  const records: string[][] = [];
  let row: string[] = [], cell = "", quoted = false, closed = false;
  const endCell = () => { row.push(cell); cell = ""; closed = false; };
  const endRow = () => {
    endCell(); records.push(row); row = [];
    if (records.length > PX_MAX_ROWS + 1) throw new ApiError(400, `CSVは${PX_MAX_ROWS}明細以内に分割してください。`);
  };
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (quoted) {
      if (char === '"') {
        if (input[i + 1] === '"') { cell += '"'; i++; }
        else { quoted = false; closed = true; }
      } else cell += char;
    } else if (char === ",") endCell();
    else if (char === "\n" || char === "\r") { if (char === "\r" && input[i + 1] === "\n") i++; endRow(); }
    else if (char === '"' && !cell && !closed) quoted = true;
    else {
      if (closed || char === '"') throw new ApiError(400, "CSVの引用符の形式が正しくありません。");
      cell += char;
    }
  }
  if (quoted) throw new ApiError(400, "CSVの引用符が閉じていません。");
  if (row.length || cell || closed) endRow();
  if (JSON.stringify(records[0]) !== JSON.stringify(PX_HEADERS)) throw new ApiError(400, "PXstudio CSVの9列の列名・並び順を確認してください。");
  if (records.length < 2) throw new ApiError(400, "CSVに明細がありません。");
  const rows: ParsedRow[] = records.slice(1).map((cells, i) => {
    const fail = (label: string): never => { throw new ApiError(400, `明細${i + 1}：${label}を確認してください。`); };
    if (cells.length !== 9) fail("列数");
    if (cells.some(c => !c.trim() || c.length > 1000)) fail("空欄または文字数");
    const sentOn = cells[0];
    const date = new Date(sentOn + "T00:00:00Z");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(sentOn) || sentOn < "1900-01-01" || sentOn > "9999-12-31" || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== sentOn) fail("送金日");
    const money = (index: number) => {
      if (!/^\d+$/.test(cells[index])) fail(PX_HEADERS[index]);
      const n = Number(cells[index]);
      if (!Number.isSafeInteger(n) || n > 2147483647) fail(PX_HEADERS[index]);
      return n;
    };
    const values: PxValues = { sentOn, songTitle: cells[1], category: cells[2], clientName: cells[3],
      gross: money(4), fee: money(5), withholding: money(6), net: money(7), paymentStatus: cells[8] };
    return { ...values, rawCells: cells, fingerprint: pxHash(JSON.stringify(values)), rowNumber: i + 1 };
  });
  // Order-independent, multiplicity-preserving identity also catches renamed/reordered exports.
  return { rows,
    fileHash: pxHash(JSON.stringify(rows.map(r => r.fingerprint).sort())),
    // Decisions use row positions, so their confirmation must also bind the original row order.
    previewHash: pxHash(JSON.stringify(rows.map(r => r.fingerprint))) };
}

const candidateKey = (r: PxValues) => JSON.stringify([r.songTitle, r.category, r.clientName]);
export function buildPxPreview(rows: ParsedRow[], entries: PxEntryView[]) {
  const counts = new Map<string, number>();
  const byName = new Map<string, PxEntryView[]>(), byHash = new Map<string, PxEntryView[]>();
  for (const row of rows) counts.set(row.fingerprint, (counts.get(row.fingerprint) || 0) + 1);
  for (const entry of entries) {
    const key = candidateKey(entry);
    byName.set(key, [...(byName.get(key) || []), entry]);
    byHash.set(entry.fingerprint, [...(byHash.get(entry.fingerprint) || []), entry]);
  }
  return rows.map(row => ({ ...pxValues(row), rowNumber: row.rowNumber, difference: pxDifference(row),
    repeated: counts.get(row.fingerprint)! > 1,
    exactIds: (byHash.get(row.fingerprint) || []).map(e => e.id),
    candidates: byName.get(candidateKey(row)) || [] }));
}

export function pxSnapshot(entries: PxEntryView[]) {
  return pxHash(JSON.stringify(entries.map(e => [e.id, e.version, e.fingerprint]).sort((a, b) => String(a[0]).localeCompare(String(b[0])))));
}
function signature(fileHash: string, snapshot: string, expiresAt: number) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new ApiError(503, "認証設定を確認してください。");
  return createHmac("sha256", secret).update(JSON.stringify(["pxstudio-preview-v1", fileHash, snapshot, expiresAt])).digest("hex");
}
export function signPxPreview(fileHash: string, entries: PxEntryView[], expiresAt: number) {
  return signature(fileHash, pxSnapshot(entries), expiresAt);
}
export function verifyPxPreview(token: unknown, expiresAt: unknown, fileHash: string, entries: PxEntryView[]) {
  if (typeof expiresAt !== "number" || !Number.isSafeInteger(expiresAt) || expiresAt < Date.now() || expiresAt > Date.now() + 31 * 60 * 1000 || typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) throw new ApiError(409, "確認内容の有効期限が切れました。もう一度CSVを確認してください。");
  if (!timingSafeEqual(Buffer.from(token, "hex"), Buffer.from(signPxPreview(fileHash, entries, expiresAt), "hex"))) throw new ApiError(409, "CSVまたは登録済みデータが変わりました。もう一度CSVを確認してください。");
}

export function validatePxDecisions(value: unknown, preview: PxPreview["rows"], entries: PxEntryView[] = []): PxDecision[] {
  if (!Array.isArray(value) || value.length !== preview.length) throw new ApiError(400, "全明細の処理を選択してください。");
  const targets = new Set<string>();
  return value.map((decision, i) => {
    if (!decision || typeof decision !== "object" || !["add", "skip", "update"].includes(decision.action)) throw new ApiError(400, `明細${i + 1}の処理を選択してください。`);
    if (decision.action !== "update") return { action: decision.action };
    if (typeof decision.targetId !== "string" || ![...preview[i].candidates, ...entries].some(e => e.id === decision.targetId)) throw new ApiError(400, `明細${i + 1}の更新先を確認してください。`);
    if (targets.has(decision.targetId)) throw new ApiError(400, "同じ登録済み明細を複数回更新できません。更新先を確認してください。");
    targets.add(decision.targetId);
    return { action: "update", targetId: decision.targetId };
  });
}
