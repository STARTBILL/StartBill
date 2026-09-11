import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { SmartAlert, Invoice, AlertSeverity, AlertType } from '../types';

export async function getAlertsFromFirestore(userId: string): Promise<SmartAlert[]> {
  try {
    const alertsRef = collection(db, 'alerts');
    const q = query(alertsRef, where('userId', '==', userId));
    const snap = await getDocs(q);
    const list: SmartAlert[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as SmartAlert);
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

export async function deleteAlertFromFirestore(alertId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'alerts', alertId));
  } catch (err) {
    console.error('Error deleting alert from Firestore:', err);
  }
}

export async function markAlertAsReadInFirestore(alertId: string, isRead = true): Promise<void> {
  try {
    const alertRef = doc(db, 'alerts', alertId);
    await setDoc(alertRef, { isRead }, { merge: true });
  } catch (err) {
    console.error('Error marking alert as read in Firestore:', err);
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

  // Map existing read states by alert type/id so user's manual "isRead" is preserved
  const existingReadState = new Map<string, boolean>();
  existingAlerts.forEach(a => {
    existingReadState.set(a.type, a.isRead);
    existingReadState.set(a.id, a.isRead);
  });

  const nowStr = new Date().toISOString();

  // Rule 1 & 2: GST/HST Thresholds
  if (totalRevenue >= 30000) {
    const type: AlertType = 'gst_exceeded';
    const id = `alert-${userId}-${type}`;
    alertsMap.set(type, {
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
    alertsMap.set(type, {
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
    alertsMap.set(type, {
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
    alertsMap.set(type, {
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

  // Rule 5: Free plan limit reached (invoiceCount >= 5 and free plan)
  const totalInvoicesCount = invoices.length;
  if (!isPro && totalInvoicesCount >= 5) {
    const type: AlertType = 'free_limit_reached';
    const id = `alert-${userId}-${type}`;
    alertsMap.set(type, {
      id,
      userId,
      type,
      title: 'Limite gratuite atteinte',
      message: 'Tu as utilisé tes 5 factures gratuites. Passe au plan Start pour créer des factures illimitées.',
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
    alertsMap.set(type, {
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

  const generatedList = Array.from(alertsMap.values());

  // Save generated alerts to Firestore asynchronously
  generatedList.forEach(alert => {
    saveAlertToFirestore(alert).catch(() => {});
  });

  return generatedList;
}
