import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      clientName, isRepeater, serviceType, planId, message, 
      songTitle, options, vocalKey, referenceUrl, referenceFidelity, 
      materialsUrl, paymentMethod, deadline 
    } = body;

    const serviceName = serviceType === "MIX" ? "ミックス・マスタリング" : "オリジナル楽曲制作";
    
    // プラン情報の解決
    let planName = "未設定";
    let planContext = "";
    
    if (serviceType === "MIX") {
      switch (planId) {
        case "mix_standard":
          planName = "スタンダードプラン";
          planContext = "料金: 10,000円 / 納期目安: 7日 / リテイク: 5回";
          break;
        case "mix_one_chorus":
          planName = "ワンコーラスプラン";
          planContext = "料金: 8,000円 / 納期目安: 7日 / リテイク: 5回";
          break;
        case "mix_short":
          planName = "ショート動画用プラン";
          planContext = "料金: 5,000円 / 納期目安: 5日 / リテイク: 5回";
          break;
        case "mix_fast":
          planName = "短納期プラン";
          planContext = "料金: 14,000円 / 納期目安: 3日 / リテイク: 5回";
          break;
        case "mix_express":
          planName = "最短納期プラン";
          planContext = "料金: 18,000円 / 納期目安: 1日 / リテイク: 5回";
          break;
        case "mix_collab":
          planName = "コラボ・合唱プラン";
          planContext = "料金: 16,000円 (2名分) / 納期目安: 14日 / リテイク: 5回";
          break;
        default:
          planName = planId || "未設定";
      }
    } else {
      planName = planId || "未設定";
    }

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
・お名前: ${clientName} 様
・顧客ステータス: ${isRepeater ? "リピーター" : "新規"}
・希望サービス: ${serviceName} (プラン: ${planName})
・プラン詳細仕様: ${planContext || "なし"}
・曲名: ${songTitle || "未設定"}
・歌唱キー: ${vocalKey || "未設定"}
・参考曲URL: ${referenceUrl || "なし"}
・リファレンス再現度: ${fidelityText}
・素材提出URL: ${materialsUrl || "なし"}
・希望納期: ${deadline || "未設定"}
・支払い方法: ${paymentMethod || "未設定"}
・オプション: ${options || "なし"}
・要望・メッセージ:
${message || "なし"}

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
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // コンテンツを生成
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return Response.json({ reply: text });
  } catch (error) {
    console.error("AI Generation Error:", error);
    return Response.json({ error: 'Failed to generate reply' }, { status: 500 });
  }
}
