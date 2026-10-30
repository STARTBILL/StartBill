import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Building2, 
  Receipt, 
  CreditCard, 
  ShieldCheck, 
  FileText, 
  Wallet, 
  Percent, 
  Download, 
  Upload, 
  RefreshCw, 
  Check, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Globe, 
  Calendar, 
  DollarSign, 
  Layers, 
  Lock,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Save,
  HelpCircle,
  Copy,
  ChevronRight,
  Sparkles,
  ArrowRight,
  KeyRound,
  Users,
  UserPlus,
  UserCheck,
  Shield,
  Trash2,
  Edit2,
  X
} from 'lucide-react';
import { Invoice, Expense, Client, ProductItem, ScreenId } from '../types';
import { REGIONS } from '../data/regions';
import { useRegionalContext } from '../context/RegionalContext';
import { useAuth } from '../context/AuthContext';
import { getStripeConfig, StripeConfigResponse } from '../lib/stripeService';

export type SupportedRegion = 'canada' | 'afrique' | 'haiti';

export interface SettingsPageProps {
  companyName: string;
  setCompanyName: (val: string) => void;
  companyOwner: string;
  setCompanyOwner: (val: string) => void;
  companyNE: string;
  setCompanyNE: (val: string) => void;
  companyAddress: string;
  setCompanyAddress: (val: string) => void;
  companyPhone: string;
  setCompanyPhone: (val: string) => void;
  companyLogo: string;
  setCompanyLogo: (val: string) => void;
  companySignature: string;
  setCompanySignature: (val: string) => void;
  currentRegion: SupportedRegion;
  isPro: boolean;
  setIsPro: (val: boolean) => void;
  isLoading: boolean;
  setShowResetAllDataConfirm: (val: boolean) => void;
  triggerToast: (msg: string) => void;
  setScreen: (screen: ScreenId) => void;
  invoices?: Invoice[];
  expenses?: Expense[];
  clients?: Client[];
  products?: ProductItem[];
  onLockSession?: () => void;
  activeCompany?: any;
  onSelectCompany?: (comp: any) => void;
  companies?: any[];
}

export type SettingsTab = 'general' | 'taxes' | 'invoicing' | 'payments' | 'tax_prep' | 'permissions' | 'subscription' | 'security';

export type CompanyRole = 'SUPER_ADMIN' | 'ADMIN' | 'ACCOUNTANT' | 'COLLABORATOR' | 'READ_ONLY';

export interface CompanyTeamMember {
  id: string;
  name: string;
  email: string;
  role: CompanyRole;
  status: 'active' | 'invited' | 'pending';
  addedDate: string;
}

export type PermissionAction = 'read' | 'create' | 'update' | 'delete' | 'export' | 'approve';

export const ROLE_DETAILS: Record<CompanyRole, { label: string; desc: string; badgeColor: string; level: string }> = {
  SUPER_ADMIN: {
    label: 'Super Admin (Propriétaire)',
    desc: 'Accès sans restriction à tous les modules, configurations sensibles, suppression des données et gouvernance d\'accès.',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    level: 'Niveau 1 — Accès Intégral'
  },
  ADMIN: {
    label: 'Administrateur',
    desc: 'Gestion des opérations quotidiennes, validation de factures et dépenses, gestion des clients sans pouvoir supprimer l\'entreprise.',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    level: 'Niveau 2 — Opérationnel'
  },
  ACCOUNTANT: {
    label: 'Comptable / Expert CPA',
    desc: 'Audit et conformité fiscale (TPS/TVQ), conciliation bancaire, export des écritures et révision des bilans comptables.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    level: 'Niveau 2 — Fiscalité & Rapports'
  },
  COLLABORATOR: {
    label: 'Collaborateur / Ventes',
    desc: 'Émission de devis, facturation client, enregistrement des paiements. Pas d\'accès aux déclarations d\'impôts ni aux paramètres.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    level: 'Niveau 3 — Commercial'
  },
  READ_ONLY: {
    label: 'Auditeur / Lecture Seule',
    desc: 'Consultation stricte des pièces et rapports financiers sans aucun droit de modification, approbation ou suppression.',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    level: 'Niveau 4 — Consultation'
  }
};

export const BUSINESS_MODULES = [
  { id: 'invoices', name: 'Facturation & Devis', category: 'Commercial' },
  { id: 'expenses', name: 'Dépenses & Justificatifs', category: 'Achats' },
  { id: 'clients', name: 'Clients & Répertoire', category: 'Commercial' },
  { id: 'products', name: 'Catalogue Produits & Services', category: 'Commercial' },
  { id: 'reports', name: 'Rapports & Statistiques Financières', category: 'Finance' },
  { id: 'tax', name: 'Déclarations Fiscales (TPS / TVQ)', category: 'Fiscalité' },
  { id: 'advisor', name: 'Conseiller Financier IA', category: 'Intelligence' },
  { id: 'settings', name: 'Paramètres Entreprise & Coordonnées', category: 'Administration' }
];

export const PERMISSION_ACTIONS: Array<{ key: PermissionAction; label: string }> = [
  { key: 'read', label: 'Consulter' },
  { key: 'create', label: 'Créer' },
  { key: 'update', label: 'Modifier' },
  { key: 'approve', label: 'Approuver' },
  { key: 'export', label: 'Exporter' },
  { key: 'delete', label: 'Supprimer' }
];

export const DEFAULT_ROLE_PERMISSIONS: Record<CompanyRole, Record<string, PermissionAction[]>> = {
  SUPER_ADMIN: {
    invoices: ['read', 'create', 'update', 'delete', 'export', 'approve'],
    expenses: ['read', 'create', 'update', 'delete', 'export', 'approve'],
    clients: ['read', 'create', 'update', 'delete', 'export', 'approve'],
    products: ['read', 'create', 'update', 'delete', 'export', 'approve'],
    reports: ['read', 'create', 'update', 'delete', 'export', 'approve'],
    tax: ['read', 'create', 'update', 'delete', 'export', 'approve'],
    advisor: ['read', 'create', 'update', 'delete', 'export', 'approve'],
    settings: ['read', 'create', 'update', 'delete', 'export', 'approve'],
  },
  ADMIN: {
    invoices: ['read', 'create', 'update', 'export', 'approve'],
    expenses: ['read', 'create', 'update', 'export', 'approve'],
    clients: ['read', 'create', 'update', 'export'],
    products: ['read', 'create', 'update', 'export'],
    reports: ['read', 'export'],
    tax: ['read', 'export'],
    advisor: ['read', 'create', 'update'],
    settings: ['read', 'update'],
  },
  ACCOUNTANT: {
    invoices: ['read', 'export'],
    expenses: ['read', 'create', 'update', 'export', 'approve'],
    clients: ['read', 'export'],
    products: ['read'],
    reports: ['read', 'export'],
    tax: ['read', 'create', 'update', 'export', 'approve'],
    advisor: ['read'],
    settings: ['read'],
  },
  COLLABORATOR: {
    invoices: ['read', 'create', 'update'],
    expenses: ['read', 'create'],
    clients: ['read', 'create', 'update'],
    products: ['read', 'create'],
    reports: ['read'],
    tax: [],
    advisor: ['read'],
    settings: [],
  },
  READ_ONLY: {
    invoices: ['read'],
    expenses: ['read'],
    clients: ['read'],
    products: ['read'],
    reports: ['read'],
    tax: ['read'],
    advisor: ['read'],
    settings: ['read'],
  },
};

export const DEFAULT_TEAM_MEMBERS: CompanyTeamMember[] = [
  {
    id: 'tm-1',
    name: 'Ferline ZOGNI',
    email: 'contact.startbill@gmail.com',
    role: 'SUPER_ADMIN',
    status: 'active',
    addedDate: '2026-01-10',
  },
  {
    id: 'tm-2',
    name: 'Cabinet CPA Tremblay & Associés',
    email: 'comptable@cpa-tremblay.ca',
    role: 'ACCOUNTANT',
    status: 'active',
    addedDate: '2026-02-15',
  },
  {
    id: 'tm-3',
    name: 'Alexandre Roy (Adjoint Commercial)',
    email: 'alexandre.roy@startbill.ca',
    role: 'COLLABORATOR',
    status: 'active',
    addedDate: '2026-03-01',
  },
];

export const SettingsPage: React.FC<SettingsPageProps> = ({
  companyName,
  setCompanyName,
  companyOwner,
  setCompanyOwner,
  companyNE,
  setCompanyNE,
  companyAddress,
  setCompanyAddress,
  companyPhone,
  setCompanyPhone,
  companyLogo,
  setCompanyLogo,
  companySignature,
  setCompanySignature,
  currentRegion,
  isPro,
  setIsPro,
  isLoading,
  setShowResetAllDataConfirm,
  triggerToast,
  setScreen,
  invoices = [],
  expenses = [],
  clients = [],
  products = [],
  onLockSession,
  activeCompany,
  onSelectCompany,
  companies = []
}) => {
  const { regionalSettings } = useRegionalContext();
  const { user: authUser } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [hasSaved, setHasSaved] = useState(false);

  // Extended persistent enterprise preferences stored in localStorage
  const [companyEmail, setCompanyEmail] = useState(() => localStorage.getItem('sb_company_email') || 'contact@startbill.ca');
  const [companyWebsite, setCompanyWebsite] = useState(() => localStorage.getItem('sb_company_website') || 'https://startbill.ca');
  const [invoicePrefix, setInvoicePrefix] = useState(() => localStorage.getItem('sb_invoice_prefix') || 'FACT-2026-');
  const [quotePrefix, setQuotePrefix] = useState(() => localStorage.getItem('sb_quote_prefix') || 'DEV-2026-');
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState(() => localStorage.getItem('sb_payment_terms') || '30');
  const [lateFeePercent, setLateFeePercent] = useState(() => localStorage.getItem('sb_late_fee') || '2.0');
  const [defaultInvoiceNotes, setDefaultInvoiceNotes] = useState(() => 
    localStorage.getItem('sb_invoice_notes') || 'Merci pour votre confiance ! Paiement exigible selon les termes indiqués.'
  );

  // Interac & Banking states
  const [interacEmail, setInteracEmail] = useState(() => localStorage.getItem('sb_interac_email') || '');
  const [interacAutoDeposit, setInteracAutoDeposit] = useState(() => localStorage.getItem('sb_interac_autodeposit') !== 'false');
  const [bankInstitution, setBankInstitution] = useState(() => localStorage.getItem('sb_bank_institution') || '');
  const [bankTransit, setBankTransit] = useState(() => localStorage.getItem('sb_bank_transit') || '');
  const [bankAccount, setBankAccount] = useState(() => localStorage.getItem('sb_bank_account') || '');
  const [tpsNumber, setTpsNumber] = useState(() => localStorage.getItem('sb_tax_tps') || '');
  const [tvqNumber, setTvqNumber] = useState(() => localStorage.getItem('sb_tax_tvq') || '');
  const [isSmallSupplierExempt, setIsSmallSupplierExempt] = useState(() => localStorage.getItem('sb_tax_small_supplier') === 'true');

  // Stripe & Access Policy status
  const [stripeConfig, setStripeConfig] = useState<StripeConfigResponse | null>(null);
  const [stripeCardPaymentsEnabled, setStripeCardPaymentsEnabled] = useState(() => localStorage.getItem('sb_stripe_card_enabled') !== 'false');

  // RBAC Roles & Permissions state
  const [selectedPermRole, setSelectedPermRole] = useState<CompanyRole>('SUPER_ADMIN');
  const [rolePermissions, setRolePermissions] = useState<Record<CompanyRole, Record<string, PermissionAction[]>>>(() => {
    try {
      const saved = localStorage.getItem('sb_role_permissions');
      return saved ? JSON.parse(saved) : DEFAULT_ROLE_PERMISSIONS;
    } catch {
      return DEFAULT_ROLE_PERMISSIONS;
    }
  });

  // Team members state
  const [teamMembers, setTeamMembers] = useState<CompanyTeamMember[]>(() => {
    try {
      const saved = localStorage.getItem('sb_team_members');
      return saved ? JSON.parse(saved) : DEFAULT_TEAM_MEMBERS;
    } catch {
      return DEFAULT_TEAM_MEMBERS;
    }
  });

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<CompanyRole>('COLLABORATOR');

  // MFA & Security Policy enforcement
  const [mfaEnforced, setMfaEnforced] = useState(() => localStorage.getItem('sb_mfa_enforced') === 'true');

  const handleTogglePermission = (role: CompanyRole, moduleId: string, action: PermissionAction) => {
    // Prevent removing all access from Super Admin to avoid accidental lockout
    if (role === 'SUPER_ADMIN' && action === 'read' && moduleId === 'settings') {
      triggerToast('Le Super Admin doit conserver l\'accès aux paramètres pour la gouvernance.');
      return;
    }

    setRolePermissions(prev => {
      const roleMap = { ...(prev[role] || {}) };
      const currentActions = roleMap[moduleId] ? [...roleMap[moduleId]] : [];
      const index = currentActions.indexOf(action);
      if (index >= 0) {
        currentActions.splice(index, 1);
      } else {
        currentActions.push(action);
      }
      const updated = {
        ...prev,
        [role]: {
          ...roleMap,
          [moduleId]: currentActions
        }
      };
      localStorage.setItem('sb_role_permissions', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveRolePermissions = () => {
    try {
      localStorage.setItem('sb_role_permissions', JSON.stringify(rolePermissions));
      triggerToast('Matrice des rôles & permissions enregistrée avec succès !');
    } catch {
      triggerToast('Erreur lors de la sauvegarde des permissions');
    }
  };

  const handleResetPermissionsToDefault = () => {
    setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
    localStorage.setItem('sb_role_permissions', JSON.stringify(DEFAULT_ROLE_PERMISSIONS));
    triggerToast('Permissions rétablies aux recommandations de sécurité StartBill');
  };

  const handleAddTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      triggerToast('Veuillez renseigner le nom et le courriel du collaborateur.');
      return;
    }

    const newMember: CompanyTeamMember = {
      id: `tm-${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      status: 'invited',
      addedDate: new Date().toISOString().slice(0, 10)
    };

    const updated = [...teamMembers, newMember];
    setTeamMembers(updated);
    localStorage.setItem('sb_team_members', JSON.stringify(updated));
    setShowInviteModal(false);
    setInviteName('');
    setInviteEmail('');
    setInviteRole('COLLABORATOR');
    triggerToast(`Invitation envoyée avec succès à ${newMember.email} (${ROLE_DETAILS[newMember.role].label})`);
  };

  const handleDeleteTeamMember = (id: string) => {
    const member = teamMembers.find(m => m.id === id);
    if (member?.role === 'SUPER_ADMIN') {
      triggerToast('Impossible de supprimer le compte Super Admin / Propriétaire.');
      return;
    }
    const updated = teamMembers.filter(m => m.id !== id);
    setTeamMembers(updated);
    localStorage.setItem('sb_team_members', JSON.stringify(updated));
    triggerToast(`Accès révoqué pour ${member?.name || 'l\'utilisateur'}.`);
  };

  const handleUpdateMemberRole = (id: string, newRole: CompanyRole) => {
    const updated = teamMembers.map(m => m.id === id ? { ...m, role: newRole } : m);
    setTeamMembers(updated);
    localStorage.setItem('sb_team_members', JSON.stringify(updated));
    triggerToast('Rôle du membre mis à jour.');
  };

  useEffect(() => {
    getStripeConfig().then(cfg => setStripeConfig(cfg)).catch(() => {});
  }, []);

  // Synchronize company input values when activeCompany changes
  useEffect(() => {
    if (activeCompany) {
      setCompanyName(activeCompany.companyName || '');
      setCompanyOwner(activeCompany.ownerName || '');
      setCompanyNE(activeCompany.companyNE || activeCompany.taxId2 || '');
      setCompanyAddress(activeCompany.address || '');
      setCompanyPhone(activeCompany.phone || '');
      setCompanyLogo(activeCompany.logoUrl || '');
      setCompanySignature(activeCompany.companySignature || '');
      setCompanyEmail(activeCompany.email || '');
      setTpsNumber(activeCompany.taxId1 || '');
      setTvqNumber(activeCompany.taxId2 || '');
    }
  }, [activeCompany?.id, activeCompany?.companyName]);

  // Save all custom settings to localStorage and update active company
  const handleSaveSettings = () => {
    localStorage.setItem('company_name', companyName);
    localStorage.setItem('company_owner', companyOwner);
    localStorage.setItem('company_ne', companyNE);
    localStorage.setItem('company_address', companyAddress);
    localStorage.setItem('company_phone', companyPhone);
    localStorage.setItem('company_logo', companyLogo);
    localStorage.setItem('company_signature', companySignature);
    localStorage.setItem('sb_company_email', companyEmail);
    localStorage.setItem('sb_company_website', companyWebsite);
    localStorage.setItem('sb_invoice_prefix', invoicePrefix);
    localStorage.setItem('sb_quote_prefix', quotePrefix);
    localStorage.setItem('sb_payment_terms', defaultPaymentTerms);
    localStorage.setItem('sb_late_fee', lateFeePercent);
    localStorage.setItem('sb_invoice_notes', defaultInvoiceNotes);
    localStorage.setItem('sb_interac_email', interacEmail);
    localStorage.setItem('sb_interac_autodeposit', String(interacAutoDeposit));
    localStorage.setItem('sb_bank_institution', bankInstitution);
    localStorage.setItem('sb_bank_transit', bankTransit);
    localStorage.setItem('sb_bank_account', bankAccount);
    localStorage.setItem('sb_tax_tps', tpsNumber);
    localStorage.setItem('sb_tax_tvq', tvqNumber);
    localStorage.setItem('sb_tax_small_supplier', String(isSmallSupplierExempt));

    const updatedCompany = {
      ...(activeCompany || {}),
      id: activeCompany?.id || `comp_${Date.now()}`,
      companyName,
      ownerName: companyOwner,
      companyNE,
      taxId2: companyNE,
      address: companyAddress,
      phone: companyPhone,
      logoUrl: companyLogo,
      companySignature,
      email: companyEmail,
      website: companyWebsite,
      taxId1: tpsNumber,
      region: currentRegion
    };

    try {
      localStorage.setItem('startbill_active_company', JSON.stringify(updatedCompany));
      const storageKey = `startbill_companies_${currentRegion}`;
      const saved = localStorage.getItem(storageKey);
      let list = saved ? JSON.parse(saved) : [];
      if (Array.isArray(list) && list.length > 0) {
        list = list.map((c: any) => (c.id === updatedCompany.id || c.companyName === updatedCompany.companyName) ? updatedCompany : c);
      } else {
        list = [updatedCompany];
      }
      localStorage.setItem(storageKey, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('startbill-company-changed', { detail: updatedCompany }));
    } catch (e) {
      console.warn('Error saving company update:', e);
    }

    setHasSaved(true);
    triggerToast(`Paramètres de "${companyName}" enregistrés avec succès !`);
    setTimeout(() => setHasSaved(false), 2500);
  };

  // Full JSON Data Export (Backup)
  const handleExportFullBackup = () => {
    const backupData = {
      version: 'StartBill Canada 2.0',
      exportedAt: new Date().toISOString(),
      region: currentRegion,
      company: {
        name: companyName,
        owner: companyOwner,
        ne: companyNE,
        address: companyAddress,
        phone: companyPhone,
        email: companyEmail,
        website: companyWebsite,
        tpsNumber,
        tvqNumber
      },
      preferences: {
        invoicePrefix,
        quotePrefix,
        defaultPaymentTerms,
        lateFeePercent,
        defaultInvoiceNotes,
        interacEmail,
        bankInstitution,
        bankTransit,
        bankAccount
      },
      counts: {
        invoices: invoices.length,
        expenses: expenses.length,
        clients: clients.length,
        products: products.length
      },
      invoices,
      expenses,
      clients,
      products
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `startbill_sauvegarde_complete_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    triggerToast('Sauvegarde intégrale JSON exportée avec succès !');
  };

  // Quick summary tax calculations for Tax Prep tab preview
  const totalInvoicesPaid = invoices.filter(inv => inv.status === 'Payée' || inv.status === 'paid');
  const tpsCollected = totalInvoicesPaid.reduce((sum, inv) => sum + (inv.tps || 0), 0);
  const tvqCollected = totalInvoicesPaid.reduce((sum, inv) => sum + (inv.tvq || 0), 0);
  const tpsPaidOnExpenses = expenses.reduce((sum, exp) => sum + (exp.tps || 0), 0);
  const netTpsToRemit = Math.max(0, tpsCollected - tpsPaidOnExpenses);
  const netTvqToRemit = Math.max(0, tvqCollected - (tpsPaidOnExpenses * 1.995));

  const tabsConfig: Array<{ id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'general', label: 'Profil & Identité', icon: Building2 },
    { id: 'taxes', label: 'Fiscalité & Région', icon: Percent },
    { id: 'invoicing', label: 'Facturation & Mentions', icon: FileText },
    { id: 'payments', label: 'Paiements & Virement', icon: Wallet },
    { id: 'tax_prep', label: 'Déclarations & Impôts', icon: Receipt },
    { id: 'permissions', label: 'Rôles & Permissions', icon: KeyRound },
    { id: 'subscription', label: 'Abonnement & Forfaits', icon: Zap },
    { id: 'security', label: 'Sauvegardes & Données', icon: ShieldCheck }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-7 space-y-6 font-sans text-slate-800">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER - Module 10 Badge & Action Bar                             */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200 shadow-2xs">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Paramètres généraux
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Configurez vos coordonnées d'entreprise, taxes régionales, mentions légales et sauvegardes.
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportFullBackup}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer shadow-2xs"
            title="Exporter une archive JSON de toutes vos données"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Sauvegarde JSON</span>
          </button>

          <button
            type="button"
            onClick={handleSaveSettings}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow-md transition cursor-pointer"
          >
            {hasSaved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Enregistré !</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Sauvegarder</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TAB NAVIGATION                                                         */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 no-scrollbar">
        {tabsConfig.map(tab => {
          const Icon = tab.icon;
          const isCurrent = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isCurrent 
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.id === 'subscription' && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-black uppercase ${
                  isPro ? 'bg-emerald-400 text-emerald-950' : 'bg-amber-100 text-amber-800'
                }`}>
                  {isPro ? 'PRO' : 'Gratuit'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. TAB 1: PROFIL & IDENTITÉ LÉGALE                                        */}
      {/* ========================================================================= */}
      {activeTab === 'general' && (
        <div className="space-y-5">
          {/* Multi-Company Selector in Settings */}
          {companies && companies.length > 0 && onSelectCompany && (
            <div className="bg-white border border-blue-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Entreprise active sélectionnée</span>
                  <span className="text-sm font-black text-slate-900">{companyName || activeCompany?.companyName}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto py-1">
                <span className="text-[11px] font-bold text-slate-500 mr-1 hidden sm:inline">Changer d'entreprise :</span>
                {companies.map((c: any) => {
                  const isSel = c.id === activeCompany?.id || c.companyName === companyName;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onSelectCompany(c)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        isSel
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span>{c.companyName}</span>
                      {isSel && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Business Details Form */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                Dénomination & Représentation
              </h2>
              <span className="text-[10px] text-slate-400 font-semibold">Affiché sur vos devis et factures</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Nom commercial de l'entreprise *
                </label>
                <input 
                  type="text" 
                  value={companyName} 
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: StartBill Canada Inc."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition" 
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Propriétaire / Représentant légal
                </label>
                <input 
                  type="text" 
                  value={companyOwner} 
                  onChange={(e) => setCompanyOwner(e.target.value)}
                  placeholder="Ex: Jean Dupont"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition" 
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Numéro d'entreprise (NE / NEQ au Québec)
                </label>
                <input 
                  type="text" 
                  value={companyNE} 
                  onChange={(e) => setCompanyNE(e.target.value)}
                  placeholder="Ex: 123456789 RC0001 / 1178990123"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition" 
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Téléphone professionnel
                </label>
                <input 
                  type="text" 
                  value={companyPhone} 
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  placeholder="Ex: +1 (514) 555-0199"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition" 
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Courriel de facturation / Contact
                </label>
                <input 
                  type="email" 
                  value={companyEmail} 
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  placeholder="Ex: facturation@entreprise.ca"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition" 
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Site internet / Vitrine
                </label>
                <input 
                  type="url" 
                  value={companyWebsite} 
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  placeholder="Ex: https://monentreprise.ca"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition" 
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Adresse complète du siège social
                </label>
                <input 
                  type="text" 
                  value={companyAddress} 
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  placeholder="Ex: 1000 Rue de la Gauchetière O, Bureau 2400, Montréal, QC H3B 4W5"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition" 
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Dernière modification sauvegardée localement et sur le Cloud
              </span>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                Appliquer
              </button>
            </div>
          </div>

          {/* Logo & Signature Assets Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-5">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Identité Visuelle
            </h2>

            {/* Logo Section */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase block">Logo officiel</label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden p-1 shrink-0">
                  {companyLogo ? (
                    <img 
                      src={companyLogo} 
                      alt="Logo" 
                      className="w-full h-full object-contain" 
                      onError={(e) => { (e.target as HTMLImageElement).src = "/startbill-logo.svg"; }} 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <span className="text-[9px] text-slate-400">Aucun logo</span>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <input 
                    type="text" 
                    value={companyLogo} 
                    onChange={(e) => setCompanyLogo(e.target.value)}
                    placeholder="URL du logo..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] text-slate-800 focus:outline-none focus:border-blue-500" 
                  />
                  <label className="text-[10px] text-blue-600 hover:underline cursor-pointer font-bold inline-flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Téléverser une image</span>
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
                            triggerToast("Logo officiel mis à jour !");
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <label className="text-[10px] font-bold text-slate-500 uppercase block">Signature autorisée</label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden p-1 shrink-0">
                  {companySignature ? (
                    <img 
                      src={companySignature} 
                      alt="Signature" 
                      className="w-full h-full object-contain" 
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://lh3.googleusercontent.com/d/1B0q88Z-b6RCHH_h_V6f578H8i2VfEw9u"; }} 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <span className="text-[9px] text-slate-400">Aucune</span>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <input 
                    type="text" 
                    value={companySignature} 
                    onChange={(e) => setCompanySignature(e.target.value)}
                    placeholder="URL de signature..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] text-slate-800 focus:outline-none focus:border-blue-500" 
                  />
                  <label className="text-[10px] text-blue-600 hover:underline cursor-pointer font-bold inline-flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Téléverser un scan</span>
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
                            triggerToast("Signature autorisée mise à jour !");
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-800 leading-relaxed">
              💡 <strong>Astuce StartBill</strong> : Le logo et la signature sont automatiquement intégrés dans le générateur de PDF conforme pour Revenu Québec et l'ARC.
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB 2: FISCALITÉ & TAXES RÉGIONALES                                    */}
      {/* ========================================================================= */}
      {activeTab === 'taxes' && (
        <div className="space-y-6">
          {/* Active Region Switcher Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{REGIONS[currentRegion]?.flag || '🇨🇦'}</span>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Région fiscale active</div>
                <div className="text-base font-black text-slate-900">{REGIONS[currentRegion]?.name || 'Canada (Québec)'}</div>
                <p className="text-xs text-slate-500">
                  Devise d'opération : <strong className="text-slate-800">{REGIONS[currentRegion]?.currency || 'CAD'} ({REGIONS[currentRegion]?.currencySymbol || '$'})</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setScreen('choose_region')}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Changer de région ou province</span>
            </button>
          </div>

          {/* Tax Rates Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
                <Percent className="w-4 h-4 text-blue-600" />
                Taux de perception des taxes
              </h2>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      TPS (Fédéral ARC)
                    </label>
                    <div className="text-base font-black text-slate-800">5.000 %</div>
                    <span className="text-[10px] text-slate-400">Partout au Canada</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      TVQ (Québec MRQ)
                    </label>
                    <div className="text-base font-black text-slate-800">9.975 %</div>
                    <span className="text-[10px] text-slate-400">Total combiné : 14.975 %</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Numéro d'inscription TPS (Fédéral - Finissant par RT0001)
                  </label>
                  <input 
                    type="text" 
                    value={tpsNumber} 
                    onChange={(e) => setTpsNumber(e.target.value)}
                    placeholder="Ex: 123456789 RT0001"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500" 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Numéro d'inscription TVQ (Revenu Québec - Finissant par TQ0001)
                  </label>
                  <input 
                    type="text" 
                    value={tvqNumber} 
                    onChange={(e) => setTvqNumber(e.target.value)}
                    placeholder="Ex: 1234567890 TQ0001"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500" 
                  />
                </div>
              </div>
            </div>

            {/* Small Supplier Exemption Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Régime du Petit Fournisseur
              </h2>

              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-900">Seuil légal de 30 000 $ CAD</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                    Règle ARC & Revenu Québec
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-normal">
                  Si vos revenus imposables mondiaux sont inférieurs à 30 000 $ sur 4 trimestres consécutifs, vous pouvez bénéficier de la dispense d'inscription aux taxes.
                </p>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={isSmallSupplierExempt}
                    onChange={(e) => setIsSmallSupplierExempt(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" 
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Activer le statut de petit fournisseur (Exonéré de perception)
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Lorsque coché, les factures seront générées à 0.00 $ de TPS/TVQ avec la mention légale de dispense.
                    </div>
                  </div>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                >
                  Enregistrer la fiscalité
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB 3: FACTURATION & MENTIONS LÉGALES                                   */}
      {/* ========================================================================= */}
      {activeTab === 'invoicing' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Séquences de numérotation & Délais de paiement
            </h2>
            <span className="text-[10px] text-slate-400 font-semibold">Standardisation professionnelle</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Préfixe des factures
              </label>
              <input 
                type="text" 
                value={invoicePrefix} 
                onChange={(e) => setInvoicePrefix(e.target.value)}
                placeholder="Ex: FACT-2026-"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500" 
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Exemple: {invoicePrefix}001</span>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Préfixe des devis / estimations
              </label>
              <input 
                type="text" 
                value={quotePrefix} 
                onChange={(e) => setQuotePrefix(e.target.value)}
                placeholder="Ex: DEV-2026-"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500" 
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Exemple: {quotePrefix}001</span>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Modalités de paiement par défaut
              </label>
              <select 
                value={defaultPaymentTerms} 
                onChange={(e) => setDefaultPaymentTerms(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="0">Payable immédiatement à réception</option>
                <option value="15">Net 15 jours</option>
                <option value="30">Net 30 jours (Standard recommandé)</option>
                <option value="45">Net 45 jours</option>
                <option value="60">Net 60 jours</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Taux d'intérêt de retard (% par mois)
              </label>
              <input 
                type="number" 
                step="0.1"
                min="0"
                value={lateFeePercent} 
                onKeyDown={(e) => {
                  if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const valStr = e.target.value;
                  if (valStr.includes('-')) return;
                  const raw = parseFloat(valStr);
                  setLateFeePercent(isNaN(raw) ? '' : Math.max(0, raw).toString());
                }}
                placeholder="2.0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500" 
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Taux standard : 2% par mois (24% annuel)</span>
            </div>
          </div>

          {/* Legal Notes & Footer Text */}
          <div className="pt-3 border-t border-slate-100">
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              Mentions légales et notes de bas de page par défaut
            </label>
            <textarea 
              rows={3}
              value={defaultInvoiceNotes} 
              onChange={(e) => setDefaultInvoiceNotes(e.target.value)}
              placeholder="Texte affiché en bas de chaque facture émise..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white" 
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveSettings}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
            >
              Enregistrer les préférences de facturation
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB 4: PAIEMENTS & ENCAISSEMENT (INTERAC & BANQUE)                      */}
      {/* ========================================================================= */}
      {activeTab === 'payments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Interac e-Transfer Settings */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Wallet className="w-4 h-4 text-amber-500" />
                Virement Interac e-Transfer
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                Populaire au Canada
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Les coordonnées saisies ici s'affichent directement sur les avis d'échéance et factures PDF transmis à vos clients.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Courriel de réception Interac *
                </label>
                <input 
                  type="email" 
                  value={interacEmail} 
                  onChange={(e) => setInteracEmail(e.target.value)}
                  placeholder="Ex: virement@entreprise.ca"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={interacAutoDeposit}
                    onChange={(e) => setInteracAutoDeposit(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" 
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Dépôt automatique activé (Aucune question secrète requise)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Banking / Void Check Info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                Dépôt bancaire direct (TEF / Spécimen)
              </h2>
              <span className="text-[10px] text-slate-400 font-semibold">Chèque & Virement bancaire</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Institution (3 ch.)
                </label>
                <input 
                  type="text" 
                  value={bankInstitution} 
                  onChange={(e) => setBankInstitution(e.target.value)}
                  placeholder="003"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Transit (5 ch.)
                </label>
                <input 
                  type="text" 
                  value={bankTransit} 
                  onChange={(e) => setBankTransit(e.target.value)}
                  placeholder="12345"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Folio / Compte
                </label>
                <input 
                  type="text" 
                  value={bankAccount} 
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="1234567"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500" 
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium">
                Gérer les encaissements et règlements
              </span>
              <button
                type="button"
                onClick={() => setScreen('payments')}
                className="text-blue-600 hover:text-blue-800 text-xs font-bold inline-flex items-center gap-1"
              >
                <span>Ouvrir Paiements</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Stripe Card Payment Gateway & Access Policies Card */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center font-bold shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span>Passerelle de Paiement Stripe (Cartes de Crédit / Débit)</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Encaissement en ligne instantané de vos factures avec sécurité bancaire renforcée.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                  stripeConfig?.keyType === 'restricted'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : (stripeConfig?.isConfigured ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600')
                }`}>
                  {stripeConfig?.keyType === 'restricted'
                    ? 'Clé Restreinte Active (PoLP)'
                    : (stripeConfig?.isConfigured ? 'Clé Standard Active' : 'Non configurée')}
                </span>
                <a
                  href="https://docs.stripe.com/keys#access-policies"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-[#635BFF] hover:text-[#5046e5] inline-flex items-center gap-1"
                >
                  <span>Doc Politiques d'Accès</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stripeCardPaymentsEnabled}
                    onChange={(e) => {
                      setStripeCardPaymentsEnabled(e.target.checked);
                      localStorage.setItem('sb_stripe_card_enabled', String(e.target.checked));
                      triggerToast(e.target.checked ? 'Paiements Stripe par carte activés sur les factures !' : 'Paiements Stripe désactivés.');
                    }}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 mt-0.5 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">
                      Autoriser le règlement en ligne par Carte Bancaire
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Ajoute un bouton de paiement sécurisé Stripe direct sur chaque facture transmise à vos clients.
                    </span>
                  </div>
                </label>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Cartes acceptées :</span>
                  <span className="font-bold text-slate-700">Visa, MasterCard, Amex, Apple Pay, Google Pay</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-xs">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Architecture Sécurisée selon https://docs.stripe.com/keys#access-policies</span>
                </div>
                <p className="text-[11px] text-indigo-800 leading-relaxed font-medium">
                  Les Restricted Keys Stripe appliquent le principe du moindre privilège : la clé autorise uniquement la création de sessions de règlement et ne dispose d'aucun droit sur vos soldes ou comptes bancaires.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setScreen('admin')}
                    className="text-xs font-bold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1 underline underline-offset-2 cursor-pointer"
                  >
                    <span>Gérer les clés et auditer les permissions dans l'Espace Admin</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. TAB 5: DÉCLARATIONS FISCALES & IMPÔTS                                   */}
      {/* ========================================================================= */}
      {activeTab === 'tax_prep' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-600" />
                Synthèse Fiscale & Préparation Déclarative
              </h2>
              <p className="text-xs text-slate-500">
                Calcul automatique des taxes nettes à remettre (TPS perçue - CTI, TVQ perçue - RTI).
              </p>
            </div>

            <button
              type="button"
              onClick={() => setScreen('tax_prep')}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer self-start sm:self-auto"
            >
              <span>Accéder aux Déclarations de taxes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase">TPS Nette à remettre (ARC)</div>
              <div className="text-xl font-black text-slate-900">
                {netTpsToRemit.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $
              </div>
              <p className="text-[10px] text-slate-400">
                Collectée : {tpsCollected.toFixed(2)} $ — CTI déduit : {tpsPaidOnExpenses.toFixed(2)} $
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase">TVQ Nette à remettre (MRQ)</div>
              <div className="text-xl font-black text-slate-900">
                {netTvqToRemit.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $
              </div>
              <p className="text-[10px] text-slate-400">
                Collectée : {tvqCollected.toFixed(2)} $ — RTI déduit
              </p>
            </div>

            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
              <div className="text-[10px] font-bold text-blue-700 uppercase">Provision Fiscale Totale Recommandée</div>
              <div className="text-xl font-black text-blue-900">
                {(netTpsToRemit + netTvqToRemit).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $
              </div>
              <p className="text-[10px] text-blue-600 font-semibold">
                Montant à conserver sur compte de réserve
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. TAB: RÔLES & PERMISSIONS (RBAC)                                        */}
      {/* ========================================================================= */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200 shadow-2xs">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                      Gouvernance d'Entreprise
                    </span>
                    <span className="text-xs text-slate-400">Contrôle d'accès basé sur les rôles (RBAC)</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Rôles & Permissions d'Accès de l'Équipe
                  </h2>
                  <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
                    Définissez précisément les droits de chaque membre de l'entreprise (Super Admin, Administrateur, Comptable CPA, Commercial, Auditeur) pour sécuriser vos données financières et garantir la séparation des devoirs comptables.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleResetPermissionsToDefault}
                  className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer"
                  title="Réinitialiser la matrice aux valeurs recommandées par défaut"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Permissions standard</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveRolePermissions}
                  className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow-md transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Sauvegarder les permissions</span>
                </button>
              </div>
            </div>

            {/* Quick KPI info pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-purple-700">Membres Actifs</div>
                  <div className="text-sm font-black text-purple-950">{teamMembers.length} collaborateurs</div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-emerald-700">Niveaux de Sécurité</div>
                  <div className="text-sm font-black text-emerald-950">5 rôles prédéfinis</div>
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-blue-700">Protection Fiscale</div>
                  <div className="text-sm font-black text-blue-950">Isolation des déclarations</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Team Members Management */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Collaborateurs & Membres de l'Entreprise</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Gérez les utilisateurs ayant accès à l'espace StartBill de <strong>{companyName || 'votre entreprise'}</strong>.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer shadow-xs self-start sm:self-auto"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Inviter un collaborateur</span>
              </button>
            </div>

            {/* Invite Modal / Inline Card */}
            {showInviteModal && (
              <form onSubmit={handleAddTeamMember} className="bg-slate-50 border border-blue-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                    Inviter un nouveau membre à l'entreprise
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Jean Tremblay"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Courriel professionnel *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jean.tremblay@entreprise.ca"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Rôle assigné
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as CompanyRole)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-blue-500 font-semibold"
                    >
                      <option value="ADMIN">Administrateur (Opérations)</option>
                      <option value="ACCOUNTANT">Comptable / Expert CPA</option>
                      <option value="COLLABORATOR">Collaborateur / Ventes</option>
                      <option value="READ_ONLY">Auditeur (Lecture Seule)</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-800 flex items-center justify-between">
                  <span>
                    Un lien sécurisé d'activation sera émis pour ce collaborateur avec les autorisations du rôle <strong>{ROLE_DETAILS[inviteRole].label}</strong>.
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowInviteModal(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-bold"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg shadow-xs"
                    >
                      Envoyer l'accès
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Members Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">Collaborateur</th>
                    <th className="p-3">Courriel</th>
                    <th className="p-3">Rôle Assigné</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3">Ajouté le</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {teamMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                            {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <span>{member.name}</span>
                              {member.role === 'SUPER_ADMIN' && (
                                <span className="text-[9px] font-black bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded border border-purple-200">
                                  Propriétaire
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600">{member.email}</td>
                      <td className="p-3">
                        {member.role === 'SUPER_ADMIN' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                            <Shield className="w-3 h-3 text-purple-600" />
                            {ROLE_DETAILS.SUPER_ADMIN.label}
                          </span>
                        ) : (
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateMemberRole(member.id, e.target.value as CompanyRole)}
                            className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-blue-500 cursor-pointer shadow-2xs"
                          >
                            <option value="ADMIN">Administrateur</option>
                            <option value="ACCOUNTANT">Comptable / CPA</option>
                            <option value="COLLABORATOR">Collaborateur / Ventes</option>
                            <option value="READ_ONLY">Auditeur (Lecture)</option>
                          </select>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          member.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            member.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                          }`} />
                          {member.status === 'active' ? 'Actif' : 'Invitation envoyée'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 text-[11px]">{member.addedDate}</td>
                      <td className="p-3 text-right">
                        {member.role !== 'SUPER_ADMIN' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTeamMember(member.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded transition cursor-pointer"
                            title="Révoquer l'accès de ce membre"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Role Selector Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Sélectionnez un rôle pour inspecter & configurer sa matrice</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Cliquez sur un rôle ci-dessous pour voir et ajuster ses autorisations modulaires.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {(Object.keys(ROLE_DETAILS) as CompanyRole[]).map((r) => {
                const info = ROLE_DETAILS[r];
                const isSelected = selectedPermRole === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setSelectedPermRole(r);
                      triggerToast(`Affichage des permissions pour : ${info.label}`);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-50/70 border-purple-500 ring-2 ring-purple-400/30 text-purple-950 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${info.badgeColor}`}>
                          {info.level}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-purple-600" />
                        )}
                      </div>
                      <h4 className="font-black text-xs text-slate-900">{info.label}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                        {info.desc}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-purple-600">
                      <span>{isSelected ? 'Rôle sélectionné' : 'Configurer ce rôle'}</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Granular Permissions Matrix Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-purple-600" />
                  <span>Matrice des Autorisations pour : <strong className="text-purple-700">{ROLE_DETAILS[selectedPermRole].label}</strong></span>
                </h3>
                <p className="text-xs text-slate-500">
                  Cochez ou décochez les actions autorisées par module. Les modifications s'appliquent en temps réel aux utilisateurs de ce rôle.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500">
                  {ROLE_DETAILS[selectedPermRole].level}
                </span>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3 w-1/3">Section / Fonctionnalité</th>
                    {PERMISSION_ACTIONS.map(a => (
                      <th key={a.key} className="p-3 text-center">
                        <div>{a.label}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {BUSINESS_MODULES.map(module => {
                    const activeActions = rolePermissions[selectedPermRole]?.[module.id] || [];

                    return (
                      <tr key={module.id} className="hover:bg-slate-50/60 transition">
                        <td className="p-3">
                          <div className="font-bold text-slate-900 text-xs">{module.name}</div>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">{module.category}</span>
                        </td>

                        {PERMISSION_ACTIONS.map(action => {
                          const hasAction = activeActions.includes(action.key);
                          const isSuperAdminSafe = selectedPermRole === 'SUPER_ADMIN' && action.key === 'read' && module.id === 'settings';

                          return (
                            <td key={action.key} className="p-3 text-center">
                              <button
                                type="button"
                                disabled={isSuperAdminSafe}
                                onClick={() => handleTogglePermission(selectedPermRole, module.id, action.key)}
                                className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition cursor-pointer ${
                                  hasAction
                                    ? 'bg-purple-600 text-white shadow-2xs hover:bg-purple-700'
                                    : 'bg-slate-100 text-slate-300 hover:bg-slate-200 hover:text-slate-500'
                                } ${isSuperAdminSafe ? 'opacity-80 cursor-not-allowed' : ''}`}
                                title={`${hasAction ? 'Désactiver' : 'Activer'} ${action.label} sur ${module.name}`}
                              >
                                {hasAction ? (
                                  <Check className="w-4 h-4 stroke-3" />
                                ) : (
                                  <span className="text-slate-300 text-xs font-bold">—</span>
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Matrix Footer Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Politique de moindre privilège appliquée par défaut pour la conformité financière.</span>
              </div>

              <button
                type="button"
                onClick={handleSaveRolePermissions}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer shadow-xs"
              >
                Appliquer & Sauvegarder pour {ROLE_DETAILS[selectedPermRole].label}
              </button>
            </div>
          </div>

          {/* Section 4: Security Enforcement & Governance Policies */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Politiques de Sécurité & Conformité de l'Entreprise</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-900">Double Authentification (2FA / MFA)</div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mfaEnforced}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setMfaEnforced(val);
                        localStorage.setItem('sb_mfa_enforced', String(val));
                        triggerToast(`2FA obligatoire pour l'équipe : ${val ? 'Activé' : 'Optionnel'}`);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Exige une vérification par code TOTP (Google Authenticator) ou SMS pour tout compte accédant aux modules Comptabilité, Dépenses et Fiscalité.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-900">Verrouillage de Session Inactive</div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    60 secondes
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Conformément à la Loi 25 (Québec) et à vos paramètres de sécurité, l'écran se verrouille après 1 minute d'inactivité pour empêcher tout accès non autorisé sur site.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. TAB: ABONNEMENT SAAS & QUOTAS                                          */}
      {/* ========================================================================= */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Plan d'abonnement actif</span>
                <div className="flex items-center gap-2 mt-1">
                  <h2 className="text-xl font-black text-slate-900">
                    {isPro ? 'StartBill PRO Entreprise' : 'StartBill Starter Gratuit'}
                  </h2>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    isPro ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {isPro ? 'ACTIF PRO' : 'GRATUIT'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {isPro 
                    ? 'Accès illimité à tous les modules, exports comptables, IA prédictive et multi-devises.' 
                    : 'Passez au forfait PRO pour lever les restrictions de facturation et activer le Conseiller IA.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setScreen('pricing')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer"
                >
                  Comparer les forfaits
                </button>

                {!isPro ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsPro(true);
                      triggerToast('Félicitations ! Votre compte a été mis à niveau vers le Plan PRO 🚀');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Activer PRO (19 $/mois)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsPro(false);
                      triggerToast('Abonnement PRO suspendu. Compte repassé en version Gratuite.');
                    }}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer"
                  >
                    Suspendre PRO
                  </button>
                )}
              </div>
            </div>

            {/* Quotas & Capacity Usage */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Factures émises</span>
                  <span className="text-slate-500 font-semibold">{invoices.length} {isPro ? '/ Illimité' : '/ 5 max'}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: isPro ? '25%' : `${Math.min(100, (invoices.length / 5) * 100)}%` }} />
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Clients enregistrés</span>
                  <span className="text-slate-500 font-semibold">{clients.length} {isPro ? '/ Illimité' : '/ 10 max'}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: isPro ? '35%' : `${Math.min(100, (clients.length / 10) * 100)}%` }} />
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Conseiller IA Financier</span>
                  <span className="text-slate-500 font-semibold">{isPro ? 'Actif' : 'Limité'}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: isPro ? '100%' : '20%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. TAB 7: SAUVEGARDES, EXPORT & SÉCURITÉ                                   */}
      {/* ========================================================================= */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Cloud Status */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              État de synchronisation & Sécurité Cloud
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                <div className="text-[10px] font-bold text-emerald-700 uppercase">Moteur de Données</div>
                <div className="text-sm font-black text-emerald-950 mt-0.5">Google Cloud Firestore</div>
                <div className="text-[10px] text-emerald-700 mt-1">Synchronisation temps réel</div>
              </div>

              <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl">
                <div className="text-[10px] font-bold text-blue-700 uppercase">Chiffrement en Transit</div>
                <div className="text-sm font-black text-blue-950 mt-0.5">TLS / SSL 256-bit</div>
                <div className="text-[10px] text-blue-700 mt-1">Conforme normes bancaires</div>
              </div>

              <div className="p-3.5 bg-indigo-50/60 border border-indigo-200 rounded-xl">
                <div className="text-[10px] font-bold text-indigo-700 uppercase">Utilisateur Connecté</div>
                <div className="text-sm font-black text-indigo-950 mt-0.5 truncate">
                  {authUser?.email || 'Compte Entreprise'}
                </div>
                <div className="text-[10px] text-indigo-700 mt-1">Rôle : Propriétaire du compte</div>
              </div>
            </div>
          </div>

          {/* Auto-Lock Inactivity Security Card */}
          <div className="bg-white border border-amber-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-300 flex items-center justify-center text-amber-700">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 tracking-tight">
                    Verrouillage automatique après inactivité
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Protège vos factures et données fiscales si vous laissez votre écran sans surveillance.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Actif • 1 minute</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Délai d'inactivité</span>
                <div className="text-sm font-black text-slate-800">60 secondes (1 min)</div>
                <p className="text-[10px] text-slate-500">Compte à rebours réinitialisé à chaque frappe ou clic.</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Événements surveillés</span>
                <div className="text-sm font-black text-slate-800">Souris, Clavier & Tactile</div>
                <p className="text-[10px] text-slate-500">Détection continue sur l'ensemble de l'application.</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Persistance sécurisée</span>
                <div className="text-sm font-black text-slate-800">Verrouillage persistant</div>
                <p className="text-[10px] text-slate-500">L'actualisation du navigateur ne contourne pas le verrou.</p>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Vous quittez votre poste ? Verrouillez instantanément votre espace de travail.
              </p>
              {onLockSession && (
                <button
                  type="button"
                  onClick={() => {
                    onLockSession();
                    triggerToast('Session verrouillée pour sécurité');
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Verrouiller maintenant</span>
                </button>
              )}
            </div>
          </div>

          {/* Backup & Export Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-600" />
              Exports & Sauvegardes intégrales
            </h2>

            <p className="text-xs text-slate-500">
              Exportez à tout moment l'ensemble de votre dossier comptable dans un format structuré JSON ou CSV.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleExportFullBackup}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger la sauvegarde complète (JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => setScreen('reports')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Rapports comptables & exports CSV</span>
              </button>
            </div>
          </div>

          {/* Danger Zone: Reset factory data */}
          <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Zone Sensible : Restauration Usine
                </h3>
                <p className="text-sm font-bold text-slate-900">
                  Réinitialiser les données aux valeurs de démonstration
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Restaure les factures, dépenses, clients et paramètres d'origine de la démonstration StartBill.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowResetAllDataConfirm(true)}
                disabled={isLoading}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold py-2.5 px-4 rounded-xl shadow-md transition cursor-pointer flex items-center gap-2 disabled:opacity-50 self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Restauration Usine</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SettingsPage;
