import React, { useMemo, useState } from 'react';
import {
  Info,
  Download,
  ChevronDown,
  BarChart2,
  X,
  FileText,
  Receipt,
  Plus
} from 'lucide-react';
import { Client, Expense, Invoice, ScreenId } from '../types';
import FinancialNavTabs from './FinancialNavTabs';

interface FinancialHistoryPageProps {
  setScreen: (screen: ScreenId) => void;
  triggerToast?: (msg: string) => void;
  invoices?: Invoice[];
  expenses?: Expense[];
  clients?: Client[];
}

interface EvaluationRow {
  monthKey: string;
  month: string;
  score: number;
  status: 'Excellente' | 'Bonne' | 'Moyenne' | 'À surveiller';
  variation: string;
  isPositive: boolean;
  revenue: number;
  expenseTotal: number;
  invoiceCount: number;
  expenseCount: number;
  breakdown: {
    liquidite: number;
    rentabilite: number;
    croissance: number;
    gestion: number;
    risque: number;
  };
}

const FRENCH_MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const SHORT_MONTHS = [
  'Jan.', 'Fév.', 'Mars', 'Avr.', 'Mai', 'Juin',
  'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'
];

function parseMonthKey(rawDate?: string): string | null {
  if (!rawDate) return null;
  const isoMatch = rawDate.match(/^(\d{4})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}`;
  const d = new Date(rawDate);
  if (!Number.isNaN(d.getTime())) {
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${m}`;
  }
  return null;
}

function formatMonthLabel(monthKey: string, short = false): string {
  const [y, m] = monthKey.split('-');
  const idx = parseInt(m, 10) - 1;
  if (Number.isNaN(idx) || idx < 0 || idx > 11) return monthKey;
  return `${short ? SHORT_MONTHS[idx] : FRENCH_MONTHS[idx]} ${y}`;
}

export default function FinancialHistoryPage({
  setScreen,
  triggerToast,
  invoices = [],
  expenses = [],
  clients = []
}: FinancialHistoryPageProps) {
  const [period, setPeriod] = useState<'6m' | '12m' | '24m'>('12m');
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<EvaluationRow | null>(null);

  const monthLimit = period === '6m' ? 6 : period === '24m' ? 24 : 12;

  const { evaluationRows, chartPoints, recentOperations } = useMemo(() => {
    const monthsMap = new Map<string, { invoices: Invoice[]; expenses: Expense[] }>();

    const ensureBucket = (key: string) => {
      if (!monthsMap.has(key)) {
        monthsMap.set(key, { invoices: [], expenses: [] });
      }
      return monthsMap.get(key)!;
    };

    invoices.forEach((inv) => {
      const key = parseMonthKey(inv.date || inv.dueDate);
      if (key) ensureBucket(key).invoices.push(inv);
    });

    expenses.forEach((exp) => {
      const key = parseMonthKey(exp.date || exp.expenseDate || exp.createdAt);
      if (key) ensureBucket(key).expenses.push(exp);
    });

    const sortedKeys = Array.from(monthsMap.keys()).sort();
    const slicedKeys = sortedKeys.slice(-monthLimit);

    const computedChronological: EvaluationRow[] = slicedKeys.map((key, idx) => {
      const bucket = monthsMap.get(key)!;
      const revenue = bucket.invoices.reduce((s, inv) => s + (inv.total || 0), 0);
      const paidRevenue = bucket.invoices.reduce((s, inv) => {
        if (inv.status === 'Payée' || inv.status === 'paid') return s + (inv.total || 0);
        if (inv.status === 'Partiellement payée' || inv.status === 'partial') return s + (inv.amountPaid || 0);
        return s;
      }, 0);
      const expenseTotal = bucket.expenses.reduce((s, e) => s + (e.total || 0), 0);

      const liquidite = revenue > 0 ? Math.min(100, Math.round((paidRevenue / revenue) * 100)) : (expenseTotal > 0 ? 45 : 0);
      const netMarginRatio = revenue > 0 ? Math.max(0, (revenue - expenseTotal) / revenue) : 0;
      const rentabilite = revenue > 0 ? Math.min(100, Math.round(45 + netMarginRatio * 55)) : 20;

      const prevKey = idx > 0 ? slicedKeys[idx - 1] : null;
      const prevRev = prevKey ? (monthsMap.get(prevKey)?.invoices.reduce((s, i) => s + (i.total || 0), 0) || 0) : 0;
      const croissance = revenue > 0
        ? prevRev > 0
          ? Math.min(100, Math.max(25, Math.round(65 + ((revenue - prevRev) / prevRev) * 35)))
          : 75
        : 30;

      const gestion = revenue > 0
        ? Math.min(100, Math.max(20, Math.round(100 - Math.min(80, (expenseTotal / revenue) * 80))))
        : (expenseTotal > 0 ? 45 : 50);

      const overdueCount = bucket.invoices.filter(i => i.status === 'En retard').length;
      const risque = bucket.invoices.length > 0
        ? Math.max(20, Math.round(100 - (overdueCount / bucket.invoices.length) * 70))
        : 70;

      const score = Math.round((liquidite + rentabilite + croissance + gestion + risque) / 5);
      const status: EvaluationRow['status'] =
        score >= 80 ? 'Excellente' : score >= 65 ? 'Bonne' : score >= 45 ? 'Moyenne' : 'À surveiller';

      return {
        monthKey: key,
        month: formatMonthLabel(key, false),
        score,
        status,
        variation: '—',
        isPositive: true,
        revenue,
        expenseTotal,
        invoiceCount: bucket.invoices.length,
        expenseCount: bucket.expenses.length,
        breakdown: { liquidite, rentabilite, croissance, gestion, risque }
      };
    });

    for (let i = 0; i < computedChronological.length; i++) {
      if (i === 0) {
        computedChronological[i].variation = 'Base';
        computedChronological[i].isPositive = true;
      } else {
        const diff = computedChronological[i].score - computedChronological[i - 1].score;
        computedChronological[i].isPositive = diff >= 0;
        computedChronological[i].variation = diff >= 0 ? `+${diff} pts` : `${diff} pts`;
      }
    }

    const pts = computedChronological.map((r) => ({
      month: formatMonthLabel(r.monthKey, true),
      score: r.score
    }));

    const ops = [
      ...invoices.map((inv) => ({
        id: inv.id,
        kind: 'invoice' as const,
        title: `Facture ${inv.id} — ${inv.clientName}`,
        date: inv.date || inv.dueDate || '',
        amount: inv.total || 0,
        status: inv.status,
        currency: inv.currency || 'CAD'
      })),
      ...expenses.map((exp) => ({
        id: exp.id,
        kind: 'expense' as const,
        title: `Dépense ${exp.provider} (${exp.category})`,
        date: exp.date || exp.expenseDate || '',
        amount: exp.total || 0,
        status: exp.paymentMethod || 'Payée',
        currency: exp.currency || 'CAD'
      }))
    ]
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .slice(0, 15);

    return {
      evaluationRows: [...computedChronological].reverse(),
      chartPoints: pts,
      recentOperations: ops
    };
  }, [invoices, expenses, monthLimit]);

  const hasData = evaluationRows.length > 0;

  // SVG dimensions for Area Chart
  const svgWidth = 480;
  const svgHeight = 210;
  const padX = 35;
  const padY = 20;
  const maxScore = 100;
  const gw = svgWidth - padX * 2;
  const gh = svgHeight - padY * 2;

  const getX = (i: number) => {
    if (chartPoints.length <= 1) return padX + gw / 2;
    return padX + (i / (chartPoints.length - 1)) * gw;
  };
  const getY = (val: number) => svgHeight - padY - (val / maxScore) * gh;

  const linePath = chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.score)}`).join(' ');
  const areaPath = chartPoints.length > 1
    ? `${linePath} L ${getX(chartPoints.length - 1)} ${svgHeight - padY} L ${getX(0)} ${svgHeight - padY} Z`
    : '';

  const avgScore = hasData
    ? Math.round(chartPoints.reduce((s, p) => s + p.score, 0) / chartPoints.length)
    : 0;
  const bestPoint = hasData
    ? chartPoints.reduce((best, p) => (p.score > best.score ? p : best), chartPoints[0])
    : null;
  const worstPoint = hasData
    ? chartPoints.reduce((low, p) => (p.score < low.score ? p : low), chartPoints[0])
    : null;
  const progression = chartPoints.length >= 2
    ? chartPoints[chartPoints.length - 1].score - chartPoints[0].score
    : 0;

  const handleExport = () => {
    if (!hasData) {
      triggerToast?.('Aucune donnée historique à exporter.');
      return;
    }
    const headers = ['Mois', 'Score', 'Statut', 'Variation', 'Revenus facturés', 'Dépenses', 'Factures', 'Dépenses (nb)'];
    const csvRows = evaluationRows.map((r) => [
      `"${r.month}"`,
      r.score,
      `"${r.status}"`,
      `"${r.variation}"`,
      r.revenue.toFixed(2),
      r.expenseTotal.toFixed(2),
      r.invoiceCount,
      r.expenseCount
    ].join(','));
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `startbill_historique_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast?.('Historique des évaluations exporté en CSV.');
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
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            À surveiller
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 font-sans text-slate-800 pb-16">
      <FinancialNavTabs currentScreen="financial_history" setScreen={setScreen} />

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6 space-y-5">
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
                  Calculé directement à partir de vos factures, paiements et dépenses enregistrés mois par mois ({clients.length} client{clients.length > 1 ? 's' : ''}).
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                aria-label="Sélectionner la période de l'historique"
                value={period}
                onChange={e => {
                  setPeriod(e.target.value as '6m' | '12m' | '24m');
                  triggerToast?.(`Période ajustée aux ${e.target.value === '6m' ? '6' : e.target.value === '24m' ? '24' : '12'} derniers mois`);
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

        {!hasData ? (
          <div className="py-12 px-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
            <p className="text-sm font-bold text-slate-900">Aucun historique financier enregistré pour le moment</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Enregistrez votre première facture ou dépense pour générer automatiquement votre historique mensuel et le suivi de santé financière.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setScreen('invoices')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Créer une facture
              </button>
              <button
                type="button"
                onClick={() => setScreen('expenses')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter une dépense
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
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
                      {evaluationRows.map((row) => (
                        <tr
                          key={row.monthKey}
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

              <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
                  Évolution du score financier ({chartPoints.length} mois actif{chartPoints.length > 1 ? 's' : ''})
                </h3>

                <div className="relative">
                  <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible select-none">
                    <defs>
                      <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.01" />
                      </linearGradient>
                    </defs>

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

                    {chartPoints.map((p, idx) => {
                      const step = Math.max(1, Math.ceil(chartPoints.length / 6));
                      if (idx !== 0 && idx !== chartPoints.length - 1 && idx % step !== 0) {
                        return null;
                      }
                      return (
                        <text
                          key={p.month}
                          x={getX(idx)}
                          y={svgHeight - 4}
                          fontSize="9"
                          fill="#64748b"
                          textAnchor="middle"
                          fontWeight="500"
                        >
                          {p.month}
                        </text>
                      );
                    })}

                    {areaPath && <path d={areaPath} fill="url(#purpleGradient)" />}
                    {chartPoints.length > 1 && (
                      <path
                        d={linePath}
                        fill="none"
                        stroke="#7c3aed"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {chartPoints.map((p, i) => (
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

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-center">
                  <div className="bg-slate-50/70 p-2 rounded-lg border border-slate-100">
                    <div className="text-[10px] text-slate-500 font-medium">Score moyen</div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {avgScore} <span className="text-[10px] text-slate-400 font-normal">/100</span>
                    </div>
                  </div>

                  <div className="bg-slate-50/70 p-2 rounded-lg border border-slate-100">
                    <div className="text-[10px] text-slate-500 font-medium">Meilleur score</div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {bestPoint ? bestPoint.score : 0} <span className="text-[10px] text-slate-400 font-normal">/100</span>
                    </div>
                    <div className="text-[9px] text-slate-400">{bestPoint ? bestPoint.month : '—'}</div>
                  </div>

                  <div className="bg-slate-50/70 p-2 rounded-lg border border-slate-100">
                    <div className="text-[10px] text-slate-500 font-medium">Plus bas score</div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {worstPoint ? worstPoint.score : 0} <span className="text-[10px] text-slate-400 font-normal">/100</span>
                    </div>
                    <div className="text-[9px] text-slate-400">{worstPoint ? worstPoint.month : '—'}</div>
                  </div>

                  <div className="bg-slate-50/70 p-2 rounded-lg border border-slate-100">
                    <div className="text-[10px] text-slate-500 font-medium">Progression</div>
                    <div className={`text-sm font-bold mt-0.5 ${progression >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {progression >= 0 ? `+${progression} pts` : `${progression} pts`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Real Saved Operations Log */}
            <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">
                  Historique récent des opérations ({recentOperations.length})
                </h3>
                <span className="text-[11px] text-slate-500">
                  {invoices.length} facture{invoices.length > 1 ? 's' : ''} • {expenses.length} dépense{expenses.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {recentOperations.map((op) => (
                  <div
                    key={`${op.kind}-${op.id}`}
                    className="px-4 py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/60"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        op.kind === 'invoice' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {op.kind === 'invoice' ? <FileText className="w-3.5 h-3.5" /> : <Receipt className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{op.title}</p>
                        <p className="text-[11px] text-slate-500">{op.date || 'Date non précisée'} • {op.status}</p>
                      </div>
                    </div>
                    <div className={`font-bold shrink-0 ${op.kind === 'invoice' ? 'text-emerald-700' : 'text-slate-800'}`}>
                      {op.kind === 'invoice' ? '+' : '-'}{op.amount.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

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

            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                <div className="text-[10px] text-slate-500">Facturé ({selectedMonth.invoiceCount})</div>
                <div className="font-bold text-slate-900">{selectedMonth.revenue.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                <div className="text-[10px] text-slate-500">Dépenses ({selectedMonth.expenseCount})</div>
                <div className="font-bold text-slate-900">{selectedMonth.expenseTotal.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $</div>
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
