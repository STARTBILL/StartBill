import React, { useState } from 'react';
import {
  History,
  Info,
  Download,
  ChevronDown,
  BarChart2,
  ArrowUp,
  ArrowDown,
  X,
  Sparkles,
  TrendingUp,
  Check
} from 'lucide-react';
import { ScreenId } from '../types';
import FinancialNavTabs from './FinancialNavTabs';

interface FinancialHistoryPageProps {
  setScreen: (screen: ScreenId) => void;
  triggerToast?: (msg: string) => void;
}

interface EvaluationRow {
  month: string;
  score: number;
  status: 'Excellente' | 'Bonne' | 'Moyenne';
  variation: string;
  isPositive: boolean;
  breakdown: {
    liquidite: number;
    rentabilite: number;
    croissance: number;
    gestion: number;
    risque: number;
  };
}

const EVALUATION_ROWS: EvaluationRow[] = [
  {
    month: 'Mai 2026',
    score: 86,
    status: 'Excellente',
    variation: '↑ 7 pts',
    isPositive: true,
    breakdown: { liquidite: 92, rentabilite: 86, croissance: 81, gestion: 85, risque: 86 }
  },
  {
    month: 'Avril 2026',
    score: 79,
    status: 'Bonne',
    variation: '↑ 5 pts',
    isPositive: true,
    breakdown: { liquidite: 84, rentabilite: 78, croissance: 74, gestion: 80, risque: 79 }
  },
  {
    month: 'Mars 2026',
    score: 74,
    status: 'Bonne',
    variation: '↑ 6 pts',
    isPositive: true,
    breakdown: { liquidite: 78, rentabilite: 72, croissance: 71, gestion: 76, risque: 73 }
  },
  {
    month: 'Février 2026',
    score: 68,
    status: 'Moyenne',
    variation: '↑ 4 pts',
    isPositive: true,
    breakdown: { liquidite: 71, rentabilite: 66, croissance: 65, gestion: 70, risque: 68 }
  },
  {
    month: 'Janvier 2026',
    score: 64,
    status: 'Moyenne',
    variation: '↓ 2 pts',
    isPositive: false,
    breakdown: { liquidite: 67, rentabilite: 63, croissance: 60, gestion: 66, risque: 64 }
  },
  {
    month: 'Décembre 2025',
    score: 66,
    status: 'Moyenne',
    variation: '↑ 3 pts',
    isPositive: true,
    breakdown: { liquidite: 69, rentabilite: 65, croissance: 62, gestion: 68, risque: 66 }
  },
  {
    month: 'Novembre 2025',
    score: 63,
    status: 'Moyenne',
    variation: '↓ 1 pt',
    isPositive: false,
    breakdown: { liquidite: 65, rentabilite: 62, croissance: 59, gestion: 66, risque: 63 }
  },
  {
    month: 'Octobre 2025',
    score: 64,
    status: 'Moyenne',
    variation: '↓ 2 pts',
    isPositive: false,
    breakdown: { liquidite: 66, rentabilite: 64, croissance: 61, gestion: 67, risque: 62 }
  }
];

// Area Chart historical data points: Juin 2025 to Mai 2026
const CHART_POINTS = [
  { month: 'Juin 2025', score: 58, label: 'Juin 2025' },
  { month: 'Juil. 2025', score: 60 },
  { month: 'Août 2025', score: 63, label: 'Août 2025' },
  { month: 'Sept. 2025', score: 65 },
  { month: 'Oct. 2025', score: 64, label: 'Oct. 2025' },
  { month: 'Nov. 2025', score: 63 },
  { month: 'Déc. 2025', score: 66, label: 'Déc. 2025' },
  { month: 'Jan. 2026', score: 64 },
  { month: 'Fév. 2026', score: 68, label: 'Fév. 2026' },
  { month: 'Mars 2026', score: 74 },
  { month: 'Avril 2026', score: 79 },
  { month: 'Mai 2026', score: 86, label: 'Mai 2026' },
];

export default function FinancialHistoryPage({ setScreen, triggerToast }: FinancialHistoryPageProps) {
  const [period, setPeriod] = useState<'6m' | '12m' | '24m'>('12m');
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<EvaluationRow | null>(null);

  // SVG dimensions for Area Chart
  const svgWidth = 480;
  const svgHeight = 210;
  const padX = 35;
  const padY = 20;
  const maxScore = 100;
  const gw = svgWidth - padX * 2;
  const gh = svgHeight - padY * 2;

  const getX = (i: number) => padX + (i / (CHART_POINTS.length - 1)) * gw;
  const getY = (val: number) => svgHeight - padY - (val / maxScore) * gh;

  // Build line & area path
  const linePath = CHART_POINTS.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.score)}`).join(' ');
  const areaPath = `${linePath} L ${getX(CHART_POINTS.length - 1)} ${svgHeight - padY} L ${getX(0)} ${svgHeight - padY} Z`;

  // X axis labels subset
  const labeledIndices = [0, 2, 4, 6, 8, 11];

  const handleExport = () => {
    triggerToast?.('Exportation de l’historique des scores...');
    setTimeout(() => {
      triggerToast?.('Historique des évaluations exporté avec succès.');
    }, 800);
  };

  const getStatusBadge = (status: EvaluationRow['status']) => {
    switch (status) {
      case 'Excellente':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Excellente
          </span>
        );
      case 'Bonne':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Bonne
          </span>
        );
      case 'Moyenne':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            Moyenne
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 font-sans text-slate-800 pb-8">
      {/* Navigation tabs between 2, 3, 4, 5, 6 */}
      <FinancialNavTabs currentScreen="financial_history" setScreen={setScreen} />

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              6. Historique des évaluations
            </h2>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowInfoTooltip(!showInfoTooltip)}
                className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Informations"
              >
                <Info className="w-4 h-4" />
              </button>
              {showInfoTooltip && (
                <div className="absolute left-0 top-7 z-30 w-72 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl border border-slate-800 leading-relaxed">
                  <p className="font-semibold text-slate-100 mb-1">Historique d'évaluation :</p>
                  Suivi continu de votre score de santé financière mois par mois avec analyse de la trajectoire et détail par pilier.
                </div>
              )}
            </div>
          </div>

          {/* Right Controls: Period + Exporter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                aria-label="Sélectionner la période de l'historique"
                value={period}
                onChange={e => {
                  setPeriod(e.target.value as any);
                  triggerToast?.(`Historique ajusté à : ${e.target.value}`);
                }}
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg cursor-pointer transition-colors"
              >
                <option value="6m">6 derniers mois</option>
                <option value="12m">12 derniers mois</option>
                <option value="24m">24 derniers mois</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Exporter</span>
            </button>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Evaluations Table (approx 55% width) */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 font-semibold">
                    <th className="py-2.5 px-3">Mois</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Statut</th>
                    <th className="py-2.5 px-3">Variation</th>
                    <th className="py-2.5 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {EVALUATION_ROWS.map((row) => (
                    <tr
                      key={row.month}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        {row.month}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-bold text-slate-900">{row.score}</span>
                        <span className="text-slate-400 text-[10px]"> /100</span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {getStatusBadge(row.status)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            row.isPositive ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {row.variation}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedMonth(row)}
                          title="Voir l'analyse détaillée de ce mois"
                          className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 inline-flex items-center justify-center transition-colors cursor-pointer border border-blue-100"
                        >
                          <BarChart2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Chart & 4 KPIs (approx 45% width) */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
              Évolution du score financier (12 derniers mois)
            </h3>

            {/* Area Chart */}
            <div className="relative">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible select-none">
                <defs>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                {/* Y Axis Grid lines & values: 100, 75, 50, 25, 0 */}
                {[100, 75, 50, 25, 0].map((val) => {
                  const y = getY(val);
                  return (
                    <g key={val}>
                      <line
                        x1={padX}
                        y1={y}
                        x2={svgWidth - padX}
                        y2={y}
                        stroke="#f1f5f9"
                        strokeDasharray={val === 0 ? 'none' : '3 3'}
                      />
                      <text
                        x={padX - 6}
                        y={y + 3}
                        fontSize="9"
                        fill="#94a3b8"
                        textAnchor="end"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* X Axis Labels */}
                {labeledIndices.map((idx) => {
                  const p = CHART_POINTS[idx];
                  const x = getX(idx);
                  return (
                    <text
                      key={p.month}
                      x={x}
                      y={svgHeight - 4}
                      fontSize="9"
                      fill="#64748b"
                      textAnchor="middle"
                      fontWeight="500"
                    >
                      {p.label || p.month}
                    </text>
                  );
                })}

                {/* Gradient Area Fill */}
                <path d={areaPath} fill="url(#purpleGradient)" />

                {/* Line Curve in Purple */}
                <path
                  d={linePath}
                  fill="none"
                  stroke="#7c3aed"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data point circles */}
                {CHART_POINTS.map((p, i) => (
                  <circle
                    key={p.month}
                    cx={getX(i)}
                    cy={getY(p.score)}
                    r="3.5"
                    fill="#7c3aed"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                  />
                ))}
              </svg>
            </div>

            {/* Bottom 4 Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-center">
              {/* Stat 1 */}
              <div className="bg-slate-50/70 p-2 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">Score moyen (12 mois)</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  69 <span className="text-[10px] text-slate-400 font-normal">/100</span>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="bg-slate-50/70 p-2 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">Meilleur score</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  86 <span className="text-[10px] text-slate-400 font-normal">/100</span>
                </div>
                <div className="text-[9px] text-slate-400">Mai 2026</div>
              </div>

              {/* Stat 3 */}
              <div className="bg-slate-50/70 p-2 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">Plus bas score</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  58 <span className="text-[10px] text-slate-400 font-normal">/100</span>
                </div>
                <div className="text-[9px] text-slate-400">Juin 2025</div>
              </div>

              {/* Stat 4 */}
              <div className="bg-slate-50/70 p-2 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">Progression</div>
                <div className="text-sm font-bold text-emerald-600 mt-0.5 flex items-center justify-center gap-0.5">
                  <span>↑ 16 pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Modal when action icon is clicked */}
      {selectedMonth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setSelectedMonth(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Détail du score : {selectedMonth.month}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-bold text-slate-900">{selectedMonth.score} /100</span>
                  {getStatusBadge(selectedMonth.status)}
                  <span className="text-xs text-emerald-600 font-semibold">{selectedMonth.variation}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">1. Liquidité & Trésorerie</span>
                <span className="font-bold text-slate-900">{selectedMonth.breakdown.liquidite} %</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${selectedMonth.breakdown.liquidite}%` }} />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-600">2. Rentabilité nette</span>
                <span className="font-bold text-slate-900">{selectedMonth.breakdown.rentabilite} %</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${selectedMonth.breakdown.rentabilite}%` }} />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-600">3. Dynamique de croissance</span>
                <span className="font-bold text-slate-900">{selectedMonth.breakdown.croissance} %</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${selectedMonth.breakdown.croissance}%` }} />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-600">4. Maîtrise des dépenses</span>
                <span className="font-bold text-slate-900">{selectedMonth.breakdown.gestion} %</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${selectedMonth.breakdown.gestion}%` }} />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-600">5. Maîtrise du risque client</span>
                <span className="font-bold text-slate-900">{selectedMonth.breakdown.risque} %</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${selectedMonth.breakdown.risque}%` }} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedMonth(null);
                  setScreen('financial_health');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
              >
                Ouvrir dans l'Analyse détaillée
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
