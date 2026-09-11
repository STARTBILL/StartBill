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
  status?: 'Actif' | 'Inactif' | 'Active' | 'Inactive' | 'Paiement en attente' | 'En retard';
  notes?: string;
  type?: 'Entreprise' | 'Particulier';
  clientSince?: string;
  lastPaymentDate?: string;
  totalInvoiced?: number;
  paymentsReceived?: number;
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
