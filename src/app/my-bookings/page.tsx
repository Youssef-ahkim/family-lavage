"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { getMyBookings, cancelBooking } from "@/app/actions/booking";
import ConfirmModal from "@/components/ConfirmModal";
import {
  ChevronLeft,
  Calendar,
  Clock,
  Car,
  CheckCircle2,
  XCircle,
  Loader2,
  Trash2,
  ArrowRight,
  History
} from "lucide-react";
import { useRouter } from "next/navigation";

const MyBookingsPage = () => {
  const router = useRouter();
  const { language, dir } = useLanguage();
  const t = translations[language];
  const m = t.myBookings;

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    // Check if user is logged in via cookie
    const isLoggedIn = document.cookie.includes('pb_logged_in=true');
    if (isLoggedIn) {
      router.push("/profile");
      return;
    }

    const fetchData = async () => {
      try {
        const bookingsData = await getMyBookings();
        setBookings(bookingsData);
      } catch (err: any) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleCancelClick = (id: string) => {
    setBookingToCancel(id);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;

    setIsActionLoading(true);
    setCancellingId(bookingToCancel);
    try {
      const result = await cancelBooking(bookingToCancel);
      if (result.success) {
        setBookings(bookings.map(b =>
          b.id === bookingToCancel ? { ...b, status: 'cancelled' } : b
        ));
        setIsConfirmModalOpen(false);
      } else {
        const errorKey = result.error || "errors.general";
        const errorMsg = errorKey.split('.').reduce((obj: any, key) => obj?.[key], t) || t.errors.general;
        alert(errorMsg);
      }
    } catch (err) {
      console.error("Cancel error:", err);
      alert(t.errors.general);
    } finally {
      setCancellingId(null);
      setIsActionLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
        <p className="font-black uppercase tracking-widest text-zinc-300 text-xs">
          {language === 'fr' ? 'Chargement...' : (language === 'ar' ? 'جاري التحميل...' : 'Loading...')}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 text-zinc-950 font-sans overflow-x-hidden">
      <Navbar />

      <div className="max-w-4xl mx-auto pt-32 pb-24 px-4">
        {/* Header */}
        <div className={`mb-12 reveal ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
          <div className={`flex items-center gap-4 mb-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <Link href="/" className="w-10 h-10 rounded-full bg-white border border-zinc-100 flex items-center justify-center hover:bg-zinc-50 transition-colors shadow-sm">
              <ChevronLeft className={dir === 'rtl' ? 'rotate-180' : ''} size={20} />
            </Link>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
              {m.title}
            </h1>
          </div>
          <p className="text-zinc-500 font-medium max-w-lg">
            {language === 'fr' 
              ? "Consultez l'état de vos réservations passées en tant qu'invité." 
              : (language === 'ar' 
                ? "عرض حالة حجوزاتك السابقة كضيف." 
                : "View the status of your past guest reservations.")}
          </p>
        </div>

        <div className="space-y-6">
          <div className={`flex items-center gap-3 mb-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <History size={24} className="text-brand-blue" />
            <h2 className="text-2xl font-black uppercase italic tracking-tight">{language === 'fr' ? 'Mes Réservations' : (language === 'ar' ? 'حجوزاتي' : 'My Reservations')}</h2>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm reveal">
              <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-zinc-200 w-8 h-8" />
              </div>
              <h3 className="text-xl font-black mb-2 uppercase italic text-zinc-400">
                {m.noBookings}
              </h3>
              <Link href="/booking" className="text-brand-blue font-bold hover:underline flex items-center justify-center gap-2 mt-4">
                {t.nav.book} <ArrowRight size={16} className={dir === 'rtl' ? 'rotate-180' : ''} />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`bg-white rounded-[2rem] border border-zinc-100 p-6 reveal transition-all hover:shadow-md ${booking.status === 'cancelled' ? 'opacity-70 grayscale' : ''}`}
                >
                  <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${dir === 'rtl' ? 'md:flex-row-reverse' : ''}`}>
                    <div className={`flex-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                      <div className={`flex items-center gap-3 mb-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                        <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              booking.status === 'cancelled' ? 'bg-zinc-100 text-zinc-500' :
                                'bg-brand-blue/10 text-brand-blue'
                          }`}>
                          {booking.status}
                        </span>
                        <span className="text-zinc-300 text-[10px] font-medium">#{booking.id}</span>
                      </div>

                      <h3 className="text-lg font-black uppercase italic tracking-tight mb-3">
                        {booking.service_type === 'VIP' ? t.pricing.plans.vip.name : (language === 'fr' ? 'Lavage Simple' : (language === 'ar' ? 'غسيل عادي' : 'Basic Wash'))}
                      </h3>

                      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 ${dir === 'rtl' ? 'text-right' : ''}`}>
                        <div className={`flex items-center gap-2 text-zinc-500 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                          <Calendar size={14} className="text-brand-blue shrink-0" />
                          <span className="text-xs font-bold">{formatDate(booking.date)}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-zinc-500 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                          <Clock size={14} className="text-brand-blue shrink-0" />
                          <span className="text-xs font-bold">{formatTime(booking.date)}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-zinc-500 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                          <Car size={14} className="text-brand-blue shrink-0" />
                          <span className="text-xs font-bold">{booking.plate_number}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-zinc-950 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                          <span className="text-xs font-black px-2 py-0.5 bg-zinc-50 rounded border border-zinc-100">
                            {booking.price} DH
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 w-full md:w-auto">
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button
                          onClick={() => handleCancelClick(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-zinc-50 text-red-500 font-black uppercase text-[10px] tracking-widest rounded-xl border border-red-50 hover:bg-red-50 transition-all group disabled:opacity-50"
                        >
                          {cancellingId === booking.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                          {m.cancel}
                        </button>
                      )}
                      {booking.status === 'cancelled' && (
                        <div className="flex items-center gap-2 text-zinc-400 font-black uppercase text-[9px] tracking-widest px-4 py-3 justify-center">
                          <XCircle size={14} />
                          {m.cancelled}
                        </div>
                      )}
                      {booking.status === 'confirmed' && (
                        <div className="flex items-center gap-2 text-green-500 font-black uppercase text-[9px] tracking-widest px-4 py-3 justify-center">
                          <CheckCircle2 size={14} />
                          {language === 'fr' ? 'Confirmé' : 'Confirmed'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-16 text-center">
          <Link href="/" className="text-zinc-400 hover:text-brand-blue font-bold text-sm transition-colors flex items-center justify-center gap-2">
            <ArrowRight className="w-4 h-4 rotate-180" /> {m.backHome}
          </Link>
        </div>
      </div>

      <ConfirmModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmCancel}
        title={language === 'fr' ? 'Confirmation' : (language === 'ar' ? 'تأكيد' : 'Confirmation')}
        message={m.confirmCancel}
        confirmText={m.confirmBtn}
        cancelText={m.keepBtn}
        variant="warning"
        isLoading={isActionLoading}
      />
    </div>
  );
};

export default MyBookingsPage;
