import { requireAdminPage } from "@/lib/admin-page-auth";
import { prisma } from "@/lib/prisma";
import ReviewListClient from "@/components/admin/ReviewListClient";

export const metadata = {
  title: "お客様の声管理 | Sien-Official Admin",
};

export default async function AdminReviewsPage() {
  await requireAdminPage();
  const reviews = await prisma.review.findMany({
    orderBy: { orderIndex: "asc" },
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">お客様の声管理</h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base">トップページに表示されるレビュー・お客様の声を管理します。</p>
        </div>
      </div>

      <ReviewListClient initialReviews={reviews} />
    </div>
  );
}
