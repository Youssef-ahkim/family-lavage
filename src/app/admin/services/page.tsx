"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, Edit2, Trash2, Search, Filter, 
  MoreVertical, CheckCircle2, XCircle, 
  Package, DollarSign, Info, Loader2, List
} from "lucide-react";
import { getServices, deleteService } from "./service-actions";
import { ServiceRecord } from "./service-types";
import ServiceForm from "./service-form";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import Link from "next/link";

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceRecord | undefined>(undefined);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { language, dir } = useLanguage();
  const t = translations[language];
  const sTrans = t.admin.services;

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await getServices();
      setServices(data as ServiceRecord[]);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm(sTrans.deleteConfirm)) return;
    setIsDeleting(id);
    try {
      await deleteService(id);
      await fetchServices();
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredServices = services.filter(s => 
    s.title_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.title_fr.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isFormOpen) {
    return (
      <div className="reveal p-4 md:p-8">
        <ServiceForm 
          initialData={editingService} 
          onSuccess={() => {
            setIsFormOpen(false);
            setEditingService(undefined);
            fetchServices();
          }}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingService(undefined);
          }}
        />
      </div>
    );
  }

  return (
    <div className="reveal space-y-8 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">{sTrans.title}</h1>
          <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">
            Service Catalog & Categories
          </p>
        </div>
        <button 
          onClick={() => {
            setEditingService(undefined);
            setIsFormOpen(true);
          }}
          className="bg-brand-blue text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-brand-blue/20"
        >
          <Plus size={18} />
          {sTrans.add}
        </button>
      </div>

      {/* Stats/Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue">
            <Package size={24} />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{services.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Services</p>
          </div>
        </div>
        <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{services.filter(s => s.active).length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Active Services</p>
          </div>
        </div>
        <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
            <Info size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">PocketBase</p>
            <p className="text-xs font-bold text-white mt-1">Real-time Connected</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-[2.5rem] overflow-hidden">
        {/* Table Controls */}
        <div className="p-6 border-b border-zinc-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-zinc-600`} size={18} />
            <input 
              type="text"
              placeholder={t.admin.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl ${dir === 'rtl' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'} py-3 text-sm text-white focus:outline-none focus:border-brand-blue transition-all`}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b border-zinc-800/50 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">{sTrans.tableTitle}</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">{sTrans.tableStatus}</th>
                <th className={`px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 ${dir === 'rtl' ? 'text-left' : 'text-right'}`}>{t.admin.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-brand-blue mb-4" size={32} />
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Synchronizing Catalog...</p>
                  </td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center text-zinc-500 uppercase text-[10px] font-black tracking-widest">
                    {sTrans.noServices}
                  </td>
                </tr>
              ) : (
                filteredServices.map((service) => (
                  <tr key={service.id} className="group hover:bg-zinc-800/20 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-zinc-800 overflow-hidden border border-zinc-700 group-hover:border-brand-blue/30 transition-all ${dir === 'rtl' ? 'order-2' : ''}`}>
                          {service.photo ? (
                            <img src={service.photo} alt={service.title_en} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                              <Package size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase italic tracking-tight">{service.title_en}</p>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">{service.title_fr}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {service.active ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                          <CheckCircle2 size={12} />
                          {t.admin.confirmed}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                          <XCircle size={12} />
                          {t.admin.cancelled}
                        </span>
                      )}
                    </td>
                    <td className={`px-8 py-6 ${dir === 'rtl' ? 'text-left' : 'text-right'}`}>
                      <div className={`flex items-center ${dir === 'rtl' ? 'justify-start' : 'justify-end'} gap-2`}>
                        <Link 
                          href={`/admin/services/${service.id}/offers`}
                          className="p-2.5 rounded-xl bg-brand-blue/10 text-brand-blue hover:text-white hover:bg-brand-blue transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                        >
                          <List size={16} />
                          Offers
                        </Link>
                        <button 
                          onClick={() => {
                            setEditingService(service);
                            setIsFormOpen(true);
                          }}
                          className="p-2.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
                          title={t.admin.actions}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          disabled={isDeleting === service.id}
                          onClick={() => handleDelete(service.id)}
                          className="p-2.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50"
                          title={sTrans.delete}
                        >
                          {isDeleting === service.id ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <Trash2 size={16} />
                          )}
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
    </div>
  );
}
