"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateProfile, updateSiteSettings } from "@/app/actions/cms";
import toast from "react-hot-toast";

export function ProfileForm({ initialProfile, initialSettings }: { initialProfile: any, initialSettings: any }) {
  const [profile, setProfile] = useState({
    name: initialProfile?.name || "Sien",
    title: initialProfile?.title || "",
    bioShort: initialProfile?.bioShort || "",
    bioLong: initialProfile?.bioLong || "",
    imageUrl: initialProfile?.imageUrl || "",
    achievements: initialProfile?.achievements || "",
  });

  const [settings, setSettings] = useState({
    twitterUrl: initialSettings?.twitterUrl || "",
    youtubeUrl: initialSettings?.youtubeUrl || "",
    contactEmail: initialSettings?.contactEmail || "",
    ctaTitle: initialSettings?.ctaTitle || "",
    ctaDescription: initialSettings?.ctaDescription || "",
    footerText: initialSettings?.footerText || "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(profile);
      await updateSiteSettings(settings);
      toast.success("保存しました");
    } catch (e) {
      toast.error("エラーが発生しました");
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Profile Section */}
      <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
        <h2 className="text-xl font-bold border-b pb-4">プロフィール設定</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">名前</label>
            <input type="text" className="w-full border rounded-lg p-3" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">肩書き</label>
            <input type="text" className="w-full border rounded-lg p-3" value={profile.title} onChange={e => setProfile({...profile, title: e.target.value})} placeholder="例: Sound Creator" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">プロフィール画像URL</label>
          <input type="text" className="w-full border rounded-lg p-3" value={profile.imageUrl} onChange={e => setProfile({...profile, imageUrl: e.target.value})} placeholder="/avatar.png" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">短い紹介文 (ヘッダー等)</label>
          <input type="text" className="w-full border rounded-lg p-3" value={profile.bioShort} onChange={e => setProfile({...profile, bioShort: e.target.value})} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">詳しい紹介文</label>
          <textarea className="w-full border rounded-lg p-3 h-32" value={profile.bioLong} onChange={e => setProfile({...profile, bioLong: e.target.value})} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">実績情報 (改行可)</label>
          <textarea className="w-full border rounded-lg p-3 h-32" value={profile.achievements} onChange={e => setProfile({...profile, achievements: e.target.value})} placeholder="例: 総再生数1000万回突破" />
        </div>
      </section>

      {/* Site Settings Section */}
      <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
        <h2 className="text-xl font-bold border-b pb-4">サイト共通・SNS設定</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Twitter (X) URL</label>
            <input type="text" className="w-full border rounded-lg p-3" value={settings.twitterUrl} onChange={e => setSettings({...settings, twitterUrl: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">YouTube URL</label>
            <input type="text" className="w-full border rounded-lg p-3" value={settings.youtubeUrl} onChange={e => setSettings({...settings, youtubeUrl: e.target.value})} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">問い合わせ用メールアドレス</label>
          <input type="email" className="w-full border rounded-lg p-3" value={settings.contactEmail} onChange={e => setSettings({...settings, contactEmail: e.target.value})} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">共通CTA タイトル</label>
            <input type="text" className="w-full border rounded-lg p-3" value={settings.ctaTitle} onChange={e => setSettings({...settings, ctaTitle: e.target.value})} placeholder="制作のご相談はこちら" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">共通CTA 説明文</label>
            <input type="text" className="w-full border rounded-lg p-3" value={settings.ctaDescription} onChange={e => setSettings({...settings, ctaDescription: e.target.value})} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">フッターテキスト</label>
          <input type="text" className="w-full border rounded-lg p-3" value={settings.footerText} onChange={e => setSettings({...settings, footerText: e.target.value})} placeholder="© Sien-Official All Rights Reserved." />
        </div>
      </section>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t flex justify-end z-50 md:pl-64">
        <div className="max-w-4xl w-full mx-auto flex justify-end px-4">
          <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto px-8 h-12 text-lg font-bold rounded-full">
            {isSaving ? "保存中..." : "変更を保存する"}
          </Button>
        </div>
      </div>
    </div>
  );
}
