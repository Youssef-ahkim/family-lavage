"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { language, dir } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    // In a real production app, log this to an error reporting service like Sentry
    console.error("Global Error Caught:", error);
  }, [error]);

  const oops = language === 'fr' ? 'Oups !' : (language === 'ar' ? 'أوبس!' : 'Oops!');
  const message = language === 'fr' 
    ? "Une erreur inattendue s'est produite. Nous nous en excusons." 
    : (language === 'ar' ? "حدث خطأ غير متوقع. ونحن نعتذر عن ذلك." : "An unexpected error occurred. We apologize for the inconvenience.");
  const retry = language === 'fr' ? 'Réessayer' : (language === 'ar' ? 'إعادة المحاولة' : 'Try Again');

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 p-4" dir={dir}>
      <div className="max-w-md w-full bg-white/90 backdrop-blur-xl p-10 rounded-[2rem] shadow-[0_20px_60px_rgba(0,112,243,0.06)] text-center border border-zinc-100">
        
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-12">
          <AlertTriangle size={48} className="-rotate-12" />
        </div>
        
        <h2 className="text-3xl font-black text-zinc-900 mb-4 uppercase tracking-tighter">{oops}</h2>
        <p className="text-zinc-500 mb-10 leading-relaxed">
          {message}
        </p>
        
        <div className="flex flex-col gap-4">
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-3 bg-brand-blue text-white py-4 rounded-2xl font-bold hover:bg-brand-blue/90 hover:-translate-y-1 transition-all active:scale-95 uppercase tracking-widest text-xs"
          >
            <RefreshCw size={16} />
            {retry}
          </button>
          
          <Link href="/">
            <button className="w-full flex items-center justify-center gap-3 bg-zinc-100 text-zinc-900 py-4 rounded-2xl font-bold hover:bg-zinc-200 transition-colors uppercase tracking-widest text-xs">
              <Home size={16} />
              {t.profile.backHome}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
