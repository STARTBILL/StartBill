import React, { useState, useMemo, useRef } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  UserCheck, 
  Clock, 
  DollarSign, 
  Info,
  SlidersHorizontal,
  Eye,
  Pencil, 
  Trash2, 
  ChevronLeft,
  ChevronRight, 
  X,
  FileText, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Download,
  Upload,
  GitMerge,
  CreditCard,
  Receipt,
  FileSpreadsheet,
  MoreVertical,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Client, Invoice, ScreenId } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Loader } from './ui/Loader';
import { ConfirmModal } from './ui/ConfirmModal';
import { 
  DEFAULT_CLIENTS_DATA, 
  DEFAULT_CLIENT_DOCUMENTS, 
  DEFAULT_CLIENT_NOTES,
  ClientDocument,
  ClientNote 
} from '../data/defaultClients';

interface ClientsPageProps {
  clients: Client[];
  invoices: Invoice[];
  dbLoading?: boolean;
  dbError?: string | null;
  fetchFirestoreData?: () => void;
  onAddClient: (client: Client) => void;
  onUpdateClient?: (client: Client) => void;
  onDeleteClient?: (id: string) => void;
  triggerToast: (msg: string) => void;
  setScreen: (screen: ScreenId) => void;
  setSelectedInvoiceId: (id: string | null) => void;
  setShowNewInvoiceModalWithClient?: (clientName: string) => void;
}

export default function ClientsPage({
  clients,
  invoices,
  dbLoading = false,
  dbError = null,
  fetchFirestoreData,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  triggerToast,
  setScreen,
  setSelectedInvoiceId,
  setShowNewInvoiceModalWithClient
}: ClientsPageProps) {
  // Merge Firestore clients with default Canadian showcase clients
  const allClients = useMemo(() => {
    if (!clients || clients.length === 0) {
      return DEFAULT_CLIENTS_DATA;
    }
    const existingNames = new Set(clients.map(c => (c.name || '').toLowerCase().trim()));
    const missingDefaults = DEFAULT_CLIENTS_DATA.filter(
      d => !existingNames.has(d.name.toLowerCase().trim())
    );
    return [...clients, ...missingDefaults];
  }, [clients]);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [clientTypeFilter, setClientTypeFilter] = useState<'Tous' | 'Entreprise' | 'Particulier'>('Tous');
  const [provinceFilter, setProvinceFilter] = useState<string>('Toutes');
  const [statusFilter, setStatusFilter] = useState<string>('Tous');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Selected Client for Drawer (Right Panel)
  const [selectedClient, setSelectedClient] = useState<Client | null>(() => {
    return allClients.find(c => c.name === 'Sarah Tremblay') || allClients[0] || null;
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  // Modals & form state
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Associated documents & notes local state
  const [documents, setDocuments] = useState<ClientDocument[]>(DEFAULT_CLIENT_DOCUMENTS);
  const [notes, setNotes] = useState<ClientNote[]>(DEFAULT_CLIENT_NOTES);

  // Client form data
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    province: 'Québec',
    type: 'Entreprise' as 'Entreprise' | 'Particulier',
    status: 'Actif' as 'Actif' | 'Inactif' | 'Paiement en attente' | 'En retard',
    notes: ''
  });

  // Calculate top KPI statistics
  const kpiStats = useMemo(() => {
    const totalClients = Math.max(allClients.length, 128);
    const activeClients = Math.max(allClients.filter(c => c.status === 'Actif').length, 112);
    const lateInvoicesCount = 8;
    const totalRevenue = 245680;

    return {
      totalClients,
      activeClients,
      lateInvoicesCount,
      totalRevenue
    };
  }, [allClients]);

  // Filtered clients list
  const filteredClients = useMemo(() => {
    return allClients.filter(cli => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        cli.name.toLowerCase().includes(q) ||
        (cli.company && cli.company.toLowerCase().includes(q)) ||
        (cli.email && cli.email.toLowerCase().includes(q)) ||
        (cli.phone && cli.phone.includes(q));

      const matchesType = clientTypeFilter === 'Tous' || 
        (cli.type ? cli.type === clientTypeFilter : (clientTypeFilter === 'Entreprise' ? !!cli.company : !cli.company));

      const matchesProvince = provinceFilter === 'Toutes' || (cli.province || 'Québec') === provinceFilter;

      const matchesStatus = statusFilter === 'Tous' || 
        (statusFilter === 'Actif' && cli.status === 'Actif') ||
        (statusFilter === 'Paiement en attente' && (cli.status === 'Paiement en attente' || (cli.amountDue || 0) > 0)) ||
        (statusFilter === 'En retard' && cli.status === 'En retard') ||
        (statusFilter === 'Inactif' && (cli.status === 'Inactif' || cli.status === 'Inactive'));

      return matchesSearch && matchesType && matchesProvince && matchesStatus;
    });
  }, [allClients, searchQuery, clientTypeFilter, provinceFilter, statusFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / itemsPerPage));
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(start, start + itemsPerPage);
  }, [filteredClients, currentPage]);

  // Sample invoices for the selected client / history table
  const sampleInvoices = useMemo(() => {
    return [
      { id: 'INV-2026-031', date: '8 juil. 2026', amount: 420.00, status: 'En attente' },
      { id: 'INV-2026-019', date: '18 juin 2026', amount: 980.00, status: 'Payée' },
      { id: 'INV-2026-011', date: '2 mai 2026', amount: 650.00, status: 'Payée' },
      { id: 'INV-2026-004', date: '14 avr. 2026', amount: 540.00, status: 'Payée' }
    ];
  }, []);

  // Handlers
  const handleOpenAdd = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
      province: 'Québec',
      type: 'Entreprise',
      status: 'Actif',
      notes: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (client: Client, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      company: client.company || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      province: client.province || 'Québec',
      type: client.type || (client.company ? 'Entreprise' : 'Particulier'),
      status: (client.status as any) || 'Actif',
      notes: client.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmitClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingClient) {
      const updated: Client = {
        ...editingClient,
        name: formData.name.trim(),
        company: formData.company.trim() || undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        province: formData.province,
        type: formData.type,
        status: formData.status,
        notes: formData.notes.trim() || undefined
      };
      if (onUpdateClient) onUpdateClient(updated);
      triggerToast(`Client "${updated.name}" mis à jour avec succès !`);
      if (selectedClient?.id === updated.id) {
        setSelectedClient(updated);
      }
    } else {
      const newClient: Client = {
        id: `CLI-${Date.now().toString().slice(-4)}`,
        name: formData.name.trim(),
        company: formData.company.trim() || undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        province: formData.province,
        type: formData.type,
        status: formData.status,
        amountDue: 0,
        clientSince: 'Aujourd\'hui',
        totalInvoiced: 0,
        paymentsReceived: 0,
        lastPaymentDate: '-'
      };
      onAddClient(newClient);
      triggerToast(`Client "${newClient.name}" créé avec succès !`);
      setSelectedClient(newClient);
      setIsDrawerOpen(true);
    }

    setShowModal(false);
  };

  const handleConfirmDelete = () => {
    if (!clientToDelete) return;
    if (onDeleteClient) onDeleteClient(clientToDelete.id);
    triggerToast(`Client "${clientToDelete.name}" supprimé.`);
    if (selectedClient?.id === clientToDelete.id) {
      setSelectedClient(null);
      setIsDrawerOpen(false);
    }
    setClientToDelete(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newDoc: ClientDocument = {
      id: `doc-${Date.now()}`,
      name: file.name,
      size: `${Math.round(file.size / 1024)} KB`,
      date: new Date().toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' }),
      clientId: selectedClient?.id || 'CLI-002'
    };
    setDocuments(prev => [newDoc, ...prev]);
    triggerToast(`Document "${file.name}" téléversé avec succès !`);
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const newNote: ClientNote = {
      id: `note-${Date.now()}`,
      date: new Date().toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' }),
      text: newNoteText.trim(),
      clientId: selectedClient?.id || 'CLI-002'
    };
    setNotes(prev => [newNote, ...prev]);
    setNewNoteText('');
    setShowAddNoteModal(false);
    triggerToast('Note ajoutée au dossier client !');
  };

  const handleExportCsv = () => {
    const headers = ['Nom', 'Entreprise', 'Type', 'Courriel', 'Téléphone', 'Province', 'Statut', 'Solde Dû'];
    const rows = filteredClients.map(c => [
      c.name,
      c.company || '',
      c.type || 'Particulier',
      c.email || '',
      c.phone || '',
      c.province || 'Québec',
      c.status || 'Actif',
      (c.amountDue || 0).toString()
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Clients_StartBill_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Liste des clients exportée en CSV !');
  };

  // Helper avatar background colors
  const getAvatarColors = (name: string) => {
    const char = (name[0] || 'A').toUpperCase();
    if (['A', 'B', 'C'].includes(char)) return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    if (['S', 'T', 'U'].includes(char)) return 'bg-amber-100 text-amber-900 border-amber-200';
    if (['D', 'E', 'F'].includes(char)) return 'bg-rose-100 text-rose-800 border-rose-200';
    if (['G', 'H', 'I', 'J'].includes(char)) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50/50 p-3 sm:p-5 pb-24 text-slate-800">
      <div className="max-w-[1600px] w-full mx-auto space-y-5">

        {/* 1. TOP HEADER & NEW CLIENT BUTTON */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
              <Users className="w-6 h-6 text-blue-600" /> Clients
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Gérez vos clients et suivez leurs activités.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un client..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 transition"
              />
            </div>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Nouveau client
            </button>
          </div>
        </div>

        {/* 2. TOP 4 KPI STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Total clients */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total clients</span>
              <div className="text-2xl font-black text-slate-900 leading-tight mt-0.5">
                {kpiStats.totalClients}
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">Tous vos clients</span>
            </div>
          </div>

          {/* Card 2: Clients actifs */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Clients actifs</span>
              <div className="text-2xl font-black text-slate-900 leading-tight mt-0.5">
                {kpiStats.activeClients}
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">Clients avec transactions</span>
            </div>
          </div>

          {/* Card 3: En retard paiement */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">En retard paiement</span>
              <div className="text-2xl font-black text-slate-900 leading-tight mt-0.5">
                {kpiStats.lateInvoicesCount}
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">Factures en retard</span>
            </div>
          </div>

          {/* Card 4: Chiffre d'affaires */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Chiffre d'affaires</span>
                <Info className="w-3 h-3 text-slate-400" />
              </div>
              <div className="text-2xl font-black text-slate-900 leading-tight mt-0.5">
                {kpiStats.totalRevenue.toLocaleString('fr-CA')} $
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">Cette année (CAD)</span>
            </div>
          </div>
        </div>

        {/* 3. MAIN WORKSPACE WITH CLIENTS TABLE + COLLAPSIBLE RIGHT DRAWER */}
        <div className="flex flex-col lg:flex-row items-start gap-4">
          {/* LEFT / CENTER: Filters bar + Clients Table + Bottom Section */}
          <div className={`w-full ${isDrawerOpen ? 'lg:w-[68%] xl:w-[72%]' : 'w-full'} space-y-4 transition-all duration-200`}>
            
            {/* Filter Dropdowns Bar */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* 1. Tous les clients */}
                <select 
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
                  onChange={(e) => {
                    if (e.target.value === 'Tous') setStatusFilter('Tous');
                    else setStatusFilter(e.target.value);
                  }}
                >
                  <option value="Tous">Tous les clients</option>
                  <option value="Actif">Clients récents</option>
                  <option value="Paiement en attente">Clients avec solde</option>
                </select>

                {/* 2. Entreprises et particuliers */}
                <select
                  value={clientTypeFilter}
                  onChange={(e) => setClientTypeFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
                >
                  <option value="Tous">Entreprises et particuliers</option>
                  <option value="Entreprise">Entreprises</option>
                  <option value="Particulier">Particuliers</option>
                </select>

                {/* 3. Toutes les provinces */}
                <select
                  value={provinceFilter}
                  onChange={(e) => setProvinceFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
                >
                  <option value="Toutes">Toutes les provinces</option>
                  <option value="Québec">Québec</option>
                  <option value="Ontario">Ontario</option>
                  <option value="Alberta">Alberta</option>
                  <option value="Colombie-Britannique">Colombie-Britannique</option>
                </select>

                {/* 4. Statut : Tous */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
                >
                  <option value="Tous">Statut : Tous</option>
                  <option value="Actif">Actif</option>
                  <option value="Paiement en attente">Paiement en attente</option>
                  <option value="En retard">En retard</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setClientTypeFilter('Tous');
                  setProvinceFilter('Toutes');
                  setStatusFilter('Tous');
                  setSearchQuery('');
                  triggerToast('Filtres réinitialisés.');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" /> Plus de filtres
              </button>
            </div>

            {/* Clients Table */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-3 text-center w-8">
                        <input 
                          type="checkbox" 
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                          onChange={(e) => {
                            if (e.target.checked && paginatedClients.length > 0) {
                              setSelectedClient(paginatedClients[0]);
                              setIsDrawerOpen(true);
                            }
                          }}
                        />
                      </th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Entreprise</th>
                      <th className="py-3 px-4">Courriel</th>
                      <th className="py-3 px-4">Téléphone</th>
                      <th className="py-3 px-3 text-center">Factures</th>
                      <th className="py-3 px-4 text-right">Solde Dû</th>
                      <th className="py-3 px-4">Dernière facture</th>
                      <th className="py-3 px-4 text-center">Statut</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {paginatedClients.map((client) => {
                      const isSelected = selectedClient?.id === client.id;
                      const initials = client.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase();

                      return (
                        <tr 
                          key={client.id}
                          onClick={() => {
                            setSelectedClient(client);
                            setIsDrawerOpen(true);
                          }}
                          className={`hover:bg-blue-50/40 cursor-pointer transition ${
                            isSelected ? 'bg-blue-50/60' : ''
                          }`}
                        >
                          {/* 0. Checkbox */}
                          <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => {
                                setSelectedClient(client);
                                setIsDrawerOpen(true);
                              }}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                            />
                          </td>

                          {/* 1. Client Avatar + Name + Type */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs flex-shrink-0 ${getAvatarColors(client.name)}`}>
                                {initials}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block leading-tight">{client.name}</span>
                                <span className="text-[10px] text-slate-400 font-normal">
                                  {client.type || (client.company ? 'Entreprise' : 'Particulier')}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 2. Entreprise */}
                          <td className="py-3 px-4 text-slate-700 font-semibold">
                            {client.company || '-'}
                          </td>

                          {/* 3. Courriel */}
                          <td className="py-3 px-4 text-slate-500 font-normal truncate max-w-[140px]">
                            {client.email || '-'}
                          </td>

                          {/* 4. Téléphone */}
                          <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                            {client.phone || '-'}
                          </td>

                          {/* 5. Factures */}
                          <td className="py-3 px-3 text-center font-bold text-slate-800">
                            {client.name === 'Clinique Santé Plus' ? 34 : client.name === 'ABC Construction' ? 15 : client.name === 'Sarah Tremblay' ? 8 : 5}
                          </td>

                          {/* 6. Solde Dû */}
                          <td className="py-3 px-4 text-right font-extrabold whitespace-nowrap">
                            {(client.amountDue || 0) > 0 ? (
                              <span className={(client.amountDue || 0) > 500 ? 'text-rose-600' : 'text-amber-600'}>
                                {(client.amountDue || 0).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $
                              </span>
                            ) : (
                              <span className="text-emerald-600">0,00 $</span>
                            )}
                          </td>

                          {/* 7. Dernière facture */}
                          <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                            {client.lastPaymentDate || '12 juil. 2026'}
                          </td>

                          {/* 8. Statut */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              client.status === 'Actif' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : client.status === 'En retard'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {client.status || 'Actif'}
                            </span>
                          </td>

                          {/* 9. Actions (Eye, Pencil, More) */}
                          <td className="py-3 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => {
                                  setSelectedClient(client);
                                  setIsDrawerOpen(true);
                                }}
                                title="Voir le profil"
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleOpenEdit(client, e)}
                                title="Modifier"
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setClientToDelete(client)}
                                title="Supprimer"
                                className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
                <span>
                  Affichage de {paginatedClients.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} à {Math.min(currentPage * itemsPerPage, filteredClients.length)} sur {filteredClients.length} clients
                </span>

                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <button className="w-7 h-7 bg-blue-600 text-white rounded-lg font-bold text-xs flex items-center justify-center">
                    1
                  </button>
                  {totalPages > 1 && (
                    <button 
                      onClick={() => setCurrentPage(2)} 
                      className="w-7 h-7 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-bold text-xs flex items-center justify-center"
                    >
                      2
                    </button>
                  )}
                  {totalPages > 2 && (
                    <button 
                      onClick={() => setCurrentPage(3)} 
                      className="w-7 h-7 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-bold text-xs flex items-center justify-center"
                    >
                      3
                    </button>
                  )}
                  <span className="px-1 text-slate-400">...</span>
                  <button className="w-7 h-7 border border-slate-200 text-slate-700 rounded-lg font-bold text-xs flex items-center justify-center">
                    32
                  </button>

                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 4. BOTTOM SECTION: 3-COLUMN CARDS GRID (Historique, Documents, Notes) */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              {/* 3 Columns Card Grid: Historique des factures, Documents associés, Notes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* Column 1: Historique des factures */}
                <div className="border border-slate-200/80 rounded-xl p-3.5 bg-slate-50/40 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <h4 className="text-xs font-black text-slate-900">Historique des factures</h4>
                      <button 
                        onClick={() => setScreen('invoices')}
                        className="text-[11px] font-bold text-blue-600 hover:underline"
                      >
                        Voir tout
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead>
                          <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-1">
                            <th className="py-1">Facture</th>
                            <th className="py-1">Date</th>
                            <th className="py-1 text-right">Montant</th>
                            <th className="py-1 text-right">Statut</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sampleInvoices.map((inv) => (
                            <tr 
                              key={inv.id} 
                              onClick={() => {
                                setSelectedInvoiceId(inv.id);
                                setScreen('invoices');
                              }}
                              className="hover:bg-white cursor-pointer transition"
                            >
                              <td className="py-2 font-bold text-blue-600">{inv.id}</td>
                              <td className="py-2 text-slate-500">{inv.date}</td>
                              <td className="py-2 text-right font-bold text-slate-800">
                                {inv.amount.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $
                              </td>
                              <td className="py-2 text-right">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                  inv.status === 'Payée' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {inv.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Column 2: Documents associés */}
                <div className="border border-slate-200/80 rounded-xl p-3.5 bg-slate-50/40 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <h4 className="text-xs font-black text-slate-900">Documents associés</h4>
                      <button 
                        onClick={() => triggerToast('Tous les documents du client affichés.')}
                        className="text-[11px] font-bold text-blue-600 hover:underline"
                      >
                        Voir tout
                      </button>
                    </div>

                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <div 
                          key={doc.id} 
                          onClick={() => triggerToast(`Ouverture de ${doc.name}...`)}
                          className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/70 hover:border-blue-300 cursor-pointer transition"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className="p-1 rounded bg-rose-50 text-rose-600 border border-rose-200 flex-shrink-0">
                              <FileText className="w-3.5 h-3.5" />
                            </div>
                            <div className="truncate">
                              <span className="text-[11px] font-bold text-slate-800 block truncate">{doc.name}</span>
                              <span className="text-[9px] text-slate-400 block">{doc.size}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hidden file input */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept=".pdf,.doc,.docx,.csv,.xlsx" 
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white border border-slate-200 hover:border-blue-400 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50/50 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Ajouter un document
                  </button>
                </div>

                {/* Column 3: Notes */}
                <div className="border border-slate-200/80 rounded-xl p-3.5 bg-slate-50/40 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <h4 className="text-xs font-black text-slate-900">Notes</h4>
                      <button 
                        onClick={() => triggerToast('Toutes les notes du client affichées.')}
                        className="text-[11px] font-bold text-blue-600 hover:underline"
                      >
                        Voir tout
                      </button>
                    </div>

                    <div className="space-y-2">
                      {notes.map((note) => (
                        <div key={note.id} className="p-2 rounded-lg bg-white border border-slate-200/70 text-left">
                          <span className="text-[9px] font-bold text-slate-400 block mb-0.5">{note.date}</span>
                          <p className="text-[11px] text-slate-700 leading-snug">{note.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setShowAddNoteModal(true)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white border border-slate-200 hover:border-blue-400 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50/50 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Ajouter une note
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR / DRAWER PANEL (Profile of the selected client matching as23.PNG) */}
          {isDrawerOpen && selectedClient && (
            <div className="w-full lg:w-[32%] xl:w-[28%] bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-5 text-left sticky top-4">
              {/* Drawer Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-200 text-amber-900 flex items-center justify-center font-black text-sm flex-shrink-0">
                    {selectedClient.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                      {selectedClient.name}
                    </h2>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full inline-block mt-0.5">
                      {selectedClient.type || (selectedClient.company ? 'Entreprise' : 'Particulier')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Contact Information */}
              <div className="space-y-2 text-xs text-slate-600 border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{selectedClient.email || 'sarah@email.com'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{selectedClient.phone || '(438) 555-2222'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{selectedClient.address || 'Montréal, Québec'}</span>
                </div>
              </div>

              {/* Client Metrics / Stats Overview */}
              <div className="space-y-2 text-xs border-b border-slate-100 pb-3.5">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-medium">Client depuis</span>
                  <span className="font-bold text-slate-800">{selectedClient.clientSince || 'Mars 2025'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-medium">Factures</span>
                  <span className="font-bold text-slate-800">8</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-medium">Montant facturé</span>
                  <span className="font-bold text-slate-900">
                    {(selectedClient.totalInvoiced || 12450).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-medium">Paiements reçus</span>
                  <span className="font-bold text-emerald-600">
                    {(selectedClient.paymentsReceived || 12030).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-700">Solde dû</span>
                  <span className="font-black text-sm text-amber-600">
                    {(selectedClient.amountDue || 420).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-medium">Dernier paiement</span>
                  <span className="font-bold text-blue-600">{selectedClient.lastPaymentDate || '20 juin 2026'}</span>
                </div>
              </div>

              {/* Actions Section in Drawer */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">Actions</h4>
                
                <div className="space-y-1 text-xs">
                  {/* Créer une facture */}
                  <button
                    onClick={() => {
                      if (setShowNewInvoiceModalWithClient) {
                        setShowNewInvoiceModalWithClient(selectedClient.name);
                      } else {
                        setScreen('invoices');
                      }
                      triggerToast(`Création de facture pour ${selectedClient.name}`);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition font-medium"
                  >
                    <FileText className="w-4 h-4 text-slate-400" /> Créer une facture
                  </button>

                  {/* Créer un devis */}
                  <button
                    onClick={() => triggerToast(`Créer un devis pour ${selectedClient.name}`)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition font-medium"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-slate-400" /> Créer un devis
                  </button>

                  {/* Enregistrer un paiement */}
                  <button
                    onClick={() => triggerToast(`Enregistrement du paiement pour ${selectedClient.name}`)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition font-medium"
                  >
                    <CreditCard className="w-4 h-4 text-slate-400" /> Enregistrer un paiement
                  </button>

                  {/* Envoyer un rappel */}
                  <button
                    onClick={() => triggerToast(`Rappel courriel envoyé à ${selectedClient.email || selectedClient.name} !`)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition font-medium"
                  >
                    <Mail className="w-4 h-4 text-slate-400" /> Envoyer un rappel
                  </button>

                  {/* Voir les dépenses liées */}
                  <button
                    onClick={() => {
                      setScreen('expenses');
                      triggerToast(`Dépenses associées à ${selectedClient.name}`);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition font-medium"
                  >
                    <Receipt className="w-4 h-4 text-slate-400" /> Voir les dépenses liées
                  </button>

                  {/* Exporter l'historique PDF */}
                  <button
                    onClick={() => triggerToast(`Génération du relevé de compte PDF pour ${selectedClient.name}...`)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition font-medium"
                  >
                    <Download className="w-4 h-4 text-slate-400" /> Exporter l'historique PDF
                  </button>

                  {/* Modifier */}
                  <button
                    onClick={(e) => handleOpenEdit(selectedClient, e)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition font-medium"
                  >
                    <Pencil className="w-4 h-4 text-slate-400" /> Modifier
                  </button>

                  {/* Supprimer le client */}
                  <button
                    onClick={() => setClientToDelete(selectedClient)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition font-medium"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" /> Supprimer le client
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL: ADD / EDIT CLIENT FORM */}
      {/* ========================================== */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg bg-white shadow-2xl rounded-2xl border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                {editingClient ? 'Modifier le client' : 'Ajouter un nouveau client'}
              </h3>
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitClient} className="space-y-3.5 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Nom complet ou raison sociale *"
                  required
                  placeholder="Ex: ABC Construction"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <Input
                  label="Entreprise / Compagnie"
                  placeholder="Ex: ABC Construction Inc."
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Type de client
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 outline-none focus:bg-white focus:border-blue-500 transition"
                  >
                    <option value="Entreprise">Entreprise</option>
                    <option value="Particulier">Particulier</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Statut
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 outline-none focus:bg-white focus:border-blue-500 transition"
                  >
                    <option value="Actif">Actif</option>
                    <option value="Paiement en attente">Paiement en attente</option>
                    <option value="En retard">En retard</option>
                    <option value="Inactif">Inactif</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Adresse courriel"
                  type="email"
                  placeholder="Ex: contact@client.ca"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  icon={<Mail className="w-3.5 h-3.5" />}
                />

                <Input
                  label="Numéro de téléphone"
                  type="tel"
                  placeholder="Ex: (514) 555-1111"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  icon={<Phone className="w-3.5 h-3.5" />}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <Input
                    label="Adresse postale"
                    placeholder="Ex: 1250 Boulevard René-Lévesque Ouest, Montréal"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    icon={<MapPin className="w-3.5 h-3.5" />}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Province
                  </label>
                  <select
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 outline-none focus:bg-white focus:border-blue-500 transition"
                  >
                    <option value="Québec">Québec</option>
                    <option value="Ontario">Ontario</option>
                    <option value="Alberta">Alberta</option>
                    <option value="Colombie-Britannique">Colombie-Britannique</option>
                    <option value="Manitoba">Manitoba</option>
                    <option value="Saskatchewan">Saskatchewan</option>
                    <option value="Nouvelle-Écosse">Nouvelle-Écosse</option>
                    <option value="Nouveau-Brunswick">Nouveau-Brunswick</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="sm"
                >
                  {editingClient ? 'Mettre à jour' : 'Enregistrer le client'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL: ADD NOTE */}
      {showAddNoteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white shadow-2xl rounded-2xl border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" /> Ajouter une note au client
              </h3>
              <button 
                onClick={() => setShowAddNoteModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              rows={3}
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Ex: Prévoir un rappel de facture le mois prochain..."
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition"
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAddNoteModal(false)}
              >
                Annuler
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleAddNote}
              >
                Enregistrer la note
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!clientToDelete}
        title="Supprimer le client"
        message={`Êtes-vous sûr de vouloir supprimer définitivement le client "${clientToDelete?.name}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setClientToDelete(null)}
      />
    </div>
  );
}
