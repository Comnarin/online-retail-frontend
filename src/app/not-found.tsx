import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
      <header className="mb-12 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] font-display font-black text-stone-100/50 -z-10 select-none">
          404
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-[3px] h-3 bg-primary" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-900">Missing Piece</span>
        </div>
        <h1 className="text-5xl font-display font-black text-stone-900 uppercase tracking-tighter mb-4">
          Not Found.
        </h1>
        <p className="text-xs font-medium text-stone-500 uppercase tracking-widest max-w-[280px] leading-relaxed mx-auto border-y border-stone-100 py-4">
          The item or page you are looking for has been moved or curated out of our collection.
        </p>
      </header>

      <div className="flex flex-col w-full max-w-[240px] gap-6">
        <Link
          href="/liff/shop"
          className="group flex items-center justify-between px-6 w-full h-14 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-black active:scale-95 shadow-2xl shadow-stone-900/20"
        >
          <span>Continue Shopping</span>
          <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
        
        <div className="flex items-center justify-center gap-3 text-stone-400">
           <Search size={14} />
           <span className="text-[9px] font-bold uppercase tracking-widest">Try searching instead</span>
        </div>
      </div>
    </div>
  );
}
