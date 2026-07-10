import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------
// 1. FAQ 管理画面
// ---------------------------------------------------------
const faqDir = path.join(__dirname, '../src/app/admin/faq');
if (!fs.existsSync(faqDir)) {
  fs.mkdirSync(faqDir, { recursive: true });
}

// FAQ Page
const faqPageContent = `
import { getFAQs } from "@/lib/data/cms";
import { FAQList } from "./FAQList";

export const dynamic = "force-dynamic";

export default async function AdminFAQPage() {
  const faqs = await getFAQs();

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">FAQ (よくある質問) 管理</h1>
        <p className="text-slate-500 mt-2">サイトに表示される「よくある質問」の追加・編集・削除を行います。</p>
      </div>

      <FAQList initialFaqs={faqs} />
    </div>
  );
}
`;
fs.writeFileSync(path.join(faqDir, 'page.tsx'), faqPageContent, 'utf8');

// FAQ List Component
const faqListContent = `"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createFAQ, updateFAQ, deleteFAQ } from "@/app/actions/cms";
import toast from "react-hot-toast";

export function FAQList({ initialFaqs }: { initialFaqs: any[] }) {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [isAdding, setIsAdding] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "", category: "COMMON", orderIndex: 0 });

  const handleAdd = async () => {
    if (!newFaq.question || !newFaq.answer) {
      toast.error("質問と回答を入力してください");
      return;
    }
    try {
      const res = await createFAQ(newFaq);
      setFaqs([...faqs, res.data]);
      setIsAdding(false);
      setNewFaq({ question: "", answer: "", category: "COMMON", orderIndex: 0 });
      toast.success("追加しました");
    } catch (e) {
      toast.error("エラーが発生しました");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("削除しますか？")) return;
    try {
      await deleteFAQ(id);
      setFaqs(faqs.filter(f => f.id !== id));
      toast.success("削除しました");
    } catch (e) {
      toast.error("エラーが発生しました");
    }
  };

  return (
    <div className="space-y-6">
      {/* 新規追加フォーム */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsAdding(!isAdding)}>
          <h2 className="text-lg font-bold">＋ 新規追加</h2>
        </div>
        {isAdding && (
          <div className="space-y-4 pt-4 border-t mt-4">
            <input type="text" placeholder="質問 (Q)" className="w-full border p-2 rounded" value={newFaq.question} onChange={e => setNewFaq({...newFaq, question: e.target.value})} />
            <textarea placeholder="回答 (A)" className="w-full border p-2 rounded h-24" value={newFaq.answer} onChange={e => setNewFaq({...newFaq, answer: e.target.value})} />
            <div className="flex gap-4">
              <select className="border p-2 rounded" value={newFaq.category} onChange={e => setNewFaq({...newFaq, category: e.target.value})}>
                <option value="COMMON">共通</option>
                <option value="MIX">MIX</option>
                <option value="ORIGINAL">オリジナル楽曲</option>
              </select>
              <Button onClick={handleAdd}>追加する</Button>
            </div>
          </div>
        )}
      </div>

      {/* 一覧 */}
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={faq.id} className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex justify-between">
              <div className="space-y-2 w-full pr-4">
                <div className="font-bold text-lg">Q. {faq.question}</div>
                <div className="text-slate-600 whitespace-pre-wrap">A. {faq.answer}</div>
                <div className="text-xs text-slate-400 mt-2">カテゴリ: {faq.category}</div>
              </div>
              <div>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(faq.id)}>削除</Button>
              </div>
            </div>
          </div>
        ))}
        {faqs.length === 0 && <p className="text-slate-500">FAQがありません</p>}
      </div>
    </div>
  );
}
`;
fs.writeFileSync(path.join(faqDir, 'FAQList.tsx'), faqListContent, 'utf8');


// ---------------------------------------------------------
// 2. Service 管理画面
// ---------------------------------------------------------
const svcDir = path.join(__dirname, '../src/app/admin/services');
if (!fs.existsSync(svcDir)) {
  fs.mkdirSync(svcDir, { recursive: true });
}

// Service Page
const svcPageContent = `
import { getServices } from "@/lib/data/cms";
import { ServiceList } from "./ServiceList";

export const dynamic = "force-dynamic";

export default async function AdminServicePage() {
  const services = await getServices();

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">サービス内容 管理</h1>
        <p className="text-slate-500 mt-2">サイトで提供しているサービス（ボーカルMIXなど）の情報を管理します。</p>
      </div>

      <ServiceList initialServices={services} />
    </div>
  );
}
`;
fs.writeFileSync(path.join(svcDir, 'page.tsx'), svcPageContent, 'utf8');

// Service List Component
const svcListContent = `"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createService, updateService, deleteService } from "@/app/actions/cms";
import toast from "react-hot-toast";

export function ServiceList({ initialServices }: { initialServices: any[] }) {
  const [services, setServices] = useState(initialServices);
  const [isAdding, setIsAdding] = useState(false);
  const [newSvc, setNewSvc] = useState({ name: "", category: "MIX", description: "", orderIndex: 0 });

  const handleAdd = async () => {
    if (!newSvc.name) {
      toast.error("サービス名を入力してください");
      return;
    }
    try {
      const res = await createService(newSvc);
      setServices([...services, res.data]);
      setIsAdding(false);
      setNewSvc({ name: "", category: "MIX", description: "", orderIndex: 0 });
      toast.success("追加しました");
    } catch (e) {
      toast.error("エラーが発生しました");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("削除しますか？")) return;
    try {
      await deleteService(id);
      setServices(services.filter(s => s.id !== id));
      toast.success("削除しました");
    } catch (e) {
      toast.error("エラーが発生しました");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsAdding(!isAdding)}>
          <h2 className="text-lg font-bold">＋ 新規サービス追加</h2>
        </div>
        {isAdding && (
          <div className="space-y-4 pt-4 border-t mt-4">
            <input type="text" placeholder="サービス名 (例: ボーカルMIX)" className="w-full border p-2 rounded" value={newSvc.name} onChange={e => setNewSvc({...newSvc, name: e.target.value})} />
            <textarea placeholder="サービス概要" className="w-full border p-2 rounded h-24" value={newSvc.description} onChange={e => setNewSvc({...newSvc, description: e.target.value})} />
            <div className="flex gap-4">
              <select className="border p-2 rounded" value={newSvc.category} onChange={e => setNewSvc({...newSvc, category: e.target.value})}>
                <option value="MIX">MIX</option>
                <option value="ORIGINAL">オリジナル楽曲</option>
                <option value="OTHER">その他</option>
              </select>
              <Button onClick={handleAdd}>追加する</Button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {services.map(svc => (
          <div key={svc.id} className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex justify-between">
              <div className="space-y-2">
                <div className="font-bold text-xl">{svc.name} <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 ml-2">{svc.category}</span></div>
                <div className="text-slate-600 whitespace-pre-wrap">{svc.description}</div>
              </div>
              <div>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(svc.id)}>削除</Button>
              </div>
            </div>
          </div>
        ))}
        {services.length === 0 && <p className="text-slate-500">サービスがありません</p>}
      </div>
    </div>
  );
}
`;
fs.writeFileSync(path.join(svcDir, 'ServiceList.tsx'), svcListContent, 'utf8');

// サイドバーメニューにリンクを追加する
const sidebarPath = path.join(__dirname, '../src/components/admin/AdminSidebar.tsx');
if (fs.existsSync(sidebarPath)) {
  let sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
  // メニューを追加
  if (!sidebarContent.includes('href="/admin/profile"')) {
    sidebarContent = sidebarContent.replace(
      /(<Link[^>]*href="\/admin\/settings"[^>]*>[\s\S]*?<\/Link>)/,
      `$1\n
      <Link href="/admin/profile" className={\`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 \${pathname === '/admin/profile' ? 'bg-orange-50 text-orange-600 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}\`}>
        <User size={18} className={pathname === '/admin/profile' ? 'text-orange-500' : 'text-slate-400'} />
        プロフィール・共通情報
      </Link>
      <Link href="/admin/services" className={\`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 \${pathname === '/admin/services' ? 'bg-orange-50 text-orange-600 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}\`}>
        <Layers size={18} className={pathname === '/admin/services' ? 'text-orange-500' : 'text-slate-400'} />
        サービス情報
      </Link>
      <Link href="/admin/faq" className={\`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 \${pathname === '/admin/faq' ? 'bg-orange-50 text-orange-600 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}\`}>
        <HelpCircle size={18} className={pathname === '/admin/faq' ? 'text-orange-500' : 'text-slate-400'} />
        FAQ
      </Link>`
    );
    // import 追加
    sidebarContent = sidebarContent.replace(
      /import \{([^}]+)\} from 'lucide-react';/,
      "import {$1, User, Layers, HelpCircle} from 'lucide-react';"
    );
    fs.writeFileSync(sidebarPath, sidebarContent, 'utf8');
  }
}

console.log('Created admin pages.');
