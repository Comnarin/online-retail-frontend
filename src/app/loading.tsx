"use client";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 space-y-8 animate-in fade-in duration-700">
      {/* Editorial branding loader */}
      <div className="relative">
        <div className="w-16 h-16 border-2 border-primary/20 rounded-full"></div>
        <div className="absolute inset-0 w-16 h-16 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      <div className="flex flex-col items-center space-y-2">
        <h2 className="text-sm font-display font-bold uppercase tracking-[0.2em] text-stone-900">
          Curating
        </h2>
        <div className="flex space-x-1">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
        </div>
      </div>

      <div className="max-w-[160px] w-full space-y-3">
        <div className="h-[2px] w-full bg-stone-100 overflow-hidden">
          <div className="h-full bg-stone-300 w-1/3 animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
}
