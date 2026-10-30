import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser, 
  signOut,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserPlan, UserRole, FeatureKey, checkFeatureAccess, PLAN_LIMITS } from '../lib/planAccess';
import { isSuperAdminEmail } from '../lib/authSecurity';

export interface UserProfile {
  uid: string;
  email: string | null;
  plan: UserPlan;
  role: UserRole;
  fullName?: string;
  companyName?: string;
  phone?: string;
  region?: 'canada' | 'afrique' | 'haiti';
  isAnonymous?: boolean;
  isSuperAdmin?: boolean;
  dismissedNotificationIds?: string[];
  readNotificationIds?: string[];
  createdAt?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  userPlan: UserPlan;
  userRole: UserRole;
  isSuperAdmin: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<UserProfile>;
  registerWithEmail: (
    email: string, 
    pass: string, 
    extra?: { 
      fullName?: string; 
      companyName?: string; 
      phone?: string; 
      region?: string;
    }
  ) => Promise<UserProfile>;
  loginWithGoogle: (forceRedirect?: boolean) => Promise<UserProfile>;
  updateUserPlan: (newPlan: UserPlan) => Promise<void>;
  signOutUser: () => Promise<void>;
  canAccess: (feature: FeatureKey, requiredPlan?: UserPlan) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  userPlan: 'free',
  userRole: 'user',
  isSuperAdmin: false,
  loginWithEmail: async () => { throw new Error('Not initialized'); },
  registerWithEmail: async () => { throw new Error('Not initialized'); },
  loginWithGoogle: async (_forceRedirect?: boolean) => { throw new Error('Not initialized'); },
  updateUserPlan: async () => {},
  signOutUser: async () => {},
  canAccess: () => true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    // Check if user was redirected back from Google OAuth
    getRedirectResult(auth).then(async (cred) => {
      if (cred && cred.user) {
        console.log('[Auth] Google OAuth redirect resolved successfully for:', cred.user.email);
        await syncGoogleUserProfile(cred.user);
      }
    }).catch((redirectErr: any) => {
      if (redirectErr?.code) {
        console.warn('[Auth] getRedirectResult notice:', redirectErr.code, redirectErr.message);
      }
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        const userDocRef = doc(db, 'users', fbUser.uid);

        // Realtime listener for user profile doc in Firestore
        unsubscribeDoc = onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const effectiveEmail = fbUser.email || data.email || null;
            const isSuper = isSuperAdminEmail(effectiveEmail);
            const userRole: UserRole = isSuper ? 'admin' : ((data.role as UserRole) || 'user');
            const userPlan: UserPlan = isSuper ? 'enterprise' : ((data.plan as UserPlan) || 'free');

            setUser({
              uid: fbUser.uid,
              email: effectiveEmail,
              plan: userPlan,
              role: userRole,
              fullName: data.fullName || (isSuper ? 'Super Administrateur StartBill' : fbUser.displayName || undefined),
              companyName: data.companyName || (isSuper ? 'StartBill HQ' : undefined),
              phone: data.phone || fbUser.phoneNumber || undefined,
              region: data.region || 'canada',
              isAnonymous: fbUser.isAnonymous,
              isSuperAdmin: isSuper,
              dismissedNotificationIds: Array.isArray(data.dismissedNotificationIds) ? data.dismissedNotificationIds : [],
              readNotificationIds: Array.isArray(data.readNotificationIds) ? data.readNotificationIds : []
            });
          } else {
            // Default user profile if document doesn't exist yet
            const effectiveEmail = fbUser.email;
            const isSuper = isSuperAdminEmail(effectiveEmail);
            setUser({
              uid: fbUser.uid,
              email: effectiveEmail,
              plan: isSuper ? 'enterprise' : 'free',
              role: isSuper ? 'admin' : 'user',
              fullName: fbUser.displayName || (isSuper ? 'Super Administrateur StartBill' : undefined),
              isAnonymous: fbUser.isAnonymous,
              isSuperAdmin: isSuper
            });
          }
          setLoading(false);
        }, (err) => {
          console.warn("AuthContext doc listener warning:", err);
          const effectiveEmail = fbUser.email;
          const isSuper = isSuperAdminEmail(effectiveEmail);
          setUser({
            uid: fbUser.uid,
            email: effectiveEmail,
            plan: isSuper ? 'enterprise' : 'free',
            role: isSuper ? 'admin' : 'user',
            isAnonymous: fbUser.isAnonymous,
            isSuperAdmin: isSuper
          });
          setLoading(false);
        });
      } else {
        if (unsubscribeDoc) {
          unsubscribeDoc();
          unsubscribeDoc = null;
        }
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const loginWithEmail = async (email: string, pass: string): Promise<UserProfile> => {
    const normalizedEmail = email.trim().toLowerCase();
    let cred;
    try {
      cred = await signInWithEmailAndPassword(auth, normalizedEmail, pass);
    } catch (err: any) {
      // Auto-provision demo and administrator accounts on first attempt
      if (
        (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') &&
        (isSuperAdminEmail(normalizedEmail) || normalizedEmail.includes('demo.'))
      ) {
        try {
          const isSuper = isSuperAdminEmail(normalizedEmail);
          const initialRegion = normalizedEmail.includes('afrique') ? 'afrique' : normalizedEmail.includes('haiti') ? 'haiti' : 'canada';
          return await registerWithEmail(normalizedEmail, pass, {
            fullName: isSuper ? 'Ferline ZOGNI' : 'Utilisateur Démo',
            companyName: isSuper ? 'STARTBILL Inc.' : 'Entreprise Démo',
            region: initialRegion
          });
        } catch (regErr) {
          // If creation failed, rethrow original error
          throw err;
        }
      }
      throw err;
    }

    const fbUser = cred.user;
    const isSuper = isSuperAdminEmail(fbUser.email);
    
    // Check Firestore doc
    let profileData: any = {};
    try {
      const snap = await getDoc(doc(db, 'users', fbUser.uid));
      if (snap.exists()) {
        profileData = snap.data();
      } else {
        // Seed initial user document
        const initialRegion = normalizedEmail.includes('afrique') ? 'afrique' : normalizedEmail.includes('haiti') ? 'haiti' : 'canada';
        profileData = {
          uid: fbUser.uid,
          email: fbUser.email,
          role: isSuper ? 'admin' : 'user',
          plan: isSuper ? 'enterprise' : 'free',
          region: initialRegion,
          fullName: isSuper ? 'Ferline ZOGNI' : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', fbUser.uid), profileData, { merge: true });
      }
    } catch (docErr) {
      console.warn("Notice fetching user doc from Firestore:", docErr);
    }

    const loadedProfile: UserProfile = {
      uid: fbUser.uid,
      email: fbUser.email,
      plan: isSuper ? 'enterprise' : (profileData.plan || 'free'),
      role: isSuper ? 'admin' : (profileData.role || 'user'),
      fullName: profileData.fullName || fbUser.displayName || undefined,
      companyName: profileData.companyName,
      phone: profileData.phone,
      region: profileData.region || 'canada',
      isSuperAdmin: isSuper
    };
    setUser(loadedProfile);
    return loadedProfile;
  };

  const registerWithEmail = async (
    email: string, 
    pass: string, 
    extra?: { 
      fullName?: string; 
      companyName?: string; 
      phone?: string; 
      region?: 'canada' | 'afrique' | 'haiti' | string;
    }
  ): Promise<UserProfile> => {
    const normalizedEmail = email.trim().toLowerCase();

    // Règle absolue de sécurité : la sélection de région est obligatoire et restreinte
    const chosenRegion = extra?.region as 'canada' | 'afrique' | 'haiti';
    if (!chosenRegion || !['canada', 'afrique', 'haiti'].includes(chosenRegion)) {
      const err: any = new Error("La sélection de votre région d'exploitation (Canada, Afrique ou Haïti) est obligatoire à l'inscription pour garantir le cloisonnement strict de vos données.");
      err.code = 'auth/region-required';
      throw err;
    }

    // Enforce password requirements matching Firebase security policy
    if (pass.length < 8 || !/[A-Z]/.test(pass) || !/[^A-Za-z0-9]/.test(pass)) {
      const err: any = new Error("Le mot de passe doit comporter au moins 8 caractères, une lettre majuscule (A-Z) et un caractère spécial (ex: !?#@$).");
      err.code = 'auth/password-does-not-meet-requirements';
      throw err;
    }

    const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, pass);
    const fbUser = cred.user;
    const isSuper = isSuperAdminEmail(normalizedEmail);

    if (extra?.fullName) {
      await updateProfile(fbUser, { displayName: extra.fullName });
    }

    const effectiveRole: UserRole = isSuper ? 'admin' : 'user';
    const effectivePlan: UserPlan = isSuper ? 'enterprise' : 'free';

    // Stockage immuable de la région dans le profil utilisateur Firestore
    const userProfileData: any = {
      uid: fbUser.uid,
      email: normalizedEmail,
      role: effectiveRole,
      plan: effectivePlan,
      fullName: extra?.fullName || '',
      companyName: extra?.companyName || '',
      phone: extra?.phone || '',
      region: chosenRegion,
      regionLocked: true, // Verrouillage strict de sécurité
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', fbUser.uid), userProfileData, { merge: true });

    const newProfile: UserProfile = {
      uid: fbUser.uid,
      email: normalizedEmail,
      role: effectiveRole,
      plan: effectivePlan,
      fullName: extra?.fullName,
      companyName: extra?.companyName,
      phone: extra?.phone,
      region: chosenRegion,
      isSuperAdmin: isSuper
    };

    setUser(newProfile);
    return newProfile;
  };

  const syncGoogleUserProfile = async (fbUser: FirebaseUser): Promise<UserProfile> => {
    const isSuper = isSuperAdminEmail(fbUser.email);
    const userDocRef = doc(db, 'users', fbUser.uid);
    let profile: UserProfile;

    try {
      const snap = await getDoc(userDocRef);

      if (snap.exists()) {
        const data = snap.data();
        profile = {
          uid: fbUser.uid,
          email: fbUser.email,
          plan: isSuper ? 'enterprise' : ((data.plan as UserPlan) || 'free'),
          role: isSuper ? 'admin' : ((data.role as UserRole) || 'user'),
          fullName: data.fullName || fbUser.displayName || (isSuper ? 'Super Administrateur StartBill' : undefined),
          companyName: data.companyName || (isSuper ? 'StartBill HQ' : undefined),
          phone: data.phone || fbUser.phoneNumber || undefined,
          region: data.region || 'canada',
          isAnonymous: fbUser.isAnonymous,
          isSuperAdmin: isSuper
        };
      } else {
        const effectiveRole: UserRole = isSuper ? 'admin' : 'user';
        const initialProfile = {
          uid: fbUser.uid,
          email: fbUser.email,
          role: effectiveRole,
          plan: isSuper ? 'enterprise' : 'free',
          fullName: fbUser.displayName || (isSuper ? 'Super Administrateur StartBill' : ''),
          phone: fbUser.phoneNumber || '',
          region: 'canada',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userDocRef, initialProfile, { merge: true });

        profile = {
          uid: fbUser.uid,
          email: fbUser.email,
          plan: isSuper ? 'enterprise' : 'free',
          role: effectiveRole,
          fullName: fbUser.displayName || (isSuper ? 'Super Administrateur StartBill' : undefined),
          phone: fbUser.phoneNumber || undefined,
          region: 'canada',
          isAnonymous: fbUser.isAnonymous,
          isSuperAdmin: isSuper
        };
      }
    } catch (docErr) {
      console.warn("Notice fetching Google user profile from Firestore:", docErr);
      profile = {
        uid: fbUser.uid,
        email: fbUser.email,
        plan: isSuper ? 'enterprise' : 'free',
        role: isSuper ? 'admin' : 'user',
        fullName: fbUser.displayName || (isSuper ? 'Super Administrateur StartBill' : undefined),
        phone: fbUser.phoneNumber || undefined,
        region: 'canada',
        isAnonymous: fbUser.isAnonymous,
        isSuperAdmin: isSuper
      };
    }

    setUser(profile);
    return profile;
  };

  const loginWithGoogle = async (forceRedirect: boolean = false): Promise<UserProfile> => {
    const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

    if (forceRedirect && !isInIframe) {
      await signInWithRedirect(auth, googleProvider);
      return new Promise<UserProfile>(() => {});
    }

    try {
      const cred = await signInWithPopup(auth, googleProvider);
      return await syncGoogleUserProfile(cred.user);
    } catch (popupErr: any) {
      // In top-level tabs, if popup is blocked by the browser, fallback seamlessly to redirect
      if (
        (popupErr.code === 'auth/popup-blocked' || popupErr.code === 'auth/cancelled-popup-request') &&
        !isInIframe
      ) {
        console.warn("[Auth] Popup blocked or cancelled outside iframe, falling back to signInWithRedirect...");
        await signInWithRedirect(auth, googleProvider);
        return new Promise<UserProfile>(() => {});
      }
      throw popupErr;
    }
  };

  const updateUserPlan = async (newPlan: UserPlan) => {
    try {
      localStorage.setItem('startbill_user_plan', newPlan);
      localStorage.setItem('startbill_is_pro', (newPlan === 'pro' || newPlan === 'enterprise' || newPlan === 'start') ? 'true' : 'false');
    } catch {}

    setUser(prev => prev ? { ...prev, plan: newPlan } : {
      uid: 'demo_user',
      email: null,
      plan: newPlan,
      role: 'user',
      isAnonymous: false,
      isSuperAdmin: false
    });

    const targetUid = firebaseUser?.uid || user?.uid;
    if (!targetUid) return;

    try {
      const userDocRef = doc(db, 'users', targetUid);
      await setDoc(userDocRef, {
        plan: newPlan,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Also create or update subscription record in Firestore
      const subId = `sub_${targetUid}`;
      await setDoc(doc(db, 'subscriptions', subId), {
        id: subId,
        userId: targetUid,
        userEmail: user?.email || firebaseUser?.email || '',
        plan: newPlan,
        status: 'active',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.warn("Notice updating user plan in Firestore:", error);
    }
  };

  const signOutUser = async () => {
    await signOut(auth);
    setUser(null);
  };

  const userPlan: UserPlan = user?.plan || 'free';
  const userRole: UserRole = user?.role || 'user';
  const isSuperAdmin: boolean = Boolean(user?.isSuperAdmin || isSuperAdminEmail(user?.email || firebaseUser?.email));

  const canAccess = (feature: FeatureKey, requiredPlan?: UserPlan): boolean => {
    if (isSuperAdmin) return true;
    return checkFeatureAccess(userPlan, feature, requiredPlan);
  };

  return (
    <AuthContext.Provider value={{
      user,
      firebaseUser,
      loading,
      userPlan,
      userRole,
      isSuperAdmin,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      updateUserPlan,
      signOutUser,
      canAccess
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
