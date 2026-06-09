"use client";

import React, { useState, useEffect } from "react";
import { Smartphone, ArrowRight, Share2, PlusSquare } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const translations = {
  en: {
    title: "Make FML always on your side",
    desc: "Install our app to book premium washes instantly from your home screen.",
    installBtn: "Install App",
    iosTitle: "How to Install on iOS",
    iosStep1: "1. Tap the Share button in Safari (at the bottom or top of your screen).",
    iosStep2: "2. Scroll down and tap 'Add to Home Screen'.",
  },
  fr: {
    title: "Gardez FML à vos côtés",
    desc: "Installez l'appli pour réserver vos lavages premium en un clic depuis votre écran d'accueil.",
    installBtn: "Installer l'appli",
    iosTitle: "Comment installer sur iOS",
    iosStep1: "1. Appuyez sur le bouton Partager dans Safari (en bas ou en haut de l'écran).",
    iosStep2: "2. Faites défiler vers le bas et appuyez sur 'Sur l'écran d'accueil'.",
  },
  ar: {
    title: "اجعل FML دائماً بجانبك",
    desc: "قم بتثبيت التطبيق لحجز غسيلك المميز بضغطة زر من شاشتك الرئيسية.",
    installBtn: "تثبيت التطبيق",
    iosTitle: "كيفية التثبيت على iOS",
    iosStep1: "1. اضغط على زر المشاركة في Safari (في أسفل الشاشة أو أعلاها).",
    iosStep2: "2. اسحب لأسفل واضغط على 'إضافة إلى الشاشة الرئيسية'.",
  },
};

export default function PwaInstall() {
  const { language, dir } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("[PWA] Service Worker registered:", reg.scope))
        .catch((err) => console.error("[PWA] Service Worker failed:", err));
    }

    // 2. Check standalone display mode (if already installed)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      return; // Already installed, hide section
    }

    // 3. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent) && !/lkx/.test(userAgent);
    setIsIOS(ios);

    // 4. Handle BeforeInstallPrompt event for Android/Chrome/Edge
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // For iOS, beforeinstallprompt is never fired.
    // Display the install section for iOS immediately if not installed.
    if (ios) {
      setIsVisible(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIosInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    // Trigger browser's native install prompt
    await deferredPrompt.prompt();

    // Check user decision
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] User response: ${outcome}`);

    // Cleanup prompt reference
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <section 
      dir={dir} 
      className="bg-zinc-950 border-t border-zinc-900 relative overflow-hidden py-16 text-white"
    >
      {/* Background blobs for premium feel */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-brand-blue/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {!showIosInstructions ? (
          <div className={`flex flex-col md:flex-row items-center justify-between gap-8 ${dir === 'rtl' ? 'md:flex-row-reverse' : ''}`}>
            <div className={`flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left ${dir === 'rtl' ? 'md:flex-row-reverse md:text-right' : ''}`}>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-blue-light flex items-center justify-center text-white shrink-0 shadow-lg shadow-brand-blue/30 animate-pulse">
                <Smartphone className="w-8 h-8" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-white">
                  {t.title}
                </h2>
                <p className="text-zinc-400 text-sm mt-2 max-w-xl font-medium leading-relaxed">
                  {t.desc}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleInstallClick}
              className="w-full md:w-auto bg-brand-blue text-white font-black uppercase text-xs tracking-widest px-8 py-5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-blue/20 flex items-center justify-center gap-3 shrink-0 cursor-pointer"
            >
              {t.installBtn}
              <ArrowRight size={16} className={dir === "rtl" ? "rotate-180" : ""} />
            </button>
          </div>
        ) : (
          <div className={`flex flex-col ${dir === "rtl" ? "text-right" : "text-left"} max-w-2xl mx-auto`}>
            <h3 className="text-xl font-black uppercase italic tracking-wider text-white flex items-center gap-3 justify-center md:justify-start">
              <Smartphone className="w-6 h-6 text-brand-blue" />
              {t.iosTitle}
            </h3>
            
            <div className="mt-6 space-y-4 text-zinc-300 text-sm font-semibold leading-relaxed">
              <div className={`flex items-start gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <span className="p-1.5 rounded bg-zinc-900 text-brand-blue shrink-0 flex items-center justify-center">
                  <Share2 size={18} />
                </span>
                <p className="mt-1">{t.iosStep1}</p>
              </div>
              
              <div className={`flex items-start gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <span className="p-1.5 rounded bg-zinc-900 text-brand-blue shrink-0 flex items-center justify-center">
                  <PlusSquare size={18} />
                </span>
                <p className="mt-1">{t.iosStep2}</p>
              </div>
            </div>

            <button
              onClick={() => setShowIosInstructions(false)}
              className="mt-6 text-xs text-brand-blue hover:text-white uppercase tracking-widest font-black text-center md:text-left self-center md:self-start cursor-pointer"
            >
              {dir === 'rtl' ? 'الرجوع ←' : '← Back'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
