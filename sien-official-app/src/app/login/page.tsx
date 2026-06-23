"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
      router.push("/admin");
    } else {
      alert("ログインに失敗しました。ユーザー名またはパスワードが間違っています。");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-orange-600 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg shadow-orange-500/30">
            S
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Sien Admin</h1>
          <p className="text-slate-500 text-sm mt-2">管理者ダッシュボードへログイン</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">ユーザー名</label>
            <input 
              type="text" 
              className="w-full border-slate-200 rounded-xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all bg-slate-50 border text-slate-900"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">パスワード</label>
            <input 
              type="password" 
              className="w-full border-slate-200 rounded-xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all bg-slate-50 border text-slate-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" className="w-full h-14 text-md font-bold rounded-xl mt-6 shadow-md shadow-orange-500/20">
            ログイン
          </Button>
        </form>
      </div>
    </div>
  );
}
