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
import { ArrowLeft, Car, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

export default function ServiceDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { language, dir } = useLanguage();
  const t = translations[language];
  
  const [service, setService] = useState<ServiceRecord | null>(null);
  const [allServices, setAllServices] = useState<ServiceRecord[]>([]);
  const [offers, setOffers] = useState<ServiceOfferRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    Promise.all([getServices(), getServiceOffers(id)])
      .then(([servicesData, offersData]) => {
        setAllServices(servicesData);
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

  const galleryImages = [];
  if (service?.photo) galleryImages.push(service.photo);
  if (service?.gallery && service.gallery.length > 0) galleryImages.push(...service.gallery);

  const handlePrevImage = () => {
    setCurrentImageIdx((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIdx((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (galleryImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIdx((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [galleryImages.length, currentImageIdx]);

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

  if (!service) {
    return (
      <div className="min-h-screen bg-white text-zinc-950 font-sans" dir={dir}>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-4">
            {language === 'fr' ? 'Service Introuvable' : (language === 'ar' ? 'الخدمة غير موجودة' : 'Service Not Found')}
          </h1>
          <button onClick={() => router.push('/services')} className="text-brand-blue font-bold flex items-center gap-2">
            <ArrowLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
            {language === 'fr' ? 'Retour aux services' : (language === 'ar' ? 'العودة إلى الخدمات' : 'Back to services')}
          </button>
        </div>
      </div>
    );
  }

  const title = language === 'fr' ? service.title_fr : (language === 'ar' ? service.title_ar : service.title_en);
  const desc = language === 'fr' ? service.description_fr : (language === 'ar' ? service.description_ar : service.description_en);
  const isGold = title?.toLowerCase().includes('vip');

  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans overflow-x-hidden selection:bg-brand-blue selection:text-white">
      <Navbar />

      <section className="relative pt-40 pb-24 overflow-hidden bg-white">
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-zinc-50 to-white" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Link href="/services" className="inline-flex items-center gap-2 text-zinc-500 hover:text-brand-blue font-bold uppercase tracking-widest text-xs mb-12 transition-colors">
            <ArrowLeft size={16} className={dir === 'rtl' ? 'rotate-180' : ''} />
            {language === 'fr' ? 'Retour aux services' : (language === 'ar' ? 'العودة إلى الخدمات' : 'Back to services')}
          </Link>

          {service.booking_type === "has_children" ? (
            <div className="reveal">
              <div className={`text-center mb-16 ${dir === 'rtl' ? 'md:text-right' : 'md:text-left'}`}>
                <h1 className={`text-4xl md:text-6xl font-black mb-6 uppercase italic tracking-tighter leading-none ${isGold ? 'bg-gradient-to-r from-brand-gold to-brand-gold-light bg-clip-text text-transparent' : 'text-zinc-900'}`}>
                  {title}
                </h1>
                <p className="text-zinc-500 font-medium text-lg">
                  {language === 'fr' ? 'Choisissez une option ci-dessous' : (language === 'ar' ? 'اختر خياراً أدناه' : 'Choose an option below')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {allServices.filter(s => s.parent_service === service.id).map((sub, idx) => {
                  const subTitle = language === 'fr' ? sub.title_fr : (language === 'ar' ? sub.title_ar : sub.title_en);
                  const isSubGold = subTitle?.toLowerCase().includes('vip');

                  return (
                    <div 
                      key={sub.id} 
                      className="flex flex-col reveal group cursor-pointer h-full"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <Link 
                        href={`/services/${sub.id}`} 
                        className={`card-premium block h-full relative p-3 rounded-[2rem] transition-all duration-500 overflow-hidden ${
                          isSubGold 
                          ? 'bg-zinc-950 shadow-xl hover:shadow-2xl hover:shadow-brand-gold/20 ring-1 ring-white/10 hover:ring-brand-gold/50' 
                          : 'bg-white shadow-sm hover:shadow-2xl hover:shadow-brand-blue/10 ring-1 ring-zinc-200/60 hover:ring-brand-blue/30'
                        }`}
                      >
                        {isSubGold && (
                          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />
                        )}

                        <div className="relative aspect-video rounded-[1.5rem] overflow-hidden mb-6 bg-zinc-100">
                          {sub.photo ? (
                            <>
                              <Image 
                                src={sub.photo} 
                                alt={subTitle} 
                                fill 
                                unoptimized={true}
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                            </>
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${isSubGold ? 'from-zinc-800 to-zinc-900' : 'from-zinc-100 to-zinc-200'}`}>
                              <Car className={`w-16 h-16 ${isSubGold ? 'text-white/10' : 'text-zinc-300'}`} />
                            </div>
                          )}
                        </div>

                        <div className={`relative z-10 flex flex-col flex-grow px-4 pb-4 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                          <h2 className={`text-2xl font-black mb-2 uppercase italic tracking-tight line-clamp-2 transition-colors duration-300 ${isSubGold ? 'text-white group-hover:text-brand-gold' : 'text-zinc-900 group-hover:text-brand-blue'}`}>
                            {subTitle}
                          </h2>
                          
                          <div className="mt-auto pt-6">
                            <div className={`w-full px-6 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${
                              isSubGold 
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
                })}
              </div>
            </div>
          ) : (
            <>
              <div className={`flex flex-col lg:flex-row gap-16 items-center mb-24 ${dir === 'rtl' ? 'lg:flex-row-reverse' : ''}`}>
                {/* Image Side */}
                <div className="w-full lg:w-1/2 relative group reveal">
                  <div className={`absolute -inset-4 bg-gradient-to-br ${isGold ? 'from-brand-gold/30 to-yellow-500/10' : 'from-brand-blue/30 to-teal-500/10'} rounded-[3rem] blur-2xl opacity-100 transition-opacity duration-700`} />
                  <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-zinc-200 shadow-2xl shadow-zinc-200/50">
                    {galleryImages.length > 0 ? (
                      <>
                        {galleryImages.map((src, idx) => (
                          <Image 
                            key={src}
                            src={src} 
                            alt={`${title || "Service image"} ${idx + 1}`} 
                            fill 
                            unoptimized={true}
                            className={`object-cover transition-opacity duration-1000 ease-in-out absolute inset-0 ${
                              idx === currentImageIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                          />
                        ))}
                        {galleryImages.length > 1 && (
                          <>
                            <button 
                              onClick={handlePrevImage}
                              className={`absolute top-1/2 -translate-y-1/2 ${dir === 'rtl' ? 'right-4' : 'left-4'} w-10 h-10 rounded-full bg-white/80 backdrop-blur border border-white text-zinc-900 flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-lg z-20`}
                            >
                              <ChevronLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
                            </button>
                            <button 
                              onClick={handleNextImage}
                              className={`absolute top-1/2 -translate-y-1/2 ${dir === 'rtl' ? 'left-4' : 'right-4'} w-10 h-10 rounded-full bg-white/80 backdrop-blur border border-white text-zinc-900 flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-lg z-20`}
                            >
                              <ChevronRight size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
                            </button>
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md z-20">
                              {galleryImages.map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => setCurrentImageIdx(i)}
                                  className={`w-2 h-2 rounded-full transition-all ${i === currentImageIdx ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${isGold ? 'from-zinc-900 to-zinc-800' : 'from-brand-blue to-teal-600'}`}>
                        <Car className="w-24 h-24 text-white/20" />
                      </div>
                    )}
                    <div className="absolute top-6 right-6 z-20">
                      <span className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-xl ${isGold ? 'bg-brand-gold text-black' : 'bg-white text-brand-blue'}`}>
                        {isGold ? t.pricing.badges.luxe : (language === 'fr' ? 'Premium' : (language === 'ar' ? 'ممتاز' : 'Premium'))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Side */}
                <div className={`w-full lg:w-1/2 reveal ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                  <h1 className={`text-4xl md:text-6xl font-black mb-6 uppercase italic tracking-tighter leading-none ${isGold ? 'bg-gradient-to-r from-brand-gold to-brand-gold-light bg-clip-text text-transparent' : 'text-zinc-900'}`}>
                    {title}
                  </h1>

                  {service.booking_type === "direct" && !!service.price && service.price > 0 && (
                    <div className="mb-8">
                      <div className="inline-flex items-center gap-3 px-6 py-3 bg-zinc-950 rounded-2xl shadow-xl shadow-zinc-900/10 border border-zinc-800">
                        <span className="text-3xl font-black text-white tracking-tighter">{service.price}</span>
                        <span className="text-sm font-black text-brand-blue uppercase tracking-widest">DH</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-10 bg-zinc-50 rounded-3xl p-8 border border-zinc-100 shadow-sm">
                    <p className="text-lg text-zinc-600 font-medium leading-relaxed">
                      {desc}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => {
                        if (service.booking_type === "direct") {
                          router.push(`/booking?serviceId=${service.id}`);
                        } else {
                          document.getElementById('offers-section')?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className={`w-full sm:w-auto px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl flex items-center justify-center gap-3 ${
                      isGold 
                      ? 'bg-brand-gold text-black hover:bg-zinc-900 hover:text-brand-gold shadow-brand-gold/20' 
                      : 'bg-brand-blue text-white hover:bg-zinc-900 shadow-brand-blue/20'
                    }`}>
                      {service.booking_type === "direct" 
                        ? (language === 'fr' ? 'Réserver' : (language === 'ar' ? 'احجز' : 'Reserve'))
                        : (language === 'fr' ? 'Voir les Offres' : (language === 'ar' ? 'عرض العروض' : 'View Offers'))
                      }
                      <ArrowRight size={20} className={dir === 'rtl' ? 'rotate-180' : 'rotate-90'} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Offers Section */}
              {service.booking_type === "has_offers" && (
                <div id="offers-section" className="pt-12 reveal">
                  <div className={`text-center mb-16 ${dir === 'rtl' ? 'md:text-right' : 'md:text-left'}`}>
                    <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-4 text-zinc-900">
                      {language === 'fr' ? 'Offres Disponibles' : (language === 'ar' ? 'العروض المتاحة' : 'Available Offers')}
                    </h2>
                    <p className="text-zinc-500 font-medium text-lg">
                      {language === 'fr' ? 'Sélectionnez une offre pour voir les détails.' : (language === 'ar' ? 'اختر عرضاً لرؤية التفاصيل.' : 'Select an offer to view details.')}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {offers.map((offer) => {
                        const offerTitle = language === 'fr' ? offer.title_fr : (language === 'ar' ? offer.title_ar : offer.title_en);
                        const isPremiumOffer = offer.price >= 500;
                        
                        return (
                          <Link 
                            href={`/services/${service.id}/offers/${offer.id}`}
                            key={offer.id}
                            className={`card-premium cursor-pointer flex flex-col relative bg-white rounded-[2.5rem] border-2 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden group ${
                              isPremiumOffer 
                              ? 'border-brand-gold/20 hover:border-brand-gold shadow-brand-gold/10' 
                              : 'border-zinc-100 hover:border-brand-blue shadow-brand-blue/5'
                            } ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                          >
                            {/* Image Thumbnail */}
                            <div className="relative h-48 w-full bg-zinc-100">
                              {offer.photo || service.photo ? (
                                <Image 
                                  src={(offer.photo || service.photo) as string} 
                                  alt={offerTitle} 
                                  fill 
                                  unoptimized={true}
                                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                              ) : (
                                <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${isPremiumOffer ? 'from-zinc-900 to-zinc-800' : 'from-brand-blue to-teal-600'}`}>
                                  <Car className="w-16 h-16 text-white/20 group-hover:scale-110 transition-transform duration-500" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 to-transparent" />
                              {isPremiumOffer && (
                                <div className={`absolute top-4 ${dir === 'rtl' ? 'left-4' : 'right-4'} px-3 py-1 bg-brand-gold text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg`}>
                                  {t.pricing.badges.mostChosen}
                                </div>
                              )}
                            </div>
                            
                            {/* Title & Action Hint */}
                            <div className="p-6 bg-white">
                              <h3 className={`text-xl font-black uppercase italic tracking-tight mb-4 group-hover:text-brand-blue transition-colors duration-300 ${isPremiumOffer ? 'text-brand-gold' : 'text-zinc-900'}`}>
                                {offerTitle}
                              </h3>
                              <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 group-hover:text-brand-blue transition-colors ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                <span>{language === 'fr' ? 'Voir les détails' : (language === 'ar' ? 'عرض التفاصيل' : 'View Details')}</span>
                                <ArrowRight size={14} className={`transition-transform ${dir === 'rtl' ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      
      {/* Footer */}
      <footer className="py-16 border-t border-zinc-100 bg-zinc-50 mt-auto relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-blue/15 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-3xl font-black tracking-tighter italic mb-8 block text-zinc-900">
            FAMILY <span className="bg-gradient-to-r from-brand-blue to-teal-500 bg-clip-text text-transparent">LAVAGE</span>
          </span>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-[0.3em]">
            © 2026 FAMILY LAVAGE GROUP. {t.footer.rights}
          </p>
        </div>
      </footer>
    </div>
  );
}
