import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { 
  RegionalSettingsDoc, 
  getRegionalSettingsFromFirestore, 
  INITIAL_REGIONAL_SETTINGS 
} from '../lib/regionalSettings';
import { REGIONS } from '../data/regions';
import { DEFAULT_ACTIVE_REGION, isRegionEnabled, resolveActiveRegion } from '../config/featureFlags';

interface RegionalContextType {
  region: 'canada' | 'afrique' | 'haiti';
  setRegion: (region: 'canada' | 'afrique' | 'haiti') => Promise<void> | void;
  regionalSettings: RegionalSettingsDoc;
  loading: boolean;
  isWebFirst: boolean;
  isMobileFirst: boolean;
  currencySymbol: string;
  currency: string;
  paymentProviders: string[];
  channels: string[];
  pricingStart: number;
  pricingPro: number;
  formatPrice: (amount: number) => string;
  hasChannel: (channel: string) => boolean;
  hasPaymentProvider: (provider: string) => boolean;
}

const RegionalContext = createContext<RegionalContextType | undefined>(undefined);

export const RegionalProvider: React.FC<{
  initialRegion?: 'canada' | 'afrique' | 'haiti';
  children: React.ReactNode;
}> = ({ initialRegion = DEFAULT_ACTIVE_REGION, children }) => {
  const safeInitialRegion = resolveActiveRegion(initialRegion);
  const [region, setRegionState] = useState<'canada' | 'afrique' | 'haiti'>(safeInitialRegion);
  const [regionalSettings, setRegionalSettings] = useState<RegionalSettingsDoc>(
    INITIAL_REGIONAL_SETTINGS[safeInitialRegion] || INITIAL_REGIONAL_SETTINGS.canada
  );
  const [loading, setLoading] = useState<boolean>(true);

  // Charger la région depuis Firebase (users/{uid} puis regionalSettings/{userRegion})
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);

      let targetRegion: 'canada' | 'afrique' | 'haiti' = resolveActiveRegion(region);

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.region && ['canada', 'afrique', 'haiti'].includes(userData.region)) {
              targetRegion = resolveActiveRegion(userData.region);
            }
          }
        } catch (error) {
          // Gracefully fallback to current region when offline or connecting
          console.warn('Information région utilisateur non disponible (mode hors-ligne ou initialisation) :', error);
        }
      }

      if (isMounted) {
        setRegionState(targetRegion);
      }

      try {
        const settings = await getRegionalSettingsFromFirestore(targetRegion);
        if (isMounted) {
          setRegionalSettings(settings);
        }
      } catch (err) {
        console.error('Erreur chargement paramètres régionaux :', err);
        if (isMounted) {
          setRegionalSettings(INITIAL_REGIONAL_SETTINGS[targetRegion] || INITIAL_REGIONAL_SETTINGS.canada);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Modification de la région : autorisée uniquement pour visiteur hors-ligne ou super-admin, et si la région est activée par le Feature Flag
  const setRegion = async (newRegion: 'canada' | 'afrique' | 'haiti') => {
    if (!isRegionEnabled(newRegion)) {
      console.info(`[FeatureFlag] Région "${newRegion}" désactivée pour cette version. Maintien sur ${DEFAULT_ACTIVE_REGION}.`);
      setRegionState(DEFAULT_ACTIVE_REGION);
      return;
    }

    const user = auth.currentUser;
    // Vérification de sécurité : un utilisateur standard ne peut pas changer sa région d'inscription
    if (user && !user.isAnonymous) {
      const isSuper = user.email && (
        user.email.toLowerCase() === 'contact.startbill@gmail.com' ||
        user.email.toLowerCase() === 'admin.canada@startbill.com'
      );
      if (!isSuper) {
        console.warn('Sécurité : La région d’un compte utilisateur est immuable après l’inscription.');
        return;
      }
    }

    setRegionState(newRegion);
    setLoading(true);

    try {
      if (user) {
        const isSuper = user.email && (
          user.email.toLowerCase() === 'contact.startbill@gmail.com' ||
          user.email.toLowerCase() === 'admin.canada@startbill.com'
        );
        if (isSuper) {
          await setDoc(doc(db, 'users', user.uid), { region: newRegion }, { merge: true });
        }
      }

      const settings = await getRegionalSettingsFromFirestore(newRegion);
      setRegionalSettings(settings);
    } catch (err) {
      console.error('Erreur lors du changement de région :', err);
      setRegionalSettings(INITIAL_REGIONAL_SETTINGS[newRegion] || INITIAL_REGIONAL_SETTINGS.canada);
    } finally {
      setLoading(false);
    }
  };

  const isWebFirst = regionalSettings?.platformPriority === 'web_first';
  const isMobileFirst = regionalSettings?.platformPriority === 'mobile_first';
  const currencySymbol = regionalSettings?.currencySymbol || '$';
  const currency = regionalSettings?.currency || 'CAD';
  const paymentProviders = regionalSettings?.paymentProviders || ['manual'];
  const channels = regionalSettings?.supportedCommunicationChannels || ['email'];
  const pricingStart = regionalSettings?.pricingStart || 0;
  const pricingPro = regionalSettings?.pricingPro || 0;

  const formatPrice = (amount: number): string => {
    // Non-negative clamp: refuse any negative monetary value
    const rawVal = Number(amount) || 0;
    const val = Math.max(0, rawVal);
    if (region === 'canada') {
      return `$ ${val.toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (region === 'haiti') {
      return `${val.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} HTG`;
    } else {
      return `${Math.round(val).toLocaleString('fr-FR')} FCFA`;
    }
  };

  const hasChannel = (channel: string): boolean => {
    return channels.includes(channel);
  };

  const hasPaymentProvider = (provider: string): boolean => {
    return paymentProviders.includes(provider);
  };

  const value: RegionalContextType = {
    region,
    setRegion,
    regionalSettings,
    loading,
    isWebFirst,
    isMobileFirst,
    currencySymbol,
    currency,
    paymentProviders,
    channels,
    pricingStart,
    pricingPro,
    formatPrice,
    hasChannel,
    hasPaymentProvider
  };

  return (
    <RegionalContext.Provider value={value}>
      {children}
    </RegionalContext.Provider>
  );
};

export const useRegional = () => {
  const context = useContext(RegionalContext);
  if (!context) {
    throw new Error('useRegional must be used within RegionalProvider');
  }
  return context;
};

// Backwards compatibility alias
export const useRegionalContext = useRegional;

