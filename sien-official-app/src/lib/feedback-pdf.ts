import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { FEEDBACK_ITEMS, feedbackClientName, type FeedbackContent } from "./feedback";

export type FeedbackIdentity = { id: string; clientName: string; songTitle: string | null };

export async function createFeedbackPdf(order: FeedbackIdentity, content: FeedbackContent, fontBytes: Uint8Array) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  // Embed the complete CJK font: subsetting can drop glyph outlines in this
  // fontkit/font combination even when text extraction succeeds.
  const font = await pdf.embedFont(fontBytes, { subset: false });
  pdf.setTitle(`${order.songTitle || "楽曲名未設定"} - 録音・歌唱フィードバック`);
  pdf.setAuthor("SIEN");
  const ink = rgb(.09, .17, .22), teal = rgb(.07, .44, .46), muted = rgb(.34, .40, .44);
  const white = rgb(1, 1, 1), pale = rgb(.94, .97, .97);
  const width = 595.28, height = 841.89, margin = 44, inner = width - margin * 2;
  let page: PDFPage;
  let y = 0;
  const supported = new Set(font.getCharacterSet());
  const clean = (value: string) => Array.from(value.replace(/\r\n?/g, "\n").replace(/\t/g, "  "))
    .map(ch => ch === "\n" || supported.has(ch.codePointAt(0)!) ? ch : "□").join("");
  function lines(value: string, size: number, maxWidth = inner, face: PDFFont = font): string[] {
    const output: string[] = [];
    for (const paragraph of clean(value).split("\n")) {
      let line = "";
      for (const ch of paragraph) {
        if (line && face.widthOfTextAtSize(line + ch, size) > maxWidth) { output.push(line); line = ""; }
        line += ch;
      }
      output.push(line);
    }
    return output;
  }
  function draw(value: string, x: number, top: number, size = 10, color = ink) {
    page.drawText(clean(value), { x, y: top, font, size, color });
  }
  function newPage() {
    page = pdf.addPage([width, height]);
    page.drawRectangle({ x: 0, y: height - 119, width, height: 119, color: ink });
    draw("SIEN / RECORDING & VOCAL FEEDBACK", margin, height - 32, 9, white);
    draw("録音・歌唱フィードバック", margin, height - 67, 22, white);
    draw("次の録音・作品づくりにつなげるレポート", margin, height - 94, 10, white);
    y = height - 148;
  }
  function ensure(space: number) { if (y - space < 61) newPage(); }
  function paragraph(value: string, size = 10, color = ink, indent = 0) {
    for (const line of lines(value, size, inner - indent)) {
      ensure(size * 1.7);
      draw(line, margin + indent, y, size, color); y -= size * 1.7;
    }
    y -= 7;
  }
  function section(title: string) {
    ensure(75); y -= 7;
    draw(title, margin, y, 14, teal); y -= 28;
  }
  function assessments(group: "recording" | "vocal") {
    for (const { key, label } of FEEDBACK_ITEMS.filter(item => item.group === group)) {
      const item = content.items[key];
      const commentLines = lines(item.comment || "今回の確認対象外です。", 9, inner - 24);
      let offset = 0;
      while (offset < commentLines.length) {
        ensure(80);
        const capacity = Math.max(1, Math.floor((y - 61 - 46) / 15));
        const chunk = commentLines.slice(offset, offset + capacity);
        const needed = 38 + chunk.length * 15;
        page.drawRectangle({ x: margin, y: y - needed + 14, width: inner, height: needed, color: pale });
        draw(label + (offset ? "（続き）" : ""), margin + 12, y - 4, 10);
        draw(item.rating, width - margin - 112, y - 4, 9, teal);
        y -= 25;
        for (const line of chunk) { draw(line, margin + 12, y, 9, muted); y -= 15; }
        y -= 21; offset += chunk.length;
        if (offset < commentLines.length) newPage();
      }
    }
  }
  newPage();
  paragraph(`クライアント：${feedbackClientName(order.clientName)}`, 10);
  paragraph(`楽曲名：${order.songTitle || "未設定"}`, 10);
  paragraph(`発行日：${content.date}　　依頼ID：${order.id}`, 8, muted);
  section("01  今回の総評"); paragraph(content.summary);
  section("02  よかったところ"); paragraph(content.strengths);
  section("03  録音状態"); assessments("recording");
  paragraph("判定：良好／少し気になる／優先して改善／確認対象外", 8, muted);
  newPage();
  section("04  歌唱について"); assessments("vocal");
  const priorities = content.priorities.filter(point => point.title.trim());
  if (priorities.length) {
    section("05  次回の優先ポイント");
    priorities.forEach((point, index) => {
      ensure(90); paragraph(`${index + 1}. ${point.title}`, 11, teal);
      paragraph(point.observation, 10);
      paragraph(`次回の試し方：${point.action}`, 10);
    });
  }
  if (content.changes.trim()) { section("前回からの変化"); paragraph(content.changes); }
  if (content.closing.trim()) { section("最後に"); paragraph(content.closing); }
  ensure(60); y -= 8;
  paragraph("今回お預かりした音源をもとにした所見です。音源だけでは特定できない原因や、曲・録音条件による違いがあります。", 8, muted);
  const pages = pdf.getPages();
  pages.forEach((p, index) => {
    page = p;
    draw("SIEN / 録音・歌唱フィードバック", margin, 29, 8, muted);
    draw(`${index + 1} / ${pages.length}`, width - margin - 32, 29, 8, muted);
  });
  return pdf.save();
}
