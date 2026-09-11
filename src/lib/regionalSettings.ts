import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export interface RegionalSettingsDoc {
  country: string;
  region: 'canada' | 'afrique' | 'haiti';
  currency: string;
  currencySymbol: string;
  language: string;
  taxSystem: string;
  platformPriority: 'web_first' | 'mobile_first';
  invoicePaymentEnabled: boolean;
  manualCashPaymentEnabled: boolean;
  paymentProviders: string[];
  supportedCommunicationChannels: string[];
  preferredCommunicationChannel: string;
  pricingStart: number;
  pricingPro: number;
  dashboardMainLabel: string;
  learningMode: string;
  isActive: boolean;
  createdAt: string;
}

export const INITIAL_REGIONAL_SETTINGS: Record<'canada' | 'afrique' | 'haiti', RegionalSettingsDoc> = {
  canada: {
    country: 'Canada',
    region: 'canada',
    currency: 'CAD',
    currencySymbol: '$',
    language: 'fr',
    taxSystem: 'gst_hst_pst_qst',
    platformPriority: 'web_first',
    invoicePaymentEnabled: false,
    manualCashPaymentEnabled: true,
    paymentProviders: ['manual'],
    supportedCommunicationChannels: ['email', 'pdf'],
    preferredCommunicationChannel: 'email',
    pricingStart: 15,
    pricingPro: 30,
    dashboardMainLabel: 'Bonjour',
    learningMode: 'standard',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  afrique: {
    country: 'Afrique francophone',
    region: 'afrique',
    currency: 'FCFA',
    currencySymbol: 'FCFA',
    language: 'fr',
    taxSystem: 'none',
    platformPriority: 'mobile_first',
    invoicePaymentEnabled: true,
    manualCashPaymentEnabled: true,
    paymentProviders: ['orange_money', 'wave', 'mtn_money', 'cash'],
    supportedCommunicationChannels: ['whatsapp', 'sms'],
    preferredCommunicationChannel: 'whatsapp',
    pricingStart: 1500,
    pricingPro: 3000,
    dashboardMainLabel: 'Bonjour',
    learningMode: 'simplified',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  haiti: {
    country: 'Haïti',
    region: 'haiti',
    currency: 'HTG',
    currencySymbol: 'HTG',
    language: 'fr',
    taxSystem: 'none',
    platformPriority: 'mobile_first',
    invoicePaymentEnabled: true,
    manualCashPaymentEnabled: true,
    paymentProviders: ['moncash', 'cash'],
    supportedCommunicationChannels: ['whatsapp', 'sms'],
    preferredCommunicationChannel: 'whatsapp',
    pricingStart: 150,
    pricingPro: 300,
    dashboardMainLabel: 'Bonjou',
    learningMode: 'simplified',
    isActive: true,
    createdAt: new Date().toISOString()
  }
};

/**
 * Seed initial regionalSettings documents into Firestore if missing
 */
export async function seedRegionalSettingsInFirestore(): Promise<void> {
  try {
    for (const [key, config] of Object.entries(INITIAL_REGIONAL_SETTINGS)) {
      const docRef = doc(db, 'regionalSettings', key);
      await setDoc(docRef, config, { merge: true });
    }
  } catch (err) {
    // Fail gracefully if offline or permissions pending
  }
}

/**
 * Fetch regional settings for a given region from Firestore with local fallback
 */
export async function getRegionalSettingsFromFirestore(regionId: 'canada' | 'afrique' | 'haiti'): Promise<RegionalSettingsDoc> {
  try {
    const docRef = doc(db, 'regionalSettings', regionId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as RegionalSettingsDoc;
    }
  } catch (err) {
    console.warn(`Could not fetch regionalSettings for ${regionId}, using local fallback:`, err);
  }
  return INITIAL_REGIONAL_SETTINGS[regionId];
}
