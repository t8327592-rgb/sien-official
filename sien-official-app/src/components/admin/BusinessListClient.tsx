"use client";

import React, { useState } from "react";
import { ChevronDown, Building2, Calendar, Mail, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

type BusinessContact = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  inquiryType: string;
  budget: string | null;
  deadline: string | null;
  message: string;
  status: string;
  createdAt: Date;
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "未対応",
  REPLIED: "返信済",
  CLOSED: "完了",
};

const STATUS_OPTIONS = [
  { value: "PENDING", label: "未対応", colorClass: "bg-orange-50 text-orange-600 border-orange-200" },
  { value: "REPLIED", label: "返信済", colorClass: "bg-blue-50 text-blue-600 border-blue-200" },
  { value: "CLOSED", label: "完了", colorClass: "bg-slate-100 text-slate-600 border-slate-200" },
];

export default function BusinessListClient({ initialContacts }: { initialContacts: BusinessContact[] }) {
  const [contacts, setContacts] = useState(initialContacts);
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // 楽観的UI更新
    const previousContacts = [...contacts];
    setContacts(contacts.map(c => c.id === id ? { ...c, status: newStatus } : c));
    setEditingStatusId(null);

    try {
      const res = await fetch(`/api/admin/business-contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Update failed");
    } catch (error) {
      console.error(error);
      alert("ステータスの更新に失敗しました");
      setContacts(previousContacts);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
              <th className="py-3 px-4 pl-5 w-32">ステータス</th>
              <th className="py-3 px-4 w-32">受付日</th>
              <th className="py-3 px-4">貴社名 / 担当者</th>
              <th className="py-3 px-4">ご用件</th>
              <th className="py-3 px-4 text-right">詳細</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-sm text-slate-500">
                  お問い合わせはまだありません。
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <React.Fragment key={contact.id}>
                  <tr 
                    className="hover:bg-slate-50 transition-colors cursor-pointer text-sm"
                    onClick={() => setExpandedId(expandedId === contact.id ? null : contact.id)}
                  >
                    <td className="py-3 px-4 pl-5 relative overflow-visible">
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingStatusId(editingStatusId === contact.id ? null : contact.id);
                        }}
                        className={`flex items-center gap-1 w-max px-2 py-0.5 rounded-md text-[11px] font-bold border cursor-pointer hover:opacity-80 transition-opacity ${
                          contact.status === 'PENDING' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                          contact.status === 'REPLIED' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {STATUS_LABELS[contact.status] || contact.status}
                        <ChevronDown className="w-3 h-3 opacity-50" />
                      </div>

                      {editingStatusId === contact.id && (
                        <div 
                          className="absolute z-50 mt-1 left-4 w-32 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                        >
                          <div className="py-1">
                            {STATUS_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={(e) => handleStatusChange(contact.id, opt.value, e)}
                                className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors flex items-center"
                              >
                                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold inline-block border ${opt.colorClass}`}>
                                  {opt.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(contact.createdAt).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{contact.companyName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{contact.contactName} 様</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {contact.inquiryType}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <ChevronDown className={`w-5 h-5 inline-block text-slate-400 transition-transform ${expandedId === contact.id ? 'rotate-180' : ''}`} />
                    </td>
                  </tr>
                  
                  {expandedId === contact.id && (
                    <tr className="bg-slate-50/50">
                      <td colSpan={5} className="p-0 border-b-2 border-orange-100">
                        <div className="p-6 md:p-8 animate-in slide-in-from-top-2 duration-200">
                          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            
                            {/* 左カラム：基本情報 */}
                            <div className="space-y-6">
                              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-800 border-b pb-3 mb-4 flex items-center gap-2">
                                  <Building2 className="w-4 h-4 text-orange-500" />
                                  お客様情報
                                </h3>
                                <div className="space-y-4 text-sm">
                                  <div>
                                    <p className="text-xs font-bold text-slate-400 mb-1">貴社名 / 担当者</p>
                                    <p className="font-bold text-slate-800">{contact.companyName} / {contact.contactName} 様</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-slate-400 mb-1">メールアドレス</p>
                                    <p className="font-medium text-slate-700 flex items-center gap-2">
                                      <Mail className="w-4 h-4 text-slate-400" />
                                      {contact.email}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-800 border-b pb-3 mb-4 flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-blue-500" />
                                  ご予算・希望納期
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-xs font-bold text-slate-400 mb-1">ご予算感</p>
                                    <p className="font-medium text-slate-800">{contact.budget || "未定"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-slate-400 mb-1">希望納期</p>
                                    <p className="font-medium text-slate-800">{contact.deadline || "未定"}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 右カラム：メッセージ */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
                              <h3 className="text-sm font-bold text-slate-800 border-b pb-3 mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-emerald-500" />
                                お問い合わせ内容
                              </h3>
                              <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700 whitespace-pre-wrap leading-relaxed flex-1 border border-slate-100">
                                {contact.message}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
