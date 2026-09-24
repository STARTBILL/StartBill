import React from 'react';
import {
  Zap,
  FileText,
  PieChart,
  Percent,
  Calendar,
  ShieldCheck,
  Check,
  Lock,
  ArrowRight,
  Coins,
  MessageCircle,
  Lightbulb,
  Smartphone,
  TrendingUp,
  Globe,
  CheckCircle2,
  Wallet
} from 'lucide-react';
import { ScreenId } from '../types';
import { useRegionalContext } from '../context/RegionalContext';

interface WelcomeDashboardPageProps {
  setScreen: (screen: ScreenId) => void;
  triggerToast?: (msg: string) => void;
  invoices?: any[];
  expenses?: any[];
  clients?: any[];
}

export default function WelcomeDashboardPage({
  setScreen,
  triggerToast
}: WelcomeDashboardPageProps) {
  const { region: activeRegion, setRegion } = useRegionalContext();

  const handleStart = () => {
    if (triggerToast) {
      triggerToast('Bienvenue sur votre tableau de bord StartBill !');
    }
    setScreen('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 font-sans flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Region Switcher Bar (Quick preview toggle) */}
      <div className="w-full bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium hidden sm:inline">Région active :</span>
        <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
          <button
            type="button"
            onClick={() => setRegion('canada')}
            className={`px-3 py-1 rounded-full font-bold transition text-xs cursor-pointer ${
              activeRegion === 'canada'
                ? 'bg-red-50 text-red-700 border border-red-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            🇨🇦 Canada
          </button>
          <button
            type="button"
            onClick={() => setRegion('afrique')}
            className={`px-3 py-1 rounded-full font-bold transition text-xs cursor-pointer ${
              activeRegion === 'afrique'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            🌍 Afrique
          </button>
          <button
            type="button"
            onClick={() => setRegion('haiti')}
            className={`px-3 py-1 rounded-full font-bold transition text-xs cursor-pointer ${
              activeRegion === 'haiti'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            🇭🇹 Haïti
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col justify-start">
        
        {/* ======================================================== */}
        {/* 1. CANADA REGION VARIANT 🇨🇦                                */}
        {/* ======================================================== */}
        {activeRegion === 'canada' && (
          <div className="space-y-5 animate-fadeIn">
            
            {/* Header with Skyline & Title */}
            <div className="relative pt-2 pb-1 text-center">
              
              {/* Subtle Canadian City Skyline / CN Tower Background Illustration */}
              <div className="absolute inset-0 pointer-events-none opacity-25 flex items-center justify-between overflow-hidden">
                <svg className="w-24 h-24 -translate-x-3 -translate-y-2 text-blue-400 fill-current" viewBox="0 0 100 100">
                  <path d="M10 90 L10 40 L15 35 L20 40 L20 90 Z M25 90 L25 50 L35 50 L35 90 Z M40 90 L40 20 L42 10 L44 20 L44 90 Z M50 90 L50 60 L60 60 L60 90 Z" opacity="0.6" />
                </svg>
                <div className="flex flex-col items-end pr-1 opacity-70">
                  <div className="w-10 h-12 border border-blue-200 rounded-md bg-blue-50/50 flex flex-col items-center justify-center p-1 shadow-2xs">
                    <span className="text-[10px] font-black text-blue-400">$</span>
                    <div className="w-6 h-0.5 bg-blue-200 mt-1"></div>
                    <div className="w-4 h-0.5 bg-blue-200 mt-0.5"></div>
                  </div>
                </div>
              </div>

              {/* Header Title */}
              <div className="relative z-10 space-y-1">
                <p className="text-xs sm:text-sm font-semibold text-slate-700">
                  Bienvenue dans
                </p>
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-[#2A4BDE] tracking-tight">
                    StartBill
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-[#DC2626] flex items-center gap-1">
                    Canada <span className="text-xl">🍁</span>
                  </span>
                </div>
              </div>

              {/* Tagline */}
              <div className="relative z-10 mt-3 space-y-1.5">
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                  Ton assistant financier <br />
                  pour une tranquillité d’esprit toute l’année
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
                  StartBill t’aide à facturer, suivre tes paiements et préparer tes taxes automatiquement pour arriver serein à la période des impôts.
                </p>
              </div>
            </div>

            {/* Feature Items List (Canada - 5 Items) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              
              {/* Item 1: Facture en 1 minute */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2A4BDE] flex items-center justify-center shrink-0">
                  <div className="relative">
                    <FileText className="w-5 h-5" />
                    <Zap className="w-2.5 h-2.5 text-blue-600 fill-blue-600 absolute -top-1 -right-1" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Facture en 1 minute
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">
                    Crée et envoie tes factures rapidement et simplement.
                  </p>
                </div>
              </div>

              {/* Item 2: Suis tes revenus et dépenses */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2A4BDE] flex items-center justify-center shrink-0">
                  <PieChart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Suis tes revenus et dépenses
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">
                    Vois clairement la santé financière de ton entreprise.
                  </p>
                </div>
              </div>

              {/* Item 3: Taxes (TPS/TVQ) toujours sous contrôle */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2A4BDE] flex items-center justify-center shrink-0">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Taxes (TPS/TVQ) toujours sous contrôle
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">
                    Calculs automatiques et suivi en temps réel de tes taxes à remettre.
                  </p>
                </div>
              </div>

              {/* Item 4: Sache toujours combien mettre de côté */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2A4BDE] flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Sache toujours combien mettre de côté
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">
                    Estime automatiquement tes impôts et prépare-toi à l’avance.
                  </p>
                </div>
              </div>

              {/* Item 5: Rapports et documents prêts pour l'impôt */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2A4BDE] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Rapports et documents prêts pour l'impôt
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">
                    Génère facilement tes rapports et exporte tout ce dont tu as besoin.
                  </p>
                </div>
              </div>

            </div>

            {/* Bottom Highlight Box: Arrive serein à la période des impôts */}
            <div className="bg-[#F2F8F4] border border-[#D5EAD9] rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">
                    Arrive serein à la période des impôts
                  </h4>
                  <ul className="space-y-1 text-[11px] text-slate-700 font-medium">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      <span>Suis tes taxes en temps réel</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      <span>Sais exactement combien mettre de côté</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      <span>Évite les mauvaises surprises</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-[#D5EAD9]/80 flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Tes données sont sécurisées et 100 % confidentielles.</span>
              </div>
            </div>

            {/* Slogan */}
            <div className="text-center pt-1">
              <p className="text-xs sm:text-sm font-extrabold text-[#16A34A]">
                Moins de stress. Plus de clarté. Toujours prêt.
              </p>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* 2. AFRIQUE REGION VARIANT 🌍                                */}
        {/* ======================================================== */}
        {activeRegion === 'afrique' && (
          <div className="space-y-5 animate-fadeIn">
            
            {/* Header */}
            <div className="text-center pt-2 pb-1 space-y-1 relative">
              
              {/* Confetti particles */}
              <div className="absolute -top-1 left-4 w-2 h-2 rounded-full bg-yellow-400 opacity-60"></div>
              <div className="absolute top-2 right-6 w-2 h-2 rounded-full bg-blue-400 opacity-60"></div>
              <div className="absolute top-6 left-8 w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-60"></div>

              <p className="text-xs sm:text-sm font-semibold text-slate-700">
                Bienvenue dans
              </p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-[#2A4BDE] tracking-tight">
                  StartBill
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#16A34A] flex items-center gap-1">
                  Afrique <span className="text-xl">🌍</span>
                </span>
              </div>

              <div className="pt-2 space-y-1">
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                  Ton assistant financier <br />
                  pour développer ton business
                </h2>
                {/* Wavy line accent */}
                <div className="w-8 h-1 mx-auto text-blue-500 flex justify-center">
                  <svg className="w-8 h-2 text-blue-500 fill-none stroke-current stroke-2" viewBox="0 0 24 6">
                    <path d="M0 3 Q 6 0, 12 3 T 24 3" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Feature Items List (Afrique - 5 Items) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              
              {/* Item 1: Facture en 1 minute */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2A4BDE] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Facture en 1 minute
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">
                    Crée et envoie tes factures rapidement et simplement.
                  </p>
                </div>
              </div>

              {/* Item 2: Suivi des paiements */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2A4BDE] flex items-center justify-center shrink-0">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Suivi des paiements
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">
                    Suis tes paiements et tes dépenses en temps réel.
                  </p>
                </div>
              </div>

              {/* Item 3: Relances par WhatsApp & SMS */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2A4BDE] flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Relances par WhatsApp & SMS
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">
                    Relance facilement tes clients par WhatsApp ou SMS.
                  </p>
                </div>
              </div>

              {/* Item 4: Conseils pour mieux gérer ton argent */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2A4BDE] flex items-center justify-center shrink-0">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Conseils pour mieux gérer ton argent
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">
                    Reçois des conseils personnalisés pour faire grandir ton business.
                  </p>
                </div>
              </div>

              {/* Item 5: Des fonctionnalités adaptées à l'Afrique */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2A4BDE] flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Des fonctionnalités adaptées à l'Afrique
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">
                    Paiements Mobile Money, devises locales et bien plus encore.
                  </p>
                </div>
              </div>

            </div>

            {/* Bottom Assurance Box (Afrique) */}
            <div className="bg-[#F2F8F4] border border-[#D5EAD9] rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-slate-700 font-medium leading-snug">
                <strong className="text-slate-900 font-bold">StartBill est simple, rapide et sécurisé.</strong> Tes données sont protégées.
              </p>
            </div>

            {/* Slogan */}
            <div className="text-center pt-1 flex items-center justify-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#16A34A]" />
              <p className="text-xs sm:text-sm font-extrabold text-slate-900">
                Moins de stress. <span className="text-[#16A34A] underline decoration-emerald-500 decoration-2">Plus de croissance.</span>
              </p>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* 3. HAÏTI REGION VARIANT 🇭🇹                                 */}
        {/* ======================================================== */}
        {activeRegion === 'haiti' && (
          <div className="space-y-5 animate-fadeIn">
            
            {/* Header */}
            <div className="text-center pt-2 pb-1 space-y-1">
              <p className="text-xs sm:text-sm font-semibold text-slate-700">
                Bienvenue dans
              </p>
              <div className="flex flex-col items-center justify-center">
                <span className="text-2xl sm:text-3xl font-black text-[#16A34A] tracking-tight">
                  StartBill
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#16A34A] flex items-center gap-1.5">
                  Haïti <span className="text-xl">🇭🇹</span>
                </span>
              </div>

              <div className="pt-2 space-y-1">
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                  Ton assistant financier <br />
                  pour développer ton business
                </h2>
              </div>
            </div>

            {/* Feature Items List (Haïti - 5 Items) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              
              {/* Item 1: Facture en 1 minute */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2A4BDE] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Facture en 1 minute
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">
                    Crée et envoie tes factures rapidement et simplement.
                  </p>
                </div>
              </div>

              {/* Item 2: Suivi des paiements */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2A4BDE] flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Suivi des paiements
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">
                    Suis tes paiements et tes dépenses en temps réel.
                  </p>
                </div>
              </div>

              {/* Item 3: Relances par WhatsApp & SMS */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2A4BDE] flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Relances par WhatsApp & SMS
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">
                    Relance facilement tes clients par WhatsApp ou SMS.
                  </p>
                </div>
              </div>

              {/* Item 4: Conseils pour mieux gérer ton argent */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2A4BDE] flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Conseils pour mieux gérer ton argent
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">
                    Reçois des conseils personnalisés pour faire grandir ton business.
                  </p>
                </div>
              </div>

              {/* Item 5: Des fonctionnalités adaptées à Haïti */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2A4BDE] flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Des fonctionnalités adaptées à Haïti
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">
                    Paiements MonCash, HTG et USD et bien plus encore.
                  </p>
                </div>
              </div>

            </div>

            {/* Bottom Assurance Box (Haïti) */}
            <div className="bg-[#F2F8F4] border border-[#D5EAD9] rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-slate-700 font-medium leading-snug">
                <strong className="text-slate-900 font-bold">StartBill est simple, rapide et sécurisé.</strong> Tes données sont protégées.
              </p>
            </div>

          </div>
        )}

        {/* Primary Action Button (Commencer ->) */}
        <div className="max-w-md mx-auto w-full pt-6 pb-2">
          <button
            type="button"
            id="welcome-btn-commencer"
            onClick={handleStart}
            className="w-full bg-[#3855F6] hover:bg-[#2B46E5] active:scale-[0.99] text-white font-bold py-3.5 sm:py-4 px-6 rounded-2xl shadow-md transition-all duration-150 cursor-pointer text-sm sm:text-base flex items-center justify-center gap-2 group"
          >
            <span>Commencer</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>

    </div>
  );
}
