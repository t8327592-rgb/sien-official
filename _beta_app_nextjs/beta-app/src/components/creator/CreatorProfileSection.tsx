"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ExternalLink, CheckCircle2 } from "lucide-react";
import { SITE_INFO } from "@/lib/constants";

export default function CreatorProfileSection() {
  return (
    <section className="py-24 bg-[#1e1f22]">
      <div className="container mx-auto px-6 max-w-6xl">
        
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
          
          {/* Artist Image (Spotify style rounded square) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-5/12 relative"
          >
            <div className="relative aspect-square w-full max-w-md mx-auto rounded-[3rem] overflow-hidden shadow-2xl group">
              <Image 
                src="/profile-icon2.png" 
                alt={SITE_INFO.profile.name}
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Gradient Overlay for text readability if needed */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f1013]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            
            {/* Floating verification badge */}
            <div className="absolute -bottom-4 right-1/4 translate-x-1/2 bg-[#2b2d31] border border-[#313338] rounded-full px-4 py-2 flex items-center gap-2 shadow-xl">
              <CheckCircle2 size={16} className="text-[#f59e0b]" fill="currentColor" />
              <span className="text-xs font-bold text-white tracking-widest uppercase">Verified MIXER</span>
            </div>
          </motion.div>

          {/* Artist Specs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-7/12"
          >
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">
              {SITE_INFO.profile.name}
            </h2>
            
            <p className="text-xl text-gray-400 font-medium mb-12">
              Vocal Mixing & Mastering Engineer
            </p>

            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-10">
              
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Career</p>
                <p className="text-white text-lg font-medium border-b border-[#313338] pb-2">
                  MIX歴 〇〇年 / 累計 800+ Works
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Delivery Time</p>
                <p className="text-white text-lg font-medium border-b border-[#313338] pb-2">
                  通常 7〜14日 (即日オプション有)
                </p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Specialty Genres</p>
                <p className="text-white text-lg font-medium border-b border-[#313338] pb-2">
                  {SITE_INFO.profile.genres}
                </p>
              </div>

              <div className="space-y-3 sm:col-span-2">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Equipments</p>
                <div className="flex flex-wrap gap-2">
                  {['Studio One', 'Cubase', 'Waves', 'FabFilter', 'iZotope Ozone', 'Melodyne'].map(eq => (
                    <span key={eq} className="bg-[#2b2d31] border border-[#313338] text-gray-300 text-sm px-4 py-1.5 rounded-full font-medium">
                      {eq}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            <div className="mt-12 pt-8">
              <a 
                href="https://twitter.com/sien_mc09" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/30 rounded-full font-bold transition-colors"
              >
                Follow on X (Twitter)
                <ExternalLink size={18} />
              </a>
            </div>

          </motion.div>
        </div>

      </div>
    </section>
  );
}
