import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home } from "lucide-react";

export const metadata = {
  title: "Page Not Found | Sien-Official",
};

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 items-center justify-center p-4">
      <div className="bg-white p-10 md:p-16 rounded-[2rem] shadow-sm border border-slate-100 text-center max-w-2xl w-full">
        <div className="text-orange-500 font-extrabold text-7xl md:text-9xl tracking-tighter mb-4 opacity-20">
          404
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
          お探しのページが見つかりません
        </h1>
        <p className="text-slate-600 mb-10 leading-relaxed">
          アクセスしようとしたページは削除されたか、URLが変更された可能性があります。<br className="hidden md:block" />
          引き続きSien-Officialのコンテンツをお楽しみください。
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="rounded-full h-14 px-8 font-bold bg-orange-600 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-500 hover:-translate-y-0.5 transition-all">
            <Link href="/" className="flex items-center justify-center">
              <Home className="w-5 h-5 mr-2" /> トップページへ戻る
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full h-14 px-8 font-bold text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-orange-600 transition-colors">
            <Link href="/order" className="flex items-center justify-center">
              ご依頼・お見積りはこちら <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
