"use client";

import { motion } from "framer-motion";
import { MessageCircle, Heart, Repeat2, Share } from "lucide-react";

export default function OfficialTestimonialSection() {
  const testimonials = [
    {
      type: "dm",
      name: "歌い手 A様",
      iconColor: "bg-pink-100 text-pink-600",
      messages: [
        { text: "こんばんは！音源確認させていただきました！", isSelf: false },
        { text: "本当に凄すぎて感動してます…！😭✨ 自分の声じゃないみたいで、何度も聴き返しちゃいました！", isSelf: false },
        { text: "また絶対しえんさんに依頼させてください！！ありがとうございました！", isSelf: false },
      ]
    },
    {
      type: "dm",
      name: "VTuber B様",
      iconColor: "bg-blue-100 text-blue-600",
      messages: [
        { text: "MIXデータの納品ありがとうございます！", isSelf: false },
        { text: "スマホ録音だったのでノイズがかなり心配だったんですが、全く気にならないレベルで綺麗になってて驚きました…！", isSelf: false },
        { text: "オケとの馴染み具合も完璧です🎧", isSelf: false },
      ]
    },
    {
      type: "tweet",
      name: "配信者 C様",
      handle: "@streamer_c",
      iconColor: "bg-green-100 text-green-600",
      text: "今回もしえんさんにMIXお願いしたんだけど、毎回想像以上のクオリティで返ってくるから本当に信頼しかない…🙏\nピッチ補正が自然すぎて神。みんなも依頼するなら絶対しえんさんがおすすめ！！",
      date: "2024年4月15日",
      likes: "142",
      rts: "18"
    }
  ];

  return (
    <section className="py-32 bg-[#F8F9FA] relative overflow-hidden">
      {/* Background blobs for pop aesthetic */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="tracking-[0.2em] text-xs text-amber-600 uppercase font-bold mb-4 block">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-6">
              お客様の声
            </h2>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-medium">
              ありがたいことに、リピーターの方やご紹介でのご依頼を多数いただいております。<br className="hidden md:block"/>
              実際にいただいた喜びの声を一部ご紹介します。
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((test, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              {test.type === "dm" ? (
                // DM Style UI
                <div className="h-full flex flex-col">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3 bg-white">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${test.iconColor}`}>
                      {test.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{test.name}</h4>
                      <p className="text-[10px] text-gray-400">Direct Message</p>
                    </div>
                  </div>
                  {/* Chat Area */}
                  <div className="p-6 bg-gray-50/50 flex-1 space-y-4">
                    {test.messages?.map((msg, mIdx) => (
                      <div key={mIdx} className="flex items-end gap-2">
                        {mIdx === test.messages.length - 1 ? (
                          <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center font-bold text-xs ${test.iconColor}`}>
                            {test.name.charAt(0)}
                          </div>
                        ) : (
                          <div className="w-8 shrink-0"></div>
                        )}
                        <div className="bg-white border border-gray-100 text-gray-700 text-sm p-3 rounded-2xl rounded-bl-sm shadow-sm leading-relaxed">
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // X (Twitter) Style UI
                <div className="h-full flex flex-col p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${test.iconColor}`}>
                      {test.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{test.name}</h4>
                      <p className="text-xs text-gray-500">{test.handle}</p>
                    </div>
                    <div className="ml-auto text-blue-400">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                      </svg>
                    </div>
                  </div>
                  <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap mb-4 font-medium">
                    {test.text}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">{test.date}</p>
                  <div className="flex items-center gap-6 text-gray-500 border-t border-gray-100 pt-4 mt-auto">
                    <div className="flex items-center gap-2 hover:text-blue-500 transition-colors cursor-pointer">
                      <MessageCircle size={16} />
                    </div>
                    <div className="flex items-center gap-2 hover:text-green-500 transition-colors cursor-pointer">
                      <Repeat2 size={16} />
                      <span className="text-xs font-bold">{test.rts}</span>
                    </div>
                    <div className="flex items-center gap-2 hover:text-pink-500 transition-colors cursor-pointer">
                      <Heart size={16} />
                      <span className="text-xs font-bold">{test.likes}</span>
                    </div>
                    <div className="flex items-center gap-2 hover:text-blue-500 transition-colors cursor-pointer ml-auto">
                      <Share size={16} />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
