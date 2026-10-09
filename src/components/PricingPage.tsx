import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  Lock,
  ExternalLink,
  KeyRound,
  Info,
  Loader2
} from 'lucide-react';
import { useRegional } from '../context/RegionalContext';
import { useAuth } from '../context/AuthContext';
import { ScreenId } from '../types';
import { REGIONS } from '../data/regions';
import { getFreeTrialInfo } from '../lib/planAccess';
import { StartBillLogo } from './common/StartBillLogo';
import { startStripeCheckout, getStripeConfig, StripeConfigResponse } from '../lib/stripeService';

interface PricingPageProps {
  onSelectPlan?: (planId: 'free' | 'start' | 'pro') => void;
  setScreen?: (screen: ScreenId) => void;
  currentPlan?: 'free' | 'start' | 'pro';
}

export const PricingPage: React.FC<PricingPageProps> = ({
  onSelectPlan,
  setScreen,
  currentPlan
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

  const { userPlan, updateUserPlan, user } = useAuth();
  const effectiveCurrentPlan = (userPlan === 'enterprise' ? 'pro' : userPlan) || currentPlan || 'free';

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [activePlan, setActivePlan] = useState<'free' | 'start' | 'pro'>(effectiveCurrentPlan as any);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [stripeConfig, setStripeConfig] = useState<StripeConfigResponse | null>(null);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState<boolean>(false);
  const [showStripeSetupModal, setShowStripeSetupModal] = useState<boolean>(false);

  useEffect(() => {
    if (userPlan && userPlan !== 'enterprise') {
      setActivePlan(userPlan as any);
    }
  }, [userPlan]);

  // Load Stripe Restricted Key config status
  useEffect(() => {
    getStripeConfig().then(cfg => setStripeConfig(cfg)).catch(() => {});
  }, []);

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

  const handleChoosePlan = async (planId: 'free' | 'start' | 'pro', planName: string) => {
    if (planId === 'free') {
      setActivePlan('free');
      try {
        await updateUserPlan('free');
      } catch (e) {
        console.warn('Notice saving plan:', e);
      }
      if (onSelectPlan) onSelectPlan('free');
      triggerToast('Votre espace est désormais sur l’offre d’essai gratuit.');
      return;
    }

    // Paid Plan: Call Stripe Checkout with Restricted Key Access Policies
    setIsProcessingCheckout(true);
    triggerToast('Connexion à Stripe Checkout...');

    try {
      const res = await startStripeCheckout({
        planId,
        interval: isAnnual ? 'yearly' : 'monthly',
        userEmail: user?.email || '',
        userId: user?.uid || '',
        region,
      });

      if (res.success && res.url) {
        // Redirection handled by service
        return;
      }

      if (res.isMockMode) {
        setShowStripeSetupModal(true);
        setActivePlan(planId);
        await updateUserPlan(planId);
        if (onSelectPlan) onSelectPlan(planId);
      } else {
        triggerToast(res.error || 'Erreur lors de la redirection vers Stripe.');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      triggerToast('Erreur lors du traitement du paiement Stripe.');
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const trialInfo = getFreeTrialInfo(user?.createdAt);

  const plans = [
    {
      id: 'free' as const,
      name: 'Gratuit',
      badge: trialInfo.isActive ? `Essai 5 jours actif (${trialInfo.daysRemaining}j) 🎁` : '5 jours d’essai offerts 🎁',
      popular: false,
      price: 0,
      currencyDisplay: currentPricing.currency,
      period: '/ mois',
      description: 'Factures illimitées pendant 5 jours pour découvrir la plateforme.',
      features: [
        { label: 'Factures', value: 'Illimitées pendant 5 jours (puis 5)', included: true },
        { label: 'Période d\'essai', value: '5 jours complets offerts', included: true },
        { label: 'Clients', value: 'Illimité', included: true },
        { label: 'Paiements', value: 'Manuel (cash, virement)', included: true },
        { label: 'Téléchargement PDF', value: 'Disponible pendant l\'essai', included: true },
        { label: 'Rappels WhatsApp / SMS', value: 'Non disponible', included: false },
        { label: 'Alertes fiscales & impôts', value: 'Non disponible', included: false },
        { label: 'Analyses financières', value: 'Non disponible', included: false },
        { label: 'Coaching & Conseils', value: 'Non disponible', included: false },
        { label: 'Exports comptables', value: 'Non disponible', included: false },
      ],
      buttonText: activePlan === 'free' 
        ? (trialInfo.isActive ? `Plan Actuel (Essai ${trialInfo.daysRemaining}j)` : 'Plan Actuel') 
        : 'Commencer l’essai gratuit (5 jours)',
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
      <div className="text-center space-y-3 pt-4 flex flex-col items-center">
        <div className="mb-1">
          <StartBillLogo variant="horizontal" size="md" showTagline={true} />
        </div>

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

        {/* 5-Day Free Trial Notice Banner */}
        <div className="pt-2 max-w-xl mx-auto">
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-2xl p-3.5 text-center shadow-2xs">
            <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>🎁 Version Gratuite : Factures illimitées pendant 5 jours d'essai !</span>
            </span>
            <p className="text-[11px] text-emerald-700/90 mt-0.5 font-medium">
              Créez autant de factures que nécessaire pour tester StartBill en conditions réelles sans restriction.
            </p>
          </div>
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
                  disabled={isProcessingCheckout}
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
                  {isProcessingCheckout && plan.id !== 'free' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Connexion Stripe...</span>
                    </>
                  ) : isSelected ? (
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

      {/* Stripe Security & Access Policy Badge */}
      <div className="bg-slate-100/90 border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900">Paiements sécurisés via Stripe</span>
              <span className="text-[10px] bg-[#635BFF]/15 text-[#635BFF] font-extrabold px-2 py-0.5 rounded-full">
                {stripeConfig?.keyType === 'restricted' ? 'Clé Restreinte Active' : 'Stripe Access Policy Ready'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Chiffrement bancaire TLS 256 bits • Architecture sécurisée selon les Politiques d'Accès Restreintes Stripe.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowStripeSetupModal(true)}
          className="text-xs font-bold text-[#635BFF] hover:text-[#5046e5] flex items-center gap-1.5 underline decoration-[#635BFF]/30 underline-offset-4 cursor-pointer shrink-0"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Politiques d'Accès Stripe</span>
          <ExternalLink className="w-3 h-3" />
        </button>
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

      {/* Stripe Access Policies Security Modal */}
      {showStripeSetupModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center font-bold shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Politiques d'Accès Stripe (Access Policies)
                  </h3>
                  <span className="text-[10px] text-slate-500 font-semibold block">
                    Norme de sécurité : Principe du Moindre Privilège (PoLP)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStripeSetupModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  <span>Isolation Totale & Données Bancaires Protégées</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  StartBill SaaS n'enregistre jamais vos numéros de cartes de crédit. Les transactions sont exécutées via des sessions hébergées sur l'infrastructure PCI-DSS Niveau 1 de Stripe.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
                  Permissions de la Clé Restreinte (rk_...)
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Checkout Sessions (Écriture)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Customers (Écriture/Lecture)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Subscriptions (Abonnements)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Customer Portal (Facturation)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Invoices (Factures Stripe)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-100 flex items-center gap-2 font-bold text-rose-800">
                    <X className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Virements & Soldes (Bloqué)</span>
                  </div>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Statut : {stripeConfig?.keyType === 'restricted' ? 'Clé Restreinte Active' : 'Mode Sécurisé'}</span>
                <a
                  href="https://docs.stripe.com/keys#access-policies"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 font-bold inline-flex items-center gap-1 underline underline-offset-2"
                >
                  <span>Consulter la doc officielle</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowStripeSetupModal(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingPage;
