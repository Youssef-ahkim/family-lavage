"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { signup } from "@/app/actions/auth";
import { Loader2, AlertCircle, Mail, Lock, User, UserPlus, Phone, Car } from "lucide-react";

export default function SignupPage() {
  const { language, dir } = useLanguage();
  const t = translations[language];
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (document.cookie.includes('pb_logged_in=true')) {
      router.push('/my-bookings');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await signup(formData);

    if (result.success) {
      router.push("/my-bookings");
      router.refresh();
    } else {
      setError(result.error || t.auth.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <Navbar />
      <div className="max-w-md mx-auto pt-32 pb-12 px-4">
        <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-zinc-100 shadow-xl shadow-brand-blue/5 reveal">
          <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center mb-8 mx-auto">
            <UserPlus className="w-8 h-8 text-brand-blue" />
          </div>
          
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-center mb-8">
            {t.auth.signupTitle}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className={`text-xs font-black uppercase tracking-widest text-zinc-400 px-1 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                {t.auth.name}
              </label>
              <div className="relative">
                <User className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-brand-blue w-5 h-5`} />
                <input
                  required
                  type="text"
                  name="name"
                  placeholder="Youssef Ahkim"
                  className={`w-full ${dir === 'rtl' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} py-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-zinc-50 transition-all`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-black uppercase tracking-widest text-zinc-400 px-1 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                {t.auth.email}
              </label>
              <div className="relative">
                <Mail className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-brand-blue w-5 h-5`} />
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="nom@example.com"
                  className={`w-full ${dir === 'rtl' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} py-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-zinc-50 transition-all`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-black uppercase tracking-widest text-zinc-400 px-1 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                {t.booking.form.phone}
              </label>
              <div className="relative">
                <Phone className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-brand-blue w-5 h-5`} />
                <input
                  required
                  type="tel"
                  name="phone"
                  pattern="\+?[0-9\s\-\(\)]{8,15}"
                  title="Please enter a valid phone number"
                  placeholder={t.booking.form.placeholderPhone}
                  className={`w-full ${dir === 'rtl' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} py-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-zinc-50 transition-all`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-black uppercase tracking-widest text-zinc-400 px-1 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                {t.booking.form.carModel}
              </label>
              <div className="relative">
                <Car className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-brand-blue w-5 h-5`} />
                <input
                  required
                  type="text"
                  name="plate"
                  placeholder={t.booking.form.placeholderCar}
                  className={`w-full ${dir === 'rtl' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} py-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-zinc-50 transition-all`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-black uppercase tracking-widest text-zinc-400 px-1 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                {t.auth.password}
              </label>
              <div className="relative">
                <Lock className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-brand-blue w-5 h-5`} />
                <input
                  required
                  type="password"
                  name="password"
                  minLength={8}
                  placeholder="••••••••"
                  className={`w-full ${dir === 'rtl' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} py-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-zinc-50 transition-all`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-black uppercase tracking-widest text-zinc-400 px-1 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                {t.auth.passwordConfirm}
              </label>
              <div className="relative">
                <Lock className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-brand-blue w-5 h-5`} />
                <input
                  required
                  type="password"
                  name="passwordConfirm"
                  minLength={8}
                  placeholder="••••••••"
                  className={`w-full ${dir === 'rtl' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} py-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-zinc-50 transition-all`}
                />
              </div>
            </div>

            {error && (
              <div className={`p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-medium ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <AlertCircle className="shrink-0 w-5 h-5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-brand-blue text-white font-black uppercase tracking-[0.2em] text-sm rounded-2xl hover:bg-brand-blue/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand-blue/20 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.auth.signupBtn}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-zinc-500 font-medium">
            {t.auth.hasAccount}{" "}
            <Link href="/login" className="text-brand-blue font-bold hover:underline">
              {t.auth.loginBtn}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
