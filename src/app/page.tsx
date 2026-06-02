"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Car, Sparkles, MapPin, Clock, Droplets, ShieldCheck, Zap, Star, MessageCircle, Phone, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { getServices } from "./admin/services/service-actions";
import { ServiceRecord } from "./admin/services/service-types";
import { useState, useEffect } from "react";

export default function Home() {
  const { language, dir } = useLanguage();
  const t = translations[language];
  const [dbServices, setDbServices] = useState<ServiceRecord[]>([]);

  useEffect(() => {
    getServices().then(setDbServices).catch(console.error);
  }, []);



  // Map all DB services to the new format
  const activeServices = dbServices
    .filter(s => s.active)
    .map(s => {
      const name = language === 'fr' ? s.title_fr : (language === 'ar' ? s.title_ar : s.title_en);
      const desc = language === 'fr' ? s.description_fr : (language === 'ar' ? s.description_ar : s.description_en);

      return {
        id: s.id,
        name,
        desc,
        photo: s.photo,
        link: `/services/${s.id}`
      };
    })
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans overflow-x-hidden">
      <Navbar />

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/212600000000"
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed bottom-8 ${dir === 'rtl' ? 'left-8' : 'right-8'} z-[60] bg-[#25D366] p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group animate-float`}
        style={{ boxShadow: '0 8px 30px rgba(37, 211, 102, 0.35)' }}
      >
        <MessageCircle className="text-white w-7 h-7" />
        <span className={`absolute ${dir === 'rtl' ? 'left-full ml-4' : 'right-full mr-4'} top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-zinc-200/50 shadow-xl text-zinc-900`}>
          {language === 'fr' ? 'Contactez-nous' : (language === 'ar' ? 'تواصل معنا' : 'Contact Us')}
        </span>
      </a>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-28 overflow-hidden">
        {/* Animated gradient blobs */}
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-brand-blue/15 to-teal-400/10 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-gradient-to-tl from-brand-gold/10 to-amber-200/5 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '4s' }} />
        
        {/* Subtle dot grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_0.8px,transparent_0.8px)] bg-[size:32px_32px] opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <div className={`flex flex-col reveal delay-100 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter leading-[1.1] md:leading-[1] mb-6 uppercase">
                {t.hero.title} <br />
                <span className="bg-gradient-to-r from-brand-blue to-teal-500 bg-clip-text text-transparent italic">{t.hero.titleAccent}</span>
              </h1>

              <p className="text-lg md:text-xl text-zinc-500 mb-8 max-w-xl leading-relaxed">
                {t.hero.desc} <span className="text-zinc-900 font-semibold">{t.hero.descAccent}</span>.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 mb-16">
                <Link href={dbServices[0] ? `/booking?serviceId=${dbServices[0].id}` : "/booking"}>
                  <button className="btn-primary group w-full sm:w-auto">
                    {t.hero.btnSimple}
                    <div className="w-1.5 h-1.5 rounded-full bg-white ml-3 opacity-50 group-hover:scale-150 transition-transform" />
                  </button>
                </Link>
                <Link href="/services">
                  <button className="btn-outline-gold group gap-3 w-full sm:w-auto">
                    {t.hero.btnVip}
                    <ArrowRight size={18} className={`${dir === 'rtl' ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'} transition-transform`} />
                  </button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-zinc-200/60">
                <div className="flex flex-col group">
                  <span className="text-2xl md:text-3xl font-black bg-gradient-to-r from-brand-blue to-brand-blue-light bg-clip-text text-transparent group-hover:scale-105 transition-transform origin-left inline-block">- 15m</span>
                  <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-bold">{t.hero.stats.fast}</span>
                </div>
                <div className="flex flex-col group">
                  <span className="text-2xl md:text-3xl font-black text-zinc-900 italic scale-y-90 origin-left group-hover:scale-105 transition-transform inline-block">PRO</span>
                  <span className="text-[10px] md:text-xs text-zinc-400 uppercase tracking-widest font-bold">{t.hero.stats.quality}</span>
                </div>
                <div className="flex flex-col group">
                  <span className="text-2xl md:text-3xl font-black bg-gradient-to-r from-brand-gold to-brand-gold-light bg-clip-text text-transparent group-hover:scale-105 transition-transform origin-left inline-block">VIP</span>
                  <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-bold">{t.hero.stats.private}</span>
                </div>
              </div>
            </div>

            <div className="relative group reveal delay-300">
              {/* Animated gradient border */}
              <div 
                className="absolute -inset-[2px] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{
                  background: 'linear-gradient(135deg, #0070f3, #14b8a6, #c5a059, #0070f3)',
                  backgroundSize: '300% 300%',
                  animation: 'gradient-shift 4s ease-in-out infinite',
                }}
              />
              {/* Outer glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-brand-blue/10 to-brand-gold/10 rounded-[2rem] blur-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-700" />
              
              <div className="relative aspect-square md:aspect-[5/4] rounded-3xl overflow-hidden border border-zinc-200/80 shadow-2xl shadow-zinc-200/50 max-h-[450px] bg-zinc-100">
                <Image
                  src="/home-hero.png"
                  alt="Family Lavage Casablanca"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 via-transparent to-transparent " />

                <div className={`absolute bottom-8 ${dir === 'rtl' ? 'right-8 left-auto' : 'left-8 right-auto'} p-6 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-xl`} style={{ background: 'rgba(0,0,0,0.5)' }}>
                  <div className={`flex items-center gap-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-blue to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-blue/30">
                      <Star className="text-white w-6 h-6 fill-current" />
                    </div>
                    <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                      <p className="font-black text-white uppercase text-xs tracking-[0.2em] mb-1">{t.hero.guarantee}</p>
                      <p className="text-zinc-400 text-xs italic font-medium">{t.hero.subGuarantee}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>




      {/* Dynamic Services Section */}
      <section id="services-catalog" className="py-32 bg-zinc-50 relative">
        {/* Subtle texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#d4d4d8_0.5px,transparent_0.5px)] bg-[size:24px_24px] opacity-30 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="reveal">
            <h2 className="section-heading">
              {t.services.title} <span className="bg-gradient-to-r from-brand-blue to-teal-500 bg-clip-text text-transparent italic">{t.services.titleAccent}</span>
            </h2>
            <p className="text-zinc-500 mb-20 max-w-2xl mx-auto">{t.services.desc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeServices.map((plan, idx) => (
              <div
                key={idx}
                className="card-premium relative flex flex-col p-3 rounded-[2rem] bg-white border border-zinc-200/70 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-brand-blue/8 hover:border-brand-blue/30 reveal group"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                {plan.photo && (
                  <div className="w-full h-48 rounded-[1.5rem] overflow-hidden mb-6 relative bg-zinc-100">
                    <img src={plan.photo} alt={plan.name} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                )}
                
                <div className="px-3 pb-3 flex flex-col flex-grow">
                  <h3 className="text-2xl font-black mb-4 uppercase tracking-tight italic text-zinc-900 group-hover:text-brand-blue transition-colors duration-300">{plan.name}</h3>
                  
                  <p className="text-zinc-500 text-sm flex-grow mb-8 text-left line-clamp-3">
                    {plan.desc}
                  </p>

                  <Link href={plan.link} className="w-full mt-auto">
                    <button className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all bg-zinc-50 text-brand-blue ring-1 ring-zinc-100 group-hover:bg-brand-blue group-hover:text-white group-hover:ring-brand-blue group-hover:shadow-lg group-hover:shadow-brand-blue/20 active:scale-95">
                      {t.services.viewPricing}
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA / Location Section */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-12 md:p-20 rounded-[3rem] bg-gradient-to-br from-brand-blue via-blue-700 to-teal-900 overflow-hidden relative group reveal noise-overlay">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/20 rounded-full blur-[80px] -ml-10 -mb-10" />

            <div className={`relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              <div>
                <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-[1.1] mb-8">
                  {t.contact.title} <br />
                  <span className="text-black/80">{t.contact.titleAccent}</span>
                </h2>
                <div className="space-y-5">
                  <div className={`flex items-center gap-4 text-white/90 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <MapPin className="text-white w-5 h-5" />
                    </div>
                    <span className="font-bold">{t.contact.location}</span>
                  </div>
                  <div className={`flex items-center gap-4 text-white/90 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <Clock className="text-white w-5 h-5" />
                    </div>
                    <span className="font-bold">{t.contact.open}</span>
                  </div>
                  <div className={`flex items-center gap-4 text-white/90 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <Phone className="text-white w-5 h-5" />
                    </div>
                    <span className="font-bold">+212 600-000000</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <button className="w-full py-6 bg-black/90 text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-black transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-xl">
                  {t.contact.map} <MapPin size={20} />
                </button>
                <div className="flex items-center justify-center gap-4 text-xs font-black uppercase tracking-widest text-white/40 text-center">
                  <span className="w-12 h-px bg-white/15 hidden sm:block" />
                  {t.contact.noAppt}
                  <span className="w-12 h-px bg-white/15 hidden sm:block" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-zinc-100 bg-white relative">
        {/* Subtle gradient line at top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-blue/20 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
            <div className="md:col-span-2 reveal">
              <span className={`text-4xl font-black tracking-tighter italic mb-6 block text-zinc-900`}>
                FAMILY <span className="bg-gradient-to-r from-brand-blue to-teal-500 bg-clip-text text-transparent">LAVAGE</span>
              </span>
              <p className="text-zinc-500 max-w-sm mb-8">
                {t.footer.desc}
              </p>
              <div className={`flex gap-4 ${dir === 'rtl' ? 'justify-end' : ''}`}>
                <div className="w-11 h-11 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:border-brand-blue hover:text-brand-blue hover:bg-brand-blue/5 transition-all cursor-pointer group">
                  <span className="text-xs font-bold">IG</span>
                </div>
                <div className="w-11 h-11 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:border-brand-blue hover:text-brand-blue hover:bg-brand-blue/5 transition-all cursor-pointer group">
                  <span className="text-xs font-bold">FB</span>
                </div>
              </div>
            </div>

            <div className="reveal delay-100">
              <h4 className="font-black uppercase tracking-widest text-xs mb-8 text-zinc-900">{t.footer.menu}</h4>
              <ul className="space-y-4 text-sm text-zinc-500 font-medium">
                <li><Link href="#services" className="hover:text-brand-blue transition-colors">{t.nav.services}</Link></li>
                <li><Link href="#subscriptions" className="hover:text-brand-blue transition-colors">{t.nav.pricing}</Link></li>
              </ul>
            </div>

            <div className="reveal delay-200">
              <h4 className="font-black uppercase tracking-widest text-xs mb-8 text-zinc-900">{t.footer.legal}</h4>
              <ul className="space-y-4 text-sm text-zinc-500 font-medium">
                <li><Link href="#" className="hover:text-brand-blue transition-colors">{t.footer.terms}</Link></li>
                <li><Link href="#" className="hover:text-brand-blue transition-colors">{t.footer.privacy}</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
            <p className="text-zinc-400 text-xs font-medium">
              © 2026 FAMILY LAVAGE GROUP. {t.footer.rights}
            </p>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-zinc-400">
              <span>{language === 'ar' ? 'الدار البيضاء، المغرب' : (language === 'fr' ? 'CASABLANCA, MAROC' : 'CASABLANCA, MOROCCO')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
