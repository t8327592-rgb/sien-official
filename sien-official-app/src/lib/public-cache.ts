import { revalidatePath, revalidateTag } from "next/cache";

type PublicTag = "site-settings" | "profile" | "services" | "plans" | "options" | "portfolios" | "faqs" | "reviews" | "blog" | "news" | "campaigns";

export function invalidatePublicContent(...tags: PublicTag[]) {
  for (const tag of new Set(tags)) revalidateTag(tag, { expire: 0 });
  revalidatePath("/", "layout");
}
