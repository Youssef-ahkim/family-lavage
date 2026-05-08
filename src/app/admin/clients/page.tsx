"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getAllUsers } from "@/app/actions/admin";
import {
  Loader2, User, Search, RefreshCw, ChevronLeft, ChevronRight, Mail, Phone, Hash
} from "lucide-react";

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

export default function AdminClientsPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await getAllUsers(page, 15, searchQuery);
      if (res.success) {
        setUsers(res.items as UserItem[]);
        setTotalPages(res.totalPages);
        setTotalItems(res.totalItems);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Clients</h1>
          <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">Manage registered users and subscribers</p>
        </div>
        <button 
          onClick={fetchData} 
          disabled={refreshing}
          className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or plate..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all"
          />
        </form>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
          {totalItems} client{totalItems !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Users Table */}
      <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/50 bg-zinc-900/50">
                {["Client", "Contact Info", "Default Vehicle", "Role", "Joined Date"].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <User className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500 font-bold">No clients found</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 shrink-0 border border-zinc-700 group-hover:border-brand-blue/30 transition-all">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{user.name || user.full_name || "—"}</p>
                          <p className="text-zinc-600 text-[10px] font-mono">#{user.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-zinc-300 text-xs">
                          <Mail size={12} className="text-zinc-500" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-zinc-500 text-xs">
                            <Phone size={12} />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {user.plate ? (
                        <div className="flex items-center gap-2 text-zinc-400 font-medium">
                          <Hash size={12} className="text-brand-blue" />
                          {user.plate}
                        </div>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-brand-blue/10 text-blue-400 border-blue-500/20'}`}>
                        {user.role || "client"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-500 text-xs whitespace-nowrap">
                      {formatDate(user.created)}
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
    </div>
  );
}
