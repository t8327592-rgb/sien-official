# 見積書PDF

依頼一覧・詳細からクライアント向け見積書を作成する機能。見積書の保存によって、依頼の見積金額、確定金額、売上計上日、入金・返金履歴は変更されません。

## 使用方法

1. 管理画面の「依頼管理」で対象依頼のチェック欄を選択し、「まとめて見積書を作成」を押します。1件目を選ぶと「表示中の同じクライアントを選択」も利用できます。単曲は依頼詳細の「見積書を作成」から開けます。
2. クライアント名、番号、発行日、有効期限、楽曲・プラン、数量・単価、オプション、割引、備考、支払い案内を確認・編集します。金額は税込の整数円です。
3. 画面内のプレビューを確認します。「PDFプレビューをダウンロード」はDBに保存せずにPDFを取得します。
4. 「保存してPDFをダウンロード」を押すと、見積書を保存した後にその版のPDFを取得します。
5. 「案内文をコピー」で送付文をコピーし、PDFと一緒にX DM・Discord・メールへ手動送付します。文面は編集可能です。手動編集後に金額を変更した場合は「案内文を再生成」で更新してください。
6. サイドメニューの「見積書」または依頼詳細の「この依頼の見積書」から保存済み文書を再表示できます。編集して保存すると改訂版が追加され、履歴から旧版PDFも取得できます。「複製して新規作成」は別系列の第1版になります。

自動入力の確認事項が表示された場合は、料金を確認してから保存してください。保存失敗時は入力を保持します。保存の応答が途切れた場合は、同じ内容で再試行すると重複保存を防げます。別画面で先に改訂された場合は、最新版を開いて変更をやり直します。

## 調査結果と設計

- Next.js 16.3.8 / React 19 / PostgreSQL / Prisma 5.22。
- `Order` が依頼、クライアント、楽曲、見積額 `price`、内訳 `basePrice` / `optionPrice`、確定額 `confirmedPrice`、売上日 `revenueAt` を保持。`PaymentRecord` は入金・返金を独立管理。
- `Plan` / `Option` が現行料金。依頼受付時の `SubmissionReceipt.quote` にプラン・オプション・数量・セール条件のスナップショットがあります。
- ブラックフライデーは `src/config/autumn-sale.ts`、通常のプランキャンペーンは `Campaign` と `currentPlanCampaign` で管理。
- 既存の `pdf-lib` / `@pdf-lib/fontkit`、`public/logo.png`、日本語フォント `ZenKakuGothicNew-Regular.ttf` を再利用。追加のパッケージ依存はありません。
- 新しい `Estimate` に内容JSON、系列ID、版番号、前版ID、保存キー、内容ハッシュを保存。`EstimateOrder` は依頼との参照関係だけを保持します。保存済み行を更新・削除するAPIはありません。
- 改訂は追記式。系列・版番号の一意制約と最新版チェックで競合を検知し、保存キーとトランザクション内のロックで再送時の重複を防止します。
- 認証済み管理者だけが編集・保存・PDF取得できます。POSTは既存のOrigin検証を再利用。PDFレスポンスは `private, no-store` です。

## 料金と顧客判定

- 受付時の明細があれば、その時点の料金を自動入力します。現在のプランの変更で保存済み見積書は変わりません。
- ブラックフライデーの自動割引は、受付時スナップショットの割引率・通常総額と、依頼受付日時の日本時間での対象期間を照合した場合だけ適用します。対象外が混ざる場合は対象明細だけを選択します。手動設定・解除が可能です。
- 通常の `Campaign` 適用済み料金は、受付時に保存されたプラン単価として保持します。割引前の料金がスナップショットにない場合、元値や割引を推測で復元しません。必要なら基本単価と末尾の割引を手動で設定してください。
- 受付時明細のない旧依頼は保存済みの基本・オプション額を引き継ぎ、確認事項を表示します。旧オプションは合算行として表示されるため、必要に応じて行を分割してください。追加の自動割引はしません。
- 率は小数第2位まで、固定割引は整数円。計算は整数・BigIntを使用します。既存の受付処理に合わせ、依頼ごとの割引後金額を切り捨て、その割引額を最後に合算します。複数依頼で1円単位の端数が出ても、個別見積の合計と一致します。
- 割引対象は全明細、基本料金、オプション、指定明細から選べます。固定割引が対象額を上回る入力は拒否します。
- 一括作成は1〜100依頼、明細は最大400行。メールアドレス、氏名、顧客区分、会社名、テスト区分を画面とサーバーで照合します。メールが空欄の複数依頼は安全のためまとめられません。単曲は作成可能です。
- PDFでは基本料金をプランごとに表示し、オプション、割引、総額、備考、支払い案内の順に表示します。同名・同単価・同備考・数量1のオプションはPDF内だけでまとめ、対象曲と総数量を表示します。元の明細と依頼は独立したままです。
- PDFにメールアドレス、連絡先、素材URL、管理URL、依頼ID、案内文は入りません。備考は表示だけで二重計上しません。

## 追加・変更ファイル

| 用途 | ファイル |
| --- | --- |
| データ定義・追加専用SQL | `prisma/schema.prisma`, `prisma/migrations/202611240001_estimates/migration.sql` |
| 計算・検証・文面 | `src/lib/estimates.ts` |
| 自動入力 | `src/lib/estimate-draft.ts` |
| 保存・競合制御 | `src/lib/estimate-store.ts` |
| PDF作成・レスポンス | `src/lib/estimate-pdf.ts`, `src/lib/estimate-pdf-response.ts` |
| 保存・プレビュー・取得API | `src/app/api/admin/estimates/route.ts`, `preview/route.ts`, `[id]/pdf/route.ts` |
| 一覧・新規・履歴ページ | `src/app/admin/estimates/page.tsx`, `new/page.tsx`, `[id]/page.tsx` |
| 編集画面 | `src/components/admin/EstimateEditor.tsx` |
| 既存画面の導線 | `src/components/admin/OrderListClient.tsx`, `AdminSidebar.tsx`, `src/app/admin/orders/[id]/page.tsx` |
| 自動テスト・共通読込・11曲データ | `tests/estimates.test.mjs`, `tests/helpers/load-ts.mjs`, `tests/fixtures/estimates.mjs` |
| 隔離QA環境・結合・ブラウザ・PDF確認 | `scripts/qa-estimates-env.mjs`, `qa-estimates.mjs`, `qa-estimates-browser.mjs`, `qa-estimates-pdf.py` |
| テスト登録・出力ファイル設定 | `package.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `.gitignore` |
| 利用・リリース手順 | `README.md`, `docs/estimates.md` |

## テストの再実行

通常の検査：

```powershell
npm run typecheck
npm run lint
npm test
```

結合検査は本番DBを読み込まない、メモリ内PostgreSQLとローカルNext.jsを使用します。

```powershell
# ターミナル1: localhost:3006 / PostgreSQL互換:55452。終了はCtrl+C。
node scripts/qa-estimates-env.mjs
# ターミナル2
node scripts/qa-estimates.mjs
# PlaywrightとChromeがある環境
# バンドル済みの場合はPLAYWRIGHT_MODULEでモジュールの絶対パスを指定。
node scripts/qa-estimates-browser.mjs
# pdfplumber / pypdfium2を利用できるPythonで実行
python scripts/qa-estimates-pdf.py
```

QA生成物はリポジトリ親の `tmp/estimates-qa/` です。テスト用の架空メールアドレスと依頼データだけを使用します。本番のポ村ころりぃ様の依頼は読み書きしません。

検証項目：11曲で110,000 + 20,000 − 26,000 = 104,000円、単曲、複数オプション、割引なし・固定額・対象指定・端数、相談料金とエンコード、セール期間外、顧客混在拒否、認証・Origin、重複送信、同時改訂、旧版保持、プラン変更後の保持、再取得、売上・入金等の不変性、保存失敗後の再試行、文面コピー、390px画面の横はみ出しなしを確認します。

日本語とレイアウトはPoppler / PDFiumの両方で描画確認。11曲・備考付きはA4縦1ページ、長い曲名の100行は8ページ。PDFテキストと各文字領域も検証します。

2026-11-24の検証結果：自動テスト126件すべて成功、型検査・ESLint・本番用ビルド成功。隔離環境のAPI結合検査とChromeのPC・スマートフォン操作検査も成功しました。長い宛名・明細注記・100行の備考を含む4ページのPDFも、文字の欠落や用紙のはみ出しがないことを確認しています。

## 本番反映

実装・隔離QAから本番DBへのSQL適用や公開は自動実行しません。本番反映は別途の運用指示に基づき、バックアップ・影響確認後に行います。

既存の運用手順でバックアップと移行履歴を確認してから、追加テーブル2つだけのSQLをデプロイ前に適用してください。SQLはトランザクションで実行し、既存テーブルへの変更・削除・金額移行は含みません。既存テーブルがある場合の自動再作成もしません。

```powershell
# 接続先が意図した環境であることを運用手順に従って確認してから実行
node node_modules/prisma/build/index.js db execute --schema prisma/schema.prisma --file prisma/migrations/202611240001_estimates/migration.sql
node node_modules/prisma/build/index.js generate
npm run build
```

Prismaの移行履歴で管理する環境では、既存のベースラインに合わせてこの移行の適用記録も管理してください。履歴を確認せず過去の移行をまとめて適用したり、`db push` / `migrate reset` / seedを本番で実行しないでください。

依頼の見積欄への逆反映と外部サービスへの自動送信は実装していません。

本番反映の追加依頼に基づくバックアップ・復元検証・追加SQLの限定適用・公開後照合の手順は [estimates-release.md](estimates-release.md) を参照してください。
