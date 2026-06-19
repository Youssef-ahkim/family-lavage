"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import PwaInstall from "@/components/PwaInstall";
import { Car, MapPin, Clock, MessageCircle, Phone, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { getServices } from "./admin/services/service-actions";
import { ServiceRecord } from "./admin/services/service-types";
import { useState, useEffect } from "react";

// ─── Side Hero ───────────────────────────────────────────────────────────────
function OrbitalHero({
  services,
  language,
  dir,
  t,
  dbServices,
}: {
  services: ServiceRecord[];
  language: string;
  dir: string;
  t: any;
  dbServices: ServiceRecord[];
}) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const capped = services.slice(0, 6);
  const half = Math.ceil(capped.length / 2);
  const leftServices  = capped.slice(0, half);
  const rightServices = capped.slice(half);

  return (
    <div className="relative w-full flex flex-col items-center">

      {/* ── Phrase on Top (Dynamic & Premium) ── */}
      <div className="text-center mb-4 md:mb-12 max-w-5xl px-4 reveal">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase italic tracking-tighter leading-[1.15] mb-4">
          {language === 'ar' ? (
            <>
              أفضل غسيل سيارات متنقل <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-brand-blue to-teal-500 bg-clip-text text-transparent">عند باب بيتك</span>
            </>
          ) : language === 'fr' ? (
            <>
              Le Meilleur Lavage Auto <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-brand-blue to-teal-500 bg-clip-text text-transparent">Mobile à Domicile</span>
            </>
          ) : (
            <>
              The Best Mobile Car Wash <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-brand-blue to-teal-500 bg-clip-text text-transparent">At Your Doorstep</span>
            </>
          )}
        </h1>
        <p className="text-zinc-500 text-xs md:text-sm font-medium max-w-2xl mx-auto leading-relaxed">
          {language === 'ar' ? 'نأتي إليك أينما كنت في مراكش بأحدث الأجهزة والمنتجات الاحترافية لتبدو سيارتك كالجديدة.'
            : language === 'fr' ? 'Nous venons à vous partout à Marrakech avec nos équipements pro pour rendre votre voiture comme neuve.'
            : 'We come to you anywhere in Marrakech with our pro equipment to make your car look brand new.'}
        </p>
      </div>

      {/* ── Desktop: 3-column layout ── */}
      <div className="hidden md:flex items-center justify-center gap-12 w-full max-w-7xl px-8">

        {/* LEFT column */}
        <div className="flex flex-col gap-5 items-end flex-1">
          {leftServices.map((service, idx) => {
            const title =
              language === 'fr' ? service.title_fr
              : language === 'ar' ? service.title_ar
              : service.title_en;
            const globalIdx = idx;
            const isActive = activeIdx === globalIdx;
            return (
              <ServiceBubble
                key={service.id}
                service={service}
                title={title}
                isActive={isActive}
                onHover={() => setActiveIdx(globalIdx)}
                onLeave={() => setActiveIdx(null)}
                onClick={() => setActiveIdx(isActive ? null : globalIdx)}
                size={170}
                tooltipSide="left"
              />
            );
          })}
        </div>

        {/* CENTER: guy — no box, no container */}
        <div className="relative flex-shrink-0" style={{ width: 320, height: 420 }}>
          <Image
            src="/home-page-guy.png"
            alt="Family Lavage"
            fill
            sizes="320px"
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>

        {/* RIGHT column */}
        <div className="flex flex-col gap-5 items-start flex-1">
          {rightServices.map((service, idx) => {
            const title =
              language === 'fr' ? service.title_fr
              : language === 'ar' ? service.title_ar
              : service.title_en;
            const globalIdx = half + idx;
            const isActive = activeIdx === globalIdx;
            return (
              <ServiceBubble
                key={service.id}
                service={service}
                title={title}
                isActive={isActive}
                onHover={() => setActiveIdx(globalIdx)}
                onLeave={() => setActiveIdx(null)}
                onClick={() => setActiveIdx(isActive ? null : globalIdx)}
                size={170}
                tooltipSide="right"
              />
            );
          })}
        </div>
      </div>

      {/* ── Mobile: left / center guy / right ── */}
      <div className="flex md:hidden w-full px-1 justify-center items-center gap-1.5" style={{ minHeight: 180 }}>

        {/* LEFT column — centered vertically */}
        <div className="flex flex-col gap-3 items-end justify-center w-[120px]">
          {leftServices.map((service, idx) => {
            const title =
              language === 'fr' ? service.title_fr
              : language === 'ar' ? service.title_ar
              : service.title_en;
            const globalIdx = idx;
            const isActive = activeIdx === globalIdx;
            return (
              <ServiceBubble
                key={service.id}
                service={service}
                title={title}
                isActive={isActive}
                onHover={() => setActiveIdx(globalIdx)}
                onLeave={() => setActiveIdx(null)}
                onClick={() => setActiveIdx(isActive ? null : globalIdx)}
                size={65}
                tooltipSide="left"
              />
            );
          })}
        </div>

        {/* CENTER: guy — smaller, no box */}
        <div className="relative flex-shrink-0 self-center" style={{ width: 100, height: 160 }}>
          <Image
            src="/home-page-guy.png"
            alt="Family Lavage"
            fill
            sizes="100px"
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>

        {/* RIGHT column — centered vertically */}
        <div className="flex flex-col gap-3 items-start justify-center w-[120px]">
          {rightServices.map((service, idx) => {
            const title =
              language === 'fr' ? service.title_fr
              : language === 'ar' ? service.title_ar
              : service.title_en;
            const globalIdx = half + idx;
            const isActive = activeIdx === globalIdx;
            return (
              <ServiceBubble
                key={service.id}
                service={service}
                title={title}
                isActive={isActive}
                onHover={() => setActiveIdx(globalIdx)}
                onLeave={() => setActiveIdx(null)}
                onClick={() => setActiveIdx(isActive ? null : globalIdx)}
                size={65}
                tooltipSide="right"
              />
            );
          })}
        </div>
      </div>

      {/* Mobile CTA buttons */}
      <div className="flex md:hidden flex-col gap-3 w-full max-w-xs px-4 mt-5">
        <Link href={dbServices[0] ? `/booking?serviceId=${dbServices[0].id}` : '/booking'}>
          <button className="btn-primary w-full">{t.hero.btnSimple}</button>
        </Link>
        <Link href="/services">
          <button className="btn-outline-gold w-full gap-2">{t.hero.btnVip} <ArrowRight size={16} /></button>
        </Link>
      </div>

      {/* ── CTA buttons desktop ── */}
      <div className="hidden md:flex flex-col items-center gap-4 mt-10 reveal">
        <div className="flex gap-5">
          <Link href={dbServices[0] ? `/booking?serviceId=${dbServices[0].id}` : '/booking'}>
            <button className="btn-primary group">
              {t.hero.btnSimple}
              <div className="w-1.5 h-1.5 rounded-full bg-white ml-3 opacity-50 group-hover:scale-150 transition-transform" />
            </button>
          </Link>
          <Link href="/services">
            <button className="btn-outline-gold group gap-3">
              {t.hero.btnVip}
              <ArrowRight size={18} className={`${dir === 'rtl' ? 'rotate-180' : ''} transition-transform`} />
            </button>
          </Link>
        </div>
        {/* Tagline */}
        <p className="text-zinc-400 text-sm font-medium tracking-wide">
          {language === 'fr' ? '✨ On se déplace partout à Marrakech — sans frais de déplacement'
            : language === 'ar' ? '✨ نخدم جميع مناطق مراكش — بدون رسوم تنقل'
            : '✨ We come to you anywhere in Marrakech — no travel fees'}
        </p>
      </div>
    </div>
  );
}

// ─── Service Pill Card (glassmorphism, always shows title) ───────────────────
function ServiceBubble({
  service,
  title,
  isActive,
  onHover,
  onLeave,
  onClick,
  size,
  tooltipSide,
}: {
  service: ServiceRecord;
  title: string | null | undefined;
  isActive: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
  size: number;
  tooltipSide: 'left' | 'right';
}) {
  const imgSize = Math.round(size * 0.45);
  const isMobile = size < 100;

  return (
    <Link
      href={service.active ? `/services/${service.id}` : '#'}
      onClick={(e) => { if (!service.active) e.preventDefault(); onClick(); }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`group flex items-center transition-all duration-300 cursor-pointer select-none border ${
        isMobile ? 'gap-1.5 px-2 py-1.5 rounded-xl' : 'gap-3 px-4 py-3 rounded-2xl'
      } ${
        isActive
          ? 'bg-white/95 border-brand-blue/40 shadow-2xl shadow-brand-blue/15 -translate-y-1'
          : 'bg-white/65 border-white/80 shadow-md shadow-zinc-200/50 hover:bg-white/95 hover:border-brand-blue/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-blue/10'
      }`}
      style={{
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        minWidth: isMobile ? size * 1.4 : size * 1.6,
        maxWidth: isMobile ? size * 2.0 : size * 2.4,
      }}
    >
      {/* Thumbnail */}
      <div
        className="flex-shrink-0 rounded-lg overflow-hidden"
        style={{ width: imgSize, height: imgSize }}
      >
        {service.photo ? (
          <Image
            src={service.photo}
            alt={title || 'Service'}
            width={imgSize}
            height={imgSize}
            unoptimized
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-blue/10 to-teal-400/15 flex items-center justify-center">
            <Car className="w-4 h-4 text-brand-blue/40" />
          </div>
        )}
      </div>

      {/* Title — always visible */}
      <div className="flex-1 min-w-0">
        <p className={`font-black uppercase tracking-wider leading-tight line-clamp-2 transition-colors duration-200 ${
          isMobile ? 'text-[9px]' : 'text-[10px] md:text-[12px]'
        } ${
          isActive ? 'text-brand-blue' : 'text-zinc-700 group-hover:text-brand-blue'
        }`}>
          {title}
        </p>
        <div className={`h-0.5 rounded-full bg-brand-blue transition-all duration-300 ${
          isMobile ? 'mt-1' : 'mt-1.5'
        } ${
          isActive ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-60'
        }`} />
      </div>

      {/* Arrow icon */}
      <ArrowRight
        className={`flex-shrink-0 transition-all duration-300 hidden md:block w-3.5 h-3.5 ${
          isActive ? 'text-brand-blue' : 'text-zinc-300 group-hover:text-brand-blue'
        } ${tooltipSide === 'left' ? 'rotate-180' : ''}`}
      />
    </Link>
  );
}

export default function Home() {
  const { language, dir } = useLanguage();
  const t = translations[language];
  const [dbServices, setDbServices] = useState<ServiceRecord[]>([]);

  useEffect(() => {
    getServices().then(setDbServices).catch(console.error);
  }, []);

  const activeServices = dbServices.filter(s => !s.parent_service);

  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans overflow-x-hidden">
      <Navbar />

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/212655571251"
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
      <section className="relative min-h-screen flex flex-col items-center justify-start pt-20 md:pt-36 pb-12 overflow-hidden">
        {/* Animated gradient blobs */}
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-brand-blue/15 to-teal-400/10 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-gradient-to-tl from-brand-gold/10 to-amber-200/5 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '4s' }} />
        {/* Subtle dot grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_0.8px,transparent_0.8px)] bg-[size:32px_32px] opacity-40 pointer-events-none" />

        <OrbitalHero services={activeServices.slice(0, 6)} language={language} dir={dir} t={t} dbServices={dbServices} />
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
            {activeServices.map((service, idx) => {
              const title = language === 'fr' ? service.title_fr : (language === 'ar' ? service.title_ar : service.title_en);
              const isGold = title?.toLowerCase().includes('vip');

              return (
                <div 
                  key={service.id} 
                  className={`flex flex-col reveal group h-full ${!service.active ? 'opacity-65 grayscale' : 'cursor-pointer'}`}
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <Link 
                    href={service.active ? `/services/${service.id}` : '#'} 
                    onClick={(e) => {
                      if (!service.active) e.preventDefault();
                    }}
                    className={`card-premium block h-full relative p-3 rounded-[2rem] transition-all duration-500 overflow-hidden ${
                      isGold 
                      ? 'bg-zinc-950 shadow-xl hover:shadow-2xl hover:shadow-brand-gold/20 ring-1 ring-white/10 hover:ring-brand-gold/50' 
                      : 'bg-white shadow-sm hover:shadow-2xl hover:shadow-brand-blue/10 ring-1 ring-zinc-200/60 hover:ring-brand-blue/30'
                    } ${service.active ? 'hover:-translate-y-2' : 'cursor-not-allowed'}`}
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
                            alt={title || "Service"} 
                            fill 
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
                      <h3 className={`text-2xl font-black mb-2 uppercase italic tracking-tight line-clamp-2 transition-colors duration-300 ${isGold ? 'text-white group-hover:text-brand-gold' : 'text-zinc-900 group-hover:text-brand-blue'}`}>
                        {title}
                      </h3>
                      
                      <div className="mt-auto pt-6">
                        {!service.active ? (
                          <div className="w-full px-6 py-4 rounded-xl font-black uppercase tracking-widest text-[9px] bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center gap-2">
                            {translations[language].booking.notAvailable}
                          </div>
                        ) : (
                          <div className={`w-full px-6 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${
                            isGold 
                            ? 'bg-brand-gold/10 text-brand-gold group-hover:bg-brand-gold group-hover:text-black' 
                            : 'bg-zinc-50 text-brand-blue group-hover:bg-brand-blue group-hover:text-white ring-1 ring-zinc-100 group-hover:ring-brand-blue group-hover:shadow-lg group-hover:shadow-brand-blue/20'
                          }`}>
                            {language === 'fr' ? 'Voir Détails' : (language === 'ar' ? 'عرض التفاصيل' : 'View Details')}
                            <ArrowRight size={16} className={`transition-transform group-hover:translate-x-1 ${dir === 'rtl' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
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
                  <a 
                    href="tel:+212655571251"
                    className={`flex items-center gap-4 text-white/90 hover:text-white transition-colors ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <Phone className="text-white w-5 h-5" />
                    </div>
                    <span className="font-bold">+212 655-571251</span>
                  </a>
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

      {/* PWA Install Section */}
      <PwaInstall />

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
                <li><Link href="/services" className="hover:text-brand-blue transition-colors">{t.nav.services}</Link></li>
                <li><Link href="/subscribe" className="hover:text-brand-blue transition-colors">{t.nav.pricing}</Link></li>
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
              <span>{language === 'ar' ? 'مراكش، المغرب' : (language === 'fr' ? 'MARRAKECH, MAROC' : 'MARRAKECH, MOROCCO')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
