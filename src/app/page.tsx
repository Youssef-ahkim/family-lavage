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
      >
        <MessageCircle className="text-white w-7 h-7" />
        <span className={`absolute ${dir === 'rtl' ? 'left-full ml-4' : 'right-full mr-4'} top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-zinc-200 shadow-xl text-zinc-900`}>
          {language === 'fr' ? 'Contactez-nous' : (language === 'ar' ? 'تواصل معنا' : 'Contact Us')}
        </span>
      </a>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-28 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-blue/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-brand-gold/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <div className={`flex flex-col reveal delay-100 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter leading-[1.1] md:leading-[1] mb-6 uppercase">
                {t.hero.title} <br />
                <span className="text-brand-blue italic">{t.hero.titleAccent}</span>
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

              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-zinc-200">
                <div className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-black text-brand-blue">- 15m</span>
                  <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-bold">{t.hero.stats.fast}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-black text-zinc-900 italic scale-y-90 origin-left">PRO</span>
                  <span className="text-[10px] md:text-xs text-zinc-400 uppercase tracking-widest font-bold">{t.hero.stats.quality}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-black text-brand-gold">VIP</span>
                  <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-bold">{t.hero.stats.private}</span>
                </div>
              </div>
            </div>

            <div className="relative group reveal delay-300">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-blue/20 to-brand-gold/20 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <div className="relative aspect-square md:aspect-[5/4] rounded-3xl overflow-hidden border border-zinc-200 shadow-2xl shadow-zinc-200 glass max-h-[450px]">
                <Image
                  src="/home-hero.png"
                  alt="Family Lavage Casablanca"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/40 via-transparent to-transparent " />

                <div className={`absolute bottom-8 ${dir === 'rtl' ? 'right-8 left-auto' : 'left-8 right-auto'} p-6 glass-dark rounded-3xl border border-white/20 shadow-2xl backdrop-blur-xl`}>
                  <div className={`flex items-center gap-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <div className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center shadow-lg shadow-brand-blue/30 animate-pulse">
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
      <section id="services-catalog" className="py-32 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="reveal">
            <h2 className="section-heading">
              {t.services.title} <span className="text-brand-blue italic">{t.services.titleAccent}</span>
            </h2>
            <p className="text-zinc-500 mb-20 max-w-2xl mx-auto">{t.services.desc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeServices.map((plan, idx) => (
              <div
                key={idx}
                className="relative flex flex-col p-8 rounded-[2rem] bg-white border border-zinc-200 transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl hover:shadow-brand-blue/10 hover:border-brand-blue reveal"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                {plan.photo && (
                  <div className="w-full h-48 rounded-2xl overflow-hidden mb-6 relative">
                    <img src={plan.photo} alt={plan.name} className="object-cover w-full h-full hover:scale-110 transition-transform duration-700" />
                  </div>
                )}
                
                <h3 className="text-2xl font-black mb-4 uppercase tracking-tight italic text-zinc-900">{plan.name}</h3>
                
                <p className="text-zinc-500 text-sm flex-grow mb-8 text-left line-clamp-3">
                  {plan.desc}
                </p>

                <Link href={plan.link} className="w-full mt-auto">
                  <button className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all bg-brand-blue text-white hover:bg-brand-blue/80 hover:scale-105 active:scale-95">
                    {t.services.viewPricing}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA / Location Section */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-12 md:p-20 rounded-[3rem] bg-gradient-to-br from-brand-blue to-teal-900 overflow-hidden relative group reveal">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000" />

            <div className={`relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              <div>
                <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-[1.1] mb-8">
                  {t.contact.title} <br />
                  <span className="text-black">{t.contact.titleAccent}</span>
                </h2>
                <div className="space-y-4">
                  <div className={`flex items-center gap-3 text-white/90 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <MapPin className="text-white fill-white/20" />
                    <span className="font-bold">{t.contact.location}</span>
                  </div>
                  <div className={`flex items-center gap-3 text-white/90 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <Clock className="text-white fill-white/20" />
                    <span className="font-bold">{t.contact.open}</span>
                  </div>
                  <div className={`flex items-center gap-3 text-white/90 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <Phone className="text-white fill-white/20" />
                    <span className="font-bold">+212 600-000000</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <button className="w-full py-6 bg-black text-white font-black uppercase tracking-[0.2em] rounded-3xl hover:bg-zinc-900 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
                  {t.contact.map} <MapPin size={20} />
                </button>
                <div className="flex items-center justify-center gap-4 text-xs font-black uppercase tracking-widest text-white/50 text-center">
                  <span className="w-8 h-px bg-white/20 hidden sm:block" />
                  {t.contact.noAppt}
                  <span className="w-8 h-px bg-white/20 hidden sm:block" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-zinc-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
            <div className="md:col-span-2 reveal">
              <span className={`text-4xl font-black tracking-tighter italic mb-6 block text-zinc-900`}>
                FAMILY <span className="text-brand-blue">LAVAGE</span>
              </span>
              <p className="text-zinc-500 max-w-sm mb-8">
                {t.footer.desc}
              </p>
              <div className={`flex gap-4 ${dir === 'rtl' ? 'justify-end' : ''}`}>
                <div className="w-11 h-11 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:border-brand-blue hover:text-brand-blue transition-all cursor-pointer group">
                  <span className="text-xs font-bold">IG</span>
                </div>
                <div className="w-11 h-11 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:border-brand-blue hover:text-brand-blue transition-all cursor-pointer group">
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
