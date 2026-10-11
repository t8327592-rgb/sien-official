import { requireAdminPage } from "@/lib/admin-page-auth";
import { prisma } from "@/lib/prisma";
import PortfolioClient from "@/components/admin/PortfolioClient";

export const dynamic = "force-dynamic";

export default async function AdminPortfolioPage() {
  await requireAdminPage();
  const portfolios = await prisma.portfolio.findMany({
    orderBy: { orderIndex: 'asc' }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">実績管理</h1>
        <p className="text-slate-500 text-sm mt-1">公開ページに表示されるポートフォリオの追加・編集・削除が行えます。</p>
      </div>

      <PortfolioClient initialData={portfolios} />
    </div>
  );
}
