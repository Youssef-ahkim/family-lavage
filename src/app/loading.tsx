export default function Loading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white fixed inset-0 z-[100]">
      <div className="relative flex items-center justify-center">
        {/* Outer spinning ring */}
        <div className="w-24 h-24 border-4 border-zinc-100 rounded-full absolute"></div>
        <div className="w-24 h-24 border-4 border-transparent border-t-brand-blue border-r-brand-blue rounded-full absolute animate-spin"></div>
        
        {/* Inner static branding or pulse */}
        <div className="w-16 h-16 bg-brand-blue/5 rounded-full flex items-center justify-center animate-pulse">
          <span className="font-black italic text-brand-blue text-sm">F<span className="text-blue-900">M</span>L</span>
        </div>
      </div>
      <p className="mt-8 text-zinc-400 font-bold text-[10px] tracking-[0.3em] uppercase animate-pulse">
        Chargement
      </p>
    </div>
  );
}
