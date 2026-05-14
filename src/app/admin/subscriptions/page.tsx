"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getAllSubscriptions, approveSubscription, rejectSubscription } from "@/app/actions/admin";
import {
  Loader2, 
  Search, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Mail, 
  Phone, 
  Check, 
  X,
  CreditCard,
  User,
  Clock,
  AlertCircle
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

type SubscriptionItem = {
  id: string;
  user: string;
  expand: {
    user: {
      full_name: string;
      email: string;
      phone: string;
    }
  };
  expiry_date?: string;
  plan: 'monthly' | 'yearly';
  status: 'pending' | 'active' | 'rejected' | 'expired';
  amount: number;
  notes: string;
  created: string;
  updated: string;
};

export default function AdminSubscriptionsPage() {
  const { language, dir } = useLanguage();
  const t = translations[language];
  
  const [items, setItems] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await getAllSubscriptions(page, 15, statusFilter, searchQuery);
      if (res.success) {
        setItems(res.items as SubscriptionItem[]);
        setTotalPages(res.totalPages);
        setTotalItems(res.totalItems);
      }
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, statusFilter, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleApprove = async (id: string) => {
    if (!confirm(t.admin.approveConfirm)) return;
    setProcessingId(id);
    try {
      const res = await approveSubscription(id);
      if (res.success) {
        fetchData();
      } else {
        alert(res.error);
      }
    } catch (err) {
      alert("Error approving subscription");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt(t.admin.rejectPrompt);
    if (reason === null) return;
    setProcessingId(id);
    try {
      const res = await rejectSubscription(id, reason);
      if (res.success) {
        fetchData();
      } else {
        alert(res.error);
      }
    } catch (err) {
      alert("Error rejecting subscription");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(language === 'ar' ? 'ar-MA' : (language === 'fr' ? 'fr-FR' : 'en-US'), { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch { return "—"; }
  };

  if (loading && !refreshing) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="reveal">
      <div className={`flex items-center justify-between mb-8 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
        <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">
            {language === 'fr' ? 'Abonnements' : (language === 'ar' ? 'الاشتراكات' : 'Subscriptions')}
          </h1>
          <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">
            {language === 'fr' ? 'Gérer la vérification des paiements et l\'activation des plans' : (language === 'ar' ? 'إدارة التحقق من الدفع وتفعيل الخطط' : 'Manage payment verification and plan activation')}
          </p>
        </div>
        <button 
          onClick={fetchData} 
          disabled={refreshing}
          className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-grow">
              <Search className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500`} />
              <input
                type="text"
                placeholder={language === 'fr' ? "Rechercher un client..." : (language === 'ar' ? "البحث عن زبون..." : "Search client...")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className={`w-full ${dir === 'rtl' ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4'} py-3.5 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all`}
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-brand-blue text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-blue/80 transition-all shadow-lg shadow-brand-blue/20 shrink-0"
            >
              {language === 'fr' ? 'Rechercher' : (language === 'ar' ? 'بحث' : 'Search')}
            </button>
          </form>
        </div>
        <div className={`flex gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
          {['pending', 'active', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                statusFilter === status 
                  ? "bg-brand-blue text-white border-brand-blue" 
                  : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              {status === 'pending' ? t.admin.pending : (status === 'active' ? t.admin.confirmed : t.admin.all)}
            </button>
          ))}
        </div>
      </div>

      {/* Table (Desktop) / Cards (Mobile) */}
      <div className="space-y-4">
        {/* Desktop Table */}
        <div className="hidden md:block bg-zinc-900/30 border border-zinc-800/50 rounded-2xl overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b border-zinc-800/50 bg-zinc-900/50 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                  {[t.admin.customer, "Plan Requested", t.admin.services.tablePrice, t.admin.status, "Date", t.admin.actions].map(h => (
                    <th key={h} className={`px-5 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <CreditCard className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                      <p className="text-zinc-500 font-bold">{language === 'fr' ? 'Aucune demande d\'abonnement trouvée' : (language === 'ar' ? 'لم يتم العثور على طلبات اشتراك' : 'No subscription requests found')}</p>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className={`border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors group ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                      <td className="px-5 py-4">
                        <div className={`flex items-center gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                          <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 shrink-0 border border-zinc-700">
                            <User className="w-5 h-5" />
                          </div>
                          <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                            <p className="font-bold text-white text-sm">{item.expand?.user?.full_name || "—"}</p>
                            <p className="text-zinc-600 text-[10px]">{item.expand?.user?.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="font-black text-white uppercase italic text-xs">
                            {item.plan === 'yearly' ? t.pricing.plans.year.name : t.pricing.plans.month.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-bold">
                            {item.notes?.includes("Service ID") ? "Custom Plan" : t.pricing.plans[item.plan === 'yearly' ? 'year' : 'month'].subPrice}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-black text-brand-blue">
                        {item.amount} DH
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          item.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          item.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {item.status === 'pending' ? t.admin.pending : 
                           item.status === 'active' ? t.admin.confirmed : 
                           item.status === 'rejected' ? t.admin.cancelled : item.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-zinc-500 text-xs">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <Clock size={12} className="text-zinc-600" />
                            <span className="text-[9px] font-black uppercase tracking-tight text-zinc-600 w-16">Request:</span>
                            <span className="font-medium">{formatDate(item.created)}</span>
                          </div>
                          {item.status === 'active' && (
                            <>
                              <div className="flex items-center gap-2 text-zinc-400">
                                <Check size={12} className="text-green-500" />
                                <span className="text-[9px] font-black uppercase tracking-tight w-16">Approved:</span>
                                <span className="font-medium">{formatDate(item.updated)}</span>
                              </div>
                              {item.expiry_date && (
                                <div className="flex items-center gap-2 text-brand-blue">
                                  <AlertCircle size={12} />
                                  <span className="text-[9px] font-black uppercase tracking-tight w-16">Expires:</span>
                                  <span className="font-bold">{formatDate(item.expiry_date)}</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {item.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(item.id)}
                                disabled={!!processingId}
                                className="p-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500 hover:text-white transition-all disabled:opacity-50"
                                title="Approve"
                              >
                                {processingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                              </button>
                              <button
                                onClick={() => handleReject(item.id)}
                                disabled={!!processingId}
                                className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                title="Reject"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                          {item.status !== 'pending' && (
                            <span className="text-zinc-600 text-xs italic">{language === 'fr' ? 'Traité' : (language === 'ar' ? 'معالج' : 'Processed')}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4 mb-8">
          {items.length === 0 ? (
            <div className="py-12 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl text-center">
              <CreditCard className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 font-bold text-sm">{language === 'fr' ? 'Aucune demande trouvée' : (language === 'ar' ? 'لم يتم العثور على طلبات' : 'No requests found')}</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5 space-y-4">
                <div className={`flex items-start justify-between ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                      <p className="font-black text-white text-base leading-tight">{item.expand?.user?.full_name || "—"}</p>
                      <p className="text-zinc-600 text-[10px] font-mono mt-0.5">{item.expand?.user?.phone}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    item.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    item.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {item.status === 'pending' ? t.admin.pending : 
                     item.status === 'active' ? t.admin.confirmed : 
                     item.status === 'rejected' ? t.admin.cancelled : item.status}
                  </span>
                </div>

                  <div className={`bg-zinc-950/50 rounded-xl p-4 border border-zinc-800/30 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                    <div className={`flex justify-between items-center mb-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{language === 'fr' ? 'Plan' : (language === 'ar' ? 'الخطة' : 'Plan')}</span>
                      <span className="text-xs font-black text-white uppercase italic">
                        {item.plan === 'yearly' ? t.pricing.plans.year.name : t.pricing.plans.month.name}
                      </span>
                    </div>
                    <div className={`flex justify-between items-center ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t.admin.services.tablePrice}</span>
                      <span className="text-sm font-black text-brand-blue">{item.amount} DH</span>
                    </div>
                  </div>

                <div className="space-y-3 pt-3 border-t border-zinc-800/30">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Clock size={12} />
                      <span className="text-[9px] font-black uppercase tracking-tight w-16">Request:</span>
                      <span className="text-[11px] font-bold">{formatDate(item.created)}</span>
                    </div>
                    {item.status === 'active' && (
                      <div className="flex items-center gap-2 text-green-400">
                        <Check size={12} />
                        <span className="text-[9px] font-black uppercase tracking-tight w-16">Approved:</span>
                        <span className="text-[11px] font-bold">{formatDate(item.updated)}</span>
                      </div>
                    )}
                  </div>

                  {item.status === 'pending' && (
                    <div className={`flex gap-2 pt-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                      <button
                        onClick={() => handleApprove(item.id)}
                        disabled={!!processingId}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 disabled:opacity-50"
                      >
                        {processingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        {t.admin.confirmBtn}
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        disabled={!!processingId}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 disabled:opacity-50"
                      >
                        <X size={14} />
                        {language === 'fr' ? 'Refuser' : (language === 'ar' ? 'رفض' : 'Reject')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={`flex items-center justify-center gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all disabled:opacity-30"
          >
            <ChevronLeft className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
          </button>
          <span className="px-6 py-2 text-xs font-black uppercase tracking-widest text-zinc-500">
            {language === 'fr' ? 'Page' : (language === 'ar' ? 'صفحة' : 'Page')} {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all disabled:opacity-30"
          >
            <ChevronRight className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}
    </div>
  );
}
