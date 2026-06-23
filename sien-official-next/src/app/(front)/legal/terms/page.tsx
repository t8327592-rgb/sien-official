import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '利用規約 | SIEN.OFFICIAL',
  description: 'SIEN.OFFICIALのサービス利用規約です。',
};

export default function TermsOfServicePage() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-24 pt-32 relative">
      <div className="container mx-auto px-6 max-w-3xl relative z-10">
        <div className="mb-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#1D1D1F]">
            利用規約
          </h1>
          <p className="text-gray-500 font-medium">最終更新日：2026年6月1日</p>
        </div>

        <div className="glass-panel p-8 md:p-12 rounded-3xl space-y-8 text-gray-600 font-medium leading-relaxed">
          <p>
            本利用規約（以下「本規約」）は、SIEN.OFFICIAL（以下「当方」）が提供するボーカルMIX、楽曲制作等の各種サービス（以下「本サービス」）の利用条件を定めるものです。
          </p>

          <section>
            <h2 className="text-xl font-bold text-[#1D1D1F] mb-4 border-l-4 border-l-[#0071E3] pl-3">1. 契約の成立</h2>
            <p>
              お客様からのご依頼内容に対し、当方がお見積もり及び納期の案内を行い、お客様がこれに同意された時点で契約が成立するものとします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1D1D1F] mb-4 border-l-4 border-l-[#0071E3] pl-3">2. 料金と支払い</h2>
            <p>
              料金は事前にお伝えした見積もり金額に従います。原則として、お支払いは銀行振込のみとし、振込手数料はお客様のご負担とさせていただきます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1D1D1F] mb-4 border-l-4 border-l-[#0071E3] pl-3">3. 修正（リテイク）について</h2>
            <p>
              納品後の修正（リテイク）は、原則2回まで無料で対応いたします。大幅な仕様変更や、3回目以降の修正については追加料金が発生する場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1D1D1F] mb-4 border-l-4 border-l-[#0071E3] pl-3">4. キャンセル</h2>
            <p>
              制作開始後のキャンセルは、原則としてお受けできません。やむを得ない事情によるキャンセルの場合は、進捗に応じたキャンセル料（最大で全額）をご請求させていただく場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1D1D1F] mb-4 border-l-4 border-l-[#0071E3] pl-3">5. 著作権と利用許諾</h2>
            <p>
              オリジナル楽曲の著作権は原則として当方に帰属しますが、お客様は当該楽曲を各種プラットフォームで自由に利用・公開することができます。ボーカルMIXに関しては、原曲の著作者の権利に従ってください。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
