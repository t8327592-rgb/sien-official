import { readJson, apiErrorResponse, textField } from "@/lib/api-input";
import { consumeRateLimit } from "@/lib/rate-limit";
import { isAdmin } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await consumeRateLimit("admin-ai", 30, 3600);
    const body = await readJson(req);
    for (const key of Object.keys(body)) {
      if (typeof body[key] === "string") textField(body, key, false, 5000);
    }
    const { 
      clientName, serviceType, message, 
      songTitle, vocalKey, referenceUrl, referenceFidelity
    } = body;

    const serviceName = serviceType === "MIX" ? "Mix & Mastering" : "Original Song";

    const prompt = `あなたはプロの音楽クリエイター「Sien」のアシスタントです。
以下のクライアントから依頼された楽曲が完成したため、Twitter(X)などのSNSで告知するためのポスト本文を作成してください。

【ご依頼情報】
・お名前: ${clientName} 様
・希望サービス: ${serviceName}
・曲名: ${songTitle || "オリジナル楽曲"}
・歌唱キー: ${vocalKey || "未設定"}
・参考曲URL: ${referenceUrl || "なし"}
・リファレンス再現度: ${referenceFidelity || "未設定"}
・ご要望・メッセージ: ${message || "特になし"}

【作成するSNSポストの条件】
以下の構成（テンプレート）に従って作成してください。
[AIによる解説] の部分は、ご依頼情報をもとにあなたが考えて1〜2段落で挿入してください。

=== 出力テンプレート ===
お仕事情報🎼

【${serviceName}】
${clientName}様 - ${songTitle || "オリジナル楽曲"}
担当しました✨

[AIによる解説]

ぜひご視聴ください！ 🎧
========================

【AIによる解説の作成ルール】
1. 「担当しました✨」の後に続く文章として自然な流れになるようにしてください。（例：「今回は、〇〇な雰囲気を活かすために〜」「〇〇様の世界観を引き立てるよう〜」など）
2. もし「ご要望・メッセージ」が「特になし」の場合は、無理に詳細を捏造せず、「ボーカルの魅力を最大限に引き出すため、クリアで丁寧なミックスを心がけました！」「楽曲の持つ世界観と自然に馴染むよう、全体のバランスにこだわって仕上げています🔥」といった、どのような楽曲にも合うプロフェッショナルなアピール文を生成してください。
3. 主語（私が、Sienが）はなるべく省き、作品の魅力やこだわった点（リバーブ、パンチ、ピッチの自然さなど）を中心に記載してください。
4. 絵文字を適度に（1〜3個程度）使用してください。

それでは、出力テンプレートに沿ってテキストのみを生成してください。`;

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest", generationConfig: { maxOutputTokens: 1500 } });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return Response.json({ postContent: text.replace(/=== 出力テンプレート ===|========================/g, '').trim() });
  } catch (error) {
    const response = apiErrorResponse(error);
    if (response) return response;
    console.error("Post Generation Error:", error);
    return Response.json({ error: 'Failed to generate post content' }, { status: 500 });
  }
}
