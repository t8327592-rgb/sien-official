import { ArrowRight, CalendarDays, Clock3, CreditCard, Headphones, Mic2, Sparkles, Tags } from "lucide-react";
import { connection } from "next/server";
import { autumnSale, saleDay, salePhase, salePrice } from "@/config/autumn-sale";
import { saleClock, salePlans } from "@/lib/autumn-sale";
import { getSiteSetting } from "@/lib/data/site-setting";
import { pageMetadata } from "@/lib/page-metadata";
import { DELIVERY_TERMS } from "@/lib/contract-terms";

import styles from "./sale.module.css";

const startDay = saleDay(autumnSale.firstDay, true);
const endDay = saleDay(autumnSale.lastDay, true);
const dueDay = saleDay(autumnSale.audioDueDay);
const discount = `${autumnSale.discount}%OFF`;
const campaign = pageMetadata(autumnSale.path, {
  title: `${autumnSale.name}｜歌ってみたMIX ${discount}｜Sien-Official`,
  description: `歌ってみたMIXの全プラン・全オプションが通常見積もり総額から${discount}。録音前でもお申し込みOK。受付は${startDay}〜${endDay}、音源提出は${dueDay}まで。`,
});
const socialImage = `${autumnSale.path}/opengraph-image`;
export const metadata = {
  ...campaign,
  openGraph: { ...campaign.openGraph, images: [{ url: socialImage, width: 1200, height: 630, alt: `${autumnSale.name} — ${discount}` }] },
  twitter: { ...campaign.twitter, images: [socialImage] },
};

const yen = new Intl.NumberFormat("ja-JP");
const priceText = (price: number | null) => price === null ? "要相談" : `${yen.format(price)}円`;

const features = [
  [Tags, "追加料金も割引対象", `MIXの全プラン・全オプションが対象。制作内容に応じた追加料金も含め、通常のお見積もり総額から${discount}。`],
  [Mic2, "録音は申し込みのあとで", `曲や録音日が未定でも受付期間中に申し込めます。音源は原則${dueDay}までにご提出ください。`],
  [Headphones, "複数曲もまとめて受付", "受付件数にも、お一人あたりの申し込み曲数にも制限はありません。投稿予定に合わせてご利用ください。"],
] as const;

const steps = [
  [CalendarDays, "お申し込み", "受付期間中に、ご依頼フォームからMIXをお申し込みください。"],
  [Mic2, "録音・素材提出", "音源を用意し、期限までにメールまたはDMで提出。フォームで提出済みの場合は再提出不要です。"],
  [CreditCard, "お見積もり・お支払い", "音源確認後に料金と初稿の目安をご案内します。内容にご同意いただいた後にお支払いください。"],
  [Headphones, "MIX制作・納品", "入金確認後に制作を進め、合意した日程に沿ってお届けします。"],
] as const;

const questions = [
  ["まだ録音していませんが申し込めますか？", `はい。録音前でもお申し込みいただけます。音源は原則${dueDay}までにご提出ください。`],
  ["申し込み時点で料金の支払いは必要ですか？", "お申し込み時点のお支払いは不要です。音源確認後に正式なお見積もりをご案内し、ご同意後にお支払い方法をお知らせします。"],
  ["複数曲申し込むことはできますか？", "はい。お申し込みいただける曲数に制限はありません。"],
  ["申し込み後に楽曲を変更できますか？", "はい。音源提出前であれば変更できます。"],
  [`オプションも${discount}になりますか？`, `はい。追加オプションを含むお見積もり総額から${discount}になります。`],
  ["表示されているセール料金で依頼できますか？", "表示は基本料金をもとにした目安です。楽曲の内容や音源の状態、トラック数、加工量などに応じて正式なお見積もりをご案内します。"],
  [`音源の提出が${dueDay}に間に合わない場合は？`, "状況に応じて個別に判断しますので、事前にご相談ください。"],
  ["初稿はいつ届きますか？", DELIVERY_TERMS],
  ["予約をキャンセルできますか？", "お支払い前であればキャンセル可能です。"],
] as const;

export default async function AutumnSalePage() {
  await connection();
  const { now, preview } = saleClock();
  const phase = salePhase(now);
  const [plans, setting] = await Promise.all([
    salePlans().catch(() => []),
    phase === "open" ? getSiteSetting().catch(() => null) : null,
  ]);
  const canApply = phase === "open" && setting !== null && setting.orderStatus !== "UNAVAILABLE" && plans.length > 0;
  const status = phase === "closed" ? "受付終了" : phase === "upcoming" ? "受付開始前" : canApply ? "受付中" : "受付停止中";
  const cta = canApply ? "セールに申し込む" : "通常のご依頼フォーム";
  const featuredPlan = plans.find(plan => plan.name === "スタンダードプラン" && plan.price !== null)
    ?? plans.find(plan => plan.price !== null);

  return (
    <div className={styles.sale}>
      <section className={styles.hero} aria-labelledby="sale-title">
        <div className={styles.wrap}>
          {preview && <p className={styles.preview}>隔離QAプレビュー（テストデータ・メールはローカル環境のみ）</p>}
          <div className={styles.heroStage}>
            <div className={styles.heroCopy}>
              <span className={styles.campaignBadge}><Sparkles size={16} aria-hidden="true" /> {autumnSale.name}</span>
              <h1 id="sale-title">秋の<span>MIXセール</span></h1>
              <p className={styles.heroLabel}>全プラン・全オプション対象<br />お見積もり総額から</p>
              <p className={styles.discount}>{autumnSale.discount}<span>% OFF</span></p>
              <p className={styles.heroPromise}>録音前でも、お申し込みOK。</p>
              <a className={styles.primary} href={autumnSale.orderPath}>{cta} <ArrowRight size={18} aria-hidden="true" /></a>
            </div>
            <div className={styles.heroArt} aria-hidden="true">
              <span className={styles.artEdition}>SIEN OFFICIAL <span> / </span> AUTUMN 2026</span>
              <div className={styles.recordDisc}>
                <div className={styles.recordLabel}><Mic2 /><span>VOCAL MIX</span></div>
              </div>
              <span className={styles.artCaption}>VOCAL MIX &amp; MASTERING</span>
            </div>
          </div>
          <div className={styles.schedule}>
            <div className={styles.scheduleTop}>
              <span>開催スケジュール <small>日本時間</small></span>
              <span className={styles.status} data-open={canApply}><i />{status}</span>
            </div>
            <dl className={styles.dates}>
              <div><dt><CalendarDays size={20} aria-hidden="true" /> セール受付期間</dt><dd>{startDay} 〜 {endDay}<small>最終日 23:59まで</small></dd></div>
              <div><dt><Clock3 size={20} aria-hidden="true" /> 音源提出期限</dt><dd>{dueDay}<small>原則 23:59まで</small></dd></div>
            </dl>
          </div>
        </div>
      </section>

      <div className={styles.wrap}>
        <section className={`${styles.section} ${styles.benefits}`} aria-labelledby="features">
          <p className={styles.kicker}>01 / SALE BENEFITS</p>
          <h2 id="features">秋のMIXセールの特長</h2>
          <ol className={styles.features}>{features.map(([Icon, title, copy]) => (
            <li key={title}><span className={styles.featureIcon}><Icon size={22} aria-hidden="true" /></span><h3>{title}</h3><p>{copy}</p></li>
          ))}</ol>
        </section>

        <section className={styles.section} aria-labelledby="pricing">
          <p className={styles.kicker}>02 / PRICE GUIDE</p>
          <h2 id="pricing">通常見積もりから、{discount}。</h2>
          <p className={styles.intro}>表示は参考料金（税込）です。最終料金は、音源とご希望の制作内容を確認してからご案内します。</p>
          {featuredPlan && featuredPlan.price !== null && (
            <div className={styles.featuredPrice}>
              <h3>{featuredPlan.name}</h3>
              <dl>
                <div><dt>通常料金例</dt><dd>{priceText(featuredPlan.price)}</dd></div>
                <div><dt>セール料金例</dt><dd>{priceText(salePrice(featuredPlan.price))}</dd></div>
              </dl>
            </div>
          )}
          {plans.length > 0 ? <details className={styles.priceDisclosure}>
            <summary>すべてのプランの料金を見る</summary>
            <div className={styles.priceCard}><table className={styles.prices}>
            <thead><tr><th scope="col">プラン・内容</th><th scope="col">通常料金例</th><th scope="col">セール料金例</th></tr></thead>
            <tbody>{plans.map(({ id, name, price }) => (
              <tr key={id}><th scope="row">{name}</th><td>{priceText(price)}</td><td>{priceText(price === null ? null : salePrice(price))}</td></tr>
            ))}</tbody>
            </table></div>
          </details> : <p className={styles.intro}>現在、料金一覧を表示できません。</p>}
          <div className={styles.priceNotes}>
            <p>音源の状態や制作内容に応じた追加料金も、割引の対象です。エンコードなどの無料特典は割引前の金額で判定します。</p>
            <a className={styles.textLink} href="/mix#plans">制作範囲・オプションを見る <ArrowRight size={16} aria-hidden="true" /></a>
          </div>
        </section>

        <section id="sale-apply" className={`${styles.section} ${styles.applySection}`} aria-labelledby="apply-title">
          <p className={styles.kicker}>03 / APPLICATION</p>
          <h2 id="apply-title">お申し込み</h2>
          <p className={styles.intro}>受付期間は {startDay} 〜 {endDay} 23:59（日本時間）。申し込み時点でのお支払いは不要です。</p>
          <a className={styles.primary} href={autumnSale.orderPath}>{cta} <ArrowRight size={18} aria-hidden="true" /></a>
        </section>

        <section className={styles.section} aria-labelledby="flow">
          <p className={styles.kicker}>04 / WORKFLOW</p>
          <h2 id="flow">お申し込みから納品まで</h2>
          <ol className={styles.steps}>{steps.map(([Icon, title, copy], i) => (
            <li key={title}><div className={styles.stepTop}><Icon size={23} aria-hidden="true" /><span className={styles.stepNumber}>0{i + 1}</span></div><h3>{title}</h3><p>{copy}</p></li>
          ))}</ol>
        </section>

        <section className={styles.section} aria-labelledby="faq-title">
          <p className={styles.kicker}>05 / FAQ</p>
          <h2 id="faq-title">よくある質問</h2>
          <div className={styles.faq}>{questions.map(([question, answer]) => (
            <details key={question}><summary>{question}</summary><p>{answer}</p></details>
          ))}</div>
        </section>

        <section id="sale-terms" className={styles.section} aria-labelledby="terms-title">
          <p className={styles.kicker}>06 / TERMS</p>
          <h2 id="terms-title">セール注意事項</h2>
          <ul className={styles.terms}>
            <li>受付期間中にご依頼フォームから送信されたMIXのお申し込みが対象です。</li>
            <li>提出期限に間に合わない場合やご依頼が集中した場合は、対応と納期を個別にご案内します。</li>
            <li>通常の<a href="/policy/guidelines">ご依頼に関する留意事項・受付条件</a>と<a href="/policy/privacy">プライバシーポリシー</a>も適用されます。</li>
          </ul>
        </section>
      </div>
      {canApply && <div className={styles.sticky}><a className={styles.primary} href={autumnSale.orderPath}>{cta} <ArrowRight size={18} aria-hidden="true" /></a></div>}
    </div>
  );
}
