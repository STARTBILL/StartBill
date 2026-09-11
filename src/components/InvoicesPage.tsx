import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Mail, 
  Download, 
  Pencil, 
  Copy, 
  Trash2, 
  Check, 
  AlertCircle, 
  PlusCircle, 
  CreditCard,
  X,
  Filter,
  DollarSign,
  Calendar,
  Building2,
  Package,
  Tag
} from 'lucide-react';
import { Invoice, InvoiceStatus, Client, ScreenId, ProductItem } from '../types';
import { calculateTaxes } from './DeviceSimulator';
import { DEFAULT_PRODUCTS_CANADA } from '../data/defaultProducts';
import { downloadInvoicePdf } from '../lib/pdfGenerator';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import { Loader } from './ui/Loader';
import { EmptyState } from './ui/EmptyState';
import { ErrorState } from './ui/ErrorState';
import { ConfirmModal } from './ui/ConfirmModal';

interface InvoicesPageProps {
  invoices: Invoice[];
  clients: Client[];
  products?: ProductItem[];
  onAddProduct?: (product: ProductItem) => void;
  dbLoading?: boolean;
  dbError?: string | null;
  fetchFirestoreData?: () => void;
  onAddInvoice: (invoice: Invoice) => void;
  onUpdateInvoice: (invoice: Invoice) => void;
  onUpdateInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  onDeleteInvoice: (id: string) => void;
  triggerToast: (msg: string) => void;
  setScreen: (screen: ScreenId) => void;
  selectedInvoiceId: string | null;
  setSelectedInvoiceId: (id: string | null) => void;
  currentScreen: ScreenId;
  initialClientFilter?: string;
}

export default function InvoicesPage({
  invoices,
  clients,
  products = [],
  onAddProduct,
  dbLoading = false,
  dbError = null,
  fetchFirestoreData,
  onAddInvoice,
  onUpdateInvoice,
  onUpdateInvoiceStatus,
  onDeleteInvoice,
  triggerToast,
  setScreen,
  selectedInvoiceId,
  setSelectedInvoiceId,
  currentScreen,
  initialClientFilter = ''
}: InvoicesPageProps) {
  // Local state for list
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<'Toutes' | 'Envoyées' | 'Payées' | 'En retard' | 'Brouillons'>('Toutes');
  const [selectedClientFilter, setSelectedClientFilter] = useState(initialClientFilter);

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formStep, setFormStep] = useState<1 | 2>(1);

  // Form Fields
  const [editingId, setEditingId] = useState('');
  const [invClientName, setInvClientName] = useState(clients[0]?.name || 'Client A');
  const [invDate, setInvDate] = useState(new Date().toISOString().split('T')[0]);
  const [invDueDate, setInvDueDate] = useState('');
  const [invProvince, setInvProvince] = useState('Québec');
  const [invStatus, setInvStatus] = useState<InvoiceStatus>('Envoyée');
  const [invCurrency, setInvCurrency] = useState('CAD');
  const [invDescription, setInvDescription] = useState('');
  const [invItems, setInvItems] = useState<Array<{ description: string; quantity: number; unitPrice: number; total: number }>>([
    { description: 'Prestation de services', quantity: 1, unitPrice: 500, total: 500 }
  ]);

  // Payment Tracking local state for detail view
  const [paymentOption, setPaymentOption] = useState<'total' | 'partial'>('total');
  const [customAmountPaid, setCustomAmountPaid] = useState<string>('');

  // Email modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');

  // Confirmation state
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Products from Module 4
  const activeProducts: ProductItem[] = (products && products.length > 0) ? products : DEFAULT_PRODUCTS_CANADA;
  const [showQuickAddProduct, setShowQuickAddProduct] = useState(false);
  const [quickProdName, setQuickProdName] = useState('');
  const [quickProdPrice, setQuickProdPrice] = useState('');
  const [quickProdCategory, setQuickProdCategory] = useState('Service');

  const handleCreateQuickProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickProdName.trim()) return;
    const pPrice = parseFloat(quickProdPrice) || 0;
    const newProd: ProductItem = {
      id: `prod_${Date.now()}`,
      name: quickProdName.trim(),
      unitPrice: pPrice,
      category: quickProdCategory,
      unit: 'Forfait',
      taxApplicable: true,
      createdAt: new Date().toISOString()
    };
    if (onAddProduct) {
      onAddProduct(newProd);
    }
    // Automatically add this new product to the invoice items
    setInvItems(prev => [
      ...prev,
      { description: newProd.name, quantity: 1, unitPrice: pPrice, total: pPrice }
    ]);
    triggerToast(`Produit "${newProd.name}" ajouté au Module 4 et inséré dans la facture !`);
    setQuickProdName('');
    setQuickProdPrice('');
    setShowQuickAddProduct(false);
  };

  // Helper to open new invoice form
  const openNewInvoiceModal = (presetClient?: string) => {
    setIsEditing(false);
    setFormStep(1);
    setEditingId(`FACT-2026-${Math.floor(100 + Math.random() * 900)}`);
    setInvClientName(presetClient || clients[0]?.name || 'Client A');
    setInvDate(new Date().toISOString().split('T')[0]);
    
    // Default due date +30 days
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setInvDueDate(d.toISOString().split('T')[0]);
    
    setInvProvince('Québec');
    setInvStatus('Envoyée');
    setInvCurrency('CAD');
    setInvDescription('');
    setInvItems([{ description: 'Services de consultation', quantity: 1, unitPrice: 1000, total: 1000 }]);
    setShowModal(true);
  };

  // Helper to edit existing invoice
  const openEditInvoiceModal = (inv: Invoice, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsEditing(true);
    setFormStep(1);
    setEditingId(inv.id);
    setInvClientName(inv.clientName);
    setInvDate(inv.date || new Date().toISOString().split('T')[0]);
    setInvDueDate(inv.dueDate || inv.date);
    setInvProvince(inv.province || 'Québec');
    setInvStatus(inv.status);
    setInvCurrency(inv.currency || 'CAD');
    setInvDescription(inv.description || '');
    setInvItems(inv.items && inv.items.length > 0 ? inv.items : [
      { description: 'Prestation de services', quantity: 1, unitPrice: inv.subtotal, total: inv.subtotal }
    ]);
    setShowModal(true);
  };

  const handleAddItemLine = () => {
    setInvItems([...invItems, { description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const handleRemoveItemLine = (index: number) => {
    if (invItems.length <= 1) return;
    setInvItems(invItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    const updated = [...invItems];
    const item = { ...updated[index], [field]: val };
    if (field === 'quantity' || field === 'unitPrice') {
      const q = field === 'quantity' ? parseFloat(val) || 0 : item.quantity;
      const u = field === 'unitPrice' ? parseFloat(val) || 0 : item.unitPrice;
      item.total = parseFloat((q * u).toFixed(2));
    }
    updated[index] = item;
    setInvItems(updated);
  };

  // Subtotal & Tax calculation for form
  const computedSubtotal = invItems.reduce((s, it) => s + (it.total || 0), 0);
  const taxCalculation = calculateTaxes(invProvince, computedSubtotal);

  const handleSaveInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInvoiceObj: Invoice = {
      id: editingId,
      clientName: invClientName,
      date: invDate,
      dueDate: invDueDate || invDate,
      province: invProvince,
      status: invStatus,
      subtotal: taxCalculation.gst + taxCalculation.pst + taxCalculation.qst + taxCalculation.hst > 0 ? computedSubtotal : computedSubtotal,
      tps: taxCalculation.gst,
      tvq: taxCalculation.qst || taxCalculation.pst || taxCalculation.hst,
      total: taxCalculation.total,
      currency: invCurrency,
      description: invDescription,
      items: invItems
    };

    if (isEditing) {
      onUpdateInvoice(newInvoiceObj);
      triggerToast(`Facture ${editingId} mise à jour avec succès !`);
    } else {
      onAddInvoice(newInvoiceObj);
      triggerToast(`Nouvelle facture ${editingId} créée avec succès !`);
    }

    setShowModal(false);
  };

  const handleDuplicateInvoice = (inv: Invoice) => {
    const duplId = `FACT-2026-${Math.floor(100 + Math.random() * 900)}`;
    const duplInv: Invoice = {
      ...inv,
      id: duplId,
      date: new Date().toISOString().split('T')[0],
      status: 'Brouillon'
    };
    onAddInvoice(duplInv);
    triggerToast(`Facture ${inv.id} dupliquée en sous le numéro ${duplId}`);
  };

  // Status helper class
  const getStatusBadgeClass = (status: InvoiceStatus) => {
    switch (status) {
      case 'Payée':
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Partiellement payée':
      case 'partial':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'En retard':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Envoyée':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-secondary-100 text-secondary-700 border-secondary-200';
    }
  };

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = 
      inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClient = !selectedClientFilter || inv.clientName === selectedClientFilter;

    let matchesTab = true;
    if (statusTab === 'Envoyées') matchesTab = inv.status === 'Envoyée' || inv.status === 'Partiellement payée';
    if (statusTab === 'Payées') matchesTab = inv.status === 'Payée' || inv.status === 'paid';
    if (statusTab === 'En retard') matchesTab = inv.status === 'En retard';
    if (statusTab === 'Brouillons') matchesTab = inv.status === 'Brouillon';

    return matchesSearch && matchesClient && matchesTab;
  });

  const selectedInvoice = invoices.find((inv) => inv.id === selectedInvoiceId) || invoices[0];

  if (dbLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader size="lg" label="Chargement des factures..." />
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <ErrorState 
          title="Erreur de chargement" 
          message={dbError} 
          onRetry={fetchFirestoreData} 
        />
      </div>
    );
  }

  // ==========================================
  // VIEW: INVOICE DETAIL VIEW
  // ==========================================
  if (currentScreen === 'invoice_detail' && selectedInvoice) {
    const taxRes = calculateTaxes(selectedInvoice.province || 'Québec', selectedInvoice.subtotal);

    const total = selectedInvoice.total;
    const amountPaid = selectedInvoice.amountPaid !== undefined 
      ? selectedInvoice.amountPaid 
      : ((selectedInvoice.status === 'Payée' || selectedInvoice.status === 'paid') ? total : 0);
    const remainingBalance = selectedInvoice.remainingBalance !== undefined 
      ? selectedInvoice.remainingBalance 
      : (total - amountPaid);

    const handleSavePayment = () => {
      const finalAmountPaid = paymentOption === 'total' ? total : (parseFloat(customAmountPaid) || 0);
      const finalRemaining = parseFloat(Math.max(0, total - finalAmountPaid).toFixed(2));
      
      let finalStatus: InvoiceStatus = 'Brouillon';
      if (finalAmountPaid >= total) {
        finalStatus = 'Payée';
      } else if (finalAmountPaid > 0) {
        finalStatus = 'Partiellement payée';
      } else if (selectedInvoice.status === 'Envoyée' || selectedInvoice.status === 'En retard') {
        finalStatus = selectedInvoice.status;
      } else {
        finalStatus = 'Brouillon';
      }

      const updatedInv: Invoice = {
        ...selectedInvoice,
        amountPaid: finalAmountPaid,
        remainingBalance: finalRemaining,
        paymentStatus: finalAmountPaid >= total ? 'paid' : (finalAmountPaid > 0 ? 'partial' : undefined),
        status: finalStatus
      };

      onUpdateInvoice(updatedInv);
      triggerToast(`Paiement de ${finalAmountPaid.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $ enregistré !`);
    };

    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-4 md:px-6 md:py-6 pb-32 space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-secondary-200 pb-3 no-print">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setScreen('invoices')}
            className="text-secondary-600 hover:text-secondary-900"
          >
            <ChevronLeft className="w-4 h-4" /> Retour aux factures
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-secondary-400 uppercase font-bold tracking-wider">Statut :</span>
            <span className={`text-[10px] uppercase font-extrabold px-3 py-1 rounded-full border ${getStatusBadgeClass(selectedInvoice.status)}`}>
              {selectedInvoice.status}
            </span>
          </div>
        </div>

        {/* Printable Invoice Document */}
        <div id="printable-invoice-content">
          <Card className="bg-white border-secondary-200 shadow-lg p-6 md:p-8 space-y-6 relative overflow-hidden">
            {/* Top Accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${
              selectedInvoice.status === 'Payée' ? 'bg-emerald-500' : 'bg-primary-600'
            }`} />

            {/* Header: Seller Logo & Company Info */}
            <div className="flex flex-col md:flex-row justify-between items-start border-b border-secondary-100 pb-6 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 bg-primary-600 text-white rounded-xl font-black text-lg flex items-center justify-center">
                    S
                  </div>
                  <span className="text-xl font-black text-secondary-900 tracking-tight">STARTBILL CANADA</span>
                </div>
                <div className="text-xs text-secondary-500 leading-relaxed">
                  <p className="font-semibold text-secondary-800">Startbill Services Numériques Inc.</p>
                  <p>1000 Rue de la Gauchetière O, Suite 2400</p>
                  <p>Montréal, QC H3B 4W5, Canada</p>
                  <p className="mt-1">TPS/NE : 123456789 RT0001 • TVQ : 1234567890 TQ0001</p>
                </div>
              </div>

              <div className="text-left md:text-right">
                <h1 className="text-2xl font-black text-secondary-900 tracking-tight uppercase">FACTURE</h1>
                <p className="text-sm font-bold text-primary-600 font-mono mt-0.5">{selectedInvoice.id}</p>
                <div className="text-xs text-secondary-500 mt-2 space-y-0.5">
                  <p><span className="font-semibold text-secondary-700">Date d'émission :</span> {selectedInvoice.date}</p>
                  <p><span className="font-semibold text-secondary-700">Date d'échéance :</span> {selectedInvoice.dueDate || selectedInvoice.date}</p>
                  <p><span className="font-semibold text-secondary-700">Province fiscale :</span> {selectedInvoice.province || 'Québec'}</p>
                </div>
              </div>
            </div>

            {/* Client Info Banner */}
            <div className="bg-secondary-50/70 border border-secondary-200/80 rounded-2xl p-4 flex flex-col md:flex-row justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider block mb-1">FACTURÉ À :</span>
                <p className="text-sm font-black text-secondary-900">{selectedInvoice.clientName}</p>
                <p className="text-xs text-secondary-600 font-medium">Canada</p>
              </div>

              <div className="text-left md:text-right">
                <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider block mb-1">DÉTAILS DU PAIEMENT :</span>
                <p className="text-xs text-secondary-700 font-semibold">Virement Interac / Bancaire</p>
                <p className="text-xs text-secondary-500">Devise : {selectedInvoice.currency || 'CAD'} ($)</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-secondary-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary-100/70 border-b border-secondary-200 text-secondary-700 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-3 text-center">Qté</th>
                    <th className="py-2.5 px-3 text-right">Prix Unitaire</th>
                    <th className="py-2.5 px-4 text-right">Total ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                    selectedInvoice.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-secondary-50/50">
                        <td className="py-3 px-4 font-semibold text-secondary-800">{item.description}</td>
                        <td className="py-3 px-3 text-center text-secondary-600 font-medium">{item.quantity}</td>
                        <td className="py-3 px-3 text-right text-secondary-600 font-medium">
                          $ {item.unitPrice.toLocaleString('fr-CA', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-secondary-900">
                          $ {item.total.toLocaleString('fr-CA', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-3 px-4 font-semibold text-secondary-800">Prestation de services professionnels</td>
                      <td className="py-3 px-3 text-center text-secondary-600 font-medium">1</td>
                      <td className="py-3 px-3 text-right text-secondary-600 font-medium">
                        $ {selectedInvoice.subtotal.toLocaleString('fr-CA', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-secondary-900">
                        $ {selectedInvoice.subtotal.toLocaleString('fr-CA', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Subtotal & Taxes Summary Box */}
            <div className="flex justify-end pt-2">
              <div className="w-full md:w-72 bg-secondary-50/80 border border-secondary-200 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between text-secondary-600">
                  <span>Sous-total HT :</span>
                  <span className="font-bold text-secondary-900">$ {selectedInvoice.subtotal.toLocaleString('fr-CA', { minimumFractionDigits: 2 })}</span>
                </div>

                {taxRes.gst > 0 && (
                  <div className="flex justify-between text-secondary-500">
                    <span>TPS (5.0%) :</span>
                    <span className="font-semibold text-secondary-800">$ {taxRes.gst.toLocaleString('fr-CA', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {taxRes.qst > 0 && (
                  <div className="flex justify-between text-secondary-500">
                    <span>TVQ (9.975%) :</span>
                    <span className="font-semibold text-secondary-800">$ {taxRes.qst.toLocaleString('fr-CA', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {taxRes.hst > 0 && (
                  <div className="flex justify-between text-secondary-500">
                    <span>TVH (13%) :</span>
                    <span className="font-semibold text-secondary-800">$ {taxRes.hst.toLocaleString('fr-CA', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="border-t border-secondary-200 pt-2 flex justify-between font-black text-sm text-secondary-900">
                  <span>TOTAL TTC :</span>
                  <span className="text-primary-700">$ {taxRes.total.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} {selectedInvoice.currency || 'CAD'}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="space-y-2 no-print">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                const clientObj = clients.find(c => c.name === selectedInvoice.clientName);
                setEmailRecipient(clientObj?.email || '');
                setShowEmailModal(true);
              }}
            >
              <Mail className="w-4 h-4" /> Envoyer par courriel
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={() => {
                downloadInvoicePdf({
                  invoiceId: selectedInvoice.id,
                  elementId: 'printable-invoice-content',
                  onStart: () => triggerToast('Génération du PDF professionnel en cours...'),
                  onSuccess: () => triggerToast('Facture PDF téléchargée avec succès !'),
                  onError: () => triggerToast('Impression de la facture seule lancée...')
                });
              }}
            >
              <Download className="w-4 h-4 text-secondary-600" /> Télécharger PDF
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => openEditInvoiceModal(selectedInvoice, e)}
              className="border border-secondary-200"
            >
              <Pencil className="w-3.5 h-3.5 text-secondary-500" /> Modifier
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDuplicateInvoice(selectedInvoice)}
              className="border border-secondary-200"
            >
              <Copy className="w-3.5 h-3.5 text-secondary-500" /> Dupliquer
            </Button>

            <Button
              variant="danger"
              size="sm"
              onClick={() => setInvoiceToDelete(selectedInvoice.id)}
            >
              <Trash2 className="w-3.5 h-3.5" /> Supprimer
            </Button>
          </div>
        </div>

        {/* EMAIL MODAL */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-secondary-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-white p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-secondary-100 pb-3">
                <h3 className="text-sm font-black text-secondary-900">Envoyer la facture par courriel</h3>
                <button onClick={() => setShowEmailModal(false)} className="text-secondary-400 hover:text-secondary-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <Input
                  label="Adresse courriel du destinataire"
                  type="email"
                  placeholder="client@domaine.ca"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-secondary-100">
                <Button variant="outline" size="sm" onClick={() => setShowEmailModal(false)}>
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setShowEmailModal(false);
                    triggerToast(`Facture ${selectedInvoice.id} envoyée avec succès à ${emailRecipient || 'votre client'} !`);
                  }}
                >
                  Envoyer
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // MAIN VIEW: INVOICES LIST PAGE
  // ==========================================
  return (
    <div className="flex-1 flex flex-col overflow-y-auto px-4 py-4 md:px-6 md:py-6 pb-20 max-w-6xl mx-auto w-full space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-secondary-200 pb-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-secondary-900 flex items-center gap-2 tracking-tight">
            <FileText className="w-6 h-6 text-primary-600" /> Factures
          </h1>
          <p className="text-xs text-secondary-500 font-medium mt-0.5">
            Suivi des factures clients, taxes canadiennes et encaissements.
          </p>
        </div>

        <Button
          id="btn-trigger-new-invoice"
          variant="primary"
          size="md"
          onClick={() => openNewInvoiceModal()}
          className="shadow-sm"
        >
          <Plus className="w-4 h-4" /> Nouvelle facture
        </Button>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <Input
            id="input-search-invoices-page"
            placeholder="Rechercher par numéro de facture ou nom de client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4 stroke-[1.75]" />}
          />
        </div>

        {/* Client filter select */}
        {clients.length > 0 && (
          <div className="w-full sm:w-56">
            <select
              value={selectedClientFilter}
              onChange={(e) => setSelectedClientFilter(e.target.value)}
              className="w-full text-xs bg-white border border-secondary-200 rounded-xl py-2 px-3 outline-none focus:border-primary-500 font-semibold text-secondary-700 transition"
            >
              <option value="">Tous les clients</option>
              {clients.map(cli => (
                <option key={cli.id} value={cli.name}>{cli.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(['Toutes', 'Envoyées', 'Payées', 'En retard', 'Brouillons'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusTab(tab)}
            className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl transition border whitespace-nowrap ${
              statusTab === tab
                ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                : 'bg-white text-secondary-600 border-secondary-200 hover:bg-secondary-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Invoices List / Table */}
      {filteredInvoices.length === 0 ? (
        <EmptyState
          id="empty-invoices"
          icon={<FileText className="w-7 h-7 stroke-[1.5]" />}
          title={searchQuery || selectedClientFilter ? "Aucune facture trouvée" : "Aucune facture"}
          description={
            searchQuery || selectedClientFilter
              ? "Aucune facture ne correspond à vos filtres actuels."
              : "Créez votre première facture professionnelle pour votre entreprise."
          }
          actionLabel="Nouvelle facture"
          onAction={() => openNewInvoiceModal()}
        />
      ) : (
        <div className="bg-white border border-secondary-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Scrollable Table View for all screen sizes */}
          <div className="max-h-[380px] md:max-h-[420px] overflow-y-auto overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px] md:min-w-full">
              <thead className="sticky top-0 z-10 bg-secondary-50 shadow-sm">
                <tr>
                  <th className="py-3 px-4 sticky top-0 bg-secondary-50 z-10 border-b border-secondary-200 text-secondary-500 font-bold uppercase text-[10px] tracking-wider">Numéro</th>
                  <th className="py-3 px-4 sticky top-0 bg-secondary-50 z-10 border-b border-secondary-200 text-secondary-500 font-bold uppercase text-[10px] tracking-wider">Client</th>
                  <th className="py-3 px-4 sticky top-0 bg-secondary-50 z-10 border-b border-secondary-200 text-secondary-500 font-bold uppercase text-[10px] tracking-wider">Date</th>
                  <th className="py-3 px-4 sticky top-0 bg-secondary-50 z-10 border-b border-secondary-200 text-secondary-500 font-bold uppercase text-[10px] tracking-wider">Échéance</th>
                  <th className="py-3 px-4 sticky top-0 bg-secondary-50 z-10 border-b border-secondary-200 text-secondary-500 font-bold uppercase text-[10px] tracking-wider">Statut</th>
                  <th className="py-3 px-4 sticky top-0 bg-secondary-50 z-10 border-b border-secondary-200 text-secondary-500 font-bold uppercase text-[10px] tracking-wider text-right">Montant ($)</th>
                  <th className="py-3 px-4 sticky top-0 bg-secondary-50 z-10 border-b border-secondary-200 text-secondary-500 font-bold uppercase text-[10px] tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => {
                      setSelectedInvoiceId(inv.id);
                      setScreen('invoice_detail');
                    }}
                    className="hover:bg-secondary-50/70 cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4 font-black text-secondary-900">{inv.id}</td>
                    <td className="py-3.5 px-4 font-bold text-secondary-800">{inv.clientName}</td>
                    <td className="py-3.5 px-4 text-secondary-500 font-medium">{inv.date}</td>
                    <td className="py-3.5 px-4 text-secondary-500 font-medium">{inv.dueDate || inv.date}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadgeClass(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-secondary-900">
                      $ {inv.total.toLocaleString('fr-CA', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={(e) => openEditInvoiceModal(inv, e)}
                          title="Modifier"
                        >
                          <Pencil className="w-3.5 h-3.5 text-secondary-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleDuplicateInvoice(inv)}
                          title="Dupliquer"
                        >
                          <Copy className="w-3.5 h-3.5 text-secondary-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => setInvoiceToDelete(inv.id)}
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-error-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: FORM CREATION / EDIT INVOICE */}
      {/* ========================================== */}
      {showModal && (
        <div className="fixed inset-0 bg-secondary-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl border-secondary-200 p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-secondary-100 pb-3 flex-shrink-0">
              <h3 className="text-sm font-black text-secondary-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-600" />
                {isEditing ? `Modifier Facture ${editingId}` : `Créer une Facture (${editingId})`}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-secondary-400 hover:text-secondary-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoiceSubmit} className="overflow-y-auto flex-1 space-y-4 pr-1 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-secondary-500 uppercase tracking-wider">
                    Client *
                  </label>
                  <select
                    value={invClientName}
                    onChange={(e) => setInvClientName(e.target.value)}
                    className="w-full text-xs bg-secondary-50/70 border border-secondary-200 rounded-xl py-2 px-3 outline-none focus:bg-white focus:border-primary-500 transition"
                  >
                    {clients.map((cli) => (
                      <option key={cli.id} value={cli.name}>{cli.name} {cli.company ? `(${cli.company})` : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-secondary-500 uppercase tracking-wider">
                    Province Fiscale (Taxes) *
                  </label>
                  <select
                    value={invProvince}
                    onChange={(e) => setInvProvince(e.target.value)}
                    className="w-full text-xs bg-secondary-50/70 border border-secondary-200 rounded-xl py-2 px-3 outline-none focus:bg-white focus:border-primary-500 transition"
                  >
                    <option value="Québec">Québec (TPS 5% + TVQ 9.975%)</option>
                    <option value="Ontario">Ontario (TVH 13%)</option>
                    <option value="Alberta">Alberta (TPS 5%)</option>
                    <option value="Colombie-Britannique">Colombie-Britannique (TPS 5% + PST 7%)</option>
                    <option value="Manitoba">Manitoba (TPS 5% + RST 7%)</option>
                    <option value="Saskatchewan">Saskatchewan (TPS 5% + PST 6%)</option>
                    <option value="Nouvelle-Écosse">Nouvelle-Écosse (TVH 14%)</option>
                    <option value="Nouveau-Brunswick">Nouveau-Brunswick (TVH 15%)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Date d'émission"
                  type="date"
                  value={invDate}
                  onChange={(e) => setInvDate(e.target.value)}
                />

                <Input
                  label="Date d'échéance"
                  type="date"
                  value={invDueDate}
                  onChange={(e) => setInvDueDate(e.target.value)}
                />

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-secondary-500 uppercase tracking-wider">
                    Statut
                  </label>
                  <select
                    value={invStatus}
                    onChange={(e) => setInvStatus(e.target.value as InvoiceStatus)}
                    className="w-full text-xs bg-secondary-50/70 border border-secondary-200 rounded-xl py-2 px-3 outline-none focus:bg-white focus:border-primary-500 transition"
                  >
                    <option value="Envoyée">Envoyée</option>
                    <option value="Brouillon">Brouillon</option>
                    <option value="Payée">Payée</option>
                    <option value="En retard">En retard</option>
                  </select>
                </div>
              </div>

              {/* Items Table Lines */}
              <div className="space-y-2 pt-2 border-t border-secondary-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-secondary-500 uppercase tracking-wider block">
                      Produits et services
                    </span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-200">
                      Module 4
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowQuickAddProduct(!showQuickAddProduct)}
                      className="text-[10px] font-bold text-primary-600 hover:text-primary-800 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Nouveau produit / service
                    </button>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={handleAddItemLine}
                    >
                      <Plus className="w-3 h-3" /> Ajouter une ligne
                    </Button>
                  </div>
                </div>

                {/* Quick Add Product Inline Banner if toggled */}
                {showQuickAddProduct && (
                  <div className="bg-primary-50/70 border border-primary-200 rounded-xl p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-primary-900 flex items-center gap-1 text-[11px]">
                        <Package className="w-3.5 h-3.5 text-primary-600" /> Ajouter rapidement au Module 4
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setShowQuickAddProduct(false)}
                        className="text-secondary-400 hover:text-secondary-700 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Nom du produit ou service *"
                        value={quickProdName}
                        onChange={(e) => setQuickProdName(e.target.value)}
                        className="bg-white border border-secondary-200 rounded-lg py-1 px-2.5 outline-none focus:border-primary-500 text-xs"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Prix unitaire ($) *"
                        value={quickProdPrice}
                        onChange={(e) => setQuickProdPrice(e.target.value)}
                        className="bg-white border border-secondary-200 rounded-lg py-1 px-2.5 outline-none focus:border-primary-500 text-xs"
                      />
                      <div className="flex gap-1.5">
                        <select
                          value={quickProdCategory}
                          onChange={(e) => setQuickProdCategory(e.target.value)}
                          className="bg-white border border-secondary-200 rounded-lg py-1 px-2 outline-none text-xs flex-1"
                        >
                          <option value="Service">Service</option>
                          <option value="Consultation">Consultation</option>
                          <option value="Produit">Produit</option>
                          <option value="Forfait">Forfait</option>
                        </select>
                        <button
                          type="button"
                          onClick={handleCreateQuickProduct}
                          className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-2.5 py-1 rounded-lg text-xs"
                        >
                          Enregistrer
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2.5">
                  {invItems.map((item, index) => (
                    <div key={index} className="bg-secondary-50/70 p-2.5 rounded-xl border border-secondary-200/80 space-y-2">
                      {/* Product Selector Dropdown linked to Module 4 */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <select
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '_new_product') {
                                setShowQuickAddProduct(true);
                              } else if (val) {
                                const prod = activeProducts.find(p => p.id === val);
                                if (prod) {
                                  handleItemChange(index, 'description', prod.name + (prod.description ? ` - ${prod.description}` : ''));
                                  handleItemChange(index, 'unitPrice', prod.unitPrice);
                                }
                              }
                            }}
                            defaultValue=""
                            className="w-full text-xs bg-white border border-primary-200/90 text-secondary-800 font-semibold rounded-lg py-1.5 px-2.5 outline-none focus:border-primary-500 shadow-2xs"
                          >
                            <option value="">Sélectionner un produit / service depuis le Module 4...</option>
                            {activeProducts.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} — {p.unitPrice.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $ {p.unit ? `(${p.unit})` : ''}
                              </option>
                            ))}
                            <option value="_new_product" className="text-primary-700 font-bold">
                              + Créer un nouveau produit / service...
                            </option>
                          </select>
                        </div>
                        {invItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemLine(index)}
                            className="text-error-500 hover:text-error-700 p-1 rounded hover:bg-error-50 transition"
                            title="Supprimer la ligne"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Line inputs: Description, Quantity, Unit Price, Total */}
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5">
                          <input
                            type="text"
                            placeholder="Description du produit ou prestation..."
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            className="w-full text-xs bg-white border border-secondary-200 rounded-lg py-1.5 px-2.5 outline-none focus:border-primary-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            min="1"
                            placeholder="Qté"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="w-full text-xs bg-white border border-secondary-200 rounded-lg py-1.5 px-2 outline-none focus:border-primary-500 text-center"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Prix ($)"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                            className="w-full text-xs bg-white border border-secondary-200 rounded-lg py-1.5 px-2 outline-none focus:border-primary-500 text-right"
                          />
                        </div>
                        <div className="col-span-3 text-right font-black text-xs text-secondary-900">
                          $ {item.total.toLocaleString('fr-CA', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="bg-secondary-50 border border-secondary-200 rounded-xl p-3 space-y-1.5 text-xs text-secondary-700">
                <div className="flex justify-between">
                  <span>Sous-total HT :</span>
                  <span className="font-bold">$ {computedSubtotal.toLocaleString('fr-CA', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-secondary-500">
                  <span>Taxes estimées ({invProvince}) :</span>
                  <span className="font-semibold">$ {taxCalculation.totalTax.toLocaleString('fr-CA', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t border-secondary-200 pt-1.5 flex justify-between font-black text-sm text-secondary-900">
                  <span>Total Facture :</span>
                  <span className="text-primary-700">$ {taxCalculation.total.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} CAD</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-secondary-100 flex-shrink-0">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  {isEditing ? 'Mettre à jour' : 'Enregistrer la facture'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Invoice Confirm Modal */}
      <ConfirmModal
        isOpen={!!invoiceToDelete}
        title="Supprimer la facture"
        message={`Êtes-vous sûr de vouloir supprimer définitivement la facture ${invoiceToDelete} ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={() => {
          if (invoiceToDelete) {
            onDeleteInvoice(invoiceToDelete);
            triggerToast(`Facture ${invoiceToDelete} supprimée avec succès`);
            setInvoiceToDelete(null);
            if (currentScreen === 'invoice_detail') {
              setScreen('invoices');
            }
          }
        }}
        onCancel={() => setInvoiceToDelete(null)}
      />

      {/* Reset Payment Status Confirm Modal */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Réinitialiser le paiement"
        message="Voulez-vous réinitialiser le statut de cette facture à 'Envoyée' (remise du solde dû à 100%) ?"
        confirmLabel="Réinitialiser"
        cancelLabel="Annuler"
        variant="warning"
        onConfirm={() => {
          if (selectedInvoice) {
            onUpdateInvoiceStatus(selectedInvoice.id, 'Envoyée');
            setPaymentOption('total');
            setCustomAmountPaid('0');
            triggerToast("Statut de la facture réinitialisé.");
          }
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
}
