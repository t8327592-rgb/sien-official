"use client";

import { motion } from "framer-motion";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function Logo({ className = "", size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: { main: "text-xl", sub: "text-[8px]" },
    md: { main: "text-2xl", sub: "text-[10px]" },
    lg: { main: "text-4xl", sub: "text-xs" },
  };

  return (
    <motion.div 
      className={`relative inline-flex flex-col items-start justify-center ${className} group`}
      whileHover={{ scale: 1.05, rotate: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <div className="flex items-center gap-2">
        {/* Playful Music Motif (Headphones) */}
        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-500/30 group-hover:animate-bounce">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
          </svg>
        </div>
        <div className={`font-extrabold tracking-tight text-gray-900 leading-none ${sizeClasses[size].main} drop-shadow-sm`}>
          SHIEN
        </div>
      </div>
      <div className={`font-bold tracking-[0.2em] text-amber-600 uppercase mt-1.5 ml-10 ${sizeClasses[size].sub}`}>
        Mix & Mastering
      </div>
      
      {/* Pop dot */}
      <div className="absolute top-0 right-[-10px] w-2 h-2 rounded-full bg-pink-400 opacity-80" />
    </motion.div>
  );
}
