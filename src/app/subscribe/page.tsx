"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { useProfile } from "@/context/ProfileContext";
import { translations } from "@/lib/translations";
import { requestSubscription, getMySubscriptionRequests } from "@/app/actions/subscription";
import { 
  CheckCircle2, 
  ChevronRight, 
  Loader2, 
  AlertCircle, 
  History,
  Clock
} from "lucide-react";

interface LocalSubscription {
  id: string;
  user: string;
  expiry_date?: string;
  plan: 'monthly' | 'yearly';
  status: 'pending' | 'active' | 'rejected' | 'expired';
  amount: number;
  notes?: string;
  created: string;
  washes_remaining?: number;
}

interface LocalPlan {
  id: string;
  active: boolean;
  category: string;
  title_fr: string;
  title_ar: string;
  title_en: string;
  features_fr: string[];
  features_ar: string[];
  features_en: string[];
  plan_type: 'monthly' | 'yearly';
  price: number;
  washes_count: number;
}

export default function SubscribePage() {
  const { language, dir } = useLanguage();
  const { profile, isLoading: profileLoading } = useProfile();
  const router = useRouter();
  const t = translations[language];
  const s = t.subscription;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<LocalSubscription[]>([]);
  const [dbPlans, setDbPlans] = useState<LocalPlan[]>([]);
  const [isFetchingPlans, setIsFetchingPlans] = useState(true);

  const fetchPlans = useCallback(async () => {
    try {
      const { getServiceOffers } = await import("../admin/services/service-actions");
      const data = await getServiceOffers();
      setDbPlans(data.filter((s: { active: boolean; category: string }) => s.active && s.category === 'subscription') as LocalPlan[]);
    } catch (err) {
      console.error("Error fetching plans:", err);
    } finally {
      setIsFetchingPlans(false);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    const data = await getMySubscriptionRequests();
    setRequests(data as LocalSubscription[]);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (profile) {
        fetchRequests();
      }
      fetchPlans();
    }, 0);
    return () => clearTimeout(timer);
  }, [profile, fetchRequests, fetchPlans]);

  const handleSubscribe = async (planId: string) => {
    if (!profile) {
      router.push(`/auth/login?redirect=/subscribe&plan=${planId}`);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const result = await requestSubscription(planId);
      if (result.success) {
        // Refresh the list to update the button states
        fetchRequests();
      } else {
        const errorKey = result.error || "subscription.errors.general";
        const errorMsg = errorKey.split('.').reduce((obj: unknown, key: string) => (obj as Record<string, unknown>)?.[key], t) as string || s.errors.general;
        setError(errorMsg);
      }
    } catch {
      setError(s.errors.general);
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
      </div>
    );
  }

  // We no longer render a full-screen success component here.
  // The success states will be reflected on the individual plan cards.

  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans overflow-x-hidden selection:bg-brand-blue selection:text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto pt-32 pb-24 px-4">
        {/* Header */}
        <div className={`mb-16 reveal ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-4">
            {s.title} <span className="bg-gradient-to-r from-brand-blue to-teal-500 bg-clip-text text-transparent">{s.titleAccent}</span>
          </h1>
          <p className="text-zinc-500 text-lg max-w-2xl">
            {s.subtitle}
          </p>
        </div>

        {error && (
          <div className={`mb-12 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-medium ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <AlertCircle className="shrink-0 w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {isFetchingPlans ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-brand-blue animate-spin mb-4" />
              <p className="text-zinc-400 font-bold uppercase tracking-widest">{s.loadingPlans}</p>
            </div>
          ) : dbPlans.map((plan) => {
            const name = language === 'fr' ? plan.title_fr : (language === 'ar' ? plan.title_ar : plan.title_en);
            const features = language === 'fr' ? plan.features_fr : (language === 'ar' ? plan.features_ar : plan.features_en);
            const isMonthly = plan.plan_type === 'monthly';
            
            const activeReq = requests.find(r => r.status === 'active' && r.plan === plan.plan_type && r.amount === plan.price);
            const hasActive = !!activeReq;
            const hasPending = requests.some(r => r.status === 'pending' && r.plan === plan.plan_type && r.amount === plan.price);

            return (
              <div 
                key={plan.id}
                className={`card-premium relative flex flex-col p-10 rounded-[3rem] border-2 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-blue/5 bg-zinc-50 border-zinc-100 hover:border-brand-blue reveal`}
              >
                <h3 className="text-2xl font-black mb-6 uppercase tracking-tight italic text-zinc-900">
                  {name}
                </h3>
                <div className="flex items-baseline gap-1 mb-10">
                  <span className="text-6xl font-black tracking-tighter text-zinc-900">{plan.price}</span>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-xs font-bold text-zinc-400 uppercase">DH</span>
                    <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">
                      {plan.washes_count} {s.washes} {isMonthly ? t.pricing.perMonth : t.pricing.perYear}
                    </span>
                  </div>
                </div>

                <div className="h-px w-full bg-zinc-200 mb-10" />

                <ul className="space-y-5 mb-12 flex-grow">
                  {Array.isArray(features) && features.map((feature: string, fIdx: number) => (
                    <li key={fIdx} className={`flex items-center gap-3 text-base text-zinc-600 font-medium ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''}`}>
                      <CheckCircle2 size={18} className="text-brand-blue shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {hasActive && activeReq && (
                  <div className="mb-8 p-5 bg-green-500/10 rounded-2xl border border-green-500/20 flex flex-col gap-3">
                    <div className={`flex justify-between items-center text-xs ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                      <span className="font-bold text-green-600 uppercase tracking-widest">{s.washesRemaining}</span>
                      <span className="font-black text-green-600 text-sm bg-green-500/20 px-2 py-0.5 rounded-md">{activeReq.washes_remaining ?? 0}</span>
                    </div>
                    {activeReq.expiry_date && (
                      <div className={`flex justify-between items-center text-xs ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                        <span className="font-bold text-green-600 uppercase tracking-widest">{s.expiresOn}</span>
                        <span className="font-black text-green-600">{new Date(activeReq.expiry_date).toLocaleDateString(language === 'fr' ? 'fr-FR' : (language === 'ar' ? 'ar-MA' : 'en-US'))}</span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading || hasActive || hasPending}
                  className={`w-full py-5 text-white font-black uppercase tracking-[0.2em] text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-3 ${
                    hasActive 
                      ? 'bg-green-500 shadow-green-500/20' 
                      : hasPending 
                        ? 'bg-amber-500 shadow-amber-500/20' 
                        : 'bg-brand-blue hover:bg-brand-blue/80 hover:-translate-y-1 active:scale-[0.98] shadow-brand-blue/10 disabled:opacity-50'
                  }`}
                >
                  {loading && !hasActive && !hasPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : hasActive ? (
                    <><CheckCircle2 size={18} /> {s.activeSubscription}</>
                  ) : hasPending ? (
                    <><Clock size={18} /> {s.requestPending}</>
                  ) : (
                    <>
                      {s.requestBtn}
                      <ChevronRight size={18} className={dir === 'rtl' ? 'rotate-180' : ''} />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* History Section */}
        {requests.length > 0 && (
          <div className="reveal">
            <div className={`flex items-center gap-3 mb-8 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <History className="text-brand-blue" />
              <h2 className="text-2xl font-black uppercase italic tracking-tight">
                {s.requestHistory}
              </h2>
            </div>

            <div className="bg-zinc-50 border border-zinc-100 rounded-[2rem] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b border-zinc-200 bg-zinc-100/50 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                      <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">
                        {s.plan}
                      </th>
                      <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">
                        {t.admin.status}
                      </th>
                      <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">
                        {s.date}
                      </th>
                      <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">
                        {t.admin.price}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.id} className="border-b border-zinc-100 hover:bg-white transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold text-zinc-900 uppercase italic">
                            {req.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            req.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' :
                            req.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-red-50 text-red-600 border-red-100'
                          }`}>
                            {req.status === 'pending' ? t.admin.pending : 
                             req.status === 'active' ? t.admin.confirmed : 
                             req.status === 'rejected' ? t.admin.cancelled : req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-500 font-medium">
                          {new Date(req.created).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-black text-brand-blue">{req.amount} DH</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
