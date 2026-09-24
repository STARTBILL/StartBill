import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronDown, 
  Plus, 
  ArrowRight,
  TrendingUp,
  Bell,
  Receipt,
  Calculator,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Wallet,
  Landmark,
  FileText,
  Users,
  Info,
  ArrowUpRight,
  CheckCircle2,
  HelpCircle,
  DollarSign,
  Percent,
  BarChart3,
  Download,
  Lightbulb,
  CreditCard,
  Lock,
  ChevronRight,
  PieChart,
  User,
  Building2
} from 'lucide-react';
import { ScreenId, SmartAlert } from '../types';
import { generateSmartAlerts, markAlertAsReadInFirestore } from '../lib/alerts';
import { Button } from './ui/Button';
import { Loader } from './ui/Loader';
import { ErrorState } from './ui/ErrorState';
import { Menu } from './ui/Menu';
import { useRegional } from '../context/RegionalContext';

interface DashboardProps {
  dbLoading: boolean;
  dbError: string | null;
  currentUser: any;
  fetchFirestoreData: (uid: string) => void;
  selectedTaxPeriod: string;
  setSelectedTaxPeriod: (period: string) => void;
  triggerToast: (msg: string) => void;
  setIsEditingInvoice: (val: boolean) => void;
  setInvClientName: (name: string) => void;
  setInvDate: (date: string) => void;
  setInvSubtotal: (subtotal: string) => void;
  setInvStatus: (status: any) => void;
  setShowNewInvoiceModal: (val: boolean) => void;
  setShowNewClientModal: (val: boolean) => void;
  setScreen: (screen: ScreenId) => void;
  dbClients: any[];
  totalRevenue: number;
  paidInvoicesCount: number;
  totalTax: number;
  estimatedTax: number;
  overdueInvoicesCount: number;
  totalEligibleExpenses: number;
  dbInvoices: any[];
  dbExpenses?: any[];
  setSelectedInvoiceId: (id: string | null) => void;
  setIsPro: (isPro: boolean) => void;
  isPro: boolean;
}

export default function Dashboard({
  dbLoading,
  dbError,
  currentUser,
  fetchFirestoreData,
  selectedTaxPeriod,
  setSelectedTaxPeriod,
  triggerToast,
  setIsEditingInvoice,
  setInvClientName,
  setInvDate,
  setInvSubtotal,
  setInvStatus,
  setShowNewInvoiceModal,
  setShowNewClientModal,
  setScreen,
  dbClients,
  totalRevenue,
  paidInvoicesCount,
  totalTax,
  estimatedTax,
  overdueInvoicesCount,
  totalEligibleExpenses,
  dbInvoices,
  dbExpenses = [],
  setSelectedInvoiceId,
  setIsPro,
  isPro
}: DashboardProps) {

  const { region, regionalSettings, currencySymbol, formatPrice } = useRegional();

  const [selectedChartRange, setSelectedChartRange] = useState('6 derniers mois');
  const [selectedAccount, setSelectedAccount] = useState('Tous les comptes');

  const userName = currentUser?.displayName 
    ? currentUser.displayName
    : currentUser?.email
      ? currentUser.email.split('@')[0]
      : 'Utilisateur';

  if (dbLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <Loader id="dashboard-db-loader" label="Chargement de votre tableau de bord en direct depuis Firestore..." />
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="p-6">
        <ErrorState
          id="dashboard-db-error"
          title="Erreur de connexion avec Firestore"
          message={dbError}
          onRetry={() => fetchFirestoreData(currentUser?.uid || '')}
          retryLabel="Réessayer"
        />
      </div>
    );
  }

  // Financial calculations
  const netProfit = Math.max(0, totalRevenue - totalEligibleExpenses);
  const taxesPayeesDépenses = Math.round(totalEligibleExpenses * 0.14975); // TPS+TVQ estimées sur dépenses
  const taxesNettes = Math.max(0, totalTax - taxesPayeesDépenses);
  const totalACote = Math.round(taxesNettes + estimatedTax);

  // Compute live smart alerts based on current state & Canadian rules
  const smartAlerts = generateSmartAlerts(
    currentUser?.uid || 'user-default',
    totalRevenue,
    totalTax,
    dbInvoices,
    isPro
  );
  const unreadAlertsCount = smartAlerts.filter(a => !a.isRead).length;

  // Chart data for 6 months calculated from real user data (0s if empty workspace)
  const getMonthlyData = () => {
    const hasData = (dbInvoices && dbInvoices.length > 0) || (dbExpenses && dbExpenses.length > 0);
    if (!hasData) {
      const now = new Date();
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
          month: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
          rev: 0,
          exp: 0,
          ben: 0
        });
      }
      return { data: months, maxVal: 100 };
    }

    const now = new Date();
    const months = [];
    let max = 100;

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });

      let rev = 0;
      let exp = 0;

      (dbInvoices || []).forEach(inv => {
        if (inv.date && inv.date.startsWith(yearMonth)) {
          if (inv.status === 'Payée' || inv.status === 'paid') {
            rev += Number(inv.amountPaid !== undefined ? inv.amountPaid : (inv.total || inv.subtotal || 0));
          } else if (inv.status === 'Partiellement payée' || inv.status === 'partial' || (inv.amountPaid !== undefined && inv.amountPaid > 0)) {
            rev += Number(inv.amountPaid || 0);
          }
        }
      });

      (dbExpenses || []).forEach(ex => {
        if (ex.date && ex.date.startsWith(yearMonth)) {
          exp += Number(ex.total || ex.amountHt || 0);
        }
      });

      const ben = Math.max(0, rev - exp);
      if (rev > max) max = rev;
      if (exp > max) max = exp;
      if (ben > max) max = ben;

      months.push({ month: monthLabel, rev, exp, ben });
    }

    return { data: months, maxVal: max || 100 };
  };

  const { data: monthlyData, maxVal } = getMonthlyData();

  // Expense breakdown categories calculated from real expenses
  const getExpenseCategories = () => {
    if (!dbExpenses || dbExpenses.length === 0 || totalEligibleExpenses === 0) {
      return [
        { label: 'Aucune dépense', pct: '0%', color: 'bg-slate-300' }
      ];
    }
    const catMap: Record<string, number> = {};
    dbExpenses.forEach(exp => {
      const cat = exp.category || 'Autres';
      catMap[cat] = (catMap[cat] || 0) + Number(exp.total || exp.amountHt || 0);
    });

    const colors = ['bg-blue-600', 'bg-emerald-500', 'bg-purple-600', 'bg-amber-500', 'bg-cyan-500', 'bg-slate-600', 'bg-rose-500', 'bg-gray-400'];
    const entries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((acc, curr) => acc + curr[1], 0) || 1;

    return entries.slice(0, 6).map(([label, amount], idx) => ({
      label,
      pct: `${Math.round((amount / total) * 100)}%`,
      color: colors[idx % colors.length]
    }));
  };

  const expenseCategories = getExpenseCategories();

  return (
    <div className="flex-1 flex flex-col px-4 md:px-8 py-6 pb-20 space-y-6 max-w-[1400px] mx-auto w-full transition-all duration-300 bg-slate-50/50">
      
      {/* ========================================================= */}
      {/* SECTION 1: HEADER / TOP BAR DE BIENVENUE                  */}
      {/* ========================================================= */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-2xl border border-secondary-200/80 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-primary-600 tracking-wide uppercase bg-primary-50 px-2.5 py-0.5 rounded-md border border-primary-100">
              {region === 'haiti' ? `Bonjou ${userName} 👋` : `Bonjour ${userName} 👋`}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-secondary-900">
            Dashboard (Vue d'ensemble) – {regionalSettings?.country || (region === 'afrique' ? 'Afrique' : region === 'haiti' ? 'Haïti' : 'Canada')}
          </h1>
          <p className="text-xs md:text-sm text-secondary-500 font-medium">
            Voici la vue d'ensemble de votre entreprise ({regionalSettings?.currency || 'CAD'} - {currencySymbol}).
          </p>
        </div>
        
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3 pt-2 xl:pt-0 border-t xl:border-t-0 border-secondary-100">
          {/* Menu Filtre Date */}
          <Menu
            id="fiscal-year-menu"
            align="left"
            trigger={
              <button className="bg-slate-50 hover:bg-slate-100 border border-secondary-200/80 rounded-xl px-3.5 py-2.5 flex items-center gap-2 text-xs font-bold text-secondary-700 transition shadow-2xs cursor-pointer">
                <Calendar className="w-4 h-4 text-primary-600" />
                <span>{selectedTaxPeriod}</span>
                <ChevronDown className="w-3.5 h-3.5 text-secondary-400 ml-1" />
              </button>
            }
            items={[
              { id: 'y2026', label: 'Mois en cours', onClick: () => setSelectedTaxPeriod('Mois en cours') },
              { id: 'y2025', label: 'Année 2026', onClick: () => setSelectedTaxPeriod('Année 2026') },
              { id: 'y2024', label: 'Toutes les dates', onClick: () => setSelectedTaxPeriod('Toutes les dates') },
            ]}
          />

          {/* Menu Tous les comptes */}
          <Menu
            id="account-selector-menu"
            align="left"
            trigger={
              <button className="bg-slate-50 hover:bg-slate-100 border border-secondary-200/80 rounded-xl px-3.5 py-2.5 flex items-center gap-2 text-xs font-bold text-secondary-700 transition shadow-2xs cursor-pointer">
                <Building2 className="w-4 h-4 text-primary-600" />
                <span>{selectedAccount}</span>
                <ChevronDown className="w-3.5 h-3.5 text-secondary-400 ml-1" />
              </button>
            }
            items={[
              { id: 'all', label: 'Tous les comptes', onClick: () => setSelectedAccount('Tous les comptes') },
              { id: 'business', label: 'Compte Entreprise', onClick: () => setSelectedAccount('Compte Entreprise') },
              { id: 'personal', label: 'Compte Personnel', onClick: () => setSelectedAccount('Compte Personnel') },
            ]}
          />

          <div className="h-6 w-[1px] bg-secondary-200 hidden sm:block mx-1" />

          {/* Cloche Notification */}
          <button 
            onClick={() => setScreen('notifications')}
            className="relative p-2.5 bg-slate-50 hover:bg-slate-100 border border-secondary-200/80 rounded-xl text-secondary-600 hover:text-secondary-900 transition shadow-2xs flex items-center justify-center cursor-pointer"
            title="Alertes & Notifications Intelligentes"
          >
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white shadow-xs">
                {unreadAlertsCount}
              </span>
            )}
            <Bell className="w-4 h-4" />
          </button>

          {/* Aide */}
          <button 
            onClick={() => triggerToast('Centre d\'aide StartBill ouvert.')}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-secondary-200/80 rounded-xl text-secondary-600 hover:text-secondary-900 transition shadow-2xs flex items-center justify-center cursor-pointer"
            title="Aide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Profile Pill */}
          <button 
            onClick={() => setScreen('login')}
            className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 border border-secondary-200/80 rounded-xl p-1.5 pr-3.5 transition cursor-pointer"
            title="Mon compte / Connexion"
          >
            <div className="w-8 h-8 rounded-full bg-primary-600 text-white font-black text-xs flex items-center justify-center overflow-hidden shadow-2xs">
              <User className="w-4.5 h-4.5" />
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <p className="text-xs font-black text-secondary-900">{userName}</p>
              <p className="text-[10px] text-secondary-500 font-semibold">Mon Compte</p>
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 2: METRICS CARDS + RÉSUMÉ FISCAL (5 COLUMNS GRID) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Revenus encaissés */}
        <div className="bg-white border border-secondary-200/80 rounded-2xl p-4 md:p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-[160px] group">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <DollarSign className="w-4.5 h-4.5" />
              </div>
              <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wide">Revenus encaissés</span>
            </div>
            <div className="text-xl md:text-2xl font-black text-secondary-900 tracking-tight">
              {formatPrice(totalRevenue || 0)}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-secondary-500 flex items-center gap-1 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-secondary-400" />
              <span>Période en cours</span>
            </div>
            {/* Sparkline chart SVG */}
            <svg viewBox="0 0 100 20" className="w-full h-5 text-blue-500 overflow-visible">
              <path d="M0 15 Q25 5, 50 12 T100 3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 2: Dépenses admissibles */}
        <div className="bg-white border border-secondary-200/80 rounded-2xl p-4 md:p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-[160px] group">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Wallet className="w-4.5 h-4.5" />
              </div>
              <span className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-wide">Dépenses admissibles</span>
            </div>
            <div className="text-xl md:text-2xl font-black text-secondary-900 tracking-tight">
              {formatPrice(totalEligibleExpenses || 0)}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-secondary-500 flex items-center gap-1 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-secondary-400" />
              <span>Période en cours</span>
            </div>
            {/* Sparkline chart SVG */}
            <svg viewBox="0 0 100 20" className="w-full h-5 text-emerald-500 overflow-visible">
              <path d="M0 16 Q25 10, 50 14 T100 4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 3: Bénéfice net */}
        <div className="bg-white border border-secondary-200/80 rounded-2xl p-4 md:p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-[160px] group">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <BarChart3 className="w-4.5 h-4.5" />
              </div>
              <span className="text-[11px] font-extrabold text-purple-600 uppercase tracking-wide">Bénéfice net</span>
            </div>
            <div className="text-xl md:text-2xl font-black text-secondary-900 tracking-tight">
              {formatPrice(netProfit || 0)}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-secondary-500 flex items-center gap-1 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-secondary-400" />
              <span>Période en cours</span>
            </div>
            {/* Sparkline chart SVG */}
            <svg viewBox="0 0 100 20" className="w-full h-5 text-purple-500 overflow-visible">
              <path d="M0 17 Q25 12, 50 8 T100 2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 4: Taxes à remettre */}
        <div className="bg-white border border-secondary-200/80 rounded-2xl p-4 md:p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-[160px] group">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Percent className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wide leading-tight">Taxes à remettre</span>
            </div>
            <div className="text-xl md:text-2xl font-black text-secondary-900 tracking-tight">
              {formatPrice(totalTax || 0)}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-secondary-500 flex items-center gap-1 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-secondary-400" />
              <span>{region === 'canada' ? 'TPS / TVQ / TVH' : 'Taxes régionales'}</span>
            </div>
            {/* Sparkline chart SVG */}
            <svg viewBox="0 0 100 20" className="w-full h-5 text-amber-500 overflow-visible">
              <path d="M0 14 Q25 18, 50 10 T100 5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 5: RÉSUMÉ FISCAL */}
        <div className="bg-white border border-blue-200/90 rounded-2xl p-4 md:p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between md:col-span-2 lg:col-span-1 min-h-[160px] group">
          <div>
            <div className="flex items-center justify-between border-b border-blue-100 pb-2 mb-2.5">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Receipt className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-[11px] font-black text-secondary-900 tracking-wider uppercase">
                  Résumé Fiscal
                </h3>
              </div>
              <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                En cours
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-semibold">
              <div className="flex justify-between items-center text-secondary-600 text-[11px]">
                <span className="truncate pr-1">Taxes collectées</span>
                <span className="font-bold text-secondary-900 shrink-0">{formatPrice(totalTax || 0)}</span>
              </div>

              <div className="flex justify-between items-center text-secondary-600 text-[11px]">
                <span className="truncate pr-1">Moins: Taxes payées</span>
                <span className="font-bold text-secondary-900 shrink-0">- {formatPrice(taxesPayeesDépenses || 0)}</span>
              </div>

              <div className="flex justify-between items-center text-rose-600 font-extrabold text-[11px] pt-1 border-t border-slate-100">
                <span className="truncate pr-1">= Taxes nettes</span>
                <span className="shrink-0">{formatPrice(taxesNettes || 0)}</span>
              </div>

              <div className="flex justify-between items-center text-rose-600 font-extrabold text-[11px]">
                <span className="truncate pr-1">Impôt estimé</span>
                <span className="shrink-0">{formatPrice(estimatedTax || 0)}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-2.5 text-white text-center shadow-2xs">
            <span className="text-[9px] font-extrabold uppercase tracking-wider block opacity-90">
              À mettre de côté
            </span>
            <span className="text-base font-black block leading-none mt-1">
              {formatPrice(totalACote || 0)}
            </span>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* SECTION 3: MIDDLE ROW (3 COLUMNS)                         */}
      {/* 1. Évolution Financière | 2. Répartition | 3. Santé       */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Col 1: ÉVOLUTION FINANCIÈRE (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-secondary-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex items-center justify-between border-b border-secondary-100 pb-3 mb-4">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-black text-secondary-900 uppercase tracking-wider">
                  ÉVOLUTION FINANCIÈRE
                </h3>
                <Info className="w-3.5 h-3.5 text-secondary-400" />
              </div>

              <Menu
                id="chart-range-menu"
                align="right"
                trigger={
                  <button className="bg-slate-50 hover:bg-slate-100 border border-secondary-200/80 rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-[11px] font-bold text-secondary-700 transition">
                    <span>{selectedChartRange}</span>
                    <ChevronDown className="w-3 h-3 text-secondary-400" />
                  </button>
                }
                items={[
                  { id: '6m', label: '6 derniers mois', onClick: () => setSelectedChartRange('6 derniers mois') },
                  { id: '12m', label: '12 derniers mois', onClick: () => setSelectedChartRange('12 derniers mois') },
                  { id: 'ytd', label: 'Année en cours', onClick: () => setSelectedChartRange('Année en cours') },
                ]}
              />
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-bold text-secondary-600 mb-6">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block"></span>
                <span>Revenus</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span>
                <span>Dépenses</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-purple-600 inline-block"></span>
                <span>Bénéfice</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Canvas with Mobile Horizontal Scroll */}
          <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
            <div className="min-w-[420px] lg:min-w-0 flex items-end justify-between h-[180px] pt-4 px-2 border-b border-secondary-200/60 gap-2">
              {monthlyData.map((d, i) => {
                const revH = Math.round((d.rev / maxVal) * 100);
                const expH = Math.round((d.exp / maxVal) * 100);
                const benH = Math.round((d.ben / maxVal) * 100);

                return (
                  <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="flex items-end justify-center gap-1 w-full h-full pb-1">
                      <div 
                        className="w-2.5 md:w-3 bg-blue-600 rounded-t-sm transition-all duration-300 hover:bg-blue-700" 
                        style={{ height: `${revH}%` }} 
                        title={`Revenus: ${formatPrice(d.rev)}`}
                      />
                      <div 
                        className="w-2.5 md:w-3 bg-emerald-500 rounded-t-sm transition-all duration-300 hover:bg-emerald-600" 
                        style={{ height: `${expH}%` }} 
                        title={`Dépenses: ${formatPrice(d.exp)}`}
                      />
                      <div 
                        className="w-2.5 md:w-3 bg-purple-600 rounded-t-sm transition-all duration-300 hover:bg-purple-700" 
                        style={{ height: `${benH}%` }} 
                        title={`Bénéfice: ${formatPrice(d.ben)}`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-secondary-500 mt-2 truncate w-full text-center">
                      {d.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Col 2: RÉPARTITION DES DÉPENSES ADMISSIBLES (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-secondary-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex items-center gap-1.5 border-b border-secondary-100 pb-3 mb-4">
              <h3 className="text-xs font-black text-secondary-900 uppercase tracking-wider">
                RÉPARTITION DES DÉPENSES ADMISSIBLES
              </h3>
              <Info className="w-3.5 h-3.5 text-secondary-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 py-2">
              {/* Complete & Unclipped Donut Chart SVG */}
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center p-1">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 overflow-visible">
                  {totalEligibleExpenses === 0 ? (
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#E2E8F0" strokeWidth="12" />
                  ) : (
                    <>
                      <circle cx="50" cy="50" r="35" fill="none" stroke="#2563EB" strokeWidth="12" strokeDasharray="48.38 219.91" strokeDashoffset="0" />
                      <circle cx="50" cy="50" r="35" fill="none" stroke="#10B981" strokeWidth="12" strokeDasharray="39.58 219.91" strokeDashoffset="-48.38" />
                      <circle cx="50" cy="50" r="35" fill="none" stroke="#9333EA" strokeWidth="12" strokeDasharray="30.79 219.91" strokeDashoffset="-87.96" />
                      <circle cx="50" cy="50" r="35" fill="none" stroke="#F59E0B" strokeWidth="12" strokeDasharray="26.39 219.91" strokeDashoffset="-118.75" />
                      <circle cx="50" cy="50" r="35" fill="none" stroke="#06B6D4" strokeWidth="12" strokeDasharray="21.99 219.91" strokeDashoffset="-145.14" />
                      <circle cx="50" cy="50" r="35" fill="none" stroke="#475569" strokeWidth="12" strokeDasharray="17.59 219.91" strokeDashoffset="-167.13" />
                      <circle cx="50" cy="50" r="35" fill="none" stroke="#F43F5E" strokeWidth="12" strokeDasharray="13.19 219.91" strokeDashoffset="-184.72" />
                      <circle cx="50" cy="50" r="35" fill="none" stroke="#9CA3AF" strokeWidth="12" strokeDasharray="22.00 219.91" strokeDashoffset="-197.91" />
                    </>
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                  <span className="text-xs font-black text-secondary-900">{formatPrice(totalEligibleExpenses || 0)}</span>
                  <span className="text-[9px] text-secondary-400 font-semibold leading-tight">Total dépenses</span>
                </div>
              </div>

              {/* Breakdown List */}
              <div className="space-y-1.5 text-[11px] font-bold text-secondary-700">
                {expenseCategories.slice(0, 6).map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                      <span className="truncate max-w-[95px]">{cat.label}</span>
                    </div>
                    <span className="text-secondary-900 font-extrabold">{cat.pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={() => setScreen('expenses')}
            className="w-full py-2.5 border border-secondary-200 hover:border-secondary-300 rounded-xl text-xs font-bold text-secondary-700 hover:text-primary-600 transition flex items-center justify-center gap-1 bg-slate-50 hover:bg-slate-100 cursor-pointer"
          >
            <span>Voir toutes les dépenses</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Col 3: SANTÉ FINANCIÈRE (3 Cols) */}
        <div className="lg:col-span-3 bg-white border border-secondary-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[350px]">
          <div>
            <h3 className="text-xs font-black text-secondary-900 uppercase tracking-wider border-b border-secondary-100 pb-3 mb-3">
              SANTÉ FINANCIÈRE
            </h3>

            {/* Gauge meter */}
            <div className="flex flex-col items-center justify-center py-1">
              <div className="relative w-32 h-16 flex items-end justify-center">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#E2E8F0" strokeWidth="10" strokeLinecap="round" />
                  <path d="M 10 50 A 40 40 0 0 1 82 18" fill="none" stroke="#10B981" strokeWidth="10" strokeLinecap="round" />
                </svg>
                <div className="absolute bottom-0 text-center">
                  <span className="text-lg font-black text-secondary-900 leading-none">82</span>
                  <span className="text-[10px] text-secondary-400 font-bold block">/ 100</span>
                </div>
              </div>
              <span className="text-xs font-extrabold text-emerald-700 mt-1 flex items-center gap-1">
                <span>🙂</span> Bonne santé financière
              </span>
            </div>

            {/* Advice items */}
            <div className="space-y-2 mt-3">
              <div className="bg-emerald-50/70 border border-emerald-100/80 rounded-xl p-2.5 flex items-start gap-2 text-[11px] font-semibold text-emerald-900">
                <div className="p-1 rounded-full bg-emerald-500 text-white shrink-0 mt-0.5">
                  <TrendingUp className="w-3 h-3" />
                </div>
                <span>Espace de travail prêt et synchronisé en direct.</span>
              </div>

              <div className="bg-amber-50/70 border border-amber-100/80 rounded-xl p-2.5 flex items-start gap-2 text-[11px] font-semibold text-amber-900">
                <div className="p-1 rounded-full bg-amber-500 text-white shrink-0 mt-0.5">
                  <Landmark className="w-3 h-3" />
                </div>
                <span>Pensez à mettre de côté {formatPrice(totalACote || 0)} pour vos taxes et impôts.</span>
              </div>

              <div className="bg-blue-50/70 border border-blue-100/80 rounded-xl p-2.5 flex items-start gap-2 text-[11px] font-semibold text-blue-900">
                <div className="p-1 rounded-full bg-blue-600 text-white shrink-0 mt-0.5">
                  <PieChart className="w-3 h-3" />
                </div>
                <span>Vos dépenses de publicité sont élevées. Surveillez votre retour sur investissement.</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setScreen('ai_advisor')}
            className="text-center text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline pt-2 cursor-pointer block w-full"
          >
            Voir le Conseiller AI &gt;
          </button>
        </div>

      </div>

      {/* ========================================================= */}
      {/* SECTION 4: BOTTOM ROW (3 COLUMNS)                         */}
      {/* 1. Actions Rapides | 2. Rappels Importants | 3. Objectif  */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Actions Rapides (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-secondary-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all duration-200">
          <h3 className="text-xs font-black text-secondary-900 uppercase tracking-wider border-b border-secondary-100 pb-3 mb-4">
            ACTIONS RAPIDES
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
            {/* Button 1: Nouvelle facture */}
            <button 
              onClick={() => {
                setIsEditingInvoice(false);
                setInvClientName('');
                setInvDate(new Date().toISOString().split('T')[0]);
                setInvSubtotal('0');
                setInvStatus('Envoyée');
                setShowNewInvoiceModal(true);
              }}
              className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl border border-secondary-200/80 hover:border-blue-300 bg-slate-50/80 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer gap-2 min-h-[95px]"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white border border-blue-200/60 flex items-center justify-center transition-all duration-200 shadow-2xs group-hover:scale-105 group-hover:shadow-sm">
                <Plus className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
              </div>
              <span className="text-[11px] font-black text-secondary-800 group-hover:text-blue-700 leading-tight text-center">
                Nouvelle facture
              </span>
            </button>

            {/* Button 2: Ajouter une dépense */}
            <button 
              onClick={() => setScreen('add_expense')}
              className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl border border-secondary-200/80 hover:border-emerald-300 bg-slate-50/80 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer gap-2 min-h-[95px]"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white border border-emerald-200/60 flex items-center justify-center transition-all duration-200 shadow-2xs group-hover:scale-105 group-hover:shadow-sm">
                <DollarSign className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
              </div>
              <span className="text-[11px] font-black text-secondary-800 group-hover:text-emerald-700 leading-tight text-center">
                Ajouter dépense
              </span>
            </button>

            {/* Button 3: Nouveau client */}
            <button 
              onClick={() => setShowNewClientModal(true)}
              className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl border border-secondary-200/80 hover:border-purple-300 bg-slate-50/80 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer gap-2 min-h-[95px]"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-50 group-hover:bg-purple-600 text-purple-600 group-hover:text-white border border-purple-200/60 flex items-center justify-center transition-all duration-200 shadow-2xs group-hover:scale-105 group-hover:shadow-sm">
                <User className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
              </div>
              <span className="text-[11px] font-black text-secondary-800 group-hover:text-purple-700 leading-tight text-center">
                Nouveau client
              </span>
            </button>

            {/* Button 4: Voir rapports */}
            <button 
              onClick={() => setScreen('tax_prep')}
              className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl border border-secondary-200/80 hover:border-amber-300 bg-slate-50/80 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer gap-2 min-h-[95px]"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-50 group-hover:bg-amber-600 text-amber-600 group-hover:text-white border border-amber-200/60 flex items-center justify-center transition-all duration-200 shadow-2xs group-hover:scale-105 group-hover:shadow-sm">
                <BarChart3 className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
              </div>
              <span className="text-[11px] font-black text-secondary-800 group-hover:text-amber-700 leading-tight text-center">
                Voir rapports
              </span>
            </button>

            {/* Button 5: Export comptable */}
            <button 
              onClick={() => triggerToast('Export comptable prêt et téléchargé.')}
              className="flex flex-row sm:flex-col lg:flex-row items-center justify-center p-3 sm:p-3.5 rounded-xl border border-secondary-200/80 hover:border-cyan-300 bg-slate-50/80 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer gap-2.5 min-h-[95px] col-span-2 sm:col-span-1 lg:col-span-2"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-cyan-50 group-hover:bg-cyan-600 text-cyan-600 group-hover:text-white border border-cyan-200/60 flex items-center justify-center transition-all duration-200 shadow-2xs group-hover:scale-105 group-hover:shadow-sm shrink-0">
                <Download className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
              </div>
              <span className="text-[11px] font-black text-secondary-800 group-hover:text-cyan-700 leading-tight text-center">
                Export comptable
              </span>
            </button>
          </div>
        </div>

        {/* Rappels Importants (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-secondary-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-secondary-900 uppercase tracking-wider border-b border-secondary-100 pb-3 mb-3">
              RAPPELS IMPORTANTS
            </h3>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between bg-slate-50/80 border border-secondary-200/60 rounded-xl p-2.5">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-secondary-500 shrink-0" />
                  <div>
                    <h4 className="text-xs font-extrabold text-secondary-900">Paiement TPS/TVH/TVQ – T2 2026</h4>
                    <p className="text-[10px] text-secondary-500 font-semibold">Échéance : 5 juillet 2026</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-amber-100/80 text-amber-800 px-2 py-0.5 rounded-md shrink-0">
                  Dans 35 jours
                </span>
              </div>

              <div className="flex items-center justify-between bg-slate-50/80 border border-secondary-200/60 rounded-xl p-2.5">
                <div className="flex items-center gap-2.5">
                  <Receipt className="w-4 h-4 text-secondary-500 shrink-0" />
                  <div>
                    <h4 className="text-xs font-extrabold text-secondary-900">Paiement anticipé d'impôt</h4>
                    <p className="text-[10px] text-secondary-500 font-semibold">Échéance : 15 juin 2026</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-amber-100/80 text-amber-800 px-2 py-0.5 rounded-md shrink-0">
                  Dans 15 jours
                </span>
              </div>

              <div className="flex items-center justify-between bg-slate-50/80 border border-secondary-200/60 rounded-xl p-2.5">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-secondary-500 shrink-0" />
                  <div>
                    <h4 className="text-xs font-extrabold text-secondary-900">Préparation impôts 2026</h4>
                    <p className="text-[10px] text-secondary-500 font-semibold">Commencez à organiser vos documents.</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md shrink-0">
                  À venir
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => triggerToast('Affichage des rappels fiscaux...')}
            className="text-center text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline pt-2 cursor-pointer block w-full"
          >
            Voir tous les rappels &gt;
          </button>
        </div>

        {/* Objectif d'épargne impôts (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-secondary-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-secondary-100 pb-3 mb-3">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-black text-secondary-900 uppercase tracking-wider">
                  OBJECTIF D'ÉPARGNE IMPÔTS
                </h3>
                <Info className="w-3.5 h-3.5 text-secondary-400" />
              </div>
            </div>

            <p className="text-xs font-bold text-secondary-500 mb-2">Objectif annuel : {formatPrice(12000)}</p>
            
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xl font-black text-secondary-900">
                {formatPrice(totalACote || 0)}
                <span className="text-xs font-bold text-emerald-600 ml-1.5">
                  ({Math.min(100, Math.round(((totalACote || 0) / 12000) * 100))}%)
                </span>
              </span>
            </div>

            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-2 border border-slate-200/60">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round(((totalACote || 0) / 12000) * 100))}%` }}
              />
            </div>

            <p className="text-xs font-bold text-secondary-600">Continuez comme ça !</p>
          </div>

          <button 
            onClick={() => triggerToast('Réserves d\'impôts mises à jour !')}
            className="w-full py-2.5 border border-blue-200 hover:border-blue-300 rounded-xl text-xs font-bold text-blue-700 hover:bg-blue-50 transition shadow-2xs cursor-pointer mt-3"
          >
            Ajouter à ma réserve
          </button>
        </div>

      </div>

      {/* ========================================================= */}
      {/* SECTION: ALERTES INTELLIGENTES DU DASHBOARD (3 DERNIÈRES)  */}
      {/* ========================================================= */}
      <div className="bg-white border border-secondary-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-secondary-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-secondary-900 uppercase tracking-wider flex items-center gap-2">
                ALERTES INTELLIGENTES FISCALES & FACTURES
                {unreadAlertsCount > 0 && (
                  <span className="bg-rose-100 text-rose-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-rose-200">
                    {unreadAlertsCount} non lue{unreadAlertsCount > 1 ? 's' : ''}
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-secondary-500 font-medium">Recommandations automatiques pour votre situation fiscale canadienne (ARC / Revenu Québec)</p>
            </div>
          </div>

          <button
            onClick={() => setScreen('notifications')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 transition cursor-pointer"
          >
            <span>Voir toutes les alertes ({smartAlerts.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* List of 3 latest alerts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {smartAlerts.slice(0, 3).map((alert) => {
            const severityStyles = {
              danger: {
                bg: 'bg-rose-50/80',
                border: 'border-rose-200',
                badgeBg: 'bg-rose-600 text-white',
                icon: AlertCircle,
                iconColor: 'text-rose-600',
                badgeText: 'DANGER / OBLIGATION'
              },
              warning: {
                bg: 'bg-amber-50/80',
                border: 'border-amber-200',
                badgeBg: 'bg-amber-500 text-white',
                icon: AlertTriangle,
                iconColor: 'text-amber-600',
                badgeText: 'AVERTISSEMENT'
              },
              info: {
                bg: 'bg-blue-50/80',
                border: 'border-blue-200',
                badgeBg: 'bg-blue-600 text-white',
                icon: Info,
                iconColor: 'text-blue-600',
                badgeText: 'INFORMATION'
              },
              success: {
                bg: 'bg-emerald-50/80',
                border: 'border-emerald-200',
                badgeBg: 'bg-emerald-600 text-white',
                icon: CheckCircle2,
                iconColor: 'text-emerald-600',
                badgeText: 'CONFORME'
              }
            }[alert.severity];

            const Icon = severityStyles.icon;

            return (
              <div 
                key={alert.id}
                className={`${severityStyles.bg} border ${severityStyles.border} rounded-xl p-3.5 flex flex-col justify-between transition hover:shadow-xs relative`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${severityStyles.badgeBg}`}>
                      {severityStyles.badgeText}
                    </span>
                    {!alert.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" title="Non lue"></span>
                    )}
                  </div>

                  <div className="flex items-start gap-2 mb-1.5">
                    <Icon className={`w-4 h-4 ${severityStyles.iconColor} flex-shrink-0 mt-0.5`} />
                    <h4 className="text-xs font-bold text-secondary-900 leading-tight">
                      {alert.title}
                    </h4>
                  </div>

                  <p className="text-[11px] text-secondary-600 leading-relaxed font-medium mb-3">
                    {alert.message}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between gap-2 mt-auto">
                  {alert.actionUrl && (
                    <button
                      onClick={() => {
                        markAlertAsReadInFirestore(alert.id);
                        if (alert.actionUrl) setScreen(alert.actionUrl);
                        if (alert.targetId) setSelectedInvoiceId(alert.targetId);
                      }}
                      className="text-[10px] font-bold text-slate-800 hover:text-blue-700 bg-white border border-slate-200 hover:border-blue-300 px-2.5 py-1 rounded-lg transition shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      <span>{alert.actionLabel || 'Agir maintenant'}</span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </button>
                  )}

                  <button
                    onClick={() => {
                      markAlertAsReadInFirestore(alert.id, !alert.isRead);
                      triggerToast(alert.isRead ? 'Alerte marquée comme non lue' : 'Alerte marquée comme lue ✓');
                    }}
                    className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 ml-auto cursor-pointer"
                  >
                    {alert.isRead ? 'Relire' : 'Marquer lue'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 5: FOOTER STRIP BANNER                            */}
      {/* ========================================================= */}
      <div className="bg-white border border-secondary-200/80 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-center justify-around gap-4 text-xs font-bold text-secondary-600">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-primary-600 shrink-0" />
          <span>Estimation automatique des impôts</span>
        </div>
        <div className="hidden md:block text-secondary-300">|</div>
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary-600 shrink-0" />
          <span>Export comptable prêt pour votre comptable</span>
        </div>
        <div className="hidden md:block text-secondary-300">|</div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary-600 shrink-0" />
          <span>Données sécurisées et conformes au Canada</span>
        </div>
      </div>

    </div>
  );
}

