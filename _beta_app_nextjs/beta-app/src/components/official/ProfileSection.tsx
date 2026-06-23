"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE_INFO } from "@/lib/constants";

export default function OfficialProfileSection() {
  return (
    <section id="about" className="py-32 bg-white text-gray-900">
      <div className="container mx-auto px-6 max-w-6xl">
        
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-5/12"
          >
            <div className="relative aspect-square max-w-sm mx-auto lg:mx-0">
              <div className="absolute inset-0 border border-gray-200 translate-x-4 translate-y-4"></div>
              <div className="absolute inset-0 bg-gray-100 overflow-hidden">
                <Image 
                  src="/profile-icon2.png" 
                  alt={SITE_INFO.profile.name}
                  fill 
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </div>
            
            {/* SNS Button under profile image */}
            <div className="mt-10 max-w-sm mx-auto lg:mx-0 text-center">
              <a 
                href="https://twitter.com/sien_mc09" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#1DA1F2] text-white hover:bg-[#1a8cd8] transition-colors shadow-lg shadow-[#1DA1F2]/20 font-bold text-sm tracking-widest w-full justify-center"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                </svg>
                X (Twitter) で日常を発信中
              </a>
              <p className="text-xs text-gray-400 mt-3 font-medium">ご依頼・ご相談はDMからも受け付けております。</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full lg:w-7/12"
          >
            <div className="mb-4">
              <span className="tracking-[0.2em] text-xs text-amber-600 uppercase font-bold">Profile</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif mb-8 text-gray-900 tracking-wide">
              {SITE_INFO.profile.name} <span className="text-sm font-sans text-gray-400 tracking-widest ml-2 uppercase">Mixing Engineer</span>
            </h2>

            {/* Spec List */}
            <div className="space-y-6">
              <div className="border-l-2 border-amber-500 pl-4">
                <p className="text-xs tracking-widest text-gray-400 uppercase mb-1">Career & Works</p>
                <p className="text-gray-900 font-bold text-lg">MIX歴 〇〇年 / 累計実績 800件以上</p>
              </div>
              
              <div className="border-l-2 border-gray-200 pl-4">
                <p className="text-xs tracking-widest text-gray-400 uppercase mb-1">Specialty Genres</p>
                <p className="text-gray-700 font-medium">{SITE_INFO.profile.genres}</p>
              </div>
              
              <div className="border-l-2 border-gray-200 pl-4">
                <p className="text-xs tracking-widest text-gray-400 uppercase mb-1">Delivery Time</p>
                <p className="text-gray-700 font-medium">通常 7〜14日 （※最短即日納品オプションあり）</p>
              </div>

              <div className="border-l-2 border-gray-200 pl-4">
                <p className="text-xs tracking-widest text-gray-400 uppercase mb-2">Equipments & Tools</p>
                <ul className="text-sm text-gray-600 flex flex-wrap gap-2">
                  <li className="bg-gray-50 px-3 py-1 rounded border border-gray-100">Studio One</li>
                  <li className="bg-gray-50 px-3 py-1 rounded border border-gray-100">Cubase</li>
                  <li className="bg-gray-50 px-3 py-1 rounded border border-gray-100">Waves</li>
                  <li className="bg-gray-50 px-3 py-1 rounded border border-gray-100">FabFilter</li>
                  <li className="bg-gray-50 px-3 py-1 rounded border border-gray-100">iZotope Ozone</li>
                  <li className="bg-gray-50 px-3 py-1 rounded border border-gray-100">Melodyne</li>
                </ul>
              </div>
            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
}
