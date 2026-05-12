export default function AdminLoading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-transparent rounded-3xl">
      <div className="relative flex items-center justify-center mb-6">
        <div className="w-12 h-12 border-4 border-zinc-200 rounded-full absolute"></div>
        <div className="w-12 h-12 border-4 border-transparent border-t-zinc-900 border-r-zinc-900 rounded-full absolute animate-spin"></div>
      </div>
      <p className="text-zinc-400 font-bold text-[10px] tracking-[0.2em] uppercase animate-pulse">
        Chargement des données...
      </p>
    </div>
  );
}
