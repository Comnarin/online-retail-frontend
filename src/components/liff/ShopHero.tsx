"use client";

import React from "react";

interface ShopHeroProps {
  shopTitle?: string;
  shopDescription?: string;
  shopHeroURL: string;
}

export function ShopHero({ shopTitle, shopDescription, shopHeroURL }: ShopHeroProps) {
  const [imgSrc, setImgSrc] = React.useState(shopHeroURL);

  return (
    <header className="pt-8 mb-14 relative overflow-hidden">
      <div className="relative z-10">
        <div className="max-w-[100%] transition-all duration-700">
          {shopTitle ? (
            <h1 className="text-[clamp(2.25rem,9vw,3.75rem)] font-display font-black leading-[1.05] text-stone-900 tracking-tight mb-6 animate-in slide-in-from-bottom-8 duration-1000 break-words">
              {shopTitle}
            </h1>
          ) : (
            <h1 className="text-[clamp(3.5rem,15vw,6rem)] font-display font-black leading-[0.82] text-stone-900 tracking-[-0.05em] mb-10 animate-in slide-in-from-bottom-8 duration-1000">
              The <br/>
              <span className="text-primary italic font-serif font-light tracking-tight mr-2">New</span> 
              Elite.
            </h1>
          )}

          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
            {shopDescription && (
              <p className="text-[15px] font-medium text-stone-500 max-w-[340px] leading-[1.6] -mt-2">
                {shopDescription}
              </p>
            )}
            
            <div className="w-full aspect-[16/9] rounded-[40px] overflow-hidden shadow-2xl shadow-stone-900/10 relative group border-[6px] border-white bg-stone-100">
              <img 
                src={imgSrc} 
                alt="Elite Shop Hero" 
                className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
                onError={() => {
                  setImgSrc("/images/shop-hero.png");
                }}
              />
              <div className="absolute inset-0 bg-stone-900/10 mix-blend-multiply" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Subtle Decorative Background Element */}
      <div className="absolute top-[20%] right-[-10%] w-[60vw] h-[60vw] bg-primary/5 rounded-full blur-[100px] -z-1" />
    </header>
  );
}
