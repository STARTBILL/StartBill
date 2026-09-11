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
}> = ({ initialRegion = 'canada', children }) => {
  const [region, setRegionState] = useState<'canada' | 'afrique' | 'haiti'>(initialRegion);
  const [regionalSettings, setRegionalSettings] = useState<RegionalSettingsDoc>(
    INITIAL_REGIONAL_SETTINGS[initialRegion] || INITIAL_REGIONAL_SETTINGS.canada
  );
  const [loading, setLoading] = useState<boolean>(true);

  // Charger la région depuis Firebase (users/{uid} puis regionalSettings/{userRegion})
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);

      let targetRegion: 'canada' | 'afrique' | 'haiti' = region;

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.region && ['canada', 'afrique', 'haiti'].includes(userData.region)) {
              targetRegion = userData.region as 'canada' | 'afrique' | 'haiti';
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

  // Modification de la région avec enregistrement dans Firestore si connecté
  const setRegion = async (newRegion: 'canada' | 'afrique' | 'haiti') => {
    setRegionState(newRegion);
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, 'users', user.uid), { region: newRegion }, { merge: true });
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
    const val = Number(amount) || 0;
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

