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
import { ArrowLeft, Car, CheckCircle2, ArrowRight } from "lucide-react";

export default function OfferDetailsPage() {
  const params = useParams();
  const serviceId = params.id as string;
  const offerId = params.offerId as string;
  const router = useRouter();
  
  const { language, dir } = useLanguage();
  const t = translations[language];
  
  const [service, setService] = useState<ServiceRecord | null>(null);
  const [offer, setOffer] = useState<ServiceOfferRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getServices(), getServiceOffers(serviceId)])
      .then(([servicesData, offersData]) => {
        const foundService = servicesData.find(s => s.id === serviceId);
        if (foundService) setService(foundService);
        
        const foundOffer = offersData.find(o => o.id === offerId && o.active);
        if (foundOffer) setOffer(foundOffer);
        
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [serviceId, offerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-zinc-950 font-sans" dir={dir}>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-zinc-400 font-bold uppercase tracking-widest animate-pulse">
            {language === 'fr' ? 'Chargement...' : (language === 'ar' ? 'جاري التحميل...' : 'Loading...')}
          </p>
        </div>
      </div>
    );
  }

  if (!service || !offer) {
    return (
      <div className="min-h-screen bg-white text-zinc-950 font-sans" dir={dir}>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-4">
            {language === 'fr' ? 'Offre Introuvable' : (language === 'ar' ? 'العرض غير موجود' : 'Offer Not Found')}
          </h1>
          <button onClick={() => router.push(`/services/${serviceId}`)} className="text-brand-blue font-bold flex items-center gap-2">
            <ArrowLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
            {language === 'fr' ? 'Retour' : (language === 'ar' ? 'رجوع' : 'Back')}
          </button>
        </div>
      </div>
    );
  }

  const offerTitle = language === 'fr' ? offer.title_fr : (language === 'ar' ? offer.title_ar : offer.title_en);
  const offerFeatures = language === 'fr' ? offer.features_fr : (language === 'ar' ? offer.features_ar : offer.features_en);
  const isPremiumOffer = offer.price >= 500;
  
  const displayPhoto = offer.photo || service.photo;

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-950 font-sans overflow-x-hidden">
      <Navbar />

      <main className="flex-grow pt-32 pb-32 bg-zinc-50/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <Link 
            href={`/services/${serviceId}`} 
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-brand-blue font-bold uppercase tracking-widest text-xs mb-10 transition-colors"
          >
            <ArrowLeft size={16} className={dir === 'rtl' ? 'rotate-180' : ''} />
            {language === 'fr' ? 'Retour aux offres' : (language === 'ar' ? 'العودة إلى العروض' : 'Back to offers')}
          </Link>

          <div className={`flex flex-col lg:flex-row gap-12 lg:gap-20 ${dir === 'rtl' ? 'lg:flex-row-reverse text-right' : 'text-left'}`}>
            
            {/* Image Column */}
            <div className="w-full lg:w-1/2">
              <div className="relative aspect-square md:aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl shadow-zinc-200/50 border border-zinc-100">
                {displayPhoto ? (
                  <Image 
                    src={displayPhoto as string} 
                    alt={offerTitle} 
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
                  <div className={`absolute top-6 ${dir === 'rtl' ? 'left-6' : 'right-6'} px-4 py-2 bg-brand-gold text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg`}>
                    {t.pricing.badges.mostChosen}
                  </div>
                )}
              </div>
            </div>

            {/* Content Column */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              <div className="mb-4">
                <h1 className={`text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-tight mb-6 ${isPremiumOffer ? 'text-brand-gold' : 'text-zinc-900'}`}>
                  {offerTitle}
                </h1>
                
                <div className="flex items-baseline gap-2 mb-10">
                  <span className="text-6xl font-black tracking-tighter text-zinc-900">{offer.price}</span>
                  <div className="flex flex-col leading-none">
                    <span className="text-sm font-bold text-zinc-400 uppercase">DH</span>
                    {offer.category === 'subscription' && (
                      <span className="text-[10px] text-brand-blue font-black uppercase tracking-widest mt-1">
                        {offer.washes_count} {language === 'fr' ? 'LAVAGES' : (language === 'ar' ? 'غسلات' : 'WASHES')} {offer.plan_type === 'monthly' ? t.pricing.perMonth : t.pricing.perYear}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-12">
                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-6">
                  {language === 'fr' ? 'Ce qui est inclus' : (language === 'ar' ? 'ما يتضمنه العرض' : 'What\'s included')}
                </h2>
                <ul className="space-y-4">
                  {Array.isArray(offerFeatures) && offerFeatures.map((f: string, i: number) => (
                    <li key={i} className={`flex items-start gap-4 text-lg text-zinc-700 font-medium ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                      <CheckCircle2 size={24} className={`shrink-0 mt-0.5 ${isPremiumOffer ? 'text-brand-gold' : 'text-brand-blue'}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto pt-8 border-t border-zinc-100">
                <Link 
                  href={offer.category === 'subscription' ? '/subscribe' : `/booking?serviceId=${serviceId}&offerId=${offerId}`} 
                  className="block"
                >
                  <button className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-3 group shadow-xl hover:-translate-y-1 ${
                    isPremiumOffer 
                    ? 'bg-brand-gold text-black shadow-brand-gold/20 hover:bg-zinc-900 hover:text-brand-gold' 
                    : 'bg-brand-blue text-white shadow-brand-blue/20 hover:bg-zinc-900'
                  }`}>
                    {offer.category === 'subscription' ? t.subscription.requestBtn : t.nav.book}
                    <ArrowRight size={20} className={`transition-transform ${dir === 'rtl' ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                  </button>
                </Link>
                
                {offer.category === 'once' && (
                  <p className="mt-4 text-center text-xs text-zinc-400 font-medium leading-relaxed">
                    {language === 'fr' 
                      ? 'Réservez maintenant, payez sur place.' 
                      : (language === 'ar' ? 'احجز الآن، وادفع في عين المكان.' : 'Book now, pay on site.')}
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
