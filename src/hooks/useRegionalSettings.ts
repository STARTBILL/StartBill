import { useState, useEffect } from 'react';
import { 
  RegionalSettingsDoc, 
  getRegionalSettingsFromFirestore, 
  INITIAL_REGIONAL_SETTINGS 
} from '../lib/regionalSettings';
import { REGIONS, RegionConfig } from '../data/regions';

export function useRegionalSettings(region: 'canada' | 'afrique' | 'haiti' = 'canada') {
  const [regionalSettings, setRegionalSettings] = useState<RegionalSettingsDoc>(
    INITIAL_REGIONAL_SETTINGS[region] || INITIAL_REGIONAL_SETTINGS.canada
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getRegionalSettingsFromFirestore(region)
      .then((data) => {
        if (isMounted) {
          setRegionalSettings(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn(`Error in useRegionalSettings hook for ${region}:`, err);
        if (isMounted) {
          setRegionalSettings(INITIAL_REGIONAL_SETTINGS[region] || INITIAL_REGIONAL_SETTINGS.canada);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [region]);

  const currencySymbol = regionalSettings.currencySymbol;
  const currency = regionalSettings.currency;

  /**
   * Helper to format amount according to regional currency symbol and locale
   */
  const formatPrice = (amount: number): string => {
    if (region === 'canada') {
      return `${amount.toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencySymbol}`;
    }
    return `${Math.round(amount).toLocaleString('fr-FR')} ${currencySymbol}`;
  };

  /**
   * Helper to check if communication channel (whatsapp, sms, email, pdf) is supported
   */
  const hasChannel = (channel: string): boolean => {
    return regionalSettings.supportedCommunicationChannels?.includes(channel) ?? false;
  };

  /**
   * Helper to check if payment provider is enabled
   */
  const hasPaymentProvider = (provider: string): boolean => {
    return regionalSettings.paymentProviders?.includes(provider) ?? false;
  };

  return {
    regionalSettings,
    loading,
    currencySymbol,
    currency,
    formatPrice,
    hasChannel,
    hasPaymentProvider
  };
}
