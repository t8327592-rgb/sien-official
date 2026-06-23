import { Metadata } from "next";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | Sien-Official",
};

export default function LawPage() {
  return (
    <div className="container mx-auto py-20 px-4 mt-20 max-w-4xl">
      <h1 className="text-4xl font-bold mb-4 text-center text-slate-800">特定商取引法に基づく表記</h1>
      <p className="text-center text-slate-500 mb-12">Legal Information</p>

      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100 max-w-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <tbody>
              <tr className="border-b border-slate-100">
                <th className="py-4 px-4 font-bold text-slate-800 bg-slate-50 w-1/3 rounded-tl-lg">販売事業者名（屋号）</th>
                <td className="py-4 px-4 text-slate-600">Sien（屋号）</td>
              </tr>
              <tr className="border-b border-slate-100">
                <th className="py-4 px-4 font-bold text-slate-800 bg-slate-50">運営責任者</th>
                <td className="py-4 px-4 text-slate-600">佐藤 翼</td>
              </tr>
              <tr className="border-b border-slate-100">
                <th className="py-4 px-4 font-bold text-slate-800 bg-slate-50">所在地</th>
                <td className="py-4 px-4 text-slate-600">ご請求があった場合、遅滞なく開示いたします。</td>
              </tr>
              <tr className="border-b border-slate-100">
                <th className="py-4 px-4 font-bold text-slate-800 bg-slate-50">電話番号</th>
                <td className="py-4 px-4 text-slate-600">ご請求があった場合、遅滞なく開示いたします。</td>
              </tr>
              <tr className="border-b border-slate-100">
                <th className="py-4 px-4 font-bold text-slate-800 bg-slate-50">メールアドレス</th>
                <td className="py-4 px-4 text-slate-600">px.sien@gmail.com</td>
              </tr>
              <tr className="border-b border-slate-100">
                <th className="py-4 px-4 font-bold text-slate-800 bg-slate-50">販売価格</th>
                <td className="py-4 px-4 text-slate-600">各サービスページに税込価格として記載しております。</td>
              </tr>
              <tr className="border-b border-slate-100">
                <th className="py-4 px-4 font-bold text-slate-800 bg-slate-50">商品代金以外の必要料金</th>
                <td className="py-4 px-4 text-slate-600">銀行振込の場合、振込手数料はお客様のご負担となります。</td>
              </tr>
              <tr className="border-b border-slate-100">
                <th className="py-4 px-4 font-bold text-slate-800 bg-slate-50">支払方法</th>
                <td className="py-4 px-4 text-slate-600">銀行振込、クレジットカード決済</td>
              </tr>
              <tr className="border-b border-slate-100">
                <th className="py-4 px-4 font-bold text-slate-800 bg-slate-50">支払時期</th>
                <td className="py-4 px-4 text-slate-600">ご依頼内容確定後、当方が指定する期日までにお支払いください。</td>
              </tr>
              <tr className="border-b border-slate-100">
                <th className="py-4 px-4 font-bold text-slate-800 bg-slate-50">引き渡し時期</th>
                <td className="py-4 px-4 text-slate-600">制作完了後、音源データを納品いたします。</td>
              </tr>
              <tr>
                <th className="py-4 px-4 font-bold text-slate-800 bg-slate-50 rounded-bl-lg">返品・キャンセルについて</th>
                <td className="py-4 px-4 text-slate-600">サービスの性質上、制作開始後のキャンセルおよび返金は原則としてお受けできません。</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
