import fs from 'fs';
import path from 'path';

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

// Profile モデルの追加
const profileModel = `
// 人に関する情報（プロフィール）モデル
model Profile {
  id          String   @id @default("default")
  name        String   @default("Sien") // 名前
  title       String?  // 肩書き (例: Sound Creator)
  bioShort    String?  // 短い紹介文
  bioLong     String?  // 長い紹介文
  imageUrl    String?  // プロフィール画像URL
  achievements String? // 実績情報テキスト
  updatedAt   DateTime @updatedAt
}
`;

// FAQ モデルの追加
const faqModel = `
// よくある質問（FAQ）モデル
model FAQ {
  id          String   @id @default(cuid())
  question    String   // 質問
  answer      String   // 回答
  category    String   @default("COMMON") // MIX, ORIGINAL, COMMON など
  isPublished Boolean  @default(true) // 公開フラグ
  orderIndex  Int      @default(0) // 表示順
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
`;

// Service モデルの追加
const serviceModel = `
// サービス情報モデル
model Service {
  id          String   @id @default(cuid())
  name        String   // サービス名 (例: ボーカルMIX)
  category    String   // カテゴリ (MIX, ORIGINAL など)
  description String?  // サービス概要
  iconName    String?  // アイコン名
  features    String?  // サービスの特徴（JSONや改行テキスト）
  isPublished Boolean  @default(true) // 公開フラグ
  orderIndex  Int      @default(0) // 表示順
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
`;

// SiteSetting の拡張
// SiteSetting モデルの置換
const oldSiteSettingRegex = /\/\/ システム・サイト設定用モデル\r?\nmodel SiteSetting \{\r?\n[\s\S]*?updatedAt\s+DateTime\s+@updatedAt\r?\n\}/;

const newSiteSetting = `// システム・サイト設定用モデル
model SiteSetting {
  id                 String   @id @default("default")
  acceptingOrders    Boolean  @default(true) // (非推奨) 旧受付ステータス
  orderStatus        String   @default("AVAILABLE") // "AVAILABLE", "BUSY", "UNAVAILABLE"
  announcement       String?  // サイト案内メッセージ
  targetMonthlySales Int      @default(0) // 今月の目標売上額
  
  // 以下、サイト共通情報
  twitterUrl         String?  // Twitter (X) URL
  youtubeUrl         String?  // YouTube URL
  contactEmail       String?  // 問い合わせ用メールアドレス
  ctaTitle           String?  // 共通CTAのタイトル
  ctaDescription     String?  // 共通CTAの説明文
  footerText         String?  // フッターのテキスト
  
  updatedAt          DateTime @updatedAt
}`;

schemaContent = schemaContent.replace(oldSiteSettingRegex, newSiteSetting);

if (!schemaContent.includes('model Profile')) {
  schemaContent += profileModel;
}
if (!schemaContent.includes('model FAQ')) {
  schemaContent += faqModel;
}
if (!schemaContent.includes('model Service')) {
  schemaContent += serviceModel;
}

fs.writeFileSync(schemaPath, schemaContent, 'utf8');
console.log('Schema updated.');
