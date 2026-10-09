import React from 'react';
import { LayoutDashboard, FileText, Receipt, Users, BarChart3, Settings, Bell, Globe, Package } from 'lucide-react';
import { ScreenId } from '../../types';
import { useRegional } from '../../context/RegionalContext';
import { REGIONS } from '../../data/regions';
import { StartBillLogo } from '../common/StartBillLogo';

interface WebSidebarProps {
  currentScreen: ScreenId;
  setScreen: (screen: ScreenId) => void;
  pendingInvoicesCount?: number;
}

export const WebSidebar: React.FC<WebSidebarProps> = ({
  currentScreen,
  setScreen,
  pendingInvoicesCount = 0
}) => {
  const { region, regionalSettings } = useRegional();
  const regionConfig = REGIONS[region];

  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'invoices', label: 'Factures', icon: FileText, badge: pendingInvoicesCount },
    { id: 'expenses', label: 'Dépenses', icon: Receipt },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'products', label: 'Produits & Services', icon: Package },
    { id: 'reports', label: 'Rapports TPS/TVQ', icon: BarChart3 },
    { id: 'settings', label: 'Paramètres', icon: Settings },
    { id: 'notifications', label: 'Alertes', icon: Bell }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 border-r border-slate-800 hidden md:flex shrink-0">
      <div className="space-y-6">
        {/* Brand Header with Official StartBill Logo */}
        <div 
          onClick={() => setScreen('dashboard')}
          className="px-2 py-1.5 cursor-pointer transition hover:opacity-90"
          title="StartBill - Ton assistant financier"
        >
          <StartBillLogo 
            variant="horizontal" 
            size="sm" 
            theme="dark" 
            showTagline={true} 
          />
        </div>

        {/* Region Badge */}
        <div 
          onClick={() => setScreen('choose_region')}
          className="bg-slate-800/80 border border-slate-700 hover:border-blue-500/50 p-3 rounded-xl flex items-center justify-between cursor-pointer transition group"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{regionConfig.flag}</span>
            <div>
              <div className="text-xs font-black text-white">{regionConfig.name}</div>
              <div className="text-[10px] text-slate-400">{regionalSettings.currency} ({regionalSettings.currencySymbol})</div>
            </div>
          </div>
          <Globe className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition" />
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setScreen(item.id as ScreenId)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="text-[10px] text-slate-500 px-2 font-semibold">
        StartBill © 2026 • Région {regionalSettings.country}
      </div>
    </aside>
  );
};

export default WebSidebar;
