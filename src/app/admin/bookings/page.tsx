"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { getAllBookings, updateBookingStatus, deleteBooking, updateBookingAdminNotes } from "@/app/actions/admin";
import { getServices } from "@/app/admin/services/service-actions";
import { ServiceRecord } from "@/app/admin/services/service-types";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import ConfirmModal from "@/components/ConfirmModal";
import {
  Loader2, Calendar, Car, User, CheckCircle2, XCircle, 
  Trash2, ChevronLeft, ChevronRight, Search, RefreshCw, Eye, Tags
} from "lucide-react";

type BookingItem = {
  id: string;
  full_name: string;
  phone: string;
  plate_number: string;
  service_type: string;
  price: number;
  status: string;
  date: string;
  notes: string;
  admin_notes?: string;
  user: string;
  created: string;
};

export default function AdminBookingsPage() {
  const { language, dir } = useLanguage();
  const t = translations[language];
  const adm = t.admin;

  const getServiceTitle = (service_type: string) => {
    if (service_type === 'VIP') return t.pricing.plans.vip.name;
    if (service_type === 'basic') return t.hero.btnSimple;
    return service_type;
  };

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Modal states
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, id: string | null }>({ isOpen: false, id: null });
  const [confirmCancel, setConfirmCancel] = useState<{ isOpen: boolean, id: string | null }>({ isOpen: false, id: null });
  const [confirmConfirm, setConfirmConfirm] = useState<{ isOpen: boolean, id: string | null }>({ isOpen: false, id: null });
  const [confirmComplete, setConfirmComplete] = useState<{ isOpen: boolean, id: string | null }>({ isOpen: false, id: null });
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const [adminNotes, setAdminNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  useEffect(() => {
    if (selectedBooking) {
      setAdminNotes(selectedBooking.admin_notes || "");
    }
  }, [selectedBooking]);

  const handleSaveAdminNotes = async () => {
    if (!selectedBooking) return;
    setSavingNotes(true);
    const result = await updateBookingAdminNotes(selectedBooking.id, adminNotes);
    if (result.success) {
      setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, admin_notes: adminNotes } : b));
      setSelectedBooking(prev => prev ? { ...prev, admin_notes: adminNotes } : null);
      triggerToast("Notes updated successfully!", "success");
    } else {
      triggerToast("Failed to save notes", "error");
    }
    setSavingNotes(false);
  };

  useEffect(() => {
    let active = true;
    const init = async () => {
      await Promise.resolve();
      if (!active) return;
      setIsMounted(true);
      try {
        const s = await getServices();
        if (!active) return;
        setServices(s);
      } catch (err) {
        console.error(err);
      }
    };
    init();
    return () => {
      active = false;
    };
  }, []);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await getAllBookings(page, 15, statusFilter, searchQuery, dateFilter, serviceFilter);
      if (res.success) {
        setBookings(res.items as BookingItem[]);
        setTotalPages(res.totalPages);
        setTotalItems(res.totalItems);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, statusFilter, searchQuery, dateFilter, serviceFilter]);

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

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    setIsActionLoading(true);
    setUpdatingId(bookingId);
    const result = await updateBookingStatus(bookingId, newStatus);
    if (result.success) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      triggerToast(`Status updated to ${newStatus}!`, "success");
      // Close all status modals
      setConfirmCancel({ isOpen: false, id: null });
      setConfirmConfirm({ isOpen: false, id: null });
      setConfirmComplete({ isOpen: false, id: null });
    } else {
      triggerToast(adm.updateError || "Error updating status", "error");
    }
    setUpdatingId(null);
    setIsActionLoading(false);
  };

  const executeDelete = async () => {
    if (!confirmDelete.id) return;
    setIsActionLoading(true);
    const result = await deleteBooking(confirmDelete.id);
    if (result.success) {
      setBookings(prev => prev.filter(b => b.id !== confirmDelete.id));
      triggerToast("Booking deleted successfully!", "success");
      setConfirmDelete({ isOpen: false, id: null });
    } else {
      triggerToast("Failed to delete booking", "error");
    }
    setIsActionLoading(false);
  };


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(language === 'ar' ? 'ar-MA' : (language === 'fr' ? 'fr-FR' : 'en-US'), { 
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
      });
    } catch { return "—"; }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString(language === 'ar' ? 'ar-MA' : (language === 'fr' ? 'fr-FR' : 'en-US'), { 
        hour: '2-digit', minute: '2-digit' 
      });
    } catch { return "—"; }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    cancelled: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  };

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
    <>
      <div className="reveal">
        <div className={`flex items-center justify-between mb-8 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">{adm.bookings}</h1>
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">
              {adm.bookingsSubtitle}
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

        {/* Filters */}
        <div className={`flex flex-col gap-4 mb-8`}>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-grow">
              <Search className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500`} />
              <input
                type="text"
                placeholder={adm.searchPlaceholder}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className={`w-full ${dir === 'rtl' ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4'} py-3.5 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all`}
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-brand-blue text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-blue/80 transition-all shadow-lg shadow-brand-blue/20 shrink-0"
            >
              {adm.searchBtn}
            </button>
          </form>

          {/* Service Filter (NEW) */}
          <div className="flex-1 overflow-x-auto no-scrollbar">
            <div className={`flex items-center gap-1 min-w-max ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => { setServiceFilter('all'); setPage(1); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${serviceFilter === 'all'
                  ? "bg-zinc-100 text-zinc-900 shadow-lg shadow-white/10"
                  : "bg-zinc-900/50 text-zinc-500 hover:text-white border border-zinc-800/50"
                  }`}
              >
                <Tags size={14} />
                {adm.allServices}
              </button>
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setServiceFilter(s.id); setPage(1); }}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${serviceFilter === s.id
                    ? "bg-zinc-100 text-zinc-900 shadow-lg shadow-white/10"
                    : "bg-zinc-900/50 text-zinc-500 hover:text-white border border-zinc-800/50"
                    }`}
                >
                  {language === 'fr' ? s.title_fr : (language === 'ar' ? s.title_ar : s.title_en)}
                </button>
              ))}
            </div>
          </div>
          
          <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 ${dir === 'rtl' ? 'sm:flex-row-reverse' : ''}`}>
            <div className={`flex-1 overflow-x-auto no-scrollbar`}>
              <div className={`flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800/50 min-w-max ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                {["all", "pending", "confirmed", "completed", "cancelled"].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setPage(1); }}
                    className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s
                      ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20"
                      : "text-zinc-500 hover:text-white"
                      }`}
                  >
                    {s === 'all' ? adm.all : statusText[s]}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => { setDateFilter(dateFilter === 'today' ? '' : 'today'); setPage(1); }}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${dateFilter === 'today'
                ? "bg-brand-gold text-black shadow-lg shadow-brand-gold/20"
                : "bg-zinc-900/50 text-zinc-500 hover:text-white border border-zinc-800/50 hover:border-zinc-700"
                }`}
            >
              {adm.today}
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className={`flex items-center justify-between mb-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
            {totalItems} {adm.bookingsFound}
          </p>
        </div>

        {/* Bookings Table (Desktop) / Cards (Mobile) */}
        <div className="space-y-4">
          {/* Desktop Table */}
          <div className="hidden md:block bg-zinc-900/30 border border-zinc-800/50 rounded-2xl overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b border-zinc-800/50 bg-zinc-900/50 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                    {[adm.status, adm.customer, adm.phone, adm.vehicle, adm.service, adm.dateTime, adm.price, adm.actions].map(h => (
                      <th key={h} className={`px-5 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-20 text-center">
                        <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <p className="text-zinc-500 font-bold">{adm.noBookings}</p>
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking) => (
                      <React.Fragment key={booking.id}>
                        <tr className={`border-b ${booking.admin_notes ? 'border-b-0' : 'border-zinc-800/30'} hover:bg-zinc-800/20 transition-colors group ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                          <td className="px-5 py-4">
                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[booking.status] || statusColors.pending}`}>
                              {statusText[booking.status]}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className={`flex items-center gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                              <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 shrink-0">
                                <User className="w-4 h-4" />
                              </div>
                              <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                                <p className="font-bold text-white text-sm">{booking.full_name}</p>
                                <p className="text-zinc-600 text-[10px] font-mono">#{booking.id.slice(0, 8)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-zinc-400 font-medium whitespace-nowrap">{booking.phone}</td>
                          <td className="px-5 py-4 text-zinc-400 font-medium whitespace-nowrap">{booking.plate_number}</td>
                          <td className="px-5 py-4">
                            <span className={`text-xs font-black uppercase ${booking.service_type === 'VIP' ? 'text-brand-gold' : 'text-zinc-400'}`}>
                              {getServiceTitle(booking.service_type)}
                            </span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <p className="text-zinc-300 font-medium text-xs">{formatDate(booking.date)}</p>
                            <p className="text-zinc-500 text-xs">{formatTime(booking.date)}</p>
                          </td>
                          <td className="px-5 py-4 font-black text-white">{booking.price === -1 ? adm.onSite : `${booking.price} DH`}</td>
                          <td className="px-5 py-4">
                            <div className={`flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                              {booking.status === 'pending' && (
                                <button
                                  onClick={() => setConfirmConfirm({ isOpen: true, id: booking.id })}
                                  disabled={updatingId === booking.id}
                                  className="p-2 rounded-lg hover:bg-emerald-500/10 text-emerald-400 transition-all disabled:opacity-50"
                                  title="Confirm"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              )}
                              {booking.status === 'confirmed' && (
                                <button
                                  onClick={() => setConfirmComplete({ isOpen: true, id: booking.id })}
                                  disabled={updatingId === booking.id}
                                  className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-400 transition-all disabled:opacity-50"
                                  title="Complete"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              )}
                              {(booking.status !== 'cancelled' && booking.status !== 'completed') && (
                                <button
                                  onClick={() => setConfirmCancel({ isOpen: true, id: booking.id })}
                                  disabled={updatingId === booking.id}
                                  className="p-2 rounded-lg hover:bg-amber-500/10 text-amber-400 transition-all disabled:opacity-50"
                                  title="Cancel"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedBooking(booking)}
                                className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-400 transition-all"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setConfirmDelete({ isOpen: true, id: booking.id })}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-all disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {booking.admin_notes && (
                          <tr className="border-b border-zinc-800/30 bg-zinc-950/20 hover:bg-zinc-800/20 transition-colors">
                            <td colSpan={8} className="px-5 py-2.5 text-xs text-brand-gold italic">
                              <div className={`flex items-center gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                <span className="font-black uppercase tracking-widest text-[8px] px-2 py-0.5 rounded bg-brand-gold/10 border border-brand-gold/20 shrink-0">Note:</span>
                                <span className="truncate">{booking.admin_notes}</span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4 mb-8">
            {bookings.length === 0 ? (
              <div className="py-12 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl text-center">
                <Calendar className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 font-bold text-sm">{adm.noBookings}</p>
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5 space-y-4">
                  <div className={`flex items-start justify-between ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                        <p className="font-black text-white text-base leading-tight">{booking.full_name}</p>
                        <p className="text-zinc-600 text-[10px] font-mono mt-0.5">#{booking.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors[booking.status] || statusColors.pending}`}>
                      {statusText[booking.status]}
                    </span>
                  </div>

                  <div className={`grid grid-cols-2 gap-4 py-4 border-y border-zinc-800/30 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                    <div>
                      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">{adm.vehicle}</p>
                      <p className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                        <Car className="w-3.5 h-3.5 text-brand-blue" />
                        {booking.plate_number}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">{adm.service}</p>
                      <p className={`text-sm font-black uppercase ${booking.service_type === 'VIP' ? 'text-brand-gold' : 'text-zinc-300'}`}>
                        {getServiceTitle(booking.service_type)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">{adm.dateTime}</p>
                      <p className="text-xs font-bold text-zinc-400">{formatDate(booking.date)}</p>
                      <p className="text-[10px] text-zinc-600">{formatTime(booking.date)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">{adm.price}</p>
                      <p className="text-base font-black text-white">{booking.price === -1 ? adm.onSite : `${booking.price} DH`}</p>
                    </div>
                  </div>

                  {booking.admin_notes && (
                    <div className={`p-3 rounded-xl bg-brand-gold/5 border border-brand-gold/10 text-xs text-brand-gold italic flex items-center gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                      <span className="font-black uppercase tracking-widest text-[8px] px-2 py-0.5 rounded bg-brand-gold/10 border border-brand-gold/20 shrink-0">Note:</span>
                      <span className="truncate">{booking.admin_notes}</span>
                    </div>
                  )}

                  <div className={`flex items-center justify-between gap-2 pt-1 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-1 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-xl text-zinc-400 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {adm.details}
                      </button>
                    </div>

                    <div className={`flex items-center gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => setConfirmConfirm({ isOpen: true, id: booking.id })}
                          disabled={updatingId === booking.id}
                          className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => setConfirmComplete({ isOpen: true, id: booking.id })}
                          disabled={updatingId === booking.id}
                          className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      {(booking.status !== 'cancelled' && booking.status !== 'completed') && (
                        <button
                          onClick={() => setConfirmCancel({ isOpen: true, id: booking.id })}
                          disabled={updatingId === booking.id}
                          className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setConfirmDelete({ isOpen: true, id: booking.id })}
                        className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
              {adm.page} {page} / {totalPages}
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

      {/* Detail Modal */}
      {selectedBooking && isMounted && createPortal(
        <div className="fixed inset-0 z-[900] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedBooking(null)} />
          <div className={`relative bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
            <button onClick={() => setSelectedBooking(null)} className={`absolute top-4 ${dir === 'rtl' ? 'left-4' : 'right-4'} p-2 rounded-xl hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all`}>
              <XCircle className="w-5 h-5" />
            </button>
            <div className={`flex items-center gap-4 mb-10 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center border border-brand-blue/20">
                <User className="w-8 h-8 text-brand-blue" />
              </div>
              <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">{selectedBooking.full_name}</h2>
                <p className="text-zinc-500 text-[10px] font-mono mt-2 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                  #{selectedBooking.id}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              {[
                { label: adm.status, value: statusText[selectedBooking.status], highlight: true },
                { label: adm.phone, value: selectedBooking.phone },
                { label: adm.vehicle, value: selectedBooking.plate_number },
                { label: adm.service, value: getServiceTitle(selectedBooking.service_type) },
                { label: adm.price, value: selectedBooking.price === -1 ? adm.onSite : `${selectedBooking.price} DH` },
                { label: t.booking.form.date, value: formatDate(selectedBooking.date) },
                { label: t.booking.form.time, value: formatTime(selectedBooking.date) },
                { label: adm.notes, value: selectedBooking.notes || "—" },
              ].map((row) => (
                <div key={row.label} className={`flex justify-between items-start gap-6 py-5 border-b border-zinc-800/50 last:border-0 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] pt-1 shrink-0 w-24">{row.label}</span>
                  {row.highlight ? (
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-lg ${statusColors[selectedBooking.status] || ''}`}>
                      {row.value}
                    </span>
                  ) : (
                    <span className={`text-[15px] font-bold text-white break-words flex-1 leading-relaxed ${dir === 'rtl' ? 'text-left' : 'text-right'}`}>
                      {row.value}
                    </span>
                  )}
                </div>
              ))}
              
              <div className={`flex flex-col gap-3 py-5 border-t border-zinc-800/50 mt-4`}>
                <label className={`text-[9px] font-black text-brand-gold uppercase tracking-[0.2em] ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                  Admin Notes (Internal Only)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add private notes for this reservation..."
                  className={`w-full bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all min-h-[100px] resize-y ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                />
                <button
                  onClick={handleSaveAdminNotes}
                  disabled={savingNotes}
                  className={`flex items-center justify-center gap-2 px-6 py-3 bg-brand-gold text-black rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-gold/80 transition-all disabled:opacity-50 self-end`}
                >
                  {savingNotes ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Confirmation Modals */}
      <ConfirmModal 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null })}
        onConfirm={executeDelete}
        title={adm.deleteBtn}
        message={adm.deleteConfirm}
        confirmText={adm.deleteBtn}
        cancelText={adm.cancelBtn}
        variant="danger"
        isLoading={isActionLoading}
      />

      <ConfirmModal 
        isOpen={confirmCancel.isOpen}
        onClose={() => setConfirmCancel({ isOpen: false, id: null })}
        onConfirm={() => confirmCancel.id && handleStatusChange(confirmCancel.id, 'cancelled')}
        title={adm.confirmBtn}
        message={adm.cancelConfirm}
        confirmText={adm.confirmCancelBtn}
        cancelText={adm.cancelBtn}
        variant="warning"
        isLoading={isActionLoading}
      />

      <ConfirmModal 
        isOpen={confirmConfirm.isOpen}
        onClose={() => setConfirmConfirm({ isOpen: false, id: null })}
        onConfirm={() => confirmConfirm.id && handleStatusChange(confirmConfirm.id, 'confirmed')}
        title={adm.confirmBtn}
        message={adm.confirmConfirm}
        confirmText={adm.confirmBtn}
        cancelText={adm.cancelBtn}
        variant="info"
        isLoading={isActionLoading}
      />

      <ConfirmModal 
        isOpen={confirmComplete.isOpen}
        onClose={() => setConfirmComplete({ isOpen: false, id: null })}
        onConfirm={() => confirmComplete.id && handleStatusChange(confirmComplete.id, 'completed')}
        title={adm.confirmBtn}
        message={adm.completeConfirm}
        confirmText={adm.confirmBtn}
        cancelText={adm.cancelBtn}
        variant="info"
        isLoading={isActionLoading}
      />

      {toast && (
        <div 
          className="fixed bottom-6 right-6 z-[999] pointer-events-none"
          style={{
            animation: 'slideUp 0.3s ease-out forwards'
          }}
        >
          <style>{`
            @keyframes slideUp {
              from { transform: translateY(1rem); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-md shadow-2xl ${
            toast.type === 'success' 
              ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-400' 
              : 'bg-red-950/90 border-red-500/30 text-red-400'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
            <span className="text-xs font-bold tracking-wide">{toast.message}</span>
          </div>
        </div>
      )}
    </>
  );
}

