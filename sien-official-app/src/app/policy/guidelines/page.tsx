import { pageMetadata } from "@/lib/page-metadata";
import { Metadata } from "next";
import { getPlans } from "@/lib/data/cms";
import { REVISION_TERMS, DELIVERY_TERMS, CANCELLATION_TERMS, revisionSummary } from "@/lib/contract-terms";

export const metadata: Metadata = pageMetadata("/policy/guidelines", {title: "ご依頼に関する留意事項 | Sien-Official"});

export default async function GuidelinesPage() {
  const plans = await getPlans();
  return (
    <div className="container mx-auto py-20 px-4 mt-20 max-w-4xl">
      <h1 className="text-4xl font-bold mb-4 text-center text-slate-800">ご依頼に関する留意事項</h1>
      <p className="text-center text-slate-500 mb-12">Terms of Service</p>

      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100 prose prose-slate max-w-none">
        <p className="lead text-slate-600 mb-10">
          本留意事項は、しえんが提供する「MIX・マスタリング」「オリジナル楽曲制作」等の音響制作サービス（以下「本サービス」）に関しての契約条件を定めたものです。ご依頼の際は、下記内容にご同意いただいたものとみなします。
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">1. お支払いについて</h2>
            <ul className="list-disc pl-5 text-slate-600 space-y-2">
              <li>本サービスはすべて前払い制となっております。ご入金確認後、制作に着手いたします。</li>
              <li>お支払い方法は「クレジットカード決済」または「銀行振込」からお選びいただけます。</li>
              <li>コラボや合唱企画などでのお支払い分割をご希望の場合は、銀行振込にて対応可能です。クレジットカード決済では分割対応ができかねますので、代表者様による一括払いをお願いいたします。</li>
              <li>法人様からのご依頼は、原則として銀行振込で承ります。支払時期などは事前にご相談ください。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">2. 納期について</h2>
            <ul className="list-disc pl-5 text-slate-600 space-y-2">
              <li>{DELIVERY_TERMS}</li>
              <li>修正指示のご提出や内容確認に要する期間は、料金表の初稿提出目安には含まれません。</li>
              <li>明確な公開日やスケジュールがある場合（例：記念日投稿・イベント公開）は必ず事前にお伝えください。</li>
              <li>オリジナル楽曲など制作工程が多い案件は、通常より納期を長くいただくことがございます。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">3. 素材・音源データのご提出について</h2>
            <ul className="list-disc pl-5 text-slate-600 space-y-2">
              <li>ご入金後、録音素材・ご希望の参考資料などは【3か月以内】にご提出ください。期限を過ぎた場合は、制作再開時に延滞料金が発生する可能性があります。</li>
              <li>お持ち込みいただいた音源・歌詞・イラスト・動画等の素材は、著作権または利用許諾を得ているものとして取り扱います。第三者の著作権を侵害する素材によるトラブルの責任は負いかねます。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">4. 修正対応について</h2>
            <ul className="list-disc pl-5 text-slate-600 space-y-2">
              <li>{REVISION_TERMS}</li>
              <li>規定回数を超える修正は、作業前に追加のお見積もりをご案内します。</li>
              <li>ご依頼時と大きく異なる方針変更（例：キー変更、歌詞の差し替え、テンポの変更など）は「再制作扱い」となり、別途料金が発生する場合があります。</li>
            </ul>
            <dl className="mt-4 space-y-2 text-sm text-slate-700">
              {plans.map(plan => <div key={plan.id} className="flex flex-wrap justify-between gap-2 border-b border-slate-100 py-2"><dt>{plan.name}</dt><dd>{revisionSummary(plan)}{plan.name.includes("本セット") ? "（各作品）" : ""}</dd></div>)}
            </dl>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">5. 納品ファイル形式・保管について</h2>
            <ul className="list-disc pl-5 text-slate-600 space-y-2">
              <li>納品ファイルの形式は基本的に WAV（24bit/48kHz） となります。別形式をご希望の場合は事前にお申し付けください。</li>
              <li>完成データは、納品後【1年】を目安に削除させていただきます。再ダウンロードをご希望の場合はお早めにご連絡ください。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">6. 連絡手段・対応について</h2>
            <ul className="list-disc pl-5 text-slate-600 space-y-2">
              <li>原則として24時間以内にご返信いたしますが、状況によりお時間をいただく場合もございます。</li>
              <li>SNS（X・Twitterなど）でのやり取りをご希望の場合は、DM解放やフォロー設定をあらかじめご確認ください。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">7. クレジット表記のお願い</h2>
            <p className="text-slate-600 mb-2">完成した作品をSNSや動画投稿サイトにて公開される際は、下記のようにクレジット表記をお願いしております。</p>
            <div className="bg-slate-50 p-4 rounded-lg text-slate-700 font-mono text-sm">
              Mix：しえん（@sien_mc09）<br/>
              作編曲：しえん（@sien_mc09）
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">8. 使用許諾・権利について</h2>
            <ul className="list-disc pl-5 text-slate-600 space-y-2">
              <li>MIX音源は編集・再現物であり、著作権には該当しない場合もございますが、無断での再販売・再配布・譲渡などはご遠慮ください。</li>
              <li>オリジナル楽曲の作編曲に関しては、原則として制作者（しえん）に著作権が帰属します。商用利用・著作権譲渡をご希望の場合は、別途契約が必要ですのでご相談ください。</li>
            </ul>
            <p className="text-slate-500 text-sm mt-2 ml-5">※YouTube・SNS投稿、歌ってみたなどの非営利公開は商用利用には含まれません。</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">9. 納品後の使用範囲について</h2>
            <ul className="list-disc pl-5 text-slate-600 space-y-2">
              <li>オリジナル楽曲制作物を二次利用（別動画・商用アプリへの使用など）される場合は、事前にご相談ください。</li>
              <li>再配布・転売・NFT等への転用は禁止とさせていただきます。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">10. 実績公開について</h2>
            <ul className="list-disc pl-5 text-slate-600 space-y-2">
              <li>ご依頼いただいた作品を、ポートフォリオやSNSにて実績として掲載させていただく場合がございます。</li>
              <li>実績公開NGの場合は、あらかじめその旨をお知らせください。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">11. キャンセル・返金ポリシー</h2>
            <ul className="list-disc pl-5 text-slate-600 space-y-2">
              <li>{CANCELLATION_TERMS}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">12. ご連絡が途絶えた場合の対応</h2>
            <ul className="list-disc pl-5 text-slate-600 space-y-2">
              <li>ご入金後6か月以上ご連絡がない場合、制作完了とみなして「納品完了」の処理をさせていただく場合がございます。</li>
            </ul>
            <p className="text-slate-500 text-sm mt-2 ml-5">※納品後のデータ再送は可能な限り対応いたしますが、データの保管期限は保証いたしかねます。</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">13. 改定について</h2>
            <ul className="list-disc pl-5 text-slate-600 space-y-2">
              <li>本留意事項は予告なく内容を変更する場合がございます。常に最新の内容をご確認ください。</li>
              <li>改定による損害・トラブルについては責任を負いかねますので、あらかじめご了承ください。</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
