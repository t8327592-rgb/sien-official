"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";
import FloatingCTA from "./FloatingCTA";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const hasSeenSplash = sessionStorage.getItem("splash_shown");
    
    if (hasSeenSplash) {
      setShowSplash(false);
      setShowContent(true);
    } else {
      sessionStorage.setItem("splash_shown", "true");
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isMounted) {
    // サーバーサイドレンダリング時は何も表示しない（Hydration mismatch防止）
    return null;
  }

  return (
    <>
      <AnimatePresence onExitComplete={() => setShowContent(true)}>
        {showSplash && (
          <motion.div
            key="splash"
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#fdfbf7]"
          >
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.5 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply blur-3xl"
              />
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.5 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply blur-3xl"
              />
            </div>

            <div className="relative z-10">
              <Logo size="lg" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main App Content - スプラッシュ画面が消え始めたらフェードイン */}
      <motion.div
        className="min-h-full flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: showSplash ? 0 : 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        {children}
        <FloatingCTA />
      </motion.div>
    </>
  );
}
