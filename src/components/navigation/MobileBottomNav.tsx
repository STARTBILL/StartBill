import React from 'react';
import { LayoutDashboard, FileText, Receipt, Users, Settings } from 'lucide-react';
import { ScreenId } from '../../types';

interface MobileBottomNavProps {
  currentScreen: ScreenId;
  setScreen: (screen: ScreenId) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentScreen,
  setScreen
}) => {
  const navTabs = [
    { id: 'dashboard', label: 'Accueil', icon: LayoutDashboard },
    { id: 'invoices', label: 'Factures', icon: FileText },
    { id: 'expenses', label: 'Dépenses', icon: Receipt },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'settings', label: 'Réglages', icon: Settings }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {navTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentScreen === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setScreen(tab.id as ScreenId)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer ${
              isActive
                ? 'text-emerald-600 font-extrabold scale-105'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MobileBottomNav;
