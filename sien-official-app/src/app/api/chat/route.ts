import { getPlans } from "@/lib/data/cms";
import { readJson, textField, ApiError, apiErrorResponse } from "@/lib/api-input";
import { consumeRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const body = await readJson(req, 32000);
    const message = textField(body, "message", true, 2000);
    const history = body.history ?? [];
    if (!Array.isArray(history) || history.length > 12 || history.some(msg =>
      !msg || !["user", "ai"].includes(msg.role) || typeof msg.text !== "string" || msg.text.length > 2000
    )) throw new ApiError(400, "会話が長くなりました。チャットを開き直してください。");
    await consumeRateLimit("chat-minute", 20, 60);
    await consumeRateLimit("chat-day", 200, 86400);
    const plans = await getPlans();
    const planSummary = plans.map(plan => plan.name + " / 基本料金: " + (plan.price === null ? "要相談" : plan.price + "円") + " / 納期: " + (plan.period || "要相談") + " / 修正: " + (plan.revisions || "要相談")).join("\n");

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "APIキーが設定されていません。" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest", generationConfig: { maxOutputTokens: 800 } });

    // AIに与えるSienの知識（システムプロンプトの代わりとして、会話の先頭にコンテキストを差し込む）
    const systemContext = `
あなたはプロの音楽クリエイター「Sien」のサポートアシスタントAIです。
お客様がご依頼フォームを入力する際の疑問や不安を解消するために、丁寧で親しみやすい言葉遣いで回答してください。

【Sienのサービスとプラン】
${planSummary}
※記載料金は基本料金です。オプションを含む見積もりは担当者が確認します。

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
    const response = apiErrorResponse(error);
    if (response) return response;
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "エラーが発生しました。" },
      { status: 500 }
    );
  }
}
