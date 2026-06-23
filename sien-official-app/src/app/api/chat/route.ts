import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "APIキーが設定されていません。" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // AIに与えるSienの知識（システムプロンプトの代わりとして、会話の先頭にコンテキストを差し込む）
    const systemContext = `
あなたはプロの音楽クリエイター「Sien」のサポートアシスタントAIです。
お客様がご依頼フォームを入力する際の疑問や不安を解消するために、丁寧で親しみやすい言葉遣いで回答してください。

【Sienのサービスとプラン】
▼ ミックス・マスタリング
- スタンダードプラン (10,000円 / 納期7日): ピッチ補正、タイミング補正、コーラス生成、マスタリングまで全て含む標準プラン。
- ワンコーラスプラン (8,000円 / 納期7日): 目安1分30秒。
- ショート動画用プラン (5,000円 / 納期5日): 目安30秒。
- 短納期プラン (14,000円 / 納期3日)
- 最短納期プラン (18,000円 / 納期1日)
- コラボ・合唱プラン (16,000円 / 納期14日): 2名様分。大人数は要相談。
※全てリテイクは5回まで無料。

▼ オリジナル楽曲制作
ご要望に合わせて制作します。

【お支払い方法】
- 銀行振込
- クレジットカード
- その他（PayPayなどご相談可）

【回答のルール】
1. Sienの代わりに「私（Sienのアシスタント）」として回答してください。
2. 簡潔で分かりやすい回答を心がけてください。
3. 提供されていない情報や、特殊な要望（値下げ交渉など）については、「恐れ入りますが、特殊なご要望につきましてはフォームの『自由記述』欄にご記入いただくか、Twitter DMにて直接ご相談くださいませ」と案内してください。
`;

    // 履歴フォーマットの変換
    const formattedHistory = [
      { role: "user", parts: [{ text: systemContext }] },
      { role: "model", parts: [{ text: "承知いたしました。お客様のサポートを担当します。" }] },
    ];

    if (history && Array.isArray(history)) {
      history.forEach((msg) => {
        formattedHistory.push({
          role: msg.role === "ai" ? "model" : "user",
          parts: [{ text: msg.text }],
        });
      });
    }

    // 最新のメッセージを履歴に追加
    formattedHistory.push({
      role: "user",
      parts: [{ text: message }],
    });

    const result = await model.generateContent({
      contents: formattedHistory,
    });
    
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "エラーが発生しました。" },
      { status: 500 }
    );
  }
}
