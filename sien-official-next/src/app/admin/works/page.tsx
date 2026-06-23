import { prisma } from '@/lib/prisma';
import WorksAdminClient from '@/components/admin/WorksAdminClient';
import { addWork, deleteWork, updateSortOrder } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminWorks() {
  const works = await prisma.portfolio.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">制作実績</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add New Work Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#47A1FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              新規追加
            </h2>
            
            <form action={addWork} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">YouTube ID *</label>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <span className="bg-gray-100 px-2 py-1 rounded">youtube.com/watch?v=<strong className="text-[#0071E3]">ココ</strong></span>
                </div>
                <input type="text" name="youtubeId" required placeholder="例: dQw4w9WgXcQ" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#47A1FF] outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">タイトル *</label>
                <input type="text" name="title" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#47A1FF] outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">クライアント名</label>
                <input type="text" name="clientName" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#47A1FF] outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">役割 (Role)</label>
                <input type="text" name="role" placeholder="例: Mix & Mastering" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#47A1FF] outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ *</label>
                <select name="category" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#47A1FF] outline-none">
                  <option value="mix">歌ってみた</option>
                  <option value="orig">オリジナル楽曲</option>
                  <option value="vtuber">VTuber</option>
                  <option value="other">その他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">表示順 (sortOrder) *</label>
                <div className="text-xs text-gray-500 mb-2">数字が小さい順に表示されます（デフォルト: 999）</div>
                <input type="number" name="sortOrder" defaultValue="999" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#47A1FF] outline-none" />
              </div>

              <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors mt-6">
                追加
              </button>
            </form>
          </div>
        </div>

        {/* Works List */}
        <div className="lg:col-span-2">
          <WorksAdminClient works={works} deleteAction={deleteWork} updateSortOrderAction={updateSortOrder} />
        </div>
      </div>
    </div>
  );
}
