import { getFAQs, getPlans } from "@/lib/data/cms";
import { CANCELLATION_TERMS, DELIVERY_TERMS, REVISION_TERMS } from "@/lib/contract-terms";

export interface PublicFAQ { id: string; question: string; answer: string }

export async function getPublicFAQs(category: "COMMON" | "MIX" | "ORIGINAL"): Promise<PublicFAQ[]> {
  const stored = await getFAQs(category);
  const common = stored.filter(faq => faq.category === "COMMON");
  const commonFallback: PublicFAQ[] = [
    { id: "free-consultation", question: "プランが未定でも相談できますか？", answer: "無料相談フォームではプランや素材を決めずに相談できます。相談・見積もりの送信で制作契約や料金は発生しません。" },
    { id: "payment", question: "支払いの時期と方法を教えてください。", answer: "正式見積に合意した後、銀行振込またはクレジットカード決済でお支払いいただきます。必要な素材と入金の確認がそろってから制作を開始します。領収書をご希望の場合はお知らせください。" },
    { id: "draft-delivery", question: "料金表の日数は最終納品までの期間ですか？", answer: DELIVERY_TERMS },
    { id: "cancellation", question: "キャンセル・返金はできますか？", answer: CANCELLATION_TERMS },
  ];
  const general = common.length ? common : commonFallback;
  if (category === "COMMON") return general;
  const specific = stored.filter(faq => faq.category === category);
  const plans = await getPlans(category);
  const revisionDetails = plans.map(plan => `${plan.name}：${plan.revisions || "正式見積でご案内"}`).join("\n");
  const fallback: PublicFAQ[] = [
    { id: `${category.toLowerCase()}-revisions`, question: "無料修正は何回までですか？", answer: `${REVISION_TERMS}\n${revisionDetails}` },
    ...(category === "MIX" ? [
      { id: "mix-materials", question: "音源はどう渡せばよいですか？", answer: "頭出し済み・エフェクトをかけていないボーカルWAVと、利用許諾のあるインスト音源をご用意ください。GigaFile便・Google Drive等の共有URLをフォームに記入してください。準備中の場合は後から提出できます。" },
      { id: "mix-options", question: "追加料金や単独サービスはありますか？", answer: "カットアップは10秒ごとの数量で見積もります。ボーカルガイド作成は単独でも依頼できます。トラック数や制作難易度による追加作業は正式見積で説明し、合意後に対応します。" },
    ] : [
      { id: "original-lyrics", question: "作詞の持ち込みや仮歌は選べますか？", answer: "選択したプランに応じて作詞を含む制作・歌詞の持ち込みに対応します。歌詞は共有URLまたは自由記述欄で提出できます。ボーカロイド仮歌は無料、人間による仮歌は有料で、選択した料金を見積に反映します。" },
      { id: "original-rights", question: "商用利用・著作権の扱いはどうなりますか？", answer: "原則として作編曲の著作権は制作者に帰属します。商用利用・著作権譲渡・二次利用をご希望の場合は事前に相談し、正式見積と個別契約で利用範囲を確認してください。詳細は留意事項の「使用許諾・権利について」をご確認ください。" },
    ]),
  ];
  return [...(specific.length ? specific : fallback), ...general];
}
