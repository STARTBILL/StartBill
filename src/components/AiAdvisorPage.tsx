import React, { useState } from 'react';
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
  Check
} from 'lucide-react';
import { ScreenId } from '../types';

interface AiAdvisorPageProps {
  setScreen: (screen: ScreenId) => void;
  triggerToast?: (msg: string) => void;
}

export default function AiAdvisorPage({ setScreen, triggerToast }: AiAdvisorPageProps) {
  const [selectedMonth, setSelectedMonth] = useState('Mai 2026');
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showSolutionsModal, setShowSolutionsModal] = useState(false);
  const [showScenarioModal, setShowScenarioModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);

  // Chat message state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: "Bonjour ! Je suis votre Conseiller AI StartBill. J'ai analysé vos finances de mai 2026 : votre marge nette est excellente (63,1%) et vos revenus ont progressé de 18,2%. Comment puis-je vous aider aujourd'hui ?",
      time: '10:42'
    }
  ]);

  // Scenario simulator state
  const [priceIncreasePct, setPriceIncreasePct] = useState<number>(5);
  const [marketingCutPct, setMarketingCutPct] = useState<number>(15);

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
      let aiReply = "J'ai pris en compte votre demande. Vos flux de trésorerie actuels permettent d'envisager cette action sans risque sur votre fonds de roulement.";
      if (userMsg.toLowerCase().includes('prix') || userMsg.toLowerCase().includes('tarif')) {
        aiReply = "Une hausse de 5% sur vos forfaits clés générerait +1 250 $ de marge brute supplémentaire par mois avec une attrition estimée à moins de 0,8%.";
      } else if (userMsg.toLowerCase().includes('retard') || userMsg.toLowerCase().includes('facture')) {
        aiReply = "3 factures totalisant 2 450 $ sont en souffrance. Je vous recommande d'activer le rappel automatique SMS/Email dès aujourd'hui.";
      } else if (userMsg.toLowerCase().includes('impot') || userMsg.toLowerCase().includes('tps') || userMsg.toLowerCase().includes('taxe')) {
        aiReply = "Vos montants de TPS (5%) et TVQ (9,975%) sont correctement provisionnés sur votre compte dédié. Vous êtes parfaitement en règle.";
      }
      setChatMessages([
        ...newMsgList,
        { sender: 'ai', text: aiReply, time: 'À l\'instant' }
      ]);
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#f8fafc] min-h-screen p-4 sm:p-6 lg:p-7 space-y-5 font-sans text-slate-800">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER                                                             */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title and Subtitle */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Conseiller AI
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Votre assistant financier intelligent
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

          {/* Exporter Button (Purple/Indigo solid button matching screenshot) */}
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
      {/* 2. TOP 5 KPI SUMMARY CARDS                                                */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: Santé financière */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Heart className="w-3.5 h-3.5" />
            </div>
            <span>Santé financière</span>
          </div>
          <div className="flex items-end justify-between mt-1">
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                82 <span className="text-xs font-medium text-slate-400">/100</span>
              </div>
              <div className="text-xs font-bold text-emerald-600 mt-1">Bonne</div>
            </div>
            {/* Sparkline curve */}
            <div className="w-16 h-8 select-none">
              <svg viewBox="0 0 64 32" className="w-full h-full">
                <path
                  d="M2,24 C18,22 32,14 46,16 C54,12 60,6 62,4"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* KPI 2: Bénéfice net */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-2">
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <span>Bénéfice net</span>
          </div>
          <div className="flex items-end justify-between mt-1">
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight whitespace-nowrap">
                14 800,00 $
              </div>
              <div className="text-xs mt-1 flex items-center gap-1 font-medium">
                <span className="font-bold text-emerald-600">+24,6%</span>
                <span className="text-slate-400 text-[10px]">vs Avr. 2026</span>
              </div>
            </div>
            {/* Sparkline curve */}
            <div className="w-16 h-8 select-none">
              <svg viewBox="0 0 64 32" className="w-full h-full">
                <path
                  d="M2,26 C16,24 30,16 44,14 C52,10 58,4 62,2"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* KPI 3: Trésorerie prévue (30 jours) */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-2">
            <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <span className="truncate">Trésorerie prévue (30 j)</span>
          </div>
          <div className="flex items-end justify-between mt-1">
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight whitespace-nowrap">
                25 600,00 $
              </div>
              <div className="text-xs font-bold text-emerald-600 mt-1">Positive</div>
            </div>
            {/* Sparkline curve */}
            <div className="w-16 h-8 select-none">
              <svg viewBox="0 0 64 32" className="w-full h-full">
                <path
                  d="M2,20 C14,18 28,24 42,16 C50,12 56,8 62,6"
                  fill="none"
                  stroke="#7c3aed"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* KPI 4: Croissance (vs Avr. 2026) */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <span className="truncate">Croissance (vs Avr. 2026)</span>
          </div>
          <div className="flex items-end justify-between mt-1">
            <div>
              <div className="text-2xl font-black text-emerald-600 tracking-tight">
                +18,2%
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">Revenus</div>
            </div>
            {/* Sparkline curve */}
            <div className="w-16 h-8 select-none">
              <svg viewBox="0 0 64 32" className="w-full h-full">
                <path
                  d="M2,26 C16,22 30,18 42,12 C52,8 58,4 62,2"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* KPI 5: Factures en retard */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-2">
            <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <span>Factures en retard</span>
          </div>
          <div className="flex items-end justify-between mt-1">
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                3
              </div>
              <div className="text-xs font-bold text-slate-700 mt-1">
                2 450,00 $
              </div>
            </div>
            {/* Small vertical bar chart */}
            <div className="flex items-end gap-1 h-8 pb-1 select-none">
              <div className="w-1.5 h-2.5 bg-slate-200 rounded-xs" />
              <div className="w-1.5 h-4 bg-slate-300 rounded-xs" />
              <div className="w-1.5 h-3.5 bg-amber-400 rounded-xs" />
              <div className="w-1.5 h-6 bg-amber-500 rounded-xs" />
              <div className="w-1.5 h-7 bg-amber-500 rounded-xs" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MIDDLE ROW: Recommandations prioritaires + Prévision de trésorerie     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column (5/12): Recommandations prioritaires */}
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
                <span>Voir toutes</span>
                <span>→</span>
              </button>
            </div>

            {/* List of 4 Recommendations */}
            <div className="divide-y divide-slate-100">
              {/* Item 1 */}
              <div
                onClick={() => setSelectedRecommendation('price_increase')}
                className="py-3.5 first:pt-3.5 last:pb-0 flex items-start justify-between gap-3 hover:bg-slate-50/70 p-2 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-[13px] font-bold text-slate-900">
                      Augmenter vos prix sur 2 produits/services
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5 max-w-md">
                      Augmenter de 5 % vos prix sur vos 2 services les plus rentables pourrait augmenter votre bénéfice de 1 250 $ par mois.
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-slate-400 font-medium">Impact estimé</div>
                  <div className="text-xs font-bold text-emerald-600 whitespace-nowrap">
                    +1 250 $ / mois
                  </div>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">
                    Élevé
                  </span>
                </div>
              </div>

              {/* Item 2 */}
              <div
                onClick={() => setSelectedRecommendation('overdue_invoices')}
                className="py-3.5 flex items-start justify-between gap-3 hover:bg-slate-50/70 p-2 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 border border-rose-100">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-[13px] font-bold text-slate-900">
                      Factures en retard à suivre
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5 max-w-md">
                      3 factures sont en retard de plus de 30 jours pour un montant total de 2 450 $. Un suivi pourrait améliorer votre trésorerie.
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-slate-400 font-medium">Impact estimé</div>
                  <div className="text-xs font-bold text-rose-600 whitespace-nowrap">
                    +2 450 $
                  </div>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-bold">
                    Élevé
                  </span>
                </div>
              </div>

              {/* Item 3 */}
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
                      Réduire les dépenses de Marketing
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5 max-w-md">
                      Les dépenses Marketing ont augmenté de 45 % ce mois-ci. Vous pourriez optimiser et économiser jusqu'à 780 $.
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-slate-400 font-medium">Impact estimé</div>
                  <div className="text-xs font-bold text-amber-600 whitespace-nowrap">
                    -780 $ / mois
                  </div>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
                    Moyen
                  </span>
                </div>
              </div>

              {/* Item 4 */}
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
                      Saisonnalité favorable
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5 max-w-md">
                      Les mois de Juin & Août sont historiquement vos meilleurs mois. Lancez une promotion.
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-slate-400 font-medium">Impact estimé</div>
                  <div className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                    N/A
                  </div>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">
                    Faible
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7/12): Prévision de trésorerie (30 prochains jours) */}
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
                  <span className="text-[10.5px]">Entrées prévues</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-rose-500 inline-block relative before:content-[''] before:w-1.5 before:h-1.5 before:bg-rose-500 before:rounded-full before:absolute before:left-1/2 before:-translate-x-1/2 before:-top-0.5" />
                  <span className="text-[10.5px]">Sorties prévues</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-blue-600 inline-block relative before:content-[''] before:w-1.5 before:h-1.5 before:bg-blue-600 before:rounded-full before:absolute before:left-1/2 before:-translate-x-1/2 before:-top-0.5" />
                  <span className="text-[10.5px]">Solde prévisionnel</span>
                </div>
              </div>
            </div>

            {/* SVG Interactive Chart with floating Alerte AI card */}
            <div className="relative pt-4 pb-2">
              <svg viewBox="0 0 540 230" className="w-full h-auto overflow-visible select-none">
                {/* Y Axis Grid lines: 40K, 30K, 20K, 10K, 0 */}
                {[
                  { val: '40K', y: 30 },
                  { val: '30K', y: 75 },
                  { val: '20K', y: 120 },
                  { val: '10K', y: 165 },
                  { val: '0', y: 210 }
                ].map((grid) => (
                  <g key={grid.val}>
                    <line
                      x1="45"
                      y1={grid.y}
                      x2="520"
                      y2={grid.y}
                      stroke="#f1f5f9"
                      strokeDasharray={grid.val === '0' ? 'none' : '3 3'}
                    />
                    <text
                      x="35"
                      y={grid.y + 4}
                      fontSize="10"
                      fill="#94a3b8"
                      textAnchor="end"
                      fontWeight="500"
                    >
                      {grid.val}
                    </text>
                  </g>
                ))}

                {/* X Axis Labels: 1 juin, 8 juin, 15 juin, 22 juin, 29 juin */}
                {[
                  { label: '1 juin', x: 60 },
                  { label: '8 juin', x: 170 },
                  { label: '15 juin', x: 280 },
                  { label: '22 juin', x: 390 },
                  { label: '29 juin', x: 500 }
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

                {/* 1. Green Curve: Entrées prévues (rising to ~36k) */}
                <path
                  d="M 60 120 L 115 110 L 170 95 L 225 80 L 280 65 L 335 75 L 390 70 L 445 55 L 500 45"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {[
                  { x: 60, y: 120 },
                  { x: 170, y: 95 },
                  { x: 280, y: 65 },
                  { x: 390, y: 70 },
                  { x: 500, y: 45 }
                ].map((p, i) => (
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

                {/* 2. Red Curve: Sorties prévues (undulating 15k to 26k) */}
                <path
                  d="M 60 115 L 115 140 L 170 130 L 225 125 L 280 110 L 335 125 L 390 98 L 445 105 L 500 118"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {[
                  { x: 60, y: 115 },
                  { x: 170, y: 130 },
                  { x: 280, y: 110 },
                  { x: 390, y: 98 },
                  { x: 500, y: 118 }
                ].map((p, i) => (
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

                {/* 3. Blue Solid Curve: Solde prévisionnel until 22 juin */}
                <path
                  d="M 60 120 L 115 150 L 170 142 L 225 135 L 280 102 L 335 138 L 390 118"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Blue Dotted Curve: after 22 juin dipping down */}
                <path
                  d="M 390 118 L 445 155 L 500 195"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2.2"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />

                {[
                  { x: 60, y: 120 },
                  { x: 115, y: 150 },
                  { x: 170, y: 142 },
                  { x: 225, y: 135 },
                  { x: 280, y: 102 },
                  { x: 335, y: 138 },
                  { x: 390, y: 118 }
                ].map((p, i) => (
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

                {/* Tooltip on start point (31 mai / 1 juin) */}
                <g>
                  <rect
                    x="50"
                    y="72"
                    width="110"
                    height="38"
                    rx="8"
                    fill="#ffffff"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"
                  />
                  <text x="60" y="86" fontSize="9" fill="#94a3b8" fontWeight="500">
                    Solde au 31 mai
                  </text>
                  <text x="60" y="101" fontSize="11" fill="#0f172a" fontWeight="700">
                    25 600,00 $
                  </text>
                </g>
              </svg>

              {/* Floating Alerte AI Card placed on top right inside chart */}
              <div className="absolute right-4 top-8 sm:top-10 w-48 sm:w-56 bg-white/95 backdrop-blur-xs rounded-xl border border-purple-200/80 shadow-lg shadow-purple-500/10 p-3 z-10 transition-transform hover:-translate-y-0.5">
                <div className="flex items-center gap-1.5 text-purple-700 font-bold text-xs mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Alerte AI</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug mb-2 font-medium">
                  Votre trésorerie pourrait devenir faible dans 18 jours.
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
        {/* Bottom Card 1 (approx 36% / 4.5 cols): Que souhaitez-vous faire ? */}
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
                  Voir mes objectifs
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
                  Simuler un scénario
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
                  Discuter avec l'AI
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
                  Voir mes alertes
                </span>
              </button>

              {/* Button 5: Rapport AI (PDF) */}
              <button
                type="button"
                onClick={() => {
                  triggerToast?.('Génération du rapport PDF complet...');
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
                  Rapport AI (PDF)
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Card 2 (approx 28% / 3.5 cols): Analyse rapide */}
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
                  <span className="text-[11px]">Marge bénéficiaire moyenne</span>
                </div>
                <span className="font-bold text-slate-900 text-xs">63,1%</span>
              </div>

              {/* Row 2 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px]">Délai moyen de paiement</span>
                </div>
                <span className="font-bold text-slate-900 text-xs">12 jours</span>
              </div>

              {/* Row 3 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px]">Taux d'impayés</span>
                </div>
                <span className="font-bold text-slate-900 text-xs">4,2%</span>
              </div>

              {/* Row 4 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px]">Meilleur client (revenus)</span>
                </div>
                <span className="font-bold text-slate-900 text-xs">Entreprise ABC</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Card 3 (approx 36% / 4 cols): Résumé IA du mois (Beta) */}
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
                Beta
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
              Vous avez réalisé un excellent mois ! Vos revenus augmentent plus vite que vos dépenses et votre marge s'améliore. Continuez à contrôler vos dépenses et suivez vos factures en retard pour maintenir une trésorerie saine.
            </p>
          </div>

          {/* 4 Metrics below paragraph */}
          <div className="grid grid-cols-4 gap-2 pt-3 mt-3 border-t border-slate-100 text-center">
            {/* Metric 1 */}
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Revenus</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5 whitespace-nowrap">
                23 450,00 $
              </div>
              <div className="text-[10px] font-bold text-emerald-600">+18,2%</div>
            </div>

            {/* Metric 2 */}
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Dépenses</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5 whitespace-nowrap">
                8 650,00 $
              </div>
              <div className="text-[10px] font-bold text-emerald-600">-6,4%</div>
            </div>

            {/* Metric 3 */}
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Marge</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5">
                63,1%
              </div>
              <div className="text-[10px] font-bold text-emerald-600">+5,2 pts</div>
            </div>

            {/* Metric 4 */}
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Bénéfice net</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5 whitespace-nowrap">
                14 800,00 $
              </div>
              <div className="text-[10px] font-bold text-emerald-600">+24,6%</div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. FLOATING AI CHAT BUTTON (Bottom right as in screenshot)               */}
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
                    En ligne • Modèle financier actif
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
                placeholder="Posez une question sur vos finances..."
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
                  Éviter le creux de trésorerie prévu dans 18 jours
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
                <div className="font-bold text-blue-900 flex items-center justify-between">
                  <span>1. Relancer les 3 factures en retard</span>
                  <span className="text-emerald-700 font-extrabold">+2 450 $</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Envoie un rappel automatisé par e-mail avec lien de paiement Stripe/Interac.
                </p>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                <div className="font-bold text-emerald-900 flex items-center justify-between">
                  <span>2. Décaler une dépense non urgente</span>
                  <span className="text-emerald-700 font-extrabold">+1 200 $</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Reporter le renouvellement des licences ou achats matériel prévus au 20 juin.
                </p>
              </div>

              <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl">
                <div className="font-bold text-purple-900 flex items-center justify-between">
                  <span>3. Facturer un acompte client</span>
                  <span className="text-purple-700 font-extrabold">+1 800 $</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Émettre un acompte de 30% pour les projets démarrant début juillet.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowSolutionsModal(false);
                  triggerToast?.('Actions préconisées appliquées à votre plan.');
                }}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Appliquer les recommandations
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
                  Testez l'impact de décisions sur votre bénéfice et votre trésorerie
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

              {/* Slider 2: Réduction des dépenses marketing */}
              <div>
                <div className="flex items-center justify-between text-slate-700 font-semibold mb-1">
                  <span>Optimisation dépenses marketing :</span>
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
                  Résultat prévisionnel simulé
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Gain de bénéfice mensuel :</span>
                  <span className="font-black text-emerald-600 text-sm">
                    +{(priceIncreasePct * 250 + marketingCutPct * 52).toLocaleString('fr-CA')} $ / mois
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Nouveau score financier :</span>
                  <span className="font-bold text-slate-900">
                    {Math.min(95, 82 + Math.round(priceIncreasePct * 0.4 + marketingCutPct * 0.2))} /100
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowScenarioModal(false);
                  triggerToast?.('Scénario enregistré dans vos prévisions.');
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Enregistrer ce scénario
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
                <h3 className="text-sm font-bold text-slate-900">Objectifs financiers 2026</h3>
                <p className="text-[11px] text-slate-500">Progression suivie par le Conseiller AI</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Chiffre d'affaires annuel (300 000 $)</span>
                  <span className="text-blue-600 font-bold">68%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Marge nette cible (&gt; 60%)</span>
                  <span className="text-emerald-600 font-bold">63,1% (Atteint)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Coussin de sécurité (3 mois de charges)</span>
                  <span className="text-purple-600 font-bold">84%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '84%' }} />
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowGoalsModal(false)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECOMMENDATION DETAIL MODAL */}
      {selectedRecommendation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setSelectedRecommendation(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Action recommandée par l'AI
                </h3>
                <span className="text-[11px] text-slate-500">Plan d'exécution pas à pas</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed mb-4">
              {selectedRecommendation === 'price_increase' && (
                <div>
                  <p className="font-bold text-slate-900 mb-1">Stratégie d'augmentation tarifaire :</p>
                  Vos services de consultation et forfaits récurrents n'ont pas été réévalués depuis 14 mois alors que l'inflation sectorielle est de 4,8%.
                  Une hausse ciblée de 5% est acceptée par 96% de vos clients similaires sans friction.
                </div>
              )}
              {selectedRecommendation === 'overdue_invoices' && (
                <div>
                  <p className="font-bold text-slate-900 mb-1">Suivi des créances clients :</p>
                  3 factures (Client XYZ, Société 123, Agence Nord) ont dépassé l'échéance de 30 jours.
                  L'activation du lien de paiement instantané par virement ou carte réduit le délai de paiement de 65%.
                </div>
              )}
              {selectedRecommendation === 'marketing_expense' && (
                <div>
                  <p className="font-bold text-slate-900 mb-1">Optimisation des coûts marketing :</p>
                  Deux abonnements d'outils publicitaires n'ont généré aucune conversion directe le mois dernier.
                  La suspension de ces outils économise 780 $ / mois immédiatement.
                </div>
              )}
              {selectedRecommendation === 'seasonality' && (
                <div>
                  <p className="font-bold text-slate-900 mb-1">Saisonnalité favorable (Juin & Août) :</p>
                  Vos encaissements historiques montrent un pic d'activité de +32% durant l'été.
                  Préparez des devis anticipés dès maintenant pour maximiser vos contrats.
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedRecommendation(null);
                  if (selectedRecommendation === 'overdue_invoices') {
                    setScreen('invoices');
                  } else if (selectedRecommendation === 'price_increase') {
                    setScreen('products');
                  } else {
                    setScreen('financial_alerts');
                  }
                }}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
              >
                Accéder à l'écran dédié
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
