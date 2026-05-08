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
      router.push("/profile");
      router.refresh();
    } else {
      const errorKey = result.error || "auth.error";
      const errorMsg = errorKey.split('.').reduce((obj: any, key) => obj?.[key], t) || t.auth.error;
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-blue/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-blue/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <Navbar />
      
      <div className="max-w-md mx-auto pt-32 pb-20 px-4 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-zinc-200/50 shadow-[0_20px_50px_rgba(0,112,243,0.05)] reveal">
          <div className="w-20 h-20 bg-gradient-to-br from-brand-blue to-brand-blue/80 rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-lg shadow-brand-blue/20 -rotate-3 hover:rotate-0 transition-transform duration-500">
            <UserPlus className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-center mb-2 text-zinc-900">
            {t.auth.signupTitle}
          </h1>
          <p className="text-center text-zinc-500 mb-10 text-sm font-medium">
            {language === 'ar' ? 'أنشئ حسابك الجديد في ثوانٍ' : 
             language === 'fr' ? 'Créez votre compte en quelques secondes' : 
             'Create your account in seconds'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  className={`w-full ${dir === 'rtl' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} py-4 rounded-2xl border border-zinc-200 focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue bg-zinc-50/50 focus:bg-white transition-all duration-300`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
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
                    className={`w-full ${dir === 'rtl' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} py-4 rounded-2xl border border-zinc-200 focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue bg-zinc-50/50 focus:bg-white transition-all duration-300`}
                  />
                </div>
              </div>

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
                    className={`w-full ${dir === 'rtl' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} py-4 rounded-2xl border border-zinc-200 focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue bg-zinc-50/50 focus:bg-white transition-all duration-300`}
                  />
                </div>
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
                  className={`w-full ${dir === 'rtl' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} py-4 rounded-2xl border border-zinc-200 focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue bg-zinc-50/50 focus:bg-white transition-all duration-300`}
                />
              </div>
            </div>

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
                  className={`w-full ${dir === 'rtl' ? 'pr-12 pl-12 text-right' : 'pl-12 pr-12 text-left'} py-4 rounded-2xl border border-zinc-200 focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue bg-zinc-50/50 focus:bg-white transition-all duration-300`}
                />
                {!loading && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${dir === 'rtl' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-zinc-400 hover:text-brand-blue transition-colors p-1`}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
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
                  className={`w-full ${dir === 'rtl' ? 'pr-12 pl-12 text-right' : 'pl-12 pr-12 text-left'} py-4 rounded-2xl border border-zinc-200 focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue bg-zinc-50/50 focus:bg-white transition-all duration-300`}
                />
                {!loading && (
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute ${dir === 'rtl' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-zinc-400 hover:text-brand-blue transition-colors p-1`}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className={`p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-medium ${dir === 'rtl' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-top-2 duration-300`}>
                <AlertCircle className="shrink-0 w-5 h-5" />
                <p className="text-sm leading-tight">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-zinc-900 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-brand-blue hover:shadow-xl hover:shadow-brand-blue/30 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3 mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <span>{t.auth.signupBtn}</span>
                  <UserPlus className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-zinc-100">
            <p className="text-center text-sm text-zinc-500 font-medium">
              {t.auth.hasAccount}{" "}
              <Link href="/auth/login" className="text-brand-blue font-bold hover:underline decoration-2 underline-offset-4">
                {t.auth.loginBtn}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
