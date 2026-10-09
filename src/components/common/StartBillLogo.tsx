import React from 'react';

export interface StartBillLogoProps {
  variant?: 'full' | 'horizontal' | 'icon';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  theme?: 'light' | 'dark' | 'auto';
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * Official StartBill Vector Icon (Parachute + Floating Invoice with Dollar Sign)
 */
export const StartBillIcon: React.FC<{
  className?: string;
  size?: number | string;
}> = ({ className = 'w-10 h-10', size }) => {
  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-label="StartBill Parachute Emblem"
    >
      <defs>
        <linearGradient id="sbCanopyBack" x1="120" y1="20" x2="120" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        <linearGradient id="sbPanelFarLeft" x1="40" y1="35" x2="80" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        <linearGradient id="sbPanelCenterLeft" x1="75" y1="20" x2="115" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        <linearGradient id="sbPanelCenterRight" x1="120" y1="20" x2="165" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="60%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        <linearGradient id="sbPanelFarRight" x1="160" y1="35" x2="200" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>

        <linearGradient id="sbPaperGrad" x1="120" y1="110" x2="120" y2="185" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F0F9FF" />
        </linearGradient>

        <linearGradient id="sbPaperFold" x1="120" y1="165" x2="155" y2="195" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>

        <filter id="sbSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#0284C7" floodOpacity="0.25" />
        </filter>

        <filter id="sbBillShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.05   0 0 0 0 0.1   0 0 0 0 0.25  0 0 0 0.15 0" />
        </filter>
      </defs>

      {/* Ground drop shadow */}
      <ellipse cx="120" cy="204" rx="36" ry="5.5" fill="#0F172A" opacity="0.12" filter="url(#sbBillShadow)" />

      {/* 1. Canopy Interior */}
      <path d="M 46 98 C 70 108 170 108 194 98 C 182 110 58 110 46 98 Z" fill="url(#sbCanopyBack)" />

      {/* 2. Parachute Canopy Panels */}
      {/* Far Left Panel */}
      <path
        d="M 120 22 C 86 22 56 50 46 98 C 62 103 76 100 84 94 C 74 52 96 30 120 22 Z"
        fill="url(#sbPanelFarLeft)"
        stroke="#172554"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Center Left Panel (Highlighted / Bright) */}
      <path
        d="M 120 22 C 96 30 74 52 84 94 C 98 100 112 101 120 101 C 120 70 119 38 120 22 Z"
        fill="url(#sbPanelCenterLeft)"
        stroke="#172554"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Center Right Panel */}
      <path
        d="M 120 22 C 119 38 120 70 120 101 C 128 101 142 100 156 94 C 166 52 144 30 120 22 Z"
        fill="url(#sbPanelCenterRight)"
        stroke="#172554"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Far Right Panel */}
      <path
        d="M 120 22 C 144 30 166 52 156 94 C 164 100 178 103 194 98 C 184 50 154 22 120 22 Z"
        fill="url(#sbPanelFarRight)"
        stroke="#172554"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Canopy Outer Rim */}
      <path
        d="M 46 98 C 56 50 86 22 120 22 C 154 22 184 50 194 98"
        fill="none"
        stroke="#0F172A"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Specular highlight */}
      <path
        d="M 72 40 C 86 30 104 25 118 24"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.65"
      />

      {/* 3. Parachute Suspension Lines (Cords) */}
      <path d="M 50 99 L 92 128" stroke="#1D4ED8" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M 84 96 L 98 127" stroke="#1D4ED8" strokeWidth="3" strokeLinecap="round" />
      <path d="M 156 96 L 142 127" stroke="#1D4ED8" strokeWidth="3" strokeLinecap="round" />
      <path d="M 190 99 L 148 128" stroke="#1D4ED8" strokeWidth="3.2" strokeLinecap="round" />

      <path d="M 50 99 L 92 128" stroke="#93C5FD" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M 84 96 L 98 127" stroke="#93C5FD" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M 156 96 L 142 127" stroke="#93C5FD" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M 190 99 L 148 128" stroke="#93C5FD" strokeWidth="1.2" strokeLinecap="round" />

      {/* 4. Floating Bill Payload with 3D Folded Back Paper Effect */}
      <g filter="url(#sbSoftGlow)">
        {/* Folded paper 3D back curl */}
        <path
          d="M 132 178 C 146 178 156 168 152 154 C 150 148 144 144 138 143 L 138 174 C 138 177 135 178 132 178 Z"
          fill="url(#sbPaperFold)"
          stroke="#172554"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Main Front Paper Sheet */}
        <path
          d="M 86 126 L 144 124 C 148 124 151 127 151 131 L 146 172 C 145 178 140 182 134 183 L 94 189 C 89 190 85 186 84 181 L 80 133 C 79 129 82 126 86 126 Z"
          fill="url(#sbPaperGrad)"
          stroke="#172554"
          strokeWidth="3.8"
          strokeLinejoin="round"
        />

        {/* Cord connection anchor tabs */}
        <circle cx="89" cy="129" r="2.5" fill="#1D4ED8" />
        <circle cx="142" cy="127" r="2.5" fill="#1D4ED8" />

        {/* Dollar Symbol ($) */}
        <path d="M 115 137 L 115 173" stroke="#0284C7" strokeWidth="3.8" strokeLinecap="round" />
        <path
          d="M 124 146 C 124 141 120 138 115 138 C 109 138 105 142 105 147 C 105 154 112 155 117 157 C 122 159 126 161 126 166 C 126 171 121 173 115 173 C 109 173 104 170 104 164"
          fill="none"
          stroke="#0284C7"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};

/**
 * StartBill Official Logo Component
 * Reproduces the official logo with parachute emblem, bold STARTBILL typography,
 * and "Ton assistant financier" tagline.
 */
export const StartBillLogo: React.FC<StartBillLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  theme = 'light',
  showTagline = true,
  className = '',
  onClick
}) => {
  // Sizing matrix
  const iconSizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-24 h-24',
    hero: 'w-32 h-32'
  };

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-4xl',
    hero: 'text-5xl'
  };

  const taglineSizes = {
    xs: 'text-[9px]',
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base',
    '2xl': 'text-lg',
    hero: 'text-xl'
  };

  const startTextColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const billTextColor = theme === 'dark' ? 'text-[#38BDF8]' : 'text-[#0284C7]';
  const tagColor = theme === 'dark' ? 'text-slate-300' : 'text-slate-600';

  // 1. Icon Only Variant
  if (variant === 'icon') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center justify-center shrink-0 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <StartBillIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 2. Full Vertical Variant (Exactly as in the official design asset)
  if (variant === 'full') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex flex-col items-center text-center select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <div className="relative mb-2 flex items-center justify-center">
          <StartBillIcon className={iconSizes[size]} />
        </div>
        <div className={`font-black uppercase tracking-tight leading-none ${textSizes[size]}`}>
          <span className={startTextColor}>START</span>
          <span className={billTextColor}>BILL</span>
        </div>
        {showTagline && (
          <div className={`font-medium tracking-normal mt-1.5 leading-tight ${taglineSizes[size]} ${tagColor}`}>
            Ton assistant financier
          </div>
        )}
      </div>
    );
  }

  // 3. Horizontal Variant (Ideal for web headers, sidebars, cards)
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="shrink-0 flex items-center justify-center">
        <StartBillIcon className={iconSizes[size]} />
      </div>
      <div className="flex flex-col justify-center text-left">
        <div className={`font-black uppercase tracking-tight leading-none ${textSizes[size]}`}>
          <span className={startTextColor}>START</span>
          <span className={billTextColor}>BILL</span>
        </div>
        {showTagline && (
          <div className={`font-medium tracking-normal mt-0.5 leading-tight ${taglineSizes[size]} ${tagColor}`}>
            Ton assistant financier
          </div>
        )}
      </div>
    </div>
  );
};

export default StartBillLogo;
