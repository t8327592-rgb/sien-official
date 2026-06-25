import { Calendar, Mail, Settings, Shield, Webhook, Download, Database, Info, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">システム設定</h1>
          <p className="text-slate-500 mt-2">サイトの基本設定や外部サービスの連携状況を管理します。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 基本設定 */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">基本設定</h2>
          </div>
          <div className="space-y-4 flex-grow">
            <div>
              <p className="text-sm font-bold text-slate-700 mb-1">受付ステータス</p>
              <select className="w-full border border-slate-300 rounded-md p-2 text-sm">
                <option>受付中（通常通り）</option>
                <option>受付停止中（満枠）</option>
              </select>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700 mb-1">サイト案内メッセージ</p>
              <textarea 
                className="w-full border border-slate-300 rounded-md p-2 text-sm" 
                rows={2} 
                placeholder="トップページに表示する案内文..."
                defaultValue="現在、納品まで約3〜4週間いただいております。"
              ></textarea>
            </div>
          </div>
          <Button className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-white">更新する</Button>
        </section>

        {/* 外部サービス連携 */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">外部連携</h2>
          </div>
          <div className="space-y-4 flex-grow">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
              <div>
                <p className="font-bold text-sm">Google Calendar</p>
                <p className="text-xs text-slate-500">納期自動登録API</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">設定済み</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
              <div>
                <p className="font-bold text-sm">Discord 通知</p>
                <p className="text-xs text-slate-500">新規依頼の通知先</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">有効</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
              <div>
                <p className="font-bold text-sm">SMTP メール</p>
                <p className="text-xs text-slate-500">自動返信・管理者通知</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">有効</span>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-6">詳細設定・APIキー管理</Button>
        </section>

        {/* 管理者・セキュリティ */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">セキュリティ</h2>
          </div>
          <div className="space-y-4 flex-grow text-sm text-slate-600 leading-relaxed">
            <p>管理画面へのアクセス制限および認証設定は、現在Vercelの環境変数で強力に保護されています。</p>
            <div className="bg-slate-50 p-3 rounded-lg border">
              <p className="font-bold text-slate-700 mb-1">現在のログインID</p>
              <p className="font-mono bg-white border px-2 py-1 rounded text-xs">設定済み (環境変数)</p>
            </div>
            <p className="text-xs text-slate-500">※パスワードの変更や二段階認証の設定は、Vercelダッシュボードの Environment Variables から行ってください。</p>
          </div>
        </section>

        {/* データ管理 (Coming Soon) */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm opacity-60">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">データ管理 <span className="text-xs font-normal bg-slate-200 px-2 py-1 rounded-full ml-2">準備中</span></h2>
          </div>
          <div className="space-y-3 flex-grow">
            <Button variant="outline" className="w-full justify-start cursor-not-allowed" disabled>
              <Download className="w-4 h-4 mr-2" /> 顧客データのエクスポート (CSV)
            </Button>
            <Button variant="outline" className="w-full justify-start cursor-not-allowed" disabled>
              <Database className="w-4 h-4 mr-2" /> 手動バックアップの作成
            </Button>
          </div>
        </section>

        {/* システム情報 */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
              <Info className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">システム情報</h2>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-slate-500">システムバージョン</span>
              <span className="font-mono font-medium">v1.2.0</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-slate-500">フレームワーク</span>
              <span className="font-mono font-medium">Next.js 14 / App Router</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">データベース</span>
              <span className="font-mono font-medium text-emerald-600">正常稼働中</span>
            </div>
          </div>
        </section>

        {/* 個人設定 */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
              <Moon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">個人設定</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">ダークモード</p>
                <p className="text-xs text-slate-500">管理画面のテーマ</p>
              </div>
              <Button variant="outline" size="sm" disabled className="opacity-50">切替 (準備中)</Button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
