# PXstudio本番反映の運用記録

2026年11月13日の本番反映依頼に対応する。実装・ローカル検証は `pxstudio-local.md` を参照。

## 対象と保持方針

- 本番サイト：`https://www.sien-official.com`。
- 既存Vercelプロジェクト：`siens-projects-12731339/sien-official-com`。既存Git連携のmainへのpushで公開する。公開前のコミットは `50ec129e9a606d3b1ba8ae9dc270abd329df6c47`。
- 追加するのはPXstudio専用の3テーブルと索引のみ。既存の依頼・入金・経費・問い合わせ・設定を更新するSQLはない。
- 添付CSVや架空のテスト明細は本番へ保存しない。公開後の取り込み確認はプレビューまでとし、確定保存を行わない。
- 本番の既存アーカイブ案件は表示・ボタンの存在を確認する。動作確認のために実案件の保管状態を変更しない。保存・復元の実操作は隔離QAで検証済み。

## バックアップとDB追加

`scripts/pxstudio-release.mjs` は今回の本番ホスト・DB名・TLSを固定照合する。公開パスやビルドから自動起動しない。

```powershell
node --env-file=.env scripts/pxstudio-release.mjs --report
node --env-file=.env scripts/pxstudio-release.mjs --backup
node --env-file=.env scripts/pxstudio-release.mjs --restore-check
# 復元検証が済み、対象とバックアップを確認してから実行
node --env-file=.env scripts/pxstudio-release.mjs --migrate
node --env-file=.env scripts/pxstudio-release.mjs --verify
```

全ユーザーテーブルの定義・制約・索引・全行をRepeatable Readの読み取り専用トランザクションで取得する。日時のマイクロ秒を落とさないJSONBの値を保持し、AES-256-GCMで暗号化。鍵はWindows DPAPI CurrentUserで保護する。既存ファイルは上書きしない。復号には作成時のWindowsユーザープロファイルが必要。

`--restore-check` は復号したバックアップを使い捨てのメモリ内PostgreSQLへ復元し、全テーブル・全行のハッシュ一致と制約・索引作成を確認する。本番への自動復元処理はない。

`--migrate` は対応する復元検証結果がある場合のみ、承認済み追加SQLをトランザクションとadvisory lockの中で実行する。専用テーブルがすでにある場合は中断し、再実行で上書きしない。`migrate deploy` の履歴基準がない既存DBなので、今回の追加SQLだけを適用し、migration履歴を偽装しない。

`--verify` はバックアップに存在した全行を全項目照合し、変更・欠落があれば失敗する。通常運用による同時更新も検知対象であり、自動で巻き戻さない。件数・ハッシュ・変更件数のみを記録し、データ本文・認証情報をログに出さない。

今回の実行結果・暗号化バックアップ・復元結果・画面証跡はリポジトリルートの `audit/pxstudio-release-2026-11-13/` に保存し、Gitと公開成果物から除外する。

## 公開後の確認・切り戻し

1. Vercelの対象コミットのビルド成功、Ready / Production、正式ドメインへの割り当てを確認。
2. 本番で認証済みPXstudio画面、年・月別表示、CSVプレビュー、アーカイブの全件初期表示、既存売上画面を確認。
3. 匿名での管理ページ・管理APIの拒否、公開ページの表示を確認。
4. バックアップとの全既存データの再照合を実施。

障害時はVercelで直前の正常デプロイへ切り戻す。今回追加したテーブルは残し、DROPや破壊的な逆移行を行わない。初回公開前の正常デプロイは `677d7hoLLC7QgzHSP9EowVoNDVqy`。切り戻し前に、その後の公開履歴と正式ドメインの割当先を確認する。
