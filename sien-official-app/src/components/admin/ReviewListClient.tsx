"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { adminRequest } from "@/lib/admin-request";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Star } from "lucide-react";

type Review = {
  id: string;
  name: string;
  serviceType: string;
  content: string;
  rating: number;
  isPublished: boolean;
  orderIndex: number;
};

export default function ReviewListClient({ initialReviews }: { initialReviews: Review[] }) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isEditing, setIsEditing] = useState(false);
  const [currentReview, setCurrentReview] = useState<Partial<Review>>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const saving = useRef(false);
  const [notice, setNotice] = useState("");

  const handleAddNew = () => {
    setCurrentReview({
      name: "",
      serviceType: "MIX・マスタリング",
      content: "",
      rating: 5,
      isPublished: true,
      orderIndex: Math.max(-1, ...reviews.map(r => r.orderIndex)) + 1,
    });
    setIsEditing(true);
  };

  const handleEdit = (review: Review) => {
    setCurrentReview(review);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (saving.current || !confirm("本当に削除しますか？")) return;
    saving.current = true; setIsLoading(true); setNotice("");
    try {
      await adminRequest(`/api/admin/reviews/${id}`, "DELETE");
      setReviews(previous => previous.filter(r => r.id !== id)); router.refresh();
    } catch (error) { setNotice((error as Error).message); }
    finally { saving.current = false; setIsLoading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving.current) return;
    saving.current = true; setIsLoading(true); setNotice("");

    const isNew = !currentReview.id;
    const url = isNew ? "/api/admin/reviews" : `/api/admin/reviews/${currentReview.id}`;
    const method = isNew ? "POST" : "PUT";

    try {
      const savedReview = await adminRequest(url, method, currentReview);
      setReviews(previous => isNew ? [...previous, savedReview] : previous.map(r => r.id === savedReview.id ? savedReview : r));
      setIsEditing(false); router.refresh();
    } catch (error) { setNotice((error as Error).message); } finally {
      saving.current = false; setIsLoading(false);
    }
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    if (saving.current || (direction === 'up' && index === 0) || (direction === 'down' && index === reviews.length - 1)) return;
    const next = [...reviews]; const target = direction === 'up' ? index - 1 : index + 1;
    [next[index], next[target]] = [next[target], next[index]];
    const ordered = next.map((r, orderIndex) => ({ ...r, orderIndex }));
    saving.current = true; setIsLoading(true); setNotice("");
    try {
      await adminRequest("/api/admin/reviews/reorder", "POST", { sequence: ordered.map(({ id, orderIndex }) => ({ id, orderIndex })), previous: reviews.map((r, orderIndex) => ({ id: r.id, orderIndex })) });
      setReviews(ordered); router.refresh();
    } catch (error) { setNotice((error as Error).message); }
    finally { saving.current = false; setIsLoading(false); }
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold mb-6">{currentReview.id ? "レビューの編集" : "レビューの追加"}</h2>
        {notice && <p role="alert" className="mb-4 text-sm text-red-700">{notice}</p>}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="reviewlistclient-field-1" className="text-sm font-bold text-slate-700">お名前・活動名</label>
              <input id="reviewlistclient-field-1"
                required
                type="text"
                className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none"
                value={currentReview.name || ""}
                onChange={(e) => setCurrentReview({ ...currentReview, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="reviewlistclient-field-2" className="text-sm font-bold text-slate-700">利用サービス</label>
              <input id="reviewlistclient-field-2"
                required
                type="text"
                placeholder="例: ボーカルMIX、オリジナル楽曲制作"
                className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none"
                value={currentReview.serviceType || ""}
                onChange={(e) => setCurrentReview({ ...currentReview, serviceType: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="reviewlistclient-field-3" className="text-sm font-bold text-slate-700">レビュー本文</label>
            <textarea id="reviewlistclient-field-3"
              required
              rows={5}
              className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none"
              value={currentReview.content || ""}
              onChange={(e) => setCurrentReview({ ...currentReview, content: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="reviewlistclient-field-4" className="text-sm font-bold text-slate-700">評価 (1-5)</label>
              <select id="reviewlistclient-field-4"
                className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none"
                value={currentReview.rating || 5}
                onChange={(e) => setCurrentReview({ ...currentReview, rating: parseInt(e.target.value) })}
              >
                {[5, 4, 3, 2, 1].map(num => (
                  <option key={num} value={num}>★ {num}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 flex flex-col justify-center">
              <label htmlFor="reviewlistclient-field-5" className="flex items-center gap-2 cursor-pointer mt-6">
                <input id="reviewlistclient-field-5"
                  type="checkbox"
                  className="w-5 h-5 text-orange-500 rounded border-slate-300 focus:ring-orange-500"
                  checked={currentReview.isPublished ?? true}
                  onChange={(e) => setCurrentReview({ ...currentReview, isPublished: e.target.checked })}
                />
                <span className="font-bold text-slate-700">サイトに公開する</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading} onClick={() => setIsEditing(false)}
              className="px-6"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="px-8 bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isLoading ? "保存中..." : "保存する"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notice && <p role="alert" className="rounded-lg border bg-white p-3 text-sm text-red-700">{notice}</p>}
      <div className="flex justify-end">
        <Button disabled={isLoading} onClick={handleAddNew} className="bg-slate-900 hover:bg-slate-800 text-white">
          <Plus className="w-4 h-4 mr-2" />
          レビューを追加
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {reviews.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            登録されているレビューはありません。
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reviews.map((review, index) => (
              <div key={review.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:bg-slate-50 transition-colors">
                <div className="flex flex-col gap-2 mr-2">
                  <button onClick={() => moveItem(index, 'up')} aria-label="レビューを上へ移動" disabled={isLoading || index === 0} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30">▲</button>
                  <button onClick={() => moveItem(index, 'down')} aria-label="レビューを下へ移動" disabled={isLoading || index === reviews.length - 1} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30">▼</button>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-slate-900">{review.name}</h3>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-600 border border-orange-100">
                      {review.serviceType}
                    </span>
                    {!review.isPublished && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        非公開
                      </span>
                    )}
                  </div>
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{review.content}</p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-4 sm:mt-0">
                  <Button variant="outline" size="sm" disabled={isLoading} onClick={() => handleEdit(review)}>
                    <Edit2 className="w-4 h-4 mr-1" /> 編集
                  </Button>
                  <Button variant="outline" size="sm" disabled={isLoading} onClick={() => handleDelete(review.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="w-4 h-4 mr-1" /> 削除
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
