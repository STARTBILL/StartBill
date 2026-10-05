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
  ArrowRight
} from 'lucide-react';
import { Invoice, Expense, Client, ProductItem, ScreenId } from '../types';
import { REGIONS } from '../data/regions';
import { useRegionalContext } from '../context/RegionalContext';
import { useAuth } from '../context/AuthContext';

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
}

type SettingsTab = 'general' | 'taxes' | 'invoicing' | 'payments' | 'tax_prep' | 'subscription' | 'security';

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
  products = []
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
  const [interacEmail, setInteracEmail] = useState(() => localStorage.getItem('sb_interac_email') || 'paiements@startbill.ca');
  const [interacAutoDeposit, setInteracAutoDeposit] = useState(() => localStorage.getItem('sb_interac_autodeposit') !== 'false');
  const [bankInstitution, setBankInstitution] = useState(() => localStorage.getItem('sb_bank_institution') || '003 (RBC)');
  const [bankTransit, setBankTransit] = useState(() => localStorage.getItem('sb_bank_transit') || '12345');
  const [bankAccount, setBankAccount] = useState(() => localStorage.getItem('sb_bank_account') || '1234567');
  const [tpsNumber, setTpsNumber] = useState(() => localStorage.getItem('sb_tax_tps') || '123456789 RT0001');
  const [tvqNumber, setTvqNumber] = useState(() => localStorage.getItem('sb_tax_tvq') || '1234567890 TQ0001');
  const [isSmallSupplierExempt, setIsSmallSupplierExempt] = useState(() => localStorage.getItem('sb_tax_small_supplier') === 'true');

  // Save all custom settings to localStorage
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

    setHasSaved(true);
    triggerToast('Paramètres de l\'entreprise enregistrés avec succès !');
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
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                Module 10 — Paramètres & Configuration
              </span>
              <span className="text-[11px] font-semibold text-slate-500">Entreprise & Facturation</span>
            </div>
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
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://lh3.googleusercontent.com/d/1SJiIy3yPrhrfTZUgAAQ_35qJXkV5T_5W"; }} 
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
                value={lateFeePercent} 
                onChange={(e) => setLateFeePercent(e.target.value)}
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
                Gérer les encaissements enregistrés dans le Module 5
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
              <span>Accéder au Module Déclarations</span>
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
      {/* 8. TAB 6: ABONNEMENT SAAS & QUOTAS                                        */}
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
                  <span className="font-bold text-slate-700">Module IA Financière</span>
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
                  {authUser?.email || 'ferline@startbill.com'}
                </div>
                <div className="text-[10px] text-indigo-700 mt-1">Rôle : Propriétaire du compte</div>
              </div>
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
                <span>Rapports comptables & exports CSV (Module 7)</span>
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
