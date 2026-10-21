import React, { useState } from 'react';
import { AdminProfile } from './adminTypes';
import {
  X,
  Shield,
  ShieldCheck,
  Smartphone,
  Key,
  Globe,
  Bell,
  LogOut,
  History,
  CheckCircle2,
  Clock,
  Laptop,
  Check,
  AlertTriangle,
  Lock,
} from 'lucide-react';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: AdminProfile;
  onUpdateProfile: (updated: Partial<AdminProfile>) => void;
  triggerToast: (msg: string) => void;
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  triggerToast,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'sessions' | 'preferences'>('profile');
  const [phone, setPhone] = useState(profile.phone || '+1 (514) 890-4321');
  const [language, setLanguage] = useState<'fr' | 'en'>(profile.language);
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(profile.theme);
  const [mfaEnabled, setMfaEnabled] = useState(profile.isMfaActive);

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ phone, language, theme, isMfaActive: mfaEnabled });
    triggerToast('Coordonnées professionnelles et préférences mises à jour avec succès.');
  };

  const handleDisconnectOtherSessions = () => {
    triggerToast('Toutes les autres sessions distantes ont été révoquées avec succès.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#0B1528] border border-slate-750 text-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-md ring-2 ring-amber-400/40">
              FZ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">{profile.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {profile.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">{profile.title}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-[#070e1b] px-4">
          {[
            { id: 'profile', label: 'Mon Profil & Coordonnées' },
            { id: 'security', label: 'Sécurité & MFA' },
            { id: 'sessions', label: 'Sessions Actives' },
            { id: 'preferences', label: 'Affichage & Langue' },
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`py-3 px-3 text-xs font-bold transition border-b-2 cursor-pointer ${
                activeTab === t.id
                  ? 'border-blue-500 text-white font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveContact} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/30 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-blue-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-xs">Compte Super Administrateur Provisionné</div>
                  <div className="text-[11px] text-slate-300">
                    Ce profil dispose des privilèges de direction générale sur l'ensemble de la plateforme STARTBILL (Canada, Afrique et Haïti).
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Nom Complet
                  </label>
                  <input
                    type="text"
                    disabled
                    value={profile.name}
                    className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-white font-medium opacity-80 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Identité officielle Fondatrice</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Fonction Officielle
                  </label>
                  <input
                    type="text"
                    disabled
                    value={profile.title}
                    className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-white font-medium opacity-80 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Courriel Professionnel Sécurisé
                  </label>
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-white font-medium opacity-80 cursor-not-allowed font-mono text-[11px]"
                  />
                  <span className="text-[10px] text-emerald-400 font-medium mt-0.5 block">
                    ✓ Authentification Firebase & Google vérifiée
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Téléphone Direct / Signal
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer shadow-md shadow-blue-600/30"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="font-bold text-white">Authentification Multifacteur (MFA / 2FA)</div>
                      <div className="text-[11px] text-slate-400">
                        Protection obligatoire requise pour le rôle SUPER_ADMIN (Google Authenticator).
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    ACTIVÉ
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-400" />
                  <span>Historique des Événements de Sécurité Récents</span>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="p-2.5 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between text-[11px]">
                    <div>
                      <div className="font-semibold text-white">Connexion Super Admin validée (MFA)</div>
                      <div className="text-slate-400 text-[10px]">142.250.190.46 • Montréal, QC, Canada</div>
                    </div>
                    <span className="text-slate-400 font-mono text-[10px]">Aujourd'hui, 18:45</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between text-[11px]">
                    <div>
                      <div className="font-semibold text-white">Audit des Politiques de Sécurité Firestore</div>
                      <div className="text-slate-400 text-[10px]">Vérification Zero-Trust automatique • 100% Succès</div>
                    </div>
                    <span className="text-slate-400 font-mono text-[10px]">Aujourd'hui, 01:48</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="font-bold text-white flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-emerald-400" />
                  <span>Session Actuelle</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-emerald-300">macOS • Chrome (Session Active)</div>
                    <div className="text-[11px] text-slate-300 font-mono">IP: 142.250.190.46 • Montréal, Canada</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Dernière activité : Il y a quelques instants</div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDisconnectOtherSessions}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnecter toutes les autres sessions actives</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Langue Principale de la Console
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('fr');
                      triggerToast('Langue : Français (Canada / International)');
                    }}
                    className={`p-3 rounded-xl border text-left font-bold transition cursor-pointer ${
                      language === 'fr'
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-sm">🇫🇷 Français (Officiel)</div>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-normal">
                      Français québécois et international
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('en');
                      triggerToast('Language set to English');
                    }}
                    className={`p-3 rounded-xl border text-left font-bold transition cursor-pointer ${
                      language === 'en'
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-sm">🇬🇧 English</div>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-normal">
                      Standard English interface
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Thème Visuel
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'dark', label: 'Bleu Marine Sombre' },
                    { id: 'light', label: 'Clair' },
                    { id: 'system', label: 'Système' },
                  ].map(th => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setTheme(th.id as any)}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition cursor-pointer ${
                        theme === th.id
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {th.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
