export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AiReplyPanel } from "@/components/admin/AiReplyPanel";
import { AiPostGeneratorPanel } from "@/components/admin/AiPostGeneratorPanel";
import { FinancePanel } from "@/components/admin/FinancePanel";
import { DeadlinePanel } from "@/components/admin/DeadlinePanel";

import { OrderActions } from "@/components/admin/OrderActions";

const PLAN_LABELS: Record<string, string> = {
  lite: "ライトプラン",
  std: "スタンダードプラン",
  pro: "プロプラン",
};

const PAYMENT_LABELS: Record<string, string> = {
  bank_transfer: "銀行振込",
  credit_card: "クレジットカード",
  paypay: "PayPay",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 依頼データを取得
  const order = await prisma.order.findUnique({
    where: { id },
  });

  if (!order) {
    notFound();
  }

  // プラン情報を取得して納期/修正回数を表示するための準備
  let planDetails = null;
  if (order.planId) {
    planDetails = await prisma.plan.findFirst({
      where: { id: order.planId }
    });
  }



  // 日付のフォーマット (YYYY/MM/DD HH:mm)
  const formattedDate = new Date(order.createdAt).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="text-muted-foreground hover:text-primary">
            ← 戻る
          </Link>
          <h1 className="text-3xl font-bold">依頼詳細</h1>
        </div>
        <div className="flex items-center gap-2">
          <OrderActions orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左側: 依頼内容の表示 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-white p-6 shadow-sm space-y-8">
            
            <section>
              <h2 className="text-xl font-bold border-b pb-2 mb-4 text-slate-800 flex items-center gap-2">
                <span className="text-orange-500">👤</span> 基本情報
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-slate-500 font-bold mb-1">お名前</p>
                  <p className="font-semibold text-lg text-slate-900">{order.clientName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold mb-1">メールアドレス</p>
                  <p className="font-medium text-slate-700 break-all">{order.clientEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold mb-1">X（Twitter）ID</p>
                  <p className="font-medium text-slate-700">{order.twitterId || "未設定"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold mb-1">希望連絡手段</p>
                  <p className="font-medium text-slate-700">{order.contactMethod || "未設定"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-slate-500 font-bold mb-1">顧客ステータス</p>
                  {order.isRepeater ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                      リピーター（依頼経験あり）
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      新規のお客様
                    </span>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold border-b pb-2 mb-4 text-slate-800 flex items-center gap-2">
                <span className="text-orange-500">🎵</span> ご依頼内容・楽曲情報
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-500 font-bold mb-1">サービス種別</p>
                  <p className="font-semibold text-slate-900">{order.serviceType === "mix" ? "ボーカルMIX" : "オリジナル楽曲制作"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold mb-1">選択プラン</p>
                  <div className="font-semibold text-slate-900">
                    {order.planId ? (planDetails?.name || PLAN_LABELS[order.planId] || order.planId) : "指定なし"}
                    {planDetails && (
                      <div className="text-sm font-normal text-slate-500 mt-1 flex gap-4">
                        <span>納期：{planDetails.period || "要相談"}</span>
                        <span>修正：{planDetails.revisions || "要相談"}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold mb-1">曲名</p>
                  <p className="font-medium text-slate-700">{order.songTitle || "未設定"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold mb-1">歌唱キー</p>
                  <p className="font-medium text-slate-700">{order.vocalKey || "未設定"}</p>
                </div>
                
                {order.serviceType === "ORIGINAL" && (
                  <>
                    <div>
                      <p className="text-xs text-slate-500 font-bold mb-1">希望ジャンル</p>
                      <p className="font-medium text-slate-700">{order.genre || "未設定"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold mb-1">作詞の有無</p>
                      <p className="font-medium text-slate-700">{order.lyricsStatus || "未設定"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold mb-1">仮歌の有無</p>
                      <p className="font-medium text-slate-700">{order.vocalGuideStatus || "未設定"}</p>
                    </div>
                  </>
                )}
                
                <div className="md:col-span-2">
                  <p className="text-xs text-slate-500 font-bold mb-1">オプション</p>
                  <p className="font-medium text-slate-700">{order.options || "なし"}</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold border-b pb-2 mb-4 text-slate-800 flex items-center gap-2">
                <span className="text-orange-500">📁</span> 素材・リファレンス
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <p className="text-xs text-slate-500 font-bold mb-1">素材提出URL</p>
                  {order.materialsUrl ? (
                    <a href={order.materialsUrl} target="_blank" rel="noreferrer" className="text-orange-600 hover:text-orange-700 font-medium underline underline-offset-4 break-all">{order.materialsUrl}</a>
                  ) : (
                    <p className="font-medium text-slate-400">未提出</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-slate-500 font-bold mb-1">参考曲URL</p>
                  {order.referenceUrl ? (
                    <a href={order.referenceUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-4 break-all">{order.referenceUrl}</a>
                  ) : (
                    <p className="font-medium text-slate-400">なし</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-slate-500 font-bold mb-1">リファレンス再現度</p>
                  <p className="font-medium text-slate-700">
                    {order.referenceFidelity === "1" && "1. お任せ"}
                    {order.referenceFidelity === "2" && "2. 参考にしつつお任せ"}
                    {order.referenceFidelity === "3" && "3. 完全準拠"}
                    {!order.referenceFidelity && "未設定"}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold border-b pb-2 mb-4 text-slate-800 flex items-center gap-2">
                <span className="text-orange-500">💬</span> 納期・お支払い・ご要望
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-500 font-bold mb-1">希望納期</p>
                  <p className="font-semibold text-slate-900">{order.deadline || "指定なし"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold mb-1">お支払い方法</p>
                  <p className="font-semibold text-slate-900">{order.paymentMethod ? (PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod) : "未設定"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-slate-500 font-bold mb-2">ご要望・メッセージ</p>
                  <div className="bg-slate-50 p-4 rounded-lg border text-sm whitespace-pre-wrap leading-relaxed text-slate-700">
                    {order.message || "メッセージはありません"}
                  </div>
                </div>
              </div>
            </section>

            <div className="pt-4 border-t text-right">
              <p className="text-sm font-medium text-slate-400">受付日時: {formattedDate}</p>
            </div>
          </div>
        </div>

        {/* 右側: 管理・AIアシストパネル */}
        <div className="space-y-6">
          <DeadlinePanel orderId={order.id} initialDeadline={order.deadline} clientName={order.clientName} songTitle={order.songTitle} />
          <FinancePanel orderId={order.id} initialPrice={order.price} />
          <AiReplyPanel order={order} />
          <AiPostGeneratorPanel order={order} />
        </div>
      </div>
    </div>
  );
}
