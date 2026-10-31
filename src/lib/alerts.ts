import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where,
  arrayUnion
} from 'firebase/firestore';
import { db } from './firebase';
import { SmartAlert, Invoice, AlertSeverity, AlertType } from '../types';
import { getFreeTrialInfo } from './planAccess';

/**
 * MASTER STORAGE KEYS:
 * Guaranteed cross-session, cross-user and offline persistent tombstones.
 * Any notification dismissed by the user will NEVER reappear.
 */
export const MASTER_DISMISSED_KEY = 'startbill_dismissed_alerts_master';
export const MASTER_READ_KEY = 'startbill_read_alerts_master';

// In-memory cache for ultra-fast checks during runtime
const MEMORY_DISMISSED_SET = new Set<string>();

/**
 * Expand an alert ID or type into all possible canonical identifier representations
 * to prevent any ID mutations from causing ghost alerts to resurface.
 */
export function expandAlertKeys(alertId: string, alertType?: string, targetId?: string): string[] {
  const keys = new Set<string>();
  if (!alertId && !alertType && !targetId) return [];

  if (alertId) {
    keys.add(alertId);

    // Strip legacy user prefix like 'alert-user-default-', 'alert-guest-', 'alert-UID-'
    const stripped = alertId.replace(/^alert-[^-_]+-[^-_]+-/, '')
                            .replace(/^alert-[^-_]+-/, '');
    if (stripped && stripped !== alertId) {
      keys.add(stripped);
      keys.add(`alert-${stripped}`);
    }

    // Invoice pattern: alert-inv-XXX or notif-created-XXX
    const invMatch = alertId.match(/(?:inv-|notif-created-)(FACT-[\w-]+|[\w-]+)$/i);
    if (invMatch && invMatch[1]) {
      const invNum = invMatch[1];
      keys.add(invNum);
      keys.add(`target:${invNum}`);
      keys.add(`alert-inv-${invNum}`);
      keys.add(`notif-created-${invNum}`);
      keys.add(`inv-${invNum}`);
    }
  }

  if (alertType) {
    keys.add(alertType);
    keys.add(`type:${alertType}`);
    keys.add(`alert-${alertType}`);
  }

  if (targetId) {
    keys.add(targetId);
    keys.add(`target:${targetId}`);
    keys.add(`alert-inv-${targetId}`);
    keys.add(`notif-created-${targetId}`);
    keys.add(`inv-${targetId}`);
  }

  return Array.from(keys);
}

/**
 * Load all dismissed alert identifiers across all master and legacy localStorage stores.
 */
export function getAllDismissedAlertIds(): Set<string> {
  const merged = new Set<string>(MEMORY_DISMISSED_SET);
  if (typeof window === 'undefined') return merged;

  try {
    // 1. Master global key
    const masterRaw = localStorage.getItem(MASTER_DISMISSED_KEY);
    if (masterRaw) {
      const arr = JSON.parse(masterRaw);
      if (Array.isArray(arr)) {
        arr.forEach(id => {
          merged.add(String(id));
          MEMORY_DISMISSED_SET.add(String(id));
        });
      }
    }

    // 2. Scan all legacy user keys and collect tombstones
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('startbill_dismissed_notifs_') || k.startsWith('startbill_dismissed_alerts_'))) {
        const val = localStorage.getItem(k);
        if (val) {
          try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) {
              parsed.forEach(id => {
                merged.add(String(id));
                MEMORY_DISMISSED_SET.add(String(id));
              });
            }
          } catch {}
        }
      }
    }
  } catch (err) {
    console.warn('Notice reading dismissed alerts from storage:', err);
  }

  return merged;
}

export function getDismissedAlertIds(userId?: string): Set<string> {
  const set = getAllDismissedAlertIds();
  if (userId && typeof window !== 'undefined') {
    try {
      const userKey = `startbill_dismissed_notifs_${userId}`;
      const raw = localStorage.getItem(userKey);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) arr.forEach(id => set.add(String(id)));
      }
    } catch {}
  }
  return set;
}

/**
 * Strict boolean check: is this notification dismissed/deleted?
 */
export function isAlertDismissed(
  alertId: string, 
  alertType?: string, 
  targetId?: string, 
  userId?: string
): boolean {
  const dismissedSet = getDismissedAlertIds(userId);
  const variations = expandAlertKeys(alertId, alertType, targetId);
  return variations.some(v => dismissedSet.has(v));
}

/**
 * Save dismissed IDs into master storage, memory cache, legacy keys, and notify app.
 */
export function saveDismissedAlertIds(
  alertIds: string[], 
  userId?: string,
  alertMetadata?: Array<{ id: string; type?: string; targetId?: string }>
): void {
  if (typeof window === 'undefined') return;

  try {
    const current = getAllDismissedAlertIds();

    alertIds.forEach(id => {
      const meta = alertMetadata?.find(m => m.id === id);
      const variations = expandAlertKeys(id, meta?.type, meta?.targetId);
      variations.forEach(v => {
        current.add(v);
        MEMORY_DISMISSED_SET.add(v);
      });
    });

    const serialized = JSON.stringify(Array.from(current));

    // Save master
    localStorage.setItem(MASTER_DISMISSED_KEY, serialized);

    // Save legacy keys for backward-compatibility
    localStorage.setItem('startbill_dismissed_notifs_guest', serialized);
    localStorage.setItem('startbill_dismissed_notifs_user-default', serialized);
    if (userId && userId !== 'guest' && userId !== 'user-default') {
      localStorage.setItem(`startbill_dismissed_notifs_${userId}`, serialized);
    }

    // Broadcast synchronization event
    window.dispatchEvent(new CustomEvent('startbill-notifications-updated', {
      detail: { count: current.size }
    }));
  } catch (e) {
    console.warn('Error saving dismissed alert ids:', e);
  }
}

export function saveDismissedAlertId(
  alertId: string, 
  userId?: string,
  alertType?: string,
  targetId?: string
): void {
  saveDismissedAlertIds([alertId], userId, [{ id: alertId, type: alertType, targetId }]);
}

export function getReadAlertIds(userId?: string): Set<string> {
  try {
    const key = `startbill_read_notifs_${userId || 'guest'}`;
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    const masterRaw = typeof window !== 'undefined' ? localStorage.getItem(MASTER_READ_KEY) : null;
    const set = new Set<string>();

    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) arr.forEach(id => set.add(id));
    }
    if (masterRaw) {
      const arr = JSON.parse(masterRaw);
      if (Array.isArray(arr)) arr.forEach(id => set.add(id));
    }
    return set;
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
    const serialized = JSON.stringify(Array.from(current));
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, serialized);
      localStorage.setItem(MASTER_READ_KEY, serialized);
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
    console.warn('Notice syncing dismissed notification to Firestore:', err);
  }
}

export async function getAlertsFromFirestore(userId: string): Promise<SmartAlert[]> {
  try {
    const alertsRef = collection(db, 'alerts');
    const q = query(alertsRef, where('userId', '==', userId));
    const snap = await getDocs(q);
    const list: SmartAlert[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() as SmartAlert;
      if (!isAlertDismissed(data.id, data.type, data.targetId, userId)) {
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
    // Only save if not dismissed
    if (isAlertDismissed(alert.id, alert.type, alert.targetId, alert.userId)) {
      return;
    }
    await setDoc(doc(db, 'alerts', alert.id), alert);
  } catch (err) {
    // Silent failover
  }
}

export async function deleteAlertFromFirestore(
  alertId: string, 
  userId?: string,
  alertType?: string,
  targetId?: string
): Promise<void> {
  // 1. Immediately persist to localStorage across all keys and dispatch sync event
  saveDismissedAlertId(alertId, userId, alertType, targetId);

  // 2. Persist to Firestore user profile if authenticated
  if (userId && userId !== 'user-default' && userId !== 'guest') {
    const variations = expandAlertKeys(alertId, alertType, targetId);
    persistDismissedNotificationInFirestore(userId, variations).catch(() => {});
  }

  // 3. Delete from alerts collection if present
  try {
    await deleteDoc(doc(db, 'alerts', alertId));
  } catch (err) {}
}

export async function deleteAllAlertsFromFirestore(
  alertIds: string[], 
  userId?: string,
  alertMetadata?: Array<{ id: string; type?: string; targetId?: string }>
): Promise<void> {
  if (!alertIds || alertIds.length === 0) return;
  saveDismissedAlertIds(alertIds, userId, alertMetadata);

  if (userId && userId !== 'user-default' && userId !== 'guest') {
    const allVariations = new Set<string>();
    alertIds.forEach(id => {
      const meta = alertMetadata?.find(m => m.id === id);
      expandAlertKeys(id, meta?.type, meta?.targetId).forEach(v => allVariations.add(v));
    });
    persistDismissedNotificationInFirestore(userId, Array.from(allVariations)).catch(() => {});
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

/**
 * Generate smart alerts with DETERMINISTIC, STABLE IDs (independent of userId token).
 * Strictly checks `isAlertDismissed` on each rule before adding.
 */
export function generateSmartAlerts(
  userId: string,
  totalRevenue: number,
  totalTax: number,
  invoices: Invoice[],
  isPro: boolean,
  existingAlerts: SmartAlert[] = []
): SmartAlert[] {
  const alertsMap = new Map<string, SmartAlert>();
  const readIds = getReadAlertIds(userId);

  const existingReadState = new Map<string, boolean>();
  existingAlerts.forEach(a => {
    existingReadState.set(a.type, a.isRead);
    existingReadState.set(a.id, a.isRead);
  });

  const nowStr = new Date().toISOString();

  const addAlertIfActive = (key: string, alert: SmartAlert) => {
    // STRICT TOMBSTONE CHECK: Never generate if dismissed
    if (isAlertDismissed(alert.id, alert.type, alert.targetId, userId)) {
      return;
    }
    alertsMap.set(key, {
      ...alert,
      isRead: readIds.has(alert.id) || alert.isRead
    });
  };

  // Rule 1 & 2: GST/HST Thresholds (DETERMINISTIC STABLE ID: alert-gst_exceeded / alert-gst_threshold)
  if (totalRevenue >= 30000) {
    const type: AlertType = 'gst_exceeded';
    const id = `alert-${type}`;
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
    const id = `alert-${type}`;
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
    const id = `alert-${type}`;
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

  // Rule 4: Overdue invoices
  const overdueInvoices = (invoices || []).filter(inv => {
    if (inv.status === 'En retard') return true;
    if (inv.status !== 'Payée' && inv.status !== 'paid' && inv.dueDate) {
      return new Date(inv.dueDate) < new Date();
    }
    return false;
  });

  if (overdueInvoices.length > 0) {
    const type: AlertType = 'invoice_overdue';
    const id = `alert-${type}`;
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

  // Rule 5: Free plan limit reached
  const totalInvoicesCount = (invoices || []).length;
  const trial = getFreeTrialInfo();
  if (!isPro && totalInvoicesCount >= 5 && !trial.isActive) {
    const type: AlertType = 'free_limit_reached';
    const id = `alert-${type}`;
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
    const id = `alert-${type}`;
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

  // Rule 7: Notification for created invoices (STABLE ID: alert-inv-${invId})
  if (invoices && invoices.length > 0) {
    invoices.slice(0, 5).forEach((inv) => {
      const invId = inv.id || 'FACT-NOUVELLE';
      const alertId = `alert-inv-${invId}`;
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

  return Array.from(alertsMap.values());
}
