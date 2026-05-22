"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { getServices, getServiceOffers } from "@/app/admin/services/service-actions";
import { ServiceRecord, ServiceOfferRecord } from "@/app/admin/services/service-types";
import { ArrowLeft, Car, ArrowRight, CheckCircle2, ShieldCheck, Zap, Sparkles } from "lucide-react";

export default function ServiceDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { language, dir } = useLanguage();
  const t = translations[language];
  
  const [service, setService] = useState<ServiceRecord | null>(null);
  const [offers, setOffers] = useState<ServiceOfferRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getServices(), getServiceOffers(id)])
      .then(([servicesData, offersData]) => {
        const found = servicesData.find(s => s.id === id);
        if (found) {
          setService(found);
        }
        setOffers(offersData.filter(o => o.active));
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
  const desc = language === 'fr' ? service.description_fr : (language === 'ar' ? service.description_ar : service.description_en);
  const isGold = title?.toLowerCase().includes('vip');

  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans overflow-x-hidden">
      <Navbar />

      <section className="relative pt-40 pb-24 overflow-hidden bg-white">
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-zinc-50 to-white" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Link href="/services" className="inline-flex items-center gap-2 text-zinc-500 hover:text-brand-blue font-bold uppercase tracking-widest text-xs mb-12 transition-colors">
            <ArrowLeft size={16} className={dir === 'rtl' ? 'rotate-180' : ''} />
            {language === 'fr' ? 'Retour aux services' : (language === 'ar' ? 'العودة إلى الخدمات' : 'Back to services')}
          </Link>

          <div className={`flex flex-col lg:flex-row gap-16 items-center mb-24 ${dir === 'rtl' ? 'lg:flex-row-reverse' : ''}`}>
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
              
              <div className="mb-10 bg-zinc-50 rounded-3xl p-8 border border-zinc-100 shadow-sm">
                <p className="text-lg text-zinc-600 font-medium leading-relaxed">
                  {desc}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => document.getElementById('offers-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className={`w-full sm:w-auto px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl flex items-center justify-center gap-3 ${
                  isGold 
                  ? 'bg-brand-gold text-black hover:bg-zinc-900 hover:text-brand-gold shadow-brand-gold/20' 
                  : 'bg-brand-blue text-white hover:bg-zinc-900 shadow-brand-blue/20'
                }`}>
                  {language === 'fr' ? 'Voir les Offres' : (language === 'ar' ? 'عرض العروض' : 'View Offers')}
                  <ArrowRight size={20} className={dir === 'rtl' ? 'rotate-180' : 'rotate-90'} />
                </button>
              </div>
            </div>
          </div>

          {/* Offers Section */}
          <div id="offers-section" className="pt-12 reveal">
            <div className={`text-center mb-16 ${dir === 'rtl' ? 'md:text-right' : 'md:text-left'}`}>
              <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-4 text-zinc-900">
                {language === 'fr' ? 'Offres Disponibles' : (language === 'ar' ? 'العروض المتاحة' : 'Available Offers')}
              </h2>
              <p className="text-zinc-500 font-medium text-lg">
                {language === 'fr' ? 'Sélectionnez l\'offre qui vous convient le mieux.' : (language === 'ar' ? 'اختر العرض الذي يناسبك.' : 'Select the offer that suits you best.')}
              </p>
            </div>

            {offers.length === 0 ? (
              <div className="bg-zinc-50 p-12 rounded-[3rem] text-center border border-zinc-100">
                <Sparkles className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                <p className="text-zinc-500 font-bold uppercase tracking-widest">
                  {language === 'fr' ? 'Aucune offre pour le moment' : (language === 'ar' ? 'لا توجد عروض حاليا' : 'No offers available at the moment')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {offers.map((offer) => {
                  const offerTitle = language === 'fr' ? offer.title_fr : (language === 'ar' ? offer.title_ar : offer.title_en);
                  const offerFeatures = language === 'fr' ? offer.features_fr : (language === 'ar' ? offer.features_ar : offer.features_en);
                  const isPremiumOffer = offer.price >= 500;
                  
                  return (
                    <div 
                      key={offer.id}
                      className={`flex flex-col relative bg-white p-8 rounded-[2.5rem] border-2 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group ${
                        isPremiumOffer 
                        ? 'border-brand-gold/20 hover:border-brand-gold shadow-brand-gold/10' 
                        : 'border-zinc-100 hover:border-brand-blue shadow-brand-blue/5'
                      } ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                    >
                      {isPremiumOffer && (
                        <div className={`absolute -top-4 ${dir === 'rtl' ? 'left-8' : 'right-8'} px-4 py-1.5 bg-brand-gold text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg`}>
                          {t.pricing.badges.mostChosen}
                        </div>
                      )}
                      
                      <h3 className={`text-2xl font-black uppercase italic tracking-tight mb-6 ${isPremiumOffer ? 'text-brand-gold' : 'text-zinc-900'}`}>
                        {offerTitle}
                      </h3>
                      
                      <div className="flex items-baseline gap-2 mb-8">
                        <span className="text-5xl font-black tracking-tighter text-zinc-900">{offer.price}</span>
                        <div className="flex flex-col leading-none">
                          <span className="text-sm font-bold text-zinc-400 uppercase">DH</span>
                          {offer.category === 'subscription' && (
                            <span className="text-[10px] text-brand-blue font-black uppercase tracking-widest mt-1">
                              {offer.washes_count} {language === 'fr' ? 'LAVAGES' : (language === 'ar' ? 'غسلات' : 'WASHES')} {offer.plan_type === 'monthly' ? t.pricing.perMonth : t.pricing.perYear}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex-grow">
                        <ul className="space-y-4 mb-8">
                          {Array.isArray(offerFeatures) && offerFeatures.map((f: string, i: number) => (
                            <li key={i} className={`flex items-start gap-3 text-sm text-zinc-600 font-medium ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                              <CheckCircle2 size={16} className={`shrink-0 mt-0.5 ${isPremiumOffer ? 'text-brand-gold' : 'text-brand-blue'}`} />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Link 
                        href={offer.category === 'subscription' ? '/subscribe' : `/booking?serviceId=${service.id}&offerId=${offer.id}`} 
                        className="mt-auto block"
                      >
                        <button className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-95 ${
                          isPremiumOffer 
                          ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20 hover:bg-zinc-900 hover:text-brand-gold' 
                          : 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20 hover:bg-zinc-900'
                        }`}>
                          {offer.category === 'subscription' ? t.subscription.requestBtn : t.nav.book}
                          <ArrowRight size={16} className={`transition-transform ${dir === 'rtl' ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                        </button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-16 border-t border-zinc-100 bg-zinc-50 mt-auto">
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
