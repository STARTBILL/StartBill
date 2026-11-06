import React, { useState, useEffect } from 'react';
import { Shield, Cookie, Check, X, Settings2, ExternalLink } from 'lucide-react';

interface CookieConsentBannerProps {
  onOpenLegalDoc?: (docId: string) => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onOpenLegalDoc }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [showPreferences, setShowPreferences] = useState<boolean>(false);
  const [analyticsConsent, setAnalyticsConsent] = useState<boolean>(false);
  const [functionalConsent, setFunctionalConsent] = useState<boolean>(true);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('startbill_cookie_consent');
      if (!consent) {
        // Show banner after brief delay
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem('startbill_cookie_consent', JSON.stringify({
        necessary: true,
        analytics: true,
        functional: true,
        date: new Date().toISOString()
      }));
    } catch {}
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handleRefuseAll = () => {
    try {
      localStorage.setItem('startbill_cookie_consent', JSON.stringify({
        necessary: true,
        analytics: false,
        functional: false,
        date: new Date().toISOString()
      }));
    } catch {}
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handleSavePreferences = () => {
    try {
      localStorage.setItem('startbill_cookie_consent', JSON.stringify({
        necessary: true,
        analytics: analyticsConsent,
        functional: functionalConsent,
        date: new Date().toISOString()
      }));
    } catch {}
    setIsVisible(false);
    setShowPreferences(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 md:p-6 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-4xl mx-auto bg-slate-900/95 backdrop-blur-md border border-slate-750 text-white rounded-2xl shadow-2xl p-4 sm:p-6">
        
        {!showPreferences ? (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 max-w-2xl">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0 text-blue-400 mt-0.5">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">Respect de votre vie privée & Conformité RGPD</h4>
                  <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-full font-semibold">
                    Loi 25 & RGPD
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  StartBill utilise des témoins techniques indispensables pour assurer la sécurité de votre session et mémoriser votre région fiscale. Les traceurs non essentiels requièrent votre accord préalable.
                </p>
                <div className="flex items-center gap-3 pt-1 text-xs text-blue-400">
                  <button
                    type="button"
                    onClick={() => onOpenLegalDoc?.('politique-cookies')}
                    className="hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>Politique relative aux cookies</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => onOpenLegalDoc?.('politique-confidentialite')}
                    className="hover:underline font-medium"
                  >
                    Politique de confidentialité
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 justify-end pt-2 md:pt-0">
              <button
                type="button"
                onClick={() => setShowPreferences(true)}
                className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Personnaliser</span>
              </button>
              <button
                type="button"
                onClick={handleRefuseAll}
                className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
              >
                Tout refuser
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-md shadow-blue-600/30"
              >
                Tout accepter
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-blue-400" />
                <h4 className="text-sm font-bold text-white">Gestion de vos préférences de témoins</h4>
              </div>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Category 1: Strictly Necessary */}
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-750 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <span>Témoins strictement nécessaires</span>
                    <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.2 rounded-full font-semibold">
                      Toujours actif
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Indispensables pour maintenir votre session, la sécurité du jeton Firebase et la sauvegarde de la région active.
                  </p>
                </div>
                <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Category 2: Functional */}
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-750 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-bold text-white">Témoins de préférences & fonctionnalités</div>
                  <p className="text-slate-400 text-[11px]">
                    Permettent de mémoriser vos préférences de devises, entreprises et configurations d’affichage.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={functionalConsent}
                    onChange={(e) => setFunctionalConsent(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Category 3: Analytics */}
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-750 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-bold text-white">Mesure d’audience et amélioration continue</div>
                  <p className="text-slate-400 text-[11px]">
                    Statistiques de navigation anonymisées pour détecter les erreurs et optimiser l’ergonomie logicielle.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={analyticsConsent}
                    onChange={(e) => setAnalyticsConsent(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Retour
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRefuseAll}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg"
                >
                  Refuser optionnels
                </button>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm"
                >
                  Enregistrer mes choix
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CookieConsentBanner;
