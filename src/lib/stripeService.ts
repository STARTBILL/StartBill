/**
 * Stripe Client Integration Service
 * Communicates with backend endpoints (/api/stripe/*) configured with Restricted Keys
 * and Access Policies (https://docs.stripe.com/keys#access-policies).
 */

export interface StripeConfigResponse {
  publishableKey: string;
  isConfigured: boolean;
  keyType: 'restricted' | 'standard' | 'none';
  keyPrefix?: string;
  isLive: boolean;
  hasWebhookSecret: boolean;
  accessPolicyCompliant: boolean;
  documentation: string;
}

export interface StripePermissionDiagnostic {
  resource: string;
  category: string;
  requiredPermission: 'Write' | 'Read' | 'None';
  status: 'granted' | 'denied' | 'skipped' | 'unknown';
  message: string;
  details?: string;
}

export interface StripePolicyVerificationResult {
  success: boolean;
  isConfigured: boolean;
  keyType: 'restricted' | 'standard' | 'none';
  isLive: boolean;
  complianceScore: number; // 0 to 100
  accessPolicyCompliant: boolean;
  message: string;
  diagnostics: StripePermissionDiagnostic[];
  recommendations: string[];
  testedAt: string;
  documentationUrl: string;
}

export interface StripeAdminKeyUpdate {
  restrictedKey?: string;
  publishableKey?: string;
  webhookSecret?: string;
}

export interface CheckoutSessionParams {
  planId: 'start' | 'pro';
  interval?: 'monthly' | 'yearly';
  userEmail?: string;
  userId?: string;
  region?: string;
}

export const STRIPE_ACCESS_POLICY_SPEC = [
  {
    resource: 'Checkout Sessions',
    apiEndpoint: '/v1/checkout/sessions',
    recommended: 'Écriture (Write) & Lecture (Read)',
    description: 'Nécessaire pour créer les sessions de paiement d’abonnements SaaS et règlements de factures.',
    riskIfOmitted: 'Échec de redirection vers la page de paiement sécurisée Stripe.'
  },
  {
    resource: 'Customers (Clients)',
    apiEndpoint: '/v1/customers',
    recommended: 'Écriture (Write) & Lecture (Read)',
    description: 'Permet d’associer les utilisateurs StartBill à leur fiche client Stripe et de conserver l’historique bancaire.',
    riskIfOmitted: 'Incapacité d’associer les cartes enregistrées et les abonnements récurrents.'
  },
  {
    resource: 'Subscriptions (Abonnements)',
    apiEndpoint: '/v1/subscriptions',
    recommended: 'Lecture (Read) & Écriture (Write)',
    description: 'Gestion du cycle de vie des forfaits (Start & Pro) et synchronisation des renouvellements.',
    riskIfOmitted: 'Blocage lors de la modification ou résiliation d’un forfait.'
  },
  {
    resource: 'Customer Portal (Portail Client)',
    apiEndpoint: '/v1/billing_portal/sessions',
    recommended: 'Écriture (Write)',
    description: 'Autorise les clients à gérer en libre-service leurs moyens de paiement et factures sur Stripe.',
    riskIfOmitted: 'Impossible d’ouvrir le portail de facturation en un clic.'
  },
  {
    resource: 'Invoices (Factures Stripe)',
    apiEndpoint: '/v1/invoices',
    recommended: 'Lecture (Read) & Écriture (Write)',
    description: 'Génération de reçus officiels et suivi des règlements pour la comptabilité.',
    riskIfOmitted: 'Synchronisation fiscale et suivi des paiements incomplets.'
  },
  {
    resource: 'Webhook Endpoints',
    apiEndpoint: '/v1/webhook_endpoints',
    recommended: 'Lecture (Read)',
    description: 'Vérification de l’intégrité des points de terminaison pour la réception instantanée des règlements.',
    riskIfOmitted: 'Aucune détection automatique des pannes de synchronisation webhook.'
  },
  {
    resource: 'Virements & Soldes (Payouts/Bank Accounts)',
    apiEndpoint: '/v1/transfers, /v1/payouts',
    recommended: 'Aucun (None - Bloqué)',
    description: 'Principe du moindre privilège : Aucune clé SaaS n’a le droit d’effectuer des virements ou vider le compte.',
    riskIfOmitted: 'Respect fondamental des normes de cybersécurité et de la documentation Stripe.'
  }
];

export async function getStripeConfig(): Promise<StripeConfigResponse> {
  try {
    const res = await fetch('/api/stripe/config');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    return {
      publishableKey: '',
      isConfigured: false,
      keyType: 'none',
      isLive: false,
      hasWebhookSecret: false,
      accessPolicyCompliant: false,
      documentation: 'https://docs.stripe.com/keys#access-policies'
    };
  }
}

/**
 * Runs active diagnostic verification of Stripe Access Policies
 */
export async function verifyStripeAccessPolicies(candidateKey?: string): Promise<StripePolicyVerificationResult> {
  try {
    const res = await fetch('/api/stripe/verify-access-policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateKey }),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      isConfigured: false,
      keyType: 'none',
      isLive: false,
      complianceScore: 0,
      accessPolicyCompliant: false,
      message: `Erreur de connexion lors du test : ${err.message}`,
      diagnostics: [],
      recommendations: [
        'Assurez-vous que le serveur StartBill est démarré et que la clé Stripe est renseignée.',
        'Consultez https://docs.stripe.com/keys#access-policies pour configurer une clé restreinte.'
      ],
      testedAt: new Date().toISOString(),
      documentationUrl: 'https://docs.stripe.com/keys#access-policies'
    };
  }
}

/**
 * Super Admin updates Stripe Keys and reinitializes server Stripe instance
 */
export async function updateStripeAdminKeys(keys: StripeAdminKeyUpdate): Promise<{
  success: boolean;
  message: string;
  config?: StripeConfigResponse;
}> {
  try {
    const res = await fetch('/api/stripe/admin/update-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(keys),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Impossible de mettre à jour les clés Stripe.',
    };
  }
}

/**
 * Test checkout session generation directly from Admin
 */
export async function testCreateDemoCheckout(): Promise<{
  success: boolean;
  url?: string;
  sessionId?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId: 'start',
        interval: 'monthly',
        userEmail: 'test.policy@startbill.com',
        userId: 'admin_test_session',
        region: 'canada'
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.message || data.error };
    }
    return { success: true, url: data.url, sessionId: data.sessionId };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function startStripeCheckout(params: CheckoutSessionParams): Promise<{
  success: boolean;
  url?: string;
  error?: string;
  isMockMode?: boolean;
}> {
  try {
    const res = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.message || data.error || 'Erreur lors de la création de la session Stripe.',
        isMockMode: data.isMockMode,
      };
    }

    if (data.url) {
      window.location.href = data.url;
      return { success: true, url: data.url };
    }

    return {
      success: false,
      error: 'URL de session Stripe introuvable.',
    };
  } catch (err: any) {
    console.error('[Stripe Client] Checkout error:', err);
    return {
      success: false,
      error: err.message || 'Impossible de joindre le serveur de paiement Stripe.',
    };
  }
}

export async function openBillingPortal(customerId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/stripe/create-portal-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
      return { success: true };
    }
    return { success: false, error: data.error || 'Erreur portail client' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createInvoiceOnlinePayment(params: {
  invoiceId: string;
  clientName: string;
  clientEmail?: string;
  totalAmount: number;
  currency?: string;
}): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const res = await fetch('/api/stripe/create-invoice-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (data.url) {
      return { success: true, url: data.url };
    }
    return { success: false, error: data.error || 'Erreur génération lien Stripe' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
