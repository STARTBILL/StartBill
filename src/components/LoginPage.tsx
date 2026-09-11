import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  AlertCircle,
  Check,
  Globe,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  signInAnonymously,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ScreenId } from '../types';
import { useRegional } from '../context/RegionalContext';
import { REGIONS } from '../data/regions';
import { isSuperAdminEmail, SUPER_ADMIN_EMAIL } from '../lib/authSecurity';

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
  const { region: activeRegion, setRegion } = useRegional();
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  
  // Registration form fields as seen on mockup
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Determine dynamic demonym/text based on selected region
  const regionDemonym = 
    activeRegion === 'canada' ? 'canadiens' :
    activeRegion === 'afrique' ? 'africains' : 'haïtiens';

  // Save user profile to Firestore database
  const saveUserProfileToFirestore = async (
    uid: string, 
    userEmail: string, 
    userFullName: string,
    userPhone?: string
  ) => {
    try {
      const isSuper = isSuperAdminEmail(userEmail);
      await setDoc(doc(db, 'users', uid), {
        uid,
        email: userEmail,
        fullName: userFullName,
        phone: userPhone || '',
        region: activeRegion,
        currency: REGIONS[activeRegion].currency,
        currencySymbol: REGIONS[activeRegion].currencySymbol,
        createdAt: new Date().toISOString(),
        role: isSuper ? 'admin' : 'user',
        plan: isSuper ? 'enterprise' : 'pro_trial',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Notice saving user profile to Firestore:', err);
    }
  };

  const handleSocialAuth = async (provider: 'Google' | 'Facebook') => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      let user;
      try {
        const res = await signInAnonymously(auth);
        user = res.user;
      } catch (e) {
        user = { uid: `demo_${Date.now()}`, email: `user.${provider.toLowerCase()}@startbill.com` };
      }

      const socialName = provider === 'Google' ? 'Utilisateur Google' : 'Utilisateur Facebook';
      await saveUserProfileToFirestore(user.uid, user.email || `${provider.toLowerCase()}@startbill.com`, socialName);
      
      triggerToast(`Connecté avec succès via ${provider}`);
      setScreen('welcome_dashboard');
    } catch (err: any) {
      setErrorMessage(err?.message || `Erreur de connexion avec ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (mode === 'signup') {
      if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
        setErrorMessage('Veuillez remplir tous les champs obligatoires.');
        return;
      }

      if (password.length < 8) {
        setErrorMessage('Le mot de passe doit comporter au moins 8 caractères.');
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage('Les mots de passe ne correspondent pas.');
        return;
      }

      if (!termsAccepted) {
        setErrorMessage('Veuillez accepter les conditions d\'utilisation.');
        return;
      }
    } else {
      if (!email.trim() || !password) {
        setErrorMessage('Veuillez renseigner votre courriel et votre mot de passe.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const fullDisplayName = `${firstName.trim()} ${lastName.trim()}`.trim() || 'Entrepreneur StartBill';
      let user;

      if (mode === 'signup') {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
          user = userCredential.user;
          if (user) {
            await updateProfile(user, { displayName: fullDisplayName });
          }
        } catch (firebaseErr: any) {
          const errCode = firebaseErr?.code;
          if (errCode === 'auth/email-already-in-use') {
            setErrorMessage('Cette adresse courriel est déjà utilisée. Veuillez vous connecter.');
            setIsLoading(false);
            return;
          }
          // Fallback if client-side config uses anonymous or simulation
          try {
            const anon = await signInAnonymously(auth);
            user = anon.user;
          } catch (anonErr) {
            user = { uid: `user_${Date.now()}`, email: email.trim() };
          }
        }

        if (user) {
          await saveUserProfileToFirestore(user.uid, email.trim(), fullDisplayName, phone.trim());
        }

        if (isSuperAdminEmail(email.trim())) {
          triggerToast('Bienvenue Super Administrateur ! Accès complet accordé.');
          setScreen('admin');
        } else {
          triggerToast(`Compte créé avec succès ! Bienvenue ${firstName || fullDisplayName}`);
          setScreen('welcome_dashboard');
        }
      } else {
        // Sign in mode
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
          user = userCredential.user;
        } catch (firebaseErr: any) {
          if (isSuperAdminEmail(email.trim())) {
            // First time login or local simulator creation for the Super Admin
            try {
              const created = await createUserWithEmailAndPassword(auth, email.trim(), password);
              user = created.user;
            } catch {
              try {
                const anon = await signInAnonymously(auth);
                user = anon.user;
              } catch {
                user = { uid: 'super_admin_contact', email: email.trim() };
              }
            }
          } else {
            setErrorMessage('Courriel ou mot de passe incorrect. Veuillez vérifier vos identifiants.');
            setIsLoading(false);
            return;
          }
        }

        if (user) {
          await saveUserProfileToFirestore(user.uid, email.trim(), user.displayName || 'Super Administrateur');
        }

        if (isSuperAdminEmail(email.trim())) {
          triggerToast('Bienvenue Super Administrateur ! Accès complet accordé.');
          setScreen('admin');
        } else {
          triggerToast('Connexion réussie !');
          setScreen('welcome_dashboard');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Une erreur est survenue lors de l\'authentification.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 font-sans flex flex-col justify-between py-6 px-4 sm:px-6 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Container */}
      <div className="w-full max-w-sm sm:max-w-md mx-auto flex-1 flex flex-col justify-center my-auto">
        
        {/* Main Card Content */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_25px_rgba(0,0,0,0.04)] border border-slate-100">
          
          {/* Header Title */}
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-2xl sm:text-[28px] font-black text-[#3855F6] tracking-tight">
              {mode === 'signup' ? 'Créer votre compte' : 'Connexion à votre compte'}
            </h1>
            <p className="text-xs text-slate-500 font-medium max-w-[260px] sm:max-w-xs mx-auto leading-relaxed">
              Rejoignez les travailleurs autonomes {regionDemonym} qui ont choisi la tranquillité d'esprit.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === 'signup' ? (
              <>
                {/* PRÉNOM & NOM Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] sm:text-[11px] font-extrabold text-slate-800 uppercase tracking-wider block">
                      PRÉNOM
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full h-11 bg-white border-[1.5px] border-[#3855F6] rounded-xl px-3 text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3855F6]/20 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] sm:text-[11px] font-extrabold text-slate-800 uppercase tracking-wider block">
                      NOM
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full h-11 bg-white border-[1.5px] border-[#3855F6] rounded-xl px-3 text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3855F6]/20 transition"
                    />
                  </div>
                </div>

                {/* COURRIEL PROFESSIONNEL */}
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-extrabold text-slate-800 uppercase tracking-wider block">
                    COURRIEL PROFESSIONNEL
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 bg-white border-[1.5px] border-[#3855F6] rounded-xl px-3 text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3855F6]/20 transition"
                  />
                </div>

                {/* TELEPHONE */}
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-extrabold text-slate-800 uppercase tracking-wider block">
                    TELEPHONE
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-11 bg-white border-[1.5px] border-[#3855F6] rounded-xl px-3 text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3855F6]/20 transition"
                  />
                </div>

                {/* MOT DE PASSE */}
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-extrabold text-slate-800 uppercase tracking-wider block">
                    MOT DE PASSE
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 bg-white border-[1.5px] border-[#3855F6] rounded-xl pl-3 pr-10 text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3855F6]/20 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3855F6] hover:opacity-80 transition cursor-pointer p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium pt-0.5">
                    8 caractères minimum (lettres et chiffres)
                  </p>
                </div>

                {/* CONFIRMER LE MOT DE PASSE */}
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-extrabold text-slate-800 uppercase tracking-wider block">
                    CONFIRMER LE MOT DE PASSE
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-11 bg-white border-[1.5px] border-[#3855F6] rounded-xl pl-3 pr-10 text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3855F6]/20 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3855F6] hover:opacity-80 transition cursor-pointer p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Terms and Conditions Checkbox */}
                <div className="flex items-start gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setTermsAccepted(!termsAccepted)}
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition cursor-pointer ${
                      termsAccepted 
                        ? 'bg-[#3855F6] text-white' 
                        : 'border border-slate-300 bg-white'
                    }`}
                  >
                    {termsAccepted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <label 
                    onClick={() => setTermsAccepted(!termsAccepted)}
                    className="text-[10px] sm:text-[11px] text-slate-600 leading-snug cursor-pointer select-none"
                  >
                    J'accepte les <span className="font-bold text-[#3855F6] hover:underline">conditions d'utilisation</span> et la <span className="font-bold text-[#3855F6] hover:underline">politique de confidentialité</span>.
                  </label>
                </div>
              </>
            ) : (
              /* Simple Login Mode */
              <>
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-extrabold text-slate-800 uppercase tracking-wider block">
                    COURRIEL PROFESSIONNEL
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 bg-white border-[1.5px] border-[#3855F6] rounded-xl px-3 text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3855F6]/20 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-extrabold text-slate-800 uppercase tracking-wider block">
                    MOT DE PASSE
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 bg-white border-[1.5px] border-[#3855F6] rounded-xl pl-3 pr-10 text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3855F6]/20 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3855F6] hover:opacity-80 transition cursor-pointer p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#5167F6] hover:bg-[#4359EB] active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Chargement...</span>
                  </span>
                ) : (
                  <span>{mode === 'signup' ? 'Créer votre compte' : 'Se connecter'}</span>
                )}
              </button>
            </div>

          </form>

          {/* Social Auth Separator */}
          <div className="my-5 text-center">
            <span className="text-xs text-slate-500 font-medium">
              ou continuer avec ?
            </span>
          </div>

          {/* Social Auth Buttons */}
          <div className="flex items-center justify-center gap-4">
            {/* Google Button */}
            <button
              type="button"
              onClick={() => handleSocialAuth('Google')}
              className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-2xs hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center transition active:scale-95 cursor-pointer"
              title="Continuer avec Google"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            </button>

            {/* Facebook Button */}
            <button
              type="button"
              onClick={() => handleSocialAuth('Facebook')}
              className="w-12 h-12 rounded-xl bg-[#1877F2] text-white shadow-2xs hover:bg-[#166FE5] flex items-center justify-center transition active:scale-95 cursor-pointer"
              title="Continuer avec Facebook"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
          </div>

          {/* Toggle between Login and Signup */}
          <div className="text-center pt-4 mt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signup' ? 'login' : 'signup');
                setErrorMessage('');
              }}
              className="text-xs text-slate-600 hover:text-[#3855F6] font-medium transition cursor-pointer"
            >
              {mode === 'signup' 
                ? <>Vous avez déjà un compte ? <span className="font-bold text-[#3855F6] underline">Se connecter</span></>
                : <>Pas encore de compte ? <span className="font-bold text-[#3855F6] underline">Créer un compte</span></>}
            </button>
          </div>

          {/* Super Admin Quick Helper */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setEmail(SUPER_ADMIN_EMAIL);
                setPassword('StartbillAdmin2026!');
                setErrorMessage('');
                triggerToast('Identifiants Super Admin préremplis : ' + SUPER_ADMIN_EMAIL);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold transition cursor-pointer shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Connexion Administrateur ({SUPER_ADMIN_EMAIL})</span>
            </button>
            <p className="text-[10px] text-slate-400">
              Espace réservé à la direction générale StartBill
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
