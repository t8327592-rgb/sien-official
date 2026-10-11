import { requireAdminPage } from "@/lib/admin-page-auth";
import { prisma } from "@/lib/prisma";
import BusinessListClient from "@/components/admin/BusinessListClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminBusinessContactsPage() {
  await requireAdminPage();
  const contacts = await prisma.businessContact.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">法人お問い合わせ管理</h1>
        <p className="text-slate-500 text-sm mt-1">法人・企業様からのお問い合わせやご相談の管理を行います。</p>
      </div>

      <BusinessListClient initialContacts={contacts} />
    </div>
  );
}
