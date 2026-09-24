export type InvoiceStatus = 'Brouillon' | 'Envoyée' | 'Partiellement payée' | 'Payée' | 'En retard' | 'Annulée' | 'paid' | 'partial';

export interface Invoice {
  id: string; // e.g. FACT-2026-045
  clientName: string;
  date: string; // e.g. "12 mai 2026"
  status: InvoiceStatus;
  subtotal: number;
  tps: number; // 5%
  tvq: number; // 9.975%
  total: number;
  paymentMethod?: string;
  paymentDate?: string;
  province?: string;
  dueDate?: string;
  currency?: string;
  description?: string;
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  amountPaid?: number;
  remainingBalance?: number;
  paymentStatus?: 'paid' | 'partial';
}

export interface Expense {
  id: string;
  category: string;
  provider: string;
  date: string;
  amountHt: number;
  tps: number;
  total: number;
  paymentMethod: string;
  notes?: string;
  receiptUrl?: string;
  isEligible?: boolean;
  taxDeductiblePercentage?: number;

  // Nouveaux champs Firestore Santé financière / Dépenses
  businessRef?: string;
  categoryRef?: string;
  supplierRef?: string;
  amount?: number;
  taxAmount?: number;
  currency?: string;
  expenseDate?: string;
  paymentStatus?: 'paid' | 'pending' | 'unpaid' | string;
  eligibleAmount?: number; // Montant admissible fiscalement
  createdAt?: string;
  userId?: string;
}

export interface Client {
  id: string;
  name: string;
  amountDue: number;
  email?: string;
  address?: string;
  province?: string;
  phone?: string;
  company?: string;
  status?: 'active' | 'inactive' | 'Actif' | 'Inactif' | 'Active' | 'Inactive' | 'Paiement en attente' | 'En retard' | string;
  notes?: string;
  type?: 'Entreprise' | 'Particulier';
  clientSince?: string;
  lastPaymentDate?: string;
  totalInvoiced?: number;
  paymentsReceived?: number;

  // Nouveaux champs Firestore Suivi Client / Santé financière
  businessRef?: string;
  lastInvoiceDate?: string | null;
  totalBilled?: number;
  totalPaid?: number;
  createdAt?: string;
  userId?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  description?: string;
  unitPrice: number;
  category?: string; // e.g. "Service", "Produit", "Consultation", "Forfait"
  unit?: string; // e.g. "heure", "unité", "forfait", "jour", "mois"
  taxApplicable?: boolean;
  sku?: string;
  createdAt?: string;
}

export type ScreenId =
  | 'landing'
  | 'choose_region'
  | 'login'
  | 'company_setup'
  | 'welcome_dashboard'
  | 'dashboard'
  | 'invoices'
  | 'invoice_detail'
  | 'add_expense'
  | 'expenses'
  | 'ai_advisor'
  | 'financial_health'
  | 'financial_alerts'
  | 'financial_trends'
  | 'financial_forecasts'
  | 'financial_history'
  | 'expense_detail'
  | 'monthly_summary'
  | 'tax_prep'
  | 'clients'
  | 'products'
  | 'payments'
  | 'reports'
  | 'settings'
  | 'notifications'
  | 'pricing'
  | 'admin';

export type AlertType = 
  | 'gst_threshold'
  | 'gst_exceeded'
  | 'taxes_reserved'
  | 'invoice_overdue'
  | 'free_limit_reached'
  | 'tax_savings'
  | 'general';

export type AlertSeverity = 'info' | 'success' | 'warning' | 'danger';

export interface SmartAlert {
  id: string;
  userId: string;
  type: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  isRead: boolean;
  createdAt: string;
  actionUrl?: ScreenId;
  actionLabel?: string;
  targetId?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: 'invoice' | 'tax' | 'client' | 'system' | 'alert';
  severity?: AlertSeverity;
  alertType?: AlertType;
  isRead: boolean;
  actionUrl?: ScreenId;
  actionLabel?: string;
  targetId?: string;
}

// ==========================================
// MODULE SANTÉ FINANCIÈRE (FIRESTORE SCHEMA)
// ==========================================

export type AccountingMethod = 'cash' | 'accrual';
export type BusinessRegion = 'canada' | 'afrique' | 'haiti';
export type BusinessCurrency = 'CAD' | 'FCFA' | 'HTG' | 'USD';
export type CountryCode = 'CA' | 'FR' | 'HT' | string;

export interface Business {
  id: string; // Firestore document ID
  ownerRef: string; // user_uid
  businessName: string;
  countryCode: 'CA' | 'FR' | 'HT' | string;
  region: BusinessRegion;
  currency: BusinessCurrency;

  // Nouveaux champs pour Santé financière
  accountingMethod: AccountingMethod;
  availableCash: number; // Trésorerie disponible
  currentAssets: number; // Actifs à court terme
  currentLiabilities: number; // Passifs à court terme
  totalOutstandingDebt: number; // Dette totale
  createdAt: string; // ISO string ou Timestamp
  updatedAt: string; // ISO string ou Timestamp
}

export interface FinancialHealthMetrics {
  workingCapital: number; // Actifs à court terme - Passifs à court terme
  currentRatio: number; // Actifs à court terme / Passifs à court terme (idéal > 1.5)
  quickRatio: number; // Trésorerie disponible / Passifs à court terme (idéal > 1.0)
  debtRatio: number; // Dette totale / Actifs (idéal < 0.5)
  runwayMonths: number; // Trésorerie / Burn rate mensuel
  healthScore: number; // Note globale sur 100
  status: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
  statusLabel: string;
}

export interface FinancialSnapshot {
  id: string;
  businessId: string;
  period: string; // e.g. "2026-05"
  availableCash: number;
  currentAssets: number;
  currentLiabilities: number;
  totalOutstandingDebt: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  netProfit: number;
  healthScore: number;
  createdAt: string;
}

// ==========================================
// PAIEMENTS & ENCAISSEMENTS (FIRESTORE)
// ==========================================

export type SupportedPaymentMethod = 
  | 'manual' 
  | 'moncash' 
  | 'orange_money' 
  | 'wave' 
  | 'mtn_money'
  | string;

export interface Payment {
  id: string;
  businessRef: string; // ID de l'entreprise
  invoiceRef: string; // ID de la facture liée
  clientRef: string; // ID du client
  amount: number;
  currency: BusinessCurrency | string; // "CAD", "FCFA", "HTG", "USD"
  paymentMethod: SupportedPaymentMethod; // "manual", "moncash", "orange_money", "wave", "mtn_money"
  paymentDate: string; // Timestamp ou ISO String

  // NOUVEAUX champs
  isPartial: boolean; // Paiement partiel (true) ou total (false)
  createdAt: string; // Date de création de la transaction

  // Métadonnées & Compatibilité
  userId?: string; // UID utilisateur pour indexation et règles Firestore
  userEmail?: string;
  status?: 'success' | 'pending' | 'failed' | string;
  transactionRef?: string;
  notes?: string;
}

// ==========================================
// OBLIGATIONS FINANCIÈRES & DETTES (FIRESTORE)
// ==========================================

export type ObligationType = 'loan' | 'credit_card' | 'tax_payable' | 'supplier_payable' | 'other';
export type ObligationStatus = 'active' | 'paid' | 'overdue';

export interface FinancialObligation {
  id: string;
  businessRef: string;
  type: ObligationType; // "loan" | "credit_card" | "tax_payable" | "supplier_payable" | "other"
  description: string; // ex: "Prêt bancaire RBC"
  currentBalance: number; // ex: 5000
  monthlyPayment?: number; // ex: 250
  dueDate: string; // Timestamp ou ISO string
  isShortTerm: boolean; // Court terme (true) ou long terme (false)
  currency: BusinessCurrency | string; // "CAD", "FCFA", "HTG", "USD"
  status: ObligationStatus; // "active" | "paid" | "overdue"
  createdAt: string; // Timestamp ou ISO string
  updatedAt: string; // Timestamp ou ISO string
  userId?: string;
}

// ==========================================
// INSTANTANÉS & ALERTES SANTÉ FINANCIÈRE
// ==========================================

export interface FinancialHealthSnapshotRecord {
  id: string;
  businessRef: string;
  calculatedAt: string; // ISO String ou Timestamp
  period?: string; // ex: "2026-05"
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
  createdAt?: string;
}

export type FinancialAlertSeverity = 'info' | 'warning' | 'critical' | 'urgent';

export interface FinancialAlert {
  id: string;
  businessRef: string;
  title: string;
  message: string;
  severity: FinancialAlertSeverity; // "info" | "warning" | "critical" | "urgent"
  isRead: boolean;
  category?: string; // "liquidity" | "debt" | "tax" | "general"
  createdAt: string; // Timestamp ou ISO string
  actionUrl?: string;
}



