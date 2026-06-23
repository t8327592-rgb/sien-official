"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Music, Settings2 } from "lucide-react";

export default function CreatorAudioCompareSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMixed, setIsMixed] = useState(true);

  return (
    <section className="py-24 bg-[#0f1013] relative overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#f59e0b]/5 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
              Before & <span className="text-[#f59e0b]">After</span>
            </h2>
            <p className="text-gray-400 font-medium max-w-2xl mx-auto text-sm md:text-base">
              スマホ録音の未加工音源が、MIX・マスタリングによってどのように「作品」へと変わるか、実際の音源でお確かめください。
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-[#1e1f22] rounded-[2rem] border border-[#313338] p-8 md:p-12 shadow-2xl relative"
        >
          {/* Cyber Player UI */}
          <div className="flex flex-col items-center">
            
            {/* Toggle Switch */}
            <div className="bg-[#313338]/50 p-1.5 rounded-full flex items-center mb-12 border border-[#313338] w-full max-w-md mx-auto relative overflow-hidden">
              {/* Highlight Pill */}
              <div 
                className={`absolute inset-y-1.5 w-[calc(50%-6px)] bg-[#f59e0b] rounded-full transition-transform duration-300 ease-out shadow-[0_0_15px_rgba(245,158,11,0.5)] ${isMixed ? "translate-x-[calc(100%+6px)]" : "translate-x-1"}`}
              />
              
              <button 
                onClick={() => setIsMixed(false)}
                className={`flex-1 py-3 text-sm font-bold tracking-widest z-10 transition-colors ${!isMixed ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
              >
                BEFORE (未加工)
              </button>
              <button 
                onClick={() => setIsMixed(true)}
                className={`flex-1 py-3 text-sm font-bold tracking-widest z-10 transition-colors ${isMixed ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
              >
                AFTER (MIX後)
              </button>
            </div>

            {/* Fake Waveform Visualizer */}
            <div className="w-full max-w-3xl flex items-center gap-1 h-32 mb-10 px-4">
              {[...Array(60)].map((_, i) => {
                // Generate random heights for waveform
                const h = Math.max(10, Math.sin(i * 0.2) * 50 + Math.random() * 50);
                return (
                  <div 
                    key={i} 
                    className={`flex-1 rounded-full transition-all duration-300 ${
                      isMixed 
                        ? (isPlaying ? "bg-[#f59e0b] animate-pulse" : "bg-[#f59e0b]/50") 
                        : (isPlaying ? "bg-gray-400 animate-pulse" : "bg-[#313338]")
                    }`}
                    style={{ 
                      height: `${isMixed ? h : h * 0.6}%`,
                      animationDelay: `${i * 0.05}s`
                    }}
                  />
                );
              })}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-8">
              <button className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:text-white bg-[#2b2d31] hover:bg-[#313338] transition-colors">
                <Settings2 size={20} />
              </button>
              
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              >
                {isPlaying ? <Pause fill="currentColor" size={32} /> : <Play fill="currentColor" size={32} className="ml-2" />}
              </button>
              
              <button className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:text-white bg-[#2b2d31] hover:bg-[#313338] transition-colors">
                <Music size={20} />
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-8 font-mono tracking-widest">
              ※こちらはデモ用のモックアッププレーヤーです。
            </p>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
