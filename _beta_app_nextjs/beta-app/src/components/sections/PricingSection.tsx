"use client";

import { motion } from "framer-motion";
import { CreditCard, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";

type Plan = {
  id: string;
  title: string;
  price: string;
  description: string;
  period: string | null;
  revisions: string | null;
  isPopular: boolean;
};

type PricingProps = {
  plans: Plan[];
};

export default function PricingSection({ plans }: PricingProps) {
  const options = [
    { name: "エンコード（動画書き出し）", price: "1,000" },
    { name: "カットアップ（10秒あたり）", price: "2,000" },
    { name: "ボーカルガイド作成", price: "3,000" },
    { name: "音源差し替え（1箇所〜）", price: "1,000" },
    { name: "ライブ用音源制作", price: "1,000" },
    { name: "アカペラ音源納品", price: "0" }
  ];

  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-background">
      <div className="container mx-auto px-6 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 font-black text-sm mb-4">
            <CreditCard size={18} />
            PRICING
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-800 mb-6">基本料金</h2>
          <p className="text-gray-600 font-bold text-lg max-w-2xl mx-auto">
            わかりやすい料金体系で、安心してお任せいただけます。
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => {
            // 色のパターンを動的に割り当て
            const colors = [
              { color: "from-blue-400 to-cyan-400", bgLight: "bg-blue-50", buttonText: "text-blue-500", buttonHover: "hover:bg-blue-500" },
              { color: "from-yellow-400 to-orange-400", bgLight: "bg-yellow-50", buttonText: "text-orange-500", buttonHover: "hover:bg-orange-500" },
              { color: "from-amber-400 to-orange-500", bgLight: "bg-orange-50", buttonText: "text-amber-500", buttonHover: "hover:bg-amber-500" },
            ];
            const style = colors[index % colors.length];

            return (
              <div 
                key={plan.id}
                className={`relative group bg-white rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-2 border-2 ${
                  plan.isPopular ? "border-orange-400 shadow-xl shadow-orange-100" : "border-gray-100"
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 rounded-full text-xs font-black tracking-wider shadow-lg">
                    MOST POPULAR
                  </div>
                )}
                
                <div className={`w-16 h-16 rounded-2xl ${style.bgLight} flex items-center justify-center mb-6`}>
                  <CreditCard className={style.buttonText} size={28} />
                </div>
                
                <h3 className="text-2xl font-black text-gray-800 mb-2">{plan.title}</h3>
                <p className="text-gray-500 font-medium text-sm mb-6 h-10">{plan.description}</p>
                
                <div className="mb-8">
                  <span className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600">
                    ¥{plan.price}
                  </span>
                  <span className="text-gray-400 font-bold ml-1">/ 曲</span>
                </div>

                <Link
                  href="/pricing"
                  className={`block w-full text-center py-4 rounded-xl font-bold transition-all ${
                    plan.isPopular 
                      ? "bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/20" 
                      : `bg-gray-50 ${style.buttonText} hover:text-white ${style.buttonHover}`
                  }`}
                >
                  詳細を見る
                </Link>
              </div>
            );
          })}
        </div>

        {/* プラン比較表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white rounded-3xl p-6 md:p-8 border-2 border-gray-100 shadow-lg overflow-x-auto mb-12"
        >
          <h4 className="font-black text-gray-800 mb-6 text-center md:text-left text-lg">プラン比較表</h4>
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr>
                <th className="p-4 border-b-2 border-gray-100 text-gray-500 font-bold w-1/4">項目</th>
                <th className="p-4 border-b-2 border-gray-100 text-gray-800 font-black w-1/4">ショート動画</th>
                <th className="p-4 border-b-2 border-gray-100 text-gray-800 font-black w-1/4">ワンコーラス</th>
                <th className="p-4 border-b-2 border-orange-200 text-orange-600 font-black w-1/4 bg-orange-50/50 rounded-t-xl">スタンダード (フル)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-4 border-b border-gray-100 font-bold text-gray-700">尺（長さ）</td>
                <td className="p-4 border-b border-gray-100 font-medium text-gray-600">1分以内</td>
                <td className="p-4 border-b border-gray-100 font-medium text-gray-600">1コーラス</td>
                <td className="p-4 border-b border-orange-100 font-black text-orange-700 bg-orange-50/50">フルコーラス</td>
              </tr>
              <tr>
                <td className="p-4 border-b border-gray-100 font-bold text-gray-700">ピッチ・リズム補正</td>
                <td className="p-4 border-b border-gray-100 text-orange-500 font-black text-xl">〇</td>
                <td className="p-4 border-b border-gray-100 text-orange-500 font-black text-xl">〇</td>
                <td className="p-4 border-b border-orange-100 text-orange-500 font-black text-xl bg-orange-50/50">〇</td>
              </tr>
              <tr>
                <td className="p-4 border-b border-gray-100 font-bold text-gray-700">ハモリ生成</td>
                <td className="p-4 border-b border-gray-100 text-gray-400 font-black">△ (要相談)</td>
                <td className="p-4 border-b border-gray-100 text-orange-500 font-black text-xl">〇</td>
                <td className="p-4 border-b border-orange-100 text-orange-500 font-black text-xl bg-orange-50/50">〇</td>
              </tr>
              <tr>
                <td className="p-4 border-b border-gray-100 font-bold text-gray-700">マスタリング</td>
                <td className="p-4 border-b border-gray-100 text-orange-500 font-black text-xl">〇</td>
                <td className="p-4 border-b border-gray-100 text-orange-500 font-black text-xl">〇</td>
                <td className="p-4 border-b border-orange-100 text-orange-500 font-black text-xl bg-orange-50/50">〇</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-gray-700">修正対応</td>
                <td className="p-4 font-medium text-gray-600">2回まで</td>
                <td className="p-4 font-medium text-gray-600">2回まで</td>
                <td className="p-4 font-black text-orange-700 bg-orange-50/50 rounded-b-xl">無制限</td>
              </tr>
            </tbody>
          </table>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-3xl p-6 md:p-8 border-2 border-gray-100 shadow-lg mb-12"
        >
          <h4 className="font-black text-gray-800 mb-6 flex items-center gap-2">
            <Plus className="text-orange-500" />
            主なオプション
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="font-bold text-gray-700">{opt.name}</span>
                <span className="font-black text-orange-500">+¥{opt.price}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/pricing" className="inline-flex items-center gap-2 text-orange-500 font-black hover:text-orange-600 transition-colors bg-orange-50 px-6 py-3 rounded-full">
            より詳しい料金表を見る <ChevronRight size={20} />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
