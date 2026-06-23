"use client";

import { motion } from "framer-motion";
import { FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 200, damping: 20 },
    },
  };

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply blur-3xl opacity-50 -translate-y-1/2 -translate-x-1/3 -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply blur-3xl opacity-50 translate-y-1/3 translate-x-1/3 -z-10" />

      <div className="container mx-auto px-6 pt-12 md:pt-24 max-w-4xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-pink-100 text-pink-500 mb-6">
              <FileText size={40} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-6 tracking-tight">
              利用規約
            </h1>
            <p className="text-lg text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed">
              本利用規約は、当スタジオが提供する音響制作サービスに関しての契約条件を定めたものです。ご依頼の際は、下記内容にご同意いただいたものとみなします。
            </p>
          </motion.div>

          {/* Terms Content */}
          <motion.div variants={itemVariants} className="bg-white rounded-[3rem] p-8 md:p-14 shadow-xl shadow-gray-200/50 border-2 border-gray-100">
            <div className="space-y-12 text-gray-700">

              <section>
                <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-orange-500" size={24} />
                  1. お支払いについて
                </h3>
                <ul className="list-disc pl-6 space-y-2 marker:text-gray-300 leading-relaxed font-medium">
                  <li>本サービスはすべて前払い制となっております。ご入金確認後、制作に着手いたします。</li>
                  <li>お支払い方法は「クレジットカード決済」または「銀行振込」からお選びいただけます。</li>
                  <li>コラボや合唱企画などでのお支払い分割をご希望の場合は、銀行振込にて対応可能です。クレジットカード決済では分割対応ができかねますので、代表者様による一括払いをお願いいたします。</li>
                  <li>法人様からのご依頼は、原則として銀行振込で承ります。支払時期などは事前にご相談ください。</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-pink-500" size={24} />
                  2. 納期について
                </h3>
                <ul className="list-disc pl-6 space-y-2 marker:text-gray-300 leading-relaxed font-medium">
                  <li>納期はお見積もりの際に提示いたしますが、案件の混雑状況により変動する場合がございます。</li>
                  <li>納期とは「初回納品日（仮完成）」を指し、そこからの修正対応期間は含まれません。</li>
                  <li>明確な公開日やスケジュールがある場合（例：記念日投稿・イベント公開）は必ず事前にお伝えください。</li>
                  <li>オリジナル楽曲など制作工程が多い案件は、通常より納期を長くいただくことがございます。</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-purple-500" size={24} />
                  3. 素材・音源データのご提出について
                </h3>
                <ul className="list-disc pl-6 space-y-2 marker:text-gray-300 leading-relaxed font-medium">
                  <li>ご入金後、録音素材・ご希望の参考資料などは【3か月以内】にご提出ください。期限を過ぎた場合は、制作再開時に延滞料金が発生する可能性があります。</li>
                  <li>お持ち込みいただいた音源・歌詞・イラスト・動画等の素材は、著作権または利用許諾を得ているものとして取り扱います。第三者の著作権を侵害する素材によるトラブルの責任は負いかねます。</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-orange-500" size={24} />
                  4. 修正対応について
                </h3>
                <ul className="list-disc pl-6 space-y-2 marker:text-gray-300 leading-relaxed font-medium">
                  <li>初回納品後、<strong className="text-pink-500">5回まで無料</strong>で修正を承ります。それ以降の修正は内容により追加料金を頂戴いたします。</li>
                  <li>ご依頼時と大きく異なる方針変更（例：キー変更、歌詞の差し替え、テンポの変更など）は<strong className="text-orange-500">「再制作扱い」</strong>となり、別途料金が発生する場合があります。</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-pink-500" size={24} />
                  5. 納品ファイル形式・保管について
                </h3>
                <ul className="list-disc pl-6 space-y-2 marker:text-gray-300 leading-relaxed font-medium">
                  <li>納品ファイルの形式は基本的に <strong>WAV（24bit/48kHz）</strong> となります。別形式をご希望の場合は事前にお申し付けください。</li>
                  <li>完成データは、納品後【1年】を目安に削除させていただきます。再ダウンロードをご希望の場合はお早めにご連絡ください。</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-purple-500" size={24} />
                  6. 連絡手段・対応について
                </h3>
                <ul className="list-disc pl-6 space-y-2 marker:text-gray-300 leading-relaxed font-medium">
                  <li>原則として24時間以内にご返信いたしますが、状況によりお時間をいただく場合もございます。</li>
                  <li>SNS（X・Twitterなど）でのやり取りをご希望の場合は、DM解放やフォロー設定をあらかじめご確認ください。</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-orange-500" size={24} />
                  7. クレジット表記のお願い
                </h3>
                <p className="mb-2 leading-relaxed font-medium">完成した作品をSNSや動画投稿サイトにて公開される際は、下記のようにクレジット表記をお願いしております。</p>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 font-mono text-sm">
                  例：<br/>
                  - Mix：しえん（@sien_mc09）<br/>
                  - 作編曲：しえん（@sien_mc09）
                </div>
              </section>

              <section>
                <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-pink-500" size={24} />
                  8. 使用許諾・権利について
                </h3>
                <ul className="list-disc pl-6 space-y-2 marker:text-gray-300 leading-relaxed font-medium">
                  <li>MIX音源は編集・再現物であり、著作権には該当しない場合もございますが、無断での再販売・再配布・譲渡などはご遠慮ください。</li>
                  <li>オリジナル楽曲の作編曲に関しては、原則として制作者に著作権が帰属します。商用利用・著作権譲渡をご希望の場合は、別途契約が必要ですのでご相談ください。<br/>
                    <span className="text-sm text-gray-500 mt-1 inline-block">※YouTube・SNS投稿、歌ってみたなどの非営利公開は商用利用には含まれません。</span>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-purple-500" size={24} />
                  9. 納品後の使用範囲について
                </h3>
                <ul className="list-disc pl-6 space-y-2 marker:text-gray-300 leading-relaxed font-medium">
                  <li>オリジナル楽曲制作物を<strong>二次利用（別動画・商用アプリへの使用など）</strong>される場合は、事前にご相談ください。</li>
                  <li><strong>再配布・転売・NFT等への転用は禁止</strong>とさせていただきます。</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-orange-500" size={24} />
                  10. 実績公開について
                </h3>
                <ul className="list-disc pl-6 space-y-2 marker:text-gray-300 leading-relaxed font-medium">
                  <li>ご依頼いただいた作品を、ポートフォリオやSNSにて<strong>実績として掲載</strong>させていただく場合がございます。</li>
                  <li>実績公開NGの場合は、あらかじめその旨をお知らせください。</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-pink-500" size={24} />
                  11. キャンセル・返金ポリシー
                </h3>
                <ul className="list-disc pl-6 space-y-2 marker:text-gray-300 leading-relaxed font-medium">
                  <li>ご入金後のキャンセル・返金は原則としてお受けしておりません。進捗状況等により、柔軟に対応できるケースもございますのでご相談ください。</li>
                  <li>当スタジオの都合により作業継続が不可能となった場合、全額返金にて対応させていただきます。ただし、それ以上の責任・賠償等は負いかねます。</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-purple-500" size={24} />
                  12. ご連絡が途絶えた場合の対応
                </h3>
                <ul className="list-disc pl-6 space-y-2 marker:text-gray-300 leading-relaxed font-medium">
                  <li>ご入金後6か月以上ご連絡がない場合、制作完了とみなして「納品完了」の処理をさせていただく場合がございます。<br/>
                    <span className="text-sm text-gray-500 mt-1 inline-block">※納品後のデータ再送は可能な限り対応いたしますが、データの保管期限は保証いたしかねます。</span>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-orange-500" size={24} />
                  13. 改定について
                </h3>
                <ul className="list-disc pl-6 space-y-2 marker:text-gray-300 leading-relaxed font-medium">
                  <li>本利用規約は予告なく内容を変更する場合がございます。常に最新の内容をご確認ください。</li>
                  <li>改定による損害・トラブルについては責任を負いかねますので、あらかじめご了承ください。</li>
                </ul>
              </section>

            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-16 text-center">
            <Link 
              href="/order" 
              className="inline-flex items-center gap-2 px-10 py-5 rounded-full bg-gray-900 text-white font-bold text-lg hover:bg-gray-800 transition-transform transform hover:scale-105 shadow-xl shadow-gray-900/20"
            >
              同意してご依頼フォームへ
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
