import React, { useState, useMemo } from 'react';
import { 
  Wallet, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Download, 
  Receipt, 
  Filter, 
  CreditCard, 
  ArrowUpRight, 
  X, 
  Check, 
  Calendar, 
  User, 
  Building2, 
  Printer, 
  Mail, 
  Send,
  Eye,
  RefreshCw,
  TrendingUp,
  Percent
} from 'lucide-react';
import { Invoice, Client, ScreenId, InvoiceStatus } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface PaymentsPageProps {
  invoices: Invoice[];
  clients?: Client[];
  onRecordPayment: (invoiceId: string, amount: number, paymentMethod: string, paymentDate: string, reference?: string) => void;
  triggerToast: (msg: string) => void;
  setScreen: (screen: ScreenId) => void;
  setSelectedInvoiceId: (id: string) => void;
  currencySymbol?: string;
  companyName?: string;
}

export default function PaymentsPage({
  invoices,
  clients = [],
  onRecordPayment,
  triggerToast,
  setScreen,
  setSelectedInvoiceId,
  currencySymbol = '$',
  companyName = 'Mon Entreprise Inc.'
}: PaymentsPageProps) {
  // Navigation tabs within Payments
  const [activeTab, setActiveTab] = useState<'journal' | 'pending'>('journal');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'pending'>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'month' | 'quarter' | 'year'>('all');

  // Modal states for recording a payment
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [targetInvoiceId, setTargetInvoiceId] = useState<string>('');
  const [paymentOption, setPaymentOption] = useState<'total' | 'partial'>('total');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Virement Interac');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  // Modal for Payment Receipt
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptInvoice, setReceiptInvoice] = useState<Invoice | null>(null);

  // Filter invoices based on search, status, and method
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // Search
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        inv.id.toLowerCase().includes(searchLower) ||
        inv.clientName.toLowerCase().includes(searchLower) ||
        (inv.paymentMethod && inv.paymentMethod.toLowerCase().includes(searchLower)) ||
        (inv.description && inv.description.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;

      // Status
      const isPaid = inv.status === 'Payée' || inv.status === 'paid';
      const isPartial = inv.status === 'Partiellement payée' || inv.status === 'partial';
      const isPending = !isPaid && !isPartial;

      if (statusFilter === 'paid' && !isPaid) return false;
      if (statusFilter === 'partial' && !isPartial) return false;
      if (statusFilter === 'pending' && !isPending) return false;

      // Method
      if (methodFilter !== 'all') {
        const method = inv.paymentMethod || 'Non spécifié';
        if (method !== methodFilter) return false;
      }

      // Period filter
      if (periodFilter !== 'all' && inv.date) {
        const invDate = new Date(inv.date);
        const now = new Date();
        if (periodFilter === 'month') {
          if (invDate.getMonth() !== now.getMonth() || invDate.getFullYear() !== now.getFullYear()) {
            return false;
          }
        } else if (periodFilter === 'quarter') {
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const invQuarter = Math.floor(invDate.getMonth() / 3);
          if (invQuarter !== currentQuarter || invDate.getFullYear() !== now.getFullYear()) {
            return false;
          }
        } else if (periodFilter === 'year') {
          if (invDate.getFullYear() !== now.getFullYear()) return false;
        }
      }

      return true;
    });
  }, [invoices, searchTerm, statusFilter, methodFilter, periodFilter]);

  // Unpaid or partially paid invoices (candidates for payment)
  const openInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const isPaid = inv.status === 'Payée' || inv.status === 'paid';
      const remaining = inv.remainingBalance !== undefined ? inv.remainingBalance : (isPaid ? 0 : inv.total);
      return remaining > 0 && inv.status !== 'Annulée';
    });
  }, [invoices]);

  // Financial KPIs
  const kpis = useMemo(() => {
    let totalCollected = 0;
    let totalPending = 0;
    let totalInvoiced = 0;
    let paidCount = 0;
    let partialCount = 0;
    let pendingCount = 0;

    invoices.forEach(inv => {
      const tot = inv.total || 0;
      totalInvoiced += tot;

      const isPaid = inv.status === 'Payée' || inv.status === 'paid';
      const isPartial = inv.status === 'Partiellement payée' || inv.status === 'partial';

      if (isPaid) {
        const paid = inv.amountPaid !== undefined ? inv.amountPaid : tot;
        totalCollected += paid;
        paidCount++;
      } else if (isPartial) {
        const paid = inv.amountPaid || 0;
        const remaining = inv.remainingBalance !== undefined ? inv.remainingBalance : Math.max(0, tot - paid);
        totalCollected += paid;
        totalPending += remaining;
        partialCount++;
      } else {
        totalPending += tot;
        pendingCount++;
      }
    });

    const recoveryRate = totalInvoiced > 0 ? Math.min(100, Math.round((totalCollected / totalInvoiced) * 100)) : 100;

    return {
      totalCollected,
      totalPending,
      totalInvoiced,
      paidCount,
      partialCount,
      pendingCount,
      recoveryRate
    };
  }, [invoices]);

  // Handle opening payment modal for a specific invoice
  const handleOpenPaymentForInvoice = (inv: Invoice) => {
    const remaining = inv.remainingBalance !== undefined ? inv.remainingBalance : (inv.status === 'Payée' ? 0 : inv.total);
    setTargetInvoiceId(inv.id);
    setPaymentOption('total');
    setCustomAmount(remaining.toFixed(2));
    setPaymentMethod(inv.paymentMethod || 'Virement Interac');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentReference('');
    setPaymentNotes('');
    setShowPaymentModal(true);
  };

  // When invoice selection changes in modal
  const handleTargetInvoiceChange = (id: string) => {
    setTargetInvoiceId(id);
    const inv = invoices.find(i => i.id === id);
    if (inv) {
      const remaining = inv.remainingBalance !== undefined ? inv.remainingBalance : (inv.status === 'Payée' ? 0 : inv.total);
      setCustomAmount(remaining.toFixed(2));
      if (inv.paymentMethod) setPaymentMethod(inv.paymentMethod);
    }
  };

  // Submit payment registration
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetInvoiceId) {
      triggerToast('Veuillez sélectionner une facture.');
      return;
    }

    const inv = invoices.find(i => i.id === targetInvoiceId);
    if (!inv) return;

    const remaining = inv.remainingBalance !== undefined ? inv.remainingBalance : (inv.status === 'Payée' ? 0 : inv.total);
    const amountToRecord = paymentOption === 'total' ? remaining : parseFloat(customAmount);

    if (isNaN(amountToRecord) || amountToRecord <= 0) {
      triggerToast('Veuillez entrer un montant valide supérieur à 0.');
      return;
    }

    onRecordPayment(targetInvoiceId, amountToRecord, paymentMethod, paymentDate, paymentReference);
    setShowPaymentModal(false);

    // Offer to view receipt
    const updatedMockInv: Invoice = {
      ...inv,
      amountPaid: (inv.amountPaid || 0) + amountToRecord,
      remainingBalance: Math.max(0, remaining - amountToRecord),
      paymentMethod,
      paymentDate,
      status: (remaining - amountToRecord) <= 0.01 ? 'Payée' : 'Partiellement payée'
    };

    setReceiptInvoice(updatedMockInv);
    setShowReceiptModal(true);
  };

  // Export payments log to CSV
  const handleExportCsv = () => {
    const headers = ['N° Facture', 'Client', 'Date Émission', 'Date Paiement', 'Total TTC', 'Montant Encaissé', 'Solde Restant', 'Mode de Paiement', 'Statut'];
    const rows = filteredInvoices.map(inv => {
      const isPaid = inv.status === 'Payée' || inv.status === 'paid';
      const paid = inv.amountPaid !== undefined ? inv.amountPaid : (isPaid ? inv.total : 0);
      const remaining = inv.remainingBalance !== undefined ? inv.remainingBalance : (isPaid ? 0 : inv.total);
      return [
        `"${inv.id}"`,
        `"${inv.clientName}"`,
        `"${inv.date}"`,
        `"${inv.paymentDate || '-'}"`,
        (inv.total || 0).toFixed(2),
        paid.toFixed(2),
        remaining.toFixed(2),
        `"${inv.paymentMethod || 'Non spécifié'}"`,
        `"${inv.status}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StartBill_Encaissements_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Journal des encaissements exporté en CSV avec succès !');
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto px-4 sm:px-8 py-6 pb-24 max-w-7xl mx-auto w-full space-y-6">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              Module 5 — Paiements
            </span>
            <span className="text-[10px] font-semibold text-slate-400">Trésorerie & Encaissements</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Wallet className="w-7 h-7 text-blue-600" />
            <span>Paiements & Encaissements</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Suivez vos encaissements, enregistrez les règlements (totaux ou partiels) et éditez vos reçus officiels.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 text-xs text-slate-700 bg-white"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" /> Exporter (CSV)
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              if (openInvoices.length > 0) {
                handleOpenPaymentForInvoice(openInvoices[0]);
              } else if (invoices.length > 0) {
                handleOpenPaymentForInvoice(invoices[0]);
              } else {
                triggerToast('Aucune facture disponible.');
              }
            }}
            className="flex items-center gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Plus className="w-4 h-4" /> Enregistrer un paiement
          </Button>
        </div>
      </div>

      {/* 2. KPI METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Encaissé */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Encaissé</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {kpis.totalCollected.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} {currencySymbol}
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1.5 block">
            {kpis.paidCount} facture(s) soldée(s) • {kpis.partialCount} partielle(s)
          </span>
        </div>

        {/* En Attente d'Encaissement */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Solde à Encaisser</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">
            {kpis.totalPending.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} {currencySymbol}
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1.5 block">
            {openInvoices.length} facture(s) avec solde ouvert
          </span>
        </div>

        {/* Taux de Recouvrement */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Taux de Recouvrement</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-600">
            {kpis.recoveryRate} %
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${kpis.recoveryRate}%` }}
            />
          </div>
        </div>

        {/* Total Facturé Global */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Facturé</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {kpis.totalInvoiced.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} {currencySymbol}
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1.5 block">
            Sur {invoices.length} facture(s) au total
          </span>
        </div>
      </div>

      {/* 3. TABS SELECTOR */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('journal')}
            className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
              activeTab === 'journal'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Journal des Encaissements</span>
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-600">
              {filteredInvoices.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
              activeTab === 'pending'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Factures à Encaisser</span>
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-100 text-amber-800 font-bold">
              {openInvoices.length}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setScreen('invoices')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 pb-3"
        >
          <span>Accéder aux Factures</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4. FILTERS & SEARCH BAR */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par client, n° de facture, méthode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition font-medium"
            >
              <option value="all">Tous les états de règlement</option>
              <option value="paid">Payée / Soldée</option>
              <option value="partial">Partiellement payée</option>
              <option value="pending">En attente de paiement</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition font-medium"
            >
              <option value="all">Tous les modes de règlement</option>
              <option value="Virement Interac">Virement Interac</option>
              <option value="Carte bancaire">Carte bancaire / Crédit</option>
              <option value="Virement bancaire">Virement bancaire (EFT)</option>
              <option value="Chèque">Chèque</option>
              <option value="Espèces">Espèces</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. TAB 1: JOURNAL DES ENCAISSEMENTS */}
      {activeTab === 'journal' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Historique des flux de règlements
            </h3>
            <span className="text-[11px] text-slate-500 font-semibold">
              {filteredInvoices.length} enregistrement(s)
            </span>
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Wallet className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-bold text-slate-600">Aucun encaissement ne correspond aux critères.</p>
              <p className="text-[11px] text-slate-400 mt-1">Modifiez vos filtres ou enregistrez un premier paiement.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Date Règlement</th>
                    <th className="py-3 px-4">N° Facture</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Mode de Règlement</th>
                    <th className="py-3 px-4 text-right">Total TTC</th>
                    <th className="py-3 px-4 text-right">Montant Encaissé</th>
                    <th className="py-3 px-4 text-right">Solde Restant</th>
                    <th className="py-3 px-4 text-center">État</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredInvoices.map((inv) => {
                    const isPaid = inv.status === 'Payée' || inv.status === 'paid';
                    const isPartial = inv.status === 'Partiellement payée' || inv.status === 'partial';
                    const amountPaid = inv.amountPaid !== undefined ? inv.amountPaid : (isPaid ? inv.total : 0);
                    const remaining = inv.remainingBalance !== undefined ? inv.remainingBalance : (isPaid ? 0 : inv.total);

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                        {/* Date */}
                        <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{inv.paymentDate || inv.date}</span>
                          </div>
                        </td>

                        {/* Invoice Number */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInvoiceId(inv.id);
                              setScreen('invoice_detail');
                            }}
                            className="font-bold text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{inv.id}</span>
                          </button>
                        </td>

                        {/* Client */}
                        <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                          {inv.clientName}
                        </td>

                        {/* Payment Method */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold">
                            <CreditCard className="w-3 h-3 text-slate-500" />
                            <span>{inv.paymentMethod || 'Virement Interac'}</span>
                          </span>
                        </td>

                        {/* Total TTC */}
                        <td className="py-3.5 px-4 text-right font-semibold text-slate-900 whitespace-nowrap">
                          {(inv.total || 0).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} {currencySymbol}
                        </td>

                        {/* Montant Encaissé */}
                        <td className="py-3.5 px-4 text-right font-black text-emerald-600 whitespace-nowrap">
                          {amountPaid > 0 ? (
                            <span>{amountPaid.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} {currencySymbol}</span>
                          ) : (
                            <span className="text-slate-400 font-normal">0,00 {currencySymbol}</span>
                          )}
                        </td>

                        {/* Solde Restant */}
                        <td className="py-3.5 px-4 text-right font-bold whitespace-nowrap">
                          {remaining > 0 ? (
                            <span className="text-amber-600">
                              {remaining.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} {currencySymbol}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">0,00 {currencySymbol}</span>
                          )}
                        </td>

                        {/* État Badge */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full inline-block ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800'
                              : isPartial
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                          }`}>
                            {inv.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Reçu officiel button */}
                            {amountPaid > 0 && (
                              <button
                                type="button"
                                title="Voir le reçu de paiement"
                                onClick={() => {
                                  setReceiptInvoice(inv);
                                  setShowReceiptModal(true);
                                }}
                                className="p-1.5 hover:bg-blue-50 text-blue-600 hover:text-blue-800 rounded-lg transition"
                              >
                                <Receipt className="w-4 h-4" />
                              </button>
                            )}

                            {/* Encaisser le solde si non soldée */}
                            {remaining > 0 && (
                              <button
                                type="button"
                                onClick={() => handleOpenPaymentForInvoice(inv)}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] rounded-lg transition"
                              >
                                Encaisser
                              </button>
                            )}

                            {/* Voir Facture */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedInvoiceId(inv.id);
                                setScreen('invoice_detail');
                              }}
                              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition"
                              title="Voir la facture"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 6. TAB 2: FACTURES À ENCAISSER */}
      {activeTab === 'pending' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-amber-50/40">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Factures avec solde en attente de règlement
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Règlements attendus auprès de vos clients. Vous pouvez encaisser tout ou partie d'un montant directement.
              </p>
            </div>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
              {openInvoices.length} facture(s) à recouvrer
            </span>
          </div>

          {openInvoices.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-emerald-500" />
              <p className="text-sm font-bold text-slate-700">Toutes vos factures sont soldées !</p>
              <p className="text-xs text-slate-400 mt-1">Aucun solde débiteur en attente d'encaissement.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {openInvoices.map((inv) => {
                const remaining = inv.remainingBalance !== undefined ? inv.remainingBalance : inv.total;
                const paid = inv.amountPaid || 0;
                const isOverdue = inv.status === 'En retard' || (inv.dueDate && new Date(inv.dueDate) < new Date());

                return (
                  <div key={inv.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition">
                    <div className="flex items-start gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isOverdue ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInvoiceId(inv.id);
                              setScreen('invoice_detail');
                            }}
                            className="font-black text-slate-900 text-xs hover:text-blue-600 transition"
                          >
                            {inv.id}
                          </button>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs font-bold text-slate-800">{inv.clientName}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isOverdue ? 'En retard' : inv.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 flex-wrap">
                          <span>Émise le : {inv.date}</span>
                          {inv.dueDate && <span>• Échéance : {inv.dueDate}</span>}
                          {paid > 0 && <span className="text-emerald-600 font-semibold">• Déjà réglé : {paid.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} {currencySymbol}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Solde à payer</span>
                        <span className="text-base font-black text-amber-600">
                          {remaining.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} {currencySymbol}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenPaymentForInvoice(inv)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                        >
                          Encaisser
                        </Button>

                        <button
                          type="button"
                          onClick={() => triggerToast(`Rappel de paiement envoyé au client ${inv.clientName} pour la facture ${inv.id} !`)}
                          className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:border-blue-300 transition"
                          title="Envoyer un rappel de paiement"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 7. MODAL: ENREGISTRER UN PAIEMENT */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Enregistrer un encaissement</h3>
                  <p className="text-[11px] text-slate-400">Validez la réception d'un règlement client</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitPayment} className="p-6 space-y-4">
              {/* Select Invoice */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Facture concernée *
                </label>
                <select
                  value={targetInvoiceId}
                  onChange={(e) => handleTargetInvoiceChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  required
                >
                  <option value="">Sélectionnez une facture...</option>
                  {invoices.map(inv => {
                    const isPaid = inv.status === 'Payée' || inv.status === 'paid';
                    const remaining = inv.remainingBalance !== undefined ? inv.remainingBalance : (isPaid ? 0 : inv.total);
                    return (
                      <option key={inv.id} value={inv.id}>
                        {inv.id} — {inv.clientName} (Solde restant : {remaining.toFixed(2)} {currencySymbol})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Target Invoice Card Info */}
              {(() => {
                const inv = invoices.find(i => i.id === targetInvoiceId);
                if (!inv) return null;
                const isPaid = inv.status === 'Payée' || inv.status === 'paid';
                const remaining = inv.remainingBalance !== undefined ? inv.remainingBalance : (isPaid ? 0 : inv.total);
                const paid = inv.amountPaid || 0;

                return (
                  <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-500">
                      <span>Total de la facture :</span>
                      <span className="font-bold text-slate-800">{(inv.total || 0).toFixed(2)} {currencySymbol}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600">
                      <span>Déjà encaissé :</span>
                      <span className="font-bold">{paid.toFixed(2)} {currencySymbol}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1.5 text-amber-700 font-black">
                      <span>Solde restant dû :</span>
                      <span>{remaining.toFixed(2)} {currencySymbol}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Payment Type: Total or Partial */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Type de règlement *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentOption('total');
                      const inv = invoices.find(i => i.id === targetInvoiceId);
                      if (inv) {
                        const rem = inv.remainingBalance !== undefined ? inv.remainingBalance : (inv.status === 'Payée' ? 0 : inv.total);
                        setCustomAmount(rem.toFixed(2));
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition text-left ${
                      paymentOption === 'total'
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Règlement Complet
                    <span className="text-[10px] font-normal block text-slate-500 mt-0.5">Solde total de la facture</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentOption('partial')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition text-left ${
                      paymentOption === 'partial'
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Règlement Partiel
                    <span className="text-[10px] font-normal block text-slate-500 mt-0.5">Acompte ou versement fractionné</span>
                  </button>
                </div>
              </div>

              {/* Amount to Record */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Montant encaissé ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  required
                />
              </div>

              {/* Mode of Payment & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Mode de paiement *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                    required
                  >
                    <option value="Virement Interac">Virement Interac</option>
                    <option value="Carte bancaire">Carte bancaire (Stripe)</option>
                    <option value="Virement bancaire">Virement bancaire (EFT)</option>
                    <option value="Chèque">Chèque</option>
                    <option value="Espèces">Espèces</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Date du règlement *
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Reference */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Référence / N° de transaction (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex : INT-2026-987456 ou Chèque #124"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {/* Footer buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Annuler
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Confirmer l'encaissement
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: REÇU OFFICIEL DE PAIEMENT */}
      {showReceiptModal && receiptInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Action Bar */}
            <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between no-print">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>Reçu de Paiement Officiel</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
                  title="Imprimer le reçu"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Content */}
            <div className="p-6 text-slate-800 space-y-5 text-xs" id="printable-receipt">
              {/* Receipt Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h4 className="text-base font-black text-slate-900 tracking-tight">STARTBILL</h4>
                  <p className="text-[10px] text-slate-500 font-semibold">{companyName}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Reçu #</span>
                  <span className="text-xs font-black text-blue-600">REC-{receiptInvoice.id}</span>
                </div>
              </div>

              {/* Status Stamp */}
              <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-3 text-center">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 block">
                  Encaissement validé
                </span>
                <span className="text-xl font-black text-emerald-800 block mt-0.5">
                  {(receiptInvoice.amountPaid || receiptInvoice.total).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} {currencySymbol}
                </span>
              </div>

              {/* Details table */}
              <div className="space-y-2 border-t border-b border-slate-100 py-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Client :</span>
                  <span className="font-bold text-slate-900">{receiptInvoice.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Facture de référence :</span>
                  <span className="font-bold text-blue-600">{receiptInvoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date de règlement :</span>
                  <span className="font-semibold text-slate-800">{receiptInvoice.paymentDate || receiptInvoice.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mode de paiement :</span>
                  <span className="font-semibold text-slate-800">{receiptInvoice.paymentMethod || 'Virement Interac'}</span>
                </div>
                {receiptInvoice.remainingBalance !== undefined && (
                  <div className="flex justify-between pt-1 border-t border-slate-100 text-slate-600">
                    <span>Solde restant sur la facture :</span>
                    <span className="font-bold text-amber-700">
                      {receiptInvoice.remainingBalance.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} {currencySymbol}
                    </span>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-400 text-center">
                Merci de votre règlement ! Reçu certifié et numéroté généré par StartBill Canada.
              </div>

              {/* Modal footer */}
              <div className="flex justify-end gap-2 pt-2 no-print">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReceiptModal(false)}
                  className="w-full text-xs"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
