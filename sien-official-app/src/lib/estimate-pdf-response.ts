import { readFile } from "node:fs/promises";
import path from "node:path";
import { createEstimatePdf } from "./estimate-pdf";
import type { EstimateContent } from "./estimates";

export async function estimatePdfResponse(content: EstimateContent, revision: number) {
  const [font, logo] = await Promise.all([
    readFile(path.join(process.cwd(), "public/fonts/ZenKakuGothicNew-Regular.ttf")),
    readFile(path.join(process.cwd(), "public/logo.png")),
  ]);
  const bytes = await createEstimatePdf(content, revision, font, logo);
  const filename = encodeURIComponent(`見積書_${content.number}_第${revision}版.pdf`).replace(/['()*]/g, ch => `%${ch.charCodeAt(0).toString(16)}`);
  return new Response(new Uint8Array(bytes), { headers: {
    "Content-Type": "application/pdf", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff",
    "Content-Disposition": `attachment; filename="estimate-r${revision}.pdf"; filename*=UTF-8''${filename}`,
  } });
}
