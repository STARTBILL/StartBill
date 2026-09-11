import { ProductItem } from '../types';

export const DEFAULT_PRODUCTS_CANADA: ProductItem[] = [
  {
    id: 'prod_can_1',
    name: 'Services de consultation',
    description: 'Accompagnement stratégique, audit et conseil d’affaires',
    unitPrice: 1000.00,
    category: 'Consultation',
    unit: 'Forfait',
    taxApplicable: true,
    sku: 'REF-1001'
  },
  {
    id: 'prod_can_2',
    name: 'Développement Web & TI',
    description: 'Conception, intégration et développement d’applications web',
    unitPrice: 850.00,
    category: 'Service',
    unit: 'Jour',
    taxApplicable: true,
    sku: 'REF-1002'
  },
  {
    id: 'prod_can_3',
    name: 'Gestion & Stratégie d’entreprise',
    description: 'Session de planification financière et gouvernance',
    unitPrice: 500.00,
    category: 'Consultation',
    unit: 'Session',
    taxApplicable: true,
    sku: 'REF-1003'
  },
  {
    id: 'prod_can_4',
    name: 'Conception graphique & Branding',
    description: 'Création d’identité visuelle, charte et supports de communication',
    unitPrice: 450.00,
    category: 'Service',
    unit: 'Projet',
    taxApplicable: true,
    sku: 'REF-1004'
  },
  {
    id: 'prod_can_5',
    name: 'Formation professionnelle',
    description: 'Session de formation pratique et transfert de compétences',
    unitPrice: 350.00,
    category: 'Formation',
    unit: 'Participant',
    taxApplicable: true,
    sku: 'REF-1005'
  },
  {
    id: 'prod_can_6',
    name: 'Maintenance & Support mensuel',
    description: 'Assistance technique prioritaire, sauvegardes et mises à jour',
    unitPrice: 250.00,
    category: 'Forfait',
    unit: 'Mois',
    taxApplicable: true,
    sku: 'REF-1006'
  }
];

export const DEFAULT_PRODUCTS_AFRIQUE: ProductItem[] = [
  {
    id: 'prod_afr_1',
    name: 'Prestation de conseil & consulting',
    description: 'Audit organisationnel et conseil en management',
    unitPrice: 150000,
    category: 'Consultation',
    unit: 'Forfait',
    taxApplicable: true,
    sku: 'REF-2001'
  },
  {
    id: 'prod_afr_2',
    name: 'Développement application & site web',
    description: 'Mise en place de plateforme digitale et paiements mobiles',
    unitPrice: 350000,
    category: 'Service',
    unit: 'Projet',
    taxApplicable: true,
    sku: 'REF-2002'
  },
  {
    id: 'prod_afr_3',
    name: 'Campagne marketing & communication',
    description: 'Stratégie réseaux sociaux, visuels et sponsorisation',
    unitPrice: 100000,
    category: 'Service',
    unit: 'Campagne',
    taxApplicable: true,
    sku: 'REF-2003'
  },
  {
    id: 'prod_afr_4',
    name: 'Formation & renforcement de capacités',
    description: 'Séminaire de formation certifiante en gestion commerciale',
    unitPrice: 75000,
    category: 'Formation',
    unit: 'Participant',
    taxApplicable: true,
    sku: 'REF-2004'
  }
];

export const DEFAULT_PRODUCTS_HAITI: ProductItem[] = [
  {
    id: 'prod_hai_1',
    name: 'Consultation professionnelle',
    description: 'Expertise technique et planification opérationnelle',
    unitPrice: 15000,
    category: 'Consultation',
    unit: 'Forfait',
    taxApplicable: true,
    sku: 'REF-3001'
  },
  {
    id: 'prod_hai_2',
    name: 'Service informatique & logiciel',
    description: 'Installation, configuration et support informatique',
    unitPrice: 30000,
    category: 'Service',
    unit: 'Projet',
    taxApplicable: true,
    sku: 'REF-3002'
  },
  {
    id: 'prod_hai_3',
    name: 'Audit comptable & gestion',
    description: 'Vérification des comptes et déclarations fiscales',
    unitPrice: 25000,
    category: 'Service',
    unit: 'Mission',
    taxApplicable: true,
    sku: 'REF-3003'
  }
];
