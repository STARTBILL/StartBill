import React, { useState } from 'react';
import { Lock, Unlock, LogOut, ShieldCheck, KeyRound, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import { UserProfile } from '../context/AuthContext';
import { StartBillLogo } from './common/StartBillLogo';

interface SessionLockModalProps {
  isOpen: boolean;
  user: UserProfile | null;
  onUnlock: () => void;
  onSignOut: () => void;
  loginWithEmail?: (email: string, pass: string) => Promise<UserProfile>;
}

export const SessionLockModal: React.FC<SessionLockModalProps> = ({
  isOpen,
  user,
  onUnlock,
  onSignOut,
  loginWithEmail
}) => {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handlePasswordUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage('Veuillez saisir votre mot de passe pour déverrouiller.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      if (loginWithEmail && user?.email) {
        await loginWithEmail(user.email, password);
      }
      setPassword('');
      onUnlock();
    } catch (err: any) {
      console.warn('[SessionLock] Re-auth failed:', err);
      const code = err?.code || '';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setErrorMessage('Mot de passe incorrect. Veuillez réessayer.');
      } else if (code === 'auth/too-many-requests') {
        setErrorMessage('Trop de tentatives. Veuillez patienter ou utiliser le déverrouillage de session.');
      } else {
        // If account has no password (e.g. Google Sign-In) or offline
        setErrorMessage('Impossible de vérifier le mot de passe. Si vous utilisez Google, utilisez le déverrouillage de session ci-dessous.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickUnlock = () => {
    setPassword('');
    setErrorMessage(null);
    onUnlock();
  };

  const userDisplayName = user?.fullName || user?.companyName || 'Utilisateur';
  const userEmail = user?.email || 'Compte StartBill';
  const initial = (userDisplayName || userEmail || 'U').charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lock-title"
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-xl -ml-10 -mb-10 pointer-events-none" />

          {/* StartBill Logo */}
          <div className="flex justify-center mb-3">
            <StartBillLogo variant="horizontal" size="sm" theme="dark" showTagline={false} />
          </div>

          {/* Animated Lock Icon */}
          <div className="relative inline-flex items-center justify-center my-2">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shadow-inner">
              <Lock className="w-8 h-8 text-amber-300 animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white border-2 border-slate-900">
              <ShieldCheck className="w-3 h-3" />
            </div>
          </div>

          <h1 id="lock-title" className="text-xl font-black tracking-tight text-white mt-2">
            Session Verrouillée
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
            Pour la sécurité de vos données financières et fiscales, votre compte a été automatiquement verrouillé suite à <span className="text-amber-300 font-bold">1 minute d'inactivité</span>.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Active User Card */}
          <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-base shadow-sm shrink-0">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate">
                {userDisplayName}
              </div>
              <div className="text-[11px] text-slate-500 truncate font-medium">
                {userEmail}
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/60 shrink-0">
              En ligne
            </span>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Form: Password Unlock */}
          <form onSubmit={handlePasswordUnlock} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Mot de passe du compte</span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                >
                  {showPassword ? 'Masquer' : 'Afficher'}
                </button>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Saisissez votre mot de passe"
                  autoFocus
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Vérification en cours...' : 'Déverrouiller avec le mot de passe'}</span>
            </button>
          </form>

          {/* Quick Unlock for active browser session / OAuth users */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleQuickUnlock}
              className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 group"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition" />
              <span>Reprendre ma session active</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition" />
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-1.5">
              Idéal si vous êtes connecté avec Google ou n'avez pas défini de mot de passe local.
            </p>
          </div>

          {/* Sign Out Option */}
          <div className="flex items-center justify-center pt-2">
            <button
              type="button"
              onClick={onSignOut}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-rose-50 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Se déconnecter et fermer la session</span>
            </button>
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-2.5 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            Protection StartBill SecureLock
          </span>
          <span>Délai d'inactivité : 1 min</span>
        </div>
      </div>
    </div>
  );
};

export default SessionLockModal;
