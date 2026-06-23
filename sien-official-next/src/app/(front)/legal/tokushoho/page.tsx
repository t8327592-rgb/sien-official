import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記 | SIEN.OFFICIAL',
  description: 'SIEN.OFFICIALの特定商取引法に基づく表記です。',
};

export default function TokushohoPage() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-24 pt-32 relative">
      <div className="container mx-auto px-6 max-w-3xl relative z-10">
        <div className="mb-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#1D1D1F]">
            特定商取引法に基づく表記
          </h1>
        </div>

        <div className="glass-panel p-8 md:p-12 rounded-3xl">
          <table className="w-full text-left border-collapse text-gray-600 font-medium">
            <tbody>
              <tr className="border-b border-gray-100">
                <th className="py-4 pr-6 font-bold text-[#1D1D1F] w-1/3">事業者名</th>
                <td className="py-4">SIEN.OFFICIAL（しえん）</td>
              </tr>
              <tr className="border-b border-gray-100">
                <th className="py-4 pr-6 font-bold text-[#1D1D1F]">所在地</th>
                <td className="py-4">お問い合わせいただいた際、遅滞なく開示いたします。</td>
              </tr>
              <tr className="border-b border-gray-100">
                <th className="py-4 pr-6 font-bold text-[#1D1D1F]">連絡先</th>
                <td className="py-4">お問い合わせフォームよりご連絡ください。</td>
              </tr>
              <tr className="border-b border-gray-100">
                <th className="py-4 pr-6 font-bold text-[#1D1D1F]">販売価格</th>
                <td className="py-4">各サービスのお見積り時にご案内いたします。</td>
              </tr>
              <tr className="border-b border-gray-100">
                <th className="py-4 pr-6 font-bold text-[#1D1D1F]">商品代金以外の必要料金</th>
                <td className="py-4">銀行振込手数料、インターネット接続に関わる通信料</td>
              </tr>
              <tr className="border-b border-gray-100">
                <th className="py-4 pr-6 font-bold text-[#1D1D1F]">支払方法</th>
                <td className="py-4">銀行振込</td>
              </tr>
              <tr className="border-b border-gray-100">
                <th className="py-4 pr-6 font-bold text-[#1D1D1F]">支払時期</th>
                <td className="py-4">原則として、ご依頼確定後または納品完了後の当方指定日までにお支払いください。</td>
              </tr>
              <tr className="border-b border-gray-100">
                <th className="py-4 pr-6 font-bold text-[#1D1D1F]">役務の提供時期（納品）</th>
                <td className="py-4">ご依頼内容に応じたスケジュールをご提示いたします（通常7日程度）。</td>
              </tr>
              <tr>
                <th className="py-4 pr-6 font-bold text-[#1D1D1F]">キャンセル・返金について</th>
                <td className="py-4">デジタルコンテンツという性質上、制作開始後および納品後のキャンセル・返金はお受けできません。</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
