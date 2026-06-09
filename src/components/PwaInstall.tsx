"use client";

import React, { useState, useEffect } from "react";
import { X, Smartphone, ArrowRight, Share2, PlusSquare } from "lucide-react";
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
    close: "Dismiss",
  },
  fr: {
    title: "Gardez FML à vos côtés",
    desc: "Installez l'appli pour réserver vos lavages premium en un clic depuis votre écran d'accueil.",
    installBtn: "Installer l'appli",
    iosTitle: "Comment installer sur iOS",
    iosStep1: "1. Appuyez sur le bouton Partager dans Safari (en bas ou en haut de l'écran).",
    iosStep2: "2. Faites défiler vers le bas et appuyez sur 'Sur l'écran d'accueil'.",
    close: "Ignorer",
  },
  ar: {
    title: "اجعل FML دائماً بجانبك",
    desc: "قم بتثبيت التطبيق لحجز غسيلك المميز بضغطة زر من شاشتك الرئيسية.",
    installBtn: "تثبيت التطبيق",
    iosTitle: "كيفية التثبيت على iOS",
    iosStep1: "1. اضغط على زر المشاركة في Safari (في أسفل الشاشة أو أعلاها).",
    iosStep2: "2. اسحب لأسفل واضغط على 'إضافة إلى الشاشة الرئيسية'.",
    close: "إغلاق",
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
      return; // Already installed, do not show banner
    }

    // 3. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent) && !/lkx/.test(userAgent); // Exclude inside webviews if possible
    setIsIOS(ios);

    // 4. Handle BeforeInstallPrompt event for Android/Chrome/Edge
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Check if user dismissed it previously in localStorage
      const dismissed = localStorage.getItem("fml_pwa_dismissed");
      if (!dismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // For iOS, beforeinstallprompt is never fired.
    // Show banner if iOS is detected and not dismissed.
    if (ios) {
      const dismissed = localStorage.getItem("fml_pwa_dismissed");
      if (!dismissed) {
        setIsVisible(true);
      }
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

  const handleDismiss = () => {
    // Save dismissal in localStorage so we don't prompt on every page reload
    localStorage.setItem("fml_pwa_dismissed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      dir={dir}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[92%] sm:w-full sm:max-w-md bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 rounded-3xl p-5 md:p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] transition-all duration-300 animate-float`}
    >
      {/* Close Button */}
      <button
        onClick={handleDismiss}
        className={`absolute top-4 ${dir === "rtl" ? "left-4" : "right-4"} p-1.5 text-zinc-500 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 rounded-full transition-colors`}
        aria-label={t.close}
      >
        <X size={16} />
      </button>

      {!showIosInstructions ? (
        <div className="flex items-start gap-4 pr-6 pl-1">
          {/* App Icon Styling */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-blue-light flex items-center justify-center text-white shrink-0 shadow-lg shadow-brand-blue/30">
            <Smartphone className="w-6 h-6 animate-pulse" />
          </div>
          
          <div className={`flex flex-col ${dir === "rtl" ? "text-right" : "text-left"}`}>
            <h3 className="text-sm font-black uppercase italic tracking-wider text-white">
              {t.title}
            </h3>
            <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed font-semibold">
              {t.desc}
            </p>
            
            <button
              onClick={handleInstallClick}
              className="mt-4 w-full bg-brand-blue text-white font-black uppercase text-[10px] tracking-widest px-5 py-3 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2"
            >
              {t.installBtn}
              <ArrowRight size={14} className={dir === "rtl" ? "rotate-180" : ""} />
            </button>
          </div>
        </div>
      ) : (
        <div className={`flex flex-col ${dir === "rtl" ? "text-right" : "text-left"} pr-4 pl-1`}>
          <h3 className="text-sm font-black uppercase italic tracking-wider text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-brand-blue" />
            {t.iosTitle}
          </h3>
          
          <div className="mt-4 space-y-3.5 text-zinc-300 text-xs font-semibold leading-relaxed">
            <div className="flex items-start gap-2.5">
              <span className="p-1 rounded bg-zinc-900 text-brand-blue shrink-0 flex items-center justify-center">
                <Share2 size={16} />
              </span>
              <p className="mt-0.5">{t.iosStep1}</p>
            </div>
            
            <div className="flex items-start gap-2.5">
              <span className="p-1 rounded bg-zinc-900 text-brand-blue shrink-0 flex items-center justify-center">
                <PlusSquare size={16} />
              </span>
              <p className="mt-0.5">{t.iosStep2}</p>
            </div>
          </div>

          <button
            onClick={() => setShowIosInstructions(false)}
            className="mt-5 text-[10px] text-zinc-400 hover:text-white uppercase tracking-widest font-black text-center"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
