import { Invoice } from '../types';

export type PaymentSectionStatus = 'Non payé' | 'Payé' | 'Payé partiellement' | 'En retard';

export const PAYMENT_SECTION_STATUSES: PaymentSectionStatus[] = [
  'Non payé',
  'Payé',
  'Payé partiellement',
  'En retard'
];

/**
 * Vérifie si la date d'échéance de la facture est dépassée par rapport à aujourd'hui.
 */
export function isInvoiceOverdue(dueDate?: string): boolean {
  if (!dueDate || !dueDate.trim()) return false;
  try {
    let due: Date | null = null;
    const trimmed = dueDate.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      due = new Date(trimmed);
    } else if (/^\d{2}\/\d{2}\/\d{4}/.test(trimmed)) {
      const parts = trimmed.split('/');
      due = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    } else {
      const parsed = Date.parse(trimmed);
      if (!isNaN(parsed)) {
        due = new Date(parsed);
      }
    }

    if (!due || isNaN(due.getTime())) return false;

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();

    return todayStart > dueDay;
  } catch {
    return false;
  }
}

/**
 * Calcule le statut strict et exclusif pour la section Paiements :
 * 1. 'Payé' : totalité du montant soldée (solde restant = 0)
 * 2. 'En retard' : date d'échéance dépassée avec un solde impayé > 0
 * 3. 'Payé partiellement' : montant partiel perçu (> 0 et < total) sans être en retard
 * 4. 'Non payé' : aucun paiement reçu et date d'échéance non dépassée
 * 
 * IMPORTANT : Dans la section Paiements, une facture marquée 'Envoyée' (par email,
 * WhatsApp ou SMS) ou 'Brouillon' est TOUJOURS affichée avec son statut financier :
 * 'Non payé' (ou 'En retard' si l'échéance est passée), JAMAIS 'Envoyée'.
 */
export function getPaymentSectionStatus(inv: Invoice): PaymentSectionStatus {
  if (inv.status === 'Annulée') {
    return 'Non payé';
  }

  // 1. Payé intégralement
  const isFullyPaid =
    inv.status === 'Payée' ||
    inv.status === 'paid' ||
    inv.paymentStatus === 'paid' ||
    (inv.remainingBalance !== undefined && inv.remainingBalance <= 0.01 && (inv.amountPaid || 0) > 0);

  if (isFullyPaid) {
    return 'Payé';
  }

  // 2. En retard (l'échéance est passée et la facture n'est pas soldée)
  const isOverdue = inv.status === 'En retard' || isInvoiceOverdue(inv.dueDate);
  if (isOverdue) {
    return 'En retard';
  }

  // 3. Payé partiellement
  const amountPaid = inv.amountPaid || 0;
  const isPartial =
    inv.status === 'Partiellement payée' ||
    inv.status === 'partial' ||
    inv.paymentStatus === 'partial' ||
    (amountPaid > 0 && (inv.remainingBalance === undefined || inv.remainingBalance > 0.01));

  if (isPartial) {
    return 'Payé partiellement';
  }

  // 4. Non payé (par défaut pour toute facture envoyée ou enregistrée sans encaissement)
  return 'Non payé';
}

/**
 * Styles visuels uniformes pour les badges des 4 statuts de paiement
 */
export function getPaymentStatusBadgeStyle(status: PaymentSectionStatus) {
  switch (status) {
    case 'Payé':
      return {
        label: 'Payé',
        className: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold',
        dotClass: 'bg-emerald-500',
        iconName: 'check'
      };
    case 'Payé partiellement':
      return {
        label: 'Payé partiellement',
        className: 'bg-blue-100 text-blue-800 border-blue-300 font-extrabold',
        dotClass: 'bg-blue-500',
        iconName: 'partial'
      };
    case 'En retard':
      return {
        label: 'En retard',
        className: 'bg-rose-100 text-rose-800 border-rose-300 font-extrabold',
        dotClass: 'bg-rose-500',
        iconName: 'alert'
      };
    case 'Non payé':
    default:
      return {
        label: 'Non payé',
        className: 'bg-amber-100 text-amber-800 border-amber-300 font-extrabold',
        dotClass: 'bg-amber-500',
        iconName: 'clock'
      };
  }
}
