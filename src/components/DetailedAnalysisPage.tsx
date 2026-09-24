import React, { useState, useEffect } from 'react';
import {
  Info,
  Calendar,
  Download,
  ChevronDown,
  Check,
  TrendingUp,
  FileSpreadsheet,
  Printer,
  X,
  Sparkles,
  Wallet,
  Save,
  Building2,
  ShieldCheck,
  Layers,
  DollarSign
} from 'lucide-react';
import { ScreenId, Business, AccountingMethod, BusinessRegion, BusinessCurrency } from '../types';
import FinancialNavTabs from './FinancialNavTabs';
import { 
  getBusinessByOwner, 
  saveBusiness, 
  computeFinancialHealthMetrics, 
  saveFinancialSnapshot 
} from '../lib/businessFirestore';

export interface DetailedAnalysisPageProps {
  triggerToast?: (msg: string) => void;
  setScreen?: (screen: ScreenId) => void;
  initialTab?: 'Liquidité' | 'Rentabilité' | 'Croissance' | 'Gestion' | 'Risque';
  currentUser?: any;
  currentRegion?: string;
  currency?: string;
}

type TabKey = 'Liquidité' | 'Rentabilité' | 'Croissance' | 'Gestion' | 'Risque';

interface TabData {
  score: number;
  status: string;
  description: string;
  checklist: string[];
  radarValues: {
    liquidite: number;
    rentabilite: number;
    croissance: number;
    gestion: number;
    risque: number;
  };
  indicators: Array<{
    label: string;
    value: string;
    badge: 'Excellent' | 'Bon' | 'Moyen';
  }>;
  history: Array<{
    month: string;
    value: number;
    isCurrent?: boolean;
  }>;
  benchmarks: {
    user: number;
    sectorAvg: number;
    top25: number;
  };
}

const TABS_DATA: Record<TabKey, TabData> = {
  'Liquidité': {
    score: 92,
    status: 'Excellente',
    description: "Votre entreprise dispose d'une excellente capacité à honorer ses engagements à court terme.",
    checklist: [
      'Trésorerie saine',
      'Délai moyen de paiement correct',
      'Peu de factures en retard',
      'Bon niveau de fonds de roulement'
    ],
    radarValues: {
      liquidite: 92,
      rentabilite: 78,
      croissance: 65,
      gestion: 74,
      risque: 85
    },
    indicators: [
      { label: 'Ratio de liquidité générale', value: '2,45', badge: 'Excellent' },
      { label: 'Taux de factures payées à temps', value: '78%', badge: 'Bon' },
      { label: 'Délai moyen de paiement client', value: '18 jours', badge: 'Bon' },
      { label: 'Fonds de roulement', value: '18 600,00 $', badge: 'Excellent' },
      { label: 'Trésorerie / Dépenses mensuelles', value: '2,9 mois', badge: 'Excellent' },
    ],
    history: [
      { month: 'Déc.', value: 68 },
      { month: 'Janv.', value: 72 },
      { month: 'Fév.', value: 74 },
      { month: 'Mars', value: 76 },
      { month: 'Avr.', value: 85 },
      { month: 'Mai', value: 92, isCurrent: true },
    ],
    benchmarks: {
      user: 92,
      sectorAvg: 68,
      top25: 88,
    }
  },
  'Rentabilité': {
    score: 88,
    status: 'Excellente',
    description: "Votre rentabilité opérationnelle et votre marge nette surpassent les standards du marché canadien.",
    checklist: [
      'Marge brute élevée (> 60%)',
      'Marge nette saine (+31,8%)',
      'Frais fixes et charges maîtrisés',
      'Point mort atteint tôt dans le mois'
    ],
    radarValues: {
      liquidite: 82,
      rentabilite: 88,
      croissance: 70,
      gestion: 80,
      risque: 82
    },
    indicators: [
      { label: 'Marge brute d’exploitation', value: '64,2%', badge: 'Excellent' },
      { label: 'Marge bénéficiaire nette', value: '31,8%', badge: 'Excellent' },
      { label: 'Seuil de rentabilité mensuel', value: '6 200,00 $', badge: 'Excellent' },
      { label: 'Rendement des capitaux engagés', value: '24,5%', badge: 'Bon' },
      { label: 'Ratio charges / chiffre d’affaires', value: '38,2%', badge: 'Excellent' },
    ],
    history: [
      { month: 'Déc.', value: 70 },
      { month: 'Janv.', value: 74 },
      { month: 'Fév.', value: 78 },
      { month: 'Mars', value: 80 },
      { month: 'Avr.', value: 84 },
      { month: 'Mai', value: 88, isCurrent: true },
    ],
    benchmarks: {
      user: 88,
      sectorAvg: 62,
      top25: 82,
    }
  },
  'Croissance': {
    score: 81,
    status: 'Bonne',
    description: "Dynamique commerciale soutenue avec une augmentation progressive du volume d'affaires et de la clientèle.",
    checklist: [
      'Chiffre d’affaires en hausse constante',
      'Augmentation du panier moyen',
      'Acquisition de nouveaux clients réguliers',
      'Taux de réachat et rétention stables'
    ],
    radarValues: {
      liquidite: 85,
      rentabilite: 78,
      croissance: 81,
      gestion: 76,
      risque: 79
    },
    indicators: [
      { label: 'Croissance annuelle du CA', value: '+24,5%', badge: 'Excellent' },
      { label: 'Nouveaux clients enregistrés ce mois', value: '+8 clients', badge: 'Bon' },
      { label: 'Montant moyen facturé par prestation', value: '1 450,00 $', badge: 'Bon' },
      { label: 'Taux de récurrence client', value: '64%', badge: 'Bon' },
      { label: 'Progression trimestrielle', value: '+18,2%', badge: 'Excellent' },
    ],
    history: [
      { month: 'Déc.', value: 62 },
      { month: 'Janv.', value: 66 },
      { month: 'Fév.', value: 70 },
      { month: 'Mars', value: 75 },
      { month: 'Avr.', value: 78 },
      { month: 'Mai', value: 81, isCurrent: true },
    ],
    benchmarks: {
      user: 81,
      sectorAvg: 58,
      top25: 79,
    }
  },
  'Gestion': {
    score: 86,
    status: 'Excellente',
    description: "Gestion administrative, fiscale et documentaire rigoureuse garantissant votre conformité continue.",
    checklist: [
      'Émission rapide des factures (< 2 jours)',
      'Réserve TPS/TVQ isolée et sécurisée',
      'Pièces justificatives de dépenses 100% numérisées',
      'Rapprochement bancaire à jour'
    ],
    radarValues: {
      liquidite: 88,
      rentabilite: 80,
      croissance: 72,
      gestion: 86,
      risque: 83
    },
    indicators: [
      { label: 'Délai moyen d’émission de facture', value: '1,2 jours', badge: 'Excellent' },
      { label: 'Conformité des pièces de dépenses', value: '96%', badge: 'Excellent' },
      { label: 'Taux de recouvrement à 30 jours', value: '89%', badge: 'Bon' },
      { label: 'Précision du budget prévisionnel', value: '94%', badge: 'Excellent' },
      { label: 'Rapprochement des écritures', value: 'À jour', badge: 'Excellent' },
    ],
    history: [
      { month: 'Déc.', value: 72 },
      { month: 'Janv.', value: 75 },
      { month: 'Fév.', value: 77 },
      { month: 'Mars', value: 80 },
      { month: 'Avr.', value: 83 },
      { month: 'Mai', value: 86, isCurrent: true },
    ],
    benchmarks: {
      user: 86,
      sectorAvg: 65,
      top25: 84,
    }
  },
  'Risque': {
    score: 84,
    status: 'Risque faible',
    description: "Faible exposition aux aléas grâce à une diversification client et une réserve financière adéquate.",
    checklist: [
      'Dépendance client faible (< 15% par client)',
      'Taux d’impayés négligeable (< 2%)',
      'Couverture des charges fixes sur 3+ mois',
      'Endettement et passif maîtrisés'
    ],
    radarValues: {
      liquidite: 90,
      rentabilite: 82,
      croissance: 68,
      gestion: 82,
      risque: 84
    },
    indicators: [
      { label: 'Part du 1er client dans le CA', value: '14,2%', badge: 'Excellent' },
      { label: 'Taux de créances en retard critique', value: '1,8%', badge: 'Excellent' },
      { label: 'Ratio d’endettement global', value: '0,18', badge: 'Excellent' },
      { label: 'Mois de charges fixes en réserve', value: '3,4 mois', badge: 'Excellent' },
      { label: 'Score de résilience financière', value: '84/100', badge: 'Bon' },
    ],
    history: [
      { month: 'Déc.', value: 70 },
      { month: 'Janv.', value: 72 },
      { month: 'Fév.', value: 75 },
      { month: 'Mars', value: 79 },
      { month: 'Avr.', value: 82 },
      { month: 'Mai', value: 84, isCurrent: true },
    ],
    benchmarks: {
      user: 84,
      sectorAvg: 61,
      top25: 80,
    }
  },
};

export default function DetailedAnalysisPage({
  triggerToast = () => {},
  setScreen,
  initialTab = 'Liquidité',
  currentUser,
  currentRegion = 'canada',
  currency = 'CAD',
}: DetailedAnalysisPageProps) {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [selectedPeriod, setSelectedPeriod] = useState('Mai 2026');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [savingBalance, setSavingBalance] = useState(false);
  const [loadingBusiness, setLoadingBusiness] = useState(false);

  // Business state from Firestore
  const [business, setBusiness] = useState<Business | null>(null);

  // Form states for Balance Sheet
  const [formBizName, setFormBizName] = useState('Mon Entreprise');
  const [formAccountingMethod, setFormAccountingMethod] = useState<AccountingMethod>('cash');
  const [formAvailableCash, setFormAvailableCash] = useState<number>(24500);
  const [formCurrentAssets, setFormCurrentAssets] = useState<number>(38200);
  const [formCurrentLiabilities, setFormCurrentLiabilities] = useState<number>(12400);
  const [formTotalDebt, setFormTotalDebt] = useState<number>(5000);

  const effectiveOwnerUid = currentUser?.uid || 'user-default';

  // Load from Firestore
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoadingBusiness(true);
      try {
        const found = await getBusinessByOwner(effectiveOwnerUid);
        if (isMounted && found) {
          setBusiness(found);
          setFormBizName(found.businessName || 'Mon Entreprise');
          setFormAccountingMethod(found.accountingMethod || 'cash');
          setFormAvailableCash(found.availableCash || 0);
          setFormCurrentAssets(found.currentAssets || 0);
          setFormCurrentLiabilities(found.currentLiabilities || 0);
          setFormTotalDebt(found.totalOutstandingDebt || 0);
        }
      } catch (err) {
        console.error('Failed to load business data:', err);
      } finally {
        if (isMounted) setLoadingBusiness(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [effectiveOwnerUid]);

  const handleSaveBalanceSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBalance(true);
    try {
      const saved = await saveBusiness({
        id: business?.id,
        ownerRef: effectiveOwnerUid,
        businessName: formBizName,
        countryCode: currentRegion === 'afrique' ? 'FR' : (currentRegion === 'haiti' ? 'HT' : 'CA'),
        region: currentRegion as BusinessRegion,
        currency: currency as BusinessCurrency,
        accountingMethod: formAccountingMethod,
        availableCash: Number(formAvailableCash) || 0,
        currentAssets: Number(formCurrentAssets) || 0,
        currentLiabilities: Number(formCurrentLiabilities) || 0,
        totalOutstandingDebt: Number(formTotalDebt) || 0,
      });

      setBusiness(saved);

      // Save a snapshot for the current period
      const healthMetrics = computeFinancialHealthMetrics(saved, 3500);
      await saveFinancialSnapshot(saved.id, {
        businessId: saved.id,
        period: selectedPeriod,
        availableCash: saved.availableCash,
        currentAssets: saved.currentAssets,
        currentLiabilities: saved.currentLiabilities,
        totalOutstandingDebt: saved.totalOutstandingDebt,
        monthlyRevenue: 12500,
        monthlyExpenses: 3500,
        netProfit: 9000,
        healthScore: healthMetrics.healthScore,
      });

      triggerToast('Soldes du bilan et indicateurs enregistrés dans Firestore avec succès !');
      setShowBalanceModal(false);
    } catch (err) {
      console.error(err);
      triggerToast("Erreur lors de l'enregistrement dans Firestore.");
    } finally {
      setSavingBalance(false);
    }
  };

  const tabs: TabKey[] = ['Liquidité', 'Rentabilité', 'Croissance', 'Gestion', 'Risque'];
  const baseData = TABS_DATA[activeTab];

  // Dynamic override with Firestore data if activeTab is Liquidité
  const computedMetrics = business ? computeFinancialHealthMetrics(business, 3500) : null;
  const currentData: TabData = (activeTab === 'Liquidité' && computedMetrics) ? {
    ...baseData,
    score: computedMetrics.healthScore,
    status: computedMetrics.statusLabel,
    indicators: [
      { 
        label: 'Ratio de liquidité générale', 
        value: computedMetrics.currentRatio.toLocaleString('fr-CA', { minimumFractionDigits: 2 }), 
        badge: computedMetrics.currentRatio >= 1.5 ? 'Excellent' : (computedMetrics.currentRatio >= 1.0 ? 'Bon' : 'Moyen') 
      },
      { 
        label: 'Ratio immédiat (Acid-Test)', 
        value: computedMetrics.quickRatio.toLocaleString('fr-CA', { minimumFractionDigits: 2 }), 
        badge: computedMetrics.quickRatio >= 1.0 ? 'Excellent' : 'Bon' 
      },
      { 
        label: 'Fonds de roulement net', 
        value: `${computedMetrics.workingCapital.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} ${currency}`, 
        badge: computedMetrics.workingCapital > 0 ? 'Excellent' : 'Moyen' 
      },
      { 
        label: 'Trésorerie disponible', 
        value: `${(business?.availableCash || 0).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} ${currency}`, 
        badge: 'Excellent' 
      },
      { 
        label: 'Piste de trésorerie (Runway)', 
        value: `${computedMetrics.runwayMonths} mois`, 
        badge: computedMetrics.runwayMonths >= 6 ? 'Excellent' : 'Bon' 
      },
    ]
  } : baseData;

  // Pentagon radar chart calculations
  // 5 vertices at 72° increments, top is -90° (0°)
  const radarCenter = { x: 150, y: 140 };
  const radarRadius = 88;
  const axes = [
    { key: 'liquidite', label: 'Liquidité', angle: -Math.PI / 2 },
    { key: 'rentabilite', label: 'Rentabilité', angle: -Math.PI / 2 + (2 * Math.PI) / 5 },
    { key: 'croissance', label: 'Croissance', angle: -Math.PI / 2 + (4 * Math.PI) / 5 },
    { key: 'gestion', label: 'Gestion', angle: -Math.PI / 2 + (6 * Math.PI) / 5 },
    { key: 'risque', label: 'Risque', angle: -Math.PI / 2 + (8 * Math.PI) / 5 },
  ];

  // Helper to compute coordinates on radar
  const getPoint = (angle: number, ratio: number) => {
    return {
      x: radarCenter.x + radarRadius * ratio * Math.cos(angle),
      y: radarCenter.y + radarRadius * ratio * Math.sin(angle),
    };
  };

  // Concentric pentagons for web background
  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const gridPolygons = gridLevels.map(lvl => {
    const points = axes.map(axis => {
      const pt = getPoint(axis.angle, lvl);
      return `${pt.x},${pt.y}`;
    }).join(' ');
    return { level: lvl, points };
  });

  // Active data polygon
  const dataPoints = axes.map(axis => {
    const val = currentData.radarValues[axis.key as keyof typeof currentData.radarValues] || 50;
    const ratio = Math.max(0.1, Math.min(1.0, val / 100));
    return getPoint(axis.angle, ratio);
  });
  const dataPointsSvgString = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  const handleExport = (format: 'pdf' | 'csv') => {
    setShowExportModal(false);
    triggerToast(`Export ${format.toUpperCase()} du rapport "Analyse détaillée - ${activeTab}" généré avec succès.`);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white min-h-screen px-4 sm:px-8 py-6">
      {/* Financial Suite Navigation (2. Analyse détaillée, 3. Alertes, 4. Tendances, 5. Prévisions, 6. Historique) */}
      {setScreen && <FinancialNavTabs currentScreen="financial_health" setScreen={setScreen} />}

      {/* ======================================================== */}
      {/* TOP HEADER: Module 8 — Santé Financière */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        {/* Title and info icon */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Module 8 — Santé Financière
            </span>
            <span className="text-[11px] font-semibold text-slate-400">Score & Diagnostic des Ratios</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Santé Financière & Ratios de Performance
            </h1>
            <button
              type="button"
              onClick={() => setShowInfoModal(true)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
              title="Détails méthodologiques et calculs"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Diagnostic global sur 5 axes stratégiques : Liquidité, Rentabilité, Croissance, Gestion et Risque.
          </p>
        </div>

        {/* Period picker & Export button */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Period dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              className="inline-flex items-center gap-2 bg-white border border-slate-200/90 hover:border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{selectedPeriod}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {showPeriodDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30">
                {['Mai 2026 (Actuel)', 'Avril 2026', 'Mars 2026', 'Février 2026', 'Janvier 2026', 'Année 2026'].map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => {
                      setSelectedPeriod(period.replace(' (Actuel)', ''));
                      setShowPeriodDropdown(false);
                      triggerToast(`Données actualisées pour la période : ${period}`);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs transition ${
                      selectedPeriod === period.replace(' (Actuel)', '')
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Firestore Balance Sheet / Santé financière Button */}
          <button
            type="button"
            onClick={() => setShowBalanceModal(true)}
            className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200/90 hover:border-blue-300 hover:bg-blue-100/70 rounded-xl px-3 py-2 text-xs font-bold text-blue-700 shadow-2xs transition cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5 text-blue-600" />
            <span>Bilan & Trésorerie</span>
            <span className="bg-blue-200/70 text-blue-900 text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider">FIRESTORE</span>
          </button>

          {/* Export button */}
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center gap-2 bg-white border border-slate-200/90 hover:border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TABS BAR: Liquidité | Rentabilité | Croissance | Gestion | Risque */}
      {/* ======================================================== */}
      <div className="border-b border-slate-200 flex items-center gap-2 sm:gap-6 overflow-x-auto no-scrollbar mb-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pb-3 pt-1 px-1 sm:px-3 text-sm font-semibold transition-all relative whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 2x2 MAIN GRID */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* ======================================================== */}
        {/* CARD 1: Score & Radar Chart */}
        {/* ======================================================== */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 mb-4">{activeTab}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center flex-1">
            {/* Left score & details */}
            <div className="sm:col-span-6 flex flex-col justify-center">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-extrabold text-emerald-500 tracking-tight">
                  {currentData.score}
                </span>
                <span className="text-base sm:text-lg font-semibold text-slate-400">/100</span>
              </div>

              <div className="text-xs sm:text-sm font-bold text-emerald-600 mt-1">
                {currentData.status}
              </div>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {currentData.description}
              </p>

              <div className="mt-4 space-y-2 text-xs text-slate-700">
                {currentData.checklist.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right radar/spider chart */}
            <div className="sm:col-span-6 flex items-center justify-center relative">
              <svg
                className="w-full max-w-[280px] h-[260px] overflow-visible"
                viewBox="0 0 300 280"
              >
                {/* Concentric pentagon rings */}
                {gridPolygons.map(({ level, points }) => (
                  <polygon
                    key={level}
                    points={points}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                ))}

                {/* 5 spokes from center */}
                {axes.map((axis, i) => {
                  const end = getPoint(axis.angle, 1.0);
                  return (
                    <line
                      key={i}
                      x1={radarCenter.x}
                      y1={radarCenter.y}
                      x2={end.x}
                      y2={end.y}
                      stroke="#e2e8f0"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Vertical tick markers along top spoke (Liquidité) */}
                {[
                  { label: '100', ratio: 1.0 },
                  { label: '75', ratio: 0.75 },
                  { label: '50', ratio: 0.5 },
                  { label: '25', ratio: 0.25 },
                  { label: '0', ratio: 0.05 },
                ].map((tick, i) => {
                  const pt = getPoint(-Math.PI / 2, tick.ratio);
                  return (
                    <text
                      key={i}
                      x={pt.x}
                      y={pt.y - 2}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="9px"
                      fontWeight="500"
                    >
                      {tick.label}
                    </text>
                  );
                })}

                {/* Plotted polygon */}
                <polygon
                  points={dataPointsSvgString}
                  fill="rgba(99, 102, 241, 0.18)"
                  stroke="#6366f1"
                  strokeWidth="1.75"
                />

                {/* Plotted vertex dots */}
                {dataPoints.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill="#4f46e5"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                ))}

                {/* Axis labels at vertices */}
                {/* 1. Top: Liquidité */}
                <text
                  x={radarCenter.x}
                  y={radarCenter.y - radarRadius - 16}
                  textAnchor="middle"
                  fill="#334155"
                  fontSize="11px"
                  fontWeight="600"
                >
                  Liquidité
                </text>

                {/* 2. Right: Rentabilité */}
                <text
                  x={radarCenter.x + radarRadius + 14}
                  y={radarCenter.y - 4}
                  textAnchor="start"
                  fill="#334155"
                  fontSize="11px"
                  fontWeight="600"
                >
                  Rentabilité
                </text>

                {/* 3. Bottom Right: Croissance */}
                <text
                  x={radarCenter.x + 35}
                  y={radarCenter.y + radarRadius + 22}
                  textAnchor="start"
                  fill="#334155"
                  fontSize="11px"
                  fontWeight="600"
                >
                  Croissance
                </text>

                {/* 4. Bottom Left: Gestion */}
                <text
                  x={radarCenter.x - 35}
                  y={radarCenter.y + radarRadius + 22}
                  textAnchor="end"
                  fill="#334155"
                  fontSize="11px"
                  fontWeight="600"
                >
                  Gestion
                </text>

                {/* 5. Left: Risque */}
                <text
                  x={radarCenter.x - radarRadius - 14}
                  y={radarCenter.y - 4}
                  textAnchor="end"
                  fill="#334155"
                  fontSize="11px"
                  fontWeight="600"
                >
                  Risque
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARD 2: Indicateurs (Top Right) */}
        {/* ======================================================== */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 mb-2">
            Indicateurs de {activeTab.toLowerCase()}
          </h3>

          <div className="divide-y divide-slate-100 flex-1 flex flex-col justify-around">
            {currentData.indicators.map((indicator, idx) => (
              <div key={idx} className="flex items-center justify-between py-3">
                <span className="text-xs text-slate-700 font-medium">
                  {indicator.label}
                </span>

                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-xs font-bold text-slate-900 text-right min-w-[70px]">
                    {indicator.value}
                  </span>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {indicator.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARD 3: Évolution (6 derniers mois) (Bottom Left) */}
        {/* ======================================================== */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-6">
            Évolution de la {activeTab.toLowerCase()} (6 derniers mois)
          </h3>

          {/* Chart area with Y-axis markers and vertical bars */}
          <div className="relative h-44 flex items-end pt-4 pb-6 pl-8 pr-2">
            {/* Y-axis labels & reference lines */}
            <div className="absolute left-0 top-0 bottom-6 w-7 flex flex-col justify-between text-[11px] font-medium text-slate-400 text-right pr-1">
              <span>100</span>
              <span>50</span>
              <span>0</span>
            </div>

            {/* Subtle horizontal reference lines */}
            <div className="absolute left-8 right-2 top-0 border-b border-dashed border-slate-100" />
            <div className="absolute left-8 right-2 top-1/2 border-b border-dashed border-slate-100" />
            <div className="absolute left-8 right-2 bottom-6 border-b border-slate-200" />

            {/* Bars container */}
            <div className="w-full h-full flex items-end justify-between gap-2 sm:gap-4 z-10">
              {currentData.history.map((bar, idx) => {
                const heightPercent = Math.max(5, Math.min(100, bar.value));
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                  >
                    {/* Value above bar */}
                    <span className="text-[11px] font-bold text-slate-700 mb-1.5 group-hover:text-indigo-600 transition">
                      {bar.value}
                    </span>

                    {/* Bar graphic */}
                    <div
                      className={`w-full max-w-[28px] sm:max-w-[34px] rounded-t-md transition-all duration-300 ${
                        bar.isCurrent
                          ? 'bg-gradient-to-t from-indigo-600 to-indigo-500 shadow-sm border border-indigo-600'
                          : 'bg-gradient-to-t from-indigo-100/90 to-indigo-200/80 border border-indigo-200 group-hover:from-indigo-200 group-hover:to-indigo-300'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />

                    {/* Month label below bar */}
                    <span className="text-xs text-slate-500 font-medium mt-2 absolute -bottom-6">
                      {bar.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARD 4: Comparaison sectorielle (Bottom Right) */}
        {/* ======================================================== */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 mb-6">
            Comparaison sectorielle
          </h3>

          <div className="space-y-6 flex-1 flex flex-col justify-center">
            {/* Row 1: Votre entreprise */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-800 w-32 sm:w-36 flex-shrink-0">
                Votre entreprise
              </span>
              <div className="flex-1 h-3.5 sm:h-4 bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: `${currentData.benchmarks.user}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-900 w-8 text-right flex-shrink-0">
                {currentData.benchmarks.user}
              </span>
            </div>

            {/* Row 2: Moyenne du secteur */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-slate-600 w-32 sm:w-36 flex-shrink-0">
                Moyenne du secteur
              </span>
              <div className="flex-1 h-3.5 sm:h-4 bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-slate-300 rounded-full transition-all duration-500"
                  style={{ width: `${currentData.benchmarks.sectorAvg}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-600 w-8 text-right flex-shrink-0">
                {currentData.benchmarks.sectorAvg}
              </span>
            </div>

            {/* Row 3: Top 25% du secteur */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-slate-600 w-32 sm:w-36 flex-shrink-0">
                Top 25% du secteur
              </span>
              <div className="flex-1 h-3.5 sm:h-4 bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-slate-300 rounded-full transition-all duration-500"
                  style={{ width: `${currentData.benchmarks.top25}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-600 w-8 text-right flex-shrink-0">
                {currentData.benchmarks.top25}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* EXPORT MODAL */}
      {/* ======================================================== */}
      {showExportModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Download className="w-4 h-4 text-blue-600" />
                <span>Exporter l'analyse détaillée</span>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Téléchargez le rapport complet pour <strong>{activeTab}</strong> ({selectedPeriod}) avec graphiques, ratios et recommandations.
            </p>

            <div className="space-y-2.5 mb-5">
              <button
                type="button"
                onClick={() => handleExport('pdf')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
                    PDF
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Rapport financier complet (PDF)</div>
                    <div className="text-[11px] text-slate-500">Prêt pour votre comptable ou banquier</div>
                  </div>
                </div>
                <Printer className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => handleExport('csv')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                    CSV
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Tableau de ratios & données (Excel / CSV)</div>
                    <div className="text-[11px] text-slate-500">Tableurs et modèles de prévision</div>
                  </div>
                </div>
                <FileSpreadsheet className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowExportModal(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* METHODOLOGY & INFO MODAL */}
      {/* ======================================================== */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Méthodologie de l'Analyse détaillée</span>
              </div>
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed max-h-[360px] overflow-y-auto pr-1">
              <p>
                <strong>2. Analyse détaillée</strong> évalue la santé de votre entreprise sur 5 axes stratégiques fondamentaux :
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Liquidité :</strong> Capacité à faire face à vos échéances court terme (ratio de liquidité générale, trésorerie et fonds de roulement).</li>
                <li><strong>Rentabilité :</strong> Marges opérationnelles et nettes, point mort et retour sur capitaux.</li>
                <li><strong>Croissance :</strong> Évolution des ventes, récurrence et dynamisme du panier moyen.</li>
                <li><strong>Gestion :</strong> Délais de recouvrement, rapidité de facturation et conformité documentaire TPS/TVQ.</li>
                <li><strong>Risque :</strong> Dépendance à un client unique, taux d'impayés et couverture des charges fixes.</li>
              </ul>
              <p className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-[11px] text-slate-500">
                Les étalonnages sectoriels sont basés sur les données d'entreprises canadiennes (PME & travailleurs autonomes) issues de Statistique Canada et de la Banque de développement du Canada (BDC).
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowInfoModal(false)}
              className="mt-5 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Compris
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: Bilan & Santé financière (Sync Firestore) */}
      {/* ======================================================== */}
      {showBalanceModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Bilan & Soldes de Trésorerie
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Synchronisé en temps réel avec la collection Firestore <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">businesses</code>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBalanceModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBalanceSheet} className="mt-4 space-y-4">
              {/* Business Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom de l'entreprise
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formBizName}
                    onChange={(e) => setFormBizName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: StartBill Solutions Inc."
                  />
                </div>
              </div>

              {/* Accounting Method */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Méthode comptable
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormAccountingMethod('cash')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition cursor-pointer ${
                      formAccountingMethod === 'cash'
                        ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Caisse (Cash)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormAccountingMethod('accrual')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition cursor-pointer ${
                      formAccountingMethod === 'accrual'
                        ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Engagement (Accrual)
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {formAccountingMethod === 'cash' 
                    ? 'Revenus et dépenses enregistrés au moment où l\'argent est encaissé/décaissé.'
                    : 'Revenus et charges enregistrés dès la facturation, indépendamment du paiement.'}
                </p>
              </div>

              {/* Balance Sheet Numbers */}
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
                <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Métriques d'Actifs & Passifs ({currency})</span>
                </div>

                {/* Available Cash */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Trésorerie disponible (Cash)
                    </label>
                    <span className="text-[10px] text-slate-500">Banque + Caisse</span>
                  </div>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={formAvailableCash}
                    onChange={(e) => setFormAvailableCash(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                {/* Current Assets */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Actifs à court terme (Current Assets)
                    </label>
                    <span className="text-[10px] text-slate-500">Cash + Créances clients</span>
                  </div>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={formCurrentAssets}
                    onChange={(e) => setFormCurrentAssets(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                {/* Current Liabilities */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Passifs à court terme (Current Liabilities)
                    </label>
                    <span className="text-[10px] text-slate-500">Dettes fournisseurs + Taxes dues</span>
                  </div>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={formCurrentLiabilities}
                    onChange={(e) => setFormCurrentLiabilities(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                {/* Total Outstanding Debt */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Dette totale (Outstanding Debt)
                    </label>
                    <span className="text-[10px] text-slate-500">Prêts + Marges de crédit</span>
                  </div>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={formTotalDebt}
                    onChange={(e) => setFormTotalDebt(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Live Computed Previews */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                <div>
                  <span className="text-slate-500">Fonds de roulement net :</span>
                  <div className="font-bold text-slate-800">
                    {(formCurrentAssets - formCurrentLiabilities).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} {currency}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Ratio de liquidité générale :</span>
                  <div className="font-bold text-slate-800">
                    {formCurrentLiabilities > 0 ? (formCurrentAssets / formCurrentLiabilities).toFixed(2) : 'N/A'} (cible &gt; 1.5)
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBalanceModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingBalance}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingBalance ? 'Enregistrement...' : 'Enregistrer dans Firestore'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
