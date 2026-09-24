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
  Receipt,
  Sparkles,
  Globe,
  Clock
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
      <header className="w-full max-w-7xl mx-auto px-5 sm:px-8 pt-5 pb-4 flex items-center justify-between border-b border-slate-100 lg:border-none">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setScreen('landing')}>
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-sm">
            S
          </div>
          <div className="flex items-center">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Start</span>
            <span className="text-xl sm:text-2xl font-black text-[#2563EB] tracking-tight">Bill</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-600">
          <button 
            type="button" 
            onClick={() => setScreen('choose_region')}
            className="hover:text-blue-600 transition flex items-center gap-1 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span>Multi-Régions (CAD / FCFA / HTG)</span>
          </button>
          <button 
            type="button" 
            onClick={() => setScreen('pricing')}
            className="hover:text-blue-600 transition cursor-pointer"
          >
            Tarifs
          </button>
          <button 
            type="button" 
            onClick={() => setScreen('dashboard')}
            className="hover:text-blue-600 transition cursor-pointer"
          >
            Fonctionnalités
          </button>
          <button 
            type="button" 
            onClick={() => setScreen('admin')}
            className="hover:text-slate-900 text-slate-400 text-[11px] transition cursor-pointer"
          >
            Portail Admin
          </button>
        </nav>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setScreen('login')}
            className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 transition-colors cursor-pointer"
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={handleGetStarted}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
          >
            <span>Démarrer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-7xl mx-auto px-5 sm:px-8 py-6 lg:py-12 flex-1 flex flex-col justify-center">
        
        {/* Hero Section: 2 Columns on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headline, subtext, CTAs */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-xs sm:text-[13px] font-semibold tracking-normal shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>simple, rapide, accessible</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
              Facture aujourd’hui,<br />
              <span className="text-[#2563EB]">respire demain.</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-sm sm:text-base text-slate-600 font-normal max-w-xl leading-relaxed">
              La plateforme tout-en-un pour facturer en quelques clics, automatiser vos déclarations de taxes (TPS/TVQ au Canada, TVA en Afrique et Haïti), suivre vos paiements et piloter votre entreprise.
            </p>

            {/* Regional Badges Strip */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                🇨🇦 Canada (CAD • ARC/RQ)
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                🌍 Afrique (FCFA • Mobile Money)
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                🇭🇹 Haïti (HTG • MonCash)
              </span>
            </div>

            {/* Action Buttons */}
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3 pt-2">
              {/* Primary CTA */}
              <button
                type="button"
                onClick={handleGetStarted}
                className="w-full sm:w-auto bg-[#2563EB] hover:bg-blue-700 active:scale-[0.99] text-white font-bold py-3.5 sm:py-4 px-7 rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(37,99,235,0.25)] transition-all cursor-pointer text-xs sm:text-sm tracking-wide"
              >
                <span>Commencer gratuitement</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Secondary CTA */}
              <button
                type="button"
                onClick={handleDemo}
                className="w-full sm:w-auto bg-white hover:bg-blue-50/50 active:scale-[0.99] text-[#2563EB] font-bold py-3.5 sm:py-4 px-6 rounded-2xl border border-blue-200/80 flex items-center justify-center gap-2 transition-all cursor-pointer text-xs sm:text-sm shadow-xs"
              >
                <span>Voir une démo interactive</span>
                <PlayCircle className="w-4 h-4 text-[#2563EB]" />
              </button>
            </div>

            {/* 3 Value Pillars */}
            <div className="w-full grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-1">
                <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] font-bold text-slate-900 leading-tight">Gagnez du temps</div>
                <div className="text-[10px] text-slate-500 font-medium">facturation en 30s</div>
              </div>

              <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-1">
                <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] font-bold text-slate-900 leading-tight">Suivez vos paiements</div>
                <div className="text-[10px] text-slate-500 font-medium">relances WhatsApp & email</div>
              </div>

              <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-1">
                <div className="w-7 h-7 rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] font-bold text-slate-900 leading-tight">Pilotez l'activité</div>
                <div className="text-[10px] text-slate-500 font-medium">calcul des taxes & CA</div>
              </div>
            </div>

            {/* Bottom Trust Badge */}
            <div className="w-full bg-[#F8FAFC]/90 border border-slate-200/80 rounded-2xl p-3 sm:p-3.5 flex items-center gap-3 text-left shadow-2xs">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100 flex items-center justify-center shrink-0">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2563EB]" />
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-600 leading-snug font-medium">
                Conçu pour les travailleurs autonomes, freelances et PME au{' '}
                <strong className="text-[#2563EB] font-bold">Canada</strong>, en{' '}
                <strong className="text-[#059669] font-bold">Afrique francophone</strong> et en{' '}
                <strong className="text-[#EA580C] font-bold">Haïti</strong>.
              </p>
            </div>

          </div>

          {/* Right Column: Interactive Dashboard Graphic Mockup */}
          <div className="lg:col-span-6 xl:col-span-5 w-full relative pt-2 pb-2">
            
            {/* Floating Bubble: Left Dollar Sign */}
            <div className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#EBFDF5] text-[#059669] border border-white shadow-[0_4px_14px_rgba(5,150,105,0.15)] flex items-center justify-center font-black text-base sm:text-lg">
              $
            </div>

            {/* Floating Bubble: Top Right Analytics Bar */}
            <div className="absolute -right-2 sm:-right-3 top-4 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] border border-white shadow-[0_4px_14px_rgba(79,70,229,0.15)] flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>

            {/* Floating Bubble: Bottom Right Invoice Icon */}
            <div className="absolute -right-2 sm:-right-3 bottom-8 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-[#FFF7ED] text-[#EA580C] border border-white shadow-[0_4px_14px_rgba(234,88,12,0.15)] flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>

            {/* Inner Dashboard Mockup Card */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex gap-3 sm:gap-4 text-left relative overflow-hidden">
              
              {/* Left Mockup Mini Sidebar */}
              <div className="w-8 sm:w-10 flex flex-col items-center justify-between py-1 border-r border-slate-100 pr-2 sm:pr-3 flex-shrink-0">
                <div className="space-y-3 flex flex-col items-center">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#4F46E5] text-white font-black text-xs flex items-center justify-center shadow-xs">
                    S
                  </div>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                    <Home className="w-3.5 h-3.5" />
                  </div>
                  <FileText className="w-4 h-4 text-slate-400" />
                  <Users className="w-4 h-4 text-slate-400" />
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  <BarChart2 className="w-4 h-4 text-slate-400" />
                </div>
                <Settings className="w-4 h-4 text-slate-400" />
              </div>

              {/* Main Mockup Body */}
              <div className="flex-1 min-w-0 space-y-3.5">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight block">Tableau de bord</span>
                    <span className="text-[10px] text-slate-400 font-medium">Vue d'ensemble en temps réel</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Direct
                  </span>
                </div>

                {/* Two Column Grid */}
                <div className="grid grid-cols-12 gap-2 sm:gap-3">
                  
                  {/* Left Column: Revenue & Quick Stats */}
                  <div className="col-span-6 space-y-2">
                    
                    {/* Revenue Card */}
                    <div className="bg-[#F8FAFC] rounded-2xl p-2.5 sm:p-3 border border-slate-100/80 space-y-1">
                      <div className="text-[8px] sm:text-[10px] text-slate-500 font-semibold">Chiffre d'affaires</div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm sm:text-base font-black text-slate-900">12 450 $</span>
                        <span className="text-[7px] sm:text-[9px] font-black text-[#059669] bg-[#ECFDF5] px-1 py-0.5 rounded-full border border-[#D1FAE5]">
                          + 12,5%
                        </span>
                      </div>
                      <div className="text-[8px] text-slate-400 font-medium">vs le mois dernier</div>

                      {/* Smooth Sparkline Curve */}
                      <div className="h-7 w-full pt-1">
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
                      <div className="bg-[#F8FAFC] rounded-xl p-2 border border-slate-100/80">
                        <div className="text-[8px] sm:text-[9px] text-slate-400 font-semibold uppercase">Factures</div>
                        <div className="text-xs sm:text-sm font-black text-slate-800">24</div>
                      </div>
                      <div className="bg-[#F8FAFC] rounded-xl p-2 border border-slate-100/80">
                        <div className="text-[8px] sm:text-[9px] text-slate-400 font-semibold uppercase">Clients</div>
                        <div className="text-xs sm:text-sm font-black text-slate-800">18</div>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Invoices List */}
                  <div className="col-span-6 space-y-1.5">
                    <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Factures récentes
                    </div>
                    
                    {/* Invoice 1 */}
                    <div className="bg-[#F8FAFC] rounded-xl p-2 border border-slate-100 flex items-center justify-between">
                      <div className="min-w-0 pr-1">
                        <div className="text-[9px] sm:text-[10px] font-bold text-slate-900 truncate">Acme Inc.</div>
                        <div className="text-[8px] text-slate-400">#FACT-045</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-[9px] sm:text-[10px] font-bold text-slate-900">2 400 $</div>
                        <span className="text-[7px] font-black text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-100">
                          Payée
                        </span>
                      </div>
                    </div>

                    {/* Invoice 2 */}
                    <div className="bg-[#F8FAFC] rounded-xl p-2 border border-slate-100 flex items-center justify-between">
                      <div className="min-w-0 pr-1">
                        <div className="text-[9px] sm:text-[10px] font-bold text-slate-900 truncate">Consulting Pro</div>
                        <div className="text-[8px] text-slate-400">#FACT-044</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-[9px] sm:text-[10px] font-bold text-slate-900">1 850 $</div>
                        <span className="text-[7px] font-black text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-100">
                          Envoyée
                        </span>
                      </div>
                    </div>

                    {/* Invoice 3 */}
                    <div className="bg-[#F8FAFC] rounded-xl p-2 border border-slate-100 flex items-center justify-between">
                      <div className="min-w-0 pr-1">
                        <div className="text-[9px] sm:text-[10px] font-bold text-slate-900 truncate">Studio Créatif</div>
                        <div className="text-[8px] text-slate-400">#FACT-043</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-[9px] sm:text-[10px] font-bold text-slate-900">950 $</div>
                        <span className="text-[7px] font-black text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-100">
                          En cours
                        </span>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Feature Cards Grid (Appears cleanly below Hero on Tablet & Desktop) */}
        <div className="mt-12 lg:mt-16 pt-8 border-t border-slate-100">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Tout ce dont votre entreprise a besoin pour réussir
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Des outils professionnels calibrés pour votre marché et votre réglementation fiscale.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-3.5">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Facturation PDF Conforme</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Créez des factures professionnelles avec calcul automatique de la TPS/TVQ au Québec, de la TVA et mentions légales obligatoires.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-3.5">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Dépenses & OCR IA</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Photographiez vos reçus de dépenses avec votre téléphone. L'OCR extrait instantanément le montant, la taxe et la date.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-3.5">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Multi-Devises & Passerelles</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Paiements par Virement Interac au Canada, Orange Money & MTN en Afrique, MonCash en Haïti et cartes bancaires.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-3.5">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Déclarations & Impôts</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Rapports trimestriels et annuels prêts pour votre comptable ou votre déclaration directe à Revenu Québec et l'ARC.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/70 bg-white py-6 mt-8">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">StartBill Pro</span>
            <span>• Facturation intelligente & gestion multi-régionale</span>
          </div>
          <div className="flex items-center gap-6">
            <button type="button" onClick={() => setScreen('choose_region')} className="hover:text-blue-600 transition cursor-pointer">
              Changer de région
            </button>
            <button type="button" onClick={() => setScreen('pricing')} className="hover:text-blue-600 transition cursor-pointer">
              Forfaits
            </button>
            <button type="button" onClick={() => setScreen('login')} className="hover:text-blue-600 transition cursor-pointer">
              Connexion
            </button>
            <span>© 2026 StartBill Inc.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
