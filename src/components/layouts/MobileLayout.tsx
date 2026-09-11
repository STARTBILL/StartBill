import React from 'react';
import { useRegional } from '../../context/RegionalContext';
import { REGIONS } from '../../data/regions';
import { Smartphone } from 'lucide-react';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const { regionalSettings, region } = useRegional();
  const regionConfig = REGIONS[region];

  return (
    <div className="w-full min-h-screen bg-slate-100 flex flex-col font-sans pb-16">
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

      <div className="flex-1 w-full max-w-md mx-auto p-3 sm:p-4 space-y-4">
        {children}
      </div>
    </div>
  );
};

export default MobileLayout;
