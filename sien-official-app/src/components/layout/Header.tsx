"use client";
import Image from "next/image";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight } from 'lucide-react';
import { headerNavigation } from '@/config/navigation';
import { siteConfig } from '@/config/site';

export function Header({ showBlog = true }: { showBlog?: boolean }) {
  const navigation = headerNavigation.filter(item => showBlog || item.href !== "/blog");
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const isMobileMenuOpen = openPath === pathname;
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpenPath(null); menuButton.current?.focus(); } };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [isMobileMenuOpen]);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto w-full px-4 sm:px-5 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center space-x-2"
            onClick={(e) => {
              setOpenPath(null);
              if (pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <Image width={851} height={200} src="/logo.png" alt={siteConfig.name} className="h-7 sm:h-8 w-auto object-contain" />
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav aria-label="メインナビゲーション" className="hidden xl:flex items-center gap-6 lg:gap-8 text-sm font-bold">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} className="whitespace-nowrap transition-colors text-slate-600 hover:text-orange-700">
              {item.label}
            </Link>
          ))}
          <Button asChild className="rounded-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white shadow-lg shadow-orange-500/20 border-none font-bold px-4 h-9">
            <Link href={siteConfig.contact.formUrl}>ご依頼フォーム</Link>
          </Button>
        </nav>

        {/* Mobile Nav Toggle */}
        <button
          className="xl:hidden min-h-11 min-w-11 p-2 text-slate-600 hover:text-orange-700 transition-colors"
          ref={menuButton}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={isMobileMenuOpen ? "メニューを閉じる" : "メニューを開く"}
          onClick={() => setOpenPath(isMobileMenuOpen ? null : pathname)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav Menu (Dropdown) */}
      {isMobileMenuOpen && (
        <nav id="mobile-navigation" aria-label="モバイルナビゲーション" className="xl:hidden absolute top-16 left-0 w-full max-h-[calc(100dvh-4rem)] overflow-y-auto bg-white border-b border-orange-100 shadow-lg py-3 px-5 flex flex-col gap-1 animate-in slide-in-from-top-2">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpenPath(null)} aria-current={pathname === item.href ? "page" : undefined} className="text-base font-bold text-slate-700 hover:text-orange-700 py-3 border-b border-slate-50 flex items-center justify-between">
              {item.label} <ArrowRight className="w-4 h-4 opacity-50" />
            </Link>
          ))}
          <Button asChild className="rounded-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white shadow-lg shadow-orange-500/20 border-none font-bold mt-3 h-12">
            <Link href={siteConfig.contact.formUrl} onClick={() => setOpenPath(null)}>ご依頼・お見積りはこちら</Link>
          </Button>
        </nav>
      )}
    </header>
  );
}
