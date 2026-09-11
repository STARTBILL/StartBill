import React from 'react';
import {
  Zap,
  CreditCard,
  TrendingUp,
  ArrowRight,
  PlayCircle,
  Shield,
  Home,
  FileText,
  Users,
  GraduationCap,
  BarChart2,
  BarChart3,
  Settings,
  CheckCircle2,
  Receipt
} from 'lucide-react';
import { ScreenId } from '../types';

interface LandingPageProps {
  setScreen: (screen: ScreenId) => void;
  onSelectRegion?: (regionId: 'canada' | 'afrique' | 'haiti') => void;
  currentRegionId?: 'canada' | 'afrique' | 'haiti';
  triggerToast?: (msg: string) => void;
}

export default function LandingPage({
  setScreen,
  triggerToast
}: LandingPageProps) {
  const handleGetStarted = () => {
    if (triggerToast) {
      triggerToast('Bienvenue ! Choisissez votre pays ou région d\'activité');
    }
    setScreen('choose_region');
  };

  const handleDemo = () => {
    if (triggerToast) {
      triggerToast('Mode Découverte : explorez StartBill');
    }
    setScreen('choose_region');
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 font-sans flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Header */}
      <header className="w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto px-5 sm:px-6 pt-5 pb-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-1 cursor-pointer" onClick={() => setScreen('landing')}>
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Start</span>
          <span className="text-xl sm:text-2xl font-black text-[#2563EB] tracking-tight">Bill</span>
        </div>

        {/* Connexion Link */}
        <button
          type="button"
          onClick={() => setScreen('login')}
          className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          Connexion
        </button>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto px-5 sm:px-6 py-4 flex-1 flex flex-col items-center justify-center space-y-6 sm:space-y-7 text-center">
        
        {/* Pill Tag */}
        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-xs sm:text-[13px] font-semibold tracking-normal shadow-2xs">
          simple, rapide, accessible
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-[54px] font-black text-slate-900 tracking-tight leading-[1.12] text-center">
          <span>Facture</span><br />
          <span>aujourd’hui,</span><br />
          <span className="text-[#2563EB]">respire</span><br />
          <span className="text-[#2563EB]">demain.</span>
        </h1>

        {/* Sub-headline */}
        <p className="text-xs sm:text-sm text-slate-500 font-normal max-w-xs sm:max-w-sm mx-auto leading-relaxed text-center">
          La plateforme tout-en-un pour facturer, suivre vos paiements et gérer votre entreprise, où que vous soyez.
        </p>

        {/* Interactive / Visual Dashboard Graphic Mockup */}
        <div className="w-full relative pt-2 pb-2">
          
          {/* Floating Bubble: Left Dollar Sign */}
          <div className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EBFDF5] text-[#059669] border border-white shadow-[0_4px_14px_rgba(5,150,105,0.15)] flex items-center justify-center font-black text-base sm:text-lg">
            $
          </div>

          {/* Floating Bubble: Top Right Analytics Bar */}
          <div className="absolute -right-2 sm:-right-3 top-4 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] border border-white shadow-[0_4px_14px_rgba(79,70,229,0.15)] flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>

          {/* Floating Bubble: Bottom Right Invoice Icon */}
          <div className="absolute -right-2 sm:-right-3 bottom-8 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#FFF7ED] text-[#EA580C] border border-white shadow-[0_4px_14px_rgba(234,88,12,0.15)] flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>

          {/* Inner Dashboard Mockup Card */}
          <div className="bg-white rounded-3xl p-3.5 sm:p-4 border border-slate-100 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.08)] flex gap-2.5 sm:gap-3.5 text-left relative overflow-hidden">
            
            {/* Left Mockup Mini Sidebar */}
            <div className="w-8 sm:w-9 flex flex-col items-center justify-between py-1 border-r border-slate-100 pr-2 flex-shrink-0">
              <div className="space-y-2.5 flex flex-col items-center">
                {/* Brand icon 'S' */}
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#4F46E5] text-white font-black text-xs flex items-center justify-center shadow-xs">
                  S
                </div>
                {/* Active Home Icon */}
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                  <Home className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                {/* Other Nav icons */}
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <Settings className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Main Mockup Body */}
            <div className="flex-1 min-w-0 space-y-2.5">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-900 tracking-tight">Vue d'ensemble</span>
              </div>

              {/* Two Column Grid */}
              <div className="grid grid-cols-12 gap-2 sm:gap-3">
                
                {/* Left Column: Revenue & Quick Stats */}
                <div className="col-span-6 space-y-2">
                  
                  {/* Revenue Card */}
                  <div className="bg-[#F8FAFC] rounded-2xl p-2 sm:p-2.5 border border-slate-100/80 space-y-1">
                    <div className="text-[8px] sm:text-[9px] text-slate-500 font-semibold">Chiffre d'affaires</div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-black text-slate-900">12 450 $</span>
                      <span className="text-[7px] sm:text-[8px] font-black text-[#059669] bg-[#ECFDF5] px-1 py-0.5 rounded-full border border-[#D1FAE5]">
                        + 12,5%
                      </span>
                    </div>
                    <div className="text-[7px] text-slate-400 font-medium">vs le mois dernier</div>

                    {/* Smooth Sparkline Curve */}
                    <div className="h-6 w-full pt-1">
                      <svg viewBox="0 0 100 24" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 0,18 C 15,18 20,12 35,14 C 50,16 60,8 75,10 C 85,11 92,4 100,5 L 100,24 L 0,24 Z"
                          fill="url(#chartGrad)"
                        />
                        <path
                          d="M 0,18 C 15,18 20,12 35,14 C 50,16 60,8 75,10 C 85,11 92,4 100,5"
                          fill="none"
                          stroke="#4F46E5"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Factures & Paiements mini counts */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="bg-[#F8FAFC] rounded-xl p-1.5 border border-slate-100/80">
                      <div className="text-[7px] text-slate-500 font-medium leading-none">Factures</div>
                      <div className="text-[11px] sm:text-xs font-black text-slate-900 mt-1">24</div>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-xl p-1.5 border border-slate-100/80">
                      <div className="text-[7px] text-slate-500 font-medium leading-none truncate">Paiements</div>
                      <div className="text-[11px] sm:text-xs font-black text-slate-900 mt-1">18</div>
                    </div>
                  </div>

                </div>

                {/* Right Column: Latest Invoices & Activity Alert */}
                <div className="col-span-6 space-y-1.5 sm:space-y-2">
                  
                  {/* Header Row */}
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-700">Dernières factures</span>
                    <span className="text-[7px] sm:text-[8px] font-bold text-[#2563EB] cursor-pointer">Voir tout</span>
                  </div>

                  {/* Invoice list items */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[8px] leading-tight">
                      <div className="truncate font-semibold text-slate-800 pr-1">ABC Construction</div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-slate-900">1 250 $</div>
                        <div className="text-[7px] font-bold text-[#059669]">Payée</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[8px] leading-tight pt-0.5 border-t border-slate-100/60">
                      <div className="truncate font-semibold text-slate-800 pr-1">Design Studio</div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-slate-900">850 $</div>
                        <div className="text-[7px] font-bold text-[#EA580C]">En attente</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[8px] leading-tight pt-0.5 border-t border-slate-100/60">
                      <div className="truncate font-semibold text-slate-800 pr-1">Tech Solutions</div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-slate-900">2 300 $</div>
                        <div className="text-[7px] font-bold text-[#EA580C]">En attente</div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Activity Box */}
                  <div className="bg-[#ECFDF5]/80 rounded-xl p-1.5 border border-[#D1FAE5] flex items-center justify-between mt-1">
                    <div className="min-w-0 pr-1">
                      <div className="text-[7px] font-bold text-slate-800 leading-none">Aperçu de votre activité</div>
                      <div className="text-[6.5px] text-slate-500 font-medium truncate mt-0.5">Vous êtes à jour ! Continuez ainsi.</div>
                    </div>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* 3 Pillars / Key Benefits */}
        <div className="w-full grid grid-cols-3 gap-2 sm:gap-3 pt-1">
          
          {/* Pillar 1: Créez vos factures */}
          <div className="flex flex-col items-center text-center space-y-1.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shadow-2xs">
              <Zap className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-[#4F46E5]" />
            </div>
            <div>
              <div className="text-[11px] sm:text-xs font-black text-slate-900 leading-tight">Créez vos factures</div>
              <div className="text-[9px] sm:text-[10px] text-slate-500 font-medium leading-tight mt-0.5">en quelques secondes</div>
            </div>
          </div>

          {/* Pillar 2: Suivez vos paiements */}
          <div className="flex flex-col items-center text-center space-y-1.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shadow-2xs">
              <CreditCard className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <div>
              <div className="text-[11px] sm:text-xs font-black text-slate-900 leading-tight">Suivez vos paiements</div>
              <div className="text-[9px] sm:text-[10px] text-slate-500 font-medium leading-tight mt-0.5">et vos dépenses</div>
            </div>
          </div>

          {/* Pillar 3: Pilotez votre entreprise */}
          <div className="flex flex-col items-center text-center space-y-1.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shadow-2xs">
              <TrendingUp className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <div>
              <div className="text-[11px] sm:text-xs font-black text-slate-900 leading-tight">Pilotez votre entreprise</div>
              <div className="text-[9px] sm:text-[10px] text-slate-500 font-medium leading-tight mt-0.5">en toute simplicité</div>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5 pt-1">
          
          {/* Primary CTA */}
          <button
            type="button"
            onClick={handleGetStarted}
            className="w-full bg-[#2563EB] hover:bg-blue-700 active:scale-[0.99] text-white font-bold py-3.5 sm:py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(37,99,235,0.25)] transition-all cursor-pointer text-xs sm:text-sm tracking-wide"
          >
            <span>Commencer gratuitement</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Secondary CTA */}
          <button
            type="button"
            onClick={handleDemo}
            className="w-full bg-white hover:bg-blue-50/50 active:scale-[0.99] text-[#2563EB] font-bold py-3 sm:py-3.5 px-6 rounded-2xl border border-blue-200/80 flex items-center justify-center gap-2 transition-all cursor-pointer text-xs sm:text-sm"
          >
            <span>Voir une démo</span>
            <PlayCircle className="w-4 h-4 text-[#2563EB]" />
          </button>

        </div>

        {/* Bottom Trust Badge */}
        <div className="w-full bg-[#F8FAFC]/90 border border-slate-200/80 rounded-2xl p-3 sm:p-3.5 flex items-center gap-3 text-left shadow-2xs">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100 flex items-center justify-center shrink-0">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2563EB]" />
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-600 leading-snug font-medium">
            Conçu pour les travailleurs autonomes, freelances et petites entreprises au{' '}
            <strong className="text-[#2563EB] font-bold">Canada</strong>, en{' '}
            <strong className="text-[#059669] font-bold">Afrique francophone</strong> et en{' '}
            <strong className="text-[#EA580C] font-bold">Haïti</strong>.
          </p>
        </div>

      </main>

      {/* Subtle bottom padding */}
      <footer className="w-full py-3"></footer>

    </div>
  );
}
