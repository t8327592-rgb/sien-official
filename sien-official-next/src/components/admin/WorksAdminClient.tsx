'use client';

import { useState } from 'react';

type Work = {
  id: string;
  youtubeId: string;
  title: string;
  clientName: string | null;
  role: string | null;
  category: string;
  sortOrder: number;
  createdAt: Date;
};

export default function WorksAdminClient({ 
  works, 
  deleteAction,
  updateSortOrderAction
}: { 
  works: Work[], 
  deleteAction: (formData: FormData) => Promise<void>,
  updateSortOrderAction: (formData: FormData) => Promise<void>
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'sortOrder' | 'newest' | 'oldest'>('sortOrder');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter and sort works
  const filteredWorks = works.filter(work => 
    work.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (work.clientName && work.clientName.toLowerCase().includes(searchQuery.toLowerCase()))
  ).sort((a, b) => {
    if (sortBy === 'sortOrder') return a.sortOrder - b.sortOrder || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const totalPages = Math.ceil(filteredWorks.length / itemsPerPage);
  const currentWorks = filteredWorks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-bold text-gray-900">登録済みの実績 ({filteredWorks.length}件)</h3>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input 
            type="text" 
            placeholder="タイトル・クライアント名で検索..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#47A1FF] outline-none text-sm w-full sm:w-64"
          />
          <select 
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as any); setCurrentPage(1); }}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#47A1FF] outline-none text-sm"
          >
            <option value="sortOrder">並び順 (sortOrder)</option>
            <option value="newest">新しい順</option>
            <option value="oldest">古い順</option>
          </select>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
        {currentWorks.length > 0 ? (
          currentWorks.map((work) => (
            <div key={work.id} className="p-6 flex flex-col sm:flex-row gap-6 hover:bg-gray-50 transition-colors">
              <div className="w-full sm:w-48 aspect-video bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                <img 
                  src={`https://img.youtube.com/vi/${work.youtubeId}/maxresdefault.jpg`}
                  alt={work.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-gray-900 text-lg leading-tight">{work.title}</h4>
                    <form action={deleteAction}>
                      <input type="hidden" name="id" value={work.id} />
                      <button type="submit" className="text-red-400 hover:text-red-600 p-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </form>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">
                      {work.category.toUpperCase()}
                    </span>
                    {work.clientName && <span>依頼元: {work.clientName}</span>}
                  </div>
                  <div className="flex items-center gap-4">
                    <form action={updateSortOrderAction} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={work.id} />
                      <label className="text-xs text-gray-500 font-bold">並び順 (sortOrder):</label>
                      <input 
                        type="number" 
                        name="sortOrder" 
                        defaultValue={work.sortOrder} 
                        className="w-20 p-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#47A1FF] outline-none"
                      />
                      <button type="submit" className="bg-[#0071E3] hover:bg-[#0060C0] text-white text-xs px-2 py-1.5 rounded transition-colors font-medium shadow-sm">
                        更新
                      </button>
                    </form>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 flex-1">
                      <span className="text-gray-400 text-xs block mb-0.5">担当内容</span>
                      {work.role || '未設定'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-gray-500">
            {searchQuery ? '検索条件に一致する実績が見つかりませんでした' : 'まだ実績が登録されていません'}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-colors ${
                currentPage === page ? 'bg-[#0071E3] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
