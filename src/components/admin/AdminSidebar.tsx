import React, { useState } from 'react';
import {
  AdminModuleId,
} from './adminTypes';
import {
  LayoutDashboard,
  Target,
  Building2,
  Users,
  CreditCard,
  DollarSign,
  Sparkles,
  UserCheck,
  Globe2,
  ToggleLeft,
  Bot,
  FileCheck2,
  BarChart3,
  LifeBuoy,
  Megaphone,
  Handshake,
  Network,
  BookOpen,
  ShieldCheck,
  KeyRound,
  FileText,
  Activity,
  Milestone,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpRight,
  Shield,
  Layers,
} from 'lucide-react';

interface AdminSidebarProps {
  activeModule: AdminModuleId;
  setActiveModule: (id: AdminModuleId) => void;
  onSwitchToClientApp: () => void;
  onOpenProfile: () => void;
  ceoName: string;
}

interface NavCategory {
  title: string;
  items: {
    id: AdminModuleId;
    moduleNumber: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
    badgeColor?: string;
  }[];
}

export const ADMIN_CATEGORIES: NavCategory[] = [
  {
    title: 'DIRECTION & STRATÉGIE',
    items: [
      { id: 'ceo_dashboard', moduleNumber: '01', label: 'Tableau de bord CEO', icon: LayoutDashboard },
      { id: 'strategic_steering', moduleNumber: '02', label: 'Pilotage stratégique', icon: Target },
    ],
  },
  {
    title: 'GESTION SAAS & CLIENTS',
    items: [
      { id: 'businesses', moduleNumber: '03', label: 'Entreprises', icon: Building2 },
      { id: 'users', moduleNumber: '04', label: 'Utilisateurs', icon: Users },
      { id: 'subscriptions', moduleNumber: '05', label: 'Abonnements', icon: CreditCard },
      { id: 'payments', moduleNumber: '06', label: 'Paiements STARTBILL', icon: DollarSign },
      {
        id: 'founding100',
        moduleNumber: '07',
        label: 'Programme FOUNDING 100',
        icon: Sparkles,
        badge: '100 PILOTES',
        badgeColor: 'bg-amber-500 text-amber-950',
      },
      { id: 'crm', moduleNumber: '08', label: 'CRM Administratif', icon: UserCheck },
    ],
  },
  {
    title: 'EXPANSION & PRODUIT',
    items: [
      { id: 'international', moduleNumber: '09', label: 'Gestion internationale', icon: Globe2 },
      { id: 'feature_flags', moduleNumber: '10', label: 'Produit & Feature Flags', icon: ToggleLeft },
      { id: 'ai_supervision', moduleNumber: '11', label: 'Intelligence Artificielle', icon: Bot, badge: 'IA v2.5' },
      { id: 'fiscal_reference', moduleNumber: '12', label: 'Référentiels fiscaux', icon: FileCheck2 },
      { id: 'reports_analytics', moduleNumber: '13', label: 'Rapports & statistiques', icon: BarChart3 },
    ],
  },
  {
    title: 'SUPPORT & RELATIONS',
    items: [
      { id: 'support_tickets', moduleNumber: '14', label: 'Support client', icon: LifeBuoy, badge: 'SLA 99%' },
      { id: 'marketing_comms', moduleNumber: '15', label: 'Marketing & annonces', icon: Megaphone },
      { id: 'partners', moduleNumber: '16', label: 'Partenaires', icon: Handshake },
      { id: 'international_team', moduleNumber: '17', label: 'Équipe internationale', icon: Network },
      { id: 'documentation', moduleNumber: '18', label: 'Formation & doc', icon: BookOpen },
    ],
  },
  {
    title: 'SÉCURITÉ & GOUVERNANCE',
    items: [
      { id: 'security_center', moduleNumber: '19', label: 'Centre de sécurité', icon: ShieldCheck, badge: 'Zero-Trust' },
      { id: 'rbac_permissions', moduleNumber: '20', label: 'Rôles & permissions', icon: KeyRound },
      { id: 'audit_compliance', moduleNumber: '21', label: 'Audit & conformité', icon: FileText, badge: 'Loi 25' },
      { id: 'system_monitoring', moduleNumber: '22', label: 'Surveillance technique', icon: Activity },
      { id: 'roadmap_versions', moduleNumber: '23', label: 'Roadmap & versions', icon: Milestone },
      { id: 'general_settings', moduleNumber: '24', label: 'Paramètres généraux', icon: Settings },
    ],
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeModule,
  setActiveModule,
  onSwitchToClientApp,
  onOpenProfile,
  ceoName,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const filteredCategories = ADMIN_CATEGORIES.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      item.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.moduleNumber.includes(searchFilter)
    ),
  })).filter(cat => cat.items.length > 0);

  return (
    <aside
      className={`h-screen bg-[#070e1b] text-slate-200 border-r border-slate-800/80 flex flex-col transition-all duration-300 relative z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Top Branding Section */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20 shrink-0">
              SB
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-white tracking-wider">STARTBILL</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  ADMIN
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                CEO COMMAND CENTER
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20">
            SB
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-slate-400 hover:text-white transition cursor-pointer"
          title={isCollapsed ? 'Déplier le menu' : 'Replier le menu'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* CEO Profile Quick Widget */}
      {!isCollapsed && (
        <div className="p-3 mx-3 my-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate cursor-pointer" onClick={onOpenProfile}>
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-xs ring-2 ring-amber-500/40">
                FZ
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">{ceoName}</div>
              <div className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" />
                <span>SUPER_ADMIN</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenProfile}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Mon profil administrateur"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search Filter (when expanded) */}
      {!isCollapsed && (
        <div className="px-3 py-1.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="Filtrer les 24 modules..."
              className="w-full bg-slate-900/70 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>
      )}

      {/* Navigation List - 24 Modules */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {filteredCategories.map(category => (
          <div key={category.title} className="space-y-1">
            {!isCollapsed && (
              <div className="px-2.5 text-[9px] font-black tracking-wider text-slate-500 uppercase">
                {category.title}
              </div>
            )}

            {category.items.map(item => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveModule(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer text-left ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-850/80'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />

                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between truncate">
                      <span className="truncate">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          className={`ml-1.5 px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-tight shrink-0 ${
                            item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300')
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Switcher: Back to Client Application */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        <button
          type="button"
          onClick={onSwitchToClientApp}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/80 text-xs font-bold transition cursor-pointer shadow-sm ${
            isCollapsed ? 'p-2' : ''
          }`}
          title="Basculer vers l'interface des entreprises clientes"
        >
          <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          {!isCollapsed && <span>Application Client</span>}
        </button>
      </div>
    </aside>
  );
};
