'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-panel py-4' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center max-w-7xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image 
            src="/logo.png" 
            alt="SIEN.OFFICIAL" 
            width={180} 
            height={48} 
            className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          <Link href="/profile" className="text-sm font-bold text-gray-600 hover:text-[#47A1FF] transition-colors">プロフィール</Link>
          <Link href="/works" className="text-sm font-bold text-gray-600 hover:text-[#47A1FF] transition-colors">制作実績</Link>
          <Link href="/pricing" className="text-sm font-bold text-gray-600 hover:text-[#47A1FF] transition-colors">料金・プラン</Link>
          <Link href="/faq" className="text-sm font-bold text-gray-600 hover:text-[#47A1FF] transition-colors">よくある質問</Link>
          <Link href="/news" className="text-sm font-bold text-gray-600 hover:text-[#47A1FF] transition-colors">お知らせ</Link>
          <Link href="/contact" className="text-sm font-bold bg-[#0071E3] text-white px-7 py-2.5 rounded-full shadow-[0_4px_15px_rgba(0,113,227,0.2)] hover:bg-[#47A1FF] hover:shadow-[0_4px_20px_rgba(71,161,255,0.3)] hover:-translate-y-0.5 transition-all">
            お問い合わせ
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-[#1D1D1F] p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass-panel absolute top-full left-0 w-full border-t border-gray-200">
          <nav className="flex flex-col p-6 gap-6">
            <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-gray-600 hover:text-[#47A1FF]">プロフィール</Link>
            <Link href="/works" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-gray-600 hover:text-[#47A1FF]">制作実績</Link>
            <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-gray-600 hover:text-[#47A1FF]">料金・プラン</Link>
            <Link href="/faq" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-gray-600 hover:text-[#47A1FF]">よくある質問</Link>
            <Link href="/news" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-gray-600 hover:text-[#47A1FF]">お知らせ</Link>
            <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold bg-[#0071E3] text-white px-5 py-3 rounded-full text-center mt-2 shadow-[0_4px_15px_rgba(0,113,227,0.2)]">
              お問い合わせ
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
