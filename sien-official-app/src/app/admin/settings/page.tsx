import { requireAdminPage } from "@/lib/admin-page-auth";
import { Calendar, Shield, Database, Info, Moon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSiteSetting } from "@/lib/data/site-setting";
import { SettingsClient } from "./SettingsClient";
import Link from "next/link";
import { adminIntegrationStatuses } from "@/lib/admin-integrations";
import packageInfo from "../../../../package.json";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdminPage();
  const siteSetting = await getSiteSetting();
  const integrations = adminIntegrationStatuses(process.env);

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">システム設定</h1>
          <p className="text-slate-500 mt-2">サイトの基本設定や外部サービスの連携状況を管理します。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* 基本設定 (Client Component) */}
        <SettingsClient initialSetting={siteSetting} />

        {/* 外部サービス連携 */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">外部連携</h2>
          </div>
          <div className="space-y-4 flex-grow">
            {integrations.map(integration => <div key={integration.name} className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-lg border">
              <div><p className="font-bold text-sm">{integration.name}</p><p className="text-xs text-slate-500">{integration.description}</p></div>
              <span className={`px-2 py-1 text-xs font-bold rounded-full ${integration.state === "configured" ? "bg-sky-100 text-sky-800" : "bg-amber-100 text-amber-900"}`}>{integration.label}</span>
            </div>)}
            <Link href="/admin/notifications" className="inline-block text-sm underline underline-offset-4">通知の配送結果を確認</Link>
          </div>
          <details className="mt-6 rounded-lg border p-3 text-sm">
            <summary className="cursor-pointer font-bold focus-visible:outline-2 focus-visible:outline-orange-500">設定方法を確認</summary>
            <div className="mt-3 space-y-3 text-slate-600 break-words">
              <p>ローカルは.env、公開環境はVercelのEnvironment Variablesで設定します。設定値・APIキー・パスワードはこの画面には表示しません。設定の有無は接続成功やメール到達を保証しません。</p>
              {integrations.map(integration => <p key={integration.name}><strong>{integration.name}：</strong><span className="break-all">{integration.keys.join(" / ")}</span></p>)}
              <p>SMTP_HOSTを使う場合は送信元と管理者通知先も指定してください。SMTP_HOSTがない場合はSMTP_USER・SMTP_PASSでGmailへ接続します。</p>
              <p>通知の自動再試行にはCRON_SECRETと定期実行の設定が必要です。現在の定期処理認証：{process.env.CRON_SECRET ? "設定あり（定期実行・疎通は別途確認）" : "未設定"}。</p>
            </div>
          </details>
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
            <p>管理画面は、環境変数に設定した管理者IDとパスワードで認証します。</p>
            <div className="bg-slate-50 p-3 rounded-lg border">
              <p className="font-bold text-slate-700 mb-1">現在のログインID</p>
              <p className="font-mono bg-white border px-2 py-1 rounded text-xs">設定済み (環境変数)</p>
            </div>
            <p className="text-xs text-slate-600">管理者ID・パスワードの変更はADMIN_USERNAME・ADMIN_PASSWORDで行います。サイト管理者ログインの二段階認証は未実装です。Vercelアカウントの二段階認証とは別の設定です。</p>
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
              <span className="font-mono font-medium">v{packageInfo.version}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-slate-500">フレームワーク</span>
              <span className="font-mono font-medium">Next.js {packageInfo.dependencies.next} / App Router</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">データベース</span>
              <span className="font-medium">自動接続診断は未実装</span>
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
