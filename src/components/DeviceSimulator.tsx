import React, { useState, useRef, useEffect } from 'react';
import {
  Home,
  FileText,
  CreditCard,
  BarChart3,
  MoreHorizontal,
  Search,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  Mail,
  MessageSquare,
  Trash2,
  Copy,
  Plus,
  Info,
  Check,
  AlertCircle,
  FileSpreadsheet,
  Upload,
  UserPlus,
  ArrowRight,
  PlusCircle,
  TrendingUp,
  SlidersHorizontal,
  ChevronDown,
  Pencil,
  Percent,
  RefreshCw,
  PiggyBank,
  Receipt,
  Settings,
  Zap,
  Menu,
  X,
  Bell,
  LogIn,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Building2,
  Sparkles,
  Lock,
  LogOut,
  AlertTriangle,
  Compass,
  Clock,
  Activity,
  Package
} from 'lucide-react';
import { Invoice, Expense, Client, ScreenId, InvoiceStatus, ProductItem } from '../types';
import DetailedAnalysisPage from './DetailedAnalysisPage';
import FinancialAlertsPage from './FinancialAlertsPage';
import FinancialTrendsPage from './FinancialTrendsPage';
import FinancialForecastsPage from './FinancialForecastsPage';
import FinancialHistoryPage from './FinancialHistoryPage';
import AiAdvisorPage from './AiAdvisorPage';
import Dashboard from './Dashboard';
import ClientsPage from './ClientsPage';
import InvoicesPage from './InvoicesPage';
import ExpensesPage from './ExpensesPage';
import ProductsPage from './ProductsPage';
import NotificationsPage from './NotificationsPage';
import LoginPage from './LoginPage';
import ChooseRegionPage from './ChooseRegionPage';
import CompanySetupPage from './CompanySetupPage';
import WelcomeDashboardPage from './WelcomeDashboardPage';
import LandingPage from './LandingPage';
import PricingPage from './PricingPage';
import AdminDashboard from './AdminDashboard';
import { ConfirmModal } from './ui/ConfirmModal';
import { REGIONS } from '../data/regions';
import { DEFAULT_PRODUCTS_CANADA, DEFAULT_PRODUCTS_AFRIQUE, DEFAULT_PRODUCTS_HAITI } from '../data/defaultProducts';
import { seedRegionalSettingsInFirestore } from '../lib/regionalSettings';
import { downloadInvoicePdf } from '../lib/pdfGenerator';
import { useRegionalContext } from '../context/RegionalContext';
import { useAuth } from '../context/AuthContext';
import { isSuperAdminEmail, SUPER_ADMIN_EMAIL } from '../lib/authSecurity';
import { db, auth } from '../lib/firebase';
import { generateSmartAlerts } from '../lib/alerts';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';

export const PROVINCES_TAXES = [
  { name: 'Québec', gst: 0.05, pst: 0.09975, pstLabel: 'QST (9.975%)', gstLabel: 'GST (5%)' },
  { name: 'Ontario', gst: 0, pst: 0.13, pstLabel: 'HST (13%)', gstLabel: '' },
  { name: 'Alberta', gst: 0.05, pst: 0, pstLabel: '', gstLabel: 'GST (5%)' },
  { name: 'Colombie-Britannique', gst: 0.05, pst: 0.07, pstLabel: 'PST (7%)', gstLabel: 'GST (5%)' },
  { name: 'Manitoba', gst: 0.05, pst: 0.07, pstLabel: 'RST (7%)', gstLabel: 'GST (5%)' },
  { name: 'Saskatchewan', gst: 0.05, pst: 0.06, pstLabel: 'PST (6%)', gstLabel: 'GST (5%)' },
  { name: 'Nouvelle-Écosse', gst: 0, pst: 0.14, pstLabel: 'HST (14%)', gstLabel: '' },
  { name: 'Nouveau-Brunswick', gst: 0, pst: 0.15, pstLabel: 'HST (15%)', gstLabel: '' },
  { name: 'Terre-Neuve-et-Labrador', gst: 0, pst: 0.15, pstLabel: 'HST (15%)', gstLabel: '' },
  { name: 'Île-du-Prince-Édouard', gst: 0, pst: 0.15, pstLabel: 'HST (15%)', gstLabel: '' },
  { name: 'Territoires', gst: 0.05, pst: 0, pstLabel: '', gstLabel: 'GST (5%)' },
];

export interface TaxResult {
  gst: number;
  pst: number;
  qst: number;
  hst: number;
  totalTax: number;
  total: number;
}

export function calculateTaxes(province: string, subtotal: number): TaxResult {
  const rates: Record<string, { gst: number; pst: number; qst: number; hst: number }> = {
    'Québec': { gst: 0.05, pst: 0, qst: 0.09975, hst: 0 },
    'Ontario': { gst: 0, pst: 0, qst: 0, hst: 0.13 },
    'Alberta': { gst: 0.05, pst: 0, qst: 0, hst: 0 },
    'Colombie-Britannique': { gst: 0.05, pst: 0.07, qst: 0, hst: 0 },
    'Manitoba': { gst: 0.05, pst: 0.07, qst: 0, hst: 0 }, // RST 7% maps to pst
    'Saskatchewan': { gst: 0.05, pst: 0.06, qst: 0, hst: 0 }, // PST 6% maps to pst
    'Nouvelle-Écosse': { gst: 0, pst: 0, qst: 0, hst: 0.14 },
    'Nouveau-Brunswick': { gst: 0, pst: 0, qst: 0, hst: 0.15 },
    'Terre-Neuve-et-Labrador': { gst: 0, pst: 0, qst: 0, hst: 0.15 },
    'Île-du-Prince-Édouard': { gst: 0, pst: 0, qst: 0, hst: 0.15 },
    'Territoires': { gst: 0.05, pst: 0, qst: 0, hst: 0 },
  };

  const tax = rates[province] || { gst: 0.05, pst: 0, qst: 0, hst: 0 };
  const gst = parseFloat((subtotal * tax.gst).toFixed(2));
  const pst = parseFloat((subtotal * tax.pst).toFixed(2));
  const qst = parseFloat((subtotal * tax.qst).toFixed(2));
  const hst = parseFloat((subtotal * tax.hst).toFixed(2));
  const totalTax = parseFloat((gst + pst + qst + hst).toFixed(2));
  return {
    gst,
    pst,
    qst,
    hst,
    totalTax,
    total: parseFloat((subtotal + totalTax).toFixed(2)),
  };
}

interface DeviceSimulatorProps {
  invoices: Invoice[];
  expenses: Expense[];
  clients: Client[];
  currentScreen: ScreenId;
  setScreen: (screen: ScreenId) => void;
  selectedInvoiceId: string | null;
  setSelectedInvoiceId: (id: string | null) => void;
  selectedExpenseId: string | null;
  setSelectedExpenseId: (id: string | null) => void;
  onAddInvoice: (invoice: Invoice) => void;
  onAddExpense: (expense: Expense) => void;
  onAddClient: (client: Client) => void;
  onUpdateClient?: (client: Client) => void;
  onDeleteClient?: (id: string) => void;
  onUpdateInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  onDeleteInvoice: (id: string) => void;
  onDeleteExpense: (id: string) => void;
  onUpdateInvoice: (invoice: Invoice) => void;
  onUpdateExpense: (expense: Expense) => void;
  isDbConnected?: boolean;
  isLoading?: boolean;
  onResetData?: () => void;
}

export default function DeviceSimulator({
  invoices,
  expenses,
  clients,
  currentScreen,
  setScreen,
  selectedInvoiceId,
  setSelectedInvoiceId,
  selectedExpenseId,
  setSelectedExpenseId,
  onAddInvoice,
  onAddExpense,
  onAddClient,
  onUpdateClient = () => {},
  onDeleteClient = () => {},
  onUpdateInvoiceStatus,
  onDeleteInvoice,
  onDeleteExpense,
  onUpdateInvoice,
  onUpdateExpense,
  isDbConnected = true,
  isLoading = false,
  onResetData
}: DeviceSimulatorProps) {

  // Regional Context Integration (Web-first vs Mobile-first)
  const { 
    region: currentRegion, 
    setRegion: setCurrentRegion, 
    regionalSettings, 
    isWebFirst, 
    isMobileFirst,
    hasChannel,
    paymentProviders 
  } = useRegionalContext();

  // Search and Filter local states
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceTab, setInvoiceTab] = useState<'Toutes' | 'Envoyées' | 'Payées' | 'En retard' | 'Brouillons'>('Toutes');
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseTab, setExpenseTab] = useState<'Toutes' | 'Ce mois'>('Toutes');
  const [clientSearch, setClientSearch] = useState('');
  const [reportTab, setReportTab] = useState<'Aperçu' | 'Comparaison' | 'Catégories' | 'Analyse détaillée'>('Aperçu');
  const [isPro, setIsPro] = useState(false);
  const [showProUpgradeModal, setShowProUpgradeModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dynamic Payment States
  const [paymentOption, setPaymentOption] = useState<'total' | 'partial'>('total');
  const [customAmountPaid, setCustomAmountPaid] = useState<string>('');
  const [lastInvoiceId, setLastInvoiceId] = useState<string>('');

  // Firestore Dynamic Dashboard States
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [dbInvoices, setDbInvoices] = useState<any[]>([]);
  const [dbClients, setDbClients] = useState<any[]>([]);
  const [dbExpenses, setDbExpenses] = useState<any[]>([]);
  const [dbLoading, setDbLoading] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Module 4: Produits et services
  const [products, setProducts] = useState<ProductItem[]>(() => {
    try {
      const saved = localStorage.getItem('startbill_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    if (currentRegion === 'afrique') return DEFAULT_PRODUCTS_AFRIQUE;
    if (currentRegion === 'haiti') return DEFAULT_PRODUCTS_HAITI;
    return DEFAULT_PRODUCTS_CANADA;
  });

  useEffect(() => {
    try {
      localStorage.setItem('startbill_products', JSON.stringify(products));
    } catch {}
  }, [products]);

  const handleAddProduct = (newProd: ProductItem) => {
    setProducts(prev => [newProd, ...prev]);
  };

  const handleUpdateProduct = (updatedProd: ProductItem) => {
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const fetchFirestoreData = async (uid: string) => {
    try {
      setDbLoading(true);
      setDbError(null);

      // Ensure regionalSettings documents exist in Firebase Firestore
      seedRegionalSettingsInFirestore().catch(() => {});

      const defaultInvoices: any[] = [];
      const defaultClients: any[] = [];
      const defaultExpenses: any[] = [];

      const timeoutMs = 3500; // 3.5s timeout for initial load

      const fetchInvoicesPromise = new Promise<any[]>(async (resolve) => {
        try {
          const invoicesRef = collection(db, 'invoices');
          const qInvoices = query(invoicesRef, where('userId', '==', uid));
          const snap = await getDocs(qInvoices);
          if (snap.empty) {
            resolve([]);
          } else {
            const list: any[] = [];
            snap.forEach((docSnap) => list.push(docSnap.data()));
            resolve(list);
          }
        } catch {
          resolve([]);
        }
      });

      const fetchClientsPromise = new Promise<any[]>(async (resolve) => {
        try {
          const clientsRef = collection(db, 'clients');
          const qClients = query(clientsRef, where('userId', '==', uid));
          const snap = await getDocs(qClients);
          if (snap.empty) {
            resolve([]);
          } else {
            const list: any[] = [];
            snap.forEach((docSnap) => list.push(docSnap.data()));
            resolve(list);
          }
        } catch {
          resolve([]);
        }
      });

      const fetchExpensesPromise = new Promise<any[]>(async (resolve) => {
        try {
          const expensesRef = collection(db, 'expenses');
          const qExpenses = query(expensesRef, where('userId', '==', uid));
          const snap = await getDocs(qExpenses);
          if (snap.empty) {
            resolve([]);
          } else {
            const list: any[] = [];
            snap.forEach((docSnap) => list.push(docSnap.data()));
            resolve(list);
          }
        } catch {
          resolve([]);
        }
      });

      const timeoutPromise = (fallback: any) => new Promise<any>((resolve) => setTimeout(() => resolve(fallback), timeoutMs));

      const [invoicesRes, clientsRes, expensesRes] = await Promise.all([
        Promise.race([fetchInvoicesPromise, timeoutPromise(defaultInvoices)]),
        Promise.race([fetchClientsPromise, timeoutPromise(defaultClients)]),
        Promise.race([fetchExpensesPromise, timeoutPromise(defaultExpenses)])
      ]);

      setDbInvoices(invoicesRes);
      setDbClients(clientsRes);
      setDbExpenses(expensesRes);
    } catch (err: any) {
      console.error("Error loading Firestore data:", err);
    } finally {
      setDbLoading(false);
    }
  };

  const { user: authUser, firebaseUser, signOutUser, isSuperAdmin } = useAuth();

  // Determine active email and Super Admin status (contact.startbill@gmail.com)
  const currentActiveEmail = (
    authUser?.email || 
    currentUser?.email || 
    firebaseUser?.email || 
    ''
  ).trim().toLowerCase();
  const isSuperAdminUser = Boolean(isSuperAdmin || isSuperAdminEmail(currentActiveEmail));

  // Determine if there is an authenticated user session
  const isAuthenticated = Boolean(
    (firebaseUser && !firebaseUser.isAnonymous) || 
    (currentUser && currentUser.email && !currentUser.isAnonymous)
  );

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !user.isAnonymous) {
        setCurrentUser(user);
        await fetchFirestoreData(user.uid);
      } else {
        // User is not logged in
        setCurrentUser(null);
        setDbInvoices([]);
        setDbExpenses([]);
        setDbClients([]);
        setDbLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Synchronize internal db states with App props
  React.useEffect(() => {
    if (invoices) setDbInvoices(invoices);
  }, [invoices]);

  React.useEffect(() => {
    if (expenses) setDbExpenses(expenses);
  }, [expenses]);

  React.useEffect(() => {
    if (clients) setDbClients(clients);
  }, [clients]);


  // Forms states
  const [newExpenseCategory, setNewExpenseCategory] = useState('Transport');
  const [newExpenseProvider, setNewExpenseProvider] = useState('');
  const [newExpenseDate, setNewExpenseDate] = useState('2026-05-12');
  const [newExpenseAmountHt, setNewExpenseAmountHt] = useState('60.00');
  const [newExpenseTps, setNewExpenseTps] = useState('3.00');
  const [newExpensePayment, setNewExpensePayment] = useState('Carte bancaire');
  const [newExpenseNotes, setNewExpenseNotes] = useState('');
  const [receiptImg, setReceiptImg] = useState<string | null>(null);

  // Edit Expense state
  const [isEditingExpense, setIsEditingExpense] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  // New & Edit Invoice form state
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [formStep, setFormStep] = useState<number>(1);
  const [invClientName, setInvClientName] = useState('Client A');
  const [invDate, setInvDate] = useState('2026-05-12');
  const [invSubtotal, setInvSubtotal] = useState('1000.00');
  const [invStatus, setInvStatus] = useState<InvoiceStatus>('Envoyée');
  const [isEditingInvoice, setIsEditingInvoice] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);

  // Dynamic Canada Tax states
  const [invProvince, setInvProvince] = useState<string>('Québec');
  const [invDueDate, setInvDueDate] = useState<string>('2026-06-12');
  const [invCurrency, setInvCurrency] = useState<string>('CAD');
  const [invDescription, setInvDescription] = useState<string>('');
  const [invItems, setInvItems] = useState<Array<{ description: string; quantity: number; unitPrice: number; total: number }>>([
    { description: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);

  // Global filters
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Mai 2026');
  const [selectedAccount, setSelectedAccount] = useState<string>('Tous les comptes');
  const [selectedTaxPeriod, setSelectedTaxPeriod] = useState<string>('Année 2026');

  // New Client form state
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [clientNameInput, setClientNameInput] = useState('');

  // AI Advisor dismiss state
  const [showAiAdvisor, setShowAiAdvisor] = useState(true);
  const [showPlusMenu, setShowPlusMenu] = useState(false);

  // Company state variables (persisted in localStorage)
  const [companyName, setCompanyName] = useState(() => localStorage.getItem('company_name') || 'StartBill Canada Inc.');
  const [companyOwner, setCompanyOwner] = useState(() => localStorage.getItem('company_owner') || 'Ferline');
  const [companyNE, setCompanyNE] = useState(() => localStorage.getItem('company_ne') || '123456789 RC0001');
  const [companyAddress, setCompanyAddress] = useState(() => localStorage.getItem('company_address') || '1000 Rue de la Gauchetière O, Montréal, QC H3B 4W5');
  const [companyPhone, setCompanyPhone] = useState(() => localStorage.getItem('company_phone') || '+1 (514) 555-0199');
  const [companyLogo, setCompanyLogo] = useState(() => localStorage.getItem('company_logo') || 'https://lh3.googleusercontent.com/d/1SJiIy3yPrhrfTZUgAAQ_35qJXkV5T_5W');
  const [companySignature, setCompanySignature] = useState(() => localStorage.getItem('company_signature') || 'https://lh3.googleusercontent.com/d/1B0q88Z-b6RCHH_h_V6f578H8i2VfEw9u');

  // Email Confirmation Modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');

  // Custom Confirm Modals
  const [showResetPaymentConfirm, setShowResetPaymentConfirm] = useState(false);
  const [showDeleteInvoiceConfirm, setShowDeleteInvoiceConfirm] = useState(false);
  const [showResetAllDataConfirm, setShowResetAllDataConfirm] = useState(false);

  // Persist company details changes
  React.useEffect(() => {
    localStorage.setItem('company_name', companyName);
    localStorage.setItem('company_owner', companyOwner);
    localStorage.setItem('company_ne', companyNE);
    localStorage.setItem('company_address', companyAddress);
    localStorage.setItem('company_phone', companyPhone);
    localStorage.setItem('company_logo', companyLogo);
    localStorage.setItem('company_signature', companySignature);
  }, [companyName, companyOwner, companyNE, companyAddress, companyPhone, companyLogo, companySignature]);

  // Toast notifications state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter helper functions
  const matchesPeriod = (dateStr: string) => {
    if (!dateStr || selectedPeriod === 'Tous les mois' || selectedPeriod === 'Toutes les dates') return true;
    if (selectedPeriod === 'Mai 2026' || selectedPeriod === 'Mois en cours') return true;
    return true;
  };

  const matchesAccount = (paymentMethod?: string) => {
    if (!selectedAccount || selectedAccount === 'Tous les comptes') return true;
    if (!paymentMethod) return true;
    const normSelect = selectedAccount.toLowerCase();
    const normPay = paymentMethod.toLowerCase();
    if (normSelect.includes('carte')) return normPay.includes('carte');
    if (normSelect.includes('virement')) return normPay.includes('virement');
    if (normSelect.includes('comptant')) return normPay.includes('comptant') || normPay.includes('cash');
    return true;
  };

  // Calculate actual total values from active user state
  const activeInvoicesList = invoices;
  const activeExpensesList = expenses;

  const currentPaidInvoicesSum = activeInvoicesList
    .filter(inv => (inv.status === 'Payée' || inv.status === 'paid' || inv.status === 'Partiellement payée' || inv.status === 'partial' || (inv.amountPaid !== undefined && inv.amountPaid > 0)) && matchesPeriod(inv.date || '') && matchesAccount(inv.paymentMethod))
    .reduce((sum, inv) => {
      if (inv.amountPaid !== undefined) {
        return sum + Number(inv.amountPaid);
      }
      if (inv.status === 'Payée' || inv.status === 'paid') {
        return sum + Number(inv.total || inv.subtotal || 0);
      }
      return sum;
    }, 0);

  const revenuesEncaissees = currentPaidInvoicesSum;

  const currentExpensesSum = activeExpensesList
    .filter(exp => matchesPeriod(exp.date || '') && matchesAccount(exp.paymentMethod))
    .reduce((sum, exp) => sum + Number(exp.total || exp.amountHt || 0), 0);

  const depensesAdmissibles = currentExpensesSum;

  const beneficeNet = Math.max(0, revenuesEncaissees - depensesAdmissibles);

  // Taxes to remit: TPS + TVQ.
  const currentInvoiceTaxesSum = activeInvoicesList
    .filter(inv => matchesPeriod(inv.date || '') && ((inv.status === 'Payée' || inv.status === 'paid') ? matchesAccount(inv.paymentMethod) : true))
    .reduce((sum, inv) => sum + Number(inv.tps || 0) + Number(inv.tvq || 0) + Number((inv as any).hst || 0), 0);

  const currentExpenseTaxesSum = activeExpensesList
    .filter(exp => matchesPeriod(exp.date || '') && matchesAccount(exp.paymentMethod))
    .reduce((sum, exp) => sum + Number(exp.tps || 0), 0);

  const taxesToRemit = Math.max(0, currentInvoiceTaxesSum - currentExpenseTaxesSum);

  // Impôt estimé (20%)
  const impotEstime = Math.max(0, beneficeNet * 0.20);
  const recommendedSavings = taxesToRemit + impotEstime;

  const smartAlerts = generateSmartAlerts(
    currentUser?.uid || 'user-default',
    revenuesEncaissees,
    taxesToRemit,
    activeInvoicesList,
    isPro
  );
  const unreadAlertsCount = smartAlerts.filter(a => !a.isRead).length;

  // Find selected detail items
  const selectedInvoice = activeInvoicesList.find(inv => inv.id === selectedInvoiceId) || activeInvoicesList[0];
  const selectedExpense = activeExpensesList.find(exp => exp.id === selectedExpenseId) || activeExpensesList[0];

  // Sync payment registration states on invoice change
  if (selectedInvoice && selectedInvoice.id !== lastInvoiceId) {
    setLastInvoiceId(selectedInvoice.id);
    const resolvedAmt = selectedInvoice.amountPaid !== undefined 
      ? selectedInvoice.amountPaid 
      : ((selectedInvoice.status === 'Payée' || selectedInvoice.status === 'paid') ? selectedInvoice.total : 0);
    setPaymentOption(selectedInvoice.status === 'Payée' || selectedInvoice.status === 'paid' ? 'total' : 'partial');
    setCustomAmountPaid(resolvedAmt.toString());
  }

  // Firestore dynamic values calculations - include full AND partial payments
  const totalRevenue = activeInvoicesList.reduce((sum, inv) => {
    if (inv.status === 'Payée' || inv.status === 'paid') {
      return sum + Number(inv.amountPaid !== undefined ? inv.amountPaid : (inv.total || 0));
    }
    if (inv.status === 'Partiellement payée' || inv.status === 'partial' || (inv.amountPaid !== undefined && inv.amountPaid > 0)) {
      return sum + Number(inv.amountPaid || 0);
    }
    return sum;
  }, 0);

  const totalTax = activeInvoicesList.reduce((sum, inv) => {
    const invTax = (inv as any).taxAmount !== undefined ? (inv as any).taxAmount : ((inv.tps || 0) + (inv.tvq || 0) + ((inv as any).hst || 0));
    if (inv.status === 'Payée' || inv.status === 'paid') {
      return sum + invTax;
    }
    if ((inv.status === 'Partiellement payée' || inv.status === 'partial' || (inv.amountPaid !== undefined && inv.amountPaid > 0)) && inv.total && inv.total > 0) {
      const paidRatio = Math.min(1, (inv.amountPaid || 0) / inv.total);
      return sum + (invTax * paidRatio);
    }
    return sum;
  }, 0);

  const estimatedTax = totalRevenue * 0.25;

  const paidInvoicesCount = activeInvoicesList.filter(inv => inv.status?.toLowerCase() === 'paid' || inv.status === 'Payée').length;
  const overdueInvoicesCount = activeInvoicesList.filter(inv => inv.status?.toLowerCase() === 'en retard' || inv.status?.toLowerCase() === 'overdue' || inv.status === 'En retard').length;

  const eligibleExpenses = activeExpensesList.filter(exp => exp.isEligible !== false);
  const totalEligibleExpenses = activeExpensesList.reduce((sum, exp) => sum + (exp.total || exp.amountHt || 0), 0);

  // Open New Invoice Modal with fully reset 2-step state
  const openNewInvoiceModal = () => {
    setFormStep(1);
    setIsEditingInvoice(false);
    setEditingInvoiceId(null);
    setInvClientName(clients[0]?.name || 'Client A');
    setInvDate(new Date().toISOString().split('T')[0]);
    setInvDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setInvProvince('Québec');
    setInvCurrency('CAD');
    setInvDescription('');
    setInvItems([{ description: '', quantity: 1, unitPrice: 0, total: 0 }]);
    setShowNewInvoiceModal(true);
  };

  // Handler for adding or editing an invoice
  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sub = invItems.reduce((sum, item) => sum + item.total, 0);
    const taxRes = calculateTaxes(invProvince, sub);
    const tpsVal = parseFloat((taxRes.gst + taxRes.hst).toFixed(2));
    const tvqVal = parseFloat((taxRes.pst + taxRes.qst).toFixed(2));
    const tot = taxRes.total;

    if (isEditingInvoice && editingInvoiceId) {
      const updatedInv: Invoice = {
        id: editingInvoiceId,
        clientName: invClientName,
        date: invDate,
        status: invStatus,
        subtotal: sub,
        tps: tpsVal,
        tvq: tvqVal,
        total: tot,
        province: invProvince,
        dueDate: invDueDate,
        currency: invCurrency,
        description: invDescription,
        items: invItems
      };
      onUpdateInvoice(updatedInv);
      setDbInvoices(prev => prev.map(inv => inv.id === updatedInv.id ? updatedInv : inv));
      setIsEditingInvoice(false);
      setEditingInvoiceId(null);
      setShowNewInvoiceModal(false);
      triggerToast(`Facture ${updatedInv.id} modifiée avec succès !`);
      setScreen('invoice_detail');
    } else {
      const newId = `FACT-2026-0${invoices.length + 40}`;
      const newInv: Invoice = {
        id: newId,
        clientName: invClientName,
        date: invDate,
        status: 'Envoyée',
        subtotal: sub,
        tps: tpsVal,
        tvq: tvqVal,
        total: tot,
        province: invProvince,
        dueDate: invDueDate,
        currency: invCurrency,
        description: invDescription,
        items: invItems
      };

      onAddInvoice(newInv);
      setDbInvoices(prev => [newInv, ...prev]);
      setSelectedInvoiceId(newId);
      setShowNewInvoiceModal(false);
      triggerToast(`Facture ${newInv.id} créée avec succès !`);
      setScreen('invoice_detail');
    }
  };

  // Professional PDF generation using downloadInvoicePdf utility
  const handleDownloadPdf = async (invoiceId: string) => {
    await downloadInvoicePdf({
      invoiceId,
      elementId: 'printable-invoice-content',
      onStart: () => triggerToast('Génération du PDF professionnel en cours...'),
      onSuccess: () => triggerToast('Facture PDF téléchargée avec succès !'),
      onError: (err) => {
        console.error('Erreur téléchargement PDF:', err);
        triggerToast("Échec PDF direct. Impression de la facture seule lancée...");
      }
    });
  };

  // Handler for adding or editing an expense
  const handleCreateExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sub = parseFloat(newExpenseAmountHt) || 0;
    const tpsVal = parseFloat(newExpenseTps) || 0;
    const tot = parseFloat((sub + tpsVal).toFixed(2));

    if (isEditingExpense && editingExpenseId) {
      const updatedExp: Expense = {
        id: editingExpenseId,
        category: newExpenseCategory,
        provider: newExpenseProvider || 'Commerçant',
        date: newExpenseDate,
        amountHt: sub,
        tps: tpsVal,
        total: tot,
        paymentMethod: newExpensePayment,
        notes: newExpenseNotes,
        receiptUrl: receiptImg || undefined
      };
      onUpdateExpense(updatedExp);
      setDbExpenses(prev => prev.map(exp => exp.id === updatedExp.id ? updatedExp : exp));
      setIsEditingExpense(false);
      setEditingExpenseId(null);
      triggerToast(`Dépense modifiée avec succès !`);
      // Reset form
      setNewExpenseProvider('');
      setNewExpenseNotes('');
      setReceiptImg(null);
      setScreen('expense_detail');
    } else {
      const newExp: Expense = {
        id: `EXP-0${expenses.length + 8}`,
        category: newExpenseCategory,
        provider: newExpenseProvider || 'Commerçant',
        date: newExpenseDate,
        amountHt: sub,
        tps: tpsVal,
        total: tot,
        paymentMethod: newExpensePayment,
        notes: newExpenseNotes,
        receiptUrl: receiptImg || undefined
      };

      onAddExpense(newExp);
      setDbExpenses(prev => [newExp, ...prev]);
      triggerToast(`Dépense de ${tot.toFixed(2)} $ enregistrée !`);
      // Reset form
      setNewExpenseProvider('');
      setNewExpenseNotes('');
      setReceiptImg(null);
      setScreen('expenses');
    }
  };

  // Handler for adding client
  const handleCreateClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientNameInput.trim()) return;

    const newCli: Client = {
      id: `CLI-0${clients.length + 1}`,
      name: clientNameInput,
      amountDue: 0.00
    };

    onAddClient(newCli);
    setDbClients(prev => [...prev, newCli]);
    setInvClientName(newCli.name);
    setClientNameInput('');
    setShowNewClientModal(false);
    triggerToast(`Client "${newCli.name}" ajouté avec succès !`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Duplicate invoice
  const handleDuplicateInvoice = (invoice: Invoice) => {
    const newInv: Invoice = {
      ...invoice,
      id: `FACT-2026-0${invoices.length + 41}`,
      date: '2026-05-12',
      status: 'Brouillon'
    };
    onAddInvoice(newInv);
    setDbInvoices(prev => [newInv, ...prev]);
    triggerToast(`Facture ${invoice.id} dupliquée en ${newInv.id} (Brouillon)`);
    setSelectedInvoiceId(newInv.id);
  };

  // Export files
  const triggerDownloadCSV = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(`Export ${filename} téléchargé !`);
  };

  // Status badging utility
  const getStatusBadgeClass = (status: InvoiceStatus) => {
    switch (status) {
      case 'Payée':
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'En retard':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'Envoyée':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Partiellement payée':
      case 'partial':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      default:
        return 'bg-gray-50 text-gray-600 border border-gray-200';
    }
  };

  // Render Sidebar content
  const renderSidebarContent = (onItemClick?: () => void) => {
    return (
      <div className="flex flex-col justify-between h-full">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-3 px-1 justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl border border-secondary-200/60 shadow-md flex-shrink-0 flex items-center justify-center p-0.5 overflow-hidden">
                <img 
                  src="https://lh3.googleusercontent.com/d/1SJiIy3yPrhrfTZUgAAQ_35qJXkV5T_5W" 
                  alt="StartBill Logo" 
                  className="w-full h-full object-contain scale-[1.35]"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-[31px] font-black tracking-tight select-none leading-none">
                <span className="text-secondary-900">Start</span>
                <span className="text-primary-600">Bill</span>
              </span>
            </div>
            {onItemClick && (
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden p-1.5 text-secondary-500 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {[
              { id: 'dashboard' as ScreenId, label: 'Dashboard', icon: Home, isPublic: false },
              { id: 'invoices' as ScreenId, label: 'Factures', icon: FileText, isPublic: false },
              { id: 'clients' as ScreenId, label: 'Clients', icon: UserPlus, isPublic: false },
              { id: 'products' as ScreenId, label: 'Produits & Services', icon: Package, isPublic: false },
              { id: 'expenses' as ScreenId, label: 'Dépenses', icon: CreditCard, isPublic: false },
              { id: 'reports' as ScreenId, label: 'Rapports', icon: BarChart3, isPublic: false },
              { id: 'ai_advisor' as ScreenId, label: 'Conseiller AI', icon: Sparkles, isPublic: false },
              { id: 'pricing' as ScreenId, label: 'Tarifs & Plans', icon: Zap, isPublic: true },
              { id: 'settings' as ScreenId, label: 'Paramètres', icon: Settings, isPublic: false },
              { id: 'financial_health' as ScreenId, label: '2. Analyse détaillée', icon: TrendingUp, isPublic: false },
              { id: 'financial_alerts' as ScreenId, label: '3. Alertes financières', icon: AlertTriangle, isPublic: false, badge: '5' },
              { id: 'financial_trends' as ScreenId, label: '4. Tendances', icon: BarChart3, isPublic: false },
              { id: 'financial_forecasts' as ScreenId, label: '5. Prévisions', icon: Compass, isPublic: false },
              { id: 'financial_history' as ScreenId, label: '6. Historique', icon: Clock, isPublic: false },
              { id: 'notifications' as ScreenId, label: 'Notifications', icon: Bell, isPublic: false, badge: unreadAlertsCount > 0 ? String(unreadAlertsCount) : undefined },
              { id: 'tax_prep' as ScreenId, label: 'Impôts', icon: Percent, isPublic: false },
              // Admin dashboard is strictly restricted to Super Admin (contact.startbill@gmail.com)
              ...(isSuperAdminUser ? [
                { id: 'admin' as ScreenId, label: 'Administration (Admin)', icon: ShieldCheck, isPublic: false, badge: 'ADMIN' }
              ] : []),
              { id: 'landing' as ScreenId, label: 'Accueil / Landing', icon: Globe, isPublic: true },
              { id: 'login' as ScreenId, label: isAuthenticated ? 'Mon Compte' : 'Connexion / Compte', icon: LogIn, isPublic: true },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = currentScreen === item.id || 
                (item.id === 'invoices' && currentScreen === 'invoice_detail') ||
                (item.id === 'expenses' && (currentScreen === 'expense_detail' || currentScreen === 'add_expense'));

              const isLocked = false;

              return (
                <button
                  key={`${item.id}-${item.label}`}
                  onClick={() => {
                    if (item.id === 'admin' && !isSuperAdminUser) {
                      triggerToast('Accès refusé : Espace strictement réservé au Super Administrateur (' + SUPER_ADMIN_EMAIL + ')');
                      return;
                    }
                    if (item.id === 'invoices') {
                      setInvoiceSearch('');
                      setInvoiceTab('Toutes');
                    } else if (item.id === 'expenses') {
                      setExpenseSearch('');
                      setExpenseTab('Toutes');
                    }
                    setScreen(item.id);
                    if (onItemClick) onItemClick();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isLocked && (
                      <Lock className="w-3 h-3 text-slate-400" />
                    )}
                    {item.badge && (
                      <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-secondary-100 space-y-3">
          {/* Pro Upgrade Card inside Sidebar (SaaS style) */}
          {!isPro ? (
            <div className="bg-gradient-to-br from-primary-50 to-indigo-50 border border-primary-100/70 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] font-black text-secondary-900">Passer en Pro</div>
              </div>
              <p className="text-[10px] text-secondary-500 leading-normal">
                Débloquez toutes les fonctionnalités et l'IA illimitée.
              </p>
              <button
                onClick={() => {
                  setShowProUpgradeModal(true);
                  if (onItemClick) onItemClick();
                }}
                className="w-full bg-blue-500 hover:bg-blue-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-sm transition cursor-pointer"
              >
                Devenir Pro 🚀
              </button>
            </div>
          ) : (
            <div className="bg-success-50 border border-success-100 rounded-2xl p-3 flex items-center justify-between">
              <span className="text-[10px] font-black text-success-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse"></span>
                Plan PRO Actif
              </span>
              <span className="text-[8px] bg-success-600 text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                PRO
              </span>
            </div>
          )}

          {isAuthenticated ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 space-y-2">
              <button 
                onClick={() => {
                  setScreen('settings');
                  if (onItemClick) onItemClick();
                }}
                className="w-full flex items-center justify-between gap-2 hover:bg-white p-1 rounded-xl transition text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-black text-xs border border-blue-200 group-hover:scale-105 transition overflow-hidden shrink-0">
                    {companyLogo ? (
                      <img src={companyLogo} alt="Logo" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      'F'
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-secondary-950 truncate group-hover:text-blue-600 transition">
                      {companyName || authUser?.fullName || 'Ferline'}
                    </div>
                    <div className="text-[9px] text-secondary-400 truncate font-semibold">
                      {authUser?.email || 'ferline@startbill.com'}
                    </div>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-secondary-400 shrink-0 group-hover:text-secondary-600 transition" />
              </button>

              <button
                type="button"
                onClick={async () => {
                  await signOutUser();
                  triggerToast('Vous avez été déconnecté avec succès');
                  setScreen('login');
                  if (onItemClick) onItemClick();
                }}
                className="w-full flex items-center justify-center gap-1.5 text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 py-1.5 px-2 rounded-xl transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Se déconnecter</span>
              </button>
            </div>
          ) : (
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3 text-center space-y-2">
              <div className="text-[11px] font-bold text-blue-900">
                Non connecté
              </div>
              <p className="text-[10px] text-blue-700 leading-tight">
                Connectez-vous pour débloquer votre tableau de bord et vos données.
              </p>
              <button
                type="button"
                onClick={() => {
                  setScreen('login');
                  if (onItemClick) onItemClick();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] py-2 px-3 rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Se connecter</span>
              </button>
            </div>
          )}
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-center space-y-1 text-white shadow-2xs">
            <div className="text-[10px] font-black flex items-center justify-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>MODE PRODUCTION ACTIF</span>
            </div>
            <div className="text-[9px] text-slate-400 font-medium flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-blue-400" />
              <span>Cloud Firestore Sécurisé SSL</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Check if current screen is part of the sequential 5-step onboarding and authentication flow
  const isOnboarding = [
    'landing', 
    'choose_region', 
    'login', 
    'company_setup', 
    'welcome_dashboard'
  ].includes(currentScreen);

  // Show full SaaS navigation chrome when not in onboarding
  const showSaaSChrome = !isOnboarding;

  return (
    <div className="w-full min-h-screen lg:h-screen bg-slate-50 flex flex-col lg:flex-row relative text-slate-800 font-sans overflow-hidden">
      
      {/* Desktop Sidebar (hidden during onboarding flow) */}
      {showSaaSChrome && (
        <div className="hidden lg:flex w-[260px] bg-white text-slate-900 flex-col justify-between border-r border-[#E5E7EB] p-5 flex-shrink-0 z-30 h-screen sticky top-0 overflow-y-auto">
          {renderSidebarContent()}
        </div>
      )}

      {/* Slide-over Mobile/Tablet Drawer Backdrop */}
      {showSaaSChrome && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Slide-over Drawer Sidebar */}
      {showSaaSChrome && (
        <div className={`fixed inset-y-0 left-0 w-[280px] bg-white text-slate-900 flex flex-col justify-between border-r border-[#E5E7EB] p-5 z-50 h-screen transform transition-transform duration-300 lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {renderSidebarContent(() => setIsMobileMenuOpen(false))}
        </div>
      )}

      {/* Mobile & Tablet Top Header (hidden during onboarding flow) */}
      {showSaaSChrome && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between z-30 sticky top-0 no-print">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 -ml-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition flex items-center justify-center"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 shadow-md flex-shrink-0 flex items-center justify-center p-0.5 overflow-hidden">
              <img 
                src="https://lh3.googleusercontent.com/d/1SJiIy3yPrhrfTZUgAAQ_35qJXkV5T_5W" 
                alt="STARTBILL Logo" 
                className="w-full h-full object-contain scale-[1.35]"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-xl font-black text-white uppercase tracking-wider">STARTBILL</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/10 text-blue-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-blue-500/20">
              {isDbConnected ? "Live" : "Offline"}
            </span>
          </div>
        </div>
      )}

      {/* Main Screen Content Container (occupies rest on desktop, full-screen on mobile) */}
      <div className={`flex-1 bg-slate-50 flex flex-col overflow-y-auto relative text-slate-800 min-h-screen ${
        showSaaSChrome ? 'lg:min-h-0 lg:h-screen lg:overflow-y-auto pb-16 md:pb-6' : 'w-full pb-0'
      }`}>
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-2 px-4 rounded-full shadow-lg z-50 flex items-center gap-2 border border-slate-700 animate-bounce">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ======================================= */}
        {/* SCREEN 1: TABLEAU DE BORD - CANADA */}
        {/* ======================================= */}
        {currentScreen === 'dashboard' && (
          <Dashboard
            dbLoading={dbLoading}
            dbError={dbError}
            currentUser={currentUser}
            fetchFirestoreData={fetchFirestoreData}
            selectedTaxPeriod={selectedTaxPeriod}
            setSelectedTaxPeriod={setSelectedTaxPeriod}
            triggerToast={triggerToast}
            setIsEditingInvoice={setIsEditingInvoice}
            setInvClientName={setInvClientName}
            setInvDate={setInvDate}
            setInvSubtotal={setInvSubtotal}
            setInvStatus={setInvStatus}
            setShowNewInvoiceModal={setShowNewInvoiceModal}
            setShowNewClientModal={setShowNewClientModal}
            setScreen={setScreen}
            dbClients={clients && clients.length > 0 ? clients : dbClients}
            totalRevenue={totalRevenue}
            paidInvoicesCount={paidInvoicesCount}
            totalTax={totalTax}
            estimatedTax={estimatedTax}
            overdueInvoicesCount={overdueInvoicesCount}
            totalEligibleExpenses={totalEligibleExpenses}
            dbInvoices={activeInvoicesList}
            dbExpenses={activeExpensesList}
            setSelectedInvoiceId={setSelectedInvoiceId}
            setIsPro={setIsPro}
            isPro={isPro}
          />
        )}

        {/* ======================================= */}
        {/* SCREEN 2: FACTURES */}
        {/* ======================================= */}
        {currentScreen === 'invoices' && (
          <InvoicesPage
            invoices={activeInvoicesList}
            clients={clients && clients.length > 0 ? clients : dbClients}
            products={products}
            onAddProduct={handleAddProduct}
            dbLoading={dbLoading}
            dbError={dbError}
            fetchFirestoreData={() => currentUser?.uid && fetchFirestoreData(currentUser.uid)}
            onAddInvoice={(inv) => {
              onAddInvoice(inv);
              setDbInvoices(prev => [inv, ...prev]);
            }}
            onUpdateInvoice={(inv) => {
              onUpdateInvoice(inv);
              setDbInvoices(prev => prev.map(i => i.id === inv.id ? inv : i));
            }}
            onUpdateInvoiceStatus={(id, status) => {
              onUpdateInvoiceStatus(id, status);
              setDbInvoices(prev => prev.map(inv => {
                if (inv.id === id) {
                  let updatedRemaining = inv.remainingBalance;
                  let updatedAmountPaid = inv.amountPaid;
                  if (status === 'Payée' || status === 'paid') {
                    updatedRemaining = 0;
                    updatedAmountPaid = inv.total;
                  } else if (status === 'Envoyée' || status === 'Brouillon') {
                    updatedRemaining = inv.total;
                    updatedAmountPaid = 0;
                  } else if (status === 'Partiellement payée' || status === 'partial') {
                    updatedAmountPaid = (inv.amountPaid !== undefined && inv.amountPaid > 0) ? inv.amountPaid : parseFloat((inv.total / 2).toFixed(2));
                    updatedRemaining = parseFloat(Math.max(0, inv.total - updatedAmountPaid).toFixed(2));
                  }
                  return { 
                    ...inv, 
                    status, 
                    amountPaid: updatedAmountPaid, 
                    remainingBalance: updatedRemaining,
                    paymentStatus: (status === 'Payée' || status === 'paid') ? 'paid' : (status === 'Partiellement payée' || status === 'partial') ? 'partial' : undefined
                  };
                }
                return inv;
              }));
            }}
            onDeleteInvoice={(id) => {
              onDeleteInvoice(id);
              setDbInvoices(prev => prev.filter(inv => inv.id !== id));
            }}
            triggerToast={triggerToast}
            setScreen={setScreen}
            selectedInvoiceId={selectedInvoiceId}
            setSelectedInvoiceId={setSelectedInvoiceId}
            currentScreen={currentScreen}
          />
        )}

        {/* ======================================= */}
        {/* SCREEN 3: DÉTAIL FACTURE */}
        {/* ======================================= */}
        {currentScreen === 'invoice_detail' && !selectedInvoice && (
          <div className="w-full max-w-4xl mx-auto px-4 py-12 text-center">
            <p className="text-slate-500 font-medium mb-4">Aucune facture sélectionnée ou disponible.</p>
            <button onClick={() => setScreen('invoices')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
              Retour aux factures
            </button>
          </div>
        )}
        {currentScreen === 'invoice_detail' && selectedInvoice && (
          <div className="w-full max-w-4xl mx-auto px-4 py-4 md:px-6 md:py-6 pb-32 space-y-6">
            {/* Header with Back button and Status Label */}
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 no-print">
              <button 
                onClick={() => setScreen('invoices')} 
                className="text-slate-500 hover:text-slate-900 flex items-center gap-1.5 text-xs font-bold transition"
              >
                <ChevronLeft className="w-4 h-4" /> Retour aux factures
              </button>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">État :</span>
                <span className={`text-[10px] uppercase tracking-wide px-2.5 py-0.5 rounded-full font-extrabold ${getStatusBadgeClass(selectedInvoice.status)}`}>
                  {selectedInvoice.status}
                </span>
              </div>
            </div>

            {/* PROFESSIONAL A4-STYLED INVOICE DOCUMENT */}
            <div 
              id="printable-invoice-content"
              className="bg-white border border-slate-200 shadow-lg rounded-[16px] p-6 md:p-8 text-left text-slate-800 flex flex-col font-sans space-y-6 relative overflow-hidden"
            >
              {/* Decorative side color accent */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${selectedInvoice.status === 'Payée' ? 'bg-emerald-500' : 'bg-[#1F6FEB]'}`}></div>

              {/* Header section (Company & Invoice title) */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-100 pb-5">
                <div className="space-y-2">
                  {/* Company Logo from dynamic state */}
                  <div className="h-12 w-32 flex items-center justify-start overflow-hidden mb-1">
                    {companyLogo ? (
                      <img 
                        src={companyLogo} 
                        alt={companyName} 
                        className="max-h-full max-w-full object-contain" 
                        onError={(e) => { 
                          // fallback
                          (e.target as HTMLImageElement).src = "https://lh3.googleusercontent.com/d/1SJiIy3yPrhrfTZUgAAQ_35qJXkV5T_5W"; 
                        }} 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-sm font-black text-blue-600 tracking-tight flex items-center gap-1">
                        <FileText className="w-5 h-5 text-blue-600" /> {companyName}
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-sm font-black text-slate-900">{companyName}</h1>
                    <p className="text-[10px] text-slate-500">{companyAddress}</p>
                    <p className="text-[10px] text-slate-500">Tél : {companyPhone}</p>
                    <p className="text-[10px] text-slate-400 font-medium">NE Canada : {companyNE}</p>
                  </div>
                </div>

                <div className="sm:text-right space-y-1">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">FACTURE</h2>
                  <p className="text-xs font-bold text-slate-700">{selectedInvoice.id}</p>
                  <div className="text-[10px] text-slate-500 pt-1 space-y-0.5">
                    <p><span className="font-semibold text-slate-400">Date d'émission :</span> {selectedInvoice.date}</p>
                    <p><span className="font-semibold text-slate-400">Date d'échéance :</span> {selectedInvoice.dueDate || selectedInvoice.date}</p>
                    <p><span className="font-semibold text-slate-400">Province fiscale :</span> {selectedInvoice.province || 'Québec'}</p>
                  </div>
                </div>
              </div>

              {/* Bill To / Client Section */}
              {(() => {
                const activeClients = clients && clients.length > 0 ? clients : dbClients;
                const clientObj = activeClients.find(c => c.name === selectedInvoice.clientName);

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 border border-slate-100/80 rounded-xl p-4">
                    <div>
                      <h3 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Facturé à :</h3>
                      <p className="text-xs font-black text-slate-900">{selectedInvoice.clientName}</p>
                      <p className="text-[10px] text-slate-600 leading-relaxed mt-0.5">
                        {clientObj?.address || "Adresse non configurée"}
                      </p>
                      <p className="text-[10px] text-slate-600">
                        {clientObj?.province || selectedInvoice.province || "Québec"}
                      </p>
                    </div>
                    <div className="md:text-right flex flex-col justify-end text-[10px] text-slate-500 space-y-0.5">
                      {clientObj?.email && (
                        <p><span className="font-semibold text-slate-400">Courriel :</span> {clientObj.email}</p>
                      )}
                      {clientObj?.phone && (
                        <p><span className="font-semibold text-slate-400">Téléphone :</span> {clientObj.phone}</p>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Description summary block */}
              {selectedInvoice.description && (
                <div className="text-[10px] text-slate-600 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 text-left">
                  <p className="font-bold text-slate-400 text-[8px] uppercase tracking-wider mb-0.5">Notes de prestation / Description</p>
                  <p className="leading-relaxed font-medium">{selectedInvoice.description}</p>
                </div>
              )}

              {/* Articles Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Description de l'article / service</th>
                      <th className="py-2.5 px-3 text-center">Quantité</th>
                      <th className="py-2.5 px-3 text-right">Prix unitaire</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                      selectedInvoice.items.map((it, idx) => (
                        <tr key={idx} className="border-b border-slate-100 last:border-0 text-slate-700">
                          <td className="py-2 px-3 font-semibold text-slate-900">{it.description || "Prestation de services"}</td>
                          <td className="py-2 px-3 text-center font-medium">{it.quantity}</td>
                          <td className="py-2 px-3 text-right font-medium">{it.unitPrice.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $</td>
                          <td className="py-2 px-3 text-right font-black text-slate-950">{it.total.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $</td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-b border-slate-100 last:border-0 text-slate-700">
                        <td className="py-2 px-3 font-semibold text-slate-900">Prestation de services standard</td>
                        <td className="py-2 px-3 text-center font-medium">1</td>
                        <td className="py-2 px-3 text-right font-medium">{selectedInvoice.subtotal.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $</td>
                        <td className="py-2 px-3 text-right font-black text-slate-950">{selectedInvoice.subtotal.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Taxes Breakdown and Grand Total */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-4 border-t border-slate-100">
                <div className="text-[10px] text-slate-500 space-y-1 max-w-sm">
                  <p className="font-bold text-slate-700">Conditions de paiement :</p>
                  <p>Payable sous 30 jours à réception de la facture.</p>
                  <p>Veuillez effectuer votre paiement par virement de fonds électronique Interac à <strong>contact.startbill@gmail.com</strong> en indiquant le numéro de facture <strong>{selectedInvoice.id}</strong>.</p>
                </div>

                <div className="w-full sm:w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Sous-total HT</span>
                    <span>{selectedInvoice.subtotal.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $</span>
                  </div>

                  {(() => {
                    const provinceName = selectedInvoice.province || 'Québec';
                    const activeProvince = PROVINCES_TAXES.find(p => p.name === provinceName) || PROVINCES_TAXES[0];
                    const taxRes = calculateTaxes(provinceName, selectedInvoice.subtotal);

                    return (
                      <>
                        {taxRes.gst > 0 && (
                          <div className="flex justify-between text-slate-500">
                            <span>{activeProvince.gstLabel || 'GST (5%)'}</span>
                            <span>{taxRes.gst.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $</span>
                          </div>
                        )}
                        {taxRes.pst > 0 && (
                          <div className="flex justify-between text-slate-500">
                            <span>{activeProvince.pstLabel || 'PST'}</span>
                            <span>{taxRes.pst.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $</span>
                          </div>
                        )}
                        {taxRes.qst > 0 && (
                          <div className="flex justify-between text-slate-500">
                            <span>{activeProvince.pstLabel || 'QST (9.975%)'}</span>
                            <span>{taxRes.qst.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $</span>
                          </div>
                        )}
                        {taxRes.hst > 0 && (
                          <div className="flex justify-between text-slate-500">
                            <span>{activeProvince.pstLabel || 'HST'}</span>
                            <span>{taxRes.hst.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $</span>
                          </div>
                        )}

                        {/* HIGHLIGHTED GRAND TOTAL CONTAINER ("MONTANT AVEC TAXE") */}
                        <div className={`mt-3 border-2 rounded-xl p-4 text-center shadow-xs transition-colors ${
                          selectedInvoice.status === 'Payée' || selectedInvoice.status === 'paid'
                            ? 'bg-emerald-50/70 border-emerald-500' 
                            : selectedInvoice.status === 'Partiellement payée' || selectedInvoice.status === 'partial'
                              ? 'bg-amber-50/70 border-amber-500'
                              : 'bg-blue-50/70 border-blue-600'
                        }`}>
                          <span className={`text-[9px] font-extrabold uppercase tracking-widest block mb-1 ${
                            selectedInvoice.status === 'Payée' || selectedInvoice.status === 'paid'
                              ? 'text-emerald-700' 
                              : selectedInvoice.status === 'Partiellement payée' || selectedInvoice.status === 'partial'
                                ? 'text-amber-700'
                                : 'text-blue-700'
                          }`}>
                            {selectedInvoice.status === 'Payée' || selectedInvoice.status === 'paid' 
                              ? 'Paiement effectué' 
                              : selectedInvoice.status === 'Partiellement payée' || selectedInvoice.status === 'partial'
                                ? 'Paiement partiel'
                                : 'Solde à payer'}
                          </span>
                          <div className={`text-sm font-black ${
                            selectedInvoice.status === 'Payée' || selectedInvoice.status === 'paid'
                              ? 'text-emerald-800' 
                              : selectedInvoice.status === 'Partiellement payée' || selectedInvoice.status === 'partial'
                                ? 'text-amber-800'
                                : 'text-blue-800'
                          }`}>
                            {(selectedInvoice.status === 'Partiellement payée' || selectedInvoice.status === 'partial') ? (
                              <div className="text-left text-[11px] space-y-1 font-bold">
                                <div className="flex justify-between">
                                  <span>Montant total :</span>
                                  <span>{taxRes.total.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $</span>
                                </div>
                                <div className="flex justify-between text-emerald-700">
                                  <span>Montant payé :</span>
                                  <span>{(selectedInvoice.amountPaid || 0).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $</span>
                                </div>
                                <div className="flex justify-between border-t border-amber-300 pt-1 text-red-700 font-extrabold text-[12px]">
                                  <span>Reste à payer :</span>
                                  <span>{(selectedInvoice.remainingBalance || 0).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $</span>
                                </div>
                              </div>
                            ) : (
                              <div className="text-base font-black">
                                {selectedInvoice.status === 'Payée' || selectedInvoice.status === 'paid' ? 'Montant payé : ' : 'Montant à payer : '}
                                {taxRes.total.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $ {selectedInvoice.currency || 'CAD'}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Signature section */}
              <div className="flex justify-between items-end pt-6 border-t border-slate-100">
                <div className="text-[9px] text-slate-400">
                  <p>Facture générée numériquement par l'application StartBill Canada.</p>
                  <p className="mt-0.5">Merci de votre confiance et de votre fidélité commerciale !</p>
                </div>

                <div className="text-right w-40 flex flex-col items-end">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pour l'entreprise :</span>
                  
                  {/* Real signature or handwritten fallback */}
                  <div className="h-12 w-28 flex items-center justify-center overflow-hidden mb-1 relative border border-slate-100 bg-slate-50/50 rounded-lg p-1">
                    {companySignature ? (
                      <img 
                        src={companySignature} 
                        alt="Signature" 
                        className="max-h-full max-w-full object-contain" 
                        onError={(e) => { 
                          // fallback
                          (e.target as HTMLImageElement).src = "https://lh3.googleusercontent.com/d/1B0q88Z-b6RCHH_h_V6f578H8i2VfEw9u"; 
                        }} 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="font-cursive text-slate-700 italic font-bold text-sm tracking-wide">{companyOwner}</span>
                    )}
                  </div>
                  <div className="w-28 border-t border-slate-300"></div>
                  <p className="text-[10px] text-slate-600 font-bold mt-1 text-center w-28">{companyOwner}</p>
                </div>
              </div>
            </div>

            {/* ACTION ROW BUTTONS (PDF, EMAIL, WHATSAPP, EDIT, DUPLICATE, DELETE) */}
            <div className="space-y-3 no-print">
              <div className={`grid ${isMobileFirst || hasChannel('whatsapp') ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
                {/* 1. Télécharger PDF (html2canvas + jspdf) */}
                <button
                  onClick={() => handleDownloadPdf(selectedInvoice.id)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>

                {/* 2. Envoyer par Courriel (Pre-filled client email) */}
                <button
                  onClick={() => {
                    const activeClients = clients && clients.length > 0 ? clients : dbClients;
                    const clientObj = activeClients.find(c => c.name === selectedInvoice.clientName);
                    setEmailRecipient(clientObj?.email || '');
                    setShowEmailModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5" /> Courriel
                </button>

                {/* 3. Envoyer par WhatsApp (si Mobile-First / Afrique / Haïti) */}
                {(isMobileFirst || hasChannel('whatsapp')) && (
                  <button
                    onClick={() => {
                      const text = encodeURIComponent(`Bonjour, voici votre facture ${selectedInvoice.id} de ${selectedInvoice.subtotal} ${regionalSettings.currencySymbol}. Merci pour votre confiance !`);
                      window.open(`https://wa.me/?text=${text}`, '_blank');
                      triggerToast("Ouverture de WhatsApp...");
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* 3. Modifier la facture (opens creation form with preset variables) */}
                <button
                  onClick={() => {
                    setFormStep(1);
                    setIsEditingInvoice(true);
                    setEditingInvoiceId(selectedInvoice.id);
                    setInvClientName(selectedInvoice.clientName);
                    setInvDate(selectedInvoice.date);
                    setInvSubtotal(selectedInvoice.subtotal.toString());
                    setInvStatus(selectedInvoice.status);
                    setInvProvince(selectedInvoice.province || 'Québec');
                    setInvDueDate(selectedInvoice.dueDate || selectedInvoice.date);
                    setInvCurrency(selectedInvoice.currency || 'CAD');
                    setInvDescription(selectedInvoice.description || '');
                    setInvItems(selectedInvoice.items || [
                      { description: 'Prestation de services', quantity: 1, unitPrice: selectedInvoice.subtotal, total: selectedInvoice.subtotal }
                    ]);
                    setShowNewInvoiceModal(true);
                    triggerToast(`Modification de la facture ${selectedInvoice.id} ouverte !`);
                  }}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-1.5 transition"
                >
                  <Pencil className="w-3 h-3 text-slate-500" /> Modifier
                </button>

                {/* 4. Dupliquer la facture */}
                <button
                  onClick={() => handleDuplicateInvoice(selectedInvoice)}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-1.5 transition"
                >
                  <Copy className="w-3 h-3 text-slate-500" /> Dupliquer
                </button>

                {/* 5. Supprimer la facture */}
                <button
                  onClick={() => setShowDeleteInvoiceConfirm(true)}
                  className="bg-rose-50 hover:bg-rose-100 border border-rose-150 text-rose-700 text-xs py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-1.5 transition"
                >
                  <Trash2 className="w-3 h-3 text-rose-500" /> Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* SCREEN 4: AJOUTER DÉPENSE */}
        {/* ======================================= */}
        {currentScreen === 'add_expense' && (
          <form onSubmit={handleCreateExpenseSubmit} className="flex-1 flex flex-col overflow-y-auto px-4 py-3 pb-20">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditingExpense(false);
                  setEditingExpenseId(null);
                  setScreen('expenses');
                }}
                className="text-slate-500 hover:text-slate-900 flex items-center gap-1 text-xs"
              >
                <ChevronLeft className="w-4 h-4" /> Dépenses
              </button>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                {isEditingExpense ? 'Modifier la dépense' : 'Ajouter une dépense'}
              </h2>
              <div className="w-6"></div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3.5 mb-4">
              {/* Category selector */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Catégorie</label>
                <select
                  id="select-expense-category"
                  value={newExpenseCategory}
                  onChange={(e) => setNewExpenseCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="Transport">Transport</option>
                  <option value="Téléphone / Internet">Téléphone / Internet</option>
                  <option value="Publicité">Publicité</option>
                  <option value="Fournitures de bureau">Fournitures de bureau</option>
                  <option value="Logiciels">Logiciels</option>
                  <option value="Repas d'affaires">Repas d'affaires</option>
                  <option value="Assurance">Assurance</option>
                  <option value="Autres">Autres</option>
                </select>
              </div>

              {/* Provider field */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Fournisseur</label>
                <input
                  id="input-expense-provider"
                  type="text"
                  required
                  placeholder="Ex: Station-service Total"
                  value={newExpenseProvider}
                  onChange={(e) => setNewExpenseProvider(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {/* Date field */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Date</label>
                <input
                  id="input-expense-date"
                  type="date"
                  required
                  value={newExpenseDate}
                  onChange={(e) => setNewExpenseDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {/* Amounts section (HT and TPS) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Montant (HT)</label>
                  <div className="relative">
                    <input
                      id="input-expense-amount-ht"
                      type="number"
                      step="0.01"
                      required
                      value={newExpenseAmountHt}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewExpenseAmountHt(val);
                        // Auto estimate TPS (5%)
                        const num = parseFloat(val) || 0;
                        setNewExpenseTps((num * 0.05).toFixed(2));
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-2.5 pr-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white text-right"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">$</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">TPS/TVH</label>
                  <div className="relative">
                    <input
                      id="input-expense-tps"
                      type="number"
                      step="0.01"
                      required
                      value={newExpenseTps}
                      onChange={(e) => setNewExpenseTps(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-2.5 pr-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white text-right"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">$</span>
                  </div>
                </div>
              </div>

              {/* Total calculated display */}
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500">Total calculé</span>
                <span className="font-bold text-slate-900">
                  $ {((parseFloat(newExpenseAmountHt) || 0) + (parseFloat(newExpenseTps) || 0)).toFixed(2)} CAD
                </span>
              </div>

              {/* Payment method */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Méthode de paiement</label>
                <select
                  value={newExpensePayment}
                  onChange={(e) => setNewExpensePayment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="Carte bancaire">Carte bancaire</option>
                  <option value="Comptant">Comptant</option>
                  <option value="Virement">Virement</option>
                  <option value="Prélèvement automatique">Prélèvement automatique</option>
                </select>
              </div>

              {/* Receipt File upload */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Reçu (photo)</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 bg-white hover:bg-slate-50 border border-dashed border-slate-300 hover:border-blue-500 rounded-lg px-3 py-2.5 text-center cursor-pointer flex flex-col items-center justify-center gap-1 transition">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] font-medium text-slate-600">
                      {receiptImg ? "Reçu téléversé ✓" : "Ajouter photo / glisser"}
                    </span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                  {receiptImg && (
                    <div className="relative w-12 h-12 rounded-lg border border-slate-200 overflow-hidden shadow-sm flex-shrink-0">
                      <img src={receiptImg} alt="Receipt preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setReceiptImg(null)}
                        className="absolute top-0 right-0 bg-slate-900/60 hover:bg-slate-900 text-white rounded-bl-lg p-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Notes (optionnel)</label>
                <textarea
                  placeholder="Ex: Essence pour déplacement client"
                  value={newExpenseNotes}
                  onChange={(e) => setNewExpenseNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md text-center transition w-full"
            >
              {isEditingExpense ? 'Enregistrer les modifications' : 'Enregistrer'}
            </button>
          </form>
        )}

        {/* ======================================= */}
        {/* SCREEN 5: DÉPENSES */}
        {/* ======================================= */}
        {currentScreen === 'expenses' && (
          <ExpensesPage
            expenses={activeExpensesList}
            dbLoading={dbLoading}
            dbError={dbError}
            fetchFirestoreData={() => currentUser?.uid && fetchFirestoreData(currentUser.uid)}
            onAddExpense={(exp) => {
              onAddExpense(exp);
              setDbExpenses(prev => [exp, ...prev]);
            }}
            onUpdateExpense={(exp) => {
              onUpdateExpense(exp);
              setDbExpenses(prev => prev.map(e => e.id === exp.id ? exp : e));
            }}
            onDeleteExpense={(id) => {
              onDeleteExpense(id);
              setDbExpenses(prev => prev.filter(exp => exp.id !== id));
            }}
            triggerToast={triggerToast}
            setScreen={setScreen}
          />
        )}

        {/* ======================================= */}
        {/* SCREEN: 2. ANALYSE DÉTAILLÉE */}
        {/* ======================================= */}
        {currentScreen === 'financial_health' && (
          <DetailedAnalysisPage
            triggerToast={triggerToast}
            setScreen={setScreen}
          />
        )}

        {/* ======================================= */}
        {/* SCREEN: CONSEILLER AI (ASSISTANT INTELLIGENT) */}
        {/* ======================================= */}
        {currentScreen === 'ai_advisor' && (
          <AiAdvisorPage
            setScreen={setScreen}
            triggerToast={triggerToast}
          />
        )}

        {/* ======================================= */}
        {/* SCREEN: 3. ALERTES FINANCIÈRES */}
        {/* ======================================= */}
        {currentScreen === 'financial_alerts' && (
          <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50/50 p-3 sm:p-6 min-h-screen">
            <FinancialAlertsPage
              setScreen={setScreen}
              triggerToast={triggerToast}
            />
          </div>
        )}

        {/* ======================================= */}
        {/* SCREEN: 4. TENDANCES */}
        {/* ======================================= */}
        {currentScreen === 'financial_trends' && (
          <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50/50 p-3 sm:p-6 min-h-screen">
            <FinancialTrendsPage
              setScreen={setScreen}
              triggerToast={triggerToast}
            />
          </div>
        )}

        {/* ======================================= */}
        {/* SCREEN: 5. PRÉVISIONS */}
        {/* ======================================= */}
        {currentScreen === 'financial_forecasts' && (
          <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50/50 p-3 sm:p-6 min-h-screen">
            <FinancialForecastsPage
              setScreen={setScreen}
              triggerToast={triggerToast}
            />
          </div>
        )}

        {/* ======================================= */}
        {/* SCREEN: 6. HISTORIQUE DES ÉVALUATIONS */}
        {/* ======================================= */}
        {currentScreen === 'financial_history' && (
          <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50/50 p-3 sm:p-6 min-h-screen">
            <FinancialHistoryPage
              setScreen={setScreen}
              triggerToast={triggerToast}
            />
          </div>
        )}

        {/* ======================================= */}
        {/* SCREEN 7: DÉTAIL DÉPENSE */}
        {/* ======================================= */}
        {currentScreen === 'expense_detail' && !selectedExpense && (
          <div className="flex-1 flex flex-col px-4 py-12 text-center">
            <p className="text-slate-500 font-medium mb-4">Aucune dépense sélectionnée ou disponible.</p>
            <button onClick={() => setScreen('expenses')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold self-center">
              Retour aux dépenses
            </button>
          </div>
        )}
        {currentScreen === 'expense_detail' && selectedExpense && (
          <div className="flex-1 flex flex-col overflow-y-auto px-4 py-3 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setScreen('expenses')} className="text-slate-500 hover:text-slate-900 flex items-center gap-1 text-xs">
                <ChevronLeft className="w-4 h-4" /> Dépenses
              </button>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Détail de la dépense</h2>
              <div className="w-6"></div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm mb-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-600">
                  {selectedExpense.category.slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedExpense.category}</h3>
                  <div className="text-[10px] text-slate-400">{selectedExpense.date}</div>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Fournisseur</span>
                  <span className="font-bold text-slate-950">{selectedExpense.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Montant (HT)</span>
                  <span className="font-semibold text-slate-950">$ {selectedExpense.amountHt.toLocaleString('fr-CA', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">TPS / TVH</span>
                  <span className="font-medium text-slate-700">$ {selectedExpense.tps.toLocaleString('fr-CA', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-sm text-slate-900">
                  <span>Total</span>
                  <span>$ {selectedExpense.total.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} CAD</span>
                </div>
                <div className="flex justify-between border-t border-slate-50 pt-2">
                  <span className="text-slate-500">Méthode de paiement</span>
                  <span className="font-medium text-slate-800">{selectedExpense.paymentMethod}</span>
                </div>
              </div>
            </div>

            {/* Receipt Preview */}
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm mb-4">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Justificatif numérisé</h4>
              {selectedExpense.receiptUrl || receiptImg ? (
                <div className="border border-slate-100 rounded-lg overflow-hidden max-h-36 flex items-center justify-center bg-slate-50 relative group">
                  <img src={selectedExpense.receiptUrl || receiptImg || undefined} alt="Receipt image" className="object-contain max-h-36 w-full" />
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-lg py-4 text-center bg-slate-50 text-[11px] text-slate-400">
                  Aucune photo associée à cette dépense.
                </div>
              )}
            </div>

            {/* Optional Notes */}
            {selectedExpense.notes && (
              <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm mb-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Notes</h4>
                <p className="text-xs text-slate-700 italic">"{selectedExpense.notes}"</p>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditingExpense(true);
                  setEditingExpenseId(selectedExpense.id);
                  setNewExpenseCategory(selectedExpense.category);
                  setNewExpenseProvider(selectedExpense.provider);
                  setNewExpenseDate(selectedExpense.date);
                  setNewExpenseAmountHt(selectedExpense.amountHt.toString());
                  setNewExpenseTps(selectedExpense.tps.toString());
                  setNewExpensePayment(selectedExpense.paymentMethod);
                  setNewExpenseNotes(selectedExpense.notes || '');
                  setReceiptImg(selectedExpense.receiptUrl || null);
                  setScreen('add_expense');
                  triggerToast('Modification de la dépense activée !');
                }}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs py-2 px-3 rounded-lg font-medium text-center transition"
              >
                Modifier
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteExpense(selectedExpense.id);
                  setDbExpenses(prev => prev.filter(exp => exp.id !== selectedExpense.id));
                  triggerToast(`Dépense supprimée !`);
                  setScreen('expenses');
                }}
                className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs py-2 px-3 rounded-lg font-medium text-center transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* SCREEN 8: RÉSUMÉ MENSUEL */}
        {/* ======================================= */}
        {currentScreen === 'monthly_summary' && (
          <div className="flex-1 flex flex-col overflow-y-auto px-4 py-3 pb-20">
            <h1 className="text-[18px] font-bold text-slate-900 mb-2">Résumé mensuel</h1>

            <div className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-xs font-medium text-slate-700 shadow-sm mb-4">
              <span>Mai 2026</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            {/* Summary Numbers */}
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Revenus encaissés</span>
                <span className="font-bold text-slate-950">$ {revenuesEncaissees.toLocaleString('fr-CA', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Dépenses admissibles</span>
                <span className="font-bold text-slate-950">$ {depensesAdmissibles.toLocaleString('fr-CA', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs border-t border-slate-100 pt-2.5 font-bold text-slate-900">
                <span>Bénéfice net</span>
                <span>$ {beneficeNet.toLocaleString('fr-CA', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-700">
                <span>Marge bénéficiaire</span>
                <span className="font-bold">{((beneficeNet / revenuesEncaissees) * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* Repartition des dépenses (Pie / Donut) */}
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm mb-4">
              <h3 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">Répartition des dépenses</h3>
              
              {/* Custom SVG Donut Chart */}
              <div className="relative w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Transport: 22% */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#2563eb" strokeWidth="3.2" strokeDasharray="22 78" strokeDashoffset="0" />
                  {/* Publicité: 18% */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#eab308" strokeWidth="3.2" strokeDasharray="18 82" strokeDashoffset="-22" />
                  {/* Logiciels: 14% */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#a855f7" strokeWidth="3.2" strokeDasharray="14 86" strokeDashoffset="-40" />
                  {/* Fournitures: 12% */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#06b6d4" strokeWidth="3.2" strokeDasharray="12 88" strokeDashoffset="-54" />
                  {/* Téléphone / Internet: 10% */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ec4899" strokeWidth="3.2" strokeDasharray="10 90" strokeDashoffset="-66" />
                  {/* Autres: 24% */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#64748b" strokeWidth="3.2" strokeDasharray="24 76" strokeDashoffset="-76" />
                </svg>
                <div className="absolute text-center">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Total</span>
                  <span className="text-xs font-black text-slate-900">$ {depensesAdmissibles.toLocaleString('fr-CA', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>

              {/* Legends */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0"></span>
                  <span className="text-slate-600 truncate">Transport (22%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 flex-shrink-0"></span>
                  <span className="text-slate-600 truncate">Publicité (18%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 flex-shrink-0"></span>
                  <span className="text-slate-600 truncate">Logiciels (14%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 flex-shrink-0"></span>
                  <span className="text-slate-600 truncate">Fournitures (12%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500 flex-shrink-0"></span>
                  <span className="text-slate-600 truncate">Téléphone (10%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500 flex-shrink-0"></span>
                  <span className="text-slate-600 truncate">Autres (24%)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setScreen('expenses')}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold py-2 px-4 rounded-xl shadow-sm text-center transition w-full"
            >
              Voir toutes les dépenses
            </button>
          </div>
        )}

        {/* ======================================= */}
        {/* SCREEN 9: PRÉPARATION IMPÔTS */}
        {/* ======================================= */}
        {currentScreen === 'tax_prep' && (() => {
          // Dynamic calculation based on selectedTaxPeriod
          let taxRev = 145230.00;
          let taxExp = 62450.00;
          let taxNet = 82780.00;
          let taxRemit = taxesToRemit;

          // Compute dynamic modifications by user from live state to show feedback when adding things
          const addedInvoicesSum = invoices.reduce((s, inv) => {
            const isNew = !['FACT-2026-045', 'FACT-2026-044', 'FACT-2026-043', 'FACT-2026-042', 'FACT-2026-041', 'FACT-2026-040'].includes(inv.id);
            return isNew && inv.status === 'Payée' ? s + inv.total : s;
          }, 0);

          const addedExpensesSum = expenses.reduce((s, exp) => {
            const isNew = !['EXP-001', 'EXP-002', 'EXP-003', 'EXP-004', 'EXP-005', 'EXP-006', 'EXP-007'].includes(exp.id);
            return isNew ? s + exp.total : s;
          }, 0);

          if (selectedTaxPeriod === 'Année 2026') {
            taxRev = 145230.00 + addedInvoicesSum;
            taxExp = 62450.00 + addedExpensesSum;
            taxNet = taxRev - taxExp;
            taxRemit = Math.max(0, 3120.00 + (addedInvoicesSum * 0.14975) - (addedExpensesSum * 0.05));
          } else if (selectedTaxPeriod === 'Trimestre 2 2026') {
            taxRev = 41530.00 + addedInvoicesSum;
            taxExp = 16282.00 + addedExpensesSum;
            taxNet = taxRev - taxExp;
            taxRemit = Math.max(0, 3960.00 + (addedInvoicesSum * 0.14975) - (addedExpensesSum * 0.05));
          } else if (selectedTaxPeriod === 'Trimestre 1 2026') {
            taxRev = 53400.00;
            taxExp = 21500.00;
            taxNet = taxRev - taxExp;
            taxRemit = 4920.00;
          } else if (selectedTaxPeriod === 'Mai 2026') {
            const maiPaidInvoicesSum = invoices
              .filter(inv => inv.status === 'Payée' && inv.date.includes('-05-'))
              .reduce((sum, inv) => sum + inv.total, 0);
            const maiExpensesSum = expenses
              .filter(exp => exp.date.includes('-05-'))
              .reduce((sum, exp) => sum + exp.total, 0);

            taxRev = Math.max(0, 23030.00 + (maiPaidInvoicesSum - 2400.00));
            taxExp = Math.max(0, 9082.00 + (maiExpensesSum - 768.00));
            taxNet = taxRev - taxExp;

            const maiInvoiceTaxes = invoices
              .filter(inv => inv.date.includes('-05-') && inv.status === 'Payée')
              .reduce((sum, inv) => sum + inv.tps + inv.tvq, 0);
            const maiExpenseTaxes = expenses
              .filter(exp => exp.date.includes('-05-'))
              .reduce((sum, exp) => sum + exp.tps, 0);

            taxRemit = Math.max(0, 2210.00 + (maiInvoiceTaxes - 149.75) - (maiExpenseTaxes - 37.00));
          } else if (selectedTaxPeriod === 'Avril 2026') {
            const avrPaidInvoicesSum = invoices
              .filter(inv => inv.status === 'Payée' && inv.date.includes('-04-'))
              .reduce((sum, inv) => sum + inv.total, 0);
            const avrExpensesSum = expenses
              .filter(exp => exp.date.includes('-04-'))
              .reduce((sum, exp) => sum + exp.total, 0);

            taxRev = Math.max(0, 18500.00 + avrPaidInvoicesSum);
            taxExp = Math.max(0, 7200.00 + avrExpensesSum);
            taxNet = taxRev - taxExp;

            const avrInvoiceTaxes = invoices
              .filter(inv => inv.date.includes('-04-') && inv.status === 'Payée')
              .reduce((sum, inv) => sum + inv.tps + inv.tvq, 0);
            const avrExpenseTaxes = expenses
              .filter(exp => exp.date.includes('-04-'))
              .reduce((sum, exp) => sum + exp.tps, 0);

            taxRemit = Math.max(0, 1750.00 + avrInvoiceTaxes - avrExpenseTaxes);
          } else if (selectedTaxPeriod === 'Mars 2026') {
            taxRev = 19800.00;
            taxExp = 8100.00;
            taxNet = taxRev - taxExp;
            taxRemit = 1820.00;
          } else if (selectedTaxPeriod === 'Février 2026') {
            taxRev = 17400.00;
            taxExp = 6900.00;
            taxNet = taxRev - taxExp;
            taxRemit = 1610.00;
          } else if (selectedTaxPeriod === 'Janvier 2026') {
            taxRev = 16200.00;
            taxExp = 6500.00;
            taxNet = taxRev - taxExp;
            taxRemit = 1490.00;
          } else if (selectedTaxPeriod === 'Année 2025') {
            taxRev = 128450.00;
            taxExp = 52120.00;
            taxNet = taxRev - taxExp;
            taxRemit = 11840.00;
          } else if (selectedTaxPeriod === 'Année 2024') {
            taxRev = 112600.00;
            taxExp = 44800.00;
            taxNet = taxRev - taxExp;
            taxRemit = 10390.00;
          }

          const taxEstimated = Math.max(0, taxNet * 0.20);
          const taxSavingsRecommended = taxRemit + taxEstimated;

          const isAnnual = selectedTaxPeriod.includes('Année');
          const isQuarterly = selectedTaxPeriod.includes('Trimestre');

          return (
            <div className="flex-1 flex flex-col overflow-y-auto px-4 py-3 pb-20">
              <h1 className="text-[18px] font-bold text-slate-900 mb-2">Préparation impôts</h1>

              {/* Dynamic Interactive Period Selector Dropdown */}
              <div className="relative bg-white border border-slate-200/80 rounded-xl px-3 py-2 flex items-center justify-between text-xs font-semibold text-slate-700 shadow-xs mb-4 cursor-pointer hover:border-slate-300 transition">
                <select
                  id="select-tax-period-filter"
                  value={selectedTaxPeriod}
                  onChange={(e) => {
                    setSelectedTaxPeriod(e.target.value);
                    triggerToast(`Période fiscale : ${e.target.value}`);
                  }}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                >
                  <option value="Année 2026">Année 2026 (En cours)</option>
                  <option value="Trimestre 2 2026">Trimestre 2 2026</option>
                  <option value="Trimestre 1 2026">Trimestre 1 2026</option>
                  <option value="Mai 2026">Mai 2026</option>
                  <option value="Avril 2026">Avril 2026</option>
                  <option value="Mars 2026">Mars 2026</option>
                  <option value="Février 2026">Février 2026</option>
                  <option value="Janvier 2026">Janvier 2026</option>
                  <option value="Année 2025">Année 2025 (Déclarée)</option>
                  <option value="Année 2024">Année 2024 (Déclarée)</option>
                </select>
                <span className="truncate text-blue-700 font-semibold flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  {selectedTaxPeriod} {selectedTaxPeriod === 'Année 2026' ? '(En cours)' : (['Année 2025', 'Année 2024'].includes(selectedTaxPeriod) ? '(Déclarée)' : '')}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </div>

              {/* Period figures summary card */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm mb-4 space-y-3.5 text-xs">
                {/* Revenue row */}
                <div className="flex justify-between items-center py-2.5 px-3.5 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-100/80 transition">
                  <span className="text-slate-600 font-semibold">{isAnnual ? 'Revenus annuels' : isQuarterly ? 'Revenus trimestriels' : 'Revenus mensuels'}</span>
                  <span className="font-extrabold text-slate-900 text-xs">$ {taxRev.toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                {/* Expense row */}
                <div className="flex justify-between items-center py-2.5 px-3.5 rounded-xl bg-slate-50/40 hover:bg-slate-100/50 border border-slate-100/60 transition">
                  <span className="text-slate-600 font-semibold">Dépenses admissibles</span>
                  <span className="font-extrabold text-slate-900 text-xs">$ {taxExp.toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                {/* Net Profit row - Highlighted with emphasis */}
                <div className="flex justify-between items-center py-3.5 px-4 rounded-xl bg-slate-950 text-white font-bold shadow-md border border-slate-800 transition">
                  <span className="text-slate-300 font-bold text-xs flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Bénéfice net
                  </span>
                  <span className="text-base font-black text-emerald-400 tracking-tight">$ {taxNet.toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                {/* Estimated tax band - Soigné avec coins arrondis et padding généreux */}
                <div className="flex justify-between items-center bg-gradient-to-r from-amber-50 via-amber-50/90 to-amber-100/60 border border-amber-200/90 text-amber-950 p-4 rounded-2xl shadow-xs mt-2">
                  <span className="font-bold text-xs flex items-center gap-2 text-amber-900">
                    <Percent className="w-4 h-4 text-amber-600" />
                    Impôt estimé (20%)
                  </span>
                  <span className="font-black text-base text-amber-950">$ {taxEstimated.toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Recommendation card */}
              <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/15 border border-emerald-500/20 rounded-2xl p-5 shadow-sm text-center mb-4 relative overflow-hidden backdrop-blur-xs">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <PiggyBank className="w-4.5 h-4.5 text-emerald-700" />
                  <span className="text-[11px] font-black text-emerald-900 uppercase tracking-wider">
                    Montant recommandé à mettre de côté
                  </span>
                </div>
                <div className="text-2xl md:text-3xl font-black text-emerald-950 tracking-tight">$ {taxSavingsRecommended.toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>

              {/* Taxes nettes à remettre */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs mb-4 text-xs">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">Taxes nettes à remettre</span>
                      <span className="text-[10px] font-medium text-slate-400">TPS / TVH / TVQ</span>
                    </div>
                  </div>
                  <span className="text-base font-black text-slate-900">$ {taxRemit.toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2.5 mb-4">
                <button
                  type="button"
                  onClick={() => triggerToast(`Dossier fiscal pour ${selectedTaxPeriod} partagé avec votre comptable par courriel !`)}
                  className="w-full h-10 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition duration-150 shadow-xs shadow-blue-500/10 cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Envoyer à mon comptable</span>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => triggerDownloadCSV(`Startbill_impots_resume_${selectedTaxPeriod.replace(/ /g, '_')}.csv`, `Metric,Amount\nRevenus,${taxRev.toFixed(2)}\nDepenses admissibles,${taxExp.toFixed(2)}\nBenefice net,${taxNet.toFixed(2)}\nImpot estime,${taxEstimated.toFixed(2)}\nTaxes a remettre,${taxRemit.toFixed(2)}`)}
                    className="w-full h-10 bg-white hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition duration-150 shadow-2xs cursor-pointer truncate px-2"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span className="truncate">Exporter résumé ({selectedTaxPeriod})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerDownloadCSV(`Startbill_transactions_${selectedTaxPeriod.replace(/ /g, '_')}.csv`, `Date,Type,Description,Amount\n2026-05-12,Revenue,FACT-2026-045,1150.00`)}
                    className="w-full h-10 bg-white hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition duration-150 shadow-2xs cursor-pointer truncate px-2"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">Exporter comptable</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ======================================= */}
        {/* SCREEN 10: CLIENTS */}
        {/* ======================================= */}
        {currentScreen === 'clients' && (
          <ClientsPage
            clients={clients && clients.length > 0 ? clients : dbClients}
            invoices={invoices}
            dbLoading={dbLoading}
            dbError={dbError}
            fetchFirestoreData={() => currentUser?.uid && fetchFirestoreData(currentUser.uid)}
            onAddClient={onAddClient}
            onUpdateClient={onUpdateClient}
            onDeleteClient={onDeleteClient}
            triggerToast={triggerToast}
            setScreen={setScreen}
            setSelectedInvoiceId={setSelectedInvoiceId}
          />
        )}

        {/* ======================================= */}
        {/* SCREEN 10B: PRODUITS ET SERVICES (MODULE 4) */}
        {/* ======================================= */}
        {currentScreen === 'products' && (
          <ProductsPage
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onSelectProductForInvoice={(prod) => {
              setInvItems([{
                description: prod.name + (prod.description ? ` - ${prod.description}` : ''),
                quantity: 1,
                unitPrice: prod.unitPrice,
                total: prod.unitPrice
              }]);
              setIsEditingInvoice(false);
              setScreen('invoices');
              triggerToast(`Produit "${prod.name}" sélectionné pour la facture.`);
            }}
            triggerToast={triggerToast}
            setScreen={setScreen}
          />
        )}

        {/* ======================================= */}
        {/* SCREEN 11: RAPPORTS */}
        {/* ======================================= */}
        {currentScreen === 'reports' && (
          <div className="flex-1 flex flex-col overflow-y-auto px-4 py-3 pb-20">
            <h1 className="text-[18px] font-bold text-slate-900 mb-2">Rapports</h1>

            {/* Report Sub Tabs */}
            <div className="bg-slate-100 p-1 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-1 mb-4">
              {(['Aperçu', 'Comparaison', 'Catégories', 'Analyse détaillée'] as const).map((tab) => {
                const isActive = reportTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setReportTab(tab)}
                    className={`text-xs font-semibold py-1.5 px-2 rounded-lg transition-all duration-200 text-center cursor-pointer truncate ${
                      isActive
                        ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60 font-bold'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {reportTab === 'Analyse détaillée' && (
              <div className="-mx-4 -my-2 pb-6">
                <DetailedAnalysisPage
                  triggerToast={triggerToast}
                  setScreen={setScreen}
                />
              </div>
            )}

            {reportTab !== 'Analyse détaillée' && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200/80 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Mai 2026</span>
                  </div>
                </div>

            {/* Bar Chart Graphic - Aperçu */}
            {reportTab === 'Aperçu' && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Évolution (Revenus vs Dépenses)
                  </h3>
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">5 derniers mois</span>
                </div>
                
                {/* Chart container with proper heights */}
                <div className="h-44 flex items-end justify-between gap-2 pb-3 border-b border-slate-100 pt-2 px-1 relative">
                  {[
                    { month: 'Jan', rev: 40, exp: 20, ben: 20, revVal: '$40k', expVal: '$20k', benVal: '$20k' },
                    { month: 'Fév', rev: 55, exp: 25, ben: 30, revVal: '$55k', expVal: '$25k', benVal: '$30k' },
                    { month: 'Mar', rev: 68, exp: 32, ben: 36, revVal: '$68k', expVal: '$32k', benVal: '$36k' },
                    { month: 'Avr', rev: 72, exp: 38, ben: 34, revVal: '$72k', expVal: '$38k', benVal: '$34k' },
                    { month: 'Mai', rev: 82, exp: 32, ben: 50, revVal: '$82k', expVal: '$32k', benVal: '$50k' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative cursor-pointer">
                      {/* Hover Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute -top-11 z-20 pointer-events-none bg-slate-900 text-white text-[9px] font-medium py-1 px-2 rounded-lg shadow-md whitespace-nowrap flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">Rev: {item.revVal}</span>
                        <span className="text-rose-400 font-bold">Dép: {item.expVal}</span>
                        <span className="text-blue-400 font-bold">Bén: {item.benVal}</span>
                      </div>

                      {/* Bar group container */}
                      <div className="w-full flex justify-center items-end gap-1 h-full max-h-[120px] bg-slate-50/50 rounded-t-lg p-0.5">
                        {/* Revenue column */}
                        <div 
                          className="w-2.5 sm:w-3 bg-emerald-500 hover:bg-emerald-600 rounded-t-sm transition-all duration-300" 
                          style={{ height: `${item.rev}%` }}
                        ></div>
                        {/* Expense column */}
                        <div 
                          className="w-2.5 sm:w-3 bg-rose-500 hover:bg-rose-600 rounded-t-sm transition-all duration-300" 
                          style={{ height: `${item.exp}%` }}
                        ></div>
                        {/* Profit column */}
                        <div 
                          className="w-2.5 sm:w-3 bg-blue-500 hover:bg-blue-600 rounded-t-sm transition-all duration-300" 
                          style={{ height: `${item.ben}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold group-hover:text-blue-600 transition">{item.month}</span>
                    </div>
                  ))}
                </div>

                {/* Chart Legend */}
                <div className="flex justify-center items-center gap-5 text-[10px] font-bold mt-3 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs shadow-2xs"></span>
                    <span>Revenus</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-rose-500 rounded-xs shadow-2xs"></span>
                    <span>Dépenses</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-xs shadow-2xs"></span>
                    <span>Bénéfice</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tabular breakdown - Comparaison */}
            {reportTab === 'Comparaison' && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs mb-4 space-y-3.5 text-xs">
                <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Comparaison mensuelle (Mai vs Avril)</h3>
                
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                    <span className="text-slate-600 font-medium">Revenus</span>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">$ {revenuesEncaissees.toLocaleString('fr-CA', { minimumFractionDigits: 2 })}</div>
                      <span className="text-[9px] text-emerald-600 font-bold">↗ 24.5% vs avr.</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                    <span className="text-slate-600 font-medium">Dépenses</span>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">$ {depensesAdmissibles.toLocaleString('fr-CA', { minimumFractionDigits: 2 })}</div>
                      <span className="text-[9px] text-rose-600 font-bold">↗ 26.1% vs avr.</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Bénéfice Net</span>
                    <div className="text-right">
                      <div className="font-bold text-slate-950">$ {beneficeNet.toLocaleString('fr-CA', { minimumFractionDigits: 2 })}</div>
                      <span className="text-[9px] text-emerald-600 font-bold">↗ 23.4% vs avr.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Categories breakdown - Catégories */}
            {reportTab === 'Catégories' && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs mb-4 space-y-3.5">
                <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Répartition des dépenses par catégorie</h3>
                
                <div className="space-y-3">
                  {(() => {
                    const breakdown: Record<string, number> = {};
                    expenses.forEach(e => {
                      breakdown[e.category] = (breakdown[e.category] || 0) + e.total;
                    });
                    const totalExp = Object.values(breakdown).reduce((s, v) => s + v, 0) || 1;
                    
                    return Object.entries(breakdown)
                      .sort((a, b) => b[1] - a[1])
                      .map(([cat, amount]) => {
                        const pct = Math.round((amount / totalExp) * 100);
                        return (
                          <div key={cat} className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="font-semibold text-slate-800">{cat}</span>
                              <span className="text-slate-500 font-medium">{amount.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $ ({pct}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      });
                  })()}
                </div>
              </div>
            )}

            {/* Key Metrics Grid */}
            <div className="mb-4">
              <h3 className="text-[11px] font-extrabold text-slate-400 mb-3 uppercase tracking-wider">Indicateurs clés</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. Revenus moyens */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revenus moyens / mois</span>
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-sm font-black text-slate-900">$ 23 450.00</div>
                </div>

                {/* 2. Dépenses moyennes */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dépenses moyennes / mois</span>
                    <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-sm font-black text-slate-900">$ 8 650.00</div>
                </div>

                {/* 3. Marge bénéficiaire moyenne - Highlighted with Accent */}
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border border-emerald-600/30 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider">Marge bénéficiaire</span>
                    <div className="w-6 h-6 rounded-lg bg-white/20 text-white flex items-center justify-center">
                      <Percent className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-lg font-black text-white tracking-tight">63.1 %</div>
                  <span className="text-[9px] text-emerald-100/90 font-medium mt-0.5">Excellente viabilité</span>
                </div>

                {/* 4. Factures impayées */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Factures impayées</span>
                    <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-sm font-black text-slate-900">$ 2 450.00</div>
                  <span className="text-[9px] text-amber-600 font-semibold mt-0.5">À relancer</span>
                </div>
              </div>
            </div>
              </>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* SCREEN 12: PARAMÈTRES */}
        {/* ======================================= */}
        {currentScreen === 'settings' && (
          <div className="flex-1 flex flex-col px-6 py-6 pb-20 space-y-6 max-w-4xl mx-auto w-full overflow-y-auto">
            <div className="border-b border-slate-100 pb-4">
              <h1 className="text-[22px] font-black tracking-tight text-slate-900">Paramètres de l'application</h1>
              <p className="text-xs text-slate-500 font-medium">Configurez vos préférences de facturation et d'entreprise.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Box 1: Profile */}
              <div className="bg-white border border-slate-200 rounded-[18px] p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Profil de l'entreprise</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nom commercial</label>
                    <input 
                      type="text" 
                      value={companyName} 
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Propriétaire / Représentant</label>
                    <input 
                      type="text" 
                      value={companyOwner} 
                      onChange={(e) => setCompanyOwner(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Numéro d'entreprise (NE)</label>
                    <input 
                      type="text" 
                      value={companyNE} 
                      onChange={(e) => setCompanyNE(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Adresse de l'entreprise</label>
                    <input 
                      type="text" 
                      value={companyAddress} 
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      placeholder="Ex: 1000 Rue de la Gauchetière, Montréal, QC"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Téléphone de l'entreprise</label>
                    <input 
                      type="text" 
                      value={companyPhone} 
                      onChange={(e) => setCompanyPhone(e.target.value)}
                      placeholder="Ex: +1 (514) 555-0199"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white" 
                    />
                  </div>
                  
                  {/* Logo Config */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Logo de l'entreprise (URL ou Firebase Storage)</label>
                    <div className="flex gap-2 items-center">
                      <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden p-1 flex-shrink-0">
                        {companyLogo ? (
                          <img src={companyLogo} alt="Logo" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).src = "https://lh3.googleusercontent.com/d/1SJiIy3yPrhrfTZUgAAQ_35qJXkV5T_5W"; }} referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-[8px] text-slate-400">Aucun</span>
                        )}
                      </div>
                      <input 
                        type="text" 
                        value={companyLogo} 
                        onChange={(e) => setCompanyLogo(e.target.value)}
                        placeholder="URL de l'image du logo"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] text-slate-800 focus:outline-none focus:border-blue-500" 
                      />
                    </div>
                    {/* File selector for local upload (converts to base64) */}
                    <div className="mt-1">
                      <label className="text-[9px] text-blue-600 hover:underline cursor-pointer font-semibold block">
                        Téléverser un logo depuis votre appareil
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setCompanyLogo(reader.result as string);
                                triggerToast("Logo téléversé et mis à jour !");
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Signature Config */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Signature de l'entreprise (URL ou Firebase Storage)</label>
                    <div className="flex gap-2 items-center">
                      <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden p-1 flex-shrink-0">
                        {companySignature ? (
                          <img src={companySignature} alt="Signature" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).src = "https://lh3.googleusercontent.com/d/1B0q88Z-b6RCHH_h_V6f578H8i2VfEw9u"; }} referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-[8px] text-slate-400">Aucun</span>
                        )}
                      </div>
                      <input 
                        type="text" 
                        value={companySignature} 
                        onChange={(e) => setCompanySignature(e.target.value)}
                        placeholder="URL de l'image de signature"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] text-slate-800 focus:outline-none focus:border-blue-500" 
                      />
                    </div>
                    {/* File selector for local signature upload */}
                    <div className="mt-1">
                      <label className="text-[9px] text-blue-600 hover:underline cursor-pointer font-semibold block">
                        Téléverser une signature numérisée
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setCompanySignature(reader.result as string);
                                triggerToast("Signature téléversée et mise à jour !");
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2: Taxes rates */}
              <div className="bg-white border border-slate-200 rounded-[18px] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Taxes & Renseignements fiscaux</h3>
                  <button
                    type="button"
                    onClick={() => setScreen('choose_region')}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline"
                  >
                    Changer de région ({REGIONS[currentRegion].flag})
                  </button>
                </div>
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{REGIONS[currentRegion].flag}</span>
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">{REGIONS[currentRegion].name}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">Devise : {REGIONS[currentRegion].currency} ({REGIONS[currentRegion].currencySymbol})</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setScreen('choose_region')}
                    className="bg-white border border-blue-200 hover:border-blue-400 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-2xs transition"
                  >
                    Modifier
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Taux TPS (Fédéral)</label>
                      <input type="text" disabled defaultValue="5.0 %" className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 font-bold" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Taux TVQ (Québec)</label>
                      <input type="text" disabled defaultValue="9.975 %" className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 font-bold" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Numéro TPS</label>
                    <input type="text" defaultValue="123456789 RT0001" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Numéro TVQ</label>
                    <input type="text" defaultValue="1234567890 TQ0001" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800" />
                  </div>
                </div>
              </div>

              {/* Box 3: Subscription plan */}
              <div className="bg-white border border-slate-200 rounded-[18px] p-5 shadow-sm md:col-span-2 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1">Votre Plan d'abonnement</h3>
                  <p className="text-sm font-bold text-slate-900">
                    {isPro ? "Plan StartBill PRO - Accès complet" : "Plan StartBill Gratuit - Fonctionnalités de base"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isPro ? "Prochain prélèvement : 19,00 $ CAD le 20 août 2026" : "Passez à la version supérieure pour l'automatisation fiscale."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setScreen('pricing')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-3 rounded-xl transition cursor-pointer"
                  >
                    Voir tous les forfaits
                  </button>
                  {!isPro ? (
                    <button
                      type="button"
                      onClick={() => setScreen('pricing')}
                      className="bg-[#1F6FEB] hover:bg-[#1a5fcd] text-white text-xs font-bold py-2 px-4 rounded-xl shadow-md transition cursor-pointer"
                    >
                      Devenir PRO 🚀
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsPro(false);
                        triggerToast('Abonnement Pro suspendu. Retour au plan Gratuit.');
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer"
                    >
                      Résilier
                    </button>
                  )}
                </div>
              </div>

              {/* Box 4: Reset Data / Réinitialisation */}
              <div className="bg-white border border-rose-200/90 rounded-[18px] p-5 shadow-sm md:col-span-2 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Réinitialisation des données
                  </h3>
                  <p className="text-sm font-bold text-slate-900">
                    Réinitialiser l'application aux données d'origine
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Restaure toutes les factures, dépenses et clients de la base de données aux valeurs initiales de démonstration.
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setShowResetAllDataConfirm(true)}
                    disabled={isLoading}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold py-2.5 px-4 rounded-xl shadow-md transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    Réinitialiser les données
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* SCREEN 12: NOTIFICATIONS */}
        {/* ======================================= */}
        {currentScreen === 'notifications' && (
          <NotificationsPage
            setScreen={setScreen}
            setSelectedInvoiceId={setSelectedInvoiceId}
            triggerToast={triggerToast}
            currentUser={currentUser}
            totalRevenue={totalRevenue}
            totalTax={totalTax}
            dbInvoices={dbInvoices}
            isPro={isPro}
          />
        )}

        {/* ======================================= */}
        {/* SCREEN 13: CONNEXION / AUTHENTIFICATION */}
        {/* ======================================= */}
        {currentScreen === 'login' && (
          <LoginPage
            setScreen={setScreen}
            triggerToast={triggerToast}
            currentUser={currentUser}
          />
        )}

        {/* ======================================= */}
        {/* SCREEN 14: CHOIX DE LA RÉGION (ONBOARDING) */}
        {/* ======================================= */}
        {currentScreen === 'choose_region' && (
          <ChooseRegionPage
            currentRegionId={currentRegion}
            onSelectRegion={(regId) => {
              setCurrentRegion(regId);
            }}
            onContinue={() => {
              triggerToast(`Région sélectionnée : ${REGIONS[currentRegion].name}`);
              setScreen('login');
            }}
            setScreen={setScreen}
            triggerToast={triggerToast}
          />
        )}

        {/* ======================================= */}
        {/* SCREEN: LANDING PAGE (ACCUEIL) */}
        {/* ======================================= */}
        {currentScreen === 'landing' && (
          <LandingPage
            setScreen={setScreen}
            onSelectRegion={(regId) => {
              setCurrentRegion(regId);
            }}
            currentRegionId={currentRegion}
            triggerToast={triggerToast}
          />
        )}

        {/* ======================================= */}
        {/* SCREEN: CONFIGURATION RAPIDE DE L'ENTREPRISE */}
        {/* ======================================= */}
        {currentScreen === 'company_setup' && (
          <CompanySetupPage
            setScreen={setScreen}
            triggerToast={triggerToast}
          />
        )}

        {/* ======================================= */}
        {/* SCREEN: DASHBOARD DE BIENVENUE */}
        {/* ======================================= */}
        {currentScreen === 'welcome_dashboard' && (
          <WelcomeDashboardPage
            setScreen={setScreen}
            invoices={activeInvoicesList}
            expenses={activeExpensesList}
            clients={clients}
            triggerToast={triggerToast}
          />
        )}

        {/* ======================================= */}
        {/* SCREEN 15: PAGE TARIFS (PRICING) */}
        {/* ======================================= */}
        {currentScreen === 'pricing' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24">
            <PricingPage
              setScreen={setScreen}
              currentPlan={isPro ? 'pro' : 'free'}
              onSelectPlan={(planId) => {
                if (planId === 'pro' || planId === 'start') {
                  setIsPro(true);
                } else {
                  setIsPro(false);
                }
              }}
            />
          </div>
        )}

        {/* ======================================= */}
        {/* SCREEN 16: ADMIN DASHBOARD */}
        {/* ======================================= */}
        {currentScreen === 'admin' && (
          <div className="flex-1 overflow-y-auto bg-slate-50">
            {isSuperAdminUser ? (
              <AdminDashboard
                setScreen={setScreen}
                triggerToast={triggerToast}
                invoices={activeInvoicesList}
              />
            ) : (
              <div className="w-full min-h-[550px] flex items-center justify-center p-6 bg-slate-50">
                <div className="max-w-md w-full bg-white border border-rose-200 rounded-3xl p-8 shadow-xl shadow-rose-500/5 text-center space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto shadow-inner">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider">
                      Accès strictement restreint
                    </div>
                    <h2 className="text-xl font-black text-slate-900">
                      Espace Administrateur Protégé
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      L'accès à la console d'administration est strictement réservé au Super Administrateur (<strong className="text-slate-800">{SUPER_ADMIN_EMAIL}</strong>), quelle que soit votre région (Canada, Afrique, Haïti).
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-slate-600 font-medium">
                      <span>Compte actuel :</span>
                      <span className="font-mono text-slate-900 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                        {currentActiveEmail || 'Non connecté'}
                      </span>
                    </div>
                    <div className="text-[11px] text-rose-600 font-semibold pt-1 border-t border-slate-200/60 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                      <span>Accès refusé. Privilèges administrateur requis.</span>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      type="button"
                      onClick={() => setScreen('dashboard')}
                      className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                    >
                      Retourner au Dashboard
                    </button>
                    <button
                      type="button"
                      onClick={() => setScreen('login')}
                      className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      Se connecter avec le compte administrateur
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


        {/* ======================================= */}
        {/* BOTTOM NAVIGATION BAR (Shown in full SaaS production mode) */}
        {/* ======================================= */}
        {showSaaSChrome && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 h-[56px] bg-white border-t border-slate-200 px-2 flex items-center justify-between z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
            <button
              onClick={() => {
                setScreen('dashboard');
                setShowPlusMenu(false);
              }}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[9px] font-medium transition ${
                currentScreen === 'dashboard' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Accueil</span>
            </button>

            <button
              onClick={() => {
                setInvoiceSearch('');
                setInvoiceTab('Toutes');
                setScreen('invoices');
                setShowPlusMenu(false);
              }}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[9px] font-medium transition ${
                currentScreen === 'invoices' || currentScreen === 'invoice_detail' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Factures</span>
            </button>

            <button
              onClick={() => {
                setExpenseSearch('');
                setExpenseTab('Toutes');
                setScreen('expenses');
                setShowPlusMenu(false);
              }}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[9px] font-medium transition ${
                currentScreen === 'expenses' || currentScreen === 'expense_detail' || currentScreen === 'add_expense' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Dépenses</span>
            </button>

            <button
              onClick={() => {
                setScreen('reports');
                setShowPlusMenu(false);
              }}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[9px] font-medium transition ${
                currentScreen === 'reports' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Rapports</span>
            </button>

            {/* Plus popover menu button or directly toggles side drawer */}
            <div className="flex-1 relative group">
              <button
                onClick={() => setShowPlusMenu(!showPlusMenu)}
                className={`w-full flex flex-col items-center justify-center gap-0.5 text-[9px] font-medium transition ${
                  ['financial_health', 'financial_alerts', 'financial_trends', 'financial_forecasts', 'financial_history', 'monthly_summary', 'tax_prep', 'clients'].includes(currentScreen)
                    ? 'text-blue-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <MoreHorizontal className="w-4 h-4" />
                <span>Plus</span>
              </button>

              {/* Hover/Tap Popup Menu inside Simulator */}
              <div className={`absolute bottom-[52px] right-0 bg-white border border-slate-100 rounded-xl shadow-xl p-2.5 w-36 space-y-1 z-50 transition ${
                showPlusMenu ? 'block' : 'hidden group-hover:block hover:block'
              }`}>
                <button
                  onClick={() => {
                    setScreen('financial_health');
                    setShowPlusMenu(false);
                  }}
                  className="w-full text-left text-[11px] font-medium text-slate-700 hover:bg-slate-50 px-2 py-1.5 rounded flex items-center gap-1.5"
                >
                  <span>📈</span> 2. Analyse détaillée
                </button>
                <button
                  onClick={() => {
                    setScreen('financial_alerts');
                    setShowPlusMenu(false);
                  }}
                  className="w-full text-left text-[11px] font-medium text-slate-700 hover:bg-slate-50 px-2 py-1.5 rounded flex items-center gap-1.5"
                >
                  <span>⚠️</span> 3. Alertes financières
                </button>
                <button
                  onClick={() => {
                    setScreen('financial_trends');
                    setShowPlusMenu(false);
                  }}
                  className="w-full text-left text-[11px] font-medium text-slate-700 hover:bg-slate-50 px-2 py-1.5 rounded flex items-center gap-1.5"
                >
                  <span>📊</span> 4. Tendances
                </button>
                <button
                  onClick={() => {
                    setScreen('financial_forecasts');
                    setShowPlusMenu(false);
                  }}
                  className="w-full text-left text-[11px] font-medium text-slate-700 hover:bg-slate-50 px-2 py-1.5 rounded flex items-center gap-1.5"
                >
                  <span>🧭</span> 5. Prévisions
                </button>
                <button
                  onClick={() => {
                    setScreen('financial_history');
                    setShowPlusMenu(false);
                  }}
                  className="w-full text-left text-[11px] font-medium text-slate-700 hover:bg-slate-50 px-2 py-1.5 rounded flex items-center gap-1.5"
                >
                  <span>🕒</span> 6. Historique
                </button>
                <button
                  onClick={() => {
                    setScreen('monthly_summary');
                    setShowPlusMenu(false);
                  }}
                  className="w-full text-left text-[11px] font-medium text-slate-700 hover:bg-slate-50 px-2 py-1.5 rounded flex items-center gap-1.5"
                >
                  <span>📊</span> Résumé mensuel
                </button>
                <button
                  onClick={() => {
                    setScreen('tax_prep');
                    setShowPlusMenu(false);
                  }}
                  className="w-full text-left text-[11px] font-medium text-slate-700 hover:bg-slate-50 px-2 py-1.5 rounded flex items-center gap-1.5"
                >
                  <span>🍁</span> Impôts Canada
                </button>
                <button
                  onClick={() => {
                    setScreen('clients');
                    setShowPlusMenu(false);
                  }}
                  className="w-full text-left text-[11px] font-medium text-slate-700 hover:bg-slate-50 px-2 py-1.5 rounded flex items-center gap-1.5"
                >
                  <span>👥</span> Clients
                </button>
                <button
                  onClick={() => {
                    setScreen('products');
                    setShowPlusMenu(false);
                  }}
                  className="w-full text-left text-[11px] font-medium text-slate-700 hover:bg-slate-50 px-2 py-1.5 rounded flex items-center gap-1.5"
                >
                  <span>📦</span> Produits & Services
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ======================================= */}
      {/* MODAL: ADD CLIENT */}
      {/* ======================================= */}
      {showNewClientModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreateClientSubmit} className="bg-white rounded-2xl p-6 w-full max-w-[400px] shadow-2xl border border-slate-100">
            <h3 className="text-sm font-black text-slate-900 mb-3">Ajouter un Client</h3>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nom du client</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Client G"
                  value={clientNameInput}
                  onChange={(e) => setClientNameInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowNewClientModal(false)}
                className="text-[10px] text-slate-500 font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="text-[10px] text-white bg-blue-600 font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-700"
              >
                Ajouter
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================= */}
      {/* MODAL: NEW & EDIT INVOICE */}
      {/* ======================================= */}
      {showNewInvoiceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[18px] p-6 w-full max-w-[480px] shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">
                {isEditingInvoice ? 'Modifier la Facture' : 'Nouvelle Facture'}
              </h3>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${formStep === 1 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                  Étape 1 sur 2
                </span>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${formStep === 2 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                  Étape 2 sur 2
                </span>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <div className="overflow-y-auto py-4 flex-1 space-y-4 text-left pr-1" style={{ scrollbarWidth: 'thin' }}>
              {formStep === 1 ? (
                <>
                  {/* Step 1: Informations Générales */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Client</label>
                    <select
                      value={invClientName}
                      onChange={(e) => {
                        if (e.target.value === '_new_client') {
                          setShowNewClientModal(true);
                        } else {
                          setInvClientName(e.target.value);
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                    >
                      {clients.map(cli => (
                        <option key={cli.id} value={cli.name}>{cli.name}</option>
                      ))}
                      <option value="_new_client" className="text-blue-600 font-extrabold">+ Nouveau client</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Province du client / Lieu de vente</label>
                    <select
                      value={invProvince}
                      onChange={(e) => setInvProvince(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition font-medium"
                    >
                      {PROVINCES_TAXES.map(p => {
                        const taxLabelParts = [];
                        if (p.gstLabel) taxLabelParts.push(p.gstLabel);
                        if (p.pstLabel) taxLabelParts.push(p.pstLabel);
                        const taxDesc = taxLabelParts.join(' + ');
                        return (
                          <option key={p.name} value={p.name}>
                            {p.name} {taxDesc ? `(${taxDesc})` : ''}
                          </option>
                        );
                      })}
                    </select>
                    <p className="text-[9px] text-slate-400 mt-1 font-medium">
                      La province choisie détermine le taux de taxe appliqué.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Date d'émission</label>
                      <input
                        type="date"
                        required
                        value={invDate}
                        onChange={(e) => setInvDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Date d'échéance</label>
                      <input
                        type="date"
                        required
                        value={invDueDate}
                        onChange={(e) => setInvDueDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Devise</label>
                    <select
                      value={invCurrency}
                      onChange={(e) => setInvCurrency(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                    >
                      <option value="CAD">CAD ($)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Description</label>
                    <textarea
                      placeholder="Description de la facture..."
                      value={invDescription}
                      onChange={(e) => setInvDescription(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition resize-none"
                    />
                  </div>

                  {isEditingInvoice && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Statut</label>
                      <select
                        value={invStatus}
                        onChange={(e) => setInvStatus(e.target.value as InvoiceStatus)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                      >
                        <option value="Brouillon">Brouillon</option>
                        <option value="Envoyée">Envoyée</option>
                        <option value="Partiellement payée">Partiellement payée</option>
                        <option value="Payée">Payée</option>
                        <option value="En retard">En retard</option>
                        <option value="Annulée">Annulée</option>
                      </select>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Step 2: Lignes de Facture */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Produits et services</span>
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">Module 4</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setInvItems([...invItems, { description: '', quantity: 1, unitPrice: 0, total: 0 }])}
                        className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1.5 rounded-lg transition"
                      >
                        <Plus className="w-3 h-3" /> Ajouter une ligne
                      </button>
                    </div>

                    <div className="space-y-3">
                      {invItems.map((item, index) => (
                        <div key={index} className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 space-y-2 relative">
                          {invItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setInvItems(invItems.filter((_, i) => i !== index))}
                              className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition p-1"
                              title="Supprimer la ligne"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Module 4 Selector */}
                          <div>
                            <label className="text-[8px] font-bold text-slate-400 uppercase block mb-1">Sélectionner depuis Produits & Services</label>
                            <select
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val) {
                                  const prod = products.find(p => p.id === val);
                                  if (prod) {
                                    const q = item.quantity || 1;
                                    setInvItems(invItems.map((it, i) => i === index ? {
                                      ...it,
                                      description: prod.name + (prod.description ? ` - ${prod.description}` : ''),
                                      unitPrice: prod.unitPrice,
                                      total: parseFloat((q * prod.unitPrice).toFixed(2))
                                    } : it));
                                  }
                                }
                              }}
                              defaultValue=""
                              className="w-full bg-blue-50/50 border border-blue-200/80 rounded-lg px-2 py-1 text-xs text-blue-900 font-medium focus:outline-none focus:border-blue-500"
                            >
                              <option value="">Sélectionner un produit / service (Module 4)...</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.name} — {p.unitPrice.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $ {p.unit ? `(${p.unit})` : ''}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[8px] font-bold text-slate-400 uppercase">Description</label>
                            <input
                              type="text"
                              required
                              placeholder="Description du produit ou service"
                              value={item.description}
                              onChange={(e) => {
                                const val = e.target.value;
                                setInvItems(invItems.map((it, i) => i === index ? { ...it, description: val } : it));
                              }}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-[8px] font-bold text-slate-400 uppercase">Quantité</label>
                              <input
                                type="number"
                                min="0.01"
                                step="any"
                                required
                                value={item.quantity || ''}
                                onChange={(e) => {
                                  const q = parseFloat(e.target.value) || 0;
                                  const updated = invItems.map((it, i) => {
                                    if (i === index) {
                                      return { ...it, quantity: q, total: parseFloat((q * it.unitPrice).toFixed(2)) };
                                    }
                                    return it;
                                  });
                                  setInvItems(updated);
                                }}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 text-center"
                              />
                            </div>
                            <div>
                              <label className="text-[8px] font-bold text-slate-400 uppercase">Prix Unitaire</label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                value={item.unitPrice || ''}
                                onChange={(e) => {
                                  const p = parseFloat(e.target.value) || 0;
                                  const updated = invItems.map((it, i) => {
                                    if (i === index) {
                                      return { ...it, unitPrice: p, total: parseFloat((it.quantity * p).toFixed(2)) };
                                    }
                                    return it;
                                  });
                                  setInvItems(updated);
                                }}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 text-right"
                              />
                            </div>
                            <div>
                              <label className="text-[8px] font-bold text-slate-400 uppercase block text-right">Total</label>
                              <div className="w-full bg-slate-100/50 border border-slate-100 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 font-bold text-right mt-0.5">
                                {item.total.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary card (Calculé automatiquement) */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2 mt-4 text-xs">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Résumé de la facture</span>
                    
                    {(() => {
                      const activeProvince = PROVINCES_TAXES.find(p => p.name === invProvince) || PROVINCES_TAXES[0];
                      const sub = invItems.reduce((sum, item) => sum + item.total, 0);
                      const taxRes = calculateTaxes(invProvince, sub);
                      const tot = taxRes.total;

                      return (
                        <>
                          <div className="flex justify-between text-slate-600 font-medium">
                            <span>Sous-total HT</span>
                            <span>{sub.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $ {invCurrency}</span>
                          </div>
                          
                          {taxRes.gst > 0 && (
                            <div className="flex justify-between text-slate-500">
                              <span>{activeProvince.gstLabel || 'GST (5%)'}</span>
                              <span>{taxRes.gst.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $ {invCurrency}</span>
                            </div>
                          )}

                          {taxRes.pst > 0 && (
                            <div className="flex justify-between text-slate-500">
                              <span>{activeProvince.pstLabel || 'PST'}</span>
                              <span>{taxRes.pst.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $ {invCurrency}</span>
                            </div>
                          )}

                          {taxRes.qst > 0 && (
                            <div className="flex justify-between text-slate-500">
                              <span>{activeProvince.pstLabel || 'QST (9.975%)'}</span>
                              <span>{taxRes.qst.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $ {invCurrency}</span>
                            </div>
                          )}

                          {taxRes.hst > 0 && (
                            <div className="flex justify-between text-slate-500">
                              <span>{activeProvince.pstLabel || 'HST'}</span>
                              <span>{taxRes.hst.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $ {invCurrency}</span>
                            </div>
                          )}

                          <div className="flex justify-between pt-2 border-t border-slate-200 text-slate-900 font-medium">
                            <span>Total TTC</span>
                            <span>{tot.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $ {invCurrency}</span>
                          </div>

                          {/* Dynamic Highlight Card for Montant à payer */}
                          <div className="mt-3 bg-blue-50/80 border border-blue-100 rounded-xl p-3 text-center shadow-sm">
                            <span className="text-[9px] font-extrabold text-blue-600 uppercase tracking-wider block mb-0.5">Montant à payer</span>
                            <div className="text-base font-black text-blue-700">
                              Montant à payer : {tot.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $ {invCurrency}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              {formStep === 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewInvoiceModal(false);
                      setIsEditingInvoice(false);
                      setEditingInvoiceId(null);
                    }}
                    className="text-[10px] text-slate-500 font-medium px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Validate Step 1 description/client if any, then move to step 2
                      if (!invClientName) {
                        triggerToast('Veuillez sélectionner un client.');
                        return;
                      }
                      setFormStep(2);
                    }}
                    className="text-[10px] text-white bg-blue-600 font-bold px-5 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition flex items-center gap-1"
                  >
                    Suivant <ArrowRight className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setFormStep(1)}
                    className="text-[10px] text-slate-500 font-medium px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateInvoiceSubmit}
                    className="text-[10px] text-white bg-blue-600 font-bold px-5 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition"
                  >
                    {isEditingInvoice ? 'Enregistrer' : 'Suivant'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* MODAL: EMAIL CONFIRMATION (RECIPIENT & WARNING) */}
      {/* ======================================= */}
      {showEmailModal && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-blue-600" /> Envoyer par courriel
              </h3>
              <button 
                onClick={() => setShowEmailModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Vous êtes sur le point d'envoyer la facture <strong>{selectedInvoice.id}</strong> à votre client par courriel.
              </p>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Destinataire (adresse courriel)</label>
                <input 
                  type="email"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  placeholder="exemple@client.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 leading-normal">
                  <strong>Si l'adresse courriel est incorrecte :</strong> Vous pouvez la corriger ci-dessus temporairement, ou la mettre à jour de façon permanente dans le profil du client (sous l'onglet <strong>Clients</strong>).
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="text-xs text-slate-500 font-bold px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!emailRecipient || !emailRecipient.includes('@')) {
                    triggerToast("Veuillez saisir une adresse courriel valide.");
                    return;
                  }
                  // Mark as Envoyée
                  onUpdateInvoiceStatus(selectedInvoice.id, 'Envoyée');
                  setDbInvoices(prev => prev.map(inv => inv.id === selectedInvoice.id ? { ...inv, status: 'Envoyée' } : inv));
                  setShowEmailModal(false);
                  triggerToast(`Facture ${selectedInvoice.id} envoyée avec succès à ${emailRecipient} !`);
                }}
                className="text-xs text-white bg-blue-600 hover:bg-blue-700 font-bold px-4 py-2 rounded-xl shadow-sm transition"
              >
                Confirmer l'envoi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* MODAL: PRO UPGRADE (HIGH CONVERTING SAAS MODAL) */}
      {/* ======================================= */}
      {showProUpgradeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-[480px] shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-1.5">
              <span className="text-3xl">🚀</span>
              <h3 className="text-lg font-black text-slate-950">Devenez StartBill PRO</h3>
              <p className="text-xs text-slate-500 font-semibold">Le copilote fiscal ultime pour les entrepreneurs canadiens.</p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 flex justify-between items-center">
              <div>
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest block">Tarif unique</span>
                <span className="text-2xl font-black text-[#1F6FEB]">19,00 $ <span className="text-xs text-slate-500 font-bold">CAD/mois</span></span>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Essai de 14 jours gratuit
              </span>
            </div>

            <div className="space-y-2.5">
              {[
                '📁 Export des déclarations de fin d\'année prêtes pour l\'ARC / RQ',
                '📈 Graphiques de revenus et rapports de marge avancés',
                '👥 Clients illimités (limité à 5 sur le plan gratuit)',
                '📱 Reconnaissance automatique des taxes sur reçus photographiques',
                '💬 Support prioritaire en français et anglais',
              ].map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-bold">
                  <span className="text-[#1F6FEB] flex-shrink-0">✓</span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsPro(true);
                  setShowProUpgradeModal(false);
                  triggerToast('Félicitations ! Votre Plan PRO est maintenant activé ! 🚀');
                }}
                className="w-full bg-[#1F6FEB] hover:bg-[#1a5fcd] text-white text-xs font-extrabold py-3 rounded-xl shadow-lg shadow-[#1F6FEB]/20 transition text-center block"
              >
                Activer mon accès PRO instantané
              </button>
              
              <button
                type="button"
                onClick={() => setShowProUpgradeModal(false)}
                className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 text-center py-1 transition"
              >
                Continuer avec la version gratuite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Reset Payment */}
      <ConfirmModal
        isOpen={showResetPaymentConfirm}
        title="Réinitialiser le paiement"
        message="Voulez-vous réinitialiser tout l'historique de paiement de cette facture et remettre le solde dû à 100% ?"
        confirmLabel="Réinitialiser"
        cancelLabel="Annuler"
        variant="warning"
        onConfirm={() => {
          if (selectedInvoice) {
            const updatedInv: Invoice = {
              ...selectedInvoice,
              amountPaid: 0,
              remainingBalance: selectedInvoice.total,
              paymentStatus: undefined,
              status: 'Envoyée'
            };
            onUpdateInvoice(updatedInv);
            setDbInvoices(prev => prev.map(inv => inv.id === updatedInv.id ? updatedInv : inv));
            setPaymentOption('partial');
            setCustomAmountPaid('0');
            triggerToast("Historique de paiement réinitialisé !");
          }
          setShowResetPaymentConfirm(false);
        }}
        onCancel={() => setShowResetPaymentConfirm(false)}
      />

      {/* Confirm Delete Invoice */}
      <ConfirmModal
        isOpen={showDeleteInvoiceConfirm}
        title="Supprimer la facture"
        message={`Êtes-vous sûr de vouloir supprimer définitivement la facture ${selectedInvoice?.id} ?`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={() => {
          if (selectedInvoice) {
            onDeleteInvoice(selectedInvoice.id);
            setDbInvoices(prev => prev.filter(inv => inv.id !== selectedInvoice.id));
            triggerToast(`Facture ${selectedInvoice.id} supprimée`);
            setScreen('invoices');
          }
          setShowDeleteInvoiceConfirm(false);
        }}
        onCancel={() => setShowDeleteInvoiceConfirm(false)}
      />

      {/* Confirm Reset All Data */}
      <ConfirmModal
        isOpen={showResetAllDataConfirm}
        title="Réinitialiser toutes les données"
        message="Voulez-vous vraiment réinitialiser toutes les factures, dépenses et clients à leurs données initiales de démonstration ?"
        confirmLabel="Réinitialiser tout"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={async () => {
          if (onResetData) {
            await onResetData();
            triggerToast('Toutes les données ont été réinitialisées avec succès !');
          }
          setShowResetAllDataConfirm(false);
        }}
        onCancel={() => setShowResetAllDataConfirm(false)}
      />
    </div>
  );
}
