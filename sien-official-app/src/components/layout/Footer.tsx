"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/config/site';
import { footerNavigation } from '@/config/navigation';

export function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="border-t bg-slate-50/50 py-16">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
        <div className="flex flex-col gap-4">
          <Link href="/">
            <img src="/logo.png" alt={siteConfig.name} className="h-10 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity" />
          </Link>
          <p className="text-muted-foreground text-xs leading-relaxed mt-2" dangerouslySetInnerHTML={{ __html: siteConfig.description.replace(/。/g, "。<br />") }} />
          <div className="flex items-center gap-4 mt-2">
            {siteConfig.social.twitter && (
              <a href={siteConfig.social.twitter} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#1DA1F2] transition-colors" title="X (Twitter)">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.96H5.078z" />
                </svg>
              </a>
            )}
            {siteConfig.social.youtube && (
              <a href={siteConfig.social.youtube} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#FF0000] transition-colors" title="YouTube">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-2 md:gap-3">
          <h4 className="font-bold text-foreground mb-1 md:mb-0">コンテンツ</h4>
          {footerNavigation.contents.map(item => (
            <Link key={item.href} href={item.href} className="text-muted-foreground hover:text-primary transition-colors py-2 md:py-0">{item.label}</Link>
          ))}
        </div>
        <div className="flex flex-col gap-2 md:gap-3">
          <h4 className="font-bold text-foreground mb-1 md:mb-0">ご依頼・サポート</h4>
          {footerNavigation.support.map(item => (
            <Link key={item.href} href={item.href} className="text-muted-foreground hover:text-primary transition-colors py-2 md:py-0">{item.label}</Link>
          ))}
        </div>
        <div className="flex flex-col gap-2 md:gap-3">
          <h4 className="font-bold text-foreground mb-1 md:mb-0">規約・ポリシー</h4>
          {footerNavigation.legal.map(item => (
            <Link key={item.href} href={item.href} className="text-muted-foreground hover:text-primary transition-colors py-2 md:py-0">{item.label}</Link>
          ))}
        </div>
      </div>
      <div className="container mx-auto px-4 mt-16 border-t pt-8 text-center text-xs text-muted-foreground">
        <p>
          Copyright &copy; {currentYear}{" "}
          <Link href="/login" className="hover:text-slate-400 transition-colors">
            {siteConfig.name}
          </Link>
          . All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
