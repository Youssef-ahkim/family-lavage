"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { getAllBookings, updateBookingStatus, deleteBooking } from "@/app/actions/admin";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import ConfirmModal from "@/components/ConfirmModal";
import {
  Loader2, Calendar, Clock, Car, User, CheckCircle2, XCircle, 
  Trash2, ChevronLeft, ChevronRight, Search, RefreshCw, Eye
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
  user: string;
  created: string;
};

export default function AdminBookingsPage() {
  const { language, dir } = useLanguage();
  const t = translations[language];
  const adm = t.admin;

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await getAllBookings(page, 15, statusFilter, searchQuery, dateFilter);
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
  }, [page, statusFilter, searchQuery, dateFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    setIsActionLoading(true);
    setUpdatingId(bookingId);
    const result = await updateBookingStatus(bookingId, newStatus);
    if (result.success) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      // Close all status modals
      setConfirmCancel({ isOpen: false, id: null });
      setConfirmConfirm({ isOpen: false, id: null });
      setConfirmComplete({ isOpen: false, id: null });
    } else {
      alert((adm as any).updateError || "Error");
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
      setConfirmDelete({ isOpen: false, id: null });
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
              {language === 'fr' ? 'Gérer toutes les réservations de lavage de voiture' : (language === 'ar' ? 'إدارة جميع حجوزات غسيل السيارات' : 'Manage all car wash reservations')}
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
        <div className={`flex flex-col lg:flex-row gap-4 mb-8 ${dir === 'rtl' ? 'lg:flex-row-reverse' : ''}`}>
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500`} />
            <input
              type="text"
              placeholder={adm.searchPlaceholder}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={`w-full ${dir === 'rtl' ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4'} py-3.5 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all`}
            />
          </form>
          <div className={`flex flex-wrap items-center gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800/50 ${dir === 'rtl' ? 'ml-2' : 'mr-2'} ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
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
            <button
              onClick={() => { setDateFilter(dateFilter === 'today' ? '' : 'today'); setPage(1); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${dateFilter === 'today'
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
            {totalItems} {adm.bookings} {language === 'fr' ? 'trouvées' : ''}
          </p>
        </div>

        {/* Bookings Table */}
        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl overflow-hidden mb-8">
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
                    <tr key={booking.id} className={`border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors group ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
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
                          {booking.service_type === 'VIP' ? t.pricing.plans.vip.name : (language === 'fr' ? 'Simple' : (language === 'ar' ? 'عادي' : 'Basic'))}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="text-zinc-300 font-medium text-xs">{formatDate(booking.date)}</p>
                        <p className="text-zinc-500 text-xs">{formatTime(booking.date)}</p>
                      </td>
                      <td className="px-5 py-4 font-black text-white">{booking.price} DH</td>
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
                  ))
                )}
              </tbody>
            </table>
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

      {/* Detail Modal */}
      {selectedBooking && mounted && createPortal(
        <div className="fixed inset-0 z-[900] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedBooking(null)} />
          <div className={`relative bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
            <button onClick={() => setSelectedBooking(null)} className={`absolute top-4 ${dir === 'rtl' ? 'left-4' : 'right-4'} p-2 rounded-xl hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all`}>
              <XCircle className="w-5 h-5" />
            </button>
            <div className={`flex items-center gap-4 mb-8 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <div className="w-14 h-14 bg-brand-blue/10 rounded-2xl flex items-center justify-center">
                <User className="w-7 h-7 text-brand-blue" />
              </div>
              <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                <h2 className="text-xl font-black uppercase tracking-tight">{selectedBooking.full_name}</h2>
                <p className="text-zinc-500 text-xs font-mono">#{selectedBooking.id}</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: adm.status, value: statusText[selectedBooking.status], highlight: true },
                { label: adm.phone, value: selectedBooking.phone },
                { label: adm.vehicle, value: selectedBooking.plate_number },
                { label: adm.service, value: selectedBooking.service_type },
                { label: adm.price, value: `${selectedBooking.price} DH` },
                { label: language === 'fr' ? 'Date' : 'Date', value: formatDate(selectedBooking.date) },
                { label: language === 'fr' ? 'Heure' : 'Time', value: formatTime(selectedBooking.date) },
                { label: adm.notes, value: selectedBooking.notes || "—" },
              ].map((row) => (
                <div key={row.label} className={`flex justify-between items-center py-3 border-b border-zinc-800/50 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{row.label}</span>
                  {row.highlight ? (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[selectedBooking.status] || ''}`}>
                      {row.value}
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-white">{row.value}</span>
                  )}
                </div>
              ))}
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
        title={language === 'fr' ? 'Confirmation' : (language === 'ar' ? 'تأكيد' : 'Confirmation')}
        message={adm.cancelConfirm}
        confirmText={language === 'fr' ? "Confirmer l'annulation" : (language === 'ar' ? 'تأكيد الإلغاء' : 'Confirm Cancellation')}
        cancelText={adm.cancelBtn}
        variant="warning"
        isLoading={isActionLoading}
      />

      <ConfirmModal 
        isOpen={confirmConfirm.isOpen}
        onClose={() => setConfirmConfirm({ isOpen: false, id: null })}
        onConfirm={() => confirmConfirm.id && handleStatusChange(confirmConfirm.id, 'confirmed')}
        title={language === 'fr' ? 'Confirmation' : (language === 'ar' ? 'تأكيد' : 'Confirmation')}
        message={(adm as any).confirmConfirm}
        confirmText={adm.confirmBtn}
        cancelText={adm.cancelBtn}
        variant="info"
        isLoading={isActionLoading}
      />

      <ConfirmModal 
        isOpen={confirmComplete.isOpen}
        onClose={() => setConfirmComplete({ isOpen: false, id: null })}
        onConfirm={() => confirmComplete.id && handleStatusChange(confirmComplete.id, 'completed')}
        title={language === 'fr' ? 'Terminer' : (language === 'ar' ? 'إتمام' : 'Complete')}
        message={(adm as any).completeConfirm}
        confirmText={adm.confirmBtn}
        cancelText={adm.cancelBtn}
        variant="info"
        isLoading={isActionLoading}
      />
    </>
  );
}

