import { adminText, adminBoolean } from "@/lib/admin-content-input";
import { ApiError } from "@/lib/api-input";
export function validatePostContent(data: Record<string, unknown>) {
  if (!["BLOG", "NEWS"].includes(String(data.type))) throw new ApiError(400, "記事の種類を選択してください。");
  return { title: adminText(data.title, "タイトル", 300, true), content: adminText(data.content, "本文", 150000, true), type: data.type as string,
    category: adminText(data.category, "カテゴリー", 200) || null, published: adminBoolean(data.published, false) };
}
