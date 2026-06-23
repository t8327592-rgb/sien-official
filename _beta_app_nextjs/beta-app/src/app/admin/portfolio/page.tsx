"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Loader2, Save, X, Video } from "lucide-react";
import { useRouter } from "next/navigation";

type Portfolio = {
  id: string;
  title: string;
  videoId: string;
  artist?: string;
  tags?: string;
  comment?: string;
  order: number;
};

export default function AdminPortfolioPage() {
  const router = useRouter();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // 編集用ステート
  const [editingItem, setEditingItem] = useState<Portfolio | null>(null);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      const res = await fetch("/api/portfolio");
      if (res.ok) {
        const data = await res.json();
        setPortfolios(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("本当にこの実績を削除しますか？")) return;
    try {
      const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchPortfolios();
      } else {
        alert("削除に失敗しました");
      }
    } catch (err) {
      alert("エラーが発生しました");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSaving(true);
    
    // YouTube URLからvideoIdを抽出する簡易ロジック
    let videoId = editingItem.videoId;
    if (videoId.includes("youtube.com") || videoId.includes("youtu.be")) {
      const match = videoId.match(/(?:v=|youtu\.be\/|youtube\.com\/shorts\/)([^&?]+)/);
      if (match && match[1]) {
        videoId = match[1];
      }
    }

    try {
      const url = editingItem.id ? `/api/portfolio/${editingItem.id}` : "/api/portfolio";
      const method = editingItem.id ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editingItem, videoId })
      });

      if (res.ok) {
        setEditingItem(null);
        fetchPortfolios();
      } else {
        alert("保存に失敗しました");
      }
    } catch (err) {
      alert("エラーが発生しました");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-500" size={32} /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-800 mb-2">制作実績管理</h1>
          <p className="text-gray-500 font-medium">トップページに表示されるYouTube動画実績を管理します。全{portfolios.length}件</p>
        </div>
        <button 
          onClick={() => setEditingItem({ id: "", title: "", videoId: "", artist: "", tags: "", comment: "", order: portfolios.length + 1 })}
          className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors"
        >
          <Plus size={18} />
          実績を追加
        </button>
      </div>

      {editingItem && (
        <div className="mb-12 bg-white p-8 rounded-3xl border-2 border-orange-400 shadow-xl shadow-orange-100">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {editingItem.id ? "実績の編集" : "新しい実績の追加"}
            </h2>
            <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">YouTube URL または 動画ID</label>
                <div className="flex gap-2">
                  <input 
                    required
                    type="text" 
                    value={editingItem.videoId}
                    onChange={(e) => setEditingItem({...editingItem, videoId: e.target.value})}
                    className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:border-orange-400 focus:outline-none"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!editingItem.videoId) return;
                      setIsSaving(true);
                      try {
                        const res = await fetch(`/api/youtube?url=${encodeURIComponent(editingItem.videoId)}`);
                        if (res.ok) {
                          const data = await res.json();
                          setEditingItem({...editingItem, title: data.title});
                        } else {
                          alert("タイトルの取得に失敗しました");
                        }
                      } catch (e) {
                        alert("エラーが発生しました");
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    className="px-4 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors text-sm whitespace-nowrap"
                  >
                    タイトル自動取得
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">タイトル</label>
                <input 
                  required
                  type="text" 
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:border-orange-400 focus:outline-none"
                  placeholder="【歌ってみた】タイトル / アーティスト"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">アーティスト名（任意）</label>
                <input 
                  type="text" 
                  value={editingItem.artist || ""}
                  onChange={(e) => setEditingItem({...editingItem, artist: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:border-orange-400 focus:outline-none"
                  placeholder="原曲アーティスト名"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ジャンルタグ（カンマ区切り）</label>
                <input 
                  type="text" 
                  value={editingItem.tags || ""}
                  onChange={(e) => setEditingItem({...editingItem, tags: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:border-orange-400 focus:outline-none"
                  placeholder="ボカロ,K-POP,爽やか"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">一言コメント（任意）</label>
                <textarea 
                  value={editingItem.comment || ""}
                  onChange={(e) => setEditingItem({...editingItem, comment: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:border-orange-400 focus:outline-none"
                  placeholder="ここをこだわりました！"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">表示順</label>
                <input 
                  required
                  type="number" 
                  value={editingItem.order}
                  onChange={(e) => setEditingItem({...editingItem, order: Number(e.target.value)})}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:border-orange-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-6 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
              >
                キャンセル
              </button>
              <button 
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                保存する
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-video bg-gray-100 rounded-xl mb-4 overflow-hidden relative group">
              <img 
                src={`https://img.youtube.com/vi/${p.videoId}/mqdefault.jpg`} 
                alt={p.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Video className="text-white" size={32} />
              </div>
            </div>
            
            <h3 className="font-bold text-gray-800 text-sm line-clamp-2 mb-2 flex-1" title={p.title}>{p.title}</h3>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs font-bold text-gray-400">表示順: {p.order}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setEditingItem(p)}
                  className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  title="編集"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(p.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="削除"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
