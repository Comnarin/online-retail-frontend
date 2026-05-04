"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 border border-red-100 shadow-sm">
        <AlertTriangle size={32} />
      </div>
      
      <h1 className="text-2xl font-display font-black text-stone-900 uppercase tracking-tight mb-2">
        Something went wrong
      </h1>
      
      <p className="text-sm font-medium text-stone-500 max-w-[280px] mb-10 leading-relaxed uppercase tracking-widest">
        We encountered an error while curating your experience.
      </p>

      <div className="flex flex-col w-full max-w-[240px] gap-3">
        <button
          onClick={() => reset()}
          className="flex items-center justify-center gap-3 w-full h-12 bg-stone-900 text-white text-[11px] font-bold uppercase tracking-widest transition-transform active:scale-95 shadow-xl shadow-stone-900/10"
        >
          <RefreshCcw size={16} />
          Try again
        </button>
        
        <Link
          href="/"
          className="flex items-center justify-center gap-3 w-full h-12 bg-white text-stone-900 border border-stone-200 text-[11px] font-bold uppercase tracking-widest transition-transform active:scale-95"
        >
          <Home size={16} />
          Return Home
        </Link>
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="mt-12 p-4 bg-stone-50 border border-stone-100 rounded-lg text-left w-full max-w-lg overflow-auto">
          <p className="text-[10px] font-mono text-red-600 font-bold mb-2 uppercase tracking-widest">Stack Trace</p>
          <code className="text-xs font-mono text-stone-600 whitespace-pre">
            {error.message}
          </code>
        </div>
      )}
    </div>
  );
}
