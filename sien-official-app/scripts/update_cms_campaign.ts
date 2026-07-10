import fs from 'fs';
import path from 'path';

// 1. Update src/lib/data/cms.ts
const cmsLibPath = path.join(__dirname, '../src/lib/data/cms.ts');
let cmsLibContent = fs.readFileSync(cmsLibPath, 'utf8');

if (!cmsLibContent.includes('getCampaigns')) {
  cmsLibContent += `
// ---------------------------------------------------------
// Campaign (キャンペーン・セール情報)
// ---------------------------------------------------------
export const getCampaigns = unstable_cache(
  async (activeOnly = true) => {
    return await prisma.campaign.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  },
  ['campaigns'],
  { revalidate: 60, tags: ['campaigns'] }
);
`;
  fs.writeFileSync(cmsLibPath, cmsLibContent, 'utf8');
}

// 2. Update src/app/actions/cms.ts
const cmsActionsPath = path.join(__dirname, '../src/app/actions/cms.ts');
let cmsActionsContent = fs.readFileSync(cmsActionsPath, 'utf8');

if (!cmsActionsContent.includes('createCampaign')) {
  cmsActionsContent += `
// ---------------------------------------------------------
// Campaign
// ---------------------------------------------------------
export async function createCampaign(data: {
  name: string;
  targetPlanId?: string | null;
  originalPrice?: number | null;
  campaignPrice: number;
  startDate?: Date | null;
  endDate?: Date | null;
  isActive?: boolean;
  description?: string | null;
}) {
  const result = await prisma.campaign.create({ data });
  revalidatePath("/", "layout");
  return { success: true, data: result };
}

export async function updateCampaign(id: string, data: {
  name?: string;
  targetPlanId?: string | null;
  originalPrice?: number | null;
  campaignPrice?: number;
  startDate?: Date | null;
  endDate?: Date | null;
  isActive?: boolean;
  description?: string | null;
}) {
  const result = await prisma.campaign.update({
    where: { id },
    data,
  });
  revalidatePath("/", "layout");
  return { success: true, data: result };
}

export async function deleteCampaign(id: string) {
  await prisma.campaign.delete({ where: { id } });
  revalidatePath("/", "layout");
  return { success: true };
}
`;
  fs.writeFileSync(cmsActionsPath, cmsActionsContent, 'utf8');
}

console.log('Campaign methods added to CMS layers.');
