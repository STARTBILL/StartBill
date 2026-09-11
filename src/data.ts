import { Invoice, Expense, Client } from './types';

export const INITIAL_INVOICES: Invoice[] = [];

export const INITIAL_EXPENSES: Expense[] = [];

export const INITIAL_CLIENTS: Client[] = [];

// Helper to represent UI JSON declarations for each page
export const SCREEN_SCHEMAS: Record<string, {
  id: string;
  title: string;
  image_ref: string;
  section: string;
  variables: Record<string, string>;
  components: Array<{ name: string; selector: string; desc: string }>;
  workflow: Array<{ trigger: string; target: string; desc: string }>;
}> = {
  dashboard: {
    id: 'dashboard',
    title: 'Tableau de bord - Canada',
    image_ref: 'image_0.png',
    section: '1. TABLEAU DE BORD - CANADA',
    variables: {
      revenueEncaissé: 'Total des factures payées en mai ($25,430.00 CAD)',
      depensesAdmissibles: 'Total des dépenses de mai ($9,850.00 CAD)',
      beneficeNet: 'Revenus encaissés moins dépenses ($15,580.00 CAD)',
      taxesARemettre: 'TPS + TVQ collectées nettes ($2,210.00 CAD)',
      impotEstime: 'Estimation d\'impôt de 20% ou 25% ($3,895.00 CAD)',
      montantRecommandeCote: 'Taxes + Impôt estimé ($6,105.00 CAD)'
    },
    components: [
      { name: 'Sélecteur de période', selector: '.select-period', desc: 'Permet de filtrer par mois (ex: Mai 2026)' },
      { name: 'Sélecteur de compte', selector: '.select-account', desc: 'Permet de filtrer par compte bancaire' },
      { name: 'Carte Revenus encaissés', selector: '.card-revenue', desc: 'Affiche le revenu total avec tendance vs mois précédent (+12.5%)' },
      { name: 'Carte Dépenses admissibles', selector: '.card-expenses', desc: 'Affiche les dépenses de la période avec tendance (+8.4%)' },
      { name: 'Carte Bénéfice net', selector: '.card-net-profit', desc: 'Affiche la différence avec tendance (-18.7%)' },
      { name: 'Taxes à remettre', selector: '.badge-taxes-remit', desc: 'Affiche la TPS/TVQ calculée sur les transactions' },
      { name: 'Impôt estimé', selector: '.badge-tax-estimate', desc: 'Affiche l\'impôt estimé basé sur le bénéfice' },
      { name: 'Montant recommandé à mettre de côté', selector: '.banner-savings-recommendation', desc: 'Affiche la somme conseillée à épargner' }
    ],
    workflow: [
      { trigger: 'Clic sur l\'onglet Factures', target: 'factures', desc: 'Redirige vers l\'écran 2. FACTURES' },
      { trigger: 'Clic sur l\'onglet Dépenses', target: 'expenses', desc: 'Redirige vers l\'écran 5. DÉPENSES' },
      { trigger: 'Clic sur l\'onglet Rapports', target: 'reports', desc: 'Redirige vers l\'écran 11. RAPPORTS' },
      { trigger: 'Clic sur l\'onglet Plus -> Santé financière', target: 'financial_health', desc: 'Ouvre l\'écran 6. SANTÉ FINANCIÈRE' }
    ]
  },
  invoices: {
    id: 'invoices',
    title: 'Factures',
    image_ref: 'image_0.png',
    section: '2. FACTURES',
    variables: {
      searchQuery: 'Texte de recherche pour filtrer les factures',
      selectedTab: 'Filtre actif : Toutes, Envoyées, Payées, En retard, Brouillons'
    },
    components: [
      { name: 'Barre de recherche', selector: '.input-search-invoice', desc: 'Filtrer les factures par ID, client ou montant' },
      { name: 'Onglets de statut', selector: '.tabs-invoice-status', desc: 'Filtrer par statut de paiement' },
      { name: 'Liste de factures', selector: '.list-invoices', desc: 'Liste défilante des factures avec indicateur de statut de couleur' },
      { name: 'Bouton Nouvelle facture', selector: '.button-add-invoice', desc: 'Bouton primaire pour créer une nouvelle facture' }
    ],
    workflow: [
      { trigger: 'Clic sur une facture de la liste', target: 'invoice_detail', desc: 'Ouvre l\'écran 3. DÉTAIL FACTURE pour la facture sélectionnée' },
      { trigger: 'Clic sur + Nouvelle facture', target: 'invoice_form', desc: 'Permet de générer une nouvelle facture' }
    ]
  },
  invoice_detail: {
    id: 'invoice_detail',
    title: 'Détail de la facture',
    image_ref: 'image_0.png',
    section: '3. DÉTAIL FACTURE',
    variables: {
      factureId: 'ID unique de la facture (ex: FACT-2026-045)',
      montantTotal: 'Montant total TTC ($1,150.00 CAD)',
      montantTps: 'TPS calculée (5% = $50.00)',
      montantTvq: 'TVQ calculée (9.975% = $99.75)',
      statutFacture: 'Statut de paiement (Payée, En retard, Envoyée)'
    },
    components: [
      { name: 'En-tête de facture', selector: '.invoice-id-header', desc: 'Affiche le numéro de facture et son badge de statut coloré' },
      { name: 'Récapitulatif des taxes', selector: '.tax-breakdown', desc: 'Détail du Sous-total, TPS, TVQ, et Total CAD' },
      { name: 'Détail du paiement', selector: '.payment-details', desc: 'Affiche la méthode et la date de paiement si payée' },
      { name: 'Actions de facture', selector: '.actions-container', desc: 'Boutons pour télécharger le PDF, envoyer par email, etc.' }
    ],
    workflow: [
      { trigger: 'Clic sur le bouton Retour', target: 'invoices', desc: 'Retourne à l\'écran 2. FACTURES' },
      { trigger: 'Clic sur Marquer comme non payée', target: 'toggle_payment_status', desc: 'Bascule le statut et met à jour les montants du tableau de bord' },
      { trigger: 'Clic sur Supprimer', target: 'delete_invoice', desc: 'Supprime la facture après confirmation et retourne à la liste' }
    ]
  },
  add_expense: {
    id: 'add_expense',
    title: 'Ajouter une dépense',
    image_ref: 'image_0.png',
    section: '4. AJOUTER DÉPENSE',
    variables: {
      categorieDépense: 'Catégorie sélectionnée (Transport, Publicité, Logiciels...)',
      fournisseur: 'Nom du fournisseur (ex: Station-service Total)',
      dateDépense: 'Date de la transaction',
      montantHt: 'Montant hors taxes (ex: 60.00 $)',
      montantTps: 'TPS ou TVH applicable (ex: 3.00 $)',
      montantTotal: 'Total de la dépense calculé automatiquement (63.00 $)'
    },
    components: [
      { name: 'Sélecteur de catégorie', selector: '.select-category', desc: 'Menu déroulant des catégories standardisées' },
      { name: 'Champ fournisseur', selector: '.input-provider', desc: 'Champ texte libre pour le commerçant' },
      { name: 'Champ montant HT', selector: '.input-amount-ht', desc: 'Saisie numérique du montant de base' },
      { name: 'Bouton Ajouter photo', selector: '.button-upload-receipt', desc: 'Permet de téléverser un justificatif (reçu)' },
      { name: 'Bouton Enregistrer', selector: '.button-submit-expense', desc: 'Bouton pour valider et enregistrer la dépense' }
    ],
    workflow: [
      { trigger: 'Saisie Montant HT ou TPS', target: 'calculate_total', desc: 'Met à jour dynamiquement le total calculé' },
      { trigger: 'Clic sur Enregistrer', target: 'expenses', desc: 'Ajoute la dépense à la liste et redirige vers 5. DÉPENSES' }
    ]
  },
  expenses: {
    id: 'expenses',
    title: 'Dépenses',
    image_ref: 'image_0.png',
    section: '5. DÉPENSES',
    variables: {
      searchQuery: 'Texte de recherche pour filtrer les dépenses',
      totalDépenses: 'Somme des dépenses admissibles pour la période sélectionnée ($9,850.00 CAD)'
    },
    components: [
      { name: 'Barre de recherche', selector: '.input-search-expense', desc: 'Permet de filtrer la liste' },
      { name: 'Récapitulatif total', selector: '.banner-total-expenses', desc: 'Affiche le total cumulé des dépenses pour le mois' },
      { name: 'Liste de dépenses', selector: '.list-expenses', desc: 'Affiche chaque dépense avec icône de catégorie, date et montant' },
      { name: 'Bouton Ajouter une dépense', selector: '.button-add-expense-primary', desc: 'Bouton en bas de page pour créer une dépense' }
    ],
    workflow: [
      { trigger: 'Clic sur + Ajouter une dépense', target: 'add_expense', desc: 'Ouvre l\'écran 4. AJOUTER DÉPENSE' },
      { trigger: 'Clic sur une dépense de la liste', target: 'expense_detail', desc: 'Ouvre l\'écran 7. DÉTAIL DÉPENSE' }
    ]
  },
  financial_health: {
    id: 'financial_health',
    title: '2. Analyse détaillée',
    image_ref: 'st1.PNG',
    section: '2. ANALYSE DÉTAILLÉE',
    variables: {
      activeTab: 'Onglet sélectionné: Liquidité, Rentabilité, Croissance, Gestion, Risque',
      healthScore: 'Score global de santé financière (82/100, Bonne santé)',
      ratios: 'Ratios clés par onglet (Ratio courant, Trésorerie immédiate, BFR, etc.)',
      sectorBenchmark: 'Comparaison sectorielle avec la médiane du secteur'
    },
    components: [
      { name: 'Onglets d\'analyse', selector: '.tabs-analysis', desc: 'Sélecteur d\'axes d\'analyse (Liquidité, Rentabilité, Croissance, Gestion, Risque)' },
      { name: 'Carte Score & Graphique radar', selector: '.card-radar-score', desc: 'Radar 5 axes avec score global et points d\'attention' },
      { name: 'Tableau Indicateurs', selector: '.table-indicators', desc: 'Tableau détaillé avec indicateur, valeur, cible et statut' },
      { name: 'Évolution 6 mois', selector: '.chart-trend-bars', desc: 'Graphique en barres de l\'évolution mensuelle' },
      { name: 'Comparaison sectorielle', selector: '.card-sector-comparison', desc: 'Jauges comparatives Entreprise vs Secteur' }
    ],
    workflow: [
      { trigger: 'Clic sur un onglet', target: 'switch_tab', desc: 'Affiche les ratios et graphiques de la dimension choisie' },
      { trigger: 'Clic sur Exporter PDF/CSV', target: 'export_report', desc: 'Télécharge le rapport d\'analyse détaillée' }
    ]
  },
  expense_detail: {
    id: 'expense_detail',
    title: 'Détail de la dépense',
    image_ref: 'image_0.png',
    section: '7. DÉTAIL DÉPENSE',
    variables: {
      depenseId: 'Identifiant de la dépense',
      categorie: 'Catégorie (Transport)',
      fournisseur: 'Station-service Total',
      montantTotal: 'Montant TTC ($63.00)'
    },
    components: [
      { name: 'Titre de catégorie', selector: '.expense-category-header', desc: 'Affiche l\'icône de la catégorie et la date' },
      { name: 'Justificatif numérisé', selector: '.receipt-thumbnail-preview', desc: 'Affiche l\'image du reçu si téléversée' },
      { name: 'Bouton Supprimer', selector: '.button-delete-expense', desc: 'Permet de retirer la dépense après validation' }
    ],
    workflow: [
      { trigger: 'Clic sur Modifier', target: 'edit_expense', desc: 'Permet d\'éditer les informations de la dépense' },
      { trigger: 'Clic sur Supprimer', target: 'delete_expense', desc: 'Supprime la dépense et met à jour le total' }
    ]
  },
  monthly_summary: {
    id: 'monthly_summary',
    title: 'Résumé mensuel',
    image_ref: 'image_0.png',
    section: '8. RÉSUMÉ MENSUEL',
    variables: {
      selectedMonth: 'Mois actif (ex: Mai 2026)',
      repartitionData: 'Pourcentages par catégorie de dépenses pour le graphique en camembert'
    },
    components: [
      { name: 'Sélecteur de mois', selector: '.select-month-summary', desc: 'Permet de filtrer le graphique par mois' },
      { name: 'Graphique en anneau (Donut Chart)', selector: '.chart-donut-categories', desc: 'Visualisation de la répartition des dépenses' },
      { name: 'Légende interactive', selector: '.chart-legend-list', desc: 'Affiche les pourcentages par catégorie' }
    ],
    workflow: [
      { trigger: 'Clic sur Voir toutes les dépenses', target: 'expenses', desc: 'Bascule vers la liste complète des dépenses' }
    ]
  },
  tax_prep: {
    id: 'tax_prep',
    title: 'Préparation des impôts',
    image_ref: 'image_0.png',
    section: '9. PRÉPARATION IMPÔTS',
    variables: {
      selectedYear: 'Année fiscale active (ex: Année 2026)',
      revenusAnnuels: 'Somme des revenus encaissés sur l\'année ($145,230.00)',
      depensesAnnuelles: 'Somme des dépenses admissibles sur l\'année ($62,450.00)',
      impotEstimeAnnuel: 'Estimation de l\'impôt annuel ($16,556.00)'
    },
    components: [
      { name: 'Sélecteur d\'année', selector: '.select-tax-year', desc: 'Bascule d\'un exercice fiscal à un autre' },
      { name: 'Tableau récapitulatif annuel', selector: '.tax-annual-table', desc: 'Tableau avec revenus, dépenses, bénéfice net et impôt' },
      { name: 'Recommandation d\'épargne', selector: '.tax-recommendation-card', desc: 'Affiche le montant annuel recommandé à mettre de côté' }
    ],
    workflow: [
      { trigger: 'Clic sur Exporter résumé (PDF)', target: 'export_pdf', desc: 'Génère le document de synthèse fiscale pour déclaration' },
      { trigger: 'Clic sur Exporter comptable (CSV)', target: 'export_csv', desc: 'Télécharge le fichier de transactions structuré' }
    ]
  },
  clients: {
    id: 'clients',
    title: 'Clients',
    image_ref: 'image_0.png',
    section: '10. CLIENTS',
    variables: {
      searchQuery: 'Chaîne de recherche client',
      selectedClientId: 'Client actuellement sélectionné'
    },
    components: [
      { name: 'Barre de recherche client', selector: '.input-search-client', desc: 'Rechercher par nom' },
      { name: 'Bouton + Nouveau client', selector: '.button-add-client', desc: 'Ouvre le formulaire de création de client' },
      { name: 'Liste des clients', selector: '.list-clients-cards', desc: 'Affiche chaque client avec son montant total dû' }
    ],
    workflow: [
      { trigger: 'Clic sur un client', target: 'client_details', desc: 'Affiche l\'historique des factures associées à ce client' }
    ]
  },
  reports: {
    id: 'reports',
    title: 'Rapports',
    image_ref: 'image_0.png',
    section: '11. RAPPORTS',
    variables: {
      averageMonthlyRevenue: 'Revenu moyen par mois ($23,450.00)',
      averageMonthlyExpense: 'Dépense moyenne par mois ($8,650.00)',
      averageProfitMargin: 'Marge moyenne (63.1%)'
    },
    components: [
      { name: 'Onglets de rapport', selector: '.tabs-report-type', desc: 'Bascule entre Aperçu, Comparaison, et Catégories' },
      { name: 'Graphique en barres Évolution', selector: '.chart-bar-evolution', desc: 'Graphique comparatif des revenus, dépenses et bénéfices sur 5 mois' },
      { name: 'Section Indicateurs clés', selector: '.reports-key-metrics', desc: 'Statistiques mensuelles moyennes' }
    ],
    workflow: [
      { trigger: 'Changement d\'onglet', target: 'update_report_view', desc: 'Rafraîchit la visualisation du rapport' }
    ]
  }
};
