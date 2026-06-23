"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Loader2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

type News = {
  id: string;
  title: string;
  content: string | null;
  createdAt: string;
};

export default function AdminNewsPage() {
  const router = useRouter();
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editingItem, setEditingItem] = useState<Partial<News> | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch("/api/news");
      if (res.ok) {
        const data = await res.json();
        setNews(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("本当にこのお知らせを削除しますか？")) return;
    try {
      const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchNews();
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
    
    try {
      const url = editingItem.id ? `/api/news/${editingItem.id}` : "/api/news";
      const method = editingItem.id ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem)
      });

      if (res.ok) {
        setEditingItem(null);
        fetchNews();
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
          <h1 className="text-3xl font-black text-gray-800 mb-2">お知らせ管理</h1>
          <p className="text-gray-500 font-medium">トップページに表示される最新情報やブログを管理します。</p>
        </div>
        <button 
          onClick={() => setEditingItem({ id: "", title: "", content: "" })}
          className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors"
        >
          <Plus size={18} />
          お知らせを追加
        </button>
      </div>

      {editingItem && (
        <div className="mb-12 bg-white p-8 rounded-3xl border-2 border-orange-400 shadow-xl shadow-orange-100">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {editingItem.id ? "お知らせの編集" : "新しいお知らせの追加"}
            </h2>
            <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">タイトル</label>
              <input 
                required
                type="text" 
                value={editingItem.title || ""}
                onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:border-orange-400 focus:outline-none"
                placeholder="【重要】料金プラン改定のお知らせ"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">本文</label>
              <textarea 
                value={editingItem.content || ""}
                onChange={(e) => setEditingItem({...editingItem, content: e.target.value})}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:border-orange-400 focus:outline-none"
                placeholder="お知らせの詳細内容を記入してください"
                rows={8}
              />
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

      <div className="space-y-4">
        {news.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-gray-100 shadow-sm text-gray-500 font-bold">
            まだお知らせはありません。
          </div>
        ) : (
          news.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div>
                <span className="text-xs font-bold text-orange-500 mb-1 block">
                  {new Date(item.createdAt).toLocaleDateString('ja-JP')}
                </span>
                <h3 className="font-bold text-gray-800 text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{item.content}</p>
              </div>
              
              <div className="flex gap-2 shrink-0 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-4">
                <button 
                  onClick={() => setEditingItem(item)}
                  className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  title="編集"
                >
                  <Edit2 size={20} />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="削除"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
