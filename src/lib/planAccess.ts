export type UserPlan = 'free' | 'start' | 'pro' | 'enterprise';

export type UserRole = 'user' | 'admin';

export type FeatureKey = 
  | 'pdf'
  | 'whatsapp'
  | 'mobile_money'
  | 'invoice_unlimited'
  | 'fiscal_alerts'
  | 'financial_analysis'
  | 'tax_prep'
  | 'accounting_export'
  | 'ai_advisor'
  | 'coaching'
  | 'custom_branding';

export const PLAN_LEVELS: Record<UserPlan, number> = {
  free: 0,
  start: 1,
  pro: 2,
  enterprise: 3,
};

export interface PlanLimits {
  maxInvoices: number;
  maxClients: number;
  allowPdfExport: boolean;
  allowWhatsApp: boolean;
  allowMobileMoney: boolean;
  allowFiscalAlerts: boolean;
  allowFinancialAnalysis: boolean;
  allowTaxPrep: boolean;
  allowAiAdvisor: boolean;
  allowCustomBranding: boolean;
}

export const PLAN_LIMITS: Record<UserPlan, PlanLimits> = {
  free: {
    maxInvoices: 5,
    maxClients: 5,
    allowPdfExport: false,
    allowWhatsApp: false,
    allowMobileMoney: false,
    allowFiscalAlerts: false,
    allowFinancialAnalysis: false,
    allowTaxPrep: false,
    allowAiAdvisor: false,
    allowCustomBranding: false,
  },
  start: {
    maxInvoices: 999999,
    maxClients: 999999,
    allowPdfExport: true,
    allowWhatsApp: true,
    allowMobileMoney: true,
    allowFiscalAlerts: false,
    allowFinancialAnalysis: false,
    allowTaxPrep: false,
    allowAiAdvisor: false,
    allowCustomBranding: false,
  },
  pro: {
    maxInvoices: 999999,
    maxClients: 999999,
    allowPdfExport: true,
    allowWhatsApp: true,
    allowMobileMoney: true,
    allowFiscalAlerts: true,
    allowFinancialAnalysis: true,
    allowTaxPrep: true,
    allowAiAdvisor: true,
    allowCustomBranding: true,
  },
  enterprise: {
    maxInvoices: 999999,
    maxClients: 999999,
    allowPdfExport: true,
    allowWhatsApp: true,
    allowMobileMoney: true,
    allowFiscalAlerts: true,
    allowFinancialAnalysis: true,
    allowTaxPrep: true,
    allowAiAdvisor: true,
    allowCustomBranding: true,
  }
};

export const FEATURE_REQUIRED_PLANS: Record<FeatureKey, UserPlan> = {
  pdf: 'start',
  whatsapp: 'start',
  mobile_money: 'start',
  invoice_unlimited: 'start',
  fiscal_alerts: 'pro',
  financial_analysis: 'pro',
  tax_prep: 'pro',
  accounting_export: 'pro',
  ai_advisor: 'pro',
  coaching: 'pro',
  custom_branding: 'pro',
};

export const FEATURE_LABELS: Record<string, string> = {
  pdf: 'Téléchargement de factures au format PDF conforme',
  whatsapp: 'Rappels et notifications par WhatsApp & SMS',
  mobile_money: 'Encaissement par Mobile Money & Virement bancaire',
  invoice_unlimited: 'Création illimitée de factures (limité à 5 sur le plan Gratuit)',
  fiscal_alerts: 'Alertes fiscales et détection automatique des seuils de taxes',
  financial_analysis: 'Analyses financières avancées et ratios comptables',
  tax_prep: 'Module complet de préparation de déclarations de taxes (TPS/TVQ)',
  accounting_export: 'Exportations comptables complètes aux formats CSV & Excel',
  ai_advisor: 'Conseiller financier intelligent & recommandations stratégiques',
  coaching: 'Coaching financier et conseils sur mesure',
  custom_branding: 'Personnalisation complète de la marque et du logo'
};

export function getRequiredPlan(feature?: FeatureKey | string, explicitPlan?: UserPlan): UserPlan {
  if (explicitPlan) return explicitPlan;
  if (feature && feature in FEATURE_REQUIRED_PLANS) {
    return FEATURE_REQUIRED_PLANS[feature as FeatureKey];
  }
  return 'start';
}

export function checkFeatureAccess(
  userPlan: UserPlan | string | null | undefined, 
  feature?: FeatureKey | string,
  requiredPlan?: UserPlan
): boolean {
  const currentPlan: UserPlan = (userPlan as UserPlan) || 'free';
  const targetPlan: UserPlan = getRequiredPlan(feature as FeatureKey, requiredPlan);

  const currentLevel = PLAN_LEVELS[currentPlan] ?? 0;
  const targetLevel = PLAN_LEVELS[targetPlan] ?? 1;

  return currentLevel >= targetLevel;
}

export const FREE_TRIAL_DAYS = 5;

export interface FreeTrialInfo {
  isActive: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  startDate: Date;
  endDate: Date;
}

export function getFreeTrialInfo(createdAt?: string | number | Date | null): FreeTrialInfo {
  let startMs: number;
  if (createdAt) {
    const parsed = new Date(createdAt).getTime();
    startMs = isNaN(parsed) ? Date.now() : parsed;
  } else {
    // Check localStorage for consistent trial tracking on client side
    let saved: string | null = null;
    try {
      saved = typeof window !== 'undefined' ? localStorage.getItem('startbill_free_trial_start') : null;
    } catch {}

    if (saved && !isNaN(parseInt(saved, 10))) {
      startMs = parseInt(saved, 10);
    } else {
      startMs = Date.now();
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('startbill_free_trial_start', startMs.toString());
        }
      } catch {}
    }
  }

  const durationMs = FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000;
  const endMs = startMs + durationMs;
  const nowMs = Date.now();
  const diffMs = endMs - nowMs;

  const isActive = diffMs > 0;
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
  const hoursRemaining = Math.max(0, Math.ceil(diffMs / (60 * 60 * 1000)));

  return {
    isActive,
    daysRemaining,
    hoursRemaining,
    startDate: new Date(startMs),
    endDate: new Date(endMs)
  };
}

export function canCreateInvoice(
  userPlan: UserPlan | string | null | undefined, 
  currentInvoiceCount: number,
  createdAt?: string | number | Date | null
): boolean {
  const plan = (userPlan as UserPlan) || 'free';
  if (plan !== 'free') return true;

  // Free version has unlimited invoices for 5 days
  const trial = getFreeTrialInfo(createdAt);
  if (trial.isActive) {
    return true; // Unlimited during 5-day trial!
  }

  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  return currentInvoiceCount < limits.maxInvoices;
}
