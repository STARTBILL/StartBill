import React, { useState } from 'react';
import {
  TrendingUp,
  Shield,
  Activity,
  Info,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Users,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  Calendar,
  Layers
} from 'lucide-react';
import { ScreenId } from '../types';
import FinancialNavTabs from './FinancialNavTabs';

interface FinancialTrendsPageProps {
  setScreen: (screen: ScreenId) => void;
  triggerToast?: (msg: string) => void;
}

export default function FinancialTrendsPage({ setScreen, triggerToast }: FinancialTrendsPageProps) {
  const [period, setPeriod] = useState<'30d' | '7d' | '90d' | 'ytd'>('30d');
  const [comparePeriod, setComparePeriod] = useState<'previous_30' | 'previous_year' | 'none'>('previous_30');
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [activeDateIndex, setActiveDateIndex] = useState<number | null>(null);

  // Chart data matching the screenshot dates: 1 mai, 6 mai, 11 mai, 16 mai, 21 mai, 26 mai, 31 mai
  const chartPoints = [
    { label: '1 mai',  rev: 22000, exp: 12000, net: 7000,  cf: 2500 },
    { label: '6 mai',  rev: 23500, exp: 13200, net: 8500,  cf: 3000 },
    { label: '11 mai', rev: 25000, exp: 14500, net: 9200,  cf: 4200 },
    { label: '16 mai', rev: 27500, exp: 15500, net: 10500, cf: 5500 },
    { label: '21 mai', rev: 31000, exp: 18500, net: 13500, cf: 7800 },
    { label: '26 mai', rev: 33000, exp: 21500, net: 14200, cf: 9800 },
    { label: '31 mai', rev: 36000, exp: 22800, net: 16000, cf: 12000 },
  ];

  // Max value 40,000 for Y-axis
  const maxY = 40000;
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 45;
  const paddingY = 25;
  const graphWidth = svgWidth - paddingX * 2;
  const graphHeight = svgHeight - paddingY * 2;

  const getX = (index: number) => paddingX + (index / (chartPoints.length - 1)) * graphWidth;
  const getY = (val: number) => svgHeight - paddingY - (val / maxY) * graphHeight;

  // Build SVG path strings
  const revPath = chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.rev)}`).join(' ');
  const expPath = chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.exp)}`).join(' ');
  const netPath = chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.net)}`).join(' ');
  const cfPath  = chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.cf)}`).join(' ');

  return (
    <div className="space-y-4 font-sans text-slate-800 pb-8">
      {/* Navigation tabs between 2, 3, 4, 5, 6 */}
      <FinancialNavTabs currentScreen="financial_trends" setScreen={setScreen} />

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6 space-y-5">
        {/* Header with Title and Dropdowns */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              4. Tendances
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
                  <p className="font-semibold text-slate-100 mb-1">Analyse des tendances :</p>
                  Visualisation multi-courbes synchronisée des revenus, dépenses, bénéfice net et flux de trésorerie avec comparaison glissante.
                </div>
              )}
            </div>
          </div>

          {/* Period selector & comparison dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                aria-label="Sélectionner la période"
                value={period}
                onChange={e => {
                  setPeriod(e.target.value as any);
                  triggerToast?.(`Période mise à jour.`);
                }}
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg cursor-pointer transition-colors"
              >
                <option value="30d">30 derniers jours</option>
                <option value="7d">7 derniers jours</option>
                <option value="90d">3 derniers mois</option>
                <option value="ytd">Cette année (YTD)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                aria-label="Comparer avec une période"
                value={comparePeriod}
                onChange={e => {
                  setComparePeriod(e.target.value as any);
                  triggerToast?.('Période de comparaison actualisée.');
                }}
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg cursor-pointer transition-colors"
              >
                <option value="previous_30">Comparer avec : 30 jours précédents</option>
                <option value="previous_year">Comparer avec : Même période an dernier</option>
                <option value="none">Aucune comparaison</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 6 Metric KPI Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Card 1: Revenus */}
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex flex-col justify-between hover:bg-slate-100/60 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Revenus</span>
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mb-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>18,2%</span>
            </div>
            <div className="text-sm font-bold text-slate-900 tracking-tight">
              24 500,00 $
            </div>
          </div>

          {/* Card 2: Dépenses */}
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex flex-col justify-between hover:bg-slate-100/60 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Dépenses</span>
              <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <Shield className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-rose-600 text-xs font-bold mb-0.5">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>6,4%</span>
            </div>
            <div className="text-sm font-bold text-slate-900 tracking-tight">
              8 650,00 $
            </div>
          </div>

          {/* Card 3: Bénéfice net */}
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex flex-col justify-between hover:bg-slate-100/60 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Bénéfice net</span>
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mb-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>24,6%</span>
            </div>
            <div className="text-sm font-bold text-slate-900 tracking-tight">
              15 850,00 $
            </div>
          </div>

          {/* Card 4: Cash Flow */}
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex flex-col justify-between hover:bg-slate-100/60 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Cash Flow</span>
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Activity className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mb-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>16,8%</span>
            </div>
            <div className="text-sm font-bold text-slate-900 tracking-tight">
              13 250,00 $
            </div>
          </div>

          {/* Card 5: Marge bénéficiaire */}
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex flex-col justify-between hover:bg-slate-100/60 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Marge bénéficiaire</span>
              <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Info className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mb-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>5,1 pts</span>
            </div>
            <div className="text-sm font-bold text-slate-900 tracking-tight">
              64,7%
            </div>
          </div>

          {/* Card 6: Nouveaux clients */}
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex flex-col justify-between hover:bg-slate-100/60 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Nouveaux clients</span>
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mb-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>12,0%</span>
            </div>
            <div className="text-sm font-bold text-slate-900 tracking-tight">
              24
            </div>
          </div>
        </div>

        {/* Main Body: Multi-Line Chart (left) & Points Clés (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
          {/* Left Chart Area */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-100 p-4 shadow-2xs">
            {/* Chart Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold pb-3 border-b border-slate-100 text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className="w-3 h-0.5 bg-emerald-500 inline-block" />
                <span className="text-slate-800">Revenus</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span className="w-3 h-0.5 bg-rose-500 inline-block border-dashed" />
                <span className="text-slate-800">Dépenses</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                <span className="w-3 h-0.5 bg-blue-600 inline-block" />
                <span className="text-slate-800">Bénéfice net</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
                <span className="w-3 h-0.5 bg-purple-600 inline-block" />
                <span className="text-slate-800">Cash Flow</span>
              </div>
            </div>

            {/* Interactive SVG Chart */}
            <div className="relative mt-2">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto overflow-visible select-none"
              >
                {/* Y Axis Grid Lines & Labels */}
                {[40000, 30000, 20000, 10000, 0].map((val) => {
                  const y = getY(val);
                  return (
                    <g key={val}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={svgWidth - paddingX}
                        y2={y}
                        stroke="#f1f5f9"
                        strokeDasharray={val === 0 ? 'none' : '3 3'}
                        strokeWidth="1"
                      />
                      <text
                        x={paddingX - 8}
                        y={y + 3}
                        fontSize="10"
                        fill="#94a3b8"
                        textAnchor="end"
                        fontWeight="500"
                      >
                        {val === 0 ? '0' : `${val / 1000}K`}
                      </text>
                    </g>
                  );
                })}

                {/* X Axis Labels */}
                {chartPoints.map((p, i) => {
                  const x = getX(i);
                  return (
                    <text
                      key={p.label}
                      x={x}
                      y={svgHeight - 4}
                      fontSize="10"
                      fill="#64748b"
                      textAnchor="middle"
                      fontWeight="500"
                    >
                      {p.label}
                    </text>
                  );
                })}

                {/* Hover Guide Line */}
                {activeDateIndex !== null && (
                  <line
                    x1={getX(activeDateIndex)}
                    y1={paddingY}
                    x2={getX(activeDateIndex)}
                    y2={svgHeight - paddingY}
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                )}

                {/* 1. Revenus Path (Emerald) */}
                <path
                  d={revPath}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {chartPoints.map((p, i) => (
                  <circle
                    key={`rev-${i}`}
                    cx={getX(i)}
                    cy={getY(p.rev)}
                    r={activeDateIndex === i ? '5' : '3.5'}
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-all cursor-pointer"
                  />
                ))}

                {/* 2. Dépenses Path (Rose) */}
                <path
                  d={expPath}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {chartPoints.map((p, i) => (
                  <circle
                    key={`exp-${i}`}
                    cx={getX(i)}
                    cy={getY(p.exp)}
                    r={activeDateIndex === i ? '4.5' : '3'}
                    fill="#ef4444"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                ))}

                {/* 3. Bénéfice net Path (Blue) */}
                <path
                  d={netPath}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {chartPoints.map((p, i) => (
                  <circle
                    key={`net-${i}`}
                    cx={getX(i)}
                    cy={getY(p.net)}
                    r={activeDateIndex === i ? '5' : '3.5'}
                    fill="#2563eb"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                ))}

                {/* 4. Cash Flow Path (Purple) */}
                <path
                  d={cfPath}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {chartPoints.map((p, i) => (
                  <circle
                    key={`cf-${i}`}
                    cx={getX(i)}
                    cy={getY(p.cf)}
                    r={activeDateIndex === i ? '4.5' : '3'}
                    fill="#8b5cf6"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                ))}

                {/* Invisible hover zones */}
                {chartPoints.map((p, i) => (
                  <rect
                    key={`zone-${i}`}
                    x={getX(i) - 20}
                    y={0}
                    width={40}
                    height={svgHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveDateIndex(i)}
                    onMouseLeave={() => setActiveDateIndex(null)}
                  />
                ))}
              </svg>

              {/* Hover Tooltip display */}
              {activeDateIndex !== null && (
                <div className="absolute top-2 right-4 bg-slate-900/90 backdrop-blur-xs text-white p-2.5 rounded-xl shadow-lg border border-slate-700 text-[11px] space-y-1 animate-in fade-in duration-150">
                  <div className="font-bold border-b border-slate-700 pb-1 text-slate-200">
                    {chartPoints[activeDateIndex].label}
                  </div>
                  <div className="flex justify-between gap-4 text-emerald-400">
                    <span>Revenus :</span>
                    <span className="font-bold">{chartPoints[activeDateIndex].rev.toLocaleString()} $</span>
                  </div>
                  <div className="flex justify-between gap-4 text-rose-400">
                    <span>Dépenses :</span>
                    <span className="font-bold">{chartPoints[activeDateIndex].exp.toLocaleString()} $</span>
                  </div>
                  <div className="flex justify-between gap-4 text-blue-400">
                    <span>Bénéfice :</span>
                    <span className="font-bold">{chartPoints[activeDateIndex].net.toLocaleString()} $</span>
                  </div>
                  <div className="flex justify-between gap-4 text-purple-400">
                    <span>Cash Flow :</span>
                    <span className="font-bold">{chartPoints[activeDateIndex].cf.toLocaleString()} $</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Area: Points Clés */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col justify-between shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3.5 pb-2 border-b border-slate-100">
                Points clés
              </h3>
              <div className="space-y-3.5 text-xs text-slate-600">
                {/* Point 1 */}
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="leading-snug">
                    Les revenus sont en hausse constante depuis le début du mois.
                  </span>
                </div>

                {/* Point 2 */}
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 border border-rose-200">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <span className="leading-snug">
                    Les dépenses diminuent grâce à une meilleure gestion.
                  </span>
                </div>

                {/* Point 3 */}
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <span className="leading-snug">
                    Le bénéfice net augmente de manière significative.
                  </span>
                </div>

                {/* Point 4 */}
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5 border border-purple-200">
                    <Wallet className="w-3.5 h-3.5" />
                  </div>
                  <span className="leading-snug">
                    Le cash flow reste positif et stable.
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Link: Voir toutes les tendances */}
            <div className="pt-4 border-t border-slate-100 text-right mt-4">
              <button
                type="button"
                onClick={() => {
                  setScreen('reports');
                  triggerToast?.('Accès au rapport détaillé des tendances et KPIs.');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                <span>Voir toutes les tendances</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
