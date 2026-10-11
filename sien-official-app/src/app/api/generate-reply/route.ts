import { externalText } from "@/lib/external-text";
import { prisma } from "@/lib/prisma";
import { readJson, apiErrorResponse, textField } from "@/lib/api-input";
import { consumeRateLimit } from "@/lib/rate-limit";
import { isAdminRequest } from "@/lib/admin-api-auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  if (!(await isAdminRequest(req))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await consumeRateLimit("admin-ai", 30, 3600);
    const body = await readJson(req);
    for (const key of Object.keys(body)) {
      if (typeof body[key] === "string") textField(body, key, false, 5000);
    }
    const {
      clientName, isRepeater, serviceType, message,
      songTitle, options, vocalKey, referenceUrl, referenceFidelity,
      materialsUrl, paymentMethod, deadline
    } = body;

    const serviceName = serviceType === "MIX" ? "ミックス・マスタリング" : "オリジナル楽曲制作";

    // Orders historically contain either an ID or a Japanese name snapshot.
    const reference = textField(body, "planId", false, 150);
    const legacyNames: Record<string, string> = {
      mix_standard: "スタンダードプラン", mix_one_chorus: "ワンコーラスプラン",
      mix_short: "ショート動画用プラン", mix_fast: "短納期プラン",
      mix_express: "最短納期プラン", mix_collab: "コラボ・合唱プラン",
    };
    const plan = reference ? await prisma.plan.findFirst({ where: {
      category: textField(body, "serviceType", true, 20),
      OR: [{ id: reference }, { name: reference }, { name: legacyNames[reference] ?? reference }],
    } }) : null;
    const planName = plan?.name ?? reference ?? "未設定";
    const planContext = plan
      ? "現在の基本料金: " + (plan.price === null ? "要相談" : plan.price.toLocaleString("ja-JP") + "円")
        + " / 納期目安: " + (plan.period || "要相談") + " / 修正回数: " + (plan.revisions || "要相談")
        + "。オプションを含む確定見積もりは管理者が確認します。"
      : "プラン情報を確認できません。料金・納期を推測せず、管理者による確認が必要としてください。";

    // 挨拶の分岐
    const greeting = isRepeater
      ? `お世話になっております！\nこの度もご依頼いただき、誠にありがとうございます！`
      : `はじめまして！\nこの度は数ある中から「Sien」にご依頼・お問い合わせいただき、誠にありがとうございます。`;

    // リファレンス再現度のテキスト変換
    const fidelityText = referenceFidelity === "1" ? "一応載せますが、クリエイターの好きなように基本お任せします"
                       : referenceFidelity === "2" ? "雰囲気を参考にしつつ、全体的なバランスはお任せします"
                       : referenceFidelity === "3" ? "できるだけ参考音源に近い雰囲気で仕上げてください"
                       : "未設定";

    const prompt = `あなたはプロの音楽クリエイター「Sien」のアシスタントです。
以下のクライアントからの依頼内容に対して、Twitter(X)などのDMでそのまま送信できる、丁寧でプロフェッショナルな返信文（下書き）を作成してください。

【クライアント・ご依頼情報】
・お名前: [お客様] 様
・顧客ステータス: ${isRepeater ? "リピーター" : "新規"}
・希望サービス: ${serviceName} (プラン: ${externalText(planName, typeof clientName === "string" ? clientName : undefined)})
・プラン詳細仕様: ${planContext || "なし"}
・曲名: ${externalText(songTitle, typeof clientName === "string" ? clientName : undefined) || "未設定"}
・歌唱キー: ${externalText(vocalKey, typeof clientName === "string" ? clientName : undefined) || "未設定"}
・参考曲URL: ${referenceUrl ? "参考資料あり（URLは外部送信しません）" : "なし"}
・リファレンス再現度: ${fidelityText}
・素材提出URL: ${materialsUrl ? "提出あり（URLは外部送信しません）" : "なし"}
・希望納期: ${externalText(deadline, typeof clientName === "string" ? clientName : undefined) || "未設定"}
・支払い方法: ${externalText(paymentMethod, typeof clientName === "string" ? clientName : undefined) || "未設定"}
・オプション: ${externalText(options, typeof clientName === "string" ? clientName : undefined) || "なし"}
・要望・メッセージ:
${externalText(message, typeof clientName === "string" ? clientName : undefined) || "なし"}

【返信文の条件】
・DMで送信するため、「件名」は絶対に含めないでください。
・冒頭の挨拶は、一言一句そのまま以下の文章を使用してください。
「${greeting}」

・次に、クライアントがフォームに入力した内容（要望や楽曲情報など）に軽く触れ、「内容を確認いたしました」という安心感を与えてください。
  （例: 「ご提示いただいた参考曲の雰囲気に寄せて制作を進めさせていただきます」など）
・もし「素材提出URL」が空（なし）の場合は、「ご都合の良いタイミングで録音データや素材をお送りいただけますと幸いです」という旨の案内を含めてください。
・「プラン詳細仕様」の情報（料金や納期）に基づき、お見積もりと納期目安をご案内してください。
・以下の「追加ヒアリング項目」のうち、フォームの入力情報やメッセージからまだ読み取れない情報があれば、優しく質問してください。
  - 希望納期（未設定の場合のみ）
  - 録音データの状態（MIX依頼の場合: ノイズ処理やピッチ補正がどの程度必要か）
  - 用途（楽曲制作依頼の場合: YouTube配信用、商用利用など）
・トーン＆マナー：礼儀正しく、かつクリエイターとしての温かみがある文面。堅苦しすぎないようにしてください。
・文末は以下のような署名で締めてください。
------------------------
Sien
Web: [サイトURL]
------------------------
`;

    // 公式SDKの初期化
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
    // 'gemini-flash-latest' モデルを取得
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest", generationConfig: { maxOutputTokens: 1500 } });

    // コンテンツを生成
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replaceAll("[お客様]", typeof clientName === "string" ? clientName : "お客様");

    return Response.json({ reply: text });
  } catch (error) {
    const response = apiErrorResponse(error);
    if (response) return response;
    console.error("AI generation unavailable");
    return Response.json({ error: 'Failed to generate reply' }, { status: 500 });
  }
}
