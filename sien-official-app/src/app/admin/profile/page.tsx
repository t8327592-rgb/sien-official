import { requireAdminPage } from "@/lib/admin-page-auth";
import { getProfile, getSiteSettings } from "@/lib/data/cms";
import { ProfileForm } from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  await requireAdminPage();
  const profile = await getProfile();
  const settings = await getSiteSettings();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">プロフィール・サイト情報管理</h1>
        <p className="text-slate-500 mt-2">サイト全体で共通利用されるプロフィールやSNSリンクなどの情報を一元管理します。</p>
      </div>

      <ProfileForm initialProfile={profile} initialSettings={settings} />
    </div>
  );
}
