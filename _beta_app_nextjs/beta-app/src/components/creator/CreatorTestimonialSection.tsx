"use client";

import { motion } from "framer-motion";

export default function CreatorTestimonialSection() {
  const testimonials = [
    {
      id: "1",
      role: "歌い手",
      name: "Client A",
      avatarBg: "bg-indigo-500",
      time: "Today at 2:34 PM",
      messages: [
        "こんばんは！音源確認させていただきました！",
        "本当に凄すぎて感動してます…！😭✨ スマホ録音でノイズだらけだったのに、全く気にならないレベルで綺麗になってて驚きました…！",
        "オケとの馴染み具合も完璧で、自分の声じゃないみたいです🎧 また絶対しえんさんに依頼させてください！！ありがとうございました！"
      ]
    },
    {
      id: "2",
      role: "VTuber",
      name: "Client B",
      avatarBg: "bg-rose-500",
      time: "Yesterday at 8:12 PM",
      messages: [
        "MIXデータの納品ありがとうございます！確認いたしました。",
        "ここのハモリをもう少し大きく、という細かい要望にも快く応えていただき、本当にありがとうございました。理想通りの仕上がりです！",
        "次回の歌ってみた動画でもぜひお願いしたいです🙏"
      ]
    }
  ];

  return (
    <section className="py-24 bg-[#1e1f22]"> {/* Discord dark theme background */}
      <div className="container mx-auto px-6 max-w-4xl">
        
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-gray-400">#</span> voices-of-clients
            </h2>
            <p className="text-gray-400 text-sm">
              いただいた嬉しい声（※デモ用テキスト）
            </p>
          </motion.div>
        </div>

        {/* Discord-style Chat Container */}
        <div className="bg-[#313338] rounded-xl overflow-hidden border border-[#1e1f22] shadow-2xl">
          <div className="flex flex-col gap-6 p-6 md:p-8">
            
            {/* Welcome message divider */}
            <div className="flex items-center gap-4 py-4">
              <div className="h-px bg-[#3f4147] flex-1"></div>
              <span className="text-xs font-bold text-gray-400">September 24, 2024</span>
              <div className="h-px bg-[#3f4147] flex-1"></div>
            </div>

            {testimonials.map((test, idx) => (
              <motion.div 
                key={test.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="flex gap-4 group hover:bg-[#2b2d31] -mx-4 px-4 py-2 rounded-md transition-colors"
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-lg mt-1 ${test.avatarBg} cursor-pointer hover:opacity-80 transition-opacity`}>
                  {test.name.charAt(0)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-medium text-white hover:underline cursor-pointer">{test.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#5865F2] text-white font-bold leading-none uppercase">
                      {test.role}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">{test.time}</span>
                  </div>
                  
                  <div className="space-y-1">
                    {test.messages.map((msg, mIdx) => (
                      <p key={mIdx} className="text-[#dbdee1] text-[15px] leading-relaxed break-words">
                        {msg}
                      </p>
                    ))}
                  </div>

                  {/* Reactions */}
                  <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-[#2b2d31] border border-[#3f4147] hover:bg-[#3f4147] hover:border-[#5865F2] rounded-md px-2 py-1 flex items-center gap-1.5 cursor-pointer transition-colors">
                      <span className="text-sm">🔥</span>
                      <span className="text-xs font-bold text-gray-300">1</span>
                    </div>
                    <div className="bg-[#2b2d31] border border-[#3f4147] hover:bg-[#3f4147] hover:border-[#5865F2] rounded-md px-2 py-1 flex items-center gap-1.5 cursor-pointer transition-colors">
                      <span className="text-sm">✨</span>
                      <span className="text-xs font-bold text-gray-300">1</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

          </div>
          
          {/* Fake Message Input */}
          <div className="p-4 bg-[#313338] border-t border-[#1e1f22]">
            <div className="bg-[#383a40] rounded-lg px-4 py-3 flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#4e5058] flex items-center justify-center shrink-0">
                <span className="text-white text-lg font-light leading-none mb-1">+</span>
              </div>
              <p className="text-[#87898f] text-[15px]">Message #voices-of-clients</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
