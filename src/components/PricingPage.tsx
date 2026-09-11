import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Globe,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { useRegional } from '../context/RegionalContext';
import { ScreenId } from '../types';
import { REGIONS } from '../data/regions';

interface PricingPageProps {
  onSelectPlan?: (planId: 'free' | 'start' | 'pro') => void;
  setScreen?: (screen: ScreenId) => void;
  currentPlan?: 'free' | 'start' | 'pro';
}

export const PricingPage: React.FC<PricingPageProps> = ({
  onSelectPlan,
  setScreen,
  currentPlan = 'free'
}) => {
  const { 
    pricingStart, 
    pricingPro, 
    currencySymbol, 
    currency, 
    region, 
    regionalSettings,
    formatPrice 
  } = useRegional();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [activePlan, setActivePlan] = useState<'free' | 'start' | 'pro'>(currentPlan);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const regionConfig = REGIONS[region];
  const isAnnual = billingCycle === 'annual';
  const discountMultiplier = isAnnual ? 0.8 : 1.0;

  // Regional Pricing Logic according to specification
  const getPricing = () => {
    const pricingMap: Record<string, { start: number; pro: number; currency: string }> = {
      canada: { start: 15, pro: 30, currency: 'CAD' },
      afrique: { start: 1500, pro: 3000, currency: 'FCFA' },
      haiti: { start: 150, pro: 300, currency: 'HTG' }
    };
    
    return pricingMap[region] || { 
      start: pricingStart || 15, 
      pro: pricingPro || 30, 
      currency: currencySymbol || 'CAD' 
    };
  };

  const currentPricing = getPricing();
  const startMonthlyPrice = Math.round(currentPricing.start * discountMultiplier);
  const proMonthlyPrice = Math.round(currentPricing.pro * discountMultiplier);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleChoosePlan = (planId: 'free' | 'start' | 'pro', planName: string) => {
    setActivePlan(planId);
    if (onSelectPlan) {
      onSelectPlan(planId);
    }
    triggerToast(`Félicitations ! Vous êtes inscrit au plan ${planName}.`);
  };

  const plans = [
    {
      id: 'free' as const,
      name: 'Gratuit',
      badge: 'Pour démarrer',
      popular: false,
      price: 0,
      currencyDisplay: currentPricing.currency,
      period: '/ mois',
      description: 'Découverte pour les travailleurs autonomes.',
      features: [
        { label: 'Factures', value: '5 factures', included: true },
        { label: 'Clients', value: 'Illimité', included: true },
        { label: 'Paiements', value: 'Manuel (cash)', included: true },
        { label: 'Téléchargement PDF', value: 'Non disponible', included: false },
        { label: 'Rappels WhatsApp / SMS', value: 'Non disponible', included: false },
        { label: 'Alertes fiscales & impôts', value: 'Non disponible', included: false },
        { label: 'Analyses financières', value: 'Non disponible', included: false },
        { label: 'Coaching & Conseils', value: 'Non disponible', included: false },
        { label: 'Exports comptables', value: 'Non disponible', included: false },
      ],
      buttonText: activePlan === 'free' ? 'Plan Actuel' : 'Utiliser Gratuitement',
      buttonVariant: 'secondary'
    },
    {
      id: 'start' as const,
      name: 'Start',
      badge: 'Le plus populaire 🔥',
      popular: true,
      price: startMonthlyPrice,
      currencyDisplay: currentPricing.currency,
      period: '/ mois',
      description: 'L’essentiel pour facturer efficacement.',
      features: [
        { label: 'Factures', value: 'Illimité', included: true },
        { label: 'Clients', value: 'Illimité', included: true },
        { label: 'Paiements', value: 'Manuel + Mobile Money', included: true },
        { label: 'Téléchargement PDF', value: 'Disponible', included: true },
        { label: 'Rappels WhatsApp / SMS', value: 'Disponible', included: true },
        { label: 'Alertes fiscales & impôts', value: 'Non disponible', included: false },
        { label: 'Analyses financières', value: 'Non disponible', included: false },
        { label: 'Coaching & Conseils', value: 'Non disponible', included: false },
        { label: 'Exports comptables', value: 'Non disponible', included: false },
      ],
      buttonText: activePlan === 'start' ? 'Plan Actuel' : 'Essayer Start (14j)',
      buttonVariant: 'primary'
    },
    {
      id: 'pro' as const,
      name: 'Pro',
      badge: 'Tout-en-un Pro',
      popular: false,
      price: proMonthlyPrice,
      currencyDisplay: currentPricing.currency,
      period: '/ mois',
      description: 'Solution complète avec alertes, analyses et coaching.',
      features: [
        { label: 'Factures', value: 'Illimité', included: true },
        { label: 'Clients', value: 'Illimité', included: true },
        { label: 'Paiements', value: 'Manuel + Mobile Money', included: true },
        { label: 'Téléchargement PDF', value: 'Disponible', included: true },
        { label: 'Rappels WhatsApp / SMS', value: 'Disponible', included: true },
        { label: 'Alertes fiscales & impôts', value: 'Disponible', included: true },
        { label: 'Analyses financières', value: 'Disponible', included: true },
        { label: 'Coaching & Conseils', value: 'Disponible', included: true },
        { label: 'Exports comptables', value: 'Disponible', included: true },
      ],
      buttonText: activePlan === 'pro' ? 'Plan Actuel' : 'Passer au plan Pro',
      buttonVariant: 'dark'
    }
  ];

  const faqs = [
    {
      question: 'Puis-je changer de plan ou résilier à tout moment ?',
      answer: 'Oui, sans engagement. Vous pouvez passer à un plan supérieur ou rétrograder à tout moment depuis votre tableau de bord. La modification prend effet immédiatement.'
    },
    {
      question: 'Comment la devise est-elle adaptée à ma région ?',
      answer: `StartBill détecte automatiquement votre région (${regionConfig.name}). Les tarifs s’affichent directement en ${currency} (${currencySymbol}) pour vous offrir une transparence totale sans frais de conversion.`
    },
    {
      question: 'Quels sont les modes de paiement acceptés pour l’abonnement ?',
      answer: regionalSettings.platformPriority === 'mobile_first' 
        ? 'Nous acceptons Mobile Money (Orange Money, Wave, MTN, MonCash) ainsi que les cartes bancaires et espèces selon la région.'
        : 'Nous acceptons les cartes de crédit (Visa, MasterCard, Amex) ainsi que les prélèvements et virements bancaires.'
    },
    {
      question: 'Y a-t-il une période d’essai sans risque ?',
      answer: 'Absolument ! Les plans Start et Pro incluent 14 jours d’essai gratuit sans carte de crédit requise. Vous ne payez que si vous décidez de continuer.'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-950 text-emerald-100 border border-emerald-700/60 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Tarification transparente & sans frais cachés</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Des forfaits simples adaptés à votre croissance
        </h1>

        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed font-medium">
          Que vous soyez travailleur autonome ou une PME en pleine expansion, choisissez le plan parfaitement calibré pour votre région.
        </p>

        {/* Region Indicator Chip */}
        <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-500 font-bold">
          <span className="flex items-center gap-1 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl text-slate-700">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            Région : {regionConfig.flag} <strong>{regionConfig.name}</strong> ({currency})
          </span>
          {setScreen && (
            <button 
              onClick={() => setScreen('choose_region')}
              className="text-blue-600 hover:underline text-xs font-bold"
            >
              Changer
            </button>
          )}
        </div>

        {/* Billing Cycle Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <span className={`text-xs font-bold transition ${!isAnnual ? 'text-slate-900 font-black' : 'text-slate-500'}`}>
            Facturation Mensuelle
          </span>

          <button
            onClick={() => setBillingCycle(isAnnual ? 'monthly' : 'annual')}
            className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer ${
              isAnnual ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                isAnnual ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>

          <span className={`text-xs font-bold flex items-center gap-1.5 transition ${isAnnual ? 'text-slate-900 font-black' : 'text-slate-500'}`}>
            <span>Facturation Annuelle</span>
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full">
              -20% Réduction
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan) => {
          const isSelected = activePlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 bg-white ${
                plan.popular
                  ? 'border-2 border-blue-600 shadow-xl ring-4 ring-blue-500/10'
                  : 'border border-slate-200 shadow-sm hover:border-slate-300'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-black text-[11px] px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  {plan.badge}
                </div>
              )}

              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">{plan.description}</p>
                  </div>
                  {!plan.popular && (
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                      {plan.badge}
                    </span>
                  )}
                </div>

                {/* Price Display */}
                <div className="py-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900">
                      {plan.price === 0 ? '0' : plan.price.toLocaleString('fr-FR')}
                    </span>
                    <span className="text-lg font-black text-blue-600">
                      {plan.currencyDisplay}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {plan.period}
                    </span>
                  </div>
                  {isAnnual && plan.price > 0 && (
                    <div className="text-[11px] text-emerald-600 font-bold mt-1">
                      Facturé annuellement ({(plan.price * 12).toLocaleString('fr-FR')} {plan.currencyDisplay}/an)
                    </div>
                  )}
                </div>

                {/* Features Checklist */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                    Matrice des fonctionnalités :
                  </div>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                      <span className="text-slate-600 font-medium">{feat.label}</span>
                      <div className="flex items-center gap-1.5 font-bold">
                        {feat.included ? (
                          <>
                            <span className="text-slate-900">{feat.value}</span>
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          </>
                        ) : (
                          <>
                            <span className="text-slate-400">{feat.value}</span>
                            <X className="w-4 h-4 text-slate-300 shrink-0" />
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-6 mt-6 border-t border-slate-100">
                <button
                  onClick={() => handleChoosePlan(plan.id, plan.name)}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md'
                      : plan.buttonVariant === 'primary'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                      : plan.buttonVariant === 'dark'
                      ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>{plan.buttonText}</span>
                    </>
                  ) : (
                    <>
                      <span>{plan.buttonText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Highlights */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">Pourquoi StartBill Pro ?</div>
            <h3 className="text-xl font-black text-white mt-1">Conformité fiscale & Automatisation Totale</h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold bg-slate-800 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Garantie 100% Satisfait ou Remboursé</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <div className="text-emerald-400 font-extrabold text-sm flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Relances WhatsApp & SMS
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Réduisez vos retards de paiement jusqu’à 70% grâce aux rappels automatisés adaptés à l’Afrique et Haïti.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="text-blue-400 font-extrabold text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Rapport TPS/TVQ (Canada)
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Calcul précis et déclaration simplifiée pour les rapports trimestriels Revenu Québec / ARC sans casse-tête.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="text-purple-400 font-extrabold text-sm flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" /> Paiements Mobile Money
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Proposez Orange Money, Wave, MTN et MonCash directement sur vos factures avec validation instantanée.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-1">
          <h3 className="text-xl font-black text-slate-900">Questions fréquentes (FAQ)</h3>
          <p className="text-xs text-slate-500 font-medium">Tout ce que vous devez savoir avant de choisir votre plan</p>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-xl overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-4 py-3.5 text-left text-xs font-black text-slate-900 bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-3 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{faq.question}</span>
                  </span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>
                {isOpen && (
                  <div className="px-4 py-3 text-xs text-slate-600 bg-white border-t border-slate-100 font-medium leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
