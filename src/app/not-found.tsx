import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 p-4">
      <div className="max-w-md w-full bg-white p-10 rounded-[2rem] shadow-2xl shadow-zinc-200/50 text-center border border-zinc-100 relative overflow-hidden">
        
        {/* Background Decorative "404" */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12rem] font-black text-zinc-50 pointer-events-none select-none z-0">
          404
        </div>

        <div className="relative z-10">
          <div className="w-24 h-24 bg-brand-blue/10 text-brand-blue rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Search size={48} />
          </div>
          
          <h2 className="text-3xl font-black text-zinc-900 mb-4 uppercase tracking-tighter">Page Introuvable</h2>
          <p className="text-zinc-500 mb-10 leading-relaxed font-medium">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          
          <Link href="/">
            <button className="w-full flex items-center justify-center gap-3 bg-brand-blue text-white py-4 rounded-2xl font-black hover:bg-brand-blue/90 hover:-translate-y-1 transition-all active:scale-95 uppercase tracking-[0.2em] text-xs shadow-lg shadow-brand-blue/20">
              <Home size={18} />
              Retour à l'accueil
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
