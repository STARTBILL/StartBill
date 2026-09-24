import React from 'react';
import { ScreenId } from '../types';
import { Activity, AlertTriangle, TrendingUp, Compass, History, Sparkles } from 'lucide-react';

interface FinancialNavTabsProps {
  currentScreen: ScreenId;
  setScreen: (screen: ScreenId) => void;
}

export default function FinancialNavTabs({ currentScreen, setScreen }: FinancialNavTabsProps) {
  const tabs = [
    { id: 'financial_health' as ScreenId, label: 'Santé & Ratios', icon: Activity },
    { id: 'ai_advisor' as ScreenId, label: 'Conseiller AI', icon: Sparkles },
    { id: 'financial_alerts' as ScreenId, label: 'Alertes financières', icon: AlertTriangle, badge: '5' },
    { id: 'financial_trends' as ScreenId, label: 'Tendances', icon: TrendingUp },
    { id: 'financial_forecasts' as ScreenId, label: 'Prévisions', icon: Compass },
    { id: 'financial_history' as ScreenId, label: 'Historique', icon: History }
  ];

  return (
    <div className="bg-slate-100/90 p-1.5 rounded-xl flex items-center gap-1 mb-4 overflow-x-auto no-scrollbar shadow-2xs border border-slate-200/70">
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setScreen(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              isActive
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
            {tab.badge && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-tight ${
                isActive ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
