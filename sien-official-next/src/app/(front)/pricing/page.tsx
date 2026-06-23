export const metadata = {
  title: '料金・プラン | SIEN.OFFICIAL',
  description: 'ボーカルMIXやオリジナル楽曲制作の料金プランをご案内します。',
};

export default function PricingPage() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-24 pt-32 relative">
      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#1D1D1F] font-heading tracking-widest">
            <span className="text-[#0071E3]">PRICING</span> / 料金・プラン
          </h1>
          <p className="text-gray-500 font-medium">ご要望に合わせた柔軟なプランをご用意しております。</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Vocal MIX */}
          <div className="glass-panel p-8 md:p-10 rounded-3xl relative overflow-hidden border-t-4 border-t-[#0071E3]">
            <h2 className="text-2xl font-bold text-[#1D1D1F] mb-2">歌ってみた MIX</h2>
            <p className="text-gray-500 text-sm mb-6 font-medium">ボーカルのエディットからマスタリングまで</p>
            <div className="mb-8">
              <span className="text-4xl font-bold text-[#0071E3]">¥15,000</span><span className="text-gray-500">〜</span>
            </div>
            <ul className="space-y-4 mb-8 text-sm font-bold text-gray-600">
              <li className="flex items-center gap-3"><span className="text-[#47A1FF]">✓</span> ピッチ・タイミング補正</li>
              <li className="flex items-center gap-3"><span className="text-[#47A1FF]">✓</span> EQ / コンプレッサー処理</li>
              <li className="flex items-center gap-3"><span className="text-[#47A1FF]">✓</span> 空間系エフェクト（Reverb/Delay等）</li>
              <li className="flex items-center gap-3"><span className="text-[#47A1FF]">✓</span> マスタリング（音圧調整）</li>
            </ul>
            <a href="/contact" className="block text-center bg-[#0071E3] text-white font-bold py-4 rounded-full hover:bg-[#0060C0] transition-colors">
              このプランで相談する
            </a>
          </div>

          {/* Original Song */}
          <div className="glass-panel p-8 md:p-10 rounded-3xl relative overflow-hidden border-t-4 border-t-[#47A1FF]">
            <div className="absolute top-4 right-4 bg-[#47A1FF] text-white text-xs font-bold px-3 py-1 rounded-full">おすすめ</div>
            <h2 className="text-2xl font-bold text-[#1D1D1F] mb-2">オリジナル楽曲制作</h2>
            <p className="text-gray-500 text-sm mb-6 font-medium">作曲・編曲からMIXまでフルパッケージ</p>
            <div className="mb-8">
              <span className="text-4xl font-bold text-[#0071E3]">¥80,000</span><span className="text-gray-500">〜</span>
            </div>
            <ul className="space-y-4 mb-8 text-sm font-bold text-gray-600">
              <li className="flex items-center gap-3"><span className="text-[#47A1FF]">✓</span> ヒアリング・コンセプト設計</li>
              <li className="flex items-center gap-3"><span className="text-[#47A1FF]">✓</span> 作曲・編曲 (フルコーラス)</li>
              <li className="flex items-center gap-3"><span className="text-[#47A1FF]">✓</span> 仮歌作成</li>
              <li className="flex items-center gap-3"><span className="text-[#47A1FF]">✓</span> パラデータ納品対応</li>
              <li className="flex items-center gap-3"><span className="text-[#47A1FF]">✓</span> ボーカルMIX・マスタリング込み</li>
            </ul>
            <a href="/contact" className="block text-center bg-gray-900 text-white font-bold py-4 rounded-full hover:bg-gray-800 transition-colors">
              このプランで相談する
            </a>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-2xl">
          <h3 className="font-bold text-[#1D1D1F] mb-4">オプション料金（目安）</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium text-gray-600">
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span>ハモり作成（1トラック）</span>
              <span>+ ¥2,000</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span>お急ぎ便（3日以内納品）</span>
              <span>+ ¥5,000</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span>パラデータ納品（MIX）</span>
              <span>+ ¥3,000</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span>リテイク（3回目以降）</span>
              <span>+ ¥1,500/回</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-6 text-center">※上記はあくまで目安です。楽曲の難易度やトラック数により変動する場合がございます。</p>
        </div>
      </div>
    </div>
  );
}
