export const TERMS_VERSION = "2026-10-11";
export const REVISION_TERMS = "無料修正は、選択したプランに記載された回数・範囲で承ります。まとめ依頼は各作品ごとに回数を数えます。1回とは、まとめてお送りいただいた修正指示に対する1回の対応です。無制限のプランも当初合意した制作方針の範囲が対象です。";
export const DELIVERY_TERMS = "料金表の日数は、必要な素材と入金の確認がそろった翌日から数える暦日での初稿提出目安です。受付状況・内容を確認し、正式見積で初稿日を合意します。最終納品日は修正・確認期間を含めて別途調整します。希望公開日がある場合は事前にお知らせください。";
export const CANCELLATION_TERMS = "ご相談・お見積もりの段階では費用は発生しません。ご入金後は、制作着手前を含め、お客様都合のキャンセル・返金を原則としてお受けしておりません。個別の事情についてはご相談ください。運営側の都合で制作を継続できない場合は全額返金いたします。";

export function initialDraftDescription(description: string | null) {
  return description?.replace(/(\d+日(?:以内)?)(?:で|に)納品/g, "$1に初稿を提出") ?? "";
}

export function revisionSummary(plan: { revisions?: string | null }) {
  return plan.revisions || "正式見積でご案内";
}
