"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { getServices } from "../admin/services/service-actions";
import { ServiceRecord } from "../admin/services/service-types";
import { 
  ArrowRight, 
  CheckCircle2, 
  Car
} from "lucide-react";

export default function ServicesPage() {
  const { language, dir } = useLanguage();
  const t = translations[language];
  const [dbServices, setDbServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServices()
      .then((data) => {
        console.log("Client-side Services Data:", data);
        setDbServices(data.filter(s => s.active));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 font-sans overflow-x-hidden selection:bg-brand-blue selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-8 overflow-hidden bg-white border-b border-zinc-100">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Decorative Gradients */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-400/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={`max-w-5xl mx-auto text-center reveal`}>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-4 leading-[1.1]">
              {t.services.title}{' '}
              <span className="bg-gradient-to-r from-brand-blue to-teal-500 bg-clip-text text-transparent">
                {t.services.titleAccent}
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-500 leading-relaxed max-w-2xl mx-auto">
              {t.services.desc}
            </p>
          </div>
        </div>
      </section>

      {/* Main Services Grid */}
      <section className="pt-8 pb-24 bg-zinc-50 relative">
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#d4d4d8_0.5px,transparent_0.5px)] bg-[size:24px_24px] opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-32">
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 border-4 border-zinc-200 rounded-full" />
                  <div className="absolute inset-0 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
                  <Car className="absolute inset-0 m-auto w-6 h-6 text-brand-blue animate-pulse" />
                </div>
                <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm animate-pulse">
                  {language === 'fr' ? 'Chargement des services...' : (language === 'ar' ? 'جاري تحميل الخدمات...' : 'Loading services...')}
                </p>
              </div>
            ) : dbServices.length > 0 ? (
              dbServices.map((service, idx) => {
                const title = language === 'fr' ? service.title_fr : (language === 'ar' ? service.title_ar : service.title_en);
                
                // Check if the title contains the word "VIP" (case-insensitive)
                const isGold = title?.toLowerCase().includes('vip');

                return (
                  <div 
                    key={service.id} 
                    className="flex flex-col reveal group cursor-pointer h-full"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <Link 
                      href={`/services/${service.id}`} 
                      className={`card-premium block h-full relative p-3 rounded-[2rem] transition-all duration-500 overflow-hidden ${
                        isGold 
                        ? 'bg-zinc-950 shadow-xl hover:shadow-2xl hover:shadow-brand-gold/20 ring-1 ring-white/10 hover:ring-brand-gold/50' 
                        : 'bg-white shadow-sm hover:shadow-2xl hover:shadow-brand-blue/10 ring-1 ring-zinc-200/60 hover:ring-brand-blue/30'
                      }`}
                    >
                      {/* Inner Glow for Gold */}
                      {isGold && (
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />
                      )}

                      {/* Image Area */}
                      <div className="relative aspect-video rounded-[1.5rem] overflow-hidden mb-6 bg-zinc-100">
                        {service.photo ? (
                          <>
                            <Image 
                              src={service.photo} 
                              alt={title} 
                              fill 
                              unoptimized={true}
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* Subtle dark overlay to make badges pop */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                          </>
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${isGold ? 'from-zinc-800 to-zinc-900' : 'from-zinc-100 to-zinc-200'}`}>
                            <Car className={`w-16 h-16 ${isGold ? 'text-white/10' : 'text-zinc-300'}`} />
                          </div>
                        )}

                        {/* Badges */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg backdrop-blur-md ${
                            isGold 
                            ? 'bg-brand-gold/90 text-black' 
                            : 'bg-white/90 text-brand-blue'
                          }`}>
                            {isGold ? t.pricing.badges.luxe : (language === 'fr' ? 'Premium' : (language === 'ar' ? 'ممتاز' : 'Premium'))}
                          </span>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className={`relative z-10 flex flex-col flex-grow px-4 pb-4 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                        <h2 className={`text-2xl font-black mb-2 uppercase italic tracking-tight line-clamp-2 transition-colors duration-300 ${isGold ? 'text-white group-hover:text-brand-gold' : 'text-zinc-900 group-hover:text-brand-blue'}`}>
                          {title}
                        </h2>
                        
                        <div className="mt-auto pt-6">
                          <div className={`w-full px-6 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${
                            isGold 
                            ? 'bg-brand-gold/10 text-brand-gold group-hover:bg-brand-gold group-hover:text-black' 
                            : 'bg-zinc-50 text-brand-blue group-hover:bg-brand-blue group-hover:text-white ring-1 ring-zinc-100 group-hover:ring-brand-blue group-hover:shadow-lg group-hover:shadow-brand-blue/20'
                          }`}>
                            {language === 'fr' ? 'Voir Détails' : (language === 'ar' ? 'عرض التفاصيل' : 'View Details')}
                            <ArrowRight size={16} className={`transition-transform group-hover:translate-x-1 ${dir === 'rtl' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-24 bg-white rounded-[3rem] border border-zinc-200 shadow-sm">
                <Car className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">
                  {language === 'fr' ? 'Aucun service disponible pour le moment.' : (language === 'ar' ? 'لا توجد خدمات متاحة في الوقت الحالي.' : 'No services available at the moment.')}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Subscription CTA */}
      <section className="py-24 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[3rem] bg-gradient-to-br from-brand-blue via-blue-700 to-blue-800 overflow-hidden group reveal shadow-2xl shadow-brand-blue/20 noise-overlay">
            {/* Dynamic Background Elements */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/15 rounded-full blur-[80px]" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-400/25 rounded-full blur-[80px]" />
            
            <div className={`relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 p-12 md:p-16 lg:p-20 ${dir === 'rtl' ? 'lg:flex-row-reverse text-right' : 'text-left'}`}>
              <div className="max-w-2xl">
                <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 text-white text-xs font-black tracking-widest uppercase mb-6 backdrop-blur-md border border-white/20">
                  {language === 'fr' ? 'Abonnement VIP' : (language === 'ar' ? 'اشتراك VIP' : 'VIP Subscription')}
                </span>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase italic tracking-tighter leading-[1.1] mb-6">
                  {t.pricing.title} <br />
                  <span className="text-blue-200">{t.pricing.titleAccent}</span>
                </h2>
                <p className="text-white/80 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
                  {t.pricing.desc}
                </p>
              </div>
              <Link href="/subscribe" className="w-full lg:w-auto shrink-0">
                <button className="w-full lg:w-auto px-10 py-5 bg-white text-brand-blue font-black uppercase tracking-[0.2em] text-sm rounded-2xl hover:bg-zinc-50 hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3">
                  {t.pricing.ctas.subscribe}
                  <CheckCircle2 size={20} className="text-brand-blue" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-zinc-100 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-blue/15 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-black tracking-tighter italic text-zinc-900">
              FAMILY <span className="bg-gradient-to-r from-brand-blue to-teal-500 bg-clip-text text-transparent">LAVAGE</span>
            </span>
          </Link>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} FAMILY LAVAGE GROUP. {t.footer.rights}
          </p>
        </div>
      </footer>
    </div>
  );
}