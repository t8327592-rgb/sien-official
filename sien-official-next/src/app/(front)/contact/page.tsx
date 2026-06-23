import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'お問い合わせ | SIEN.OFFICIAL',
  description: 'Sien-OfficialへのボーカルMIX・オリジナル楽曲制作のご依頼・お問い合わせはこちらから。',
};

export default function ContactPage() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-24 pt-32 relative">
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[#0071E3]/5 blur-[150px] rounded-full pointer-events-none"></div>
      
      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#1D1D1F] font-heading tracking-widest">
            <span className="text-[#0071E3]">CONTACT</span> / お問い合わせ
          </h1>
          <p className="text-gray-500 font-medium max-w-2xl mx-auto">
            ご依頼、お見積もり、その他ご不明な点がございましたらお気軽にお問い合わせください。
          </p>
        </div>

        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
          {/* Accent border top */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0071E3] to-[#47A1FF]"></div>
          
          <form className="space-y-8 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-[#1D1D1F] mb-2">お名前 <span className="text-red-500">*</span></label>
                <input type="text" className="w-full bg-white border border-gray-200 rounded-xl p-4 text-[#1D1D1F] focus:outline-none focus:border-[#0071E3] focus:ring-1 focus:ring-[#0071E3] transition-colors" placeholder="山田 太郎" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1D1D1F] mb-2">活動名（あれば）</label>
                <input type="text" className="w-full bg-white border border-gray-200 rounded-xl p-4 text-[#1D1D1F] focus:outline-none focus:border-[#0071E3] focus:ring-1 focus:ring-[#0071E3] transition-colors" placeholder="Sien" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1D1D1F] mb-2">メールアドレス <span className="text-red-500">*</span></label>
              <input type="email" className="w-full bg-white border border-gray-200 rounded-xl p-4 text-[#1D1D1F] focus:outline-none focus:border-[#0071E3] focus:ring-1 focus:ring-[#0071E3] transition-colors" placeholder="info@example.com" required />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1D1D1F] mb-2">ご相談の種類 <span className="text-red-500">*</span></label>
              <select className="w-full bg-white border border-gray-200 rounded-xl p-4 text-[#1D1D1F] focus:outline-none focus:border-[#0071E3] focus:ring-1 focus:ring-[#0071E3] transition-colors appearance-none" required>
                <option value="">選択してください</option>
                <option value="mix">歌ってみたMIX依頼</option>
                <option value="original">オリジナル楽曲制作依頼</option>
                <option value="estimate">お見積りのご相談</option>
                <option value="other">その他のお問い合わせ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1D1D1F] mb-2">お問い合わせ内容 <span className="text-red-500">*</span></label>
              <textarea rows={6} className="w-full bg-white border border-gray-200 rounded-xl p-4 text-[#1D1D1F] focus:outline-none focus:border-[#0071E3] focus:ring-1 focus:ring-[#0071E3] transition-colors" placeholder="楽曲のイメージやご要望、音源のURLなどをご記入ください。" required></textarea>
            </div>

            <div className="text-center pt-4">
              <button type="button" className="bg-[#0071E3] text-white font-bold px-12 py-4 rounded-full shadow-[0_4px_20px_rgba(0,113,227,0.3)] hover:shadow-[0_8px_30px_rgba(0,113,227,0.4)] hover:-translate-y-1 transition-all text-lg w-full md:w-auto">
                送信する
              </button>
            </div>
            
            <p className="text-center text-xs text-gray-400 mt-4">
              ※ご返信まで2〜3営業日いただく場合がございます。
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
