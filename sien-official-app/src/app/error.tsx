"use client";
import Link from "next/link";
export default function PageError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <section className="mx-auto max-w-2xl px-4 py-20" role="alert"><h1 className="mb-6 text-2xl font-bold">ページを読み込めませんでした</h1><p className="mb-6">一時的に情報を取得できません。時間をおいて再度お試しください。フォームの送信結果が不明な場合は、入力した内容のまま再送すると重複受付を防げます。</p><button type="button" onClick={retry} className="mr-6 rounded-lg bg-orange-600 px-5 py-3 font-bold text-slate-900">再読み込みする</button><Link href="/" className="text-orange-800 underline">トップページへ</Link></section>;
}
