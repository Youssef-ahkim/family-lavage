"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { signup } from "@/app/actions/auth";
import { Loader2, AlertCircle, Mail, Lock, User, UserPlus, Phone, Car, Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const { language, dir } = useLanguage();
  const t = translations[language];
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (document.cookie.includes('pb_logged_in=true')) {
      router.push('/profile');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await signup(formData);

    if (result.success) {
      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get('redirect') || "/profile";
      router.push(redirectTo);
      router.refresh();
    } else {
      const errorKey = result.error || "auth.error";
      const errorMsg = errorKey.split('.').reduce((obj: any, key) => obj?.[key], t) || t.auth.error;
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-blue/5 opacity-50 rounded-full blur-[150px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-blue/5 opacity-50 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: '4s' }} />
      </div>

      <Navbar />
      
      <div className="relative z-10 max-w-xl mx-auto pt-32 pb-20 px-4">
        <div className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] border border-zinc-200/50 shadow-[0_10px_40px_rgba(0,112,243,0.03)] reveal relative overflow-hidden">
          <div className="w-20 h-20 bg-gradient-to-br from-brand-blue via-blue-500 to-teal-500 rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-md shadow-brand-blue/15 transform rotate-2 hover:rotate-0 transition-transform duration-500">
            <UserPlus className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-center mb-2 text-zinc-900">
            {t.auth.signupTitle}
          </h1>
          <p className="text-zinc-500 text-center mb-10 text-sm font-medium tracking-tight">
            Rejoignez la famille Family Lavage dès aujourd'hui
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                  {t.auth.name}
                </label>
                <div className="group relative">
                  <User className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-brand-blue transition-colors w-5 h-5`} />
                  <input
                    required
                    type="text"
                    name="name"
                    placeholder="Youssef Ahkim"
                    className={`w-full ${dir === 'rtl' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} py-4 rounded-2xl border border-zinc-200 focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue bg-zinc-50/50 hover:bg-white transition-all duration-300`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                  {t.auth.email}
                </label>
                <div className="group relative">
                  <Mail className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-brand-blue transition-colors w-5 h-5`} />
                  <input
                    required
                    type="email"
                    name="email"
                    placeholder="nom@example.com"
                    className={`w-full ${dir === 'rtl' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} py-4 rounded-2xl border border-zinc-200 focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue bg-zinc-50/50 hover:bg-white transition-all duration-300`}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                  {t.booking.form.phone}
                </label>
                <div className="group relative">
                  <Phone className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-brand-blue transition-colors w-5 h-5`} />
                  <input
                    required
                    type="tel"
                    name="phone"
                    pattern="\+?[0-9\s\-\(\)]{8,15}"
                    title="Please enter a valid phone number"
                    placeholder={t.booking.form.placeholderPhone}
                    className={`w-full ${dir === 'rtl' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} py-4 rounded-2xl border border-zinc-200 focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue bg-zinc-50/50 hover:bg-white transition-all duration-300`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                  {t.booking.form.carModel}
                </label>
                <div className="group relative">
                  <Car className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-brand-blue transition-colors w-5 h-5`} />
                  <input
                    required
                    type="text"
                    name="plate"
                    placeholder={t.booking.form.placeholderCar}
                    className={`w-full ${dir === 'rtl' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} py-4 rounded-2xl border border-zinc-200 focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue bg-zinc-50/50 hover:bg-white transition-all duration-300`}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                  {t.auth.password}
                </label>
                <div className="group relative">
                  <Lock className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-brand-blue transition-colors w-5 h-5`} />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    name="password"
                    minLength={8}
                    placeholder="••••••••"
                    className={`w-full ${dir === 'rtl' ? 'pr-12 pl-12 text-right' : 'pl-12 pr-12 text-left'} py-4 rounded-2xl border border-zinc-200 focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue bg-zinc-50/50 hover:bg-white transition-all duration-300`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${dir === 'rtl' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-zinc-400 hover:text-brand-blue transition-colors p-1`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                  {t.auth.passwordConfirm}
                </label>
                <div className="group relative">
                  <Lock className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-brand-blue transition-colors w-5 h-5`} />
                  <input
                    required
                    type={showConfirmPassword ? "text" : "password"}
                    name="passwordConfirm"
                    minLength={8}
                    placeholder="••••••••"
                    className={`w-full ${dir === 'rtl' ? 'pr-12 pl-12 text-right' : 'pl-12 pr-12 text-left'} py-4 rounded-2xl border border-zinc-200 focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue bg-zinc-50/50 hover:bg-white transition-all duration-300`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute ${dir === 'rtl' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-zinc-400 hover:text-brand-blue transition-colors p-1`}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className={`p-4 bg-red-50/50 backdrop-blur-sm border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-medium ${dir === 'rtl' ? 'flex-row-reverse' : ''} animate-shake`}>
                <AlertCircle className="shrink-0 w-5 h-5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-brand-blue text-white font-black uppercase tracking-[0.2em] text-sm rounded-2xl hover:bg-brand-blue/90 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_8px_20px_rgba(0,112,243,0.15)] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {t.auth.signupBtn}
                  <UserPlus className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-zinc-100">
            <p className="text-center text-sm text-zinc-500 font-medium">
              {t.auth.hasAccount}{" "}
              <Link 
                href={`/auth/login${typeof window !== 'undefined' ? window.location.search : ''}`} 
                className="text-brand-blue font-bold hover:underline ml-1"
              >
                {t.auth.loginBtn}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
