import { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー | Sien-Official",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-20 px-4 mt-20 max-w-4xl">
      <h1 className="text-4xl font-bold mb-4 text-center text-slate-800">プライバシーポリシー</h1>
      <p className="text-center text-slate-500 mb-12">Privacy Policy</p>

      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100 prose prose-slate max-w-none">
        <p className="lead text-slate-600 mb-10">
          Sien（以下「当サイト」）は、お客様の個人情報の重要性を認識し、個人情報の適切な保護と管理を推進いたします。
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">1. 収集する情報</h2>
            <p className="text-slate-600 mb-2">当サイトでは、ご依頼フォームやお問い合わせフォームの利用時に、以下の情報を収集する場合があります。</p>
            <ul className="list-disc pl-5 text-slate-600 space-y-1">
              <li>お名前</li>
              <li>メールアドレス</li>
              <li>ご依頼内容の詳細</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">2. 利用目的</h2>
            <p className="text-slate-600 mb-2">収集した個人情報は、以下の目的で利用いたします。</p>
            <ul className="list-disc pl-5 text-slate-600 space-y-1">
              <li>サービス（ミックス／マスタリング、楽曲制作等）のご依頼受付・回答</li>
              <li>ご連絡および納品等の業務遂行</li>
              <li>お問い合わせへの対応</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">3. 第三者への提供</h2>
            <p className="text-slate-600">
              原則として、お客様の同意なく第三者に個人情報を提供することはありません。ただし、法令に基づく開示が必要な場合はこの限りではありません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">4. 安全管理措置</h2>
            <p className="text-slate-600">
              個人情報の漏洩、紛失、不正アクセス等を防止するため、適切な安全管理措置を講じます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">5. クッキー等の利用</h2>
            <p className="text-slate-600">
              当サイトでは、サービス向上のためにクッキーやアクセス解析ツールを使用することがあります。これらは個人を特定できる情報とは切り離して管理されます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">6. 開示・訂正・削除の請求</h2>
            <p className="text-slate-600">
              ご本人からの開示、訂正、削除等のご要望があった場合には、合理的な範囲で対応いたします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">7. お問い合わせ</h2>
            <p className="text-slate-600 mb-2">個人情報に関するお問い合わせは、以下のメールアドレスまでお願いいたします。</p>
            <p className="text-slate-800 font-medium">px.sien@gmail.com</p>
          </section>

          <div className="mt-12 pt-8 border-t text-slate-500 text-sm text-right">
            <p>制定日：2026年1月</p>
            <p>最終改定日：2026年1月</p>
          </div>
        </div>
      </div>
    </div>
  );
}
