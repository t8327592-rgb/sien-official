# Sien-Official

Next.js / React / Prismaによるサービスサイトと管理画面。

```powershell
npm ci
npm run dev
```

公開前の確認：`npm run build`、`npm run typecheck`、`npm run lint`、`npm test`。

管理画面の見積書PDF機能（一括作成・編集・保存・改訂・案内文コピー）は [見積書の利用・検証・追加DB移行手順](docs/estimates.md) を参照してください。

運用・追加DB移行・Vercel Hobby対応の通知再試行・個人情報1年保管の手順は [SECURITY-CHANGES.md](SECURITY-CHANGES.md) にあります。全40項目の修正と最終検証は [監査修正結果](../audit/repair-final-2026-10-02.md) を参照してください。

旧ESMスクリプトは `.mjs` へ改名しました。旧SQLiteを読み取るツールはNode 22.13以上が必要です。通常の開発で移行・seed・scratchツールを実行しないでください。既存DBの受注やCMSを書き換える可能性があります。
