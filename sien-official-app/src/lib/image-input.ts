import sharp from "sharp";
import { ApiError } from "@/lib/api-input";

export async function validateImageSource(value: unknown): Promise<string | null> {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || value.length > 1500000) throw new ApiError(400, "画像データは1MB以下にしてください。");
  if (value.startsWith("data:")) {
    const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
    if (!match) throw new ApiError(400, "JPEG・PNG・WebP画像を指定してください。");
    const bytes = Buffer.from(match[2], "base64");
    if (bytes.length > 1048576 || bytes.toString("base64") !== match[2]) throw new ApiError(400, "画像データが正しくありません。");
    try {
      const image = sharp(bytes, { limitInputPixels: 20000000, failOn: "warning" });
      const metadata = await image.metadata();
      if (metadata.format !== match[1] || (metadata.pages ?? 1) > 1) throw new Error("Unsupported image");
      // Decode fully, strip metadata/trailing content, and bound both dimensions.
      const decoded = await image.rotate().resize({ width: 2048, height: 2048, fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
      if (decoded.length > 1048576) throw new Error("Image too large");
      return `data:image/webp;base64,${decoded.toString("base64")}`;
    } catch { throw new ApiError(400, "画像を読み込めません。別のJPEG・PNG・WebP画像をお試しください。"); }
  }
  if (value.length > 2000 || /[\s\\\u0000-\u001f]/.test(value)) throw new ApiError(400, "画像URLが正しくありません。");
  if (/^\/(?!\/)[^?#]*\.(?:jpe?g|png|webp|avif)$/i.test(value)) return value;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && !url.username && !url.password) return url.href;
  } catch { /* Invalid URL is reported below. Remote URLs are never fetched here. */ }
  throw new ApiError(400, "画像にはHTTPSのURL、またはサイト内の画像パスを指定してください。");
}
