import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Check, 
  ShieldCheck, 
  Lock,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  Mail,
  User,
  Building2,
  Zap,
  Globe
} from 'lucide-react';
import { ScreenId } from '../types';
import { useRegional } from '../context/RegionalContext';
import { REGIONS } from '../data/regions';
import { useAuth } from '../context/AuthContext';
import { SUPER_ADMIN_EMAIL } from '../lib/authSecurity';
import { StartBillLogo } from './common/StartBillLogo';

interface LoginPageProps {
  setScreen: (screen: ScreenId) => void;
  triggerToast: (msg: string) => void;
  currentUser?: any;
}

export default function LoginPage({
  setScreen,
  triggerToast,
  currentUser
}: LoginPageProps) {
  const { region: activeRegion } = useRegional();
  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const regionDemonym = 
    activeRegion === 'canada' ? 'canadiens' :
    activeRegion === 'afrique' ? 'africains' : 'haïtiens';

  const handleSocialGoogle = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await loginWithGoogle();
      triggerToast('Connexion Google réussie !');
      setScreen('dashboard');
    } catch (err: any) {
      console.error('Google auth error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('La fenêtre de connexion Google a été fermée avant la fin de l’authentification.');
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMessage('La fenêtre contextuelle a été bloquée. Veuillez autoriser les popups dans votre navigateur.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setErrorMessage('Une seule demande de connexion Google à la fois est autorisée.');
      } else {
        setErrorMessage(err.message || 'Échec de connexion avec Google. Veuillez réessayer.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (authMode === 'signup') {
      if (!firstName.trim() || !lastName.trim()) {
        setErrorMessage('Veuillez renseigner votre prénom et votre nom.');
        return;
      }
      if (!termsAccepted) {
        setErrorMessage('Veuillez accepter les conditions d’utilisation.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Les mots de passe ne correspondent pas.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Le mot de passe doit comporter au moins 6 caractères.');
        return;
      }
    } else {
      if (!email.trim() || !password) {
        setErrorMessage('Veuillez saisir votre courriel et votre mot de passe.');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (authMode === 'signup') {
        const fullName = `${firstName.trim()} ${lastName.trim()}`;
        await registerWithEmail(email, password, {
          fullName,
          companyName: companyName.trim() || undefined,
          phone: phone.trim() || undefined,
          region: activeRegion
        });

        triggerToast('Compte créé avec succès ! Bienvenue sur StartBill.');
        setScreen('company_setup');
      } else {
        // Mode Login
        const profile = await loginWithEmail(email, password);
        if (profile.isSuperAdmin) {
          triggerToast('Connexion Super Administrateur confirmée !');
          setScreen('admin');
        } else {
          triggerToast(`Heureux de vous revoir, ${profile.fullName || profile.email} !`);
          setScreen('dashboard');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('Cette adresse courriel est déjà utilisée. Connectez-vous.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setErrorMessage('Courriel ou mot de passe incorrect.');
      } else {
        setErrorMessage(err.message || 'Une erreur est survenue lors de l’authentification.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between py-6 px-4 sm:px-6 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Header */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setScreen('choose_region')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
          <span>Région : {REGIONS[activeRegion].name} {REGIONS[activeRegion].flag}</span>
        </button>

        <div 
          className="cursor-pointer transition hover:opacity-90" 
          onClick={() => setScreen('landing')}
          title="StartBill - Ton assistant financier"
        >
          <StartBillLogo variant="horizontal" size="xs" showTagline={false} />
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col justify-center my-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Branding (Desktop) */}
          <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 lg:p-10 flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <StartBillLogo 
                  variant="horizontal" 
                  size="sm" 
                  theme="dark" 
                  showTagline={true} 
                />
                <span className="text-[10px] text-blue-300 font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30">
                  {REGIONS[activeRegion].flag}
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-black tracking-tight text-white leading-tight">
                  Facturez sans stress, encaissez plus vite.
                </h2>
                <p className="text-xs text-slate-300 font-medium leading-relaxed mt-2">
                  La solution cloud de facturation, comptabilité et déclarations fiscales conçue pour les entrepreneurs, consultants et travailleurs autonomes.
                </p>
              </div>

              {/* Value Bullet Points */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Facturation professionnelle en 30s</div>
                    <div className="text-[11px] text-slate-400">Export PDF conforme et envoi en 1 clic</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Calcul automatique des taxes</div>
                    <div className="text-[11px] text-slate-400">Conforme TPS/TVQ/TVA selon votre région</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Multi-devises & paiements locaux</div>
                    <div className="text-[11px] text-slate-400">Interac (Canada), Mobile Money (Afrique), MonCash (Haïti)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="relative z-10 pt-6 border-t border-slate-800 space-y-2">
              <div className="flex items-center gap-1 text-amber-400 text-xs">
                ★★★★★
              </div>
              <p className="text-[11px] text-slate-300 italic">
                « StartBill m'évite les erreurs de taxes et me fait gagner 3 heures chaque semaine. Indispensable ! »
              </p>
              <div className="text-[10px] text-slate-400 font-semibold">
                — Julie D., Consultante indépendante
              </div>
            </div>
          </div>

          {/* Right Column: Form Panel */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
            
            {/* Header Title */}
            <div className="text-center sm:text-left space-y-1.5 mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-1">
                <span>Région active :</span>
                <strong>{REGIONS[activeRegion].flag} {REGIONS[activeRegion].name}</strong>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {authMode === 'signup' ? 'Créer votre compte' : 'Connexion à votre compte'}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Rejoignez les entrepreneurs {regionDemonym} qui ont choisi la simplicité avec StartBill.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" strokeWidth={1.75} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Mode Switcher Tabs */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMessage('');
                  }}
                  className={`text-xs font-black transition cursor-pointer pb-1 border-b-2 ${
                    authMode === 'signup' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'
                  }`}
                >
                  Créer un compte
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMessage('');
                  }}
                  className={`text-xs font-black transition cursor-pointer pb-1 border-b-2 ${
                    authMode === 'login' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'
                  }`}
                >
                  Se connecter
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {authMode === 'signup' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase text-slate-800 tracking-wider block">
                        PRÉNOM
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Ex: Marie"
                        className="w-full h-10 bg-white border border-slate-200 focus:border-blue-600 rounded-xl px-3 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase text-slate-800 tracking-wider block">
                        NOM
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Ex: Tremblay"
                        className="w-full h-10 bg-white border border-slate-200 focus:border-blue-600 rounded-xl px-3 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-800 tracking-wider block">
                      NOM DE L'ENTREPRISE (OPTIONNEL)
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Ex: Tremblay Conseil Inc."
                      className="w-full h-10 bg-white border border-slate-200 focus:border-blue-600 rounded-xl px-3 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-slate-800 tracking-wider block">
                  ADRESSE COURRIEL
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@entreprise.com"
                  className="w-full h-10 bg-white border border-slate-200 focus:border-blue-600 rounded-xl px-3 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {authMode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-800 tracking-wider block">
                    NUMÉRO DE TÉLÉPHONE (OPTIONNEL)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={activeRegion === 'canada' ? '+1 (514) 000-0000' : '+225 00 00 00 00'}
                    className="w-full h-10 bg-white border border-slate-200 focus:border-blue-600 rounded-xl px-3 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-slate-800 tracking-wider block">
                  MOT DE PASSE
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 caractères"
                    className="w-full h-10 bg-white border border-slate-200 focus:border-blue-600 rounded-xl pl-3 pr-10 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" strokeWidth={1.75} /> : <Eye className="w-3.5 h-3.5" strokeWidth={1.75} />}
                  </button>
                </div>
              </div>

              {authMode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-800 tracking-wider block">
                    CONFIRMER LE MOT DE PASSE
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Répétez le mot de passe"
                      className="w-full h-10 bg-white border border-slate-200 focus:border-blue-600 rounded-xl pl-3 pr-10 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" strokeWidth={1.75} /> : <Eye className="w-3.5 h-3.5" strokeWidth={1.75} />}
                    </button>
                  </div>
                </div>
              )}

              {authMode === 'signup' && (
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms-check"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="terms-check" className="text-[11px] text-slate-600 leading-tight cursor-pointer select-none">
                    J'accepte les conditions d'utilisation et la politique de confidentialité de StartBill.
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer text-xs mt-3"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>{authMode === 'signup' ? 'Créer mon compte' : 'Se connecter'}</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                  </>
                )}
              </button>
            </form>

            {/* Separator */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <span className="relative bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                OU CONTINUER AVEC
              </span>
            </div>

            {/* Google Login */}
            <button
              type="button"
              onClick={handleSocialGoogle}
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2 text-xs font-bold text-slate-700 shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.14C3.27 21.37 7.34 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.59H1.25C.46 8.16 0 9.94 0 12s.46 3.84 1.25 5.41l4.03-3.14z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.63 1.25 6.59l4.03 3.14c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Continuer avec Google</span>
            </button>

            {/* Quick Demo Pre-fill Bar */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setEmail(SUPER_ADMIN_EMAIL);
                  setPassword('StartbillAdmin2026!');
                  setErrorMessage('');
                  triggerToast('Identifiants Super Admin préremplis');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" strokeWidth={1.75} />
                <span>Admin HQ ({SUPER_ADMIN_EMAIL})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setEmail('demo.canada@startbill.com');
                  setPassword('demo123456');
                  setErrorMessage('');
                  triggerToast('Compte Démo Canada prérempli');
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold transition cursor-pointer"
              >
                <span>🇨🇦 Démo CAD</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setEmail('demo.afrique@startbill.com');
                  setPassword('demo123456');
                  setErrorMessage('');
                  triggerToast('Compte Démo Afrique prérempli');
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold transition cursor-pointer"
              >
                <span>🌍 Démo FCFA</span>
              </button>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
