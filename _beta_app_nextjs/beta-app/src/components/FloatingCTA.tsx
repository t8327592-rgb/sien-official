"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function FloatingCTA() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  // 特定のページ（依頼ページ、管理画面）では非表示
  const isHidden = pathname === "/order" || pathname.startsWith("/admin");

  useEffect(() => {
    // 少しスクロールしてから表示する
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  if (isHidden) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
          className="fixed bottom-6 right-6 z-50 md:bottom-10 md:right-10"
        >
          <Link href="/order" className="group flex items-center justify-center">
            {/* ツールチップ（PC用） */}
            <div className="absolute right-full mr-4 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              <div className="bg-gray-900 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg relative">
                無料で相談・見積もり
                <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-gray-900 rotate-45"></div>
              </div>
            </div>
            
            {/* ボタン本体 */}
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full shadow-2xl flex items-center justify-center text-white pop-shadow group-hover:scale-110 transition-transform">
              <Mail size={28} className="md:w-9 md:h-9" />
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
