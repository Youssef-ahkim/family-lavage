"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getAllUsers } from "@/app/actions/admin";
import {
  Loader2, User, Search, RefreshCw, ChevronLeft, ChevronRight, Mail, Phone, Hash
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

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
  const { language, dir } = useLanguage();
  const t = translations[language];
  const adm = t.admin;
  const cTrans = adm.clients;
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
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">{cTrans.title}</h1>
          <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">{cTrans.desc}</p>
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
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-grow">
            <Search className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500`} />
            <input
              type="text"
              placeholder={cTrans.searchPlaceholder}
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

      {/* Results Count */}
      <div className={`flex items-center justify-between mb-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
          {totalItems} {cTrans.title} {language === 'fr' ? 'trouvé(s)' : ''}
        </p>
      </div>

      {/* Clients Table (Desktop) / Cards (Mobile) */}
      <div className="space-y-4">
        {/* Desktop Table */}
        <div className="hidden md:block bg-zinc-900/30 border border-zinc-800/50 rounded-2xl overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b border-zinc-800/50 bg-zinc-900/50 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                  {[adm.customer, "Contact Info", adm.vehicle, cTrans.tableRole, cTrans.tableJoined].map(h => (
                    <th key={h} className={`px-5 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <User className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                      <p className="text-zinc-500 font-bold">{cTrans.noClients}</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className={`border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors group ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                      <td className="px-5 py-4">
                        <div className={`flex items-center gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                          <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 shrink-0 border border-zinc-700 group-hover:border-brand-blue/30 transition-all">
                            <User className="w-5 h-5" />
                          </div>
                          <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                            <p className="font-bold text-white text-sm">{user.name || user.full_name || "—"}</p>
                            <p className="text-zinc-600 text-[10px] font-mono">#{user.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <div className={`flex items-center gap-2 text-zinc-300 text-xs ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                            <Mail size={12} className="text-zinc-500" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className={`flex items-center gap-2 text-zinc-500 text-xs ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                              <Phone size={12} />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {user.plate ? (
                          <div className={`flex items-center gap-2 text-zinc-400 font-medium ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
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

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4 mb-8">
          {users.length === 0 ? (
            <div className="py-12 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl text-center">
              <User className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 font-bold text-sm">{cTrans.noClients}</p>
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5 space-y-4">
                <div className={`flex items-start justify-between ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                      <p className="font-black text-white text-base leading-tight">{user.name || user.full_name || "—"}</p>
                      <p className="text-zinc-600 text-[10px] font-mono mt-0.5">#{user.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${user.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-brand-blue/10 text-blue-400 border-blue-500/20'}`}>
                    {user.role || "client"}
                  </span>
                </div>

                <div className="space-y-3 pt-3 border-t border-zinc-800/30">
                  <div className={`flex items-center justify-between ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Email</span>
                    <span className="text-xs font-bold text-zinc-300">{user.email}</span>
                  </div>
                  <div className={`flex items-center justify-between ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{adm.phone}</span>
                    <span className="text-xs font-bold text-zinc-300">{user.phone || "—"}</span>
                  </div>
                  <div className={`flex items-center justify-between ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{adm.vehicle}</span>
                    <span className="text-xs font-black text-brand-blue uppercase">{user.plate || "—"}</span>
                  </div>
                  <div className={`flex items-center justify-between ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{language === 'fr' ? 'Inscrit' : (language === 'ar' ? 'انضم' : 'Joined')}</span>
                    <span className="text-xs font-bold text-zinc-500">{formatDate(user.created)}</span>
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
