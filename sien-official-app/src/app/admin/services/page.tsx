import { requireAdminPage } from "@/lib/admin-page-auth";

import { prisma } from "@/lib/prisma";
import { ServiceList } from "./ServiceList";

export const dynamic = "force-dynamic";

export default async function AdminServicePage() {
  await requireAdminPage();
  const services = await prisma.service.findMany({ orderBy: { orderIndex: "asc" } });

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">サービス内容 管理</h1>
        <p className="text-slate-500 mt-2">サイトで提供しているサービス（ボーカルMIXなど）の情報を管理します。</p>
      </div>

      <ServiceList initialServices={services} />
    </div>
  );
}
