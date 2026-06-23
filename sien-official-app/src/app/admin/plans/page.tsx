import { prisma } from "@/lib/prisma";
import PlansOptionsClient from "@/components/admin/PlansOptionsClient";

export const dynamic = "force-dynamic";

export default async function AdminPlansPage() {
  const plans = await prisma.plan.findMany({
    orderBy: { createdAt: "asc" },
  });
  const options = await prisma.option.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PlansOptionsClient initialPlans={plans} initialOptions={options} />
    </div>
  );
}
