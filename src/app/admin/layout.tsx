"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { verifyAdmin } from "@/app/actions/admin";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { 
  Shield, Loader2, Calendar, Users, Briefcase, 
  LayoutDashboard, LogOut, ShieldAlert, ArrowRight, Menu, X
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { language } = useLanguage();
  const t = translations[language];
  const adm = t.admin;
  
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const check = async () => {
      const result = await verifyAdmin();
      setIsAdmin(result.isAdmin);
    };
    check();
  }, []);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">
            {language === 'fr' ? 'Accès Refusé' : 'Access Denied'}
          </h1>
          <p className="text-zinc-500 mb-8">
            {language === 'fr' 
              ? "Vous n'avez pas la permission d'accéder à cette zone." 
              : "You don't have permission to access this area."}
          </p>
          <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-zinc-950 font-black uppercase text-sm tracking-widest rounded-2xl hover:bg-zinc-100 transition-all">
            <ArrowRight className="w-4 h-4 rotate-180" /> {language === 'fr' ? "Retour à l'accueil" : "Back to Home"}
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: adm.title, href: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: adm.bookings, href: "/admin/bookings", icon: <Calendar size={20} /> },
    { name: adm.clients, href: "/admin/clients", icon: <Users size={20} /> },
    { name: adm.services, href: "/admin/services", icon: <Briefcase size={20} /> },
  ];

  return (
    <div className="h-screen bg-zinc-950 text-white font-sans flex flex-col md:flex-row overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-brand-blue" />
          <span className="font-black uppercase tracking-tight">Admin</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 ${language === 'ar' ? 'right-0' : 'left-0'} z-50 w-64 bg-zinc-900 border-r border-zinc-800 transition-transform duration-300 md:relative md:translate-x-0 md:h-full shrink-0
        ${isSidebarOpen ? "translate-x-0" : (language === 'ar' ? "translate-x-full" : "-translate-x-full")}
      `}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2 bg-brand-blue rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tight">Admin</h1>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Family Lavage</p>
            </div>
          </div>

          <nav className="space-y-2 flex-1 overflow-y-auto no-scrollbar">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all
                  ${pathname === item.href 
                    ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" 
                    : "text-zinc-500 hover:text-white hover:bg-zinc-800"}
                `}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-10 border-t border-zinc-800 shrink-0">
            <Link 
              href="/"
              className="flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-zinc-500 hover:text-white transition-all"
            >
              <LogOut size={20} />
              {adm.logout}
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
