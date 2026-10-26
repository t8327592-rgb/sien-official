import { pageMetadata } from "@/lib/page-metadata";
import Image from "next/image";
import { Headphones, Music, Mic2 } from "lucide-react";
import { getProfile } from "@/lib/data/cms";
import { getPublicSettings } from "@/lib/data/public-settings";
import type { ReactNode } from "react";

function EquipmentCard({ title, icon, items, className }: { title: string; icon: ReactNode; items: string[]; className: string }) {
  return <div className={`min-w-0 ${className}`}>
    <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-orange-400">{icon}{title}</h4>
    <div className="rounded-xl border border-orange-100 bg-white/70 px-5">
      <ul className="divide-y divide-orange-100/80">
        {items.map(item => <li key={item} className="break-words py-3 text-base font-medium leading-relaxed text-slate-800">{item}</li>)}
      </ul>
    </div>
  </div>;
}

export const metadata = pageMetadata("/profile", {title: "Profile | Sien-Official", description: "しえんのプロフィールと使用機材・得意ジャンルについて"});

export default async function ProfilePage() {
  const [profile, settings] = await Promise.all([getProfile(), getPublicSettings()]);
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="pt-10 md:pt-32 pb-10 md:pb-20 bg-white border-b border-slate-100">
        <div className="container px-4 mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center justify-center space-x-2 mb-6">
            <div className="w-12 h-0.5 bg-orange-600"></div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Profile</h1>
            <div className="w-12 h-0.5 bg-orange-600"></div>
          </div>
          <p className="text-slate-500 text-lg">エンジニア・クリエイターについて</p>
        </div>
      </section>

      {/* Main Profile Section */}
      <section className="py-10 md:py-20">
        <div className="container px-4 mx-auto max-w-5xl">
          <div className="bg-white rounded-3xl p-5 md:p-12 shadow-sm border border-slate-100 mb-6 md:mb-12">
            <div className="grid md:grid-cols-[300px_1fr] gap-12 items-start">

              {/* Photo & Basic Info */}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-48 h-48 md:w-56 md:h-56 mb-6">
                  <div className="absolute inset-0 bg-orange-100 rounded-full blur-2xl scale-110 opacity-50"></div>
                  <Image
                    src={profile?.imageUrl || "/profile.jpg"}
                    alt={`${profile?.name || "しえん"}のプロフィール写真`}
                    fill
                    sizes="(max-width: 768px) 192px, 224px"
                    className="relative rounded-full object-cover border-4 border-white shadow-xl"
                    priority
                  />
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">{profile?.name || "しえん"}</h2>
                <p className="text-orange-700 font-bold tracking-wider mb-2">{profile?.title || "MIX Engineer / Creator"}</p>
                {profile?.bioShort && <p className="mb-4 whitespace-pre-wrap text-slate-700">{profile.bioShort}</p>}
                <div className="inline-block bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-100 mb-5">
                  {profile?.achievements || "800件以上の制作実績"}
                </div>
                <div className="flex gap-4 justify-center">
                  <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#1DA1F2] hover:text-slate-900 transition-colors" title="X (Twitter)">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.96H5.078z" />
                    </svg>
                  </a>
                  <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#FF0000] hover:text-slate-900 transition-colors" title="YouTube">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Biography */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">ご挨拶</h3>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {profile?.bioLong || <>
                    <span>
                      これまでにボーカルミックス・マスタリングやオリジナル楽曲制作など、数多くの作品を担当してまいりました。
                      歌い手様一人ひとりの声質や個性を最大限に活かし、オケと馴染む「迫力と臨場感のあるサウンド」を得意としています。
                    </span>
                    <br /><br />
                    <span>
                      スマホ録音（GarageBand等）からスタジオ録音まで、録音環境に応じた最適な処理を行い、作品としての完成度を高めるお手伝いをしています。
                    </span>
                    </>}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">大切にしていること</h3>
                  <p className="text-slate-600 leading-relaxed space-y-4">
                    <span>
                      「ただ綺麗に整えるだけではなく、その人らしさや感情が伝わる作品づくり」を大切にしています。
                    </span>
                    <br /><br />
                    <span>
                      「初めてのMIX依頼で不安」「どう伝えればいいかわからない」という方も、ぜひお気軽にご相談ください。<br />
                      専門用語を使わず、一つひとつ丁寧なサポートを心がけております。
                    </span>
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">得意ジャンル</h3>
                  <div className="flex flex-wrap gap-2">
                    {["ボカロ系", "ロック", "J-POP", "アニソン", "EDM"].map(genre => (
                      <span key={genre} className="bg-orange-50 text-orange-700 px-4 py-2 rounded-lg text-sm font-bold border border-orange-100">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Equipment Section */}
          <div className="bg-orange-50 border border-orange-100 rounded-3xl p-5 md:p-12 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 rounded-full blur-[100px] opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500 rounded-full blur-[100px] opacity-20"></div>

            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-slate-900 mb-10 flex items-center gap-3">
                <div className="w-12 h-12 shrink-0 rounded-full bg-white flex items-center justify-center border border-orange-200">
                  <Headphones className="w-6 h-6 text-orange-400" />
                </div>
                <span className="min-w-0"><span className="inline-block">主要使用機材・</span><span className="inline-block">ソフトウェア</span></span>
              </h3>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start">
                {/* Column 1 */}
                <div className="contents md:block md:min-w-0 md:space-y-8">
                  <EquipmentCard className="order-1" title="ハードウェア＆DAW" icon={<Mic2 className="h-4 w-4 shrink-0" />} items={[
                    "Studio One Pro",
                    "MOTU M2",
                    "YAMAHA MSP3",
                    "AKG K702",
                  ]} />
                  <EquipmentCard className="order-3" title="ミックス／マスタリング" icon={<Headphones className="h-4 w-4 shrink-0" />} items={[
                    "Ozone 12",
                    "RX 11",
                    "soothe3",
                  ]} />
                </div>

                {/* Column 2 */}
                <div className="contents md:block md:min-w-0 md:space-y-8">
                  <EquipmentCard className="order-2" title="ボーカルエディット" icon={<Music className="h-4 w-4 shrink-0" />} items={[
                    "Melodyne",
                    "Auto-Tune Pro",
                    "VocAlign 6 Pro",
                  ]} />
                  <EquipmentCard className="order-4" title="ソフト音源・シンセサイザー" icon={<Music className="h-4 w-4 shrink-0" />} items={[
                    "Kontakt 8",
                    "Serum 2",
                    "Synthesizer V Studio 2",
                  ]} />
                </div>
              </div>
              <p className="mt-8 text-sm leading-relaxed text-slate-600">楽曲やご依頼内容に合わせて、使用する機材・ソフトウェアを選定しています。</p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
