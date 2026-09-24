import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  increment,
  deleteDoc 
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Business, 
  FinancialHealthMetrics, 
  FinancialSnapshot, 
  AccountingMethod, 
  Payment,
  FinancialObligation,
  Expense,
  Client,
  FinancialHealthSnapshotRecord,
  FinancialAlert
} from '../types';

const BUSINESSES_COLLECTION = 'businesses';

/**
 * Récupère l'entreprise active pour un utilisateur donné (par son UID)
 */
export async function getBusinessByOwner(ownerUid: string): Promise<Business | null> {
  try {
    const q = query(
      collection(db, BUSINESSES_COLLECTION),
      where('ownerRef', '==', ownerUid),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }
    const docData = snapshot.docs[0];
    const data = docData.data();
    return {
      id: docData.id,
      ownerRef: data.ownerRef || ownerUid,
      businessName: data.businessName || 'Mon Entreprise',
      countryCode: data.countryCode || 'CA',
      region: data.region || 'canada',
      currency: data.currency || 'CAD',
      accountingMethod: (data.accountingMethod as AccountingMethod) || 'cash',
      availableCash: Number(data.availableCash) || 0,
      currentAssets: Number(data.currentAssets) || 0,
      currentLiabilities: Number(data.currentLiabilities) || 0,
      totalOutstandingDebt: Number(data.totalOutstandingDebt) || 0,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : (data.updatedAt || new Date().toISOString()),
    };
  } catch (error) {
    console.error('Erreur getBusinessByOwner:', error);
    return null;
  }
}

/**
 * Crée ou met à jour les informations d'une entreprise avec ses métriques de bilan
 */
export async function saveBusiness(
  business: Partial<Business> & { ownerRef: string; businessName: string }
): Promise<Business> {
  const businessId = business.id || `biz_${business.ownerRef}`;
  const docRef = doc(db, BUSINESSES_COLLECTION, businessId);
  const now = new Date().toISOString();

  const businessData = {
    ownerRef: business.ownerRef,
    businessName: business.businessName,
    countryCode: business.countryCode || 'CA',
    region: business.region || 'canada',
    currency: business.currency || 'CAD',
    accountingMethod: business.accountingMethod || 'cash',
    availableCash: Number(business.availableCash) || 0,
    currentAssets: Number(business.currentAssets) || 0,
    currentLiabilities: Number(business.currentLiabilities) || 0,
    totalOutstandingDebt: Number(business.totalOutstandingDebt) || 0,
    updatedAt: serverTimestamp(),
  };

  await setDoc(docRef, {
    ...businessData,
    createdAt: business.createdAt || serverTimestamp()
  }, { merge: true });

  return {
    id: businessId,
    ...businessData,
    createdAt: business.createdAt || now,
    updatedAt: now,
  } as Business;
}

/**
 * Mise à jour ciblée des soldes comptables pour le module Santé financière
 */
export async function updateBalanceSheetMetrics(
  businessId: string,
  metrics: {
    availableCash?: number;
    currentAssets?: number;
    currentLiabilities?: number;
    totalOutstandingDebt?: number;
    accountingMethod?: AccountingMethod;
  }
): Promise<void> {
  const docRef = doc(db, BUSINESSES_COLLECTION, businessId);
  await updateDoc(docRef, {
    ...metrics,
    updatedAt: serverTimestamp()
  });
}

/**
 * Enregistre un instantané mensuel de santé financière dans la sous-collection
 */
export async function saveFinancialSnapshot(
  businessId: string,
  snapshot: Omit<FinancialSnapshot, 'id' | 'createdAt'>
): Promise<string> {
  const snapshotsCol = collection(db, BUSINESSES_COLLECTION, businessId, 'financialSnapshots');
  const snapshotId = `snap_${snapshot.period.replace('-', '_')}`;
  const docRef = doc(snapshotsCol, snapshotId);

  await setDoc(docRef, {
    ...snapshot,
    businessId,
    createdAt: serverTimestamp()
  }, { merge: true });

  return snapshotId;
}

/**
 * Récupère l'historique des snapshots financiers pour l'analyse des tendances
 */
export async function getFinancialSnapshots(businessId: string): Promise<FinancialSnapshot[]> {
  try {
    const snapshotsCol = collection(db, BUSINESSES_COLLECTION, businessId, 'financialSnapshots');
    const q = query(snapshotsCol, orderBy('period', 'desc'), limit(12));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<FinancialSnapshot, 'id'>)
    }));
  } catch (error) {
    console.error('Erreur getFinancialSnapshots:', error);
    return [];
  }
}

/**
 * Calcule dynamiquement les KPIs et Ratios financiers essentiels
 */
export function computeFinancialHealthMetrics(
  business: Business,
  monthlyBurnRate: number = 0
): FinancialHealthMetrics {
  const assets = Math.max(0, business.currentAssets);
  const liabilities = Math.max(0, business.currentLiabilities);
  const cash = Math.max(0, business.availableCash);
  const debt = Math.max(0, business.totalOutstandingDebt);

  // 1. Fonds de roulement net (Working Capital)
  const workingCapital = assets - liabilities;

  // 2. Ratio de liquidité générale (Current Ratio)
  const currentRatio = liabilities > 0 ? Number((assets / liabilities).toFixed(2)) : (assets > 0 ? 3.0 : 1.0);

  // 3. Ratio de liquidité immédiate / Acid-Test (Quick Ratio)
  const quickRatio = liabilities > 0 ? Number((cash / liabilities).toFixed(2)) : (cash > 0 ? 2.5 : 1.0);

  // 4. Ratio d'endettement (Debt Ratio)
  const debtRatio = assets > 0 ? Number((debt / assets).toFixed(2)) : (debt > 0 ? 1.0 : 0);

  // 5. Piste de trésorerie (Runway) en mois
  const runwayMonths = monthlyBurnRate > 0 ? Number((cash / monthlyBurnRate).toFixed(1)) : (cash > 0 ? 12 : 0);

  // 6. Score pondéré sur 100
  let score = 50; // base neutre

  // Impact liquidité (max 40 pts)
  if (currentRatio >= 1.5) score += 20;
  else if (currentRatio >= 1.0) score += 10;
  else score -= 15;

  if (quickRatio >= 1.0) score += 20;
  else if (quickRatio >= 0.7) score += 10;
  else score -= 10;

  // Impact endettement (max 30 pts)
  if (debtRatio <= 0.3) score += 20;
  else if (debtRatio <= 0.6) score += 10;
  else if (debtRatio > 1.0) score -= 20;

  // Impact runway (max 10 pts)
  if (runwayMonths >= 6) score += 10;
  else if (runwayMonths >= 3) score += 5;
  else if (runwayMonths < 1 && monthlyBurnRate > 0) score -= 15;

  score = Math.max(0, Math.min(100, Math.round(score)));

  // Statut
  let status: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL' = 'GOOD';
  let statusLabel = 'Bonne santé financière';

  if (score >= 80) {
    status = 'EXCELLENT';
    statusLabel = 'Santé financière excellente';
  } else if (score >= 60) {
    status = 'GOOD';
    statusLabel = 'Santé financière saine';
  } else if (score >= 40) {
    status = 'WARNING';
    statusLabel = 'Vigilance recommandée';
  } else {
    status = 'CRITICAL';
    statusLabel = 'Trésorerie critique';
  }

  return {
    workingCapital,
    currentRatio,
    quickRatio,
    debtRatio,
    runwayMonths,
    healthScore: score,
    status,
    statusLabel
  };
}

// ==========================================
// GESTION DES PAIEMENTS (COLLECTION PAYMENTS)
// ==========================================

/**
 * Enregistre un paiement (total ou partiel) dans Firestore collection `payments`
 * et met à jour automatiquement la trésorerie `availableCash` de l'entreprise.
 */
export async function recordPayment(payment: {
  businessRef: string;
  invoiceRef: string;
  clientRef: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentDate?: string | Date;
  isPartial: boolean;
  userId?: string;
  notes?: string;
}): Promise<Payment> {
  const paymentCol = collection(db, 'payments');
  const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const paymentDocRef = doc(paymentCol, paymentId);

  const formattedPaymentDate = payment.paymentDate instanceof Date
    ? payment.paymentDate.toISOString()
    : (payment.paymentDate || new Date().toISOString());

  const paymentData: Omit<Payment, 'id'> = {
    businessRef: payment.businessRef,
    invoiceRef: payment.invoiceRef,
    clientRef: payment.clientRef,
    amount: Number(payment.amount) || 0,
    currency: payment.currency || 'CAD',
    paymentMethod: payment.paymentMethod || 'manual',
    paymentDate: formattedPaymentDate,
    isPartial: Boolean(payment.isPartial),
    createdAt: new Date().toISOString(),
    ...(payment.userId ? { userId: payment.userId } : {}),
    ...(payment.notes ? { notes: payment.notes } : {}),
    status: 'success',
  };

  await setDoc(paymentDocRef, {
    ...paymentData,
    createdAt: serverTimestamp(),
  });

  // Mise à jour de la trésorerie disponible dans l'entreprise (Santé financière)
  if (payment.businessRef) {
    try {
      const bizRef = doc(db, BUSINESSES_COLLECTION, payment.businessRef);
      await updateDoc(bizRef, {
        availableCash: increment(paymentData.amount),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Could not auto-increment availableCash on business:', err);
    }
  }

  return {
    id: paymentId,
    ...paymentData,
  };
}

/**
 * Récupère tous les paiements enregistrés pour une entreprise donnée
 */
export async function getPaymentsByBusiness(businessRef: string): Promise<Payment[]> {
  try {
    const q = query(
      collection(db, 'payments'),
      where('businessRef', '==', businessRef),
      orderBy('paymentDate', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Payment));
  } catch (err) {
    console.error('Erreur getPaymentsByBusiness:', err);
    return [];
  }
}

/**
 * Récupère les paiements liés à une facture spécifique
 */
export async function getPaymentsByInvoice(invoiceRef: string): Promise<Payment[]> {
  try {
    const q = query(
      collection(db, 'payments'),
      where('invoiceRef', '==', invoiceRef)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Payment));
  } catch (err) {
    console.error('Erreur getPaymentsByInvoice:', err);
    return [];
  }
}

// ==========================================
// GESTION DES DÉPENSES (COLLECTION EXPENSES)
// ==========================================

export async function recordExpense(expense: {
  id?: string;
  businessRef: string;
  categoryRef?: string;
  supplierRef?: string;
  amount: number;
  taxAmount?: number;
  currency?: string;
  expenseDate?: string | Date;
  paymentStatus?: 'paid' | 'pending' | 'unpaid' | string;
  eligibleAmount?: number; // Montant admissible fiscalement
  userId?: string;
  category?: string;
  provider?: string;
}): Promise<Expense> {
  const expenseCol = collection(db, 'expenses');
  const expenseId = expense.id || `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const expenseDocRef = doc(expenseCol, expenseId);

  const formattedExpenseDate = expense.expenseDate instanceof Date
    ? expense.expenseDate.toISOString()
    : (expense.expenseDate || new Date().toISOString());

  const total = Number(expense.amount) || 0;
  const eligibleAmount = expense.eligibleAmount !== undefined ? Number(expense.eligibleAmount) : total;

  const expenseData = {
    businessRef: expense.businessRef,
    categoryRef: expense.categoryRef || '',
    supplierRef: expense.supplierRef || '',
    amount: total,
    taxAmount: Number(expense.taxAmount) || 0,
    currency: expense.currency || 'CAD',
    expenseDate: formattedExpenseDate,
    paymentStatus: expense.paymentStatus || 'paid',
    eligibleAmount,
    createdAt: new Date().toISOString(),
    // Compatibilité rétroactive
    category: expense.category || expense.categoryRef || 'Général',
    provider: expense.provider || expense.supplierRef || 'Fournisseur',
    date: formattedExpenseDate.split('T')[0],
    amountHt: total - (Number(expense.taxAmount) || 0),
    tps: 0,
    total,
    isEligible: eligibleAmount > 0,
    paymentMethod: 'manual',
    ...(expense.userId ? { userId: expense.userId } : {})
  };

  await setDoc(expenseDocRef, {
    ...expenseData,
    createdAt: serverTimestamp(),
  });

  return {
    id: expenseId,
    ...expenseData,
  } as Expense;
}

// ==========================================
// GESTION DES CLIENTS (COLLECTION CLIENTS)
// ==========================================

export async function saveClientWithMetrics(client: {
  id?: string;
  businessRef: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  province?: string;
  status?: 'active' | 'inactive' | string;
  lastInvoiceDate?: string | null;
  totalBilled?: number;
  totalPaid?: number;
  userId?: string;
}): Promise<Client> {
  const clientCol = collection(db, 'clients');
  const clientId = client.id || `cli_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const clientDocRef = doc(clientCol, clientId);

  const totalBilled = Number(client.totalBilled) || 0;
  const totalPaid = Number(client.totalPaid) || 0;
  const amountDue = Math.max(0, totalBilled - totalPaid);

  const clientData = {
    businessRef: client.businessRef,
    name: client.name,
    email: client.email || '',
    phone: client.phone || '',
    address: client.address || '',
    province: client.province || 'Québec',
    status: client.status || 'active',
    lastInvoiceDate: client.lastInvoiceDate || null,
    totalBilled,
    totalPaid,
    amountDue,
    createdAt: new Date().toISOString(),
    ...(client.userId ? { userId: client.userId } : {})
  };

  await setDoc(clientDocRef, {
    ...clientData,
    createdAt: serverTimestamp()
  }, { merge: true });

  return {
    id: clientId,
    ...clientData,
  } as Client;
}

// =========================================================================
// OBLIGATIONS FINANCIÈRES & DETTES (COLLECTION FINANCIAL_OBLIGATIONS)
// =========================================================================

const OBLIGATIONS_COLLECTION = 'financial_obligations';

/**
 * Crée ou met à jour une obligation financière (prêt, carte de crédit, dette fiscale, etc.)
 */
export async function saveFinancialObligation(obligation: {
  id?: string;
  businessRef: string;
  type: 'loan' | 'credit_card' | 'tax_payable' | 'supplier_payable' | 'other';
  description: string;
  currentBalance: number;
  monthlyPayment?: number;
  dueDate: string | Date;
  isShortTerm: boolean;
  currency?: string;
  status?: 'active' | 'paid' | 'overdue';
  userId?: string;
}): Promise<FinancialObligation> {
  const colRef = collection(db, OBLIGATIONS_COLLECTION);
  const obligationId = obligation.id || `ob_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(colRef, obligationId);

  const formattedDueDate = obligation.dueDate instanceof Date
    ? obligation.dueDate.toISOString()
    : obligation.dueDate;

  const data: Omit<FinancialObligation, 'id'> = {
    businessRef: obligation.businessRef,
    type: obligation.type,
    description: obligation.description,
    currentBalance: Number(obligation.currentBalance) || 0,
    monthlyPayment: obligation.monthlyPayment !== undefined ? Number(obligation.monthlyPayment) : undefined,
    dueDate: formattedDueDate,
    isShortTerm: Boolean(obligation.isShortTerm),
    currency: obligation.currency || 'CAD',
    status: obligation.status || 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...(obligation.userId ? { userId: obligation.userId } : {})
  };

  await setDoc(docRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });

  // Synchronisation automatique des passifs du bilan de l'entreprise
  if (obligation.businessRef) {
    await syncBusinessLiabilitiesFromObligations(obligation.businessRef);
  }

  return {
    id: obligationId,
    ...data,
  };
}

/**
 * Récupère toutes les obligations financières d'une entreprise
 */
export async function getFinancialObligations(businessRef: string): Promise<FinancialObligation[]> {
  try {
    const q = query(
      collection(db, OBLIGATIONS_COLLECTION),
      where('businessRef', '==', businessRef),
      orderBy('dueDate', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as FinancialObligation));
  } catch (err) {
    console.error('Erreur getFinancialObligations:', err);
    return [];
  }
}

/**
 * Supprime une obligation financière et recalcule le bilan
 */
export async function deleteFinancialObligation(obligationId: string, businessRef?: string): Promise<void> {
  const docRef = doc(db, OBLIGATIONS_COLLECTION, obligationId);
  await deleteDoc(docRef);

  if (businessRef) {
    await syncBusinessLiabilitiesFromObligations(businessRef);
  }
}

/**
 * Recalcule et met à jour automatiquement `currentLiabilities` et `totalOutstandingDebt`
 * de l'entreprise à partir de ses obligations actives.
 */
export async function syncBusinessLiabilitiesFromObligations(businessRef: string): Promise<void> {
  try {
    const obligations = await getFinancialObligations(businessRef);
    const activeObligations = obligations.filter(o => o.status === 'active' || o.status === 'overdue');

    // Passifs à court terme : toutes les obligations court terme actives
    const currentLiabilities = activeObligations
      .filter(o => o.isShortTerm)
      .reduce((sum, o) => sum + (Number(o.currentBalance) || 0), 0);

    // Dette totale : somme de toutes les obligations actives (court + long terme)
    const totalOutstandingDebt = activeObligations
      .reduce((sum, o) => sum + (Number(o.currentBalance) || 0), 0);

    const bizDocRef = doc(db, BUSINESSES_COLLECTION, businessRef);
    await updateDoc(bizDocRef, {
      currentLiabilities,
      totalOutstandingDebt,
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    console.warn('Could not sync obligations with business balance sheet:', err);
  }
}

// =========================================================================
// INSTANTANÉS DE SANTÉ FINANCIÈRE (COLLECTION FINANCIAL_HEALTH_SNAPSHOTS)
// Index: businessRef (Ascending) + calculatedAt (Descending)
// =========================================================================

const FINANCIAL_HEALTH_SNAPSHOTS_COLLECTION = 'financial_health_snapshots';

export async function saveFinancialHealthSnapshot(snapshot: {
  id?: string;
  businessRef: string;
  period?: string;
  availableCash?: number;
  currentAssets?: number;
  currentLiabilities?: number;
  totalOutstandingDebt?: number;
  monthlyRevenue?: number;
  monthlyExpenses?: number;
  netProfit?: number;
  healthScore: number;
  workingCapital?: number;
  currentRatio?: number;
  quickRatio?: number;
  calculatedAt?: string | Date;
}): Promise<FinancialHealthSnapshotRecord> {
  const colRef = collection(db, FINANCIAL_HEALTH_SNAPSHOTS_COLLECTION);
  const snapshotId = snapshot.id || `fhs_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(colRef, snapshotId);

  const formattedCalculatedAt = snapshot.calculatedAt instanceof Date
    ? snapshot.calculatedAt.toISOString()
    : (snapshot.calculatedAt || new Date().toISOString());

  const data = {
    businessRef: snapshot.businessRef,
    calculatedAt: formattedCalculatedAt,
    period: snapshot.period || formattedCalculatedAt.substring(0, 7),
    availableCash: Number(snapshot.availableCash) || 0,
    currentAssets: Number(snapshot.currentAssets) || 0,
    currentLiabilities: Number(snapshot.currentLiabilities) || 0,
    totalOutstandingDebt: Number(snapshot.totalOutstandingDebt) || 0,
    monthlyRevenue: Number(snapshot.monthlyRevenue) || 0,
    monthlyExpenses: Number(snapshot.monthlyExpenses) || 0,
    netProfit: Number(snapshot.netProfit) || 0,
    healthScore: Number(snapshot.healthScore) || 0,
    workingCapital: Number(snapshot.workingCapital) || 0,
    currentRatio: Number(snapshot.currentRatio) || 0,
    quickRatio: Number(snapshot.quickRatio) || 0,
    createdAt: new Date().toISOString(),
  };

  await setDoc(docRef, {
    ...data,
    createdAt: serverTimestamp()
  });

  return {
    id: snapshotId,
    ...data
  };
}

/**
 * Récupère les instantanés de santé financière d'une entreprise (triés par calculatedAt DESC)
 * Utilise l'index composite: businessRef ASC + calculatedAt DESC
 */
export async function getFinancialHealthSnapshots(businessRef: string, maxLimit = 24): Promise<FinancialHealthSnapshotRecord[]> {
  try {
    const q = query(
      collection(db, FINANCIAL_HEALTH_SNAPSHOTS_COLLECTION),
      where('businessRef', '==', businessRef),
      orderBy('calculatedAt', 'desc'),
      limit(maxLimit)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as FinancialHealthSnapshotRecord));
  } catch (err) {
    console.error('Erreur getFinancialHealthSnapshots:', err);
    return [];
  }
}

// =========================================================================
// ALERTES FINANCIÈRES (COLLECTION FINANCIAL_ALERTS)
// Index: businessRef (Ascending) + severity (Ascending) + createdAt (Descending)
// =========================================================================

const FINANCIAL_ALERTS_COLLECTION = 'financial_alerts';

export async function createFinancialAlert(alert: {
  id?: string;
  businessRef: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical' | 'urgent';
  category?: string;
  actionUrl?: string;
}): Promise<FinancialAlert> {
  const colRef = collection(db, FINANCIAL_ALERTS_COLLECTION);
  const alertId = alert.id || `fa_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(colRef, alertId);

  const data = {
    businessRef: alert.businessRef,
    title: alert.title,
    message: alert.message,
    severity: alert.severity,
    isRead: false,
    category: alert.category || 'general',
    actionUrl: alert.actionUrl || '',
    createdAt: new Date().toISOString(),
  };

  await setDoc(docRef, {
    ...data,
    createdAt: serverTimestamp()
  });

  return {
    id: alertId,
    ...data
  };
}

/**
 * Récupère les alertes financières d'une entreprise (triées par sévérité puis date décroissante)
 * Utilise l'index composite: businessRef ASC + severity ASC + createdAt DESC
 */
export async function getFinancialAlerts(businessRef: string): Promise<FinancialAlert[]> {
  try {
    const q = query(
      collection(db, FINANCIAL_ALERTS_COLLECTION),
      where('businessRef', '==', businessRef),
      orderBy('severity', 'asc'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as FinancialAlert));
  } catch (err) {
    console.error('Erreur getFinancialAlerts:', err);
    return [];
  }
}

/**
 * Récupère les obligations d'une entreprise filtrées par statut et ordonnées par échéance
 * Utilise l'index composite: businessRef ASC + status ASC + dueDate ASC
 */
export async function getFinancialObligationsByStatus(businessRef: string, status: 'active' | 'paid' | 'overdue'): Promise<FinancialObligation[]> {
  try {
    const q = query(
      collection(db, OBLIGATIONS_COLLECTION),
      where('businessRef', '==', businessRef),
      where('status', '==', status),
      orderBy('dueDate', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as FinancialObligation));
  } catch (err) {
    console.error('Erreur getFinancialObligationsByStatus:', err);
    return [];
  }
}



