"use client";

import { motion } from "framer-motion";
import { Bell } from "lucide-react";

type News = {
  id: string;
  title: string;
  content: string | null;
  createdAt: string;
};

export default function NewsSection({ news = [] }: { news: News[] }) {
  if (news.length === 0) return null;

  return (
    <section className="py-12 bg-white relative">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="text-orange-500" size={24} />
            <h2 className="text-2xl font-black text-gray-800">お知らせ</h2>
          </div>
          
          <div className="space-y-4">
            {news.slice(0, 3).map((item, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                key={item.id} 
                className="group flex flex-col md:flex-row md:items-center gap-2 md:gap-6 p-4 rounded-2xl hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-100"
              >
                <div className="text-sm font-bold text-orange-500 shrink-0">
                  {new Date(item.createdAt).toLocaleDateString('ja-JP')}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                    {item.title}
                  </h3>
                  {item.content && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{item.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
