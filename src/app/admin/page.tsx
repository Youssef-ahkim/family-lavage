"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { verifyAdmin, getAllBookings, updateBookingStatus, deleteBooking, getStats, getAllUsers } from "@/app/actions/admin";
import {
  Shield, ShieldAlert, Loader2, Calendar, Clock, Car, User, Phone,
  CheckCircle2, XCircle, AlertCircle, Trash2, ChevronLeft, ChevronRight,
  Search, Filter, RefreshCw, TrendingUp, DollarSign, CalendarDays, Users,
  BarChart3, ArrowRight, LogOut, Eye
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

type Stats = {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  todayCount: number;
  totalRevenue: number;
};

type UserItem = {
  id: string;
  name: string;
  full_name: string;
  email: string;
  phone: string;
  plate: string;
  role: string;
  created: string;
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"bookings" | "users">("bookings");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [totalUsersPages, setTotalUsersPages] = useState(1);
  const [totalUsersItems, setTotalUsersItems] = useState(0);
  const [usersSearchInput, setUsersSearchInput] = useState("");
  const [usersSearchQuery, setUsersSearchQuery] = useState("");
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Verify admin on mount
  useEffect(() => {
    const check = async () => {
      const result = await verifyAdmin();
      setIsAdmin(result.isAdmin);
      if (!result.isAdmin) setLoading(false);
    };
    check();
  }, []);

  const fetchData = useCallback(async () => {
    if (!isAdmin) return;
    setRefreshing(true);
    try {
      const [bookingsRes, statsRes] = await Promise.all([
        getAllBookings(page, 15, statusFilter, searchQuery),
        getStats(),
      ]);
      if (bookingsRes.success) {
        setBookings(bookingsRes.items as BookingItem[]);
        setTotalPages(bookingsRes.totalPages);
        setTotalItems(bookingsRes.totalItems);
      }
      if (statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin, page, statusFilter, searchQuery]);

  const fetchUsersData = useCallback(async () => {
    if (!isAdmin) return;
    setRefreshing(true);
    try {
      const res = await getAllUsers(usersPage, 15, usersSearchQuery);
      if (res.success) {
        setUsers(res.items as UserItem[]);
        setTotalUsersPages(res.totalPages);
        setTotalUsersItems(res.totalItems);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setRefreshing(false);
    }
  }, [isAdmin, usersPage, usersSearchQuery]);

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === "bookings") fetchData();
      if (activeTab === "users") fetchUsersData();
    }
  }, [isAdmin, activeTab, fetchData, fetchUsersData]);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId);
    const result = await updateBookingStatus(bookingId, newStatus);
    if (result.success) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      fetchData(); // refresh stats
    } else {
      alert("Failed to update booking: " + (result.details?.message || result.error));
    }
    setUpdatingId(null);
  };

  const handleDelete = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this booking?")) return;
    setDeletingId(bookingId);
    const result = await deleteBooking(bookingId);
    if (result.success) {
      setBookings(prev => prev.filter(b => b.id !== bookingId));
      fetchData();
    }
    setDeletingId(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleUsersSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setUsersSearchQuery(usersSearchInput);
    setUsersPage(1);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "—";
      return d.toLocaleDateString('fr-FR', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return "—"; }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "—";
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch { return "—"; }
  };

  // Loading state
  if (isAdmin === null || (isAdmin && loading)) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-blue animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Unauthorized
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md reveal">
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">
            Access Denied
          </h1>
          <p className="text-zinc-500 mb-8">
            You don&apos;t have permission to access this area. Only administrators can view this page.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-zinc-950 font-black uppercase text-sm tracking-widest rounded-2xl hover:bg-zinc-100 transition-all active:scale-95">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    cancelled: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
    completed: "bg-brand-blue/10 text-blue-400 border-blue-500/20",
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-brand-blue rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tight">Admin Dashboard</h1>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Family Lavage</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => fetchData()} disabled={refreshing} className="p-2.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <Link href="/" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white text-sm font-bold transition-all">
              <LogOut className="w-4 h-4" /> Exit
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10 reveal">
            {[
              { label: "Total", value: stats.total, icon: <BarChart3 className="w-5 h-5" />, color: "text-white", bg: "bg-zinc-800/50" },
              { label: "Pending", value: stats.pending, icon: <AlertCircle className="w-5 h-5" />, color: "text-amber-400", bg: "bg-amber-500/5 border-amber-500/10" },
              { label: "Confirmed", value: stats.confirmed, icon: <CheckCircle2 className="w-5 h-5" />, color: "text-emerald-400", bg: "bg-emerald-500/5 border-emerald-500/10" },
              { label: "Cancelled", value: stats.cancelled, icon: <XCircle className="w-5 h-5" />, color: "text-zinc-500", bg: "bg-zinc-800/30" },
              { label: "Today", value: stats.todayCount, icon: <CalendarDays className="w-5 h-5" />, color: "text-blue-400", bg: "bg-blue-500/5 border-blue-500/10" },
              { label: "Revenue", value: `${stats.totalRevenue} DH`, icon: <TrendingUp className="w-5 h-5" />, color: "text-brand-gold", bg: "bg-brand-gold/5 border-brand-gold/10" },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.bg} border border-zinc-800/50 rounded-2xl p-5 transition-all hover:scale-[1.02]`}>
                <div className={`${stat.color} mb-3`}>{stat.icon}</div>
                <p className="text-2xl font-black tracking-tight">{stat.value}</p>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-zinc-800/50 pb-4 mb-8">
          <button onClick={() => setActiveTab("bookings")} className={`px-4 py-2 font-black uppercase text-sm tracking-widest transition-all ${activeTab === 'bookings' ? 'text-brand-blue border-b-2 border-brand-blue' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <Calendar className="w-4 h-4 inline-block mr-2 -mt-1" />
            Bookings
          </button>
          <button onClick={() => setActiveTab("users")} className={`px-4 py-2 font-black uppercase text-sm tracking-widest transition-all ${activeTab === 'users' ? 'text-brand-blue border-b-2 border-brand-blue' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <Users className="w-4 h-4 inline-block mr-2 -mt-1" />
            Clients & Subscribers
          </button>
        </div>

        {activeTab === "bookings" ? (
          <>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 reveal delay-100">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name, phone, plate, or ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue/50 transition-all"
            />
          </form>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            {["all", "pending", "confirmed", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${statusFilter === s
                  ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20"
                  : "bg-zinc-900/50 text-zinc-500 hover:text-white border border-zinc-800/50 hover:border-zinc-700"
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
            {totalItems} booking{totalItems !== 1 ? 's' : ''} found
          </p>
          <p className="text-xs text-zinc-600">
            Page {page} of {totalPages || 1}
          </p>
        </div>

        {/* Bookings Table */}
        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl overflow-hidden mb-6 reveal delay-200">
          {bookings.length === 0 ? (
            <div className="py-20 text-center">
              <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 font-bold">No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    {["Status", "Customer", "Phone", "Vehicle", "Service", "Date & Time", "Price", "Actions"].map(h => (
                      <th key={h} className="text-left px-5 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
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
                      <td className="px-5 py-4 text-zinc-400 font-medium">{booking.plate_number}</td>
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) { pageNum = i + 1; }
              else if (page <= 3) { pageNum = i + 1; }
              else if (page >= totalPages - 2) { pageNum = totalPages - 4 + i; }
              else { pageNum = page - 2 + i; }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${page === pageNum ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'bg-zinc-900/50 text-zinc-500 hover:text-white border border-zinc-800/50'}`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
        </>
        ) : (
          <>
            {/* Users Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 reveal delay-100">
              <form onSubmit={handleUsersSearch} className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search clients by name, email, phone, or ID..."
                  value={usersSearchInput}
                  onChange={(e) => setUsersSearchInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue/50 transition-all"
                />
              </form>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                {totalUsersItems} client{totalUsersItems !== 1 ? 's' : ''} found
              </p>
              <p className="text-xs text-zinc-600">
                Page {usersPage} of {totalUsersPages || 1}
              </p>
            </div>

            {/* Users Table */}
            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl overflow-hidden mb-6 reveal delay-200">
              {users.length === 0 ? (
                <div className="py-20 text-center">
                  <Users className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                  <p className="text-zinc-500 font-bold">No clients found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800/50">
                        {["Client", "Contact", "Vehicle", "Role", "Joined"].map(h => (
                          <th key={h} className="text-left px-5 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors group">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 shrink-0">
                                <User className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-bold text-white text-sm">{user.name || user.full_name || "—"}</p>
                                <p className="text-zinc-600 text-[10px] font-mono">#{user.id.slice(0, 8)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-zinc-300 font-medium text-xs">{user.email}</p>
                            <p className="text-zinc-500 text-xs">{user.phone || "—"}</p>
                          </td>
                          <td className="px-5 py-4 text-zinc-400 font-medium">{user.plate || "—"}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-brand-blue/10 text-blue-400 border-blue-500/20'}`}>
                              {user.role || "client"}
                            </span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <p className="text-zinc-300 font-medium text-xs">{formatDate(user.created)}</p>
                            <p className="text-zinc-500 text-xs">{formatTime(user.created)}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination for Users */}
            {totalUsersPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                  disabled={usersPage <= 1}
                  className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalUsersPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalUsersPages <= 5) { pageNum = i + 1; }
                  else if (usersPage <= 3) { pageNum = i + 1; }
                  else if (usersPage >= totalUsersPages - 2) { pageNum = totalUsersPages - 4 + i; }
                  else { pageNum = usersPage - 2 + i; }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setUsersPage(pageNum)}
                      className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${usersPage === pageNum ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'bg-zinc-900/50 text-zinc-500 hover:text-white border border-zinc-800/50'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setUsersPage(p => Math.min(totalUsersPages, p + 1))}
                  disabled={usersPage >= totalUsersPages}
                  className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedBooking(null)} />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto reveal">
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
                { label: "User ID", value: selectedBooking.user || "Guest" },
                { label: "Notes", value: selectedBooking.notes || "—" },
                { label: "Created", value: formatDate(selectedBooking.created) },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-3 border-b border-zinc-800/50">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{row.label}</span>
                  {row.highlight ? (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[selectedBooking.status] || ''}`}>
                      {row.value}
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-white text-right max-w-[60%] break-words">{row.value}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-8">
              {selectedBooking.status === 'pending' && (
                <button
                  onClick={() => { handleStatusChange(selectedBooking.id, 'confirmed'); setSelectedBooking({ ...selectedBooking, status: 'confirmed' }); }}
                  className="flex-1 py-3.5 bg-emerald-500/10 text-emerald-400 font-black uppercase text-xs tracking-widest rounded-xl hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Confirm
                </button>
              )}
              {selectedBooking.status !== 'cancelled' && (
                <button
                  onClick={() => { handleStatusChange(selectedBooking.id, 'cancelled'); setSelectedBooking({ ...selectedBooking, status: 'cancelled' }); }}
                  className="flex-1 py-3.5 bg-red-500/10 text-red-400 font-black uppercase text-xs tracking-widest rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
