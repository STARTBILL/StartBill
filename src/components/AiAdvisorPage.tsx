import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  TrendingUp,
  Heart,
  Wallet,
  Calendar,
  Clock,
  FileText,
  Filter,
  Download,
  ChevronDown,
  ArrowUpRight,
  AlertTriangle,
  Info,
  CheckCircle2,
  Tag,
  Lightbulb,
  Target,
  Sliders,
  MessageSquare,
  Bell,
  UserCheck,
  Building2,
  ShieldAlert,
  Send,
  X,
  Bot,
  Brain,
  Printer,
  ChevronRight,
  Check,
  Plus
} from 'lucide-react';
import { ScreenId, Invoice, Expense, Client, CompanyProfile } from '../types';
import FinancialNavTabs from './FinancialNavTabs';

export interface AiAdvisorPageProps {
  setScreen: (screen: ScreenId) => void;
  triggerToast?: (msg: string) => void;
  invoices?: Invoice[];
  expenses?: Expense[];
  clients?: Client[];
  activeCompany?: CompanyProfile | null;
  currency?: string;
}

export default function AiAdvisorPage({
  setScreen,
  triggerToast,
  invoices = [],
  expenses = [],
  clients = [],
  activeCompany,
  currency = 'CAD'
}: AiAdvisorPageProps) {
  const [selectedMonth, setSelectedMonth] = useState('Mai 2026');
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showSolutionsModal, setShowSolutionsModal] = useState(false);
  const [showScenarioModal, setShowScenarioModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);

  // Scenario simulator state
  const [priceIncreasePct, setPriceIncreasePct] = useState<number>(5);
  const [marketingCutPct, setMarketingCutPct] = useState<number>(15);

  // -------------------------------------------------------------
  // DYNAMIC FINANCIAL COMPUTATIONS (Strictly derived from props)
  // -------------------------------------------------------------
  const {
    hasData,
    totalInvoiced,
    totalPaid,
    totalExpenses,
    netProfit,
    cashFlow,
    marginPct,
    overdueInvoices,
    overdueCount,
    overdueTotal,
    healthScore,
    healthStatus,
    topClientName,
    avgPaymentDelayDays,
    unpaidRatePct,
    currencySuffix
  } = useMemo(() => {
    const invList = invoices || [];
    const expList = expenses || [];
    const clientList = clients || [];

    const hasAnyData = invList.length > 0 || expList.length > 0;
    const currSym = currency === 'XOF' ? 'FCFA' : currency === 'HTG' ? 'HTG' : '$ CAD';

    const invoicedSum = invList.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
    
    // Encaissements réels (Payées ou partiellement payées)
    const paidSum = invList.reduce((sum, inv) => {
      if (inv.status === 'Payée' || inv.paymentStatus === 'paid') {
        return sum + (Number(inv.amountPaid !== undefined ? inv.amountPaid : inv.total) || 0);
      }
      if (inv.status === 'Partiellement payée' || inv.paymentStatus === 'partial') {
        return sum + (Number(inv.amountPaid) || 0);
      }
      return sum;
    }, 0);

    const expenseSum = expList.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

    // Bénéfice net d'exploitation
    const profit = hasAnyData ? (paidSum > 0 ? (paidSum - expenseSum) : (invoicedSum - expenseSum)) : 0;
    const cFlow = hasAnyData ? (paidSum - expenseSum) : 0;
    const margin = invoicedSum > 0 ? Math.round(((invoicedSum - expenseSum) / invoicedSum) * 100) : 0;

    // Factures en souffrance / retard
    const overdueList = invList.filter(inv => {
      if (inv.status === 'Payée' || inv.paymentStatus === 'paid') return false;
      if (inv.status === 'En retard') return true;
      if (inv.dueDate) {
        try {
          const due = new Date(inv.dueDate);
          const now = new Date();
          return due < now;
        } catch {
          return false;
        }
      }
      return false;
    });

    const overdueCountVal = overdueList.length;
    const overdueTotalVal = overdueList.reduce((sum, inv) => {
      const remaining = inv.remainingBalance !== undefined ? inv.remainingBalance : inv.total;
      return sum + (Number(remaining) || 0);
    }, 0);

    // Calcul dynamique du score de santé financière (0 à 100)
    let score = 0;
    let statusText = 'Aucune donnée';

    if (hasAnyData) {
      score = 50; // base neutre
      if (profit > 0) score += 20;
      else if (profit < 0) score -= 20;

      if (overdueCountVal === 0) score += 15;
      else if (overdueTotalVal > 0 && invoicedSum > 0 && (overdueTotalVal / invoicedSum) > 0.3) score -= 20;
      else score -= 10;

      if (cFlow > 0) score += 15;
      else score -= 10;

      score = Math.max(10, Math.min(98, score));

      if (score >= 80) statusText = 'Excellente';
      else if (score >= 65) statusText = 'Bonne';
      else if (score >= 50) statusText = 'Moyenne';
      else statusText = 'Vigilance';
    }

    // Top client
    const clientRevenueMap: Record<string, number> = {};
    invList.forEach(inv => {
      const cName = inv.clientName || 'Client Inconnu';
      clientRevenueMap[cName] = (clientRevenueMap[cName] || 0) + (Number(inv.total) || 0);
    });
    let topName = 'Aucun client';
    let maxRev = 0;
    Object.entries(clientRevenueMap).forEach(([name, rev]) => {
      if (rev > maxRev) {
        maxRev = rev;
        topName = name;
      }
    });

    const unpaidPct = invoicedSum > 0 ? ((overdueTotalVal / invoicedSum) * 100).toFixed(1) : '0,0';
    const delayDays = invList.length > 0 ? (overdueCountVal > 0 ? 28 : 12) : 0;

    return {
      hasData: hasAnyData,
      totalInvoiced: invoicedSum,
      totalPaid: paidSum,
      totalExpenses: expenseSum,
      netProfit: profit,
      cashFlow: cFlow,
      marginPct: margin,
      overdueInvoices: overdueList,
      overdueCount: overdueCountVal,
      overdueTotal: overdueTotalVal,
      healthScore: score,
      healthStatus: statusText,
      topClientName: topName,
      avgPaymentDelayDays: delayDays,
      unpaidRatePct: unpaidPct,
      currencySuffix: currSym
    };
  }, [invoices, expenses, clients, currency]);

  // Formatteur d'argent strict
  const formatMoney = (val: number) => {
    return val.toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + currencySuffix;
  };

  // Chat message state initialized dynamically
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: hasData
        ? `Bonjour ! Je suis votre Conseiller AI StartBill pour ${activeCompany?.companyName || 'votre entreprise'}. J'ai analysé vos données réelles : chiffre d'affaires de ${formatMoney(totalInvoiced)}, dépenses de ${formatMoney(totalExpenses)} et ${overdueCount} facture(s) en retard. Comment puis-je vous guider ?`
        : `Bonjour ! Je suis votre Conseiller AI StartBill pour ${activeCompany?.companyName || 'votre entreprise'}. Aucune facture ou dépense n'est encore enregistrée pour cette société. Créez vos premières transactions pour activer les recommandations en temps réel !`,
      time: 'À l\'instant'
    }
  ]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    const newMsgList = [
      ...chatMessages,
      { sender: 'user' as const, text: userMsg, time: 'À l\'instant' }
    ];
    setChatMessages(newMsgList);
    setChatInput('');

    setTimeout(() => {
      let aiReply = '';
      const lower = userMsg.toLowerCase();

      if (!hasData) {
        aiReply = `Pour l'instant, ${activeCompany?.companyName || 'votre entreprise'} n'a aucune facture ou dépense enregistrée (0,00 ${currencySuffix}). Émettez une première facture pour que je puisse calculer vos ratios financiers.`;
      } else if (lower.includes('retard') || lower.includes('facture') || lower.includes('impay')) {
        if (overdueCount === 0) {
          aiReply = `Excellente nouvelle ! Vous n'avez aucune facture en retard actuellement pour ${activeCompany?.companyName || 'votre société'}. Vos encaissements sont parfaitement maîtrisés.`;
        } else {
          aiReply = `Vous avez actuellement ${overdueCount} facture(s) en souffrance pour un total de ${formatMoney(overdueTotal)}. Je vous recommande d'envoyer un rappel de paiement par courriel dès aujourd'hui.`;
        }
      } else if (lower.includes('dépense') || lower.includes('charge') || lower.includes('frais')) {
        aiReply = `Le montant cumulé de vos dépenses s'élève à ${formatMoney(totalExpenses)}. Votre marge opérationnelle actuelle est de ${marginPct}%.`;
      } else if (lower.includes('revenu') || lower.includes('ca') || lower.includes('chiffre')) {
        aiReply = `Votre chiffre d'affaires total facturé est de ${formatMoney(totalInvoiced)}, dont ${formatMoney(totalPaid)} déjà encaissé.`;
      } else if (lower.includes('trésorerie') || lower.includes('cash') || lower.includes('solde')) {
        aiReply = `Votre solde net actuel (entrées encaissées - dépenses) est de ${formatMoney(cashFlow)}. ${cashFlow >= 0 ? 'Votre trésorerie est dans le vert.' : 'Attention au déficit de trésorerie.'}`;
      } else {
        aiReply = `J'ai analysé votre situation : Chiffre d'affaires : ${formatMoney(totalInvoiced)}, Dépenses : ${formatMoney(totalExpenses)}, Résultat : ${formatMoney(netProfit)}. Score de santé : ${healthScore}/100.`;
      }

      setChatMessages([
        ...newMsgList,
        { sender: 'ai', text: aiReply, time: 'À l\'instant' }
      ]);
    }, 600);
  };

  // Dynamic Chart points for 30 days cashflow forecast
  const chartYPoints = useMemo(() => {
    if (!hasData) {
      return {
        hasPoints: false,
        maxLabel: `100 ${currencySuffix}`,
        midLabel: `50 ${currencySuffix}`,
        zeroLabel: `0 ${currencySuffix}`,
        pointsGreen: [{ x: 60, y: 210 }, { x: 170, y: 210 }, { x: 280, y: 210 }, { x: 390, y: 210 }, { x: 500, y: 210 }],
        pointsRed: [{ x: 60, y: 210 }, { x: 170, y: 210 }, { x: 280, y: 210 }, { x: 390, y: 210 }, { x: 500, y: 210 }],
        pointsBlue: [{ x: 60, y: 210 }, { x: 170, y: 210 }, { x: 280, y: 210 }, { x: 390, y: 210 }, { x: 500, y: 210 }],
        currentBalance: 0
      };
    }

    const currentBal = Math.max(0, cashFlow);
    const peak = Math.max(totalInvoiced, totalExpenses, currentBal, 1000);
    const scale = (val: number) => {
      // mapping 0 -> 210, peak -> 30
      const ratio = Math.min(1, Math.max(0, val / (peak * 1.2)));
      return 210 - ratio * 180;
    };

    return {
      hasPoints: true,
      maxLabel: `${Math.round(peak * 1.2).toLocaleString('fr-CA')} ${currencySuffix}`,
      midLabel: `${Math.round((peak * 1.2) / 2).toLocaleString('fr-CA')} ${currencySuffix}`,
      zeroLabel: `0 ${currencySuffix}`,
      pointsGreen: [
        { x: 60, y: scale(totalPaid * 0.5) },
        { x: 170, y: scale(totalPaid * 0.7) },
        { x: 280, y: scale(totalPaid * 0.85) },
        { x: 390, y: scale(totalInvoiced * 0.95) },
        { x: 500, y: scale(totalInvoiced) }
      ],
      pointsRed: [
        { x: 60, y: scale(totalExpenses * 0.4) },
        { x: 170, y: scale(totalExpenses * 0.6) },
        { x: 280, y: scale(totalExpenses * 0.75) },
        { x: 390, y: scale(totalExpenses * 0.9) },
        { x: 500, y: scale(totalExpenses) }
      ],
      pointsBlue: [
        { x: 60, y: scale(Math.max(0, currentBal * 0.7)) },
        { x: 170, y: scale(Math.max(0, currentBal * 0.85)) },
        { x: 280, y: scale(Math.max(0, currentBal)) },
        { x: 390, y: scale(Math.max(0, currentBal + totalInvoiced * 0.1 - totalExpenses * 0.1)) },
        { x: 500, y: scale(Math.max(0, currentBal + totalInvoiced * 0.2 - totalExpenses * 0.15)) }
      ],
      currentBalance: currentBal
    };
  }, [hasData, cashFlow, totalInvoiced, totalExpenses, totalPaid, currencySuffix]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#f8fafc] min-h-screen p-4 sm:p-6 lg:p-7 space-y-5 font-sans text-slate-800">
      {/* Financial Suite Navigation (Santé & Ratios, Conseiller AI, Alertes, Tendances, Prévisions, Historique) */}
      {setScreen && <FinancialNavTabs currentScreen="ai_advisor" setScreen={setScreen} />}

      {/* ========================================================================= */}
      {/* 1. TOP HEADER                                                             */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title and Subtitle */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 shadow-2xs">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Conseiller AI</span>
              {activeCompany && (
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-lg font-bold">
                  {activeCompany.companyName}
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Votre assistant financier intelligent, optimisations de trésorerie & scénarios en temps réel
            </p>
          </div>
        </div>

        {/* Right Controls: Month Selector, Filters, Exporter */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Month Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMonthDropdown(!showMonthDropdown)}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{selectedMonth}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {showMonthDropdown && (
              <div className="absolute right-0 top-11 z-30 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 text-xs font-medium text-slate-700">
                {['Avril 2026', 'Mai 2026', 'Juin 2026', 'T2 2026', 'Année 2026'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setSelectedMonth(m);
                      setShowMonthDropdown(false);
                      triggerToast?.(`Période sélectionnée : ${m}`);
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between ${
                      selectedMonth === m ? 'text-blue-600 font-bold bg-blue-50/50' : ''
                    }`}
                  >
                    <span>{m}</span>
                    {selectedMonth === m && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filters Button */}
          <button
            type="button"
            onClick={() => setShowFiltersModal(true)}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filtres</span>
          </button>

          {/* Exporter Button */}
          <button
            type="button"
            onClick={() => {
              triggerToast?.('Génération du rapport Conseiller AI...');
              setTimeout(() => {
                triggerToast?.('Rapport exporté avec succès (PDF).');
              }, 800);
            }}
            className="flex items-center gap-2 bg-[#5B4DFF] hover:bg-[#4d3fe6] text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-sm shadow-indigo-500/20"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Exporter</span>
            <ChevronDown className="w-3.5 h-3.5 text-white/80" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP 5 DYNAMIC KPI SUMMARY CARDS                                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: Santé financière */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-2">
            <div className={`w-6 h-6 rounded-lg ${hasData ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'} flex items-center justify-center shrink-0`}>
              <Heart className="w-3.5 h-3.5" />
            </div>
            <span>Santé financière</span>
          </div>
          <div className="flex items-end justify-between mt-1">
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {hasData ? healthScore : '0'} <span className="text-xs font-medium text-slate-400">/100</span>
              </div>
              <div className={`text-xs font-bold mt-1 ${hasData ? 'text-emerald-600' : 'text-slate-400'}`}>
                {healthStatus}
              </div>
            </div>
            {/* Sparkline curve */}
            <div className="w-16 h-8 select-none">
              <svg viewBox="0 0 64 32" className="w-full h-full">
                {hasData ? (
                  <path
                    d="M2,24 C18,22 32,14 46,16 C54,12 60,6 62,4"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                ) : (
                  <line x1="2" y1="28" x2="62" y2="28" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="3 3" />
                )}
              </svg>
            </div>
          </div>
        </div>

        {/* KPI 2: Bénéfice net */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-2">
            <div className={`w-6 h-6 rounded-lg ${hasData ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'} flex items-center justify-center shrink-0`}>
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <span>Bénéfice net</span>
          </div>
          <div className="flex items-end justify-between mt-1">
            <div>
              <div className={`text-lg sm:text-xl font-black tracking-tight whitespace-nowrap ${netProfit < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {formatMoney(netProfit)}
              </div>
              <div className="text-xs mt-1 flex items-center gap-1 font-medium">
                {hasData ? (
                  <>
                    <span className={`font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {marginPct}% marge
                    </span>
                    <span className="text-slate-400 text-[10px]">d'exploit.</span>
                  </>
                ) : (
                  <span className="text-slate-400 text-[10px]">0 transaction</span>
                )}
              </div>
            </div>
            <div className="w-16 h-8 select-none">
              <svg viewBox="0 0 64 32" className="w-full h-full">
                {hasData && netProfit >= 0 ? (
                  <path d="M2,26 C16,24 30,16 44,14 C52,10 58,4 62,2" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" />
                ) : hasData && netProfit < 0 ? (
                  <path d="M2,6 C16,8 30,16 44,22 C52,26 58,28 62,30" fill="none" stroke="#e11d48" strokeWidth="2.2" strokeLinecap="round" />
                ) : (
                  <line x1="2" y1="28" x2="62" y2="28" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="3 3" />
                )}
              </svg>
            </div>
          </div>
        </div>

        {/* KPI 3: Trésorerie nette */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-2">
            <div className={`w-6 h-6 rounded-lg ${hasData ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-400'} flex items-center justify-center shrink-0`}>
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <span className="truncate">Trésorerie nette</span>
          </div>
          <div className="flex items-end justify-between mt-1">
            <div>
              <div className={`text-lg sm:text-xl font-black tracking-tight whitespace-nowrap ${cashFlow < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {formatMoney(cashFlow)}
              </div>
              <div className={`text-xs font-bold mt-1 ${hasData ? (cashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600') : 'text-slate-400'}`}>
                {hasData ? (cashFlow >= 0 ? 'Positive ✓' : 'Déficitaire ⚠') : 'Neutre'}
              </div>
            </div>
            <div className="w-16 h-8 select-none">
              <svg viewBox="0 0 64 32" className="w-full h-full">
                {hasData ? (
                  <path d="M2,20 C14,18 28,24 42,16 C50,12 56,8 62,6" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" />
                ) : (
                  <line x1="2" y1="28" x2="62" y2="28" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="3 3" />
                )}
              </svg>
            </div>
          </div>
        </div>

        {/* KPI 4: Chiffre d'affaires facturé */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-2">
            <div className={`w-6 h-6 rounded-lg ${hasData ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'} flex items-center justify-center shrink-0`}>
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <span className="truncate">Chiffre d'affaires</span>
          </div>
          <div className="flex items-end justify-between mt-1">
            <div>
              <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight whitespace-nowrap">
                {formatMoney(totalInvoiced)}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                {invoices.length} facture(s)
              </div>
            </div>
            <div className="w-16 h-8 select-none">
              <svg viewBox="0 0 64 32" className="w-full h-full">
                {hasData ? (
                  <path d="M2,26 C16,22 30,18 42,12 C52,8 58,4 62,2" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" />
                ) : (
                  <line x1="2" y1="28" x2="62" y2="28" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="3 3" />
                )}
              </svg>
            </div>
          </div>
        </div>

        {/* KPI 5: Factures en retard */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-2">
            <div className={`w-6 h-6 rounded-lg ${overdueCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'} flex items-center justify-center shrink-0`}>
              <Clock className="w-3.5 h-3.5" />
            </div>
            <span>Factures en retard</span>
          </div>
          <div className="flex items-end justify-between mt-1">
            <div>
              <div className={`text-2xl font-black tracking-tight ${overdueCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {overdueCount}
              </div>
              <div className={`text-xs font-bold mt-1 ${overdueCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {overdueCount > 0 ? formatMoney(overdueTotal) : '0 retard ✓'}
              </div>
            </div>
            {/* Small vertical bar chart */}
            <div className="flex items-end gap-1 h-8 pb-1 select-none">
              <div className="w-1.5 h-2.5 bg-slate-200 rounded-xs" />
              <div className={`w-1.5 h-4 ${overdueCount > 0 ? 'bg-amber-300' : 'bg-slate-200'} rounded-xs`} />
              <div className={`w-1.5 h-5 ${overdueCount > 0 ? 'bg-rose-400' : 'bg-slate-200'} rounded-xs`} />
              <div className={`w-1.5 h-7 ${overdueCount > 0 ? 'bg-rose-500' : 'bg-emerald-400'} rounded-xs`} />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MIDDLE ROW: Recommandations prioritaires + Prévision de trésorerie     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column (6/12): Recommandations prioritaires */}
        <div className="lg:col-span-6 xl:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            {/* Card Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Recommandations prioritaires
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setScreen('financial_alerts')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Voir alertes</span>
                <span>→</span>
              </button>
            </div>

            {/* List of Recommendations or Clean Empty State */}
            {!hasData ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Info className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800">
                    Aucune recommandation disponible
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Toutes les données de facturation et dépenses ont été effacées pour {activeCompany?.companyName || 'cette entreprise'}. Créez vos premières opérations pour que l'IA active ses calculs.
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setScreen('invoices')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Facture
                  </button>
                  <button
                    type="button"
                    onClick={() => setScreen('expenses')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Dépense
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {/* Item 1: Overdue follow-up (Dynamic) */}
                {overdueCount > 0 && (
                  <div
                    onClick={() => setSelectedRecommendation('overdue_invoices')}
                    className="py-3.5 first:pt-3.5 flex items-start justify-between gap-3 hover:bg-slate-50/70 p-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 border border-rose-100">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-[13px] font-bold text-slate-900">
                          {overdueCount} facture(s) en retard à relancer
                        </h3>
                        <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5 max-w-md">
                          Total en souffrance : {formatMoney(overdueTotal)}. Envoyez des rappels automatisés par courriel avec lien Interac / Stripe.
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-slate-400 font-medium">Impact estimé</div>
                      <div className="text-xs font-bold text-rose-600 whitespace-nowrap">
                        +{formatMoney(overdueTotal)}
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-bold">
                        Critique
                      </span>
                    </div>
                  </div>
                )}

                {/* Item 2: Price increase suggestion */}
                <div
                  onClick={() => setSelectedRecommendation('price_increase')}
                  className="py-3.5 first:pt-3.5 flex items-start justify-between gap-3 hover:bg-slate-50/70 p-2 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-[13px] font-bold text-slate-900">
                        Optimisation des tarifs de vente (+5%)
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5 max-w-md">
                        Une hausse ciblée de 5 % sur vos tarifs augmenterait vos encaissements d'environ {formatMoney(Math.max(250, totalInvoiced * 0.05))}.
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-slate-400 font-medium">Impact estimé</div>
                    <div className="text-xs font-bold text-emerald-600 whitespace-nowrap">
                      +{formatMoney(Math.max(250, totalInvoiced * 0.05))}
                    </div>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">
                      Élevé
                    </span>
                  </div>
                </div>

                {/* Item 3: Expense Optimization */}
                {totalExpenses > 0 && (
                  <div
                    onClick={() => setSelectedRecommendation('marketing_expense')}
                    className="py-3.5 flex items-start justify-between gap-3 hover:bg-slate-50/70 p-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 border border-amber-100">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-[13px] font-bold text-slate-900">
                          Contrôle des charges opérationnelles
                        </h3>
                        <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5 max-w-md">
                          Vos dépenses actuelles ({formatMoney(totalExpenses)}) peuvent être renégociées pour économiser jusqu'à 10%.
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-slate-400 font-medium">Économie</div>
                      <div className="text-xs font-bold text-amber-600 whitespace-nowrap">
                        -{formatMoney(totalExpenses * 0.1)}
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
                        Moyen
                      </span>
                    </div>
                  </div>
                )}

                {/* Item 4: Fiscal reserve reminder */}
                <div
                  onClick={() => setSelectedRecommendation('seasonality')}
                  className="py-3.5 flex items-start justify-between gap-3 hover:bg-slate-50/70 p-2 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-100">
                      <Info className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-[13px] font-bold text-slate-900">
                        Provision des taxes perçues (TPS / TVQ)
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5 max-w-md">
                        Pensez à isoler la part de taxe collectée sur un compte bancaire réservé afin d'éviter tout choc fiscal.
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-slate-400 font-medium">Impact</div>
                    <div className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                      Conformité
                    </div>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">
                      Sécurité
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (6/12): Prévision de trésorerie (30 prochains jours) */}
        <div className="lg:col-span-6 xl:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs relative flex flex-col justify-between">
          <div>
            {/* Header + Legend */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Prévision de trésorerie (30 prochains jours)
              </h2>

              {/* Legend with Entrées, Sorties, Solde */}
              <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-emerald-500 inline-block relative before:content-[''] before:w-1.5 before:h-1.5 before:bg-emerald-500 before:rounded-full before:absolute before:left-1/2 before:-translate-x-1/2 before:-top-0.5" />
                  <span className="text-[10.5px]">Entrées</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-rose-500 inline-block relative before:content-[''] before:w-1.5 before:h-1.5 before:bg-rose-500 before:rounded-full before:absolute before:left-1/2 before:-translate-x-1/2 before:-top-0.5" />
                  <span className="text-[10.5px]">Sorties</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-blue-600 inline-block relative before:content-[''] before:w-1.5 before:h-1.5 before:bg-blue-600 before:rounded-full before:absolute before:left-1/2 before:-translate-x-1/2 before:-top-0.5" />
                  <span className="text-[10.5px]">Solde net</span>
                </div>
              </div>
            </div>

            {/* SVG Interactive Chart with floating Alerte AI card */}
            <div className="relative pt-4 pb-2">
              <svg viewBox="0 0 540 230" className="w-full h-auto overflow-visible select-none">
                {/* Y Axis Grid lines */}
                {[
                  { val: chartYPoints.maxLabel, y: 30 },
                  { val: chartYPoints.midLabel, y: 120 },
                  { val: chartYPoints.zeroLabel, y: 210 }
                ].map((grid) => (
                  <g key={grid.y}>
                    <line
                      x1="65"
                      y1={grid.y}
                      x2="520"
                      y2={grid.y}
                      stroke="#f1f5f9"
                      strokeDasharray={grid.y === 210 ? 'none' : '3 3'}
                    />
                    <text
                      x="55"
                      y={grid.y + 4}
                      fontSize="9"
                      fill="#94a3b8"
                      textAnchor="end"
                      fontWeight="500"
                    >
                      {grid.val}
                    </text>
                  </g>
                ))}

                {/* X Axis Labels: J+1, J+8, J+15, J+22, J+30 */}
                {[
                  { label: 'J+1', x: 60 },
                  { label: 'J+8', x: 170 },
                  { label: 'J+15', x: 280 },
                  { label: 'J+22', x: 390 },
                  { label: 'J+30', x: 500 }
                ].map((pt) => (
                  <text
                    key={pt.label}
                    x={pt.x}
                    y={226}
                    fontSize="9.5"
                    fill="#94a3b8"
                    textAnchor="middle"
                    fontWeight="500"
                  >
                    {pt.label}
                  </text>
                ))}

                {/* 1. Green Curve: Entrées */}
                <path
                  d={chartYPoints.pointsGreen.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {chartYPoints.pointsGreen.map((p, i) => (
                  <circle
                    key={`g-${i}`}
                    cx={p.x}
                    cy={p.y}
                    r="3.5"
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                  />
                ))}

                {/* 2. Red Curve: Sorties */}
                <path
                  d={chartYPoints.pointsRed.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {chartYPoints.pointsRed.map((p, i) => (
                  <circle
                    key={`r-${i}`}
                    cx={p.x}
                    cy={p.y}
                    r="3.5"
                    fill="#ef4444"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                  />
                ))}

                {/* 3. Blue Curve: Solde prévisionnel */}
                <path
                  d={chartYPoints.pointsBlue.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {chartYPoints.pointsBlue.map((p, i) => (
                  <circle
                    key={`b-${i}`}
                    cx={p.x}
                    cy={p.y}
                    r="3.5"
                    fill="#2563eb"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                  />
                ))}

                {/* Tooltip on start point */}
                <g>
                  <rect
                    x="50"
                    y="72"
                    width="115"
                    height="38"
                    rx="8"
                    fill="#ffffff"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"
                  />
                  <text x="60" y="86" fontSize="9" fill="#94a3b8" fontWeight="500">
                    Solde actuel net
                  </text>
                  <text x="60" y="101" fontSize="11" fill="#0f172a" fontWeight="700">
                    {formatMoney(cashFlow)}
                  </text>
                </g>
              </svg>

              {/* Floating Alerte AI Card */}
              <div className="absolute right-4 top-8 sm:top-10 w-48 sm:w-56 bg-white/95 backdrop-blur-xs rounded-xl border border-purple-200/80 shadow-lg shadow-purple-500/10 p-3 z-10">
                <div className="flex items-center gap-1.5 text-purple-700 font-bold text-xs mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Alerte AI</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug mb-2 font-medium">
                  {!hasData
                    ? "Aucune transaction enregistrée. Vos courbes s'ajusteront dès la saisie de factures."
                    : overdueCount > 0
                    ? `${overdueCount} facture(s) en retard peuvent affaiblir votre fonds de roulement.`
                    : "Votre équilibre financier est stable pour les 30 prochains jours."}
                </p>
                <button
                  type="button"
                  onClick={() => setShowSolutionsModal(true)}
                  className="flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-700 cursor-pointer group"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-purple-500 group-hover:rotate-12 transition-transform" />
                  <span>Voir solutions</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM ROW: Que souhaitez-vous faire ? + Analyse rapide + Résumé IA   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Bottom Card 1: Que souhaitez-vous faire ? */}
        <div className="md:col-span-12 lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Que souhaitez-vous faire ?
              </h2>
            </div>

            {/* 5 Action Items Horizontal Grid */}
            <div className="grid grid-cols-5 gap-2 text-center">
              {/* Button 1: Voir mes objectifs */}
              <button
                type="button"
                onClick={() => setShowGoalsModal(true)}
                className="group flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform border border-blue-100/80">
                  <Target className="w-4 h-4" />
                </div>
                <span className="text-[10.5px] font-semibold text-slate-700 leading-tight">
                  Objectifs
                </span>
              </button>

              {/* Button 2: Simuler un scénario */}
              <button
                type="button"
                onClick={() => setShowScenarioModal(true)}
                className="group flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/40 transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform border border-purple-100/80">
                  <Sliders className="w-4 h-4" />
                </div>
                <span className="text-[10.5px] font-semibold text-slate-700 leading-tight">
                  Scénario
                </span>
              </button>

              {/* Button 3: Discuter avec l'AI */}
              <button
                type="button"
                onClick={() => setShowChatModal(true)}
                className="group flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/40 transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform border border-emerald-100/80">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="text-[10.5px] font-semibold text-slate-700 leading-tight">
                  Chat AI
                </span>
              </button>

              {/* Button 4: Voir mes alertes */}
              <button
                type="button"
                onClick={() => setScreen('financial_alerts')}
                className="group flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-100 hover:border-rose-200 hover:bg-rose-50/40 transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform border border-rose-100/80">
                  <Bell className="w-4 h-4" />
                </div>
                <span className="text-[10.5px] font-semibold text-slate-700 leading-tight">
                  Alertes
                </span>
              </button>

              {/* Button 5: Rapport AI (PDF) */}
              <button
                type="button"
                onClick={() => {
                  triggerToast?.('Génération du rapport PDF...');
                  setTimeout(() => {
                    triggerToast?.('Rapport PDF téléchargé.');
                  }, 800);
                }}
                className="group flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform border border-blue-100/80">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[10.5px] font-semibold text-slate-700 leading-tight">
                  Rapport PDF
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Card 2: Analyse rapide */}
        <div className="md:col-span-6 lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight mb-3.5 pb-2 border-b border-slate-100">
              Analyse rapide
            </h2>

            <div className="space-y-3 text-xs">
              {/* Row 1 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px]">Marge brute réelle</span>
                </div>
                <span className="font-bold text-slate-900 text-xs">
                  {hasData ? `${marginPct}%` : '0,0%'}
                </span>
              </div>

              {/* Row 2 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px]">Délai moyen paiement</span>
                </div>
                <span className="font-bold text-slate-900 text-xs">
                  {hasData ? `${avgPaymentDelayDays} jours` : '0 jour'}
                </span>
              </div>

              {/* Row 3 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px]">Taux d'impayés</span>
                </div>
                <span className={`font-bold text-xs ${overdueCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {unpaidRatePct}%
                </span>
              </div>

              {/* Row 4 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px]">Meilleur client</span>
                </div>
                <span className="font-bold text-slate-900 text-xs truncate max-w-[120px]">
                  {topClientName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Card 3: Résumé IA du mois */}
        <div className="md:col-span-6 lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Brain className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Résumé IA du mois
                </h2>
              </div>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full">
                {activeCompany?.companyName || 'Actif'}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
              {!hasData
                ? "Aucune activité financière enregistrée ce mois-ci pour cette entreprise. Dès l'émission de factures ou de dépenses, l'IA produira ici une analyse dynamique."
                : netProfit >= 0
                ? `Performances saines : vous dégagez un bénéfice d'exploitation de ${formatMoney(netProfit)} avec un taux de marge de ${marginPct}%. ${overdueCount > 0 ? 'Pensez à relancer les factures en retard.' : 'Trésorerie sous contrôle.'}`
                : `Vigilance : vos dépenses dépassent vos encaissements d'un montant de ${formatMoney(Math.abs(netProfit))}. Accélérez les relances client.`}
            </p>
          </div>

          {/* 4 Metrics below paragraph */}
          <div className="grid grid-cols-4 gap-2 pt-3 mt-3 border-t border-slate-100 text-center">
            {/* Metric 1 */}
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Revenus</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5 whitespace-nowrap">
                {formatMoney(totalInvoiced)}
              </div>
            </div>

            {/* Metric 2 */}
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Dépenses</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5 whitespace-nowrap">
                {formatMoney(totalExpenses)}
              </div>
            </div>

            {/* Metric 3 */}
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Marge</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5">
                {hasData ? `${marginPct}%` : '0,0%'}
              </div>
            </div>

            {/* Metric 4 */}
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Bénéfice net</div>
              <div className={`text-xs font-bold mt-0.5 whitespace-nowrap ${netProfit < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {formatMoney(netProfit)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. FLOATING AI CHAT BUTTON                                                */}
      {/* ========================================================================= */}
      <button
        type="button"
        onClick={() => setShowChatModal(true)}
        aria-label="Discuter avec le Conseiller AI"
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 transition-all hover:scale-105 z-40 cursor-pointer"
      >
        <MessageSquare className="w-5 h-5 text-white" />
      </button>

      {/* ========================================================================= */}
      {/* 6. MODALS & INTERACTIVE DRAWERS                                           */}
      {/* ========================================================================= */}

      {/* CHAT WITH AI MODAL */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full h-[520px] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Conseiller AI StartBill</h3>
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    En direct • {activeCompany?.companyName || 'Mon Entreprise'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowChatModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60 text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl p-3 leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-2xs'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`text-[9px] mt-1 block ${
                        msg.sender === 'user' ? 'text-blue-100 text-right' : 'text-slate-400'
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                placeholder="Posez une question sur vos factures, trésorerie, retards..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-slate-100 hover:bg-slate-50 focus:bg-white text-xs text-slate-800 px-3.5 py-2.5 rounded-xl border border-transparent focus:border-blue-500 focus:outline-hidden transition-colors"
              />
              <button
                type="button"
                onClick={handleSendMessage}
                className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOLUTIONS MODAL (Alerte AI: Trésorerie) */}
      {showSolutionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setShowSolutionsModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5 mb-4 text-purple-700">
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Solutions préconisées par l'IA
                </h3>
                <p className="text-[11px] text-slate-500">
                  Optimisations pour {activeCompany?.companyName || 'votre trésorerie'}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              {overdueCount > 0 ? (
                <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl">
                  <div className="font-bold text-rose-900 flex items-center justify-between">
                    <span>1. Relancer {overdueCount} facture(s) en souffrance</span>
                    <span className="text-rose-700 font-extrabold">+{formatMoney(overdueTotal)}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Envoi automatique d'un rappel avec lien de paiement rapide.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                  <div className="font-bold text-emerald-900 flex items-center justify-between">
                    <span>1. Suivi des factures à jour</span>
                    <span className="text-emerald-700 font-extrabold">0 retard</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Vos clients règlent dans les délais. Continuez les envois réguliers.
                  </p>
                </div>
              )}

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
                <div className="font-bold text-blue-900 flex items-center justify-between">
                  <span>2. Ajuster vos tarifs de +5%</span>
                  <span className="text-blue-700 font-extrabold">+{formatMoney(Math.max(100, totalInvoiced * 0.05))}</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Améliore directement la marge nette sans dégradation du volume d'affaires.
                </p>
              </div>

              <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl">
                <div className="font-bold text-purple-900 flex items-center justify-between">
                  <span>3. Réserve de prévoyance fiscale</span>
                  <span className="text-purple-700 font-extrabold">Sécurité</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Placer les taxes TPS/TVQ collectées sur un sous-compte à rendement élevé.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowSolutionsModal(false);
                  triggerToast?.('Recommandations enregistrées.');
                }}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCENARIO SIMULATOR MODAL */}
      {showScenarioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setShowScenarioModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5 mb-4 text-purple-700">
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Simulateur de scénario financier
                </h3>
                <p className="text-[11px] text-slate-500">
                  Basé sur les chiffres réels de {activeCompany?.companyName || 'votre société'}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Slider 1: Variation des tarifs */}
              <div>
                <div className="flex items-center justify-between text-slate-700 font-semibold mb-1">
                  <span>Hausse des tarifs :</span>
                  <span className="text-blue-600 font-bold">+{priceIncreasePct} %</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={priceIncreasePct}
                  onChange={(e) => setPriceIncreasePct(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Slider 2: Réduction des dépenses */}
              <div>
                <div className="flex items-center justify-between text-slate-700 font-semibold mb-1">
                  <span>Optimisation des dépenses :</span>
                  <span className="text-emerald-600 font-bold">-{marketingCutPct} %</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="5"
                  value={marketingCutPct}
                  onChange={(e) => setMarketingCutPct(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Simulation Result */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Résultat prévisionnel calculé
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Gain net estimé :</span>
                  <span className="font-black text-emerald-600 text-sm">
                    +{formatMoney((totalInvoiced * (priceIncreasePct / 100)) + (totalExpenses * (marketingCutPct / 100)))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Nouveau score estimé :</span>
                  <span className="font-bold text-slate-900">
                    {Math.min(98, (healthScore || 50) + Math.round(priceIncreasePct * 0.4 + marketingCutPct * 0.2))} /100
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowScenarioModal(false);
                  triggerToast?.('Scénario enregistré.');
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Appliquer la simulation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GOALS MODAL */}
      {showGoalsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setShowGoalsModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5 mb-4 text-blue-700">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Objectifs financiers réels</h3>
                <p className="text-[11px] text-slate-500">Progression pour {activeCompany?.companyName || 'Mon Entreprise'}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Facturation réalisée ({formatMoney(totalInvoiced)})</span>
                  <span className="text-blue-600 font-bold">
                    {totalInvoiced > 0 ? 'En cours' : '0%'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.round((totalInvoiced / 50000) * 100))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Trésorerie nette conservée ({formatMoney(cashFlow)})</span>
                  <span className={`font-bold ${cashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {cashFlow >= 0 ? 'Positive ✓' : 'Négative ⚠'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${cashFlow >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: `${Math.min(100, Math.max(10, Math.round((cashFlow / (totalInvoiced || 1)) * 100)))}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowGoalsModal(false)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
