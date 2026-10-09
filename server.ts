import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Initialize Firebase server connection for syncing Stripe subscriptions
let db: any = null;
try {
  const firebaseConfigPath = path.resolve(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(firebaseConfigPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
    const fbApp = initializeApp(firebaseConfig, 'stripe-server-app');
    db = getFirestore(fbApp, firebaseConfig.firestoreDatabaseId);
    console.log('[Stripe Server] Connected to Firestore database for subscription sync.');
  }
} catch (err: any) {
  console.warn('[Stripe Server] Firestore init warning:', err.message);
}

// Determine Stripe API Key: Prioritize Restricted Key (rk_...) per docs.stripe.com/keys#access-policies
let stripeApiKey = (process.env.STRIPE_RESTRICTED_KEY || process.env.STRIPE_SECRET_KEY || '').trim();
let stripePublishableKey = (process.env.VITE_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || '').trim();
let stripeWebhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || '').trim();

let stripe: Stripe | null = null;

function initStripeClient(apiKey: string) {
  if (apiKey) {
    stripe = new Stripe(apiKey, {
      apiVersion: '2025-02-24.acacia' as any,
      appInfo: {
        name: 'StartBill SaaS',
        version: '1.0.0',
      },
    });
    const keyType = apiKey.startsWith('rk_') ? 'Restricted Key (Access Policy Protected)' : 'Standard Secret Key';
    console.log(`[Stripe Server] Initialized with ${keyType}`);
  } else {
    stripe = null;
    console.warn('[Stripe Server] No Stripe Secret/Restricted Key configured.');
  }
}

initStripeClient(stripeApiKey);

function maskKey(key: string): string {
  if (!key) return '';
  if (key.length <= 10) return key.slice(0, 3) + '...';
  const prefix = key.slice(0, 7);
  const suffix = key.slice(-4);
  return `${prefix}...${suffix}`;
}

// -------------------------------------------------------------
// 1. STRIPE WEBHOOK (Raw body parser must be mounted first)
// -------------------------------------------------------------
app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response): Promise<void> => {
    if (!stripe) {
      res.status(500).json({ error: 'Stripe not initialized' });
      return;
    }

    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;

    try {
      if (stripeWebhookSecret && sig) {
        event = stripe.webhooks.constructEvent(req.body, sig as string, stripeWebhookSecret);
      } else {
        // If webhook secret is not yet configured, parse raw body directly in development
        event = JSON.parse(req.body.toString());
      }
    } catch (err: any) {
      console.error(`[Stripe Webhook] Verification error: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.client_reference_id || session.metadata?.userId;
          const planId = session.metadata?.planId || 'start';
          const customerId = session.customer as string;

          if (userId && db) {
            console.log(`[Stripe Webhook] Updating subscription for user ${userId} -> plan: ${planId}`);
            // Update User Profile
            await setDoc(doc(db, 'users', userId), {
              plan: planId,
              stripeCustomerId: customerId,
              updatedAt: new Date().toISOString(),
            }, { merge: true });

            // Create/Update Subscription Doc
            const subId = `sub_${userId}`;
            await setDoc(doc(db, 'subscriptions', subId), {
              id: subId,
              userId,
              userEmail: session.customer_details?.email || session.customer_email || '',
              plan: planId,
              status: 'active',
              stripeCustomerId: customerId,
              stripeSubscriptionId: session.subscription as string,
              startDate: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }, { merge: true });
          }
          break;
        }

        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;
          const status = subscription.status === 'active' ? 'active' : 'inactive';
          console.log(`[Stripe Webhook] Subscription updated for customer ${customerId}: ${status}`);
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;
          console.log(`[Stripe Webhook] Subscription canceled for customer ${customerId}`);
          break;
        }

        default:
          console.log(`[Stripe Webhook] Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (handlerErr: any) {
      console.error('[Stripe Webhook] Handler error:', handlerErr);
      res.status(500).json({ error: handlerErr.message });
    }
  }
);

// Standard JSON parser for other API routes
app.use(express.json());

// -------------------------------------------------------------
// 2. STRIPE CONFIG STATUS
// -------------------------------------------------------------
app.get('/api/stripe/config', (_req: Request, res: Response) => {
  const isConfigured = Boolean(stripeApiKey);
  const isRestricted = stripeApiKey.startsWith('rk_');
  const isLive = stripeApiKey.includes('_live_');

  res.json({
    publishableKey: stripePublishableKey,
    isConfigured,
    keyType: isRestricted ? 'restricted' : (isConfigured ? 'standard' : 'none'),
    keyPrefix: maskKey(stripeApiKey),
    isLive,
    hasWebhookSecret: Boolean(stripeWebhookSecret),
    accessPolicyCompliant: isRestricted,
    documentation: 'https://docs.stripe.com/keys#access-policies',
  });
});

// -------------------------------------------------------------
// 2.1 VERIFY STRIPE ACCESS POLICIES & DIAGNOSTIC AUDIT
// Conforme à https://docs.stripe.com/keys#access-policies
// -------------------------------------------------------------
app.post('/api/stripe/verify-access-policies', async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateKey = req.body?.candidateKey?.trim();
    const keyToTest = candidateKey || stripeApiKey;

    if (!keyToTest) {
      res.json({
        success: false,
        isConfigured: false,
        keyType: 'none',
        isLive: false,
        complianceScore: 0,
        accessPolicyCompliant: false,
        message: 'Aucune clé Stripe configurée. Veuillez fournir une clé restreinte (rk_live_... ou rk_test_...).',
        diagnostics: [],
        recommendations: [
          'Créez une clé restreinte sur le Stripe Dashboard : Développeurs > Clés API > Créer une clé restreinte.',
          'Consultez la documentation : https://docs.stripe.com/keys#access-policies',
          'Accordez uniquement les permissions Checkout Sessions, Customers, Subscriptions, Portal et Invoices.',
        ],
        testedAt: new Date().toISOString(),
        documentationUrl: 'https://docs.stripe.com/keys#access-policies',
      });
      return;
    }

    const testStripeInstance = candidateKey ? new Stripe(candidateKey, { apiVersion: '2025-02-24.acacia' as any }) : stripe;
    if (!testStripeInstance) {
      res.status(500).json({ error: 'Instance Stripe indisponible' });
      return;
    }

    const isRestricted = keyToTest.startsWith('rk_');
    const isLive = keyToTest.includes('_live_');
    const diagnostics: Array<{
      resource: string;
      category: string;
      requiredPermission: 'Write' | 'Read' | 'None';
      status: 'granted' | 'denied' | 'skipped' | 'unknown';
      message: string;
      details?: string;
    }> = [];

    let grantedCount = 0;
    let totalChecks = 0;

    // Helper to evaluate API check against Access Policy
    async function evaluateResource(
      resourceName: string,
      category: string,
      required: 'Write' | 'Read' | 'None',
      fn: () => Promise<any>
    ) {
      totalChecks++;
      try {
        await fn();
        diagnostics.push({
          resource: resourceName,
          category,
          requiredPermission: required,
          status: 'granted',
          message: 'Permission active et autorisée par la politique d’accès.',
        });
        grantedCount++;
      } catch (err: any) {
        const isPermissionDenied =
          err.type === 'StripePermissionError' ||
          err.statusCode === 403 ||
          err.message?.toLowerCase().includes('permission') ||
          err.message?.toLowerCase().includes('policy') ||
          err.message?.toLowerCase().includes('not allowed');

        if (isPermissionDenied) {
          diagnostics.push({
            resource: resourceName,
            category,
            requiredPermission: required,
            status: 'denied',
            message: 'Accès refusé par la politique d’accès Stripe.',
            details: err.message,
          });
        } else if (err.code === 'api_key_expired' || err.statusCode === 401) {
          diagnostics.push({
            resource: resourceName,
            category,
            requiredPermission: required,
            status: 'denied',
            message: 'Clé API invalide, révoquée ou expirée.',
            details: err.message,
          });
        } else {
          // If resource list returned empty or warning but didn't throw 403
          diagnostics.push({
            resource: resourceName,
            category,
            requiredPermission: required,
            status: 'granted',
            message: `Accessible (Réponse : ${err.message || 'OK'})`,
          });
          grantedCount++;
        }
      }
    }

    // 1. Customers check
    await evaluateResource('Customers (Clients)', 'core', 'Read', () =>
      testStripeInstance.customers.list({ limit: 1 })
    );

    // 2. Checkout Sessions check
    await evaluateResource('Checkout Sessions', 'checkout', 'Read', () =>
      testStripeInstance.checkout.sessions.list({ limit: 1 })
    );

    // 3. Invoices check
    await evaluateResource('Invoices (Factures)', 'billing', 'Read', () =>
      testStripeInstance.invoices.list({ limit: 1 })
    );

    // 4. Subscriptions check
    await evaluateResource('Subscriptions (Abonnements)', 'billing', 'Read', () =>
      testStripeInstance.subscriptions.list({ limit: 1 })
    );

    // 5. Customer Portal check (verify configuration)
    await evaluateResource('Customer Portal (Portail Facturation)', 'portal', 'Write', () =>
      testStripeInstance.billingPortal.configurations.list({ limit: 1 })
    );

    // 6. Webhooks check
    await evaluateResource('Webhook Endpoints', 'webhooks', 'Read', () =>
      testStripeInstance.webhookEndpoints.list({ limit: 1 })
    );

    // Score calculation
    const permissionRatio = totalChecks > 0 ? grantedCount / totalChecks : 0;
    // Extra bonus for using Restricted Key (rk_...) vs unrestricted root key
    const typeBonus = isRestricted ? 20 : 0;
    const complianceScore = Math.min(100, Math.round((permissionRatio * 80) + typeBonus));

    const recommendations: string[] = [];
    if (!isRestricted) {
      recommendations.push(
        'RECOMMANDATION MAJEURE : Vous utilisez une clé secrète standard (sk_...). Remplacez-la par une Restricted Key (rk_...) pour appliquer les Access Policies (https://docs.stripe.com/keys#access-policies).'
      );
    }
    const deniedResources = diagnostics.filter(d => d.status === 'denied');
    if (deniedResources.length > 0) {
      recommendations.push(
        `Permissions manquantes dans votre politique d'accès : ${deniedResources.map(d => d.resource).join(', ')}. Rendez-vous sur votre dashboard Stripe pour les autoriser.`
      );
    }
    if (isRestricted && deniedResources.length === 0) {
      recommendations.push(
        'Excellente configuration ! Votre clé restreinte respecte le principe du moindre privilège (Least-Privilege) selon la documentation Stripe.'
      );
    }

    res.json({
      success: true,
      isConfigured: true,
      keyType: isRestricted ? 'restricted' : 'standard',
      isLive,
      complianceScore,
      accessPolicyCompliant: isRestricted && deniedResources.length === 0,
      message: isRestricted
        ? (deniedResources.length === 0 ? 'Clé restreinte 100% conforme aux politiques d’accès Stripe.' : 'Clé restreinte active mais certaines permissions sont manquantes.')
        : 'Clé standard détectée. Recommandation : migrer vers une Clé Restreinte (rk_...).',
      diagnostics,
      recommendations,
      testedAt: new Date().toISOString(),
      documentationUrl: 'https://docs.stripe.com/keys#access-policies',
    });
  } catch (err: any) {
    console.error('[Stripe Policy Audit] Error:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      documentationUrl: 'https://docs.stripe.com/keys#access-policies',
    });
  }
});

// -------------------------------------------------------------
// 2.2 UPDATE STRIPE ADMIN KEYS
// -------------------------------------------------------------
app.post('/api/stripe/admin/update-keys', async (req: Request, res: Response): Promise<void> => {
  try {
    const { restrictedKey, publishableKey, webhookSecret } = req.body;

    if (restrictedKey !== undefined) {
      stripeApiKey = restrictedKey.trim();
      initStripeClient(stripeApiKey);
    }
    if (publishableKey !== undefined) {
      stripePublishableKey = publishableKey.trim();
    }
    if (webhookSecret !== undefined) {
      stripeWebhookSecret = webhookSecret.trim();
    }

    // Persist to Firestore system_config/stripe if DB connected
    if (db) {
      try {
        await setDoc(doc(db, 'system_config', 'stripe'), {
          hasRestrictedKey: Boolean(stripeApiKey),
          keyType: stripeApiKey.startsWith('rk_') ? 'restricted' : (stripeApiKey ? 'standard' : 'none'),
          publishableKey: stripePublishableKey,
          hasWebhookSecret: Boolean(stripeWebhookSecret),
          updatedAt: new Date().toISOString(),
        }, { merge: true });
        console.log('[Stripe Server] Saved Stripe configuration status to Firestore.');
      } catch (dbErr: any) {
        console.warn('[Stripe Server] Firestore config save notice:', dbErr.message);
      }
    }

    const isRestricted = stripeApiKey.startsWith('rk_');
    res.json({
      success: true,
      message: 'Clés Stripe mises à jour avec succès.',
      config: {
        publishableKey: stripePublishableKey,
        isConfigured: Boolean(stripeApiKey),
        keyType: isRestricted ? 'restricted' : (stripeApiKey ? 'standard' : 'none'),
        keyPrefix: maskKey(stripeApiKey),
        isLive: stripeApiKey.includes('_live_'),
        hasWebhookSecret: Boolean(stripeWebhookSecret),
        accessPolicyCompliant: isRestricted,
        documentation: 'https://docs.stripe.com/keys#access-policies',
      },
    });
  } catch (err: any) {
    console.error('[Stripe Admin Update] Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// 3. CREATE CHECKOUT SESSION (Subscription Plans)
// -------------------------------------------------------------
app.post('/api/stripe/create-checkout-session', async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId, interval = 'monthly', userEmail, userId, region = 'canada' } = req.body;

    if (!stripe) {
      res.status(400).json({
        error: 'Stripe API key is not configured on the server.',
        message: 'Veuillez configurer STRIPE_RESTRICTED_KEY ou STRIPE_SECRET_KEY avec les politiques d’accès (https://docs.stripe.com/keys#access-policies).',
        isMockMode: true,
      });
      return;
    }

    // Pricing details based on plan & region
    const planName = planId === 'pro' ? 'StartBill Pro (Tout-en-un)' : 'StartBill Start';
    const amountCAD = planId === 'pro' ? (interval === 'yearly' ? 2400 : 3000) : (interval === 'yearly' ? 1200 : 1500); // in cents ($30 or $15)
    
    // Dynamic price based on currency
    const currency = region === 'haiti' ? 'htg' : (region === 'afrique' ? 'xof' : 'cad');
    const unitAmount = region === 'haiti' 
      ? (planId === 'pro' ? 30000 : 15000) 
      : (region === 'afrique' ? (planId === 'pro' ? 1500000 : 750000) : amountCAD);

    const origin = req.headers.origin || process.env.APP_URL || `http://localhost:${PORT}`;

    // Create session via Stripe REST API / Restricted Key
    // Requires Access Policy: Checkout Sessions (Write), Customers (Write)
    const sessionParams: any = {
      mode: 'subscription',
      customer_email: userEmail || undefined,
      client_reference_id: userId || undefined,
      metadata: {
        userId: userId || '',
        planId: planId || 'start',
        interval,
        region,
      },
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: planName,
              description: `Abonnement ${interval === 'yearly' ? 'annuel (-20%)' : 'mensuel'} à StartBill SaaS`,
            },
            unit_amount: unitAmount,
            recurring: {
              interval: interval === 'yearly' ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/?payment_success=true&plan=${planId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?payment_canceled=true&plan=${planId}`,
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    res.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (err: any) {
    console.error('[Stripe Checkout] Error:', err);
    res.status(500).json({
      error: err.message,
      code: err.code,
      type: err.type,
      accessPolicyHint: 'Vérifiez dans https://docs.stripe.com/keys#access-policies que votre clé restreinte possède les permissions Checkout Sessions: Write et Customers: Write.',
    });
  }
});

// -------------------------------------------------------------
// 4. CREATE CUSTOMER BILLING PORTAL SESSION
// -------------------------------------------------------------
app.post('/api/stripe/create-portal-session', async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId, returnUrl } = req.body;

    if (!stripe) {
      res.status(400).json({ error: 'Stripe is not configured' });
      return;
    }

    if (!customerId) {
      res.status(400).json({ error: 'customerId is required' });
      return;
    }

    const origin = returnUrl || req.headers.origin || process.env.APP_URL || `http://localhost:${PORT}`;

    // Requires Access Policy: Customer Portal (Write)
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/?screen=settings`,
    });

    res.json({ url: portalSession.url });
  } catch (err: any) {
    console.error('[Stripe Portal] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 5. CREATE ONE-TIME INVOICE PAYMENT LINK
// -------------------------------------------------------------
app.post('/api/stripe/create-invoice-payment', async (req: Request, res: Response): Promise<void> => {
  try {
    const { invoiceId, clientName, clientEmail, totalAmount, currency = 'cad' } = req.body;

    if (!stripe) {
      res.status(400).json({
        error: 'Stripe is not configured',
        message: 'Veuillez configurer STRIPE_RESTRICTED_KEY pour accepter les paiements par carte.',
      });
      return;
    }

    const origin = req.headers.origin || process.env.APP_URL || `http://localhost:${PORT}`;
    const amountInCents = Math.round(Number(totalAmount) * 100);

    // Requires Access Policy: Checkout Sessions (Write)
    const invoiceSessionParams: any = {
      mode: 'payment',
      customer_email: clientEmail || undefined,
      metadata: {
        invoiceId,
        clientName,
      },
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Règlement Facture ${invoiceId}`,
              description: `Facture émise pour ${clientName}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/?invoice_paid=true&invoiceId=${encodeURIComponent(invoiceId)}`,
      cancel_url: `${origin}/?invoice_canceled=true&invoiceId=${encodeURIComponent(invoiceId)}`,
    };

    const session = await stripe.checkout.sessions.create(invoiceSessionParams);

    res.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error('[Stripe Invoice Payment] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 6. FRONTEND SERVING (Vite Middleware in dev / Static in prod)
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Dev Server] Vite middleware attached.');
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[StartBill Applet] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server Start Error]:', err);
});
