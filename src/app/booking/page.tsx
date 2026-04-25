"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import pb from "@/lib/pocketbase";
import { submitBooking } from "@/app/actions/booking";
import { ChevronLeft, ChevronRight, CheckCircle2, Car, Sparkles, Droplets, Zap, ShieldCheck, Clock, Calendar, User, Phone, ClipboardCheck, AlertCircle, Loader2 } from "lucide-react";

const BookingPage = () => {
  const { language, dir } = useLanguage();
  const t = translations[language];
  const b = t.booking;

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    carModel: "",
    date: "",
    time: "",
  });
  const [hp, setHp] = useState(""); // Honeypot
  const [startTime] = useState(Date.now()); // Load time for anti-spam
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const services = [
    {
      id: "simple",
      title: t.pricing.plans.once.name,
      price: "100",
      icon: <Zap className="w-6 h-6" />,
      features: t.pricing.plans.once.features,
    },
    {
      id: "vip",
      title: t.pricing.plans.vip.name,
      price: "600",
      icon: <Sparkles className="w-6 h-6" />,
      features: t.pricing.plans.vip.features,
      recommended: true,
    },
  ];

  const handleServiceSelect = (id: string) => {
    setSelectedService(id);
    setStep(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Client-side rate limit check
    const lastSubmit = localStorage.getItem('last_booking');
    if (lastSubmit && Date.now() - parseInt(lastSubmit) < 60000) { // 1 minute limit
      setError(language === 'fr' ? 'Veuillez attendre une minute avant de réserver à nouveau.' : (language === 'ar' ? 'يرجى الانتظار دقيقة قبل الحجز مرة أخرى.' : 'Please wait a minute before booking again.'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bookingDateTime = new Date(`${formData.date}T${formData.time}`);

      const result = await submitBooking({
        full_name: formData.fullname,
        phone: formData.phone,
        plate_number: formData.carModel,
        service_type: selectedService === "vip" ? "VIP" : "Simple",
        price: selectedService === "vip" ? 600 : 100,
        date: bookingDateTime.toISOString(),
        notes: `Selected service: ${selectedService}. Language: ${language}.`,
        hp: hp, // Honeypot field
        ts: startTime.toString(), // Time when page was opened
      });

      if (result.success) {
        localStorage.setItem('last_booking', Date.now().toString());
        // Save ID in local storage as a backup for the "My Bookings" page
        const existing = localStorage.getItem('my_booking_ids') || "";
        const bookingId = result.id as string; 
        const updated = existing ? `${existing},${bookingId}` : bookingId;
        localStorage.setItem('my_booking_ids', updated);
        
        setIsSubmitted(true);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      setError(err.message || (language === 'fr' ? 'Erreur de connexion.' : 'Connection error.'));
    } finally {
      setLoading(false);
    }
  };

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
              {language === 'fr' ? 'Un conseiller vous contactera pour confirmer dans 5 minutes.' : (language === 'ar' ? 'سيتصل بك مستشار للتأكيد خلال 5 دقائق.' : 'An advisor will contact you for confirmation in 5 minutes.')}
            </p>
            <Link href="/" className="btn-primary inline-flex">
              {language === 'fr' ? 'Retour à l\'accueil' : (language === 'ar' ? 'العودة للرئيسية' : 'Back to Home')}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 reveal">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => handleServiceSelect(service.id)}
                className={`relative p-8 rounded-[2rem] border-2 text-left transition-all duration-500 group ${selectedService === service.id ? "border-brand-blue bg-brand-blue/5" : "border-zinc-100 bg-zinc-50 hover:border-brand-blue/30"
                  } ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
              >
                {service.recommended && (
                  <span className={`absolute top-4 ${dir === 'rtl' ? 'left-8' : 'right-8'} px-4 py-1 bg-brand-gold text-black text-[10px] font-black uppercase tracking-widest rounded-full`}>
                    {b.recommended}
                  </span>
                )}
                <div className={`w-14 h-14 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${dir === 'rtl' ? 'ml-auto mr-0' : 'mr-auto ml-0'}`}>
                  <div className="text-brand-blue">{service.icon}</div>
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tight mb-2">{service.title}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-black">{service.price}</span>
                  <span className="text-xs font-bold text-zinc-400 uppercase">DH</span>
                </div>
                <ul className="space-y-3">
                  {service.features.map((f, i) => (
                    <li key={i} className={`flex items-center gap-3 text-sm text-zinc-500 font-medium ${dir === 'rtl' ? 'flex-row-reverse text-right' : 'text-left'}`}>
                      <CheckCircle2 size={14} className="text-brand-blue shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </button>
            ))}
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
                    <input
                      required
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      className={`w-full ${dir === 'rtl' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} py-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white transition-all`}
                    />
                  </div>
                </div>
              </div>

              <div className={`flex justify-between items-center pt-8 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`flex items-center gap-2 text-zinc-400 font-bold hover:text-zinc-950 transition-colors ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}
                >
                  <ChevronLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} /> {language === 'fr' ? 'Retour' : (language === 'ar' ? 'رجوع' : 'Back')}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!formData.fullname || !formData.phone || !formData.carModel || !formData.date || !formData.time}
                  className={`btn-primary group disabled:opacity-50 disabled:hover:scale-100 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}
                >
                  {language === 'fr' ? 'Suivant' : (language === 'ar' ? 'التالي' : 'Next')}
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
                    <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">{language === 'fr' ? 'Date & Heure' : 'Date & Time'}</span>
                    <span className="font-black text-sm uppercase">{formData.date} | {formData.time}</span>
                  </div>
                  <div className={`flex justify-between border-b border-zinc-200 pb-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">{b.steps.service}</span>
                    <span className="font-black text-sm uppercase text-brand-blue">{selectedService === 'vip' ? t.pricing.plans.vip.name : (language === 'fr' ? 'Lavage Simple' : (language === 'ar' ? 'غسيل عادي' : 'Basic Wash'))}</span>
                  </div>
                </div>
              </div>

              <div className={`bg-white p-8 rounded-2xl border border-zinc-200 flex flex-col md:flex-row justify-between items-center gap-6 mb-12 ${dir === 'rtl' ? 'md:flex-row-reverse' : ''}`}>
                <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                  <p className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">{b.summary.total}</p>
                  <div className={`flex items-baseline gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-5xl font-black tracking-tighter text-zinc-950">{selectedService === 'vip' ? '600' : '100'}</span>
                    <span className="text-sm font-black text-zinc-400 uppercase">DH</span>
                  </div>
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
                  <ChevronLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} /> {language === 'fr' ? 'Retour' : (language === 'ar' ? 'رجوع' : 'Back')}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full sm:w-auto px-12 py-5 bg-brand-blue text-white font-black uppercase tracking-[0.2em] text-sm rounded-2xl hover:bg-brand-blue/80 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-blue/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {language === 'fr' ? 'Traitement...' : (language === 'ar' ? 'جاري المعالجة...' : 'Processing...')}
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
