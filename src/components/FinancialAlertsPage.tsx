import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Info,
  ChevronRight,
  ArrowRight,
  X,
  Send,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { ScreenId } from '../types';
import FinancialNavTabs from './FinancialNavTabs';

interface FinancialAlertsPageProps {
  setScreen: (screen: ScreenId) => void;
  triggerToast?: (msg: string) => void;
}

type FilterType = 'Tous' | 'Critique' | 'Importante' | 'À surveiller' | 'Résolue';

interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: 'Critique' | 'Importante' | 'À surveiller' | 'Résolue';
  type: 'invoice' | 'expense' | 'cashflow' | 'payment_delay' | 'tax';
  amount?: string;
  dueDate?: string;
  recommendedAction: string;
  impact: string;
}

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'alt-1',
    title: 'Factures en retard',
    description: '3 factures sont en retard de plus de 30 jours pour un montant total de 2 450,00 $.',
    severity: 'Critique',
    type: 'invoice',
    amount: '2 450,00 $',
    dueDate: 'Échéance dépassée (> 30 j)',
    recommendedAction: 'Envoyer une relance par courriel avec lien de paiement Interac en 1 clic.',
    impact: 'Ralentit le fonds de roulement et fragilise le cash flow du mois en cours.'
  },
  {
    id: 'alt-2',
    title: 'Dépenses Marketing en hausse',
    description: 'Vos dépenses Marketing ont augmenté de 35% ce mois-ci (1 250,00 $).',
    severity: 'Importante',
    type: 'expense',
    amount: '1 250,00 $',
    dueDate: 'Mois en cours',
    recommendedAction: 'Vérifier le ROI des campagnes en cours et plafonner les abonnements SaaS publicitaires.',
    impact: 'Rétrécit la marge nette si les nouvelles conversions ne suivent pas sous 14 jours.'
  },
  {
    id: 'alt-3',
    title: 'Trésorerie faible prévue',
    description: 'Votre trésorerie pourrait devenir faible dans 18 jours si rien ne change.',
    severity: 'Importante',
    type: 'cashflow',
    amount: '18 jours restants',
    dueDate: 'Point bas : fin de mois',
    recommendedAction: 'Accélérer les encaissements ou différer les dépenses non urgentes de 2 semaines.',
    impact: 'Risque de solde négatif lors du prélèvement des taxes provinciales/fédérales.'
  },
  {
    id: 'alt-4',
    title: 'Délai de paiement clients',
    description: 'Votre délai moyen de paiement client est de 18 jours. Continuez comme ça !',
    severity: 'À surveiller',
    type: 'payment_delay',
    amount: '18 jours (excellent)',
    dueDate: 'Indicateur mensuel',
    recommendedAction: 'Maintenir la politique d’escompte ou les rappels automatiques à J+7.',
    impact: 'Performant : supérieur de 6 jours à la moyenne de votre secteur (24 j).'
  },
  {
    id: 'alt-5',
    title: 'Conformité fiscale',
    description: 'Aucun problème fiscal détecté. Bravo !',
    severity: 'Résolue',
    type: 'tax',
    amount: 'TPS/TVQ à jour',
    dueDate: 'Déclaration trimestrielle',
    recommendedAction: 'Les réserves de taxes automatiques sont conformes aux déclarations prévues.',
    impact: 'Risque de pénalités Revenu Québec / ARC nul pour ce cycle.'
  }
];

export default function FinancialAlertsPage({ setScreen, triggerToast }: FinancialAlertsPageProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('Tous');
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);

  const filterCounts = {
    Tous: alerts.length,
    Critique: alerts.filter(a => a.severity === 'Critique').length,
    Importante: alerts.filter(a => a.severity === 'Importante').length,
    'À surveiller': alerts.filter(a => a.severity === 'À surveiller').length,
    Résolue: alerts.filter(a => a.severity === 'Résolue').length,
  };

  const filteredAlerts = alerts.filter(a => {
    if (selectedFilter === 'Tous') return true;
    return a.severity === selectedFilter;
  });

  const getSeverityBadge = (severity: AlertItem['severity']) => {
    switch (severity) {
      case 'Critique':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
            Critique
          </span>
        );
      case 'Importante':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
            Importante
          </span>
        );
      case 'À surveiller':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            À surveiller
          </span>
        );
      case 'Résolue':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Résolue
          </span>
        );
    }
  };

  const getAlertIcon = (severity: AlertItem['severity'], type: AlertItem['type']) => {
    switch (severity) {
      case 'Critique':
        return (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-rose-200 bg-rose-50 text-rose-600">
            <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
          </div>
        );
      case 'Importante':
        return (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-amber-200 bg-amber-50 text-amber-600">
            {type === 'cashflow' ? (
              <Clock className="w-5 h-5 stroke-[2.2]" />
            ) : (
              <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
            )}
          </div>
        );
      case 'À surveiller':
        return (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-blue-200 bg-blue-50 text-blue-600">
            <Info className="w-5 h-5 stroke-[2.2]" />
          </div>
        );
      case 'Résolue':
        return (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-emerald-200 bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
          </div>
        );
    }
  };

  const handleResolveAlert = (id: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === id ? { ...a, severity: 'Résolue' } : a))
    );
    setSelectedAlert(null);
    triggerToast?.('Alerte marquée comme résolue.');
  };

  return (
    <div className="space-y-4 font-sans text-slate-800 pb-8">
      {/* Navigation tabs between 2, 3, 4, 5, 6 */}
      <FinancialNavTabs currentScreen="financial_alerts" setScreen={setScreen} />

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6">
        {/* Header with Title and Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              3. Alertes financières
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
                  <p className="font-semibold text-slate-100 mb-1">Moteur d'alerte proactive :</p>
                  Scanne automatiquement vos factures échues, les variations de dépenses, les creux prévisionnels de trésorerie et la régularité fiscale.
                </div>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => setSelectedFilter('Tous')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedFilter === 'Tous'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tous ({filterCounts.Tous})
            </button>

            <button
              type="button"
              onClick={() => setSelectedFilter('Critique')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedFilter === 'Critique'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Critiques ({filterCounts.Critique})
            </button>

            <button
              type="button"
              onClick={() => setSelectedFilter('Importante')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedFilter === 'Importante'
                  ? 'bg-orange-100 text-orange-800 border border-orange-200 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Importantes ({filterCounts.Importante})
            </button>

            <button
              type="button"
              onClick={() => setSelectedFilter('À surveiller')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedFilter === 'À surveiller'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              À surveiller ({filterCounts['À surveiller']})
            </button>

            <button
              type="button"
              onClick={() => setSelectedFilter('Résolue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedFilter === 'Résolue'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Résolues
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="divide-y divide-slate-100">
          {filteredAlerts.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Aucune alerte dans cette catégorie.
            </div>
          ) : (
            filteredAlerts.map(alert => (
              <div
                key={alert.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {getAlertIcon(alert.severity, alert.type)}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {alert.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {alert.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0 pl-13 sm:pl-0">
                  {getSeverityBadge(alert.severity)}
                  <button
                    type="button"
                    onClick={() => setSelectedAlert(alert)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer whitespace-nowrap"
                  >
                    <span>Voir détails</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Link: Voir toutes les alertes */}
        <div className="pt-6 pb-2 text-center border-t border-slate-100 mt-2">
          <button
            type="button"
            onClick={() => {
              setSelectedFilter('Tous');
              triggerToast?.('Affichage de la liste complète des alertes.');
            }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          >
            <span>Voir toutes les alertes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alert Details Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setSelectedAlert(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              {getAlertIcon(selectedAlert.severity, selectedAlert.type)}
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedAlert.title}</h3>
                <div className="mt-1">{getSeverityBadge(selectedAlert.severity)}</div>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-5">
              <div>
                <span className="font-semibold text-slate-800">Situation : </span>
                {selectedAlert.description}
              </div>
              <div>
                <span className="font-semibold text-slate-800">Impact estimé : </span>
                {selectedAlert.impact}
              </div>
              <div className="pt-2 border-t border-slate-200/80">
                <span className="font-semibold text-blue-900 flex items-center gap-1 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Action recommandée :
                </span>
                <p className="text-slate-700 leading-relaxed font-medium bg-white p-2.5 rounded-lg border border-blue-100">
                  {selectedAlert.recommendedAction}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (selectedAlert.type === 'invoice') {
                    setScreen('invoices');
                  } else if (selectedAlert.type === 'expense') {
                    setScreen('expenses');
                  } else {
                    setScreen('financial_trends');
                  }
                  setSelectedAlert(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
              >
                {selectedAlert.type === 'invoice' && <Send className="w-3.5 h-3.5" />}
                {selectedAlert.type === 'expense' && <DollarSign className="w-3.5 h-3.5" />}
                <span>Résoudre maintenant</span>
              </button>

              {selectedAlert.severity !== 'Résolue' && (
                <button
                  type="button"
                  onClick={() => handleResolveAlert(selectedAlert.id)}
                  className="px-3.5 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-100 transition-colors"
                >
                  Marquer comme résolu
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
