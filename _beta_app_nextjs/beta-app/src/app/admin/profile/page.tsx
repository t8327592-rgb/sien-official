"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfileAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState({
    name: "",
    title: "",
    twitterId: "",
    text1: "",
    text2: "",
    text3: "",
    availability: "○",
    deliveryInfo: "3〜5日",
  });

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setProfile({
            ...data,
            availability: data.availability || "○",
            deliveryInfo: data.deliveryInfo || "3〜5日",
          });
        }
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        setMessage("設定を保存しました。");
        router.refresh();
      } else {
        setMessage("エラーが発生しました。");
      }
    } catch (err) {
      setMessage("エラーが発生しました。");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">読み込み中...</div>;

  return (
    <div>
      <h1 className="text-3xl font-black text-gray-800 mb-2">予約状況・設定</h1>
      <p className="text-gray-500 font-medium mb-8">トップページに表示される現在の予約状況と、プロフィール情報を管理します。</p>

      {message && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl font-bold border border-green-200">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 予約状況セクション */}
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100">トップページ表示設定</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">現在の予約状況</label>
              <select
                value={profile.availability}
                onChange={(e) => setProfile({ ...profile, availability: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-orange-400"
              >
                <option value="○">○ (余裕あり)</option>
                <option value="△">△ (やや混雑)</option>
                <option value="×">× (満枠)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">現在の納期目安</label>
              <input
                type="text"
                value={profile.deliveryInfo}
                onChange={(e) => setProfile({ ...profile, deliveryInfo: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-orange-400"
                placeholder="例: 3〜5日"
                required
              />
            </div>
          </div>
        </div>

        {/* プロフィールセクション */}
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100">プロフィール設定</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">表示名</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">肩書き (例: MIX ENGINEER)</label>
              <input
                type="text"
                value={profile.title}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Twitter ID</label>
              <input
                type="text"
                value={profile.twitterId}
                onChange={(e) => setProfile({ ...profile, twitterId: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400"
                required
              />
            </div>
          </div>

          <div className="space-y-4 pt-6 mt-6 border-t border-gray-100">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">自己紹介 (段落1)</label>
              <textarea
                value={profile.text1}
                onChange={(e) => setProfile({ ...profile, text1: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">自己紹介 (段落2)</label>
              <textarea
                value={profile.text2}
                onChange={(e) => setProfile({ ...profile, text2: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">自己紹介 (段落3)</label>
              <textarea
                value={profile.text3}
                onChange={(e) => setProfile({ ...profile, text3: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center w-full md:w-auto gap-2 px-12 py-4 bg-orange-500 text-white font-black rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50 text-lg shadow-lg shadow-orange-500/30"
          >
            <Save size={24} />
            {saving ? "保存中..." : "変更を保存する"}
          </button>
        </div>
      </form>
    </div>
  );
}
