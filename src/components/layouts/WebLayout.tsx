import React from 'react';
import { useRegional } from '../../context/RegionalContext';
import { REGIONS } from '../../data/regions';
import { Laptop, Globe, ShieldCheck } from 'lucide-react';

interface WebLayoutProps {
  children: React.ReactNode;
}

export const WebLayout: React.FC<WebLayoutProps> = ({ children }) => {
  const { regionalSettings, region } = useRegional();
  const regionConfig = REGIONS[region];

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Desktop Web-First Banner */}
      <div className="hidden lg:flex items-center justify-between px-6 py-2 bg-slate-900 text-white text-xs font-semibold border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
            <Laptop className="w-3.5 h-3.5" />
            Mode Web-First ({regionConfig.name})
          </span>
          <span className="text-slate-400">
            Gestion comptable complète ({regionalSettings?.taxSystem?.toUpperCase() || 'TPS/TVH'})
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

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
};

export default WebLayout;
