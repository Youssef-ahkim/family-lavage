"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { getMyBookings, cancelBooking } from "@/app/actions/booking";
import { getProfile } from "@/app/actions/auth";
import {
  ChevronLeft,
  Calendar,
  Clock,
  Car,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Trash2,
  ArrowRight
} from "lucide-react";

const MyBookingsPage = () => {
  const { language, dir } = useLanguage();
  const t = translations[language];
  const m = t.myBookings;

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getMyBookings();
        setBookings(data);
      } catch (err: any) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleCancel = async (id: string) => {
    if (!window.confirm(m.confirmCancel)) return;

    setCancellingId(id);
    try {
      const result = await cancelBooking(id);
      if (result.success) {
        setBookings(bookings.map(b =>
          b.id === id ? { ...b, status: 'cancelled' } : b
        ));
      }
    } catch (err) {
      console.error("Cancel error:", err);
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'ar' ? 'ar-MA' : (language === 'fr' ? 'fr-FR' : 'en-US'), {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans overflow-x-hidden">
      <Navbar />

      <div className="max-w-4xl mx-auto pt-32 pb-24 px-4">
        {/* Header */}
        <div className={`mb-12 reveal ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
          <div className={`flex items-center gap-4 mb-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <Link href="/" className="w-10 h-10 rounded-full border border-zinc-100 flex items-center justify-center hover:bg-zinc-50 transition-colors">
              <ChevronLeft className={dir === 'rtl' ? 'rotate-180' : ''} size={20} />
            </Link>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
              {m.title}
            </h1>
          </div>
          <p className="text-zinc-500 text-lg">
            {bookings.length > 0 ? (language === 'fr' ? 'Gérez vos réservations actives et passées.' : (language === 'ar' ? 'إدارة حجوزاتك الحالية والسابقة.' : 'Manage your active and past reservations.')) : ''}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
            <p className="font-black uppercase tracking-widest text-zinc-300 text-xs">
              {language === 'fr' ? 'Chargement...' : (language === 'ar' ? 'جاري التحميل...' : 'Loading...')}
            </p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-24 bg-zinc-50 rounded-[3rem] border border-zinc-100 reveal">
            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="text-zinc-300 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black mb-4 uppercase italic">
              {m.noBookings}
            </h2>
            <Link href="/booking" className="btn-primary inline-flex mt-4">
              {t.nav.book} <ArrowRight className={`ml-2 w-5 h-5 ${dir === 'rtl' ? 'rotate-180 mr-2 ml-0' : ''}`} />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className={`bg-zinc-50 rounded-[2.5rem] border border-zinc-100 p-6 md:p-8 reveal transition-all hover:shadow-xl hover:shadow-zinc-100/50 ${booking.status === 'cancelled' ? 'opacity-70 grayscale' : ''}`}
              >
                <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${dir === 'rtl' ? 'md:flex-row-reverse' : ''}`}>
                  <div className={`flex-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                    <div className={`flex items-center gap-3 mb-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'cancelled' ? 'bg-zinc-200 text-zinc-500' :
                              'bg-brand-blue/10 text-brand-blue'
                        }`}>
                        {booking.status}
                      </span>
                      <span className="text-zinc-300 text-xs font-medium">#{booking.id}</span>
                    </div>

                    <h3 className="text-2xl font-black uppercase italic tracking-tight mb-4">
                      {booking.service_type === 'VIP' ? t.pricing.plans.vip.name : (language === 'fr' ? 'Lavage Simple' : (language === 'ar' ? 'غسيل عادي' : 'Basic Wash'))}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className={`flex items-center gap-3 text-zinc-500 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                        <Calendar size={18} className="text-brand-blue shrink-0" />
                        <span className="text-sm font-bold">{formatDate(booking.date)}</span>
                      </div>
                      <div className={`flex items-center gap-3 text-zinc-500 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                        <Clock size={18} className="text-brand-blue shrink-0" />
                        <span className="text-sm font-bold">{formatTime(booking.date)}</span>
                      </div>
                      <div className={`flex items-center gap-3 text-zinc-500 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                        <Car size={18} className="text-brand-blue shrink-0" />
                        <span className="text-sm font-bold">{booking.plate_number}</span>
                      </div>
                      <div className={`flex items-center gap-3 text-zinc-500 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                        <div className="text-sm font-black text-zinc-950 bg-white px-3 py-1 rounded-lg border border-zinc-100">
                          {booking.price} DH
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 w-full md:w-auto">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-white text-red-500 font-black uppercase text-xs tracking-widest rounded-2xl border border-red-50 hover:bg-red-50 transition-all group active:scale-95 disabled:opacity-50"
                      >
                        {cancellingId === booking.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                        )}
                        {m.cancel}
                      </button>
                    )}
                    {booking.status === 'cancelled' && (
                      <div className="flex items-center gap-2 text-zinc-400 font-black uppercase text-[10px] tracking-widest px-6 py-4">
                        <XCircle size={16} />
                        {m.cancelled}
                      </div>
                    )}
                    {booking.status === 'confirmed' && (
                      <div className="flex items-center gap-2 text-green-500 font-black uppercase text-[10px] tracking-widest px-6 py-4">
                        <CheckCircle2 size={16} />
                        {language === 'fr' ? 'Confirmé' : 'Confirmed'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link href="/" className="text-zinc-400 hover:text-brand-blue font-bold text-sm transition-colors flex items-center justify-center gap-2">
            <ArrowRight className="w-4 h-4 rotate-180" /> {m.backHome}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MyBookingsPage;
