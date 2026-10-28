import { CompanyProfile, Invoice, Expense, Client } from '../types';

export const DEFAULT_COMPANIES: CompanyProfile[] = [
  {
    id: 'comp_sante',
    companyName: 'Santé.Inc',
    ownerName: 'Dr. Martin Roy',
    legalStatus: 'Société par actions (Inc.)',
    industry: 'Santé et bien-être',
    logoUrl: '',
    email: 'contact@sante-inc.ca',
    phone: '+1 (514) 555-0144',
    address: '450 Boulevard René-Lévesque O, Bureau 800, Montréal, QC H2Z 1A2',
    city: 'Montréal',
    taxId1: '123456789 RT0001', // TPS
    taxId2: '1178239012 TQ0001', // TVQ / NEQ
    companyNE: '1178239012',
    defaultPaymentMethod: 'Virement Interac',
    paymentTerms: 'Payable à réception (Immédiat)',
    region: 'canada',
    isDefault: true
  },
  {
    id: 'comp_educ',
    companyName: 'Educ.Inc',
    ownerName: 'Claire Tremblay',
    legalStatus: 'Société par actions (Inc.)',
    industry: 'Éducation et formation',
    logoUrl: '',
    email: 'direction@educ-inc.ca',
    phone: '+1 (514) 555-0822',
    address: '1200 Avenue McGill College, Bureau 1500, Montréal, QC H3B 4G7',
    city: 'Montréal',
    taxId1: '987654321 RT0001',
    taxId2: '1179832104 TQ0001',
    companyNE: '1179832104',
    defaultPaymentMethod: 'Virement bancaire EFT',
    paymentTerms: 'Payable sous 30 jours (Standard)',
    region: 'canada',
    isDefault: false
  }
];

export const INITIAL_COMPANY_DATA: {
  invoices: Invoice[];
  expenses: Expense[];
  clients: Client[];
} = {
  invoices: [
    // --- SANTE.INC (Santé & Médical) ---
    {
      id: 'FACT-SANTE-001',
      clientName: 'Clinique Médicale du Parc',
      date: '2026-05-10',
      status: 'Payée',
      subtotal: 4200.00,
      tps: 210.00,
      tvq: 418.95,
      total: 4828.95,
      amountPaid: 4828.95,
      remainingBalance: 0,
      paymentStatus: 'paid',
      paymentMethod: 'Virement Interac',
      province: 'Québec',
      companyId: 'comp_sante',
      companyName: 'Santé.Inc',
      region: 'canada',
      items: [
        { description: 'Consultations cliniques spécialisées (35h)', quantity: 35, unitPrice: 120, total: 4200 }
      ]
    },
    {
      id: 'FACT-SANTE-002',
      clientName: 'Pharmacie Santé Plus',
      date: '2026-05-18',
      status: 'Payée',
      subtotal: 2850.00,
      tps: 142.50,
      tvq: 284.29,
      total: 3276.79,
      amountPaid: 3276.79,
      remainingBalance: 0,
      paymentStatus: 'paid',
      paymentMethod: 'Virement Interac',
      province: 'Québec',
      companyId: 'comp_sante',
      companyName: 'Santé.Inc',
      region: 'canada',
      items: [
        { description: 'Audit ergonomique & protocoles sanitaires', quantity: 1, unitPrice: 2850, total: 2850 }
      ]
    },
    {
      id: 'FACT-SANTE-003',
      clientName: 'Centre Dentaire Montréal',
      date: '2026-05-24',
      status: 'Envoyée',
      subtotal: 1950.00,
      tps: 97.50,
      tvq: 194.51,
      total: 2242.01,
      amountPaid: 0,
      remainingBalance: 2242.01,
      paymentMethod: 'Carte bancaire',
      province: 'Québec',
      companyId: 'comp_sante',
      companyName: 'Santé.Inc',
      region: 'canada',
      items: [
        { description: 'Formation du personnel infirmier aux normes 2026', quantity: 1, unitPrice: 1950, total: 1950 }
      ]
    },

    // --- EDUC.INC (Éducation & Formation) ---
    {
      id: 'FACT-EDUC-001',
      clientName: 'Institut des Hautes Études',
      date: '2026-05-08',
      status: 'Payée',
      subtotal: 8500.00,
      tps: 425.00,
      tvq: 847.88,
      total: 9772.88,
      amountPaid: 9772.88,
      remainingBalance: 0,
      paymentStatus: 'paid',
      paymentMethod: 'Virement bancaire EFT',
      province: 'Québec',
      companyId: 'comp_educ',
      companyName: 'Educ.Inc',
      region: 'canada',
      items: [
        { description: 'Programme intensif en science des données et IA', quantity: 1, unitPrice: 8500, total: 8500 }
      ]
    },
    {
      id: 'FACT-EDUC-002',
      clientName: 'Académie Numérique de Montréal',
      date: '2026-05-15',
      status: 'Payée',
      subtotal: 5400.00,
      tps: 270.00,
      tvq: 538.65,
      total: 6208.65,
      amountPaid: 6208.65,
      remainingBalance: 0,
      paymentStatus: 'paid',
      paymentMethod: 'Virement bancaire EFT',
      province: 'Québec',
      companyId: 'comp_educ',
      companyName: 'Educ.Inc',
      region: 'canada',
      items: [
        { description: 'Conception de modules e-learning interactifs (6 unités)', quantity: 6, unitPrice: 900, total: 5400 }
      ]
    },
    {
      id: 'FACT-EDUC-003',
      clientName: 'Collège Saint-Laurent',
      date: '2026-05-22',
      status: 'En retard',
      subtotal: 3100.00,
      tps: 155.00,
      tvq: 309.23,
      total: 3564.23,
      amountPaid: 0,
      remainingBalance: 3564.23,
      paymentMethod: 'Chèque corporatif',
      province: 'Québec',
      companyId: 'comp_educ',
      companyName: 'Educ.Inc',
      region: 'canada',
      items: [
        { description: 'Atelier de pédagogie active pour enseignants', quantity: 1, unitPrice: 3100, total: 3100 }
      ]
    }
  ],

  expenses: [
    // --- SANTE.INC (Dépenses Médicales) ---
    {
      id: 'EXP-SANTE-001',
      category: 'Matériel & Équipement',
      provider: 'MedTech Québec Inc.',
      date: '2026-05-04',
      amountHt: 1250.00,
      tps: 62.50,
      tvq: 124.69,
      total: 1437.19,
      province: 'Québec',
      paymentMethod: 'Carte bancaire',
      notes: 'Renouvellement matériel stérile et tensiomètres numériques',
      companyId: 'comp_sante',
      companyName: 'Santé.Inc',
      region: 'canada'
    },
    {
      id: 'EXP-SANTE-002',
      category: 'Logiciels & Abonnements',
      provider: 'DossierMédical Cloud',
      date: '2026-05-12',
      amountHt: 320.00,
      tps: 16.00,
      tvq: 31.92,
      total: 367.92,
      province: 'Québec',
      paymentMethod: 'Carte bancaire',
      notes: 'Licence mensuelle logiciel DME sécurisé HIPAA/LPRPDE',
      companyId: 'comp_sante',
      companyName: 'Santé.Inc',
      region: 'canada'
    },

    // --- EDUC.INC (Dépenses Pédagogiques) ---
    {
      id: 'EXP-EDUC-001',
      category: 'Logiciels & Abonnements',
      provider: 'Canvas LMS Cloud',
      date: '2026-05-06',
      amountHt: 1850.00,
      tps: 92.50,
      tvq: 184.54,
      total: 2127.04,
      province: 'Québec',
      paymentMethod: 'Virement bancaire EFT',
      notes: 'Abonnement annuel plateforme d’apprentissage virtuelle',
      companyId: 'comp_educ',
      companyName: 'Educ.Inc',
      region: 'canada'
    },
    {
      id: 'EXP-EDUC-002',
      category: 'Fournitures de bureau',
      provider: 'Éditions Pédagogiques Laval',
      date: '2026-05-14',
      amountHt: 740.00,
      tps: 37.00,
      tvq: 73.82,
      total: 850.82,
      province: 'Québec',
      paymentMethod: 'Carte de crédit',
      notes: 'Manuels d’exercices et supports de cours imprimés',
      companyId: 'comp_educ',
      companyName: 'Educ.Inc',
      region: 'canada'
    }
  ],

  clients: [
    // --- SANTE.INC (Clients Médicaux) ---
    {
      id: 'CLI-SANTE-001',
      name: 'Clinique Médicale du Parc',
      amountDue: 0,
      email: 'facturation@cliniqueduparc.qc.ca',
      phone: '+1 (514) 288-4000',
      address: '345 Avenue du Parc, Montréal, QC H2X 2H6',
      company: 'Clinique Médicale du Parc',
      type: 'Entreprise',
      status: 'Actif',
      totalInvoiced: 4828.95,
      paymentsReceived: 4828.95,
      companyId: 'comp_sante',
      companyName: 'Santé.Inc',
      region: 'canada'
    },
    {
      id: 'CLI-SANTE-002',
      name: 'Pharmacie Santé Plus',
      amountDue: 0,
      email: 'compta@santeplus-rx.ca',
      phone: '+1 (514) 739-1122',
      address: '5600 Chemin de la Côte-des-Neiges, Montréal, QC',
      company: 'Pharmacie Santé Plus',
      type: 'Entreprise',
      status: 'Actif',
      totalInvoiced: 3276.79,
      paymentsReceived: 3276.79,
      companyId: 'comp_sante',
      companyName: 'Santé.Inc',
      region: 'canada'
    },
    {
      id: 'CLI-SANTE-003',
      name: 'Centre Dentaire Montréal',
      amountDue: 2242.01,
      email: 'admin@centredentaire-mtl.ca',
      phone: '+1 (514) 845-9900',
      address: '1414 Rue Sainte-Catherine O, Montréal, QC',
      company: 'Centre Dentaire Montréal',
      type: 'Entreprise',
      status: 'Actif',
      totalInvoiced: 2242.01,
      paymentsReceived: 0,
      companyId: 'comp_sante',
      companyName: 'Santé.Inc',
      region: 'canada'
    },

    // --- EDUC.INC (Clients Éducation) ---
    {
      id: 'CLI-EDUC-001',
      name: 'Institut des Hautes Études',
      amountDue: 0,
      email: 'finances@ihes-education.ca',
      phone: '+1 (514) 340-6000',
      address: '3000 Chemin de la Côte-Sainte-Catherine, Montréal, QC',
      company: 'Institut des Hautes Études',
      type: 'Entreprise',
      status: 'Actif',
      totalInvoiced: 9772.88,
      paymentsReceived: 9772.88,
      companyId: 'comp_educ',
      companyName: 'Educ.Inc',
      region: 'canada'
    },
    {
      id: 'CLI-EDUC-002',
      name: 'Académie Numérique de Montréal',
      amountDue: 0,
      email: 'operations@academienumerique.ca',
      phone: '+1 (514) 907-5500',
      address: '400 Boulevard de Maisonneuve O, Montréal, QC',
      company: 'Académie Numérique de Montréal',
      type: 'Entreprise',
      status: 'Actif',
      totalInvoiced: 6208.65,
      paymentsReceived: 6208.65,
      companyId: 'comp_educ',
      companyName: 'Educ.Inc',
      region: 'canada'
    },
    {
      id: 'CLI-EDUC-003',
      name: 'Collège Saint-Laurent',
      amountDue: 3564.23,
      email: 'tresorerie@college-stlaurent.qc.ca',
      phone: '+1 (514) 747-6521',
      address: '625 Avenue Sainte-Croix, Saint-Laurent, QC',
      company: 'Collège Saint-Laurent',
      type: 'Entreprise',
      status: 'Actif',
      totalInvoiced: 3564.23,
      paymentsReceived: 0,
      companyId: 'comp_educ',
      companyName: 'Educ.Inc',
      region: 'canada'
    }
  ]
};
