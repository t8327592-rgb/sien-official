import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CallToActionProps {
  title?: string;
  description?: string;
  buttonText?: string;
  href?: string;
}

export function CallToAction({
  title = "あなたの歌声を、最高の形に仕上げます。",
  description = "「依頼が初めてで不安」「どのプランがいいかわからない」という方も、まずはお気軽にご相談ください。",
  buttonText = "無料で依頼・相談する",
  href = "/order"
}: CallToActionProps) {
  return (
    <section className="py-24 bg-orange-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-orange-700 to-amber-500"></div>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-10 blur-sm"></div>
      
      <div className="container px-4 mx-auto text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 whitespace-pre-wrap">
          {title}
        </h2>
        <p className="text-orange-50 mb-10 max-w-2xl mx-auto text-lg whitespace-pre-wrap">
          {description}
        </p>
        <Button asChild variant="outline" className="rounded-full h-16 text-lg font-bold shadow-2xl bg-white text-orange-600 hover:bg-orange-50 border-0 hover:scale-105 transition-transform">
          <Link href={href} className="flex items-center justify-center px-12 whitespace-nowrap">
            {buttonText} <ArrowRight className="w-5 h-5 ml-2 shrink-0" />
          </Link>
        </Button>
        <p className="text-orange-100 text-sm mt-6 font-medium">
          ※ご依頼前に「ご依頼に関する留意事項」をご確認ください。
        </p>
      </div>
    </section>
  );
}
