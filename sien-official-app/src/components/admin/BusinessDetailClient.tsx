"use client";
import type { BusinessRecord } from "@/lib/admin-types";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2, Building2, FileText, Clock, DollarSign, Copy } from "lucide-react";
import { toast } from "react-hot-toast";

type BusinessContact = BusinessRecord;

const STATUS_OPTIONS = [
  { value: "PENDING", label: "未対応" },
  { value: "ESTIMATING", label: "見積中" },
  { value: "WAITING_PAYMENT", label: "入金待ち" },
  { value: "WORKING", label: "作業中" },
  { value: "COMPLETED", label: "納品済" },
  { value: "CANCELED", label: "キャンセル" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "", label: "未設定" },
  { value: "未入金", label: "未入金" },
  { value: "入金済", label: "入金済" },
  { value: "後払い", label: "後払い" },
];

const INVOICE_STATUS_OPTIONS = [
  { value: "", label: "未設定" },
  { value: "未発行", label: "未発行" },
  { value: "発行済", label: "発行済" },
];

export default function BusinessDetailClient({ initialContact }: { initialContact: BusinessContact }) {
  const router = useRouter();
  const [formData, setFormData] = useState<BusinessContact>(initialContact);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDateForInput = (dateStr: string | Date | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  };

  const handleCopyText = (text: string | null) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("コピーしました");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "estimatedPrice" || name === "finalPrice") {
      setFormData((prev) => ({ ...prev, [name]: value === "" ? null : parseInt(value, 10) }));
    } else if (name === "lastContactedAt" || name === "billedAt" || name === "paymentDeadline") {
      setFormData((prev) => ({ ...prev, [name]: value === "" ? null : new Date(value).toISOString() }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/business/${formData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success("保存しました");
        router.refresh();
      } else {
        toast.error("保存に失敗しました");
      }
    } catch (error) {
      console.error(error);
      toast.error("エラーが発生しました");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("このお問い合わせを削除しますか？\n削除すると元に戻すことはできません。")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/business/${formData.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("削除しました");
        router.push("/admin/business");
        router.refresh();
      } else {
        toast.error("削除に失敗しました");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("エラーが発生しました");
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl shadow-sm border border-slate-200 sticky top-4 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/business")}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">法人案件詳細</h1>
            <p className="text-sm text-slate-500">
              受付日: {new Date(formData.createdAt).toLocaleString("ja-JP")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            削除する
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "保存中..." : "保存する"}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* 左カラム */}
        <div className="space-y-6">
          {/* お客様情報 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-3 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              お客様情報
            </h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="businessdetailclient-field-1" className="flex items-center justify-between text-sm font-bold text-slate-600 mb-1">
                  貴社名
                  <button onClick={() => handleCopyText(formData.companyName)} className="text-slate-400 hover:text-slate-600 p-0.5 rounded" title="コピー">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </label>
                <input id="businessdetailclient-field-1"
                  type="text"
                  name="companyName"
                  value={formData.companyName || ""}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label htmlFor="businessdetailclient-field-2" className="flex items-center justify-between text-sm font-bold text-slate-600 mb-1">
                  担当者名
                  <button onClick={() => handleCopyText(formData.contactName)} className="text-slate-400 hover:text-slate-600 p-0.5 rounded" title="コピー">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </label>
                <input id="businessdetailclient-field-2"
                  type="text"
                  name="contactName"
                  value={formData.contactName || ""}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label htmlFor="businessdetailclient-field-3" className="flex items-center justify-between text-sm font-bold text-slate-600 mb-1">
                  メールアドレス
                  <button onClick={() => handleCopyText(formData.email)} className="text-slate-400 hover:text-slate-600 p-0.5 rounded" title="コピー">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </label>
                <input id="businessdetailclient-field-3"
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* 案件情報 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-3 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" />
              案件情報
            </h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="businessdetailclient-field-4" className="block text-sm font-bold text-slate-600 mb-1">現在のステータス</label>
                <select id="businessdetailclient-field-4"
                  name="status"
                  value={formData.status || "PENDING"}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none font-bold"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="businessdetailclient-field-5" className="block text-sm font-bold text-slate-600 mb-1">最終対応日</label>
                <input id="businessdetailclient-field-5"
                  type="date"
                  name="lastContactedAt"
                  value={formatDateForInput(formData.lastContactedAt)}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label htmlFor="businessdetailclient-field-6" className="block text-sm font-bold text-slate-600 mb-1">ご用件</label>
                <input id="businessdetailclient-field-6"
                  type="text"
                  name="inquiryType"
                  value={formData.inquiryType || ""}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="businessdetailclient-field-7" className="block text-sm font-bold text-slate-600 mb-1">予算感</label>
                  <input id="businessdetailclient-field-7"
                    type="text"
                    name="budget"
                    value={formData.budget || ""}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    placeholder="例: 10万円〜"
                  />
                </div>
                <div>
                  <label htmlFor="businessdetailclient-field-8" className="block text-sm font-bold text-slate-600 mb-1">希望納期</label>
                  <input id="businessdetailclient-field-8"
                    type="text"
                    name="deadline"
                    value={formData.deadline || ""}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    placeholder="例: 10月末"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="businessdetailclient-field-9" className="block text-sm font-bold text-slate-600 mb-1">お問い合わせ内容</label>
                <textarea id="businessdetailclient-field-9"
                  name="message"
                  value={formData.message || ""}
                  onChange={handleChange}
                  rows={5}
                  className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none whitespace-pre-wrap text-sm leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 右カラム */}
        <div className="space-y-6">
          {/* 見積・請求情報 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-3 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-orange-500" />
              見積・請求情報
            </h3>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="businessdetailclient-field-10" className="block font-bold text-slate-600 mb-1">見積金額 (円)</label>
                  <input id="businessdetailclient-field-10"
                    type="number"
                    name="estimatedPrice"
                    value={formData.estimatedPrice || ""}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none text-right"
                  />
                </div>
                <div>
                  <label htmlFor="businessdetailclient-field-11" className="block font-bold text-slate-600 mb-1">確定金額 (円)</label>
                  <input id="businessdetailclient-field-11"
                    type="number"
                    name="finalPrice"
                    value={formData.finalPrice || ""}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none text-right font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="businessdetailclient-field-12" className="block font-bold text-slate-600 mb-1">請求日</label>
                  <input id="businessdetailclient-field-12"
                    type="date"
                    name="billedAt"
                    value={formatDateForInput(formData.billedAt)}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="businessdetailclient-field-13" className="block font-bold text-slate-600 mb-1">支払期限</label>
                  <input id="businessdetailclient-field-13"
                    type="date"
                    name="paymentDeadline"
                    value={formatDateForInput(formData.paymentDeadline)}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label htmlFor="businessdetailclient-field-14" className="block font-bold text-slate-600 mb-1">入金状況</label>
                  <select id="businessdetailclient-field-14"
                    name="paymentStatus"
                    value={formData.paymentStatus || ""}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    {PAYMENT_STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="businessdetailclient-field-15" className="block font-bold text-slate-600 mb-1">請求書発行</label>
                  <select id="businessdetailclient-field-15"
                    name="invoiceStatus"
                    value={formData.invoiceStatus || ""}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    {INVOICE_STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label htmlFor="businessdetailclient-field-16" className="flex items-center gap-2 cursor-pointer p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                  <input id="businessdetailclient-field-16"
                    type="checkbox"
                    name="isInvoiceCompliant"
                    checked={formData.isInvoiceCompliant || false}
                    onChange={handleChange}
                    className="w-4 h-4 text-orange-500 rounded border-slate-300 focus:ring-orange-500"
                  />
                  <span className="font-bold text-slate-700">インボイス対応 (適格請求書発行)</span>
                </label>
              </div>
            </div>
          </div>

          {/* 対応履歴 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-3 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              対応履歴・メモ
            </h3>
            <p className="text-xs text-slate-500 mb-2">
              例:<br/>
              2026/09/01 見積書を送付<br/>
              2026/09/03 先方から正式発注の連絡
            </p>
            <textarea
              name="history"
              value={formData.history || ""}
              onChange={handleChange}
              className="w-full flex-1 min-h-[200px] border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none text-sm leading-relaxed"
              placeholder="対応履歴やメモを入力してください..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
