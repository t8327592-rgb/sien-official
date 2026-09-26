"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import Image from "next/image";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (res?.ok) {
      toast.success("ログインしました");
      router.push("/admin");
    } else {
      const message = res?.error === "LOGIN_RATE_LIMITED"
        ? "ログインの試行回数が上限に達しました。15分ほど待ってから再度お試しください。"
        : res?.error === "LOGIN_UNAVAILABLE"
          ? "現在ログインできません。時間をおいて再度お試しください。"
          : "ログインに失敗しました。ユーザー名またはパスワードが間違っています。";
      toast.error(message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-50 via-slate-50 to-slate-50">
      <div className="bg-white p-8 sm:p-10 sm:rounded-[32px] w-full h-full sm:h-auto sm:max-w-[420px] flex flex-col justify-center sm:justify-start shadow-xl shadow-orange-900/5 border border-slate-100">
        
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-5">
            <Image 
              src="/icon.png" 
              alt="Sien" 
              width={64} 
              height={64} 
              className="rounded-full shadow-md"
            />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Sien Admin</h1>
          <p className="text-slate-500 text-sm font-medium">管理者ダッシュボードへログイン</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">ユーザー名</label>
            <input 
              type="text" 
              className="w-full bg-slate-50 border-2 border-transparent rounded-xl p-4 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">パスワード</label>
            <input 
              type="password" 
              className="w-full bg-slate-50 border-2 border-transparent rounded-xl p-4 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          {/* Actions */}
          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold rounded-full py-4 shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              ログイン
            </button>
          </div>
          
          <div className="text-center pt-6">
            <button 
              type="button" 
              className="text-slate-400 hover:text-orange-600 text-sm font-bold transition-colors inline-flex items-center gap-1.5" 
              onClick={() => router.push('/')}
            >
              <span>←</span> サイトに戻る
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
