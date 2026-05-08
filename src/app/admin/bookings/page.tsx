"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getAllBookings, updateBookingStatus, deleteBooking, getStats } from "@/app/actions/admin";
import {
  Loader2, Calendar, Clock, Car, User, CheckCircle2, XCircle, 
  Trash2, ChevronLeft, ChevronRight, Search, Filter, RefreshCw, Eye
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
    setUpdatingId(bookingId);
    const result = await updateBookingStatus(bookingId, newStatus);
    if (result.success) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    } else {
      alert("Failed to update booking");
    }
    setUpdatingId(null);
  };

  const handleDelete = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this booking?")) return;
    setDeletingId(bookingId);
    const result = await deleteBooking(bookingId);
    if (result.success) {
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    }
    setDeletingId(null);
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
      return d.toLocaleDateString('fr-FR', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return "—"; }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch { return "—"; }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    cancelled: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Bookings</h1>
          <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">Manage all car wash reservations</p>
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
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, phone, plate..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all"
          />
        </form>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800/50 mr-2">
            {["all", "pending", "confirmed", "completed", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s
                  ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20"
                  : "text-zinc-500 hover:text-white"
                  }`}
              >
                {s}
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
            Today
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
          {totalItems} booking{totalItems !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Bookings Table */}
      <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/50 bg-zinc-900/50">
                {["Status", "Customer", "Phone", "Vehicle", "Service", "Date & Time", "Price", "Actions"].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500 font-bold">No bookings found</p>
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors group">
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[booking.status] || statusColors.pending}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{booking.full_name}</p>
                          <p className="text-zinc-600 text-[10px] font-mono">#{booking.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-zinc-400 font-medium whitespace-nowrap">{booking.phone}</td>
                    <td className="px-5 py-4 text-zinc-400 font-medium whitespace-nowrap">{booking.plate_number}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-black uppercase ${booking.service_type === 'VIP' ? 'text-brand-gold' : 'text-zinc-400'}`}>
                        {booking.service_type}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="text-zinc-300 font-medium text-xs">{formatDate(booking.date)}</p>
                      <p className="text-zinc-500 text-xs">{formatTime(booking.date)}</p>
                    </td>
                    <td className="px-5 py-4 font-black text-white">{booking.price} DH</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            disabled={updatingId === booking.id}
                            className="p-2 rounded-lg hover:bg-emerald-500/10 text-emerald-400 transition-all disabled:opacity-50"
                            title="Confirm"
                          >
                            {updatingId === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                          </button>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'completed')}
                            disabled={updatingId === booking.id}
                            className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-400 transition-all disabled:opacity-50"
                            title="Complete"
                          >
                            {updatingId === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                          </button>
                        )}
                        {booking.status !== 'cancelled' && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'cancelled')}
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
                          onClick={() => handleDelete(booking.id)}
                          disabled={deletingId === booking.id}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-all disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-6 py-2 text-xs font-black uppercase tracking-widest text-zinc-500">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedBooking(null)} />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <button onClick={() => setSelectedBooking(null)} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all">
              <XCircle className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-brand-blue/10 rounded-2xl flex items-center justify-center">
                <User className="w-7 h-7 text-brand-blue" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">{selectedBooking.full_name}</h2>
                <p className="text-zinc-500 text-xs font-mono">#{selectedBooking.id}</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: "Status", value: selectedBooking.status, highlight: true },
                { label: "Phone", value: selectedBooking.phone },
                { label: "Vehicle", value: selectedBooking.plate_number },
                { label: "Service", value: selectedBooking.service_type },
                { label: "Price", value: `${selectedBooking.price} DH` },
                { label: "Date", value: formatDate(selectedBooking.date) },
                { label: "Time", value: formatTime(selectedBooking.date) },
                { label: "Notes", value: selectedBooking.notes || "—" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-3 border-b border-zinc-800/50">
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
        </div>
      )}
    </div>
  );
}
