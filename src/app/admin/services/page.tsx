"use client";

import React from "react";
import { translations } from "@/lib/translations";
import { 
  Briefcase, Sparkles, Droplets, Zap, ShieldCheck, 
  Clock, DollarSign, Settings2, Info
} from "lucide-react";

export default function AdminServicesPage() {
  const t = translations.fr; // Defaulting to FR for admin

  const servicesList = [
    {
      id: "simple",
      name: "Lavage Simple",
      price: "100 DH",
      duration: "15 min",
      features: t.pricing.plans.once.features,
      icon: <Droplets className="w-6 h-6 text-brand-blue" />,
    },
    {
      id: "vip",
      name: "Service VIP",
      price: "600 DH",
      duration: "45 min",
      features: t.pricing.plans.vip.features,
      icon: <Sparkles className="w-6 h-6 text-brand-gold" />,
    },
    {
      id: "month",
      name: "Abonnement Mensuel",
      price: "350 DH/mois",
      duration: "1/semaine",
      features: t.pricing.plans.month.features,
      icon: <Zap className="w-6 h-6 text-amber-400" />,
    },
    {
      id: "year",
      name: "Abonnement Annuel",
      price: "3700 DH/an",
      duration: "1/semaine",
      features: t.pricing.plans.year.features,
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
    }
  ];

  return (
    <div className="reveal">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Services</h1>
          <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">Configure your car wash plans and pricing</p>
        </div>
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center gap-2">
          <Info size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest">Configuration via Source Code</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {servicesList.map((service) => (
          <div key={service.id} className="bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] p-8 hover:border-zinc-700 transition-all group">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-700 group-hover:scale-110 group-hover:border-brand-blue/30 transition-all">
                {service.icon}
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-white">{service.price}</p>
                <div className="flex items-center justify-end gap-1 text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">
                  <Clock size={12} />
                  {service.duration}
                </div>
              </div>
            </div>

            <h3 className="text-xl font-black uppercase italic tracking-tight text-white mb-4">{service.name}</h3>
            
            <ul className="space-y-3 mb-8">
              {service.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm text-zinc-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-blue/50" />
                  {feature}
                </li>
              ))}
            </ul>

            <button className="w-full py-4 bg-zinc-800 text-zinc-400 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-zinc-700 hover:text-white transition-all flex items-center justify-center gap-2 cursor-not-allowed opacity-50">
              <Settings2 size={16} />
              Customize (Coming Soon)
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 p-8 rounded-3xl bg-zinc-900/20 border border-zinc-800/50 border-dashed text-center">
        <p className="text-zinc-500 text-sm font-medium">
          Note: Currently, service definitions are managed within the translation files and code logic. 
          Dynamic database-driven service management will be available in a future update.
        </p>
      </div>
    </div>
  );
}
