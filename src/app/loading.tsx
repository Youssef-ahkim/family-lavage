"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function Loading() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white fixed inset-0 z-[100]">
      <div className="relative flex items-center justify-center">
        {/* Outer ring */}
        <div className="w-24 h-24 border-4 border-zinc-100 rounded-full absolute"></div>
        {/* Spinning gradient ring */}
        <div 
          className="w-24 h-24 rounded-full absolute animate-spin"
          style={{
            border: '4px solid transparent',
            borderTopColor: '#0070f3',
            borderRightColor: '#14b8a6',
          }}
        />
        
        {/* Inner branding pulse */}
        <div className="w-16 h-16 bg-gradient-to-br from-brand-blue/10 to-teal-400/5 rounded-full flex items-center justify-center animate-pulse">
          <span className="font-black italic text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-teal-500 text-sm">F<span className="text-blue-900">M</span>L</span>
        </div>
      </div>
      <p className="mt-8 text-zinc-400 font-bold text-[10px] tracking-[0.3em] uppercase animate-pulse">
        {language === 'fr' ? 'Chargement...' : (language === 'ar' ? 'جاري التحميل...' : 'Loading...')}
      </p>
    </div>
  );
}
