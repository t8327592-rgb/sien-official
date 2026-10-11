import { requireAdminPage } from "@/lib/admin-page-auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BusinessDetailClient from "@/components/admin/BusinessDetailClient";

export const dynamic = "force-dynamic";

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;

  const contact = await prisma.businessContact.findUnique({
    where: { id },
  });

  if (!contact) {
    notFound();
  }

  const receipt = await prisma.submissionReceipt.findUnique({ where: { entityType_entityId: { entityType: "BUSINESS", entityId: id } } });

  return (
    <div className="p-8 pb-20">
      <p className="font-bold">受付番号：{receipt?.receiptNumber || "旧受付（番号未発行）"}</p>
      <BusinessDetailClient initialContact={contact} />
    </div>
  );
}
