"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { getServices } from "@/app/admin/services/service-actions";
import { ServiceRecord } from "@/app/admin/services/service-types";
import { ArrowLeft, Car, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ServiceDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { language, dir } = useLanguage();
  const t = translations[language];
  const [service, setService] = useState<ServiceRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServices()
      .then((data) => {
        const found = data.find(s => s.id === id);
        if (found) {
          setService(found);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-zinc-950 font-sans">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-zinc-400 font-bold uppercase tracking-widest animate-pulse">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-white text-zinc-950 font-sans">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-4">Service Introuvable</h1>
          <button onClick={() => router.push('/services')} className="text-brand-blue font-bold flex items-center gap-2">
            <ArrowLeft size={20} /> Retour aux services
          </button>
        </div>
      </div>
    );
  }

  const title = language === 'fr' ? service.title_fr : (language === 'ar' ? service.title_ar : service.title_en);
  const features = language === 'fr' ? service.features_fr : (language === 'ar' ? service.features_ar : service.features_en);
  const isGold = service.price >= 500;

  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans overflow-x-hidden">
      <Navbar />

      <section className="relative pt-40 pb-24 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/services" className="inline-flex items-center gap-2 text-zinc-500 hover:text-brand-blue font-bold uppercase tracking-widest text-xs mb-12 transition-colors">
            <ArrowLeft size={16} className={dir === 'rtl' ? 'rotate-180' : ''} />
            {language === 'fr' ? 'Retour aux services' : (language === 'ar' ? 'العودة إلى الخدمات' : 'Back to services')}
          </Link>

          <div className={`flex flex-col lg:flex-row gap-16 items-center ${dir === 'rtl' ? 'lg:flex-row-reverse' : ''}`}>
            {/* Image Side */}
            <div className="w-full lg:w-1/2 relative group reveal">
              <div className={`absolute -inset-4 bg-gradient-to-br ${isGold ? 'from-brand-gold/30 to-yellow-500/10' : 'from-brand-blue/30 to-teal-500/10'} rounded-[3rem] blur-2xl opacity-100 transition-opacity duration-700`} />
              <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-zinc-200 shadow-2xl shadow-zinc-200/50">
                {service.photo ? (
                  <Image 
                    src={service.photo} 
                    alt={title} 
                    fill 
                    unoptimized={true}
                    className="object-cover"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${isGold ? 'from-zinc-900 to-zinc-800' : 'from-brand-blue to-teal-600'}`}>
                    <Car className="w-24 h-24 text-white/20" />
                  </div>
                )}
                <div className="absolute top-6 right-6">
                  <span className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-xl ${isGold ? 'bg-brand-gold text-black' : 'bg-white text-brand-blue'}`}>
                    {isGold ? t.pricing.badges.luxe : (language === 'fr' ? 'Premium' : (language === 'ar' ? 'ممتاز' : 'Premium'))}
                  </span>
                </div>
              </div>
            </div>

            {/* Content Side */}
            <div className={`w-full lg:w-1/2 reveal ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              <h1 className={`text-4xl md:text-6xl font-black mb-6 uppercase italic tracking-tighter leading-none ${isGold ? 'text-brand-gold' : 'text-zinc-900'}`}>
                {title}
              </h1>
              
              <div className="flex items-baseline gap-2 mb-10">
                <span className="text-6xl font-black tracking-tighter text-zinc-900">{service.price}</span>
                <div className="flex flex-col leading-none">
                  <span className="text-lg font-bold text-zinc-400 uppercase">DH</span>
                  <span className="text-xs text-zinc-500 font-medium uppercase tracking-widest">{t.pricing.perWash}</span>
                </div>
              </div>

              <div className="mb-10 bg-zinc-50 rounded-3xl p-8 border border-zinc-100">
                <h3 className="text-xl font-bold mb-6 uppercase tracking-widest text-zinc-900">
                  {language === 'fr' ? 'Inclus dans ce service:' : (language === 'ar' ? 'يشمل هذا الخدمة:' : 'Included in this service:')}
                </h3>
                <ul className="space-y-4">
                  {features.map((feature, fIdx) => (
                    <li key={fIdx} className={`flex items-start gap-3 text-lg text-zinc-600 font-medium ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                      <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${isGold ? 'bg-brand-gold' : 'bg-brand-blue'}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href={`/booking?serviceId=${service.id}`} className="block w-full sm:w-auto">
                <button className={`w-full px-12 py-6 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-2xl flex items-center justify-center gap-3 ${
                  isGold 
                  ? 'bg-brand-gold text-black hover:bg-zinc-900 hover:text-brand-gold shadow-brand-gold/20' 
                  : 'bg-brand-blue text-white hover:bg-zinc-900 shadow-brand-blue/20'
                }`}>
                  {t.nav.book}
                  <ArrowRight size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-16 border-t border-zinc-100 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-3xl font-black tracking-tighter italic mb-8 block text-zinc-900">
            FAMILY <span className="text-brand-blue">LAVAGE</span>
          </span>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-[0.3em]">
            © 2026 FAMILY LAVAGE GROUP. {t.footer.rights}
          </p>
        </div>
      </footer>
    </div>
  );
}
