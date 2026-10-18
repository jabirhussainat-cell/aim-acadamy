import React from 'react';

interface AimLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  className?: string;
  subtitle?: string;
}

export function AimLogo({
  size = 'md',
  showText = true,
  className = '',
  subtitle = 'Govt. Reg No: WYD/176/2026',
}: AimLogoProps) {
  const sizeMap = {
    xs: { img: 'h-7 w-7', text: 'text-xs', sub: 'text-[8px]' },
    sm: { img: 'h-9 w-9', text: 'text-xs sm:text-sm', sub: 'text-[9px]' },
    md: { img: 'h-11 w-11', text: 'text-sm sm:text-base', sub: 'text-[10px]' },
    lg: { img: 'h-16 w-16', text: 'text-lg sm:text-xl', sub: 'text-xs' },
    xl: { img: 'h-24 w-24', text: 'text-2xl', sub: 'text-xs' },
    '2xl': { img: 'h-36 w-36', text: 'text-3xl', sub: 'text-sm' },
  };

  const current = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`relative ${current.img} shrink-0 drop-shadow-[0_0_15px_rgba(217,119,6,0.35)]`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/aim-logo.jpg"
          alt="Advanced Institute of Martial Arts (AIM ACADEMY) Official Emblem"
          className="h-full w-full object-contain rounded-md"
        />
      </div>
      {showText && (
        <div className="flex flex-col text-left">
          <span className={`${current.text} font-black tracking-wider uppercase text-white leading-tight`}>
            AIM ACADEMY
          </span>
          <span className={`${current.sub} uppercase tracking-widest text-amber-400 font-bold leading-tight mt-0.5`}>
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
}
