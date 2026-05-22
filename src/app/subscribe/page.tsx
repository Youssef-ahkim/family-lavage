"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  CreditCard, 
  Calendar,
  History,
  Clock,
  Car
} from "lucide-react";

export default function SubscribePage() {
  const { language, dir } = useLanguage();
  const { profile, isLoading: profileLoading } = useProfile();
  const router = useRouter();
  const t = translations[language];
  const s = t.subscription;

  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [isFetchingRequests, setIsFetchingRequests] = useState(true);
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [isFetchingPlans, setIsFetchingPlans] = useState(true);

  // Only redirect if they try to subscribe without being logged in
  // Handled in handleSubscribe now


  useEffect(() => {
    if (profile) {
      fetchRequests();
    }
    fetchPlans();
  }, [profile]);

  const fetchPlans = async () => {
    try {
      const { getServiceOffers } = await import("../admin/services/service-actions");
      const data = await getServiceOffers();
      setDbPlans(data.filter((s: any) => s.active && s.category === 'subscription'));
    } catch (err) {
      console.error("Error fetching plans:", err);
    } finally {
      setIsFetchingPlans(false);
    }
  };

  const fetchRequests = async () => {
    const data = await getMySubscriptionRequests();
    setRequests(data);
    setIsFetchingRequests(false);
    
    // Check if user already has a pending or active request
    if (data.some((r: any) => r.status === 'pending' || r.status === 'active')) {
      setIsSubmitted(true);
    }
  };

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
        setIsSubmitted(true);
        fetchRequests();
      } else {
        const errorKey = result.error || "errors.general";
        const errorMsg = errorKey.split('.').reduce((obj: any, key: string) => obj?.[key], t) || t.errors.general;
        setError(errorMsg);
      }
    } catch (err) {
      setError(t.errors.general);
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

  if (isSubmitted) {
    const activeSub = requests.find((r: any) => r.status === 'active');
    const pendingSub = requests.find((r: any) => r.status === 'pending');

    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-3xl mx-auto pt-40 px-4 text-center">
          <div className="reveal">
            <div className={`w-24 h-24 ${activeSub ? 'bg-green-50' : 'bg-brand-blue/10'} rounded-full flex items-center justify-center mx-auto mb-8`}>
              {activeSub ? <CheckCircle2 className="text-green-600 w-12 h-12" /> : <Clock className="text-brand-blue w-12 h-12" />}
            </div>
            <h1 className="text-4xl font-black mb-4 uppercase italic tracking-tighter">
              {activeSub ? (language === 'fr' ? 'Abonnement Actif' : (language === 'ar' ? 'اشتراك نشط' : 'Active Subscription')) : s.successTitle}
            </h1>
            <p className="text-zinc-500 mb-12 text-lg">
              {activeSub 
                ? (language === 'fr' ? `Vous êtes actuellement abonné.` : 
                   language === 'ar' ? `أنت مشترك حالياً.` : 
                   `You are currently subscribed.`)
                : (
                  <>
                    {s.successDesc} <br />
                    <span className="text-brand-blue font-bold">{s.pendingDesc}</span>
                  </>
                )
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/profile" className="btn-primary inline-flex">
                {t.nav.profile}
              </Link>
              <Link href="/" className="btn-outline inline-flex border-2 border-zinc-200 py-4 px-8 rounded-2xl font-bold">
                {s.backHome}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans overflow-x-hidden">
      <Navbar />

      <div className="max-w-6xl mx-auto pt-32 pb-24 px-4">
        {/* Header */}
        <div className={`mb-16 reveal ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-4">
            {s.title} <span className="text-brand-blue">{s.titleAccent}</span>
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
              <p className="text-zinc-400 font-bold uppercase tracking-widest">{language === 'fr' ? 'Chargement des plans...' : (language === 'ar' ? 'جاري تحميل الخطط...' : 'Loading plans...')}</p>
            </div>
          ) : dbPlans.map((plan) => {
            const name = language === 'fr' ? plan.title_fr : (language === 'ar' ? plan.title_ar : plan.title_en);
            const features = language === 'fr' ? plan.features_fr : (language === 'ar' ? plan.features_ar : plan.features_en);
            const isMonthly = plan.plan_type === 'monthly';
            
            return (
              <div 
                key={plan.id}
                className={`relative flex flex-col p-10 rounded-[3rem] border-2 transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl hover:shadow-brand-blue/10 bg-zinc-50 border-zinc-100 hover:border-brand-blue reveal`}
              >
                <h3 className="text-2xl font-black mb-6 uppercase tracking-tight italic text-zinc-900">
                  {name}
                </h3>
                <div className="flex items-baseline gap-1 mb-10">
                  <span className="text-6xl font-black tracking-tighter text-zinc-900">{plan.price}</span>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-xs font-bold text-zinc-400 uppercase">DH</span>
                    <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">
                      {plan.washes_count} {language === 'fr' ? 'LAVAGES' : (language === 'ar' ? 'غسلات' : 'WASHES')} {isMonthly ? t.pricing.perMonth : t.pricing.perYear}
                    </span>
                  </div>
                </div>

                <div className="h-px w-full bg-zinc-200 mb-10" />

                <ul className="space-y-5 mb-12 flex-grow">
                  {features.map((feature: string, fIdx: number) => (
                    <li key={fIdx} className={`flex items-center gap-3 text-base text-zinc-600 font-medium ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''}`}>
                      <CheckCircle2 size={18} className="text-brand-blue shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading}
                  className="w-full py-5 bg-brand-blue text-white font-black uppercase tracking-[0.2em] text-sm rounded-2xl hover:bg-brand-blue/80 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-blue/20 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : s.requestBtn}
                  {!loading && <ChevronRight size={18} className={dir === 'rtl' ? 'rotate-180' : ''} />}
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
              <h2 className="text-2xl font-black uppercase italic tracking-tight">Historique des demandes</h2>
            </div>

            <div className="bg-zinc-50 border border-zinc-100 rounded-[2rem] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b border-zinc-200 bg-zinc-100/50 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                      <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">Plan</th>
                      <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">Statut</th>
                      <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">Date</th>
                      <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">Prix</th>
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
