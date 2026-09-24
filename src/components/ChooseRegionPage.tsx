import React, { useState } from 'react';
import { ScreenId } from '../types';
import { REGIONS } from '../data/regions';
import { Globe, Check, ArrowRight, ShieldCheck, CreditCard, Sparkles, ChevronLeft } from 'lucide-react';

interface ChooseRegionPageProps {
  currentRegionId?: 'canada' | 'afrique' | 'haiti';
  onSelectRegion: (regionId: 'canada' | 'afrique' | 'haiti') => void;
  onContinue: () => void;
  setScreen?: (screen: ScreenId) => void;
  triggerToast?: (msg: string) => void;
}

export default function ChooseRegionPage({
  currentRegionId = 'canada',
  onSelectRegion,
  onContinue,
  setScreen,
  triggerToast
}: ChooseRegionPageProps) {
  const [selected, setSelected] = useState<'canada' | 'afrique' | 'haiti'>(currentRegionId);

  const handleSelect = (id: 'canada' | 'afrique' | 'haiti') => {
    setSelected(id);
    onSelectRegion(id);
  };

  const handleNext = () => {
    onSelectRegion(selected);
    if (triggerToast) {
      triggerToast(`Région sélectionnée : ${REGIONS[selected].name}`);
    }
    onContinue();
  };

  const regionDetails = [
    {
      id: 'canada' as const,
      flag: '🇨🇦',
      name: 'Canada',
      currency: 'CAD ($)',
      taxSystem: 'TPS / TVQ / TVH',
      authority: 'Conforme ARC & Revenu Québec',
      payments: 'Virement Interac, Stripe, Cartes',
      badge: 'Amérique du Nord',
      description: 'Calcul automatique des taxes provinciales québécoises et canadiennes. Factures bilingues.'
    },
    {
      id: 'afrique' as const,
      flag: '🌍',
      name: 'Afrique',
      currency: 'FCFA (XOF / XAF)',
      taxSystem: 'TVA Standard OHADA',
      authority: 'Conforme réglementations fiscales UEMOA / CEMAC',
      payments: 'Orange Money, MTN MoMo, Wave, Moov',
      badge: 'Zone Franc CFA',
      description: 'Facturation optimisée Mobile Money et relances en 1 clic par WhatsApp pour vos clients.'
    },
    {
      id: 'haiti' as const,
      flag: '🇭🇹',
      name: 'Haïti',
      currency: 'HTG (Gourde) & USD',
      taxSystem: 'TCA / Fiscalité DGI',
      authority: 'Conforme Direction Générale des Impôts',
      payments: 'MonCash, Natcash, Espèces',
      badge: 'Caraïbes',
      description: 'Gestion multi-devises Gourdes et Dollars américains avec encaissements rapides par MonCash.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Header Bar */}
      <header className="w-full bg-slate-900 text-white px-5 sm:px-8 py-4 shadow-sm border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {setScreen && (
              <button
                type="button"
                onClick={() => setScreen('landing')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                title="Retour à l'accueil"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setScreen && setScreen('landing')}>
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                S
              </div>
              <span className="text-lg font-black text-white tracking-tight">StartBill</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span className="hidden sm:inline">Configuration initiale</span>
            <span className="bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 text-[11px] font-bold">
              Étape 1 sur 3
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-5 sm:px-8 py-8 lg:py-12 flex flex-col justify-center">
        
        {/* Title Section */}
        <div className="text-center max-w-2xl mx-auto mb-8 lg:mb-10 space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>Sélection de votre région d'exploitation</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Où votre entreprise est-elle établie ?
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
            StartBill calibre automatiquement les devises, les calculs de taxes (TPS, TVQ, TVH ou TVA), les passerelles de paiement locales et les modèles de factures conformes.
          </p>
        </div>

        {/* Region Cards Grid: 1 col on mobile, 3 cols on tablet & desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 mb-8">
          {regionDetails.map((reg) => {
            const isSelected = selected === reg.id;
            return (
              <div
                key={reg.id}
                id={`region-btn-${reg.id}`}
                onClick={() => handleSelect(reg.id)}
                className={`relative rounded-3xl p-5 sm:p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between border-2 bg-white text-left ${
                  isSelected
                    ? 'border-blue-600 shadow-xl shadow-blue-500/10 ring-4 ring-blue-500/10'
                    : 'border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md'
                }`}
              >
                {/* Top Flag & Checkmark */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shadow-2xs">
                      {reg.flag}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {reg.badge}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'border-2 border-slate-300 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">
                    {reg.name}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    {reg.description}
                  </p>

                  {/* Feature Pills */}
                  <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Devise légale :</span>
                      <span className="font-bold text-slate-800">{reg.currency}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Régime fiscal :</span>
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md text-[11px]">
                        {reg.taxSystem}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Paiements :</span>
                      <span className="font-semibold text-slate-700 text-[11px] truncate max-w-[150px]" title={reg.payments}>
                        {reg.payments}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Footer */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{reg.authority}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="max-w-md mx-auto w-full pt-2">
          <button
            type="button"
            id="region-btn-continue"
            onClick={handleNext}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold py-3.5 sm:py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base text-center"
          >
            <span>Continuer avec {REGIONS[selected].name}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-center text-[11px] text-slate-400 font-medium mt-3">
            Vous pourrez à tout moment basculer ou ajuster vos paramètres dans les options du compte.
          </p>
        </div>

      </main>

    </div>
  );
}
