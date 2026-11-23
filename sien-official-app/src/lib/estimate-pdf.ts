import { PDFDocument, rgb, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { estimateTotals, yen, type EstimateContent } from "./estimates";

export async function createEstimatePdf(content: EstimateContent, revision: number, fontBytes: Uint8Array, logoBytes: Uint8Array) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(fontBytes, { subset: false });
  const logo = await pdf.embedPng(logoBytes);
  pdf.setTitle(`見積書 ${content.number} 第${revision}版`);
  pdf.setAuthor("SIEN.OFFICIAL");
  const ink = rgb(.12, .12, .12), gray = rgb(.42, .42, .42), pale = rgb(.95, .95, .95), rule = rgb(.83, .83, .83);
  const width = 595.28, height = 841.89, margin = 40, inner = width - margin * 2;
  const supported = new Set(font.getCharacterSet());
  const clean = (value: string) => Array.from(value.replace(/\r\n?/g, "\n").replace(/\t/g, "  ")).map(ch => ch === "\n" || supported.has(ch.codePointAt(0)!) ? ch : "□").join("");
  let page!: PDFPage, y = 0;
  function draw(value: string, x: number, top: number, size = 9, color = ink) { page.drawText(clean(value), { x, y: top, font, size, color }); }
  function right(value: string, x: number, top: number, size = 9) { draw(value, x - font.widthOfTextAtSize(clean(value), size), top, size); }
  function wrap(value: string, maxWidth: number, size = 9) {
    const lines: string[] = [];
    for (const paragraph of clean(value).split("\n")) {
      let line = "";
      for (const ch of paragraph) {
        if (line && font.widthOfTextAtSize(line + ch, size) > maxWidth) { lines.push(line); line = ""; }
        line += ch;
      }
      lines.push(line);
    }
    return lines;
  }
  function newPage() {
    page = pdf.addPage([width, height]);
    page.drawImage(logo, { x: margin, y: height - 65, width: 145, height: 145 * logo.height / logo.width });
    right("御 見 積 書", width - margin, height - 59, 22);
    page.drawLine({ start: { x: margin, y: height - 80 }, end: { x: width - margin, y: height - 80 }, color: ink, thickness: 1 });
    y = height - 102;
    for (const line of wrap(`${content.clientName.replace(/様$/, "")} 様`, inner, 12)) { draw(line, margin, y, 12); y -= 18; }
    for (const line of wrap(`見積番号：${content.number}　 第${revision}版`, inner, 8)) { draw(line, margin, y, 8, gray); y -= 13; }
    draw(`発行日：${content.issuedOn}　 有効期限：${content.validUntil}`, margin, y, 8, gray); y -= 24;
  }
  function ensure(space: number) { if (y - space < 53) newPage(); }
  function tableHeader(title: string) {
    ensure(65);
    draw(title, margin, y, 10); y -= 17;
    page.drawRectangle({ x: margin, y: y - 5, width: inner, height: 19, color: pale });
    draw("楽曲・内容", margin + 6, y + 1, 8, gray);
    right("数量", 370, y + 1, 8); right("単価", 454, y + 1, 8); right("金額（税込）", width - margin - 6, y + 1, 8);
    y -= 18;
  }
  function row(description: string, quantity: number, unitPrice: number, note: string, title: string) {
    const lines = wrap(description, 279), notes = note ? wrap(note, 279, 8) : [];
    const space = Math.max(20, (lines.length + notes.length) * 12 + 8);
    const detail = [...lines.map(text => ({ text, size: 9, color: ink })), ...notes.map(text => ({ text, size: 8, color: gray }))];
    // Keep ordinary rows together; split very long per-song notes across pages
    // without printing the monetary amount again on continuation fragments.
    if (y - Math.min(space, 400) < 53) { newPage(); tableHeader(`${title}（続き）`); }
    let offset = 0;
    while (offset < detail.length) {
      const capacity = Math.max(1, Math.floor((y - 53 - 8) / 12));
      const chunk = detail.slice(offset, offset + capacity);
      chunk.forEach((line, index) => draw(line.text, margin + 6, y - index * 12, line.size, line.color));
      if (!offset) { right(String(quantity), 370, y); right(yen(unitPrice), 454, y); right(yen(quantity * unitPrice), width - margin - 6, y); }
      y -= Math.max(20, chunk.length * 12 + 8);
      page.drawLine({ start: { x: margin, y: y + 10.5 }, end: { x: width - margin, y: y + 10.5 }, color: rule, thickness: .4 });
      offset += chunk.length;
      if (offset < detail.length) { newPage(); tableHeader(`${title}（続き）`); }
    }
  }
  function subtotal(label: string, amount: number) {
    ensure(22); draw(label, margin + 6, y, 9, gray); right(yen(amount), width - margin - 6, y); y -= 22;
  }
  function paragraph(title: string, value: string) {
    if (!value.trim()) return;
    ensure(38); draw(title, margin, y, 10); y -= 15;
    for (const line of wrap(value, inner, 9)) { ensure(14); draw(line, margin, y, 9, gray); y -= 13; }
    y -= 8;
  }
  newPage();
  const groups = new Map<string, typeof content.lines>();
  content.lines.filter(line => line.kind === "BASE").forEach(line => groups.set(line.name, [...(groups.get(line.name) || []), line]));
  for (const [name, lines] of groups) {
    const title = `基本料金 / ${name}`;
    // Group names may be long; tableHeader's title is kept short, full name is in rows when needed.
    const shortTitle = wrap(title, inner, 10);
    tableHeader(shortTitle[0]);
    lines.forEach(line => row(`${line.songTitle}${shortTitle.length > 1 ? ` / ${name}` : ""}`, line.quantity, line.unitPrice, line.note, "基本料金"));
    subtotal(`${font.widthOfTextAtSize(name, 9) > inner - 165 ? "基本料金" : name} 小計`, lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0));
  }
  const options = content.lines.filter(line => line.kind === "OPTION");
  if (options.length) {
    tableHeader("オプション料金");
    const optionGroups = new Map<string, typeof options>();
    // Consolidate identical one-unit options only in the PDF. Source lines and
    // per-order discount rounding remain untouched, with all target songs shown.
    options.forEach(line => {
      const key = line.quantity === 1 ? JSON.stringify([line.name, line.unitPrice, line.note]) : line.id;
      optionGroups.set(key, [...(optionGroups.get(key) || []), line]);
    });
    for (const grouped of optionGroups.values()) {
      const line = grouped[0];
      const description = grouped.length === 1 ? `${line.songTitle} / ${line.name}` : `${line.name} / 対象：${grouped.map(item => item.songTitle).join("、")}`;
      // Long target lists are emitted separately instead of exceeding a page.
      if (wrap(description, 279).length > 24) grouped.forEach(item => row(`${item.songTitle} / ${item.name}`, item.quantity, item.unitPrice, item.note, "オプション料金"));
      else row(description, grouped.reduce((sum, item) => sum + item.quantity, 0), line.unitPrice, line.note, "オプション料金");
    }
    subtotal("オプション 小計", estimateTotals(content).options);
  }
  const totals = estimateTotals(content);
  const discountLabel = `${content.discount.name || "割引"}${content.discount.mode === "PERCENT" ? `（${content.discount.value}%OFF）` : ""}`;
  const discountLines = totals.discount ? wrap(discountLabel, inner - 160, 9) : [];
  ensure(92 + discountLines.length * 13);
  subtotal("割引前合計（税込）", totals.subtotal);
  if (totals.discount) {
    const top = y;
    discountLines.forEach(line => { draw(line, margin + 6, y, 9); y -= 13; });
    right(`-${yen(totals.discount)}`, width - margin - 6, top); y -= 5;
    if (content.discount.target !== "ALL") { draw(`対象明細の合計：${yen(totals.eligible)}`, margin + 6, y, 8, gray); y -= 15; }
  }
  page.drawRectangle({ x: margin, y: y - 27, width: inner, height: 42, color: pale });
  draw("お支払い総額（税込）", margin + 12, y - 11, 12);
  right(yen(totals.total), width - margin - 12, y - 13, 19); y -= 51;
  paragraph("備考・特記事項", content.notes);
  paragraph("お支払いのご案内", content.paymentGuide);
  pdf.getPages().forEach((p, index, pages) => {
    page = p; draw("SIEN.OFFICIAL", margin, 28, 8, gray); right(`${index + 1} / ${pages.length}`, width - margin, 28, 8);
  });
  return pdf.save();
}
