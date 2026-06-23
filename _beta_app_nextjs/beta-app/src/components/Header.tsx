"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "料金表・詳細", href: "/pricing" },
    { name: "制作実績", href: "/works" },
    { name: "制作の流れ", href: "/#flow" },
    { name: "よくある質問", href: "/#faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#1e1f22]/90 backdrop-blur-md border-b border-[#313338] py-4 shadow-lg shadow-black/20"
          : "bg-transparent py-6 border-b-2 border-transparent"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center group py-2">
          <Logo size="md" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-bold text-gray-300 hover:text-brand transition-colors tracking-widest"
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/order"
            className="px-6 py-2.5 bg-[#f59e0b] text-white text-sm font-bold rounded-full hover:bg-orange-500 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)] tracking-widest"
          >
            依頼する
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden relative z-10 p-2 text-gray-600 hover:text-orange-500"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b-2 border-orange-100 py-6 px-6 flex flex-col gap-6 shadow-xl"
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg font-bold text-gray-700 hover:text-orange-500"
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/order"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full text-center px-6 py-4 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-black mt-4 shadow-xl shadow-orange-200/50 glow-text"
          >
            無料相談・お見積り
          </Link>
        </motion.div>
      )}
    </header>
  );
}
