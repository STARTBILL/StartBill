export interface RegionConfig {
  id: 'canada' | 'afrique' | 'haiti';
  name: string;
  flag: string;
  platformPriority: 'web_first' | 'mobile_first';
  currency: string;
  currencySymbol: string;
  language: string;
  paymentProviders: string[];
  supportedChannels: string[];
  taxSystem: string;
}

export const REGIONS: Record<'canada' | 'afrique' | 'haiti', RegionConfig> = {
  canada: {
    id: 'canada',
    name: 'Canada',
    flag: '🇨🇦',
    platformPriority: 'web_first',
    currency: 'CAD',
    currencySymbol: '$',
    language: 'fr',
    paymentProviders: ['manual'],
    supportedChannels: ['email', 'pdf'],
    taxSystem: 'gst_hst_pst_qst'
  },
  afrique: {
    id: 'afrique',
    name: 'Afrique francophone',
    flag: '🌍',
    platformPriority: 'mobile_first',
    currency: 'FCFA',
    currencySymbol: 'FCFA',
    language: 'fr',
    paymentProviders: ['orange_money', 'wave', 'mtn_money', 'cash'],
    supportedChannels: ['whatsapp', 'sms'],
    taxSystem: 'none'
  },
  haiti: {
    id: 'haiti',
    name: 'Haïti',
    flag: '🇭🇹',
    platformPriority: 'mobile_first',
    currency: 'HTG',
    currencySymbol: 'HTG',
    language: 'fr',
    paymentProviders: ['moncash', 'cash'],
    supportedChannels: ['whatsapp', 'sms'],
    taxSystem: 'none'
  }
};

export const PAYMENT_PROVIDER_LABELS: Record<string, { label: string; icon: string }> = {
  manual: { label: 'Virement / Manuel', icon: '🏦' },
  orange_money: { label: 'Orange Money', icon: '🟧' },
  wave: { label: 'Wave', icon: '🌊' },
  mtn_money: { label: 'MTN MoMo', icon: '🟨' },
  moncash: { label: 'MonCash', icon: '📲' },
  cash: { label: 'Espèces', icon: '💵' }
};

export const CHANNEL_LABELS: Record<string, { label: string; icon: string }> = {
  email: { label: 'Courriel', icon: '✉️' },
  pdf: { label: 'PDF téléchargeable', icon: '📄' },
  whatsapp: { label: 'WhatsApp', icon: '💬' },
  sms: { label: 'SMS', icon: '📱' }
};
