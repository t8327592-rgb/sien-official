# 売上ダッシュボードの本番反映

ユーザーの2026-11-13の公開・バックアップ依頼に基づく。対象は既存Vercelプロジェクト `siens-projects-12731339/sien-official-com` と正式ドメイン `https://www.sien-official.com`。既存Git連携のmainへの通常pushで公開する。公開前のコミットは `5475422fa434cc5c7d9c3a51448a74fda2924b42`。

## 保持方針

- 既存データ全体を読み取り専用のRepeatable Readで取得し、定義・制約・索引・全行を暗号化バックアップする。
- 金額や日時の精度をJSONBで保持。AES-256-GCMの鍵はWindows DPAPI CurrentUserで保護する。
- 復号とメモリ内PostgreSQLへの復元、全行のハッシュ一致、追加SQLの適用と空テーブル3つを確認してから本番に追加する。
- 日時のJSONB表記をそろえるため、取得と使い捨て復元のタイムゾーンをUTCに固定する。マイクロ秒を切り捨てた比較はしない。
- 本番にはSalesReview・SalesPxAccounting・SalesReviewAuditと索引だけを新規作成する。既存テーブルや行は更新・削除しない。
- ローカルQAは公開時に起動しない。架空の依頼・入金・CSV・確認情報を本番へ投入しない。
- 公開後の確認は読み取り専用。実案件への判定・計上日の登録は行わない。

## 明示的な運用コマンド

```powershell
node --env-file=.env scripts/sales-dashboard-release.mjs --backup
node --env-file=.env scripts/sales-dashboard-release.mjs --restore-check
node --env-file=.env scripts/sales-dashboard-release.mjs --migrate
node --env-file=.env scripts/sales-dashboard-release.mjs --verify
```

スクリプトは本番ホスト・DB名・TLSを固定検証し、復元検証済みバックアップと確認したSQLハッシュを必須にする。既存バックアップは上書きしない。追加テーブルが既にあれば本番SQLは再実行せず停止する。ビルド・Webリクエストから自動で起動しない。

結果と暗号化バックアップはルートの `audit/sales-dashboard-release-2026-11-13/` に保存し、Gitや公開成果物には含めない。復号には作成したWindowsユーザープロファイルが必要。

## 公開後の確認

Vercelの対象コミットがReady / Productionで正式ドメインに割り当たったことを確認する。本番ログイン済みの管理画面で直接依頼・PXstudio・合計、年・月、2種類の集計基準、重複候補、計上日未確認の明細を確認し、読み取り専用のDB集計と照合する。匿名の管理ページ・API拒否、既存の売上・PXstudio画面も確認する。最後にバックアップとの全既存行の照合、新規確認テーブル3つが0件であることを検証する。

問題時は直前の正常なVercelデプロイへ切り戻し、追加テーブルは残す。公開前の正常デプロイは `2duA1VH2VPbzUGUKszKgxBGAth6C`。実際の切り戻し前に、以後の公開履歴と正式ドメインの割り当てを確認する。DROPや本番への自動復元は行わない。
