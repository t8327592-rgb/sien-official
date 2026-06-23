export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AiReplyPanel } from "@/components/admin/AiReplyPanel";
import { AiPostGeneratorPanel } from "@/components/admin/AiPostGeneratorPanel";

import { OrderActions } from "@/components/admin/OrderActions";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 依頼データを取得
  const order = await prisma.order.findUnique({
    where: { id },
  });

  if (!order) {
    notFound();
  }

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
          <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold border-b pb-2 mb-4">基本情報</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 font-medium">お名前</p>
                  <p className="font-semibold text-lg">{order.clientName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Twitter ID</p>
                  <p className="font-semibold">{order.twitterId || "未設定"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">メールアドレス</p>
                  <p className="font-semibold">{order.clientEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">希望連絡手段</p>
                  <p className="font-semibold">{order.contactMethod || "未設定"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">活動用途</p>
                  <p className="font-semibold text-orange-600 bg-orange-50 inline-block px-2 py-1 rounded">{order.activityPurpose || "未指定"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-500 font-medium">顧客ステータス</p>
                  <p className="font-semibold text-orange-600 bg-orange-50 inline-block px-2 py-1 rounded">
                    {order.isRepeater ? "リピーター（依頼経験あり）" : "新規のお客様"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold border-b pb-2 mb-4">ご依頼内容・楽曲情報</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 font-medium">サービス種別</p>
                  <p className="font-semibold">{order.serviceType === "mix" ? "ミックス・マスタリング" : "オリジナル楽曲制作"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">選択プラン</p>
                  <p className="font-semibold">{order.planId || "指定なし"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">曲名</p>
                  <p className="font-semibold">{order.songTitle || "未設定"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">歌唱キー</p>
                  <p className="font-semibold">{order.vocalKey || "未設定"}</p>
                </div>
                {order.serviceType === "ORIGINAL" && (
                  <>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">希望ジャンル</p>
                      <p className="font-semibold">{order.genre || "未設定"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">作詞の有無</p>
                      <p className="font-semibold">{order.lyricsStatus || "未設定"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">仮歌の有無</p>
                      <p className="font-semibold">{order.vocalGuideStatus || "未設定"}</p>
                    </div>
                  </>
                )}
                <div className="col-span-2">
                  <p className="text-sm text-slate-500 font-medium">オプション</p>
                  <p className="font-semibold">{order.options || "なし"}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold border-b pb-2 mb-4">素材・リファレンス</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-sm text-slate-500 font-medium">素材提出URL</p>
                  {order.materialsUrl ? (
                    <a href={order.materialsUrl} target="_blank" rel="noreferrer" className="text-orange-600 hover:underline break-all">{order.materialsUrl}</a>
                  ) : (
                    <p className="font-semibold text-slate-400">未提出</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">参考曲URL</p>
                  {order.referenceUrl ? (
                    <a href={order.referenceUrl} target="_blank" rel="noreferrer" className="text-orange-600 hover:underline break-all">{order.referenceUrl}</a>
                  ) : (
                    <p className="font-semibold text-slate-400">なし</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">リファレンス再現度</p>
                  <p className="font-semibold">
                    {order.referenceFidelity === "1" && "1. お任せ"}
                    {order.referenceFidelity === "2" && "2. 参考にしつつお任せ"}
                    {order.referenceFidelity === "3" && "3. 完全準拠"}
                    {!order.referenceFidelity && "未設定"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold border-b pb-2 mb-4">納期・お支払い・ご要望</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 font-medium">希望納期</p>
                  <p className="font-semibold">{order.deadline || "指定なし"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">お支払い方法</p>
                  <p className="font-semibold">{order.paymentMethod || "未設定"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-500 font-medium mb-2">ご要望・メッセージ</p>
                  <div className="bg-slate-50 p-4 rounded-lg border text-sm whitespace-pre-wrap leading-relaxed">
                    {order.message || "メッセージはありません"}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <p className="text-xs text-slate-400">受付日時: {new Date(order.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* 右側: AIアシストパネル */}
        <div className="space-y-6">
          <AiReplyPanel order={order} />
          <AiPostGeneratorPanel order={order} />
        </div>
      </div>
    </div>
  );
}
