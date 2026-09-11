import React, { useState } from 'react';
import {
  TrendingUp,
  Shield,
  Wallet,
  Heart,
  Info,
  Download,
  ChevronDown,
  ArrowUpRight,
  FileSpreadsheet,
  Printer,
  Sparkles
} from 'lucide-react';
import { ScreenId } from '../types';
import FinancialNavTabs from './FinancialNavTabs';

interface FinancialForecastsPageProps {
  setScreen: (screen: ScreenId) => void;
  triggerToast?: (msg: string) => void;
}

export default function FinancialForecastsPage({ setScreen, triggerToast }: FinancialForecastsPageProps) {
  const [horizon, setHorizon] = useState<'3m' | '6m' | '12m'>('6m');
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [activeMonthIndex, setActiveMonthIndex] = useState<number | null>(null);

  // Projected months: Juin 2026 to Nov. 2026
  const months = [
    { label: 'Juin\n2026', short: 'Juin 2026', rev: 120000, exp: 46000, net: 74000, cash: 15000 },
    { label: 'Juil.\n2026', short: 'Juil. 2026', rev: 126000, exp: 47500, net: 78500, cash: 19000 },
    { label: 'Août\n2026', short: 'Août 2026', rev: 135000, exp: 49000, net: 86000, cash: 24000 },
    { label: 'Sept.\n2026', short: 'Sept. 2026', rev: 142000, exp: 51000, net: 91000, cash: 29000 },
    { label: 'Oct.\n2026',  short: 'Oct. 2026',  rev: 150000, exp: 52500, net: 97500, cash: 32000 },
    { label: 'Nov.\n2026',  short: 'Nov. 2026',  rev: 158000, exp: 54200, net: 103800, cash: 35000 },
  ];

  // SVG Chart 1 Dimensions (Evolution prévisionnelle)
  const svgWidth1 = 360;
  const svgHeight1 = 180;
  const padX1 = 35;
  const padY1 = 20;
  const maxVal1 = 200000;
  const gw1 = svgWidth1 - padX1 * 2;
  const gh1 = svgHeight1 - padY1 * 2;

  const getX1 = (i: number) => padX1 + (i / (months.length - 1)) * gw1;
  const getY1 = (val: number) => svgHeight1 - padY1 - (val / maxVal1) * gh1;

  const revPath1 = months.map((m, i) => `${i === 0 ? 'M' : 'L'} ${getX1(i)} ${getY1(m.rev)}`).join(' ');
  const expPath1 = months.map((m, i) => `${i === 0 ? 'M' : 'L'} ${getX1(i)} ${getY1(m.exp)}`).join(' ');
  const netPath1 = months.map((m, i) => `${i === 0 ? 'M' : 'L'} ${getX1(i)} ${getY1(m.net)}`).join(' ');

  // SVG Chart 2 Dimensions (Trésorerie prévisionnelle)
  const svgWidth2 = 260;
  const svgHeight2 = 180;
  const padX2 = 30;
  const padY2 = 20;
  const maxVal2 = 40000;
  const gw2 = svgWidth2 - padX2 * 2;
  const gh2 = svgHeight2 - padY2 * 2;

  const getX2 = (i: number) => padX2 + (i / (months.length - 1)) * gw2;
  const getY2 = (val: number) => svgHeight2 - padY2 - (val / maxVal2) * gh2;

  const cashPath = months.map((m, i) => `${i === 0 ? 'M' : 'L'} ${getX2(i)} ${getY2(m.cash)}`).join(' ');

  const handleExport = () => {
    triggerToast?.('Exportation des données prévisionnelles en cours...');
    setTimeout(() => {
      triggerToast?.('Rapport prévisionnel téléchargé (CSV & PDF).');
    }, 800);
  };

  return (
    <div className="space-y-4 font-sans text-slate-800 pb-8">
      {/* Navigation tabs between 2, 3, 4, 5, 6 */}
      <FinancialNavTabs currentScreen="financial_forecasts" setScreen={setScreen} />

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              5. Prévisions
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
                  <p className="font-semibold text-slate-100 mb-1">Modélisation prédictive :</p>
                  Calculée à partir de vos encaissements historiques, de la récurrence des factures et de la saisonnalité observée.
                </div>
              )}
            </div>
          </div>

          {/* Right Controls: Horizon + Exporter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                aria-label="Sélectionner l'horizon de prévision"
                value={horizon}
                onChange={e => {
                  setHorizon(e.target.value as any);
                  triggerToast?.(`Horizon fixé à : ${e.target.value}`);
                }}
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg cursor-pointer transition-colors"
              >
                <option value="3m">Prochains 3 mois</option>
                <option value="6m">Prochains 6 mois</option>
                <option value="12m">Prochaines 12 mois</option>
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

        {/* 3 Columns Layout matching screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Column 1: Résumé des prévisions (6 mois) */}
          <div className="md:col-span-4 bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 mb-3.5 pb-2 border-b border-slate-100">
              Résumé des prévisions (6 mois)
            </h3>

            <div className="space-y-3.5">
              {/* Revenus prévus */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500">Revenus prévus</div>
                    <div className="text-sm font-bold text-slate-900">158 000,00 $</div>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>16,5%</span>
                </div>
              </div>

              {/* Dépenses prévues */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500">Dépenses prévues</div>
                    <div className="text-sm font-bold text-slate-900">54 200,00 $</div>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>8,4%</span>
                </div>
              </div>

              {/* Bénéfice net prévu */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500">Bénéfice net prévu</div>
                    <div className="text-sm font-bold text-slate-900">103 800,00 $</div>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>21,7%</span>
                </div>
              </div>

              {/* Score financier estimé */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500">Score financier estimé</div>
                    <div className="text-sm font-bold text-slate-900">89 <span className="text-xs text-slate-400 font-normal">/100</span></div>
                  </div>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Excellente
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Évolution prévisionnelle */}
          <div className="md:col-span-5 bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 mb-2 pb-2 border-b border-slate-100">
              Évolution prévisionnelle
            </h3>

            {/* Legend */}
            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600 mb-2">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>Revenus</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                <span>Dépenses</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                <span>Bénéfice net</span>
              </div>
            </div>

            {/* SVG Projection Chart */}
            <div className="relative">
              <svg viewBox={`0 0 ${svgWidth1} ${svgHeight1}`} className="w-full h-auto overflow-visible select-none">
                {/* Y Axis Grid & Labels */}
                {[200000, 150000, 100000, 50000, 0].map((val) => {
                  const y = getY1(val);
                  return (
                    <g key={val}>
                      <line
                        x1={padX1}
                        y1={y}
                        x2={svgWidth1 - padX1}
                        y2={y}
                        stroke="#f1f5f9"
                        strokeDasharray={val === 0 ? 'none' : '3 3'}
                      />
                      <text
                        x={padX1 - 6}
                        y={y + 3}
                        fontSize="9"
                        fill="#94a3b8"
                        textAnchor="end"
                      >
                        {val === 0 ? '0' : `${val / 1000}K`}
                      </text>
                    </g>
                  );
                })}

                {/* X Axis Labels */}
                {months.map((m, i) => {
                  const x = getX1(i);
                  const lines = m.label.split('\n');
                  return (
                    <g key={m.short}>
                      <text x={x} y={svgHeight1 - 10} fontSize="8.5" fill="#64748b" textAnchor="middle" fontWeight="500">
                        {lines[0]}
                      </text>
                      <text x={x} y={svgHeight1} fontSize="7.5" fill="#94a3b8" textAnchor="middle">
                        {lines[1]}
                      </text>
                    </g>
                  );
                })}

                {/* Lines */}
                <path d={revPath1} fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" />
                {months.map((m, i) => (
                  <circle key={`r-${i}`} cx={getX1(i)} cy={getY1(m.rev)} r="3" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
                ))}

                <path d={expPath1} fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 3" strokeLinecap="round" />
                {months.map((m, i) => (
                  <circle key={`e-${i}`} cx={getX1(i)} cy={getY1(m.exp)} r="3" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
                ))}

                <path d={netPath1} fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" />
                {months.map((m, i) => (
                  <circle key={`n-${i}`} cx={getX1(i)} cy={getY1(m.net)} r="3" fill="#2563eb" stroke="#fff" strokeWidth="1.5" />
                ))}
              </svg>
            </div>
          </div>

          {/* Column 3: Trésorerie prévisionnelle */}
          <div className="md:col-span-3 bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 mb-2 pb-2 border-b border-slate-100">
              Trésorerie prévisionnelle
            </h3>

            {/* SVG Cash Flow Chart */}
            <div className="relative">
              <svg viewBox={`0 0 ${svgWidth2} ${svgHeight2}`} className="w-full h-auto overflow-visible select-none">
                {/* Y Axis */}
                {[40000, 30000, 20000, 10000, 0].map((val) => {
                  const y = getY2(val);
                  return (
                    <g key={val}>
                      <line
                        x1={padX2}
                        y1={y}
                        x2={svgWidth2 - padX2}
                        y2={y}
                        stroke="#f1f5f9"
                        strokeDasharray={val === 0 ? 'none' : '3 3'}
                      />
                      <text
                        x={padX2 - 4}
                        y={y + 3}
                        fontSize="8.5"
                        fill="#94a3b8"
                        textAnchor="end"
                      >
                        {val === 0 ? '0' : `${val / 1000}K`}
                      </text>
                    </g>
                  );
                })}

                {/* X Axis */}
                {months.map((m, i) => {
                  const x = getX2(i);
                  const lines = m.label.split('\n');
                  return (
                    <text key={m.short} x={x} y={svgHeight2 - 4} fontSize="8" fill="#64748b" textAnchor="middle">
                      {lines[0]}
                    </text>
                  );
                })}

                {/* Cash Curve in Purple */}
                <path d={cashPath} fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" />
                {months.map((m, i) => (
                  <circle key={`c-${i}`} cx={getX2(i)} cy={getY2(m.cash)} r="3" fill="#7c3aed" stroke="#fff" strokeWidth="1.5" />
                ))}
              </svg>
            </div>

            {/* Explanatory text below */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] leading-relaxed">
              <div className="font-semibold text-slate-800">
                Solde toujours positif sur la période.
              </div>
              <div className="text-slate-500">
                Bonne gestion de trésorerie !
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner Notice (highlighted in red in user's image) */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 flex items-center gap-2.5 text-xs text-slate-600">
          <Info className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            Les prévisions sont basées sur vos données historiques et peuvent varier en fonction des changements.
          </span>
        </div>
      </div>
    </div>
  );
}
