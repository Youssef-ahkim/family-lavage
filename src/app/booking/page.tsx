"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { useProfile } from "@/context/ProfileContext";
import { translations } from "@/lib/translations";
import { submitBooking, getBookedTimes } from "@/app/actions/booking";
import { getServices, getServiceOffers } from "../admin/services/service-actions";
import { ServiceRecord, ServiceOfferRecord } from "../admin/services/service-types";
import { ChevronLeft, ChevronRight, CheckCircle2, Car, Droplets, Clock, Calendar, User, Phone, ClipboardCheck, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";

const BookingPage = () => {
  const { language, dir } = useLanguage();
  const { fetchProfile, profile: cachedProfile } = useProfile();
  const searchParams = useSearchParams();
  const serviceIdParam = searchParams.get('serviceId');
  const t = translations[language];
  const b = t.booking;

  const [step, setStep] = useState(1);
  const [selectedParentService, setSelectedParentService] = useState<ServiceRecord | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceRecord | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<ServiceOfferRecord | null>(null);
  
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    carModel: "",
    date: "",
    time: "",
  });
  
  const [dbServices, setDbServices] = useState<ServiceRecord[]>([]);
  const [dbOffers, setDbOffers] = useState<ServiceOfferRecord[]>([]);
  
  const [isFetchingServices, setIsFetchingServices] = useState(true);
  const [isFetchingOffers, setIsFetchingOffers] = useState(false);
  
  const [hp, setHp] = useState(""); // Honeypot
  const [startTime] = useState(() => Date.now()); // Load time for anti-spam
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingActive, setIsCheckingActive] = useState(true);

  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [todayDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  useEffect(() => {
    if (!formData.date) {
      const timer = setTimeout(() => setBookedSlots([]), 0);
      return () => clearTimeout(timer);
    }

    const fetchSlots = async () => {
      setIsFetchingSlots(true);
      try {
        const dates = await getBookedTimes(formData.date, selectedService?.id);
        const slots = dates.map(d => {
          const safeDateStr = d.replace(' ', 'T');
          const dateObj = new Date(safeDateStr);
          const hours = dateObj.getHours().toString().padStart(2, '0');
          const minutes = dateObj.getMinutes().toString().padStart(2, '0');
          return `${hours}:${minutes}`;
        });
        setBookedSlots(slots);
      } catch (err) {
        console.error("Error fetching slots:", err);
      } finally {
        setIsFetchingSlots(false);
      }
    };

    fetchSlots();
  }, [formData.date, selectedService?.id]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await fetchProfile();
        if (profile) {
          setFormData(prev => ({
            ...prev,
            fullname: profile.name || prev.fullname,
            phone: profile.phone || prev.phone,
            carModel: profile.plate || prev.carModel,
          }));
        }

        // Removed global hasActiveBooking check to allow multiple different service bookings
      } catch (err) {
        console.error("Error loading profile", err);
      } finally {
        setIsCheckingActive(false);
      }
    };
    loadProfile();

    const fetchServicesData = async () => {
      try {
        const data = await getServices();
        setDbServices(data);
      } catch (err) {
        console.error("Error fetching services:", err);
      } finally {
        setIsFetchingServices(false);
      }
    };
    fetchServicesData();
  }, [fetchProfile]);

  const offerIdParam = searchParams.get('offerId');

  const handleServiceSelect = useCallback(async (service: ServiceRecord, initialOfferId?: string | null) => {
    if (service.booking_type === "has_children") {
      setSelectedParentService(service);
      return;
    }

    setSelectedService(service);
    setSelectedOffer(null);

    if (service.booking_type === "direct") {
      const directOffer: ServiceOfferRecord = {
        id: service.id,
        collectionId: service.collectionId,
        collectionName: service.collectionName,
        created: service.created,
        updated: service.updated,
        category: "once",
        service: service.id,
        title_fr: service.title_fr,
        title_ar: service.title_ar,
        title_en: service.title_en,
        price: service.price ? service.price : -1,
        active: true,
        features_fr: [],
        features_ar: [],
        features_en: [],
      };
      setSelectedOffer(directOffer);
      setStep(2);
      return;
    }

    setIsFetchingOffers(true);
    try {
      const offers = await getServiceOffers(service.id);
      const activeOffers = offers.filter(o => o.active);
      setDbOffers(activeOffers);
      
      if (initialOfferId) {
        const targetOffer = activeOffers.find(o => o.id === initialOfferId);
        if (targetOffer) {
          setSelectedOffer(targetOffer);
          setStep(2);
        }
      }
    } catch (err) {
      console.error("Error fetching offers:", err);
    } finally {
      setIsFetchingOffers(false);
    }
  }, []);

  useEffect(() => {
    if (serviceIdParam && dbServices.length > 0) {
      const exists = dbServices.find(s => s.id === serviceIdParam);
      if (exists && selectedService?.id !== exists.id) {
        const timer = setTimeout(() => {
          handleServiceSelect(exists, offerIdParam);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [serviceIdParam, dbServices, offerIdParam, selectedService?.id, handleServiceSelect]);

  const handleOfferSelect = (offer: ServiceOfferRecord) => {
    setSelectedOffer(offer);
    setStep(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();

    const lastSubmit = localStorage.getItem('last_booking');
    if (lastSubmit && Date.now() - parseInt(lastSubmit) < 60000) {
      setError(t.errors.rateLimit);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bookingDateTime = new Date(`${formData.date}T${formData.time}`);
      const now = new Date();

      if (bookingDateTime < now) {
        setError(t.errors.pastDate);
        setLoading(false);
        return;
      }

      if (!selectedOffer) throw new Error("No offer selected");

      const serviceTitle = language === 'fr' ? selectedService?.title_fr : (language === 'ar' ? selectedService?.title_ar : selectedService?.title_en);
      const offerTitle = language === 'fr' ? selectedOffer.title_fr : (language === 'ar' ? selectedOffer.title_ar : selectedOffer.title_en);
      
      let bookingTitle = offerTitle || "Lavage";
      if (selectedService?.booking_type !== 'direct') {
        bookingTitle = `${serviceTitle} - ${offerTitle}`;
      } else {
        bookingTitle = serviceTitle || "Lavage";
      }

      const isSubWash = selectedOffer.price <= 100 && cachedProfile?.subscription_status === 'active' && (cachedProfile?.washes_remaining || 0) > 0;
      const finalPrice = isSubWash ? 0 : selectedOffer.price;

      const result = await submitBooking({
        full_name: formData.fullname,
        phone: formData.phone,
        plate_number: formData.carModel,
        service_type: bookingTitle,
        service_id: selectedService?.id, // NEW: pass the service ID
        price: finalPrice,
        date: bookingDateTime.toISOString(),
        notes: `Selected service: ${selectedService?.title_en} - ${offerTitle}. Language: ${language}. ${isSubWash ? '(Used Subscription Wash)' : ''}`,
        hp: hp,
        ts: startTime.toString(),
      });

      if (result.success) {
        localStorage.setItem('last_booking', Date.now().toString());

        if (!cachedProfile) {
          const existing = localStorage.getItem('my_booking_ids') || "";
          const bookingId = result.id as string;
          const updated = existing ? `${existing},${bookingId}` : bookingId;
          localStorage.setItem('my_booking_ids', updated);
        }

        setIsSubmitted(true);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error("Booking error:", err);
      const errorKey = (err as Error).message || "errors.general";
      const errorMsg = errorKey.split('.').reduce((obj: unknown, key: string) => (obj as Record<string, unknown>)?.[key], t) as string || t.errors.general;
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingActive) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
      </div>
    );
  }



  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-3xl mx-auto pt-40 px-4 text-center">
          <div className="reveal">
            <div className="w-24 h-24 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <CheckCircle2 className="text-brand-blue w-12 h-12" />
            </div>
            <h1 className="text-4xl font-black mb-4 uppercase italic tracking-tighter">
              {b.success}
            </h1>
            <p className="text-zinc-500 mb-12 text-lg">
              {b.advisorNotice}
            </p>
            <Link href="/" className="btn-primary inline-flex">
              {b.backHome}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans overflow-x-hidden">
      <Navbar />

      <div className="max-w-4xl mx-auto pt-32 pb-24 px-4">
        {/* Header */}
        <div className={`mb-12 reveal ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-4">
            {b.title} <span className="text-brand-blue">{b.titleAccent}</span>
          </h1>
          <p className="text-zinc-500 text-lg">
            {b.subtitle}
          </p>
        </div>

        {/* Subscription Balance Indicator */}
        {cachedProfile?.subscription_status === 'active' && (
          <div className="mb-10 reveal">
            <div className={`p-5 rounded-[2rem] bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-between ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <div className="w-12 h-12 bg-brand-gold rounded-2xl shadow-lg shadow-brand-gold/20 flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-black" />
                </div>
                <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold mb-1">
                    {t.subscription.activeSubscription}
                  </p>
                  <p className="text-xl font-black uppercase italic tracking-tighter">
                    {b.remainingWashes}
                  </p>
                </div>
              </div>
              <div className="bg-white w-14 h-14 rounded-2xl border-2 border-brand-gold/30 flex items-center justify-center shadow-sm">
                <span className="text-3xl font-black text-brand-gold">{cachedProfile.washes_remaining || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-16 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-100 -translate-y-1/2 z-0" />
          {[1, 2, 3].map((s) => (
            <div key={s} className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all duration-500 border-4 ${step >= s ? "bg-brand-blue border-brand-blue/20 text-white" : "bg-white border-zinc-100 text-zinc-300"
                }`}>
                {step > s ? <CheckCircle2 size={20} /> : s}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest mt-3 ${step >= s ? "text-brand-blue" : "text-zinc-400"
                }`}>
                {s === 1 ? b.steps.service : s === 2 ? b.steps.details : b.steps.confirm}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div className="reveal">
            {!selectedParentService && !selectedService && (
              // Show Top-Level Services
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isFetchingServices ? (
                  <div className="col-span-full py-20 flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-brand-blue animate-spin mb-4" />
                    <p className="text-zinc-400 font-bold uppercase tracking-widest">{b.loadingServices}</p>
                  </div>
                ) : dbServices.filter(s => !s.parent_service).map((service) => {
                  const title = language === 'fr' ? service.title_fr : (language === 'ar' ? service.title_ar : service.title_en);
                  const desc = language === 'fr' ? service.description_fr : (language === 'ar' ? service.description_ar : service.description_en);
                  
                  return (
                    <button
                      key={service.id}
                      onClick={() => service.active && handleServiceSelect(service)}
                      disabled={!service.active}
                      className={`relative p-8 rounded-[2rem] border-2 text-left transition-all duration-500 group ${dir === 'rtl' ? 'text-right' : 'text-left'} ${
                        !service.active 
                        ? 'border-zinc-100 bg-zinc-100/40 opacity-60 cursor-not-allowed' 
                        : 'border-zinc-100 bg-zinc-50 hover:border-brand-blue/30'
                      }`}
                    >
                      {service.photo && (
                        <div className="w-full h-32 rounded-2xl overflow-hidden mb-6 relative">
                          <Image src={service.photo} alt={title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                        </div>
                      )}
                      <h3 className="text-2xl font-black uppercase italic tracking-tight mb-2">{title}</h3>
                      <p className="text-zinc-500 text-sm line-clamp-2">{desc}</p>
                      {!service.active ? (
                        <div className={`mt-6 flex items-center gap-2 text-red-500 font-black uppercase tracking-widest text-[9px] ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                          <AlertCircle size={14} className="shrink-0" />
                          {b.notAvailable}
                        </div>
                      ) : (
                        <div className={`mt-6 flex items-center gap-2 text-brand-blue font-bold uppercase tracking-widest text-[10px] ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                          {service.booking_type === "has_children" 
                            ? b.viewOptions
                            : service.booking_type === "direct"
                            ? b.reserve
                            : b.viewOffers
                          }
                          <ChevronRight size={14} className={dir === 'rtl' ? 'rotate-180' : ''} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {selectedParentService && !selectedService && (
              // Show Sub-Services
              <div>
                <button 
                  onClick={() => setSelectedParentService(null)}
                  className={`mb-6 flex items-center gap-2 text-zinc-400 font-bold hover:text-zinc-950 transition-colors ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}
                >
                  <ChevronLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} /> 
                  {b.backServices}
                </button>
                
                <h2 className={`text-2xl font-black uppercase italic mb-8 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                  {b.chooseOption}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dbServices.filter(s => s.parent_service === selectedParentService.id).map((service) => {
                    const title = language === 'fr' ? service.title_fr : (language === 'ar' ? service.title_ar : service.title_en);
                    const desc = language === 'fr' ? service.description_fr : (language === 'ar' ? service.description_ar : service.description_en);
                    
                    return (
                      <button
                        key={service.id}
                        onClick={() => service.active && handleServiceSelect(service)}
                        disabled={!service.active}
                        className={`relative p-8 rounded-[2rem] border-2 text-left transition-all duration-500 group ${dir === 'rtl' ? 'text-right' : 'text-left'} ${
                          !service.active 
                          ? 'border-zinc-100 bg-zinc-100/40 opacity-60 cursor-not-allowed' 
                          : 'border-zinc-100 bg-zinc-50 hover:border-brand-blue/30'
                        }`}
                      >
                        {service.photo && (
                          <div className="w-full h-32 rounded-2xl overflow-hidden mb-6 relative">
                            <Image src={service.photo} alt={title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                          </div>
                        )}
                        <h3 className="text-2xl font-black uppercase italic tracking-tight mb-2">{title}</h3>
                        <p className="text-zinc-500 text-sm line-clamp-2">{desc}</p>
                        {!service.active ? (
                          <div className={`mt-6 flex items-center gap-2 text-red-500 font-black uppercase tracking-widest text-[9px] ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                            <AlertCircle size={14} className="shrink-0" />
                            {b.notAvailable}
                          </div>
                        ) : (
                          <div className={`mt-6 flex items-center gap-2 text-brand-blue font-bold uppercase tracking-widest text-[10px] ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                            {service.booking_type === "direct" ? b.reserve : b.viewOffers}
                            <ChevronRight size={14} className={dir === 'rtl' ? 'rotate-180' : ''} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedService && (
              // Show Offers for Selected Service
              <div>
                <button 
                  onClick={() => setSelectedService(null)}
                  className={`mb-6 flex items-center gap-2 text-zinc-400 font-bold hover:text-zinc-950 transition-colors ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}
                >
                  <ChevronLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} /> 
                  {b.backServices}
                </button>
                
                <h2 className={`text-2xl font-black uppercase italic mb-8 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                  {b.chooseOffer}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {isFetchingOffers ? (
                    <div className="col-span-full py-20 flex flex-col items-center">
                      <Loader2 className="w-10 h-10 text-brand-blue animate-spin mb-4" />
                      <p className="text-zinc-400 font-bold uppercase tracking-widest">{b.loadingOffers}</p>
                    </div>
                  ) : dbOffers.length === 0 ? (
                    <div className="col-span-full py-12 text-center">
                      <p className="text-zinc-500 font-bold uppercase tracking-widest">
                        {b.noOffers}
                      </p>
                    </div>
                  ) : dbOffers.map((offer) => {
                    const title = language === 'fr' ? offer.title_fr : (language === 'ar' ? offer.title_ar : offer.title_en);
                    const features = language === 'fr' ? offer.features_fr : (language === 'ar' ? offer.features_ar : offer.features_en);
                    const isSubWash = offer.price <= 100 && cachedProfile?.subscription_status === 'active' && (cachedProfile?.washes_remaining || 0) > 0;
                    const finalPrice = isSubWash ? "0" : offer.price.toString();
                    const isRecommended = offer.price >= 500;

                    return (
                      <button
                        key={offer.id}
                        onClick={() => handleOfferSelect(offer)}
                        className={`relative p-8 rounded-[2rem] border-2 text-left transition-all duration-500 group border-zinc-100 bg-zinc-50 hover:border-brand-blue/30 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                      >
                        {isRecommended && (
                          <span className={`absolute top-4 ${dir === 'rtl' ? 'left-8' : 'right-8'} px-4 py-1 bg-brand-gold text-black text-[10px] font-black uppercase tracking-widest rounded-full`}>
                            {b.recommended}
                          </span>
                        )}
                        <h3 className="text-xl font-black uppercase italic tracking-tight mb-2">{title}</h3>
                        <div className="flex flex-col mb-6">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black">{finalPrice}</span>
                            <span className="text-xs font-bold text-zinc-400 uppercase">DH</span>
                          </div>
                          {finalPrice === "0" && (
                            <p className="text-[9px] font-black text-brand-blue uppercase tracking-widest mt-1">
                              {b.summary.deductNotice}
                            </p>
                          )}
                        </div>
                        <ul className="space-y-3">
                          {Array.isArray(features) && features.map((f: string, i: number) => (
                            <li key={i} className={`flex items-center gap-3 text-sm text-zinc-500 font-medium ${dir === 'rtl' ? 'flex-row-reverse text-right' : 'text-left'}`}>
                              <CheckCircle2 size={14} className="text-brand-blue shrink-0" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Form Details */}
        {step === 2 && (
          <div className="reveal">
            <form className="space-y-8 bg-zinc-50 p-8 md:p-12 rounded-[3rem] border border-zinc-100 relative">
              {/* Honeypot field - hidden from users */}
              <div className="absolute -top-[1000px] left-0 opacity-0 pointer-events-none" aria-hidden="true">
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  name="website_url"
                  value={hp}
                  onChange={(e) => setHp(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-widest text-zinc-400 px-1 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{b.form.fullname}</label>
                  <div className="relative">
                    <User className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-brand-blue w-5 h-5`} />
                    <input
                      required
                      type="text"
                      name="fullname"
                      pattern="[A-Za-zÀ-ÿ\s\-\']+"
                      title={b.validationName}
                      placeholder={b.form.placeholderName}
                      value={formData.fullname}
                      onChange={handleInputChange}
                      className={`w-full ${dir === 'rtl' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} py-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white transition-all`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-widest text-zinc-400 px-1 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{b.form.phone}</label>
                  <div className="relative">
                    <Phone className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-brand-blue w-5 h-5`} />
                    <input
                      required
                      type="tel"
                      name="phone"
                      pattern="\+?[0-9\s\-\(\)]{8,15}"
                      title={b.validationPhone}
                      placeholder={b.form.placeholderPhone}
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full ${dir === 'rtl' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} py-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white transition-all`}
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className={`text-xs font-black uppercase tracking-widest text-zinc-400 px-1 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{b.form.carModel}</label>
                  <div className="relative">
                    <Car className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-brand-blue w-5 h-5`} />
                    <input
                      required
                      type="text"
                      name="carModel"
                      placeholder={b.form.placeholderCar}
                      value={formData.carModel}
                      onChange={handleInputChange}
                      className={`w-full ${dir === 'rtl' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} py-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white transition-all`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-widest text-zinc-400 px-1 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{b.form.date}</label>
                  <div className="relative">
                    <Calendar className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-brand-blue w-5 h-5`} />
                    <input
                      required
                      type="date"
                      name="date"
                      min={todayDate}
                      value={formData.date}
                      onChange={handleInputChange}
                      className={`w-full ${dir === 'rtl' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} py-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white transition-all`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-widest text-zinc-400 px-1 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{b.form.time}</label>
                  <div className="relative">
                    <Clock className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-brand-blue w-5 h-5`} />
                    <select
                      required
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      disabled={!formData.date || isFetchingSlots}
                      className={`w-full ${dir === 'rtl' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} py-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white transition-all appearance-none cursor-pointer disabled:opacity-50`}
                    >
                      <option value="" disabled>
                        {isFetchingSlots ? b.loading : b.selectTime}
                      </option>
                      {Array.from({ length: 16 * 4 + 1 }).map((_, i) => {
                        const totalMinutes = i * 15 + 8 * 60; // start at 8:00
                        const hours = Math.floor(totalMinutes / 60) % 24;
                        const minutes = totalMinutes % 60;
                        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                        const isOccupied = bookedSlots.includes(timeString);

                        // Check if time is in the past if today is selected
                        let isPast = false;
                        if (formData.date === todayDate) {
                          const [h, m] = timeString.split(':').map(Number);
                          const now = new Date();
                          const slotDate = new Date();
                          slotDate.setHours(h, m, 0, 0);
                          if (slotDate < now) isPast = true;
                        }

                        const isDisabled = isOccupied || isPast;

                        return (
                          <option key={timeString} value={timeString} disabled={isDisabled} className={isDisabled ? "text-red-500 bg-red-50" : ""}>
                            {timeString} {isOccupied ? b.occupied : isPast ? b.past : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>

              <div className={`flex justify-between items-center pt-8 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedService?.booking_type === "direct") {
                      setSelectedService(null);
                      setSelectedOffer(null);
                      setStep(1);
                    } else {
                      setStep(1);
                      setSelectedOffer(null);
                    }
                  }}
                  className={`flex items-center gap-2 text-zinc-400 font-bold hover:text-zinc-950 transition-colors ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}
                >
                  <ChevronLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} /> {selectedService?.booking_type === "direct" ? b.backServices : b.backOffers}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!formData.fullname || !formData.phone || !formData.carModel || !formData.date || !formData.time}
                  className={`btn-primary group disabled:opacity-50 disabled:hover:scale-100 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}
                >
                  {b.next}
                  <ChevronRight size={20} className={`transition-transform ${dir === 'rtl' ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="reveal">
            <div className="bg-zinc-50 p-8 md:p-12 rounded-[3rem] border border-zinc-100">
              <div className={`flex items-center gap-4 mb-10 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <div className="w-12 h-12 bg-brand-blue rounded-full flex items-center justify-center">
                  <ClipboardCheck className="text-white w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black uppercase italic tracking-tight">{b.summary.title}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                <div className="space-y-6">
                  <div className={`flex justify-between border-b border-zinc-200 pb-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">{b.form.fullname}</span>
                    <span className="font-black text-sm uppercase">{formData.fullname}</span>
                  </div>
                  <div className={`flex justify-between border-b border-zinc-200 pb-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">{b.form.phone}</span>
                    <span className="font-black text-sm uppercase">{formData.phone}</span>
                  </div>
                  <div className={`flex justify-between border-b border-zinc-200 pb-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">{b.vehicle}</span>
                    <span className="font-black text-sm uppercase">{formData.carModel}</span>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className={`flex justify-between border-b border-zinc-200 pb-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">{b.dateTime}</span>
                    <span className="font-black text-sm uppercase">{formData.date} | {formData.time}</span>
                  </div>
                  <div className={`flex justify-between border-b border-zinc-200 pb-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">{b.steps.service}</span>
                    <span className="font-black text-sm uppercase text-brand-blue">
                      {selectedService && selectedOffer ? 
                        `${language === 'fr' ? selectedService.title_fr : (language === 'ar' ? selectedService.title_ar : selectedService.title_en)} - ${language === 'fr' ? selectedOffer.title_fr : (language === 'ar' ? selectedOffer.title_ar : selectedOffer.title_en)}` 
                        : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`bg-white p-8 rounded-2xl border border-zinc-200 flex flex-col md:flex-row justify-between items-center gap-6 mb-12 ${dir === 'rtl' ? 'md:flex-row-reverse' : ''}`}>
                <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                  <p className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">{b.summary.total}</p>
                  <div className={`flex items-baseline gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-5xl font-black tracking-tighter text-zinc-950">
                      {selectedOffer?.price === -1 ? (
                        <span className="text-2xl">{b.onSite}</span>
                      ) : (
                        selectedOffer && selectedOffer.price <= 100 && cachedProfile?.subscription_status === 'active' && (cachedProfile?.washes_remaining || 0) > 0 ? "0" : selectedOffer?.price || '0'
                      )}
                    </span>
                    {selectedOffer?.price !== -1 && (
                      <span className="text-sm font-black text-zinc-400 uppercase">DH</span>
                    )}
                  </div>
                  {(selectedOffer && selectedOffer.price <= 100 && selectedOffer.price !== -1 && cachedProfile?.subscription_status === 'active' && (cachedProfile?.washes_remaining || 0) > 0) && (
                    <p className="text-[10px] font-bold text-brand-blue uppercase tracking-wider mt-1">
                      {b.summary.deductNotice}
                    </p>
                  )}
                </div>
                <div className={`text-center ${dir === 'rtl' ? 'md:text-left' : 'md:text-right'}`}>
                  <p className="text-zinc-500 text-sm italic mb-2">{b.summary.atLocation}</p>
                  <p className="text-xs font-black text-brand-blue uppercase tracking-widest">Marjane Casablanca</p>
                </div>
              </div>

              {error && (
                <div className={`mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-medium ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <AlertCircle className="shrink-0 w-5 h-5" />
                  <p>{error}</p>
                </div>
              )}

              <div className={`flex flex-col sm:flex-row justify-between items-center gap-6 ${dir === 'rtl' ? 'sm:flex-row-reverse' : ''}`}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className={`flex items-center gap-2 text-zinc-400 font-bold hover:text-zinc-950 transition-colors ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}
                >
                  <ChevronLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} /> {b.back}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full sm:w-auto px-12 py-5 bg-brand-blue text-white font-black uppercase tracking-[0.2em] text-sm rounded-2xl hover:bg-brand-blue/80 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-blue/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {b.processing}
                    </>
                  ) : (
                    b.submit
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
