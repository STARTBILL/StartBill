import React, { useState } from 'react';
import {
  AdminModuleId,
  AdminProfile,
} from './adminTypes';
import {
  ShieldCheck,
  Bell,
  ArrowUpRight,
  Search,
  Database,
  Lock,
  Globe,
  Sparkles,
  ChevronDown,
  X,
  ExternalLink,
} from 'lucide-react';

interface AdminHeaderProps {
  activeModule: AdminModuleId;
  ceoProfile: AdminProfile;
  onOpenProfile: () => void;
  onSwitchToClientApp: () => void;
  unreadAlertsCount: number;
}

const MODULE_TITLES: Record<AdminModuleId, { number: string; title: string; category: string }> = {
  ceo_dashboard: { number: '01', title: 'Tableau de bord CEO', category: 'Direction & Stratégie' },
  strategic_steering: { number: '02', title: 'Pilotage stratégique', category: 'Direction & Stratégie' },
  businesses: { number: '03', title: 'Gestion des Entreprises', category: 'Gestion SaaS & Clients' },
  users: { number: '04', title: 'Gestion des Utilisateurs', category: 'Gestion SaaS & Clients' },
  subscriptions: { number: '05', title: 'Abonnements & Tarification', category: 'Gestion SaaS & Clients' },
  payments: { number: '06', title: 'Paiements STARTBILL', category: 'Gestion SaaS & Clients' },
  founding100: { number: '07', title: 'STARTBILL FOUNDING 100', category: 'Programme Pilote' },
  crm: { number: '08', title: 'CRM Administratif', category: 'Gestion SaaS & Clients' },
  international: { number: '09', title: 'Gestion Internationale', category: 'Expansion & Marchés' },
  feature_flags: { number: '10', title: 'Produit & Feature Flags', category: 'Produit & Technologie' },
  ai_supervision: { number: '11', title: 'Intelligence Artificielle', category: 'Produit & Technologie' },
  fiscal_reference: { number: '12', title: 'Référentiels Financiers & Fiscaux', category: 'Conformité & Règles' },
  reports_analytics: { number: '13', title: 'Rapports & Statistiques', category: 'Analytique' },
  support_tickets: { number: '14', title: 'Support Client & Tickets', category: 'Support & Relations' },
  marketing_comms: { number: '15', title: 'Marketing & Communications', category: 'Marketing' },
  partners: { number: '16', title: 'Gestion des Partenaires', category: 'Écosystème' },
  international_team: { number: '17', title: 'Équipe Internationale', category: 'Ressources Humaines' },
  documentation: { number: '18', title: 'Formation & Documentation', category: 'Base de Connaissances' },
  security_center: { number: '19', title: 'Centre de Sécurité', category: 'Sécurité & Contrôle' },
  rbac_permissions: { number: '20', title: 'Rôles & Permissions (RBAC)', category: 'Gouvernance' },
  audit_compliance: { number: '21', title: 'Audit & Conformité (Loi 25)', category: 'Gouvernance & Droit' },
  system_monitoring: { number: '22', title: 'Surveillance Technique', category: 'Infrastructure Cloud' },
  roadmap_versions: { number: '23', title: 'Roadmap & Versions', category: 'Développement Produit' },
  general_settings: { number: '24', title: 'Paramètres Généraux', category: 'Configuration Plateforme' },
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeModule,
  ceoProfile,
  onOpenProfile,
  onSwitchToClientApp,
  unreadAlertsCount,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const current = MODULE_TITLES[activeModule] || { number: '', title: 'Admin', category: 'Général' };

  return (
    <header className="h-16 bg-[#0B1528] border-b border-slate-800/90 px-4 md:px-6 flex items-center justify-between text-white relative z-20 shrink-0">
      {/* Left: Breadcrumbs & Module Title */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
            <span>CEO Command Center</span>
            <span>/</span>
            <span className="text-blue-400">{current.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-base md:text-lg font-black text-white tracking-tight">
              {current.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Center: Live Environment & Status Badges */}
      <div className="hidden lg:flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Firestore Connectée</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-bold">
          <Lock className="w-3 h-3 text-blue-400" />
          <span>Zero-Trust RBAC</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Founding 100 : J-11</span>
        </div>
      </div>

      {/* Right: Actions, Notifications & Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Switch to Client View button */}
        <button
          type="button"
          onClick={onSwitchToClientApp}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-750 text-xs font-bold transition cursor-pointer"
          title="Afficher l'interface telle que vue par les clients"
        >
          <span>Vue Client</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
        </button>

        {/* Notifications Icon with popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition relative cursor-pointer"
            title="Notifications administratives"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0B1528]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 text-xs space-y-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-white text-xs">Alertes de Direction (CEO)</span>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-300">
                  <div className="font-bold text-amber-300 text-[11px] mb-0.5">
                    Programme FOUNDING 100
                  </div>
                  <p className="text-[11px] text-slate-300">
                    6 nouvelles candidatures d'entreprises en attente d'examen pour le Canada et Haïti.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-slate-300">
                  <div className="font-bold text-blue-300 text-[11px] mb-0.5">
                    Conformité Fiscale CRA / Loi 25
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Audit de sécurité trimestriel validé avec 100% de conformité Zero-Trust.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CEO Avatar Profile Button */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 transition cursor-pointer"
          title="Ouvrir « Mon profil administrateur »"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xs ring-1 ring-amber-400">
            FZ
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-white leading-tight">{ceoProfile.name}</div>
            <div className="text-[9px] font-black text-amber-400 uppercase tracking-wider">
              {ceoProfile.role}
            </div>
          </div>
          <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
        </button>
      </div>
    </header>
  );
};
