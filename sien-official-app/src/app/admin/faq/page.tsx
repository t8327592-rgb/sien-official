import { requireAdminPage } from "@/lib/admin-page-auth";

import { prisma } from "@/lib/prisma";
import { FAQList } from "./FAQList";

export const dynamic = "force-dynamic";

export default async function AdminFAQPage() {
  await requireAdminPage();
  const faqs = await prisma.fAQ.findMany({ orderBy: { orderIndex: "asc" } });

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">FAQ (よくある質問) 管理</h1>
        <p className="text-slate-500 mt-2">サイトに表示される「よくある質問」の追加・編集・削除を行います。</p>
      </div>

      <FAQList initialFaqs={faqs} />
    </div>
  );
}
