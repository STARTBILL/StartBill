/**
 * REGIONAL TAXES MANAGEMENT & CONFIGURATION
 * 
 * Strict segregation of tax systems by region:
 * - Canada: Canadian GST/HST/PST/QST system with provincial rates (ARC / Revenu Québec).
 * - Afrique: Fully manual, user-defined tax configuration (e.g. TVA 18%, custom rate, NIF).
 * - Haïti: Fully manual, user-defined tax configuration (e.g. TCA 10%, custom rate, NIF).
 * 
 * Strictly isolates configs per region (startbill_tax_config_[region]).
 * NEVER mixes Canadian taxes into Africa or Haiti.
 */

export type TaxRegion = 'canada' | 'afrique' | 'haiti';

export interface RegionalTaxConfig {
  region: TaxRegion;
  enabled: boolean; // Si la perception de taxe est active ou exonérée (0%)
  
  // Paramètres Canada (Régime TPS/TVQ/TVH)
  isSmallSupplierExempt?: boolean; // Seuil 30 000 $ ARC (dispense d'inscription)
  tpsNumber?: string; // Ex: 123456789 RT0001
  tvqNumber?: string; // Ex: 1234567890 TQ0001
  defaultProvince?: string;

  // Paramètres configurables manuellement pour l'Afrique et Haïti
  taxName: string; // Ex: "TVA", "TCA", "Taxe locale", etc.
  taxRatePercent: number; // Ex: 18, 10, 19.25, 0 (saisie manuelle libre)
  taxNumber?: string; // Ex: NIF, IFU, RCCM, Matricule Fiscal
  taxNumberLabel?: string; // "Numéro d'Identification Fiscale (NIF)"
  
  // Surtaxe / Seconde taxe manuelle optionnelle
  hasSecondTax?: boolean;
  secondTaxName?: string; // Ex: "Centimes additionnels", "Taxe communale"
  secondTaxRatePercent?: number; // Ex: 1.8
}

export const CANADIAN_PROVINCES = [
  { name: 'Québec', gst: 0.05, pst: 0.09975, pstLabel: 'TVQ (9.975%)', gstLabel: 'TPS (5%)', totalRate: 0.14975 },
  { name: 'Ontario', gst: 0, pst: 0.13, pstLabel: 'TVH (13%)', gstLabel: '', totalRate: 0.13 },
  { name: 'Alberta', gst: 0.05, pst: 0, pstLabel: '', gstLabel: 'TPS (5%)', totalRate: 0.05 },
  { name: 'Colombie-Britannique', gst: 0.05, pst: 0.07, pstLabel: 'TVP (7%)', gstLabel: 'TPS (5%)', totalRate: 0.12 },
  { name: 'Manitoba', gst: 0.05, pst: 0.07, pstLabel: 'TVP/RST (7%)', gstLabel: 'TPS (5%)', totalRate: 0.12 },
  { name: 'Saskatchewan', gst: 0.05, pst: 0.06, pstLabel: 'TVP (6%)', gstLabel: 'TPS (5%)', totalRate: 0.11 },
  { name: 'Nouvelle-Écosse', gst: 0, pst: 0.15, pstLabel: 'TVH (15%)', gstLabel: '', totalRate: 0.15 },
  { name: 'Nouveau-Brunswick', gst: 0, pst: 0.15, pstLabel: 'TVH (15%)', gstLabel: '', totalRate: 0.15 },
  { name: 'Terre-Neuve-et-Labrador', gst: 0, pst: 0.15, pstLabel: 'TVH (15%)', gstLabel: '', totalRate: 0.15 },
  { name: 'Île-du-Prince-Édouard', gst: 0, pst: 0.15, pstLabel: 'TVH (15%)', gstLabel: '', totalRate: 0.15 },
  { name: 'Territoires', gst: 0.05, pst: 0, pstLabel: '', gstLabel: 'TPS (5%)', totalRate: 0.05 },
];

export const DEFAULT_TAX_CONFIGS: Record<TaxRegion, RegionalTaxConfig> = {
  canada: {
    region: 'canada',
    enabled: true,
    isSmallSupplierExempt: false,
    tpsNumber: '',
    tvqNumber: '',
    defaultProvince: 'Québec',
    taxName: 'TPS / TVQ',
    taxRatePercent: 14.975,
    taxNumberLabel: 'Numéro TPS (ARC) / TVQ (MRQ)'
  },
  afrique: {
    region: 'afrique',
    enabled: true,
    taxName: 'TVA',
    taxRatePercent: 18,
    taxNumber: '',
    taxNumberLabel: "Numéro d'Identification Fiscale (NIF) / RCCM",
    hasSecondTax: false,
    secondTaxName: 'Centimes additionnels',
    secondTaxRatePercent: 0
  },
  haiti: {
    region: 'haiti',
    enabled: true,
    taxName: 'TCA',
    taxRatePercent: 10,
    taxNumber: '',
    taxNumberLabel: 'NIF / Matricule Fiscal',
    hasSecondTax: false,
    secondTaxName: 'Taxe locale',
    secondTaxRatePercent: 0
  }
};

/**
 * Load the strict tax configuration for a specific region.
 */
export function getRegionalTaxConfig(region: TaxRegion = 'canada'): RegionalTaxConfig {
  const defaultConf = DEFAULT_TAX_CONFIGS[region] || DEFAULT_TAX_CONFIGS.canada;
  if (typeof window === 'undefined') return { ...defaultConf };

  try {
    const key = `startbill_tax_config_${region}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultConf, ...parsed, region };
    }

    // Migration / fallback for Canada legacy keys
    if (region === 'canada') {
      const tps = localStorage.getItem('sb_tax_tps') || '';
      const tvq = localStorage.getItem('sb_tax_tvq') || '';
      const isExempt = localStorage.getItem('sb_tax_exempt') === 'true';
      return {
        ...defaultConf,
        tpsNumber: tps,
        tvqNumber: tvq,
        isSmallSupplierExempt: isExempt
      };
    }
  } catch (err) {
    console.warn(`Error loading tax config for ${region}:`, err);
  }

  return { ...defaultConf };
}

/**
 * Save strict tax configuration for a specific region.
 */
export function saveRegionalTaxConfig(config: RegionalTaxConfig): void {
  if (typeof window === 'undefined') return;

  try {
    const key = `startbill_tax_config_${config.region}`;
    localStorage.setItem(key, JSON.stringify(config));

    // Mirror legacy keys for Canada if applicable
    if (config.region === 'canada') {
      if (config.tpsNumber !== undefined) localStorage.setItem('sb_tax_tps', config.tpsNumber);
      if (config.tvqNumber !== undefined) localStorage.setItem('sb_tax_tvq', config.tvqNumber);
      localStorage.setItem('sb_tax_exempt', String(!!config.isSmallSupplierExempt));
    }

    // Broadcast global event for immediate update across all open tabs/views
    window.dispatchEvent(new CustomEvent('startbill-tax-config-updated', {
      detail: { region: config.region, config }
    }));
  } catch (err) {
    console.warn(`Error saving tax config for ${config.region}:`, err);
  }
}

export interface CalculatedRegionalTax {
  region: TaxRegion;
  taxName: string;
  taxRateDisplay: string;
  isExempt: boolean;
  tax1Name: string;
  tax1Amount: number;
  tax2Name?: string;
  tax2Amount?: number;
  totalTax: number;
  total: number;
}

/**
 * Calculate taxes strictly conforming to the user's active region.
 * 
 * - Canada: Uses Canadian province rules (TPS 5% + TVQ 9.975% in QC, etc.).
 * - Afrique / Haïti: Uses the user's manually entered tax configuration (TVA 18%, TCA 10%, etc.).
 */
export function calculateRegionalTaxes(
  subtotal: number,
  region: TaxRegion = 'canada',
  provinceOrCustomRate?: string | number,
  overrideExempt?: boolean
): CalculatedRegionalTax {
  const safeSubtotal = Math.max(0, subtotal || 0);
  const config = getRegionalTaxConfig(region);

  // 1. CANADA: Provincial & Federal Tax Regime
  if (region === 'canada') {
    if (overrideExempt || config.isSmallSupplierExempt) {
      return {
        region: 'canada',
        taxName: 'Exonéré (Petit fournisseur ARC)',
        taxRateDisplay: '0.00 %',
        isExempt: true,
        tax1Name: 'TPS (0%)',
        tax1Amount: 0,
        tax2Name: 'TVQ (0%)',
        tax2Amount: 0,
        totalTax: 0,
        total: safeSubtotal
      };
    }

    const provName = typeof provinceOrCustomRate === 'string' && provinceOrCustomRate 
      ? provinceOrCustomRate 
      : (config.defaultProvince || 'Québec');

    const provinceData = CANADIAN_PROVINCES.find(p => p.name === provName) || CANADIAN_PROVINCES[0];

    const gstAmount = parseFloat((safeSubtotal * provinceData.gst).toFixed(2));
    const pstAmount = parseFloat((safeSubtotal * provinceData.pst).toFixed(2));
    const totalTax = parseFloat((gstAmount + pstAmount).toFixed(2));

    const totalRatePercent = (provinceData.totalRate * 100).toFixed(3);

    return {
      region: 'canada',
      taxName: provinceData.name === 'Québec' ? 'TPS + TVQ' : (provinceData.gst === 0 ? 'TVH' : 'TPS + TVP'),
      taxRateDisplay: `${totalRatePercent} % (${provinceData.name})`,
      isExempt: false,
      tax1Name: provinceData.gstLabel || 'TPS (5%)',
      tax1Amount: gstAmount,
      tax2Name: provinceData.pstLabel || 'TVP / TVQ',
      tax2Amount: pstAmount,
      totalTax,
      total: parseFloat((safeSubtotal + totalTax).toFixed(2))
    };
  }

  // 2. AFRIQUE & HAÏTI: Manual Custom Tax Configuration
  if (overrideExempt || !config.enabled) {
    return {
      region,
      taxName: 'Hors taxe / Exonéré',
      taxRateDisplay: '0.00 %',
      isExempt: true,
      tax1Name: `${config.taxName || 'Taxe'} (0%)`,
      tax1Amount: 0,
      totalTax: 0,
      total: safeSubtotal
    };
  }

  // Determine rate (custom rate override for this invoice/expense or global manual setting)
  const primaryRate = typeof provinceOrCustomRate === 'number' && !isNaN(provinceOrCustomRate)
    ? provinceOrCustomRate
    : (config.taxRatePercent || 0);

  const tax1Amount = parseFloat((safeSubtotal * (primaryRate / 100)).toFixed(2));

  let tax2Amount = 0;
  let tax2Name: string | undefined = undefined;
  if (config.hasSecondTax && config.secondTaxRatePercent && config.secondTaxRatePercent > 0) {
    tax2Amount = parseFloat((safeSubtotal * (config.secondTaxRatePercent / 100)).toFixed(2));
    tax2Name = `${config.secondTaxName || 'Surtaxe'} (${config.secondTaxRatePercent}%)`;
  }

  const totalTax = parseFloat((tax1Amount + tax2Amount).toFixed(2));
  const totalRateDisplay = (primaryRate + (config.hasSecondTax ? (config.secondTaxRatePercent || 0) : 0)).toFixed(2);

  return {
    region,
    taxName: config.taxName || 'Taxe locale',
    taxRateDisplay: `${totalRateDisplay} %`,
    isExempt: false,
    tax1Name: `${config.taxName || 'Taxe'} (${primaryRate}%)`,
    tax1Amount,
    tax2Name,
    tax2Amount,
    totalTax,
    total: parseFloat((safeSubtotal + totalTax).toFixed(2))
  };
}
