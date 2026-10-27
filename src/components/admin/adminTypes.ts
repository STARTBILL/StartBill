/**
 * STARTBILL ADMIN — CEO COMMAND CENTER
 * Types and Interfaces for the 24 Administrative Modules
 * Platform: STARTBILL (Fondatrice & CEO: Ferline ZOGNI)
 */

export type AdminModuleId =
  | 'ceo_dashboard'       // 01. Tableau de bord CEO
  | 'strategic_steering'  // 02. Pilotage stratégique
  | 'businesses'          // 03. Entreprises
  | 'users'               // 04. Utilisateurs
  | 'subscriptions'       // 05. Abonnements et tarification
  | 'payments'            // 06. Paiements STARTBILL
  | 'founding100'         // 07. Programme FOUNDING 100
  | 'crm'                 // 08. CRM Administratif
  | 'international'       // 09. Gestion internationale
  | 'feature_flags'       // 10. Produit et fonctionnalités
  | 'ai_supervision'      // 11. Intelligence artificielle
  | 'fiscal_reference'    // 12. Référentiels financiers et fiscaux
  | 'reports_analytics'   // 13. Rapports et statistiques
  | 'support_tickets'     // 14. Support client
  | 'marketing_comms'     // 15. Marketing et communications
  | 'partners'            // 16. Partenaires
  | 'international_team'  // 17. Équipe internationale
  | 'documentation'       // 18. Formation et documentation
  | 'security_center'     // 19. Centre de sécurité
  | 'rbac_permissions'    // 20. Rôles et permissions
  | 'audit_compliance'    // 21. Audit et conformité
  | 'system_monitoring'   // 22. Surveillance technique
  | 'roadmap_versions'    // 23. Roadmap et versions
  | 'general_settings';   // 24. Paramètres généraux

export type RbacRole =
  | 'SUPER_ADMIN'
  | 'ADMIN_OPERATIONS'
  | 'ADMIN_FINANCE'
  | 'ADMIN_SUPPORT'
  | 'ADMIN_MARKETING'
  | 'ADMIN_PARTNERSHIPS'
  | 'ADMIN_COMPLIANCE'
  | 'TECH_LEAD'
  | 'DEVELOPER'
  | 'INTERN'
  | 'READ_ONLY';

export type RbacAction =
  | 'read'
  | 'create'
  | 'update'
  | 'approve'
  | 'delete'
  | 'export'
  | 'administer';

export interface AdminProfile {
  id: string;
  name: string;
  title: string;
  role: RbacRole;
  email: string;
  phone?: string;
  avatarUrl?: string;
  isMfaActive: boolean;
  mfaMethod: 'authenticator_app' | 'sms_backup';
  language: 'fr' | 'en';
  theme: 'dark' | 'light' | 'system';
  lastLogin: string;
  ipAddress: string;
  location: string;
}

// Module 01: CEO Dashboard KPIs
export interface CeoMetrics {
  totalBusinesses: number;
  newRegistrationsThisMonth: number;
  activeBusinesses: number;
  activeUsers: number;
  trialBusinesses: number;
  paidSubscriptions: number;
  mrrCad: number;
  arrCad: number;
  conversionRate: number; // e.g. 8.4%
  churnRate: number;      // e.g. 1.2%
  retentionRate: number;  // e.g. 95.8%
  openSupportTickets: number;
  activeTechnicalIncidents: number;
  securityAlertsCount: number;
  cloudResourceConsumptionPercent: number;
}

// Module 02: Strategic Steering
export interface StrategicObjective {
  id: string;
  title: string;
  category: 'croissance' | 'finance' | 'produit' | 'expansion' | 'qualite';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  owner: string;
  progressPercent: number;
  status: 'on_track' | 'at_risk' | 'delayed' | 'achieved';
  notes: string;
}

// Module 03: Businesses
export interface AdminBusiness {
  id: string;
  name: string;
  legalNumber?: string;
  country: 'Canada' | 'Sénégal' | 'Côte d’Ivoire' | 'Haïti' | 'Cameroun' | 'RDC' | 'Autre';
  currency: string;
  sector: string;
  size: '1-5' | '6-20' | '21-50' | '50+';
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  plan: 'Free' | 'Start' | 'Pro' | 'Business' | 'Founding 100';
  status: 'active' | 'trial' | 'suspended' | 'archived';
  verificationStatus: 'verified' | 'pending' | 'rejected';
  registrationDate: string;
  lastActiveDate: string;
  openTickets: number;
  suspensionReason?: string;
  notes?: string;
}

// Module 04: Users
export interface AdminUserAccount {
  id: string;
  fullName: string;
  email: string;
  role: RbacRole;
  businessName: string;
  country: string;
  status: 'active' | 'suspended' | 'pending';
  emailVerified: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  lastLoginAt: string;
  activeSessionsCount: number;
}

// Module 05: Subscriptions & Pricing
export interface SubscriptionPlanConfig {
  id: string;
  name: string;
  code: string;
  description: string;
  targetAudience: string;
  monthlyPrices: {
    CAD: number;
    FCFA: number;
    HTG: number;
    USD: number;
    EUR: number;
  };
  annualDiscountPercent: number;
  trialDays: number;
  maxInvoicesPerMonth: number;
  maxClients: number;
  maxUsers: number;
  aiAdvisorAccess: boolean;
  multiCurrency: boolean;
  isFoundingOffer?: boolean;
  isActive: boolean;
  version: string;
}

// Module 06: Payments
export interface AdminPaymentRecord {
  id: string;
  invoiceNumber: string;
  businessName: string;
  planName: string;
  amount: number;
  currency: string;
  provider: 'Stripe' | 'Orange Money' | 'MTN MoMo' | 'Wave' | 'Virement Interac' | 'MonCash';
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  date: string;
  transactionRef: string;
  feeAmount: number;
  failureReason?: string;
}

// Module 07: STARTBILL FOUNDING 100
export type FoundingStatus =
  | 'received'       // Reçue
  | 'in_review'      // En examen
  | 'shortlisted'    // Présélectionnée
  | 'accepted'       // Acceptée
  | 'waitlist'       // Liste d'attente
  | 'rejected'       // Refusée
  | 'activated'      // Activée (période pilote en cours)
  | 'completed';     // Test terminé

export interface Founding100Candidate {
  id: string;
  companyName: string;
  managerName: string;
  email: string;
  phone?: string;
  country: 'Canada' | 'Sénégal' | 'Côte d’Ivoire' | 'Haïti' | 'Cameroun' | 'RDC' | 'Bénin' | 'Autre';
  city: string;
  sector: string;
  activityDescription: string;
  companySize: string;
  managementNeeds: string;
  motivation: string;
  videoPresentationUrl?: string;
  status: FoundingStatus;
  submittedAt: string;
  internalNotes: string;
  assignedReviewer: string;
  engagementScore: number; // 0-100
  feedbackCount: number;
  reportedBugsCount: number;
  participationAgreementSigned: boolean;
}

// Module 08: CRM
export interface CrmProspect {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  country: string;
  source: 'Recommandation' | 'Webinaire' | 'Salons & Événements' | 'Partenaires' | 'Site Web' | 'LinkedIn';
  stage: 'lead' | 'contacted' | 'demo_scheduled' | 'trial' | 'negotiation' | 'won' | 'lost';
  estimatedValueCad: number;
  assignedTo: string;
  lastContactDate: string;
  nextFollowUpDate: string;
  marketingConsent: boolean;
  notes: string;
}

// Module 09: International Management
export interface MarketCountryConfig {
  code: string; // 'CA', 'SN', 'CI', 'HT', 'CM', 'CD', 'BJ'
  name: string;
  flag: string;
  region: 'Americas' | 'West_Africa' | 'Central_Africa' | 'Caribbean';
  currency: string;
  currencySymbol: string;
  languages: string[];
  timezone: string;
  dateFormat: string;
  taxSystem: string; // e.g. 'TPS (5%) + TVQ (9.975%)' ou 'TVA OHADA (18%)'
  activeStatus: 'active' | 'beta' | 'planned' | 'paused';
  paymentProviders: string[];
  localComplianceNote: string;
}

// Module 10: Feature Flags
export interface FeatureFlagItem {
  id: string;
  key: string;
  name: string;
  description: string;
  isEnabled: boolean;
  rolloutPercent: number; // 0 to 100
  allowedCountries: string[]; // ['CA', 'SN', 'CI', 'HT'] or ['ALL']
  allowedPlans: string[]; // ['Free', 'Start', 'Pro', 'Business']
  betaOnly: boolean;
  emergencyKillSwitch: boolean;
  updatedAt: string;
  updatedBy: string;
}

// Module 11: AI Supervision
export interface AiSupervisionState {
  provider: 'Google Vertex AI / Gemini API';
  activeModel: 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'gemini-2.5-flash-thinking';
  tokenQuotaPerMonth: number;
  tokensConsumedThisMonth: number;
  monthlyCostCad: number;
  requestsCountThisMonth: number;
  averageResponseTimeMs: number;
  guardrailsEnforced: boolean;
  fiscalAdviceDisclaimerActive: boolean;
  emergencyStop: boolean;
  lastQualityAuditScore: number; // out of 100
}

// Module 12: Fiscal & Financial References
export interface FiscalOfficialSource {
  id: string;
  jurisdiction: string;
  authorityName: string; // CRA, Revenu Québec, DGI Sénégal, DGI Haïti...
  taxName: string;
  ratePercent: number;
  effectiveDate: string;
  verifiedBy: string;
  lastVerifiedAt: string;
  officialReferenceUrl: string;
  status: 'valid' | 'updating' | 'archived';
  notes: string;
}

// Module 13: Reports & Statistics
export interface ExecutiveReport {
  id: string;
  title: string;
  period: string;
  category: 'Revenus & MRR' | 'Utilisateurs & Churn' | 'Expansion Internationale' | 'Performance Pilote';
  createdAt: string;
  generatedBy: string;
  summary: string;
  dataPoints: { label: string; value: string | number }[];
}

// Module 14: Support Tickets
export interface AdminSupportTicket {
  id: string;
  ticketNumber: string;
  title: string;
  userEmail: string;
  userName: string;
  companyName: string;
  category: 'Facturation' | 'Fiscalité Régionale' | 'Technique' | 'Compte & Accès' | 'Suggestions';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'in_progress' | 'waiting_client' | 'resolved' | 'closed';
  assignedTo: string;
  createdAt: string;
  lastUpdate: string;
  messagesCount: number;
  satisfactionRating?: number; // 1-5
}

// Module 15: Marketing & Comms
export interface MarketingCampaign {
  id: string;
  title: string;
  type: 'In-App Announcement' | 'Email Digest' | 'Product Update' | 'Promo Code';
  targetRegions: string[];
  targetPlans: string[];
  status: 'draft' | 'scheduled' | 'sent' | 'archived';
  sentCount: number;
  openRatePercent: number;
  clickRatePercent: number;
  scheduledDate: string;
}

// Module 16: Partners
export interface BusinessPartner {
  id: string;
  name: string;
  type: 'Incubateur / Accélérateur' | 'Chambre de Commerce' | 'Cabinet Comptable (CPA)' | 'Institution Financière' | 'Ambassadeur' | 'Tech';
  country: string;
  contactPerson: string;
  email: string;
  partnershipStatus: 'Actif' | 'En négociation' | 'En discussion';
  agreementDate: string;
  referredBusinessesCount: number;
  notes: string;
}

// Module 17: International Team
export interface TeamCollaborator {
  id: string;
  fullName: string;
  email: string;
  role: RbacRole;
  functionTitle: string;
  country: string;
  city: string;
  timezone: string;
  isIntern: boolean;
  status: 'Actif' | 'Onboarding' | 'Offboarding';
  startDate: string;
  supervisor: string;
  activeTasksCount: number;
}

// Module 18: Documentation & Training
export interface DocumentationArticle {
  id: string;
  title: string;
  category: 'Guides Utilisateurs' | 'FAQ Officielle' | 'Tutoriels' | 'Technique Interne' | 'Fiscalité Pays';
  targetAudience: 'public' | 'clients' | 'intern_only' | 'engineers';
  language: 'fr' | 'en';
  published: boolean;
  lastUpdated: string;
  author: string;
  viewsCount: number;
}

// Module 19: Security Center
export interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: 'MFA Verification' | 'Failed Login Attempt' | 'Privilege Escalation Blocked' | 'Suspicious IP' | 'API Key Audit';
  severity: 'low' | 'medium' | 'high' | 'critical';
  sourceIp: string;
  targetAccount: string;
  status: 'resolved' | 'monitoring' | 'blocked';
  actionTaken: string;
}

// Module 20: RBAC Matrix definition
export interface RbacPermissionRow {
  moduleId: AdminModuleId;
  moduleName: string;
  permissionsByRole: Record<RbacRole, RbacAction[]>;
}

// Module 21: Audit & Compliance (Loi 25 Québec, RGPD, PIPEDA)
export interface AuditLogItem {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: RbacRole;
  action: string;
  targetEntity: string;
  targetId: string;
  ipAddress: string;
  jurisdictionCompliance: 'Loi 25 (QC)' | 'PIPEDA (CA)' | 'RGPD' | 'Général';
  details: string;
}

// Module 22: Technical Monitoring
export interface SystemHealthMetric {
  serviceName: string;
  status: 'operational' | 'degraded' | 'outage';
  uptime30Days: number; // e.g. 99.98%
  latencyMs: number;
  lastIncident?: string;
  endpoint: string;
}

// Module 23: Roadmap & Releases
export interface RoadmapItem {
  id: string;
  title: string;
  category: string;
  priority: 'P0 - Critique' | 'P1 - Élevée' | 'P2 - Normale';
  status: 'studying' | 'planned' | 'in_development' | 'testing' | 'deployed' | 'abandoned';
  assignedTo: string;
  targetQuarter: string;
  completionPercent: number;
  releaseVersion: string;
}

// Module 24: General Settings
export interface PlatformGeneralConfig {
  platformName: string;
  slogan: string;
  founderName: string;
  founderTitle: string;
  contactEmail: string;
  supportEmail: string;
  hqAddress: string;
  legalEntity: string;
  maintenanceMode: boolean;
  maintenanceNotice: string;
  appVersion: string;
  environment: 'production' | 'staging' | 'development';
  primaryDomain?: string;
  websiteUrl?: string;
}
