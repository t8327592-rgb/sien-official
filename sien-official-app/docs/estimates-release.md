# 見積書機能の本番反映

2026-11-24のユーザー指示「本番DBのバックアップと既存データへの影響を確認したうえで、追加テーブルの適用とデプロイ」に対応する運用手順。

## 対象

- 既存Vercelプロジェクト `siens-projects-12731339/sien-official-com`、正式ドメイン `https://www.sien-official.com`。
- GitHub `t8327592-rgb/sien-official` のmainへの通常pushで公開。アプリのルートは `sien-official-app`。
- 公開前コミット `1de08cb1508fb55ed93852b7653f5d6d6efa9bbc`、公開前の正常デプロイ `GzTcKaBnTwNvLn8wmUL8tVzy8jA4` をVercel画面で確認。
- DBは既存運用と同じNeon PostgreSQL。Prisma migration履歴のベースラインがないため、今回の追加SQLだけを適用する。

## バックアップ・保護

`scripts/estimates-release.mjs` は本番ホスト、DB名、TLSを固定照合する。全ユーザーテーブルの定義・制約・索引・全行をRepeatable Readの読み取り専用トランザクションで取得し、AES-256-GCMで暗号化する。鍵はWindows DPAPI CurrentUserで保護する。復号には作成時のWindowsユーザープロファイルが必要。

保存先はリポジトリルートの `audit/estimates-release-2026-11-24/`。Git・公開成果物から除外される。既存のバックアップを上書きしない。ログにはデータ本文・資格情報を出さず、件数・ハッシュのみ記録する。

```powershell
node --env-file=.env scripts/estimates-release.mjs --backup
node --env-file=.env scripts/estimates-release.mjs --restore-check
node --env-file=.env scripts/estimates-release.mjs --migrate
node --env-file=.env scripts/estimates-release.mjs --verify
```

`--restore-check` は復号したバックアップをメモリ内PostgreSQLへ復元し、全行のハッシュ一致、制約・索引、追加SQLの適用、追加2テーブルが空であることを確認する。

`--migrate` はバックアップと復元検証、承認したSQLのSHA-256一致、バックアップ以降の既存定義の一致を必須とする。本番ではトランザクションとadvisory lock内で `Estimate` / `EstimateOrder` と索引だけを作成する。既存テーブルの更新・削除、既存金額の移行、見積書データの作成は含まない。追加テーブルが既にある場合は停止する。

`--verify` は既存の全テーブル定義・制約・索引・全行を再照合する。欠落・変更があれば失敗し、自動復元・リセットは行わない。通常運用の同時更新も検出対象となるため、発生時は内容を私的な監査情報で確認する。初回公開時の見積書2テーブルは0件を維持する。

## 公開後の確認

- Vercelの対象コミットがReady / Productionになり、正式ドメインへ割り当たったこと。
- 匿名で管理ページ・保存API・PDF APIが拒否されること。
- 認証済みの依頼一覧、保存済み見積書一覧、新規編集画面、既存の売上・入金関連画面が表示されること。
- 本番の確認は読み取りと未保存プレビューまで。実依頼への見積保存、金額編集、入金登録、外部送信は行わない。
- 公開後に `--verify` を再実行し、既存データの変更・欠落0件を確認する。

`node --env-file=.env scripts/qa-estimates-production.mjs` は正式ドメインへの匿名・管理者アクセス、既存画面、新規編集画面、未保存PDFプレビュー、Origin拒否、保存件数0を検査する。PDFは動作確認用の合成文面を使用し、本番依頼を変更せず、PDF本文や資格情報も保存・出力しない。

問題時は直前の正常なVercelデプロイへアプリだけを切り戻す。追加テーブルは残す。DROPや本番への自動復元は行わない。

バックアップ、復元検証、SQL適用、本番照合、公開状態の実行結果は上記 `audit` 配下に記録する。利用方法・実装ファイル一覧は [estimates.md](estimates.md) を参照。
