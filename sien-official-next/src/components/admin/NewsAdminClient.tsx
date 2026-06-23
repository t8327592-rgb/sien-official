'use client';

import { useState } from 'react';

type News = {
  id: string;
  slug: string;
  title: string;
  content: string;
  date: Date;
  isVisible: boolean;
};

export default function NewsAdminClient({ 
  newsList, 
  updateAction, 
  deleteAction 
}: { 
  newsList: News[], 
  updateAction: (formData: FormData) => Promise<void>,
  deleteAction: (formData: FormData) => Promise<void> 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredNews = newsList.filter(news => 
    news.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    news.content.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const currentNews = filteredNews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">お知らせ一覧 ({filteredNews.length}件)</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input 
            type="text" 
            placeholder="タイトル・内容で検索..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#47A1FF] outline-none text-sm w-full sm:w-64"
          />
          <select 
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as any); setCurrentPage(1); }}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#47A1FF] outline-none text-sm"
          >
            <option value="newest">新しい順</option>
            <option value="oldest">古い順</option>
          </select>
        </div>
      </div>

      {currentNews.length === 0 ? (
        <p className="text-gray-500 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">お知らせが見つかりません</p>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {currentNews.map((news) => (
            <div key={news.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
              <form className="space-y-4" action={updateAction}>
                <input type="hidden" name="id" value={news.id} />
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/4">
                    <label className="block text-xs font-medium text-gray-500 mb-1">日付</label>
                    <input type="date" name="date" required defaultValue={new Date(news.date).toISOString().split('T')[0]} className="w-full border-gray-300 rounded-lg p-2 bg-gray-50 text-gray-800 text-sm focus:ring-2 focus:ring-[#47A1FF] focus:border-[#47A1FF]" />
                  </div>
                  <div className="w-full md:w-1/4">
                    <label className="block text-xs font-medium text-gray-500 mb-1">URLスラグ (slug)</label>
                    <input type="text" name="slug" required defaultValue={news.slug} className="w-full border-gray-300 rounded-lg p-2 bg-gray-50 text-gray-800 text-sm focus:ring-2 focus:ring-[#47A1FF] focus:border-[#47A1FF]" />
                  </div>
                  <div className="w-full md:w-2/4">
                    <label className="block text-xs font-medium text-gray-500 mb-1">タイトル</label>
                    <input type="text" name="title" required defaultValue={news.title} className="w-full border-gray-300 rounded-lg p-2 bg-gray-50 text-gray-800 font-medium focus:ring-2 focus:ring-[#47A1FF] focus:border-[#47A1FF]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">内容</label>
                  <textarea name="content" rows={4} required defaultValue={news.content} className="w-full border-gray-300 rounded-lg p-2 bg-gray-50 text-gray-800 text-sm focus:ring-2 focus:ring-[#47A1FF] focus:border-[#47A1FF]"></textarea>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <div className="flex items-center">
                    <input type="hidden" name="isVisible" value="false" />
                    <input type="checkbox" name="isVisible" value="true" defaultChecked={news.isVisible} className="w-4 h-4 text-[#0071E3] border-gray-300 rounded focus:ring-[#47A1FF]" />
                    <label className="ml-2 text-sm font-medium text-gray-700">公開</label>
                  </div>
                  <div className="flex space-x-2">
                    <button formAction={deleteAction} className="text-red-500 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
                      削除
                    </button>
                    <button type="submit" className="bg-[#0071E3] text-white px-4 py-1.5 rounded-lg hover:bg-[#0060C0] transition-colors text-sm font-medium shadow-sm">
                      更新
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-colors ${
                currentPage === page ? 'bg-[#0071E3] text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
