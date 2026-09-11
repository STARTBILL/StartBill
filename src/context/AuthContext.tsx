import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserPlan } from '../lib/planAccess';
import { isSuperAdminEmail } from '../lib/authSecurity';

export interface UserProfile {
  uid: string;
  email: string | null;
  plan: UserPlan;
  fullName?: string;
  companyName?: string;
  region?: 'canada' | 'afrique' | 'haiti';
  role?: string;
  isAnonymous?: boolean;
  isSuperAdmin?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  userPlan: UserPlan;
  isSuperAdmin: boolean;
  updateUserPlan: (newPlan: UserPlan) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  userPlan: 'free',
  isSuperAdmin: false,
  updateUserPlan: async () => {},
  signOutUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        const userDocRef = doc(db, 'users', fbUser.uid);

        // Realtime listener for user profile doc in Firestore
        unsubscribeDoc = onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const effectiveEmail = fbUser.email || data.email || null;
            const isSuperAdmin = isSuperAdminEmail(effectiveEmail);
            setUser({
              uid: fbUser.uid,
              email: effectiveEmail,
              plan: isSuperAdmin ? 'enterprise' : ((data.plan as UserPlan) || 'free'),
              fullName: data.fullName || (isSuperAdmin ? 'Super Administrateur StartBill' : undefined),
              companyName: data.companyName || (isSuperAdmin ? 'StartBill HQ' : undefined),
              region: data.region,
              role: isSuperAdmin ? 'admin' : (data.role || 'user'),
              isAnonymous: fbUser.isAnonymous,
              isSuperAdmin
            });
          } else {
            // Default user profile if document doesn't exist yet
            const effectiveEmail = fbUser.email;
            const isSuperAdmin = isSuperAdminEmail(effectiveEmail);
            setUser({
              uid: fbUser.uid,
              email: effectiveEmail,
              plan: isSuperAdmin ? 'enterprise' : 'free',
              fullName: isSuperAdmin ? 'Super Administrateur StartBill' : undefined,
              role: isSuperAdmin ? 'admin' : 'user',
              isAnonymous: fbUser.isAnonymous,
              isSuperAdmin
            });
          }
          setLoading(false);
        }, (err) => {
          console.warn("AuthContext doc listener warning:", err);
          const effectiveEmail = fbUser.email;
          const isSuperAdmin = isSuperAdminEmail(effectiveEmail);
          setUser({
            uid: fbUser.uid,
            email: effectiveEmail,
            plan: isSuperAdmin ? 'enterprise' : 'free',
            role: isSuperAdmin ? 'admin' : 'user',
            isAnonymous: fbUser.isAnonymous,
            isSuperAdmin
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

  const updateUserPlan = async (newPlan: UserPlan) => {
    if (!firebaseUser) return;
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, {
        plan: newPlan,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setUser(prev => prev ? { ...prev, plan: newPlan } : null);
    } catch (error) {
      console.error("Failed to update user plan in Firestore:", error);
      // Fallback local update
      setUser(prev => prev ? { ...prev, plan: newPlan } : null);
    }
  };

  const signOutUser = async () => {
    await signOut(auth);
    setUser(null);
  };

  const userPlan: UserPlan = user?.plan || 'free';
  const isSuperAdmin: boolean = Boolean(user?.isSuperAdmin || isSuperAdminEmail(user?.email || firebaseUser?.email));

  return (
    <AuthContext.Provider value={{
      user,
      firebaseUser,
      loading,
      userPlan,
      isSuperAdmin,
      updateUserPlan,
      signOutUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
