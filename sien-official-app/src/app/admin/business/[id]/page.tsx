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

  return (
    <div className="p-8 pb-20">
      <BusinessDetailClient initialContact={contact} />
    </div>
  );
}
