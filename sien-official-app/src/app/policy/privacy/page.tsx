import { pageMetadata } from "@/lib/page-metadata";
import { getPublicSettings } from "@/lib/data/public-settings";
export const metadata = pageMetadata("/policy/privacy", {title: "プライバシーポリシー | Sien-Official", description: "お問い合わせ情報・素材URLの利用、外部サービス、保存期間、開示・削除のお問い合わせについて。"});
export default async function PrivacyPage() {
 const settings = await getPublicSettings();
 return <article className="mx-auto max-w-4xl px-4 py-20"><h1 className="mb-10 text-center text-3xl font-bold">プライバシーポリシー</h1><div className="space-y-8 rounded-2xl border bg-white p-6 sm:p-10 leading-relaxed">
 <section><h2 className="mb-3 text-xl font-bold">1. 収集する情報と利用目的</h2><p>活動名・お名前、メールアドレス、X・DiscordのID、会社名・担当者名、ご依頼・相談内容、楽曲情報、参考資料・素材の共有URL、希望納期、支払方法、規約への同意日時・版を取得します。受付、見積、連絡、制作・納品、重複送信や不正利用の防止、同意の確認に利用します。フォームでカード番号等の決済情報は取得しません。</p></section>
 <section><h2 className="mb-3 text-xl font-bold">2. 保存期間と管理</h2><p>受注・お問い合わせ情報は業務完了後1年を基本に保存し、継続対応・紛争対応等で必要な場合を除き、期間を過ぎた情報を確認のうえ削除・匿名化します。会計上の記録など法令に基づく保存が必要な情報は必要な期間保管します。過去データの削除は対象を確認したうえで実施します。管理画面へのアクセスを認証・認可で制限します。</p><p className="mt-3">入力下書きは保存設定が許可されている場合に限り、このブラウザーのタブ内に最終入力から最大2時間保存します。送信成功時・削除操作時に消去し、規約同意は復元しません。共用端末では下書きを削除してください。</p></section>
 <section><h2 className="mb-3 text-xl font-bold">3. 外部サービスの利用</h2><p>運営のため、クラウドDB・ホスティング・メール配信サービスへ処理を委託します。Discordの管理者通知には、ご依頼・相談の確認のため、フォームに入力された活動名・お名前、連絡先、依頼内容、素材・参考URL、希望納期、支払方法、受付時点の概算金額等を送信します。長文は通知への添付ファイルに記載する場合があります。Googleカレンダーには納期管理のため、活動名・お名前、サービス名、曲名、納品予定日、管理画面URLを登録します。メールアドレスや素材URLはカレンダーへ登録しません。</p><p className="mt-3">サイト上のAIチャットによるご案内にGoogle Geminiを使用します。チャットに入力された文章は、メール、SNS ID、共有URL等を省略して処理しますが、個人情報や秘密情報は入力しないでください。依頼フォームの内容をAI返信・SNS投稿の生成のためにGoogleへ送信することはありません。AIチャットの回答は案内であり、正式な条件は担当者へ確認してください。YouTube動画の再生時はYouTubeへ接続します。外部サービスでの取扱いは各サービスの方針にも従います。</p></section>
 <section><h2 className="mb-3 text-xl font-bold">4. Cookie・アクセス解析</h2><p>管理ログインの維持に認証Cookieを使用します。AIチャットでは、利用者ごとのリクエスト制限のため有効期間1日の署名付きCookieを使用します。Google Analyticsが設定されている場合、アクセス解析への同意後に公開ページの閲覧情報を取得します。フォーム入力・管理ページは解析対象とせず、URLのクエリ情報を解析に送りません。未選択・拒否の間はアクセス解析を開始しません。設定はページ下部の「Cookie設定」から変更・撤回できます。</p></section>
 <section><h2 className="mb-3 text-xl font-bold">5. 第三者提供・開示等</h2><p>業務委託による処理を除き、本人の同意なく個人情報を第三者に提供しません。法令に基づく場合は例外となります。ご本人確認のうえ、開示・訂正・削除等のご相談に対応します。</p></section>
 <section><h2 className="mb-3 text-xl font-bold">6. お問い合わせ</h2><a className="text-orange-800 underline" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a></section><p className="text-sm text-slate-600">制定日：2026年1月　最終改定日：2026年10月11日</p></div></article>;
}
