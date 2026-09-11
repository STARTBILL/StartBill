export type UserPlan = 'free' | 'start' | 'pro' | 'enterprise';

export type FeatureKey = 
  | 'pdf'
  | 'whatsapp'
  | 'mobile_money'
  | 'invoice_unlimited'
  | 'fiscal_alerts'
  | 'financial_analysis'
  | 'tax_prep'
  | 'accounting_export'
  | 'coaching'
  | 'custom_branding';

export const PLAN_LEVELS: Record<UserPlan, number> = {
  free: 0,
  start: 1,
  pro: 2,
  enterprise: 3,
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
  coaching: 'pro',
  custom_branding: 'pro',
};

export const FEATURE_LABELS: Record<string, string> = {
  pdf: 'Téléchargement de factures au format PDF',
  whatsapp: 'Rappels et notifications par WhatsApp & SMS',
  mobile_money: 'Encaissement par Mobile Money & Virement',
  invoice_unlimited: 'Création illimitée de factures (limite à 5 en version gratuite)',
  fiscal_alerts: 'Alertes fiscales et détection automatique de seuils',
  financial_analysis: 'Analyses financières avancées et comparatifs',
  tax_prep: 'Module complet de préparation de déclarations d’impôts',
  accounting_export: 'Exportations comptables aux formats CSV & Excel',
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
