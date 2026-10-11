# 公開前の運用設定・移行手順（2026-10-02）

この文書は監査40項目の修正後の仕様です。最新の検証結果と全項目の状態は `../audit/repair-final-2026-10-02.md` を参照してください。

## 公開先の利用条件

Vercel Hobbyは非商用の個人用途に限定され、サービス販売の宣伝・支払い受付は商用利用に該当します。[公式Fair Use Guidelines](https://vercel.com/docs/limits/fair-use-guidelines#commercial-usage)。このサイトで有料依頼を受ける公開運用には、Vercel Pro等または商用利用可能な別ホストが必要です。契約変更・課金・公開は実施していません。下記Hobby互換cronの技術的な設定は、商用公開の利用条件を解消するものではありません。

## 通知再試行：公開前に設定が必要

受注・受付番号・通知ジョブは同一DBトランザクションで保存します。通知が失敗しても受注を失いません。即時送信に加え、失敗ジョブを再試行するワーカーを用意しました。

- `vercel.json` は Hobby 対応で `0 3 * * *`、1日1回です（UTC 03時／日本時間12時台）。
- リポジトリルートの `.github/workflows/notifications.yml` は5分間隔です。毎時00分を避け、手動実行にも対応します。checkout・第三者Action・書き込み用GitHub権限は不要です。
- ワーカー：正式な本番ドメインの `/api/notifications/process`。GET/POSTとも `Authorization: Bearer CRON_SECRET` または管理者認証が必要です。匿名アクセスは401。
- Vercel Production環境へ32文字以上の十分にランダムな `CRON_SECRET` を設定してください。GitHubのリポジトリActions secretsにも同じ値を `CRON_SECRET` として登録します。値をソースやチケットに書かないでください。
- GitHub Actions secret `NOTIFICATION_WORKER_URL` に、正式なHTTPS本番URLを登録します。例：`https://www.sien-official.com/api/notifications/process`。ログイン・Preview保護のリダイレクトがない正式URLを選びます。ワークフローはリダイレクトに秘密値を転送しません。
- 通常のレビュー・公開手順でデフォルトブランチにworkflowを反映し、Vercelへデプロイ後、Actionsの `Run workflow` で成功を確認してください。この作業ではpush・デプロイ・秘密値の外部登録は実施していません。
- Actionsの失敗通知を有効にし、管理画面の「通知の配送状況」で FAILED / EXHAUSTED を確認します。配送失敗件数があればworkflowも失敗します。SMTP/Discord障害の解消後、管理画面から再試行できます。

Vercel Hobbyでは1日より短いcronはデプロイが拒否されます。[Vercel公式の制限](https://vercel.com/docs/cron-jobs/usage-and-pricing)。GitHubの5分間隔は実行時刻の保証ではありません。混雑時の遅延・ジョブ欠落、公開リポジトリの60日非活動による自動停止を監視してください。[GitHub公式のschedule仕様](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)。非公開リポジトリではActionsの利用時間・予算を確認し、追加課金を許可する前に上限を設定してください。Vercel日次cronを補助に残していますが、5分以内の復旧保証はありません。

ジョブはCASで確保し、2分のリースでプロセス終了後も回収します。30秒から最大1時間の間隔で再試行し、10回失敗でEXHAUSTEDになります。1回のワーカーは20件まで、開始予算20秒、Function最大60秒です。メールMessage-IDはジョブごとに固定します。外部サービス受理直後にプロセスが終了した場合の通知再配送はあり得ます。受注の重複防止と外部通知の完全な一度だけ配送は別の保証です。

## DB：既存データを残す追加移行

追加テーブルは `NotificationJob`、`SubmissionReceipt`、`ApiRateLimit`。SQLは `prisma/migrations/202610010001_notification_outbox`、`202610010002_submission_receipts`、`202610010003_rate_limit` にあります。既存受注・顧客・CMSへのALTER/UPDATE/DELETEを含みません。

設定済み接続先では追加DDLを適用し、必要列の存在確認に成功しています。本番相当の受注送信・実メール送信はしていません。別のデプロイ先を使う場合は、その接続先で再確認が必要です。Prisma datasourceは `POSTGRES_PRISMA_URL` と `POSTGRES_URL_NON_POOLING` です。

```powershell
npm run db:audit:check -- --deployment
# バックアップ・対象接続先を確認してから、未適用の場合のみ実行
npm run db:audit:apply -- --deployment
```

適用ツールは追加SQLのみをトランザクション＋advisory lockで実行し、再実行可能です。migrate reset、db push、既存データの取り込みは実行しないでください。既存DBにmigration履歴の基準がないため、このツールで履歴を偽装しません。将来のmigrate deploy導入には別途baseline設計が必要です。

ロールバックは新テーブルと受付証跡を残してコードを戻します。DROPしません。旧コードへ戻すと通知キューの処理が止まるため、未配送ジョブを確認し、復旧後に処理する運用が必要です。

## 認証・レート制限

`NEXTAUTH_SECRET`、`ADMIN_USERNAME`、`ADMIN_PASSWORD` はサーバーだけに設定します。全管理ページはDB読取前に認証し、管理API・Server Actionsでも認可します。ブラウザ管理APIの更新はOriginを検証します。正しい管理者資格情報は不正ログイン試行による共有カウンターのロックアウトを受けません。

| 対象 | 制限 |
| --- | --- |
| 不正ログイン | 利用者10回/15分、全体緊急上限10,000回/時 |
| 通常受注・法人お問い合わせ | 各APIで利用者10回/時、メールアドレス5回/時、緊急上限10,000回/時 |
| 公開チャット | 署名Cookieの利用者20回/分、50回/日、全体予算の既定1,000回/日 |

固定期間カウンターは共有DBの単一UPSERTで更新します。DB障害時、対象APIは503になり保存や外部呼び出しを開始しません。通常リクエストでテーブルを作成しません。定期処理で期限切れ技術カウンターのみを整理します。

`TRUSTED_CLIENT_IP_HEADER` は、利用環境の信頼できるProxyが必ず上書きするヘッダーを確認した場合だけ設定します。既定で転送IPを信頼せず、受注はメールアドレス、ログインはユーザー名をfallbackにします。チャットの訪問者CookieはHMAC署名、HttpOnly、SameSite、1日期限です。ネットワーク側の攻撃対策はホスト側で行ってください。

## 受注・価格・同意・個人情報

フロント表示金額を受け入れず、有効なプラン・オプション・数量からサーバーで再計算します。0円は0円として保持し、要相談はnullです。既存管理画面との互換性のためOrder.planIdには検証済みプラン名称のスナップショットを保存します。

送信キー＋内容ハッシュと受付番号で重複受注を防止します。同じ内容の再送は同じ受付番号を返します。同一キーで内容を変更すると409。利用者が新規受付を明示した場合のみ新しいキーにします。同意は規約版とサーバー日時を記録し、下書きから同意を復元しません。

保管方針は業務完了後1年を基本とし、法令上の会計記録や紛争対応は別途確認します。確認専用コマンドは個人情報を出力せず候補件数だけを出します。既存データを自動削除する機能はありません。

```powershell
npm run retention:report -- --deployment
```

納品日時のない旧受注は対象判断できません。法人完了・キャンセルは更新日時で候補を抽出するため、実際の業務完了日と例外を人間が確認してください。DB・バックアップ・メール・通知先それぞれの保管と削除は運用担当者が管理します。

Discord通知は受付番号と認証付き管理画面リンクのみ。メールは受付案内に必要な宛先のみで、利用者の自由入力を転送しません。AIへの外部入力は連絡先等をマスクし、管理者に確認案内を表示します。自由文内の全固有名詞まで完全に識別する保証はありません。GAは同意後のみで、依頼・管理・ログイン画面とURLクエリを送信しません。下書きは同じタブのsessionStorageに最大2時間だけ保存します。

## 表示・画像・保護ヘッダー

記事はrehype-sanitize、API入力は長さ・enum・URL・同意・プラン等を検証します。画像はJPEG/PNG/WebPのみで、クライアント5MB、サーバーでMIME・マジック・実デコード・画素数を検証し再エンコードします。SVG・任意リモート画像のサーバー取得は受け付けません。

CSP、frame拒否、nosniff、Referrer-Policy等を設定しました。静的ページのNext hydrationとの互換性のためscript/styleのinline許可は残しています。CSPだけで全XSSを防ぐ仕様ではありません。nonce方式への変更はキャッシュ方式との調整を含む別設計が必要です。

## 依存関係・既存スクリプト

Next 16.3.8、next-auth 4.24.15、Nodemailer 10.0.13、sharp 0.35.5をlock fileに固定しています。Credentials認証のみで、next-authのNodemailer任意peerはoverrideで安全な10系に揃えました。EmailProvider追加時には改めて互換性を確認してください。旧SQLite移行ツールはNode組み込みのread-only SQLiteへ移し、機能を残しました。`.js` の既存ESMツールは `.mjs` へ改名しています。

ローカルNodeは24.13で検証済み。旧SQLiteツールには22.13以上が必要です。移行・seed・scratchツールは実データを書き換える可能性があるため、日常確認には使いません。旧DB2ファイルはローカルに保持しGit追跡から外しました。Git履歴は書き換えていません。過去のDBに秘密情報が含まれていた場合は別途履歴評価が必要です。

## 検証

```powershell
npm ci
npm run build
npm run typecheck
npm run lint
npm test
# 書き込み・外部通知を隔離したローカル実動作確認（別ターミナル）
node scripts/qa-environment.mjs
node scripts/qa-regression.mjs
```

隔離QAはローカルメモリPostgreSQL・SMTP・Webhookを使用し、本物の認証情報やAPIキーを使いません。QA回帰ツールは固定localhost接続先とQA識別値を検証します。公開後の実SMTP到達、Cookie、画像、ヘッダー、Cron実行は本番環境で人間が確認してください。
