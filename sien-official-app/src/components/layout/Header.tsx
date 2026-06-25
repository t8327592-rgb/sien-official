"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // パスが変わったらモバイルメニューを閉じる
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link 
            href="/" 
            className="flex items-center space-x-2"
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <img src="/logo.png" alt="Sien-Official" className="h-8 w-auto object-contain" />
          </Link>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-bold">
          <Link href="/profile" className="transition-colors text-slate-600 hover:text-orange-500">プロフィール</Link>
          <Link href="/mix" className="transition-colors text-slate-600 hover:text-orange-500">ミックス/マスタリング</Link>
          <Link href="/original" className="transition-colors text-slate-600 hover:text-orange-500">オリジナル楽曲</Link>
          <Link href="/works" className="transition-colors text-slate-600 hover:text-orange-500">制作実績</Link>
          <Link href="/blog" className="transition-colors text-slate-600 hover:text-orange-500">ブログ</Link>
          <Button asChild className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-md shadow-orange-500/20 border-none font-bold">
            <Link href="/order">ご依頼フォーム</Link>
          </Button>
        </nav>

        {/* Mobile Nav Toggle */}
        <button 
          className="md:hidden p-2 text-slate-600 hover:text-orange-500 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="sr-only">Toggle menu</span>
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav Menu (Dropdown) */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-orange-100 shadow-xl py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
          <Link href="/profile" className="text-base font-bold text-slate-700 hover:text-orange-500 py-2 border-b border-slate-50">プロフィール</Link>
          <Link href="/mix" className="text-base font-bold text-slate-700 hover:text-orange-500 py-2 border-b border-slate-50">ミックス/マスタリング</Link>
          <Link href="/original" className="text-base font-bold text-slate-700 hover:text-orange-500 py-2 border-b border-slate-50">オリジナル楽曲制作</Link>
          <Link href="/works" className="text-base font-bold text-slate-700 hover:text-orange-500 py-2 border-b border-slate-50">制作実績</Link>
          <Link href="/blog" className="text-base font-bold text-slate-700 hover:text-orange-500 py-2 border-b border-slate-50">ブログ</Link>
          <Button asChild className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-md shadow-orange-500/20 border-none font-bold mt-2 h-12">
            <Link href="/order">ご依頼・お見積りはこちら</Link>
          </Button>
        </div>
      )}
    </header>
  );
}
