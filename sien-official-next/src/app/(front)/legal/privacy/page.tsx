import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'プライバシーポリシー | SIEN.OFFICIAL',
  description: 'SIEN.OFFICIALのプライバシーポリシーです。',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-24 pt-32 relative">
      <div className="container mx-auto px-6 max-w-3xl relative z-10">
        <div className="mb-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#1D1D1F]">
            プライバシーポリシー
          </h1>
          <p className="text-gray-500 font-medium">最終更新日：2026年6月1日</p>
        </div>

        <div className="glass-panel p-8 md:p-12 rounded-3xl space-y-8 text-gray-600 font-medium leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-[#1D1D1F] mb-4 border-l-4 border-l-[#0071E3] pl-3">1. 個人情報の収集について</h2>
            <p>
              SIEN.OFFICIAL（以下「当サイト」）は、お問い合わせやご依頼の際、以下の個人情報をご提供いただく場合があります。
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>お名前、活動名</li>
              <li>メールアドレス</li>
              <li>ご依頼内容に関する情報</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1D1D1F] mb-4 border-l-4 border-l-[#0071E3] pl-3">2. 個人情報の利用目的</h2>
            <p>
              ご提供いただいた個人情報は、以下の目的のみに使用いたします。
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>ご依頼の受付・お見積りの連絡</li>
              <li>制作物の納品およびそれに伴うやり取り</li>
              <li>お問い合わせに対する回答</li>
              <li>サービス向上のための参考データ</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1D1D1F] mb-4 border-l-4 border-l-[#0071E3] pl-3">3. 個人情報の第三者への提供</h2>
            <p>
              当サイトは、法令に基づく場合を除き、お客様の同意なく第三者に個人情報を提供することはありません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1D1D1F] mb-4 border-l-4 border-l-[#0071E3] pl-3">4. 個人情報の管理</h2>
            <p>
              お客様からお預かりした個人情報は、紛失・漏洩などを防ぐため、厳重に管理いたします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1D1D1F] mb-4 border-l-4 border-l-[#0071E3] pl-3">5. お問い合わせ窓口</h2>
            <p>
              本ポリシーに関するお問い合わせは、<Link href="/contact" className="text-[#0071E3] hover:underline">お問い合わせフォーム</Link>よりお願いいたします。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
