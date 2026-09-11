import { Client } from '../types';

export interface ClientDocument {
  id: string;
  name: string;
  size: string;
  date: string;
  clientId: string;
}

export interface ClientNote {
  id: string;
  date: string;
  text: string;
  clientId: string;
}

export const DEFAULT_CLIENTS_DATA: Client[] = [
  {
    id: 'CLI-001',
    name: 'ABC Construction',
    company: 'ABC Construction Inc.',
    email: 'contact@abc.ca',
    phone: '(514) 555-1111',
    address: '1250 Boulevard René-Lévesque Ouest, Montréal',
    province: 'Québec',
    status: 'Actif',
    type: 'Entreprise',
    amountDue: 0,
    clientSince: 'Janvier 2024',
    totalInvoiced: 18950.00,
    paymentsReceived: 18950.00,
    lastPaymentDate: '12 juil. 2026'
  },
  {
    id: 'CLI-002',
    name: 'Sarah Tremblay',
    company: '',
    email: 'sarah@email.com',
    phone: '(438) 555-2222',
    address: 'Montréal, Québec',
    province: 'Québec',
    status: 'Paiement en attente',
    type: 'Particulier',
    amountDue: 420.00,
    clientSince: 'Mars 2025',
    totalInvoiced: 12450.00,
    paymentsReceived: 12030.00,
    lastPaymentDate: '20 juin 2026'
  },
  {
    id: 'CLI-003',
    name: 'Clinique Santé Plus',
    company: 'Santé Plus',
    email: 'admin@santeplus.ca',
    phone: '(450) 555-8888',
    address: '450 Rue Saint-Charles Ouest, Longueuil',
    province: 'Québec',
    status: 'Actif',
    type: 'Entreprise',
    amountDue: 0,
    clientSince: 'Septembre 2023',
    totalInvoiced: 34200.00,
    paymentsReceived: 34200.00,
    lastPaymentDate: '5 juil. 2026'
  },
  {
    id: 'CLI-004',
    name: 'Design Nova',
    company: 'Design Nova',
    email: 'info@nova.ca',
    phone: '(819) 555-3333',
    address: '88 Rue Principale, Gatineau',
    province: 'Québec',
    status: 'En retard',
    type: 'Entreprise',
    amountDue: 1240.00,
    clientSince: 'Juin 2024',
    totalInvoiced: 8650.00,
    paymentsReceived: 7410.00,
    lastPaymentDate: '2 juil. 2026'
  }
];

export const DEFAULT_CLIENT_DOCUMENTS: ClientDocument[] = [
  {
    id: 'doc-1',
    name: 'Contrat_SarahTremblay.pdf',
    size: '245 KB',
    date: '10 mars 2025',
    clientId: 'CLI-002'
  },
  {
    id: 'doc-2',
    name: 'Soumission acceptée.pdf',
    size: '120 KB',
    date: '15 avril 2026',
    clientId: 'CLI-002'
  },
  {
    id: 'doc-3',
    name: 'Conditions de service.pdf',
    size: '98 KB',
    date: '2 mai 2026',
    clientId: 'CLI-002'
  }
];

export const DEFAULT_CLIENT_NOTES: ClientNote[] = [
  {
    id: 'note-1',
    date: '15 juin 2026',
    text: 'Le client préfère recevoir les factures par courriel.',
    clientId: 'CLI-002'
  },
  {
    id: 'note-2',
    date: '8 juillet 2026',
    text: 'Prévoir un suivi dans 30 jours.',
    clientId: 'CLI-002'
  }
];
