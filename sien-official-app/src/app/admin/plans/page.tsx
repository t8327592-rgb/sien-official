import { requireAdminPage } from "@/lib/admin-page-auth";
import { prisma } from "@/lib/prisma";
import PlansOptionsClient from "@/components/admin/PlansOptionsClient";

export const dynamic = "force-dynamic";

export default async function AdminPlansPage() {
  await requireAdminPage();
  const [plans, options] = await Promise.all([
    prisma.plan.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.option.findMany({ orderBy: { createdAt: "asc" } })
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">料金プラン・オプション管理</h1>
      <PlansOptionsClient initialPlans={plans} initialOptions={options} />
    </div>
  );
}
