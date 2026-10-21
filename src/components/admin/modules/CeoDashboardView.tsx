import React, { useState } from 'react';
import {
  CeoMetrics,
  AdminBusiness,
  Founding100Candidate,
} from '../adminTypes';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  DollarSign,
  CreditCard,
  LifeBuoy,
  ShieldAlert,
  Server,
  Sparkles,
  Filter,
  Calendar,
  Globe2,
  ArrowUpRight,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  BarChart3,
  Clock,
  Layers,
} from 'lucide-react';

interface CeoDashboardViewProps {
  metrics: CeoMetrics;
  businesses: AdminBusiness[];
  foundingCandidates: Founding100Candidate[];
  onNavigateToModule: (moduleId: any) => void;
  triggerToast: (msg: string) => void;
}

export const CeoDashboardView: React.FC<CeoDashboardViewProps> = ({
  metrics,
  businesses,
  foundingCandidates,
  onNavigateToModule,
  triggerToast,
}) => {
  const [timeFilter, setTimeFilter] = useState<'today' | '7d' | '30d' | '90d' | '12m'>('30d');
  const [countryFilter, setCountryFilter] = useState<'ALL' | 'CA' | 'SN' | 'CI' | 'HT'>('ALL');
  const [planFilter, setPlanFilter] = useState<'ALL' | 'Free' | 'Start' | 'Pro' | 'Business' | 'Founding 100'>('ALL');

  return (
    <div className="space-y-6">
      {/* Top Welcome & Context Banner */}
      <div className="bg-gradient-to-r from-[#0F1E36] via-[#122543] to-[#0A1628] border border-blue-500/20 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                MODULE 01 • TABLEAU DE BORD EXÉCUTIF
              </span>
              <span className="text-[11px] text-slate-400">
                Supervision temps réel • Canada, Afrique & Haïti
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Bonjour Ferline 👋 • Centre de Commandement Général
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Supervisez la croissance de STARTBILL, les revenus récurrents (MRR), la conversion client et le déploiement du programme <strong className="text-amber-300 font-bold">FOUNDING 100</strong> (J-11 avant le lancement officiel).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigateToModule('founding100')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black transition shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Gérer les 100 Pilotes ({foundingCandidates.length}/100)</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToModule('strategic_steering')}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white text-xs font-bold transition border border-slate-700 flex items-center gap-2 cursor-pointer"
            >
              <span>Objectifs & CAC/LTV</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Global Multi-Dimension Filters */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Période :</span>
            </span>
            {[
              { id: 'today', label: "Aujourd'hui" },
              { id: '7d', label: '7 jours' },
              { id: '30d', label: '30 jours' },
              { id: '90d', label: '90 jours' },
              { id: '12m', label: '12 mois' },
            ].map(tf => (
              <button
                key={tf.id}
                type="button"
                onClick={() => {
                  setTimeFilter(tf.id as any);
                  triggerToast(`Filtre temporel appliqué : ${tf.label}`);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  timeFilter === tf.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-lg px-2 py-1 text-xs">
              <Globe2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={countryFilter}
                onChange={e => {
                  setCountryFilter(e.target.value as any);
                  triggerToast(`Filtrage géographique : ${e.target.value}`);
                }}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
              >
                <option value="ALL" className="bg-slate-900">Tous les pays</option>
                <option value="CA" className="bg-slate-900">🇨🇦 Canada</option>
                <option value="SN" className="bg-slate-900">🇸🇳 Sénégal</option>
                <option value="CI" className="bg-slate-900">🇨🇮 Côte d’Ivoire</option>
                <option value="HT" className="bg-slate-900">🇭🇹 Haïti</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-lg px-2 py-1 text-xs">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={planFilter}
                onChange={e => setPlanFilter(e.target.value as any)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
              >
                <option value="ALL" className="bg-slate-900">Tous les plans</option>
                <option value="Free" className="bg-slate-900">Free</option>
                <option value="Start" className="bg-slate-900">Start</option>
                <option value="Pro" className="bg-slate-900">Pro</option>
                <option value="Business" className="bg-slate-900">Business</option>
                <option value="Founding 100" className="bg-slate-900">Founding 100</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (15 Key Metrics required by specifications) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {/* MRR */}
        <div className="bg-[#0B1528] border border-slate-800 p-4 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">MRR Consolidé</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-white">
            {metrics.mrrCad.toLocaleString('fr-CA')} $ CAD
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
            <TrendingUp className="w-3 h-3" />
            <span>+14.2% ce mois</span>
          </div>
        </div>

        {/* ARR */}
        <div className="bg-[#0B1528] border border-slate-800 p-4 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">ARR Estimé</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-white">
            {metrics.arrCad.toLocaleString('fr-CA')} $ CAD
          </div>
          <div className="text-[11px] text-slate-400">
            Base récurrente annuelle
          </div>
        </div>

        {/* Entreprises Totales */}
        <div className="bg-[#0B1528] border border-slate-800 p-4 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Entreprises</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-white">
            {metrics.totalBusinesses}
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold">
            {metrics.newRegistrationsThisMonth} nouvelles ce mois
          </div>
        </div>

        {/* Entreprises Actives */}
        <div className="bg-[#0B1528] border border-slate-800 p-4 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Entreprises Actives</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-white">
            {metrics.activeBusinesses}
          </div>
          <div className="text-[11px] text-slate-400">
            {metrics.trialBusinesses} en période d'essai
          </div>
        </div>

        {/* Abonnements Payants */}
        <div className="bg-[#0B1528] border border-slate-800 p-4 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Abonnements Payants</span>
            <CreditCard className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-white">
            {metrics.paidSubscriptions}
          </div>
          <div className="text-[11px] text-purple-400 font-semibold">
            Plans Start, Pro & Business
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-[#0B1528] border border-slate-800 p-4 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Taux Conversion</span>
            <BarChart3 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-white">
            {metrics.conversionRate}%
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold">
            +0.8% vs moyenne SaaS
          </div>
        </div>

        {/* Churn Rate */}
        <div className="bg-[#0B1528] border border-slate-800 p-4 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Taux Désabonnement</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-emerald-400">
            {metrics.churnRate}%
          </div>
          <div className="text-[11px] text-slate-400">
            Excellente stabilité
          </div>
        </div>

        {/* Retention Rate */}
        <div className="bg-[#0B1528] border border-slate-800 p-4 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Taux Rétention</span>
            <Users className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-white">
            {metrics.retentionRate}%
          </div>
          <div className="text-[11px] text-teal-400 font-semibold">
            Cohorte T3 2026
          </div>
        </div>

        {/* Tickets Support Ouverts */}
        <div className="bg-[#0B1528] border border-slate-800 p-4 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tickets Support</span>
            <LifeBuoy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-white">
            {metrics.openSupportTickets}
          </div>
          <div className="text-[11px] text-amber-300 font-semibold">
            Délai moy. 1h 24m
          </div>
        </div>

        {/* Consommation Cloud & Sécurité */}
        <div className="bg-[#0B1528] border border-slate-800 p-4 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Ressources Cloud</span>
            <Server className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-white">
            {metrics.cloudResourceConsumptionPercent}%
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold">
            0 incident • 0 alerte
          </div>
        </div>
      </div>

      {/* Interactive Performance Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Évolution des Inscriptions & Revenus */}
        <div className="lg:col-span-2 bg-[#0B1528] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span>Évolution des Revenus Récurrents (MRR $ CAD) & Nouvelles Inscriptions</span>
              </h3>
              <p className="text-[11px] text-slate-400">Historique des 6 derniers mois (Mai à Octobre 2026)</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300">
              T3 / T4 2026
            </span>
          </div>

          {/* SVG Bar / Area Chart */}
          <div className="h-48 w-full pt-4">
            <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#1E293B" strokeDasharray="3 3" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#1E293B" strokeDasharray="3 3" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#1E293B" strokeDasharray="3 3" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="#334155" />

              {/* Y Axis Labels */}
              <text x="30" y="24" fill="#64748B" fontSize="9" textAnchor="end">20k$</text>
              <text x="30" y="64" fill="#64748B" fontSize="9" textAnchor="end">15k$</text>
              <text x="30" y="104" fill="#64748B" fontSize="9" textAnchor="end">10k$</text>
              <text x="30" y="144" fill="#64748B" fontSize="9" textAnchor="end">5k$</text>

              {/* Area path */}
              <polygon
                points="80,120 150,105 220,85 290,65 360,45 440,25 440,140 80,140"
                fill="url(#mrrGrad)"
              />

              {/* Line path */}
              <polyline
                fill="none"
                stroke="#3B82F6"
                strokeWidth="3"
                points="80,120 150,105 220,85 290,65 360,45 440,25"
              />

              {/* Data points */}
              {[
                { x: 80, y: 120, label: 'Mai', val: '7.8k$' },
                { x: 150, y: 105, label: 'Juin', val: '9.5k$' },
                { x: 220, y: 85, label: 'Juil', val: '12.4k$' },
                { x: 290, y: 65, label: 'Août', val: '15.1k$' },
                { x: 360, y: 45, label: 'Sept', val: '17.3k$' },
                { x: 440, y: 25, label: 'Oct', val: '19.8k$' },
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="4" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
                  <text x={pt.x} y={pt.y - 10} fill="#93C5FD" fontSize="9" fontWeight="bold" textAnchor="middle">
                    {pt.val}
                  </text>
                  <text x={pt.x} y="155" fill="#64748B" fontSize="10" textAnchor="middle">
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Chart 2: Répartition Géographique (Canada, Afrique, Haïti) */}
        <div className="bg-[#0B1528] border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-emerald-400" />
              <span>Croissance par Pays & Région</span>
            </h3>
            <p className="text-[11px] text-slate-400">Distribution active des entreprises clientes</p>
          </div>

          <div className="space-y-3 py-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-200 mb-1">
                <span className="flex items-center gap-1.5">
                  <span>🇨🇦</span>
                  <span>Canada (QC, ON, BC)</span>
                </span>
                <span className="font-mono text-blue-400 font-bold">64% (91 entreprises)</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '64%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-200 mb-1">
                <span className="flex items-center gap-1.5">
                  <span>🇸🇳</span>
                  <span>Sénégal (Dakar, Thiès)</span>
                </span>
                <span className="font-mono text-emerald-400 font-bold">18% (26 entreprises)</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '18%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-200 mb-1">
                <span className="flex items-center gap-1.5">
                  <span>🇨🇮</span>
                  <span>Côte d’Ivoire (Abidjan)</span>
                </span>
                <span className="font-mono text-amber-400 font-bold">11% (16 entreprises)</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '11%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-200 mb-1">
                <span className="flex items-center gap-1.5">
                  <span>🇭🇹</span>
                  <span>Haïti (Port-au-Prince, Cap)</span>
                </span>
                <span className="font-mono text-purple-400 font-bold">7% (9 entreprises)</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '7%' }} />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToModule('international')}
            className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Configurer les marchés internationaux</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* CEO Decision Alert Center */}
      <div className="bg-[#0B1528] border border-amber-500/30 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Centre d'Alertes et Décisions de la Direction</h3>
              <p className="text-[11px] text-slate-400">Événements stratégiques nécessitant l'arbitrage de Ferline ZOGNI</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
            2 DÉCISIONS EN ATTENTE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-white">Validation du quota des 100 Entreprises Pilotes</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                6 candidatures prêtes pour le statut « Acceptée » avec accords 3 mois.
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateToModule('founding100')}
                  className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-[10px] hover:bg-amber-400 transition cursor-pointer"
                >
                  Examiner les dossiers
                </button>
              </div>
            </div>
            <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-white">Activation des passerelles Mobile Money (Sénégal & CI)</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Tests sandbox terminés pour Wave et Orange Money. En attente d'approbation CEO pour passage en production.
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateToModule('feature_flags')}
                  className="px-2.5 py-1 bg-blue-600 text-white font-bold rounded-lg text-[10px] hover:bg-blue-500 transition cursor-pointer"
                >
                  Ouvrir Feature Flags
                </button>
              </div>
            </div>
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
