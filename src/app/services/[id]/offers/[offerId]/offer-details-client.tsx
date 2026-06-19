"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { ServiceRecord, ServiceOfferRecord } from "@/app/admin/services/service-types";
import { ArrowLeft, Car, CheckCircle2, ArrowRight, Loader2, AlertCircle, Clock } from "lucide-react";
import { useProfile } from "@/context/ProfileContext";
import { requestSubscription, getMySubscriptionRequests } from "@/app/actions/subscription";

interface OfferDetailsClientProps {
  service: ServiceRecord | null;
  offer: ServiceOfferRecord | null;
  serviceId: string;
}

export default function OfferDetailsClient({ service, offer, serviceId }: OfferDetailsClientProps) {
  const router = useRouter();
  const { language, dir } = useLanguage();
  const t = translations[language];
  const { profile } = useProfile();
  
  const [requests, setRequests] = useState<any[]>([]);
  const [subscribing, setSubscribing] = useState(false);
  const [subError, setSubError] = useState<string | null>(null);
  const [subSuccess, setSubSuccess] = useState(false);

  const handleSubscribe = async () => {
    if (!service || !offer) return;
    if (!profile) {
      router.push(`/auth/login?redirect=/services/${service.id}/offers/${offer.id}`);
      return;
    }
    setSubscribing(true);
    setSubError(null);

    try {
      const result = await requestSubscription(offer.id);
      if (result.success) {
        setSubSuccess(true);
      } else {
        const errorKey = result.error || "subscription.errors.general";
        const errorMsg = errorKey.split('.').reduce((obj: any, key: string) => obj?.[key], t) as string || t.subscription.errors.general;
        setSubError(errorMsg);
      }
    } catch {
      setSubError(t.subscription.errors.general);
    } finally {
      setSubscribing(false);
    }
  };

  useEffect(() => {
    if (profile) {
      getMySubscriptionRequests().then(data => setRequests(data));
    }
  }, [profile]);

  if (!service || !offer) {
    return (
      <div className="min-h-screen bg-white text-zinc-950 font-sans" dir={dir}>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-4">
            {t.services.offerNotFound}
          </h1>
          <button onClick={() => router.push(`/services/${serviceId}`)} className="text-brand-blue font-bold flex items-center gap-2">
            <ArrowLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
            {t.services.backBtn}
          </button>
        </div>
      </div>
    );
  }

  const offerTitle = language === 'fr' ? offer.title_fr : (language === 'ar' ? offer.title_ar : offer.title_en);
  const offerFeatures = language === 'fr' ? offer.features_fr : (language === 'ar' ? offer.features_ar : offer.features_en);
  const isPremiumOffer = !!offerTitle?.toLowerCase().includes('vip');
  
  const displayPhoto = offer.photo || service.photo;

  const activeReq = requests.find(r => r.status === 'active' && r.plan === offer.plan_type && r.amount === offer.price);
  const hasActive = !!activeReq;
  const hasPending = requests.some(r => r.status === 'pending' && r.plan === offer.plan_type && r.amount === offer.price);

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-950 font-sans overflow-x-hidden">
      <Navbar />

      <main className="flex-grow pt-32 pb-32 bg-zinc-50/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <Link 
            href={`/services/${service.id}`} 
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-brand-blue font-bold uppercase tracking-widest text-xs mb-10 transition-colors"
          >
            <ArrowLeft size={16} className={dir === 'rtl' ? 'rotate-180' : ''} />
            {t.booking.backOffers}
          </Link>

          <div className={`flex flex-col lg:flex-row gap-12 lg:gap-20 ${dir === 'rtl' ? 'lg:flex-row-reverse text-right' : 'text-left'}`}>
            
            {/* Image Column */}
            <div className="w-full lg:w-1/2 relative group">
              {isPremiumOffer && (
                <div className="absolute -inset-4 bg-gradient-to-br from-brand-gold/25 to-yellow-500/5 rounded-[3.5rem] blur-2xl opacity-100 transition-opacity duration-700 pointer-events-none" />
              )}
              <div className={`relative aspect-square md:aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl border ${
                isPremiumOffer 
                  ? 'border-brand-gold/30 shadow-brand-gold/10' 
                  : 'border-zinc-100 shadow-zinc-200/50'
              }`}>
                {displayPhoto ? (
                  <Image 
                    src={displayPhoto as string} 
                    alt={offerTitle || "Offer image"} 
                    fill 
                    unoptimized={true}
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200">
                    <Car className="w-24 h-24 text-zinc-300" />
                  </div>
                )}
                {isPremiumOffer && (
                  <div className={`absolute top-6 ${dir === 'rtl' ? 'left-6' : 'right-6'} px-4 py-2 bg-brand-gold text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-brand-gold/30 animate-pulse`}>
                    {t.pricing.badges.mostChosen}
                  </div>
                )}
              </div>
            </div>

            {/* Content Column */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              <div className="mb-4">
                <h1 className={`text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-tight mb-6 ${
                  isPremiumOffer 
                    ? 'bg-gradient-to-r from-brand-gold via-brand-gold-light to-yellow-600 bg-clip-text text-transparent' 
                    : 'text-zinc-900'
                }`}>
                  {offerTitle}
                </h1>
                
                <div className="flex items-baseline gap-2 mb-10">
                  <span className={`text-6xl font-black tracking-tighter ${isPremiumOffer ? 'text-brand-gold' : 'text-zinc-900'}`}>{offer.price}</span>
                  <div className="flex flex-col leading-none">
                    <span className="text-sm font-bold text-zinc-400 uppercase">DH</span>
                    {offer.category === 'subscription' && (
                      <span className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isPremiumOffer ? 'text-brand-gold' : 'text-brand-blue'}`}>
                        {offer.washes_count} {t.services.washes} {offer.plan_type === 'monthly' ? t.pricing.perMonth : t.pricing.perYear}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-12">
                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-6">
                  {t.services.whatIsIncluded}
                </h2>
                <ul className="space-y-4">
                  {Array.isArray(offerFeatures) && offerFeatures.map((f: string, i: number) => (
                    <li key={i} className={`flex items-start gap-4 text-lg text-zinc-700 font-medium ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                      <CheckCircle2 size={24} className={`shrink-0 mt-0.5 ${isPremiumOffer ? 'text-brand-gold animate-pulse' : 'text-brand-blue'}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto pt-8 border-t border-zinc-100">
                {subError && (
                  <div className={`mb-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <AlertCircle size={18} className="shrink-0" />
                    <p>{subError}</p>
                  </div>
                )}
                {!service.active ? (
                  <div className={`w-full p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <AlertCircle size={18} className="shrink-0 animate-pulse" />
                    <p>{t.booking.notAvailable}</p>
                  </div>
                ) : offer.category === 'subscription' ? (
                  <div className="flex flex-col gap-4">
                    {hasActive && activeReq && (
                      <div className="mb-2 p-6 rounded-[2rem] bg-green-500/10 border border-green-500/20 flex flex-col gap-4 text-left">
                        <div className={`flex justify-between items-center ${dir === 'rtl' ? 'flex-row-reverse text-right' : 'text-left'}`}>
                          <span className="text-xs font-black uppercase tracking-widest text-green-600">{t.subscription.washesRemaining || "Lavages restants :"}</span>
                          <span className="text-lg font-black text-green-600 bg-green-500/25 px-4 py-1 rounded-xl">{activeReq.washes_remaining ?? 0}</span>
                        </div>
                        
                        <div className="h-px w-full bg-green-500/10" />
                        
                        <div className="space-y-3">
                          <div className={`flex justify-between items-center text-xs ${dir === 'rtl' ? 'flex-row-reverse text-right' : 'text-left'}`}>
                            <span className="font-bold text-zinc-500 uppercase tracking-wider">{language === 'fr' ? 'Débuté le' : language === 'ar' ? 'بدأ في' : 'Started on'}</span>
                            <span className="font-bold text-zinc-700">{new Date(activeReq.updated || activeReq.created).toLocaleDateString(language === 'fr' ? 'fr-FR' : (language === 'ar' ? 'ar-MA' : 'en-US'))}</span>
                          </div>
                          {activeReq.expiry_date && (
                            <div className={`flex justify-between items-center text-xs ${dir === 'rtl' ? 'flex-row-reverse text-right' : 'text-left'}`}>
                              <span className="font-bold text-zinc-500 uppercase tracking-wider">{t.subscription.expiresOn || "Expire le :"}</span>
                              <span className="font-bold text-zinc-700">{new Date(activeReq.expiry_date).toLocaleDateString(language === 'fr' ? 'fr-FR' : (language === 'ar' ? 'ar-MA' : 'en-US'))}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <button 
                      onClick={handleSubscribe}
                      disabled={subscribing || subSuccess || hasActive || hasPending}
                      className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-3 group shadow-xl ${
                        hasActive
                        ? 'bg-green-500 text-white shadow-green-500/20 hover:bg-green-600'
                        : (hasPending || subSuccess)
                          ? 'bg-amber-500 text-white shadow-amber-500/20 hover:bg-amber-600'
                          : isPremiumOffer 
                            ? 'bg-brand-gold text-black shadow-brand-gold/20 hover:bg-zinc-900 hover:text-brand-gold hover:-translate-y-1' 
                            : 'bg-brand-blue text-white shadow-brand-blue/20 hover:bg-zinc-900 hover:-translate-y-1'
                      } disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed`}
                    >
                      {subscribing && !hasActive && !hasPending && !subSuccess ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : hasActive ? (
                        <><CheckCircle2 size={20} /> {t.subscription.activeSubscription}</>
                      ) : (hasPending || subSuccess) ? (
                        <><Clock size={20} /> {t.subscription.requestPending}</>
                      ) : (
                        t.subscription.requestBtn
                      )}
                      {!subscribing && !subSuccess && !hasActive && !hasPending && <ArrowRight size={20} className={`transition-transform ${dir === 'rtl' ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />}
                    </button>
                    {hasActive && (
                      <Link 
                        href={`/booking?serviceId=${service.id}&offerId=${offer.id}`} 
                        className="block"
                      >
                        <button className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-3 group shadow-xl hover:-translate-y-1 ${
                          isPremiumOffer 
                          ? 'bg-brand-gold text-black shadow-brand-gold/20 hover:bg-zinc-900 hover:text-brand-gold' 
                          : 'bg-brand-blue text-white shadow-brand-blue/20 hover:bg-zinc-900'
                        }`}>
                          {t.booking.reserve}
                          <ArrowRight size={20} className={`transition-transform ${dir === 'rtl' ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                        </button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <Link 
                    href={`/booking?serviceId=${service.id}&offerId=${offer.id}`} 
                    className="block"
                  >
                    <button className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-3 group shadow-xl hover:-translate-y-1 ${
                      isPremiumOffer 
                      ? 'bg-brand-gold text-black shadow-brand-gold/20 hover:bg-zinc-900 hover:text-brand-gold' 
                      : 'bg-brand-blue text-white shadow-brand-blue/20 hover:bg-zinc-900'
                    }`}>
                      {t.nav.book}
                      <ArrowRight size={20} className={`transition-transform ${dir === 'rtl' ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                    </button>
                  </Link>
                )}
                
                {offer.category === 'once' && (
                  <p className="mt-4 text-center text-xs text-zinc-400 font-medium leading-relaxed">
                    {t.services.bookNowPayOnSite}
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-16 border-t border-zinc-100 bg-zinc-50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-3xl font-black tracking-tighter italic mb-6 block text-zinc-900">
            FAMILY <span className="text-brand-blue">LAVAGE</span>
          </span>
          <div className="flex gap-4 mb-8 justify-center">
            <a
              href="https://web.facebook.com/profile.php?id=61590637385270"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:border-brand-blue hover:text-brand-blue hover:bg-brand-blue/5 transition-all cursor-pointer group"
              title="Facebook"
            >
              <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
              </svg>
            </a>
            <a
              href="https://www.instagram.com/familylavagegroup/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:border-brand-blue hover:text-brand-blue hover:bg-brand-blue/5 transition-all cursor-pointer group"
              title="Instagram"
            >
              <svg className="w-4.5 h-4.5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@family.lavage.group"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:border-brand-blue hover:text-brand-blue hover:bg-brand-blue/5 transition-all cursor-pointer group"
              title="TikTok"
            >
              <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.63 4.14 1.04.99 2.45 1.53 3.9 1.6v3.82c-1.52-.07-3.03-.66-4.22-1.63a8.878 8.878 0 0 1-.89-.86v6.62c.04 3.75-2.61 7.15-6.31 7.82-3.83.82-7.85-1.51-8.77-5.32-.98-3.79 1.25-7.85 5.03-8.87.89-.25 1.83-.3 2.75-.15v3.83a4.99 4.99 0 0 0-3.87 4.88c-.04 2.8 2.37 5.08 5.17 4.96 2.65-.05 4.75-2.26 4.7-4.91V0h.01z"></path>
              </svg>
            </a>
          </div>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-[0.3em]">
            © 2026 FAMILY LAVAGE GROUP. {t.footer.rights}
          </p>
        </div>
      </footer>
    </div>
  );
}
