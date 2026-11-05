import { requireAdminPage } from "@/lib/admin-page-auth";
import { prisma } from "@/lib/prisma";
import { ExpenseCreateForm } from "@/components/admin/finance/ExpenseCreateForm";
import { FinanceDashboardClient } from "@/components/admin/finance/FinanceDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminFinancePage() {
  await requireAdminPage();
  const revenueOrders = await prisma.order.findMany({
    where: { isTest: false },
    include: { payments: true },
    orderBy: { createdAt: "desc" },
  });

  // 経費データの取得
  const expenses = await prisma.expense.findMany({
    orderBy: { date: "desc" },
  });

  // 目標設定の取得
  const siteSetting = await prisma.siteSetting.findUnique({
    where: { id: "default" },
  });

  return (
    <div className="space-y-8">
      <FinanceDashboardClient
        initialOrders={revenueOrders}
        initialExpenses={expenses}
        initialTargetSales={siteSetting?.targetMonthlySales || 0}
      />

      <ExpenseCreateForm />

    </div>
  );
}
