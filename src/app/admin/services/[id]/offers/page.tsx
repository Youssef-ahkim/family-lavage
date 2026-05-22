"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, ArrowLeft, Loader2, DollarSign } from "lucide-react";
import { getServiceOffers, deleteServiceOffer } from "../../service-actions";
import { ServiceOfferRecord } from "../../service-types";
import OfferForm from "./offer-form";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import Link from "next/link";

export default function AdminOffersPage() {
  const params = useParams();
  const serviceId = params.id as string;
  const router = useRouter();

  const [offers, setOffers] = useState<ServiceOfferRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<ServiceOfferRecord | undefined>(undefined);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const { language, dir } = useLanguage();
  const t = translations[language];

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const data = await getServiceOffers(serviceId);
      setOffers(data as ServiceOfferRecord[]);
    } catch (error) {
      console.error("Failed to fetch offers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (serviceId) {
      fetchOffers();
    }
  }, [serviceId]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    setIsDeleting(id);
    try {
      await deleteServiceOffer(id, serviceId);
      await fetchOffers();
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  if (isFormOpen) {
    return (
      <div className="reveal p-4 md:p-8">
        <OfferForm 
          serviceId={serviceId}
          initialData={editingOffer} 
          onSuccess={() => {
            setIsFormOpen(false);
            setEditingOffer(undefined);
            fetchOffers();
          }}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingOffer(undefined);
          }}
        />
      </div>
    );
  }

  return (
    <div className="reveal space-y-8 p-4 md:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/services"
            className="p-3 bg-zinc-900 rounded-2xl text-zinc-400 hover:text-white transition-all border border-zinc-800"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">Service Offers</h1>
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">
              Manage Pricing Plans
            </p>
          </div>
        </div>
        <button 
          onClick={() => {
            setEditingOffer(undefined);
            setIsFormOpen(true);
          }}
          className="bg-brand-blue text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-brand-blue/20"
        >
          <Plus size={18} />
          Add Offer
        </button>
      </div>

      <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b border-zinc-800/50 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Offer Title</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">Type</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">Price</th>
                <th className={`px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 ${dir === 'rtl' ? 'text-left' : 'text-right'}`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-brand-blue mb-4" size={32} />
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Loading Offers...</p>
                  </td>
                </tr>
              ) : offers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-zinc-500 uppercase text-[10px] font-black tracking-widest">
                    No Offers found for this service.
                  </td>
                </tr>
              ) : (
                offers.map((offer) => (
                  <tr key={offer.id} className="group hover:bg-zinc-800/20 transition-colors">
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-white uppercase italic tracking-tight">{offer.title_en}</p>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">{offer.title_fr}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="inline-flex px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                        {offer.category === 'subscription' ? 'Subscription' : 'One-time'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="inline-flex items-center gap-1 text-sm font-black text-white">
                        {offer.price} <span className="text-[10px] text-brand-blue">DH</span>
                      </span>
                    </td>
                    <td className={`px-8 py-6 ${dir === 'rtl' ? 'text-left' : 'text-right'}`}>
                      <div className={`flex items-center ${dir === 'rtl' ? 'justify-start' : 'justify-end'} gap-2`}>
                        <button 
                          onClick={() => {
                            setEditingOffer(offer);
                            setIsFormOpen(true);
                          }}
                          className="p-2.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          disabled={isDeleting === offer.id}
                          onClick={() => handleDelete(offer.id)}
                          className="p-2.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50"
                        >
                          {isDeleting === offer.id ? (
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
