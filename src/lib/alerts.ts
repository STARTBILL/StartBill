import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where,
  writeBatch,
  arrayUnion
} from 'firebase/firestore';
import { db } from './firebase';
import { SmartAlert, Invoice, AlertSeverity, AlertType } from '../types';
import { getFreeTrialInfo } from './planAccess';

/**
 * LocalStorage and Firestore tombstone helpers to guarantee that deleted notifications
 * NEVER reappear upon screen change, recalculation, or page refresh.
 */
export function getDismissedAlertIds(userId?: string): Set<string> {
  try {
    const key = `startbill_dismissed_notifs_${userId || 'guest'}`;
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function saveDismissedAlertId(alertId: string, userId?: string): void {
  try {
    const key = `startbill_dismissed_notifs_${userId || 'guest'}`;
    const current = getDismissedAlertIds(userId);
    current.add(alertId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(Array.from(current)));
    }
  } catch (e) {
    console.warn('Error saving dismissed alert id:', e);
  }
}

export function saveDismissedAlertIds(alertIds: string[], userId?: string): void {
  try {
    const key = `startbill_dismissed_notifs_${userId || 'guest'}`;
    const current = getDismissedAlertIds(userId);
    alertIds.forEach(id => current.add(id));
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(Array.from(current)));
    }
  } catch (e) {
    console.warn('Error saving dismissed alert ids:', e);
  }
}

export function getReadAlertIds(userId?: string): Set<string> {
  try {
    const key = `startbill_read_notifs_${userId || 'guest'}`;
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function saveReadAlertId(alertId: string, isRead: boolean, userId?: string): void {
  try {
    const key = `startbill_read_notifs_${userId || 'guest'}`;
    const current = getReadAlertIds(userId);
    if (isRead) {
      current.add(alertId);
    } else {
      current.delete(alertId);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(Array.from(current)));
    }
  } catch (e) {
    console.warn('Error saving read alert id:', e);
  }
}

export async function persistDismissedNotificationInFirestore(userId: string, alertIds: string[]): Promise<void> {
  if (!userId || userId === 'user-default' || userId === 'guest') return;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      dismissedNotificationIds: arrayUnion(...alertIds),
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    // Non-blocking sync notice
    console.warn('Notice syncing dismissed notification to Firestore:', err);
  }
}

export async function getAlertsFromFirestore(userId: string): Promise<SmartAlert[]> {
  try {
    const alertsRef = collection(db, 'alerts');
    const q = query(alertsRef, where('userId', '==', userId));
    const snap = await getDocs(q);
    const list: SmartAlert[] = [];
    const dismissed = getDismissedAlertIds(userId);
    snap.forEach((docSnap) => {
      const data = docSnap.data() as SmartAlert;
      if (!dismissed.has(data.id)) {
        list.push(data);
      }
    });
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (err) {
    console.error('Error fetching alerts from Firestore:', err);
    return [];
  }
}

export async function saveAlertToFirestore(alert: SmartAlert): Promise<void> {
  try {
    await setDoc(doc(db, 'alerts', alert.id), alert);
  } catch (err) {
    // Silent failover if offline or rule updating
  }
}

export async function deleteAlertFromFirestore(alertId: string, userId?: string): Promise<void> {
  // 1. Immediately persist to localStorage
  saveDismissedAlertId(alertId, userId);

  // 2. Persist to Firestore user profile if authenticated
  if (userId && userId !== 'user-default' && userId !== 'guest') {
    persistDismissedNotificationInFirestore(userId, [alertId]).catch(() => {});
  }

  // 3. Delete from alerts collection if present
  try {
    await deleteDoc(doc(db, 'alerts', alertId));
  } catch (err) {
    // In case rules deny deleting from alerts collection, tombstone in user doc guarantees it stays deleted
  }
}

export async function deleteAllAlertsFromFirestore(alertIds: string[], userId?: string): Promise<void> {
  if (!alertIds || alertIds.length === 0) return;
  saveDismissedAlertIds(alertIds, userId);

  if (userId && userId !== 'user-default' && userId !== 'guest') {
    persistDismissedNotificationInFirestore(userId, alertIds).catch(() => {});
  }

  for (const id of alertIds) {
    try {
      await deleteDoc(doc(db, 'alerts', id));
    } catch {}
  }
}

export async function markAlertAsReadInFirestore(alertId: string, isRead = true, userId?: string): Promise<void> {
  saveReadAlertId(alertId, isRead, userId);
  try {
    const alertRef = doc(db, 'alerts', alertId);
    await setDoc(alertRef, { isRead }, { merge: true });
  } catch (err) {
    // Silent failover
  }
}

export function generateSmartAlerts(
  userId: string,
  totalRevenue: number,
  totalTax: number,
  invoices: Invoice[],
  isPro: boolean,
  existingAlerts: SmartAlert[] = []
): SmartAlert[] {
  const alertsMap = new Map<string, SmartAlert>();
  const dismissedIds = getDismissedAlertIds(userId);
  const readIds = getReadAlertIds(userId);

  // Map existing read states by alert type/id so user's manual "isRead" is preserved
  const existingReadState = new Map<string, boolean>();
  existingAlerts.forEach(a => {
    existingReadState.set(a.type, a.isRead);
    existingReadState.set(a.id, a.isRead);
  });

  const nowStr = new Date().toISOString();

  const addAlertIfActive = (key: string, alert: SmartAlert) => {
    if (!dismissedIds.has(alert.id)) {
      alertsMap.set(key, {
        ...alert,
        isRead: readIds.has(alert.id) || alert.isRead
      });
    }
  };

  // Rule 1 & 2: GST/HST Thresholds
  if (totalRevenue >= 30000) {
    const type: AlertType = 'gst_exceeded';
    const id = `alert-${userId}-${type}`;
    addAlertIfActive(type, {
      id,
      userId,
      type,
      title: 'Seuil GST/HST dépassé',
      message: 'Tu as atteint ou dépassé 30 000 $ de revenus taxables. Vérifie si tu dois t\'inscrire à la GST/HST.',
      severity: 'danger',
      isRead: existingReadState.get(type) ?? existingReadState.get(id) ?? false,
      createdAt: nowStr,
      actionUrl: 'tax_prep',
      actionLabel: 'S\'inscrire à la GST/HST'
    });
  } else if (totalRevenue >= 25000 && totalRevenue < 30000) {
    const type: AlertType = 'gst_threshold';
    const id = `alert-${userId}-${type}`;
    addAlertIfActive(type, {
      id,
      userId,
      type,
      title: 'Seuil GST/HST approchant',
      message: 'Tu approches du seuil de 30 000 $. Prépare-toi à t\'inscrire à la GST/HST.',
      severity: 'warning',
      isRead: existingReadState.get(type) ?? existingReadState.get(id) ?? false,
      createdAt: nowStr,
      actionUrl: 'tax_prep',
      actionLabel: 'Prépare l\'inscription'
    });
  }

  // Rule 3: Taxes collected to reserve
  if (totalTax > 0) {
    const type: AlertType = 'taxes_reserved';
    const id = `alert-${userId}-${type}`;
    const formattedTax = totalTax.toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    addAlertIfActive(type, {
      id,
      userId,
      type,
      title: 'Taxes TPS/TVQ à réserver',
      message: `Tu as collecté ${formattedTax} $ de taxes. Cet argent devrait être réservé pour le gouvernement.`,
      severity: 'warning',
      isRead: existingReadState.get(type) ?? existingReadState.get(id) ?? false,
      createdAt: nowStr,
      actionUrl: 'tax_prep',
      actionLabel: 'Réserver l\'argent'
    });
  }

  // Rule 4: Invoice overdue
  const overdueInvoices = invoices.filter(inv => {
    if (inv.status === 'En retard') return true;
    if (inv.status !== 'Payée' && inv.status !== 'paid' && inv.dueDate) {
      return new Date(inv.dueDate) < new Date();
    }
    return false;
  });

  if (overdueInvoices.length > 0) {
    const type: AlertType = 'invoice_overdue';
    const id = `alert-${userId}-${type}`;
    const overdueCount = overdueInvoices.length;
    addAlertIfActive(type, {
      id,
      userId,
      type,
      title: 'Facture en retard',
      message: overdueCount === 1 
        ? `La facture ${overdueInvoices[0].id} pour ${overdueInvoices[0].clientName} est en retard. Pense à relancer ton client.`
        : `${overdueCount} factures sont en retard. Pense à relancer tes clients.`,
      severity: 'danger',
      isRead: existingReadState.get(type) ?? existingReadState.get(id) ?? false,
      createdAt: nowStr,
      actionUrl: 'invoices',
      actionLabel: 'Relancer le client',
      targetId: overdueInvoices[0]?.id
    });
  }

  // Rule 5: Free plan limit reached (invoiceCount >= 5 and free plan after 5-day trial)
  const totalInvoicesCount = invoices.length;
  const trial = getFreeTrialInfo();
  if (!isPro && totalInvoicesCount >= 5 && !trial.isActive) {
    const type: AlertType = 'free_limit_reached';
    const id = `alert-${userId}-${type}`;
    addAlertIfActive(type, {
      id,
      userId,
      type,
      title: 'Limite gratuite atteinte',
      message: 'Votre période d\'essai de 5 jours est terminée et vous avez atteint la limite de 5 factures. Passez au plan Start pour créer des factures illimitées.',
      severity: 'danger',
      isRead: existingReadState.get(type) ?? existingReadState.get(id) ?? false,
      createdAt: nowStr,
      actionUrl: 'settings',
      actionLabel: 'Passer au plan Start 🚀'
    });
  }

  // Rule 6: Tax savings recommendation
  if (totalRevenue > 0) {
    const type: AlertType = 'tax_savings';
    const id = `alert-${userId}-${type}`;
    const estimatedAmount = Math.round(totalRevenue * 0.20);
    const formattedAmount = estimatedAmount.toLocaleString('fr-CA');
    addAlertIfActive(type, {
      id,
      userId,
      type,
      title: 'Mettre de côté pour les impôts',
      message: `Tu devrais mettre environ ${formattedAmount} $ de côté pour tes impôts.`,
      severity: 'info',
      isRead: existingReadState.get(type) ?? existingReadState.get(id) ?? false,
      createdAt: nowStr,
      actionUrl: 'financial_health',
      actionLabel: 'Planifier la réserve'
    });
  }

  // Rule 7: Notification for created invoices
  if (invoices && invoices.length > 0) {
    invoices.slice(0, 5).forEach((inv) => {
      const invId = inv.id || 'FACT-NOUVELLE';
      const alertId = `alert-${userId}-inv-${invId}`;
      const type: AlertType = 'general';
      const invTotal = (inv.total || inv.subtotal || 0).toLocaleString('fr-CA', { minimumFractionDigits: 2 });
      addAlertIfActive(`inv_${invId}`, {
        id: alertId,
        userId,
        type,
        title: `Facture #${invId} émise`,
        message: `Facture émise pour ${inv.clientName || 'votre client'} d'un montant de ${invTotal} $. Statut : ${inv.status || 'Émise'}.`,
        severity: (inv.status === 'Payée' || inv.status === 'paid') ? 'success' : 'info',
        isRead: existingReadState.get(alertId) ?? false,
        createdAt: inv.date || nowStr,
        actionUrl: 'invoices',
        actionLabel: 'Consulter la facture',
        targetId: inv.id
      });
    });
  }

  const generatedList = Array.from(alertsMap.values());

  // Save generated alerts to Firestore asynchronously only if active
  generatedList.forEach(alert => {
    saveAlertToFirestore(alert).catch(() => {});
  });

  return generatedList;
}
