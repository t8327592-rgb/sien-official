import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'よくある質問 | SIEN.OFFICIAL',
  description: 'Sien-Officialへのご依頼に関するよくある質問（FAQ）をまとめています。',
};

export default function FAQPage() {
  const faqs = [
    {
      q: "初めての依頼でどう伝えればいいかわかりません。",
      a: "大丈夫です！「こんな感じにしたい」という参考曲のURLを教えていただければ、それに近づけるように調整します。「かっこよく」「可愛く」といったフワッとしたイメージでも問題ありません。"
    },
    {
      q: "納期はどれくらいですか？",
      a: "通常、音源データをいただいてから約7日間いただいております。お急ぎの場合は別途ご相談ください。"
    },
    {
      q: "修正（リテイク）は何回まで可能ですか？",
      a: "基本プラン内で2回まで無料で修正対応いたします。3回目以降は追加料金をいただく場合がございます。"
    },
    {
      q: "支払い方法は何がありますか？",
      a: "現在は銀行振込のみ対応しております。ご依頼が確定した際に振込先をご案内いたします。"
    },
    {
      q: "スマホで録音した音源でも依頼できますか？",
      a: "はい、可能です！ノイズ除去などをしっかり行い、聴きやすい音源に仕上げます。（ただしマイク録音に比べるとどうしても限界はある点のみご了承ください）"
    }
  ];

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-24 pt-32 relative">
      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#1D1D1F] font-heading tracking-widest">
            <span className="text-[#0071E3]">FAQ</span> / よくある質問
          </h1>
          <p className="text-gray-500 font-medium">ご依頼前によくいただく質問をまとめました。</p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="glass-panel p-6 md:p-8 rounded-2xl border-l-4 border-l-[#0071E3] shadow-sm">
              <h3 className="text-lg font-bold text-[#1D1D1F] mb-3 flex gap-3">
                <span className="text-[#0071E3]">Q.</span>
                {faq.q}
              </h3>
              <p className="text-gray-600 font-medium pl-8 leading-relaxed">
                <span className="text-gray-400 font-bold mr-2">A.</span>
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
