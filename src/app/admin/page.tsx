"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getStats, getAllBookings } from "@/app/actions/admin";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import {
  Loader2, Calendar, CheckCircle2, XCircle, AlertCircle, 
  TrendingUp, CalendarDays, BarChart3, ArrowRight, RefreshCw,
  Users, Briefcase, Zap, Clock
} from "lucide-react";

type Stats = {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  todayCount: number;
  totalRevenue: number;
};

type RecentBooking = {
  id: string;
  full_name: string;
  service_type: string;
  price: number;
  status: string;
  date: string;
};

export default function AdminDashboardPage() {
  const { language, dir } = useLanguage();
  const t = translations[language];
  const adm = t.admin;

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        getStats(),
        getAllBookings(1, 5) // Just get the 5 most recent
      ]);
      
      if (statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
      if (bookingsRes.success) {
        setRecentBookings(bookingsRes.items as RecentBooking[]);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      await Promise.resolve();
      if (!active) return;
      await fetchData();
    };
    load();
    return () => {
      active = false;
    };
  }, [fetchData]);

  const statusText: Record<string, string> = {
    pending: adm.pending,
    confirmed: adm.confirmed,
    completed: adm.completed,
    cancelled: adm.cancelled,
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
      <div className={`flex items-center justify-between mb-10 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
        <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">{adm.title}</h1>
          <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">
            {adm.dashboard?.overview || "Overview"}
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

      {/* Stats Cards */}
      {stats && (
        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
          {[
            { label: adm.all, value: stats.total, icon: <BarChart3 size={20} />, color: "text-white", bg: "bg-zinc-900", href: "/admin/bookings" },
            { label: adm.pending, value: stats.pending, icon: <AlertCircle size={20} />, color: "text-amber-400", bg: "bg-amber-500/5 border-amber-500/10", href: "/admin/bookings?status=pending" },
            { label: adm.confirmed, value: stats.confirmed, icon: <CheckCircle2 size={20} />, color: "text-emerald-400", bg: "bg-emerald-500/5 border-emerald-500/10", href: "/admin/bookings?status=confirmed" },
            { label: adm.cancelled, value: stats.cancelled, icon: <XCircle size={20} />, color: "text-zinc-500", bg: "bg-zinc-900", href: "/admin/bookings?status=cancelled" },
            { label: adm.today, value: stats.todayCount, icon: <CalendarDays size={20} />, color: "text-blue-400", bg: "bg-blue-500/5 border-blue-500/10", href: "/admin/bookings?date=today" },
            { label: adm.dashboard.revenue, value: `${stats.totalRevenue} DH`, icon: <TrendingUp size={20} />, color: "text-brand-gold", bg: "bg-brand-gold/5 border-brand-gold/10" },
          ].map((stat) => (
            <Link 
              key={stat.label} 
              href={stat.href || "#"}
              className={`${stat.bg} border border-zinc-800/50 rounded-2xl p-5 transition-all hover:scale-[1.02] hover:border-zinc-700 block group ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
            >
              <div className={`${stat.color} mb-3 group-hover:scale-110 transition-transform ${dir === 'rtl' ? 'flex justify-end' : ''}`}>{stat.icon}</div>
              <p className="text-2xl font-black tracking-tight">{stat.value}</p>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{stat.label}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`flex items-center justify-between ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <h2 className={`text-xl font-black uppercase italic tracking-tight flex items-center gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <Clock size={20} className="text-brand-blue" />
              {adm.dashboard?.recentBookings}
            </h2>
            <Link href="/admin/bookings" className={`text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-brand-blue transition-colors flex items-center gap-1 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
              {adm.dashboard?.viewAll} <ArrowRight size={14} className={dir === 'rtl' ? 'rotate-180' : ''} />
            </Link>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl overflow-hidden">
            {recentBookings.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 italic">
                {adm.dashboard?.noActivity}
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/50">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className={`p-5 flex items-center justify-between hover:bg-zinc-800/20 transition-all ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400">
                        <Calendar size={18} />
                      </div>
                      <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                        <p className="font-bold text-sm text-white">{booking.full_name}</p>
                        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">
                          {booking.service_type} • {booking.price} DH
                        </p>
                      </div>
                    </div>
                    <div className={dir === 'rtl' ? 'text-left' : 'text-right'}>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                        booking.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/10' :
                        booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' :
                        'bg-zinc-800 text-zinc-500'
                      }`}>
                        {statusText[booking.status]}
                      </span>
                      <p className="text-[10px] text-zinc-600 mt-1 font-mono">{new Date(booking.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links / Shortcuts */}
        <div className="space-y-6">
          <h2 className={`text-xl font-black uppercase italic tracking-tight flex items-center gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <Zap size={20} className="text-brand-gold" />
            {adm.dashboard?.quickActions}
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {[
              { 
                name: adm.dashboard?.manageBookings, 
                href: "/admin/bookings", 
                icon: <Calendar size={18} />, 
                desc: adm.dashboard?.manageBookingsDesc
              },
              { 
                name: adm.dashboard?.viewClients, 
                href: "/admin/clients", 
                icon: <Users size={18} />, 
                desc: adm.dashboard?.viewClientsDesc
              },
              { 
                name: adm.dashboard?.priceSettings, 
                href: "/admin/services", 
                icon: <Briefcase size={18} />, 
                desc: adm.dashboard?.priceSettingsDesc
              },
            ].map((link) => (
              <Link 
                key={link.name}
                href={link.href}
                className={`p-5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-brand-blue/50 transition-all group ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
              >
                <div className={`flex items-center gap-4 mb-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <div className="p-2 bg-brand-blue/10 text-brand-blue rounded-lg group-hover:bg-brand-blue group-hover:text-white transition-all">
                    {link.icon}
                  </div>
                  <p className="font-bold text-white">{link.name}</p>
                </div>
                <p className="text-xs text-zinc-500">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
