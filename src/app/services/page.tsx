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
  Droplets, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Star, 
  CheckCircle2, 
  Clock, 
  Shield,
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
        setDbServices(data.filter(s => s.active && s.category !== 'subscription'));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const staticBenefits = [
    {
      title: t.services.items[0].title,
      desc: t.services.items[0].desc,
      icon: <Droplets className="w-8 h-8 text-brand-blue" />,
    },
    {
      title: t.services.items[1].title,
      desc: t.services.items[1].desc,
      icon: <Zap className="w-8 h-8 text-brand-blue" />,
    },
    {
      title: t.services.items[2].title,
      desc: t.services.items[2].desc,
      icon: <Sparkles className="w-8 h-8 text-brand-blue" />,
    },
    {
      title: t.services.items[3].title,
      desc: t.services.items[3].desc,
      icon: <ShieldCheck className="w-8 h-8 text-brand-blue" />,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden bg-zinc-50">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-blue/5 rounded-bl-[20rem] -mr-40 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={`max-w-3xl reveal ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-6 leading-tight">
              {t.services.title} <span className="text-brand-blue">{t.services.titleAccent}</span>
            </h1>
            <p className="text-xl text-zinc-500 mb-8 leading-relaxed max-w-2xl">
              {t.services.desc}
            </p>

          </div>
        </div>
      </section>

      {/* Main Services Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-zinc-400 font-bold uppercase tracking-widest animate-pulse">Chargement des services...</p>
              </div>
            ) : dbServices.length > 0 ? (
              dbServices.map((service, idx) => {
                const title = language === 'fr' ? service.title_fr : (language === 'ar' ? service.title_ar : service.title_en);
                const features = language === 'fr' ? service.features_fr : (language === 'ar' ? service.features_ar : service.features_en);
                const isEven = idx % 2 === 0;
                const isGold = service.price >= 500;

                return (
                  <div 
                    key={service.id} 
                    className={`flex flex-col lg:flex-row gap-12 items-center reveal ${isEven ? '' : 'lg:flex-row-reverse'}`}
                    style={{ animationDelay: `${idx * 200}ms` }}
                  >
                    {/* Image Side */}
                    <div className="w-full lg:w-1/2 relative group">
                      <div className={`absolute -inset-4 bg-gradient-to-br ${isGold ? 'from-brand-gold/20 to-yellow-500/10' : 'from-brand-blue/20 to-teal-500/10'} rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                      <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-zinc-200 shadow-2xl shadow-zinc-200/50">
                        {service.photo ? (
                          <Image 
                            src={service.photo} 
                            alt={title} 
                            fill 
                            unoptimized={true}
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
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
                    <div className={`w-full lg:w-1/2 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                      <h2 className={`text-3xl md:text-5xl font-black mb-6 uppercase italic tracking-tighter ${isGold ? 'text-brand-gold' : 'text-zinc-900'}`}>
                        {title}
                      </h2>
                      
                      <div className="flex items-baseline gap-2 mb-8">
                        <span className="text-5xl font-black tracking-tighter text-zinc-900">{service.price}</span>
                        <div className="flex flex-col leading-none">
                          <span className="text-sm font-bold text-zinc-400 uppercase">DH</span>
                          <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">{t.pricing.perWash}</span>
                        </div>
                      </div>

                      <ul className="space-y-4 mb-10">
                        {features.map((feature, fIdx) => (
                          <li key={fIdx} className={`flex items-start gap-3 text-lg text-zinc-600 font-medium ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                            <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${isGold ? 'bg-brand-gold' : 'bg-brand-blue'}`} />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Link href={`/booking?serviceId=${service.id}`} className="inline-block w-full sm:w-auto">
                        <button className={`w-full sm:w-auto px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl flex items-center justify-center gap-3 ${
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
                );
              })
            ) : (
              <div className="text-center py-20 bg-zinc-50 rounded-[3rem] border-2 border-dashed border-zinc-200">
                <p className="text-zinc-400 font-bold uppercase tracking-widest">Aucun service disponible pour le moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us / Quality Standards */}
      <section className="py-32 bg-zinc-950 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-blue rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-gold rounded-full blur-[150px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24 reveal">
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-6">
              {language === 'fr' ? 'NOS STANDARDS DE' : (language === 'ar' ? 'معايير' : 'OUR STANDARDS OF')} <span className="text-brand-blue">QUALITÉ.</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              {language === 'fr' ? 'Chaque véhicule est traité avec le plus grand soin en utilisant des technologies de pointe.' : 
               language === 'ar' ? 'تتم معاملة كل مركبة بأقصى قدر من العناية باستخدام أحدث التقنيات.' : 
               'Every vehicle is treated with the utmost care using state-of-the-art technologies.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {staticBenefits.map((benefit, idx) => (
              <div 
                key={idx} 
                className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-brand-blue/50 transition-all duration-500 group reveal"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="mb-8 w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-blue/20 transition-all">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">{benefit.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription CTA */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative p-12 md:p-20 rounded-[4rem] bg-brand-blue overflow-hidden group reveal">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full blur-[80px] -ml-20 -mb-20" />
            
            <div className={`relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 ${dir === 'rtl' ? 'lg:flex-row-reverse text-right' : 'text-left'}`}>
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-8">
                  {t.pricing.title} <br />
                  <span className="text-black">{t.pricing.titleAccent}</span>
                </h2>
                <p className="text-white/80 text-xl font-medium">
                  {t.pricing.desc}
                </p>
              </div>
              <Link href="/subscribe">
                <button className="px-12 py-6 bg-black text-white font-black uppercase tracking-[0.2em] rounded-3xl hover:bg-zinc-900 hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-3">
                  {t.pricing.ctas.subscribe}
                  <CheckCircle2 size={24} />
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
