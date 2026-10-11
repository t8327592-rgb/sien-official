import { displayText } from "@/lib/public-format";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPublicSettings } from "@/lib/data/public-settings";

interface CallToActionProps {
  title?: string;
  description?: string;
  buttonText?: string;
  href?: string;
}

export async function CallToAction({
  title,
  description,
  buttonText = "無料で相談する",
  href = "/order?intent=CONSULTATION"
}: CallToActionProps) {
  const settings = await getPublicSettings();
  title = settings.ctaTitle || title || "あなたの歌声を、最高の形に仕上げます。";
  description = settings.ctaDescription || description || "「依頼が初めてで不安」「どのプランがいいかわからない」という方も、まずはお気軽にご相談ください。";
  return (
    <section className="relative overflow-hidden bg-orange-600 py-12 md:py-24">
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-tr from-orange-700 to-amber-500" />
      <div className="container px-4 mx-auto text-center relative z-10">
        <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-6 whitespace-pre-wrap">
          {displayText(title)}
        </h2>
        <p className="text-white mb-6 md:mb-10 max-w-2xl mx-auto text-base md:text-lg whitespace-pre-wrap">
          {displayText(description)}
        </p>
        <Button asChild variant="outline" className="w-full sm:w-auto max-w-full rounded-full min-h-12 md:min-h-16 h-auto py-3 text-base md:text-lg font-bold bg-white text-orange-700 hover:bg-orange-50 border-0 shadow-2xl hover:scale-105 transition-transform">
          <Link href={href} className="flex items-center justify-center px-5 sm:px-12 whitespace-normal">
            {buttonText} <ArrowRight className="w-5 h-5 ml-2 shrink-0" />
          </Link>
        </Button>
        <p className="text-white text-sm mt-6 font-medium">
          ご依頼前に<Link href="/policy/guidelines" className="underline underline-offset-4">留意事項</Link>をご確認ください。
        </p>
      </div>
    </section>
  );
}
