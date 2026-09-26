import Link from "next/link";

export const metadata = { title: "サマーセール受付終了 | Sien-Official" };

export default function SummerSaleOrderPage() {
  return <section className="mx-auto max-w-2xl px-4 py-24 text-center"><h1 className="text-2xl font-bold">サマーセールの受付は終了しました</h1><p className="mt-4">現在のプラン・受付状況は通常のご依頼フォームをご確認ください。</p><Link className="mt-6 inline-block underline" href="/order">ご依頼フォームへ</Link></section>;
}
