import React from 'react';
import { useRegionalContext } from '../context/RegionalContext';
import { REGIONS } from '../data/regions';
import { Smartphone, Laptop, Globe, ShieldCheck } from 'lucide-react';

interface RegionalLayoutProps {
  children: React.ReactNode;
}

export const WebLayout: React.FC<RegionalLayoutProps> = ({ children }) => {
  const { regionalSettings, region } = useRegionalContext();
  const regionConfig = REGIONS[region];

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Web-First Desktop Top Banner Bar */}
      <div className="hidden lg:flex items-center justify-between px-6 py-2 bg-slate-900 text-white text-xs font-semibold border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
            <Laptop className="w-3.5 h-3.5" />
            Mode Web-First ({regionConfig.name})
          </span>
          <span className="text-slate-400">
            Interface optimisée pour grand écran & gestion comptable complète ({regionalSettings.taxSystem.toUpperCase()})
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-300">
          <span className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>Devise : <strong>{regionalSettings.currency} ({regionalSettings.currencySymbol})</strong></span>
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Conforme ARC / RQ</span>
          </span>
        </div>
      </div>

      {/* Web-First Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
};

export const MobileLayout: React.FC<RegionalLayoutProps> = ({ children }) => {
  const { regionalSettings, region } = useRegionalContext();
  const regionConfig = REGIONS[region];

  return (
    <div className="w-full min-h-screen bg-slate-100 flex flex-col font-sans pb-16">
      {/* Mobile-First Header Pill Strip */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-2xl leading-none select-none">{regionConfig.flag}</span>
          <div>
            <div className="text-xs font-black text-slate-900 flex items-center gap-1">
              <span>{regionConfig.name}</span>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded border border-emerald-200">
                Mobile-First
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-emerald-600" />
              <span>Mobile Money & WhatsApp</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="bg-slate-100 text-slate-800 text-[11px] font-extrabold px-2.5 py-1 rounded-lg border border-slate-200">
            {regionalSettings.currency} ({regionalSettings.currencySymbol})
          </span>
        </div>
      </div>

      {/* Mobile-First Streamlined Content Container */}
      <div className="flex-1 w-full max-w-md mx-auto p-3 sm:p-4 space-y-4">
        {children}
      </div>
    </div>
  );
};

export const RegionalLayout: React.FC<RegionalLayoutProps> = ({ children }) => {
  const { isWebFirst } = useRegionalContext();

  if (isWebFirst) {
    return <WebLayout>{children}</WebLayout>;
  } else {
    return <MobileLayout>{children}</MobileLayout>;
  }
};
