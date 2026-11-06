/**
 * STARTBILL INC. - Documentation Juridique & Conformité RGPD / Loi 25 / LPRPDE
 * Source: STARTBILL_Politique_de_confidentialite_Projet_3cc4ccaa.pdf
 *         STARTBILL_Dossier_juridique_13_documents_Projet_32635ca7.pdf
 * Version de travail du 4 novembre 2026 | STARTBILL.ca
 */

export interface LegalSection {
  title: string;
  content: string[];
}

export interface LegalDocument {
  id: string;
  docNumber: string;
  title: string;
  shortTitle: string;
  category: 'rgpd_privacy' | 'terms_contracts' | 'security_compliance';
  categoryLabel: string;
  summary: string;
  versionDate: string;
  pdfUrl: string;
  sections: LegalSection[];
  tags: string[];
}

export const LEGAL_COMPANY_INFO = {
  name: 'STARTBILL INC.',
  legalForm: 'Société constituée sous le régime fédéral canadien',
  federalNumber: '1001795209',
  headquarters: '6-2160 Highway 7, suite 653 Vaughan, ON, Canada - L4K1W6',
  email: 'contact.startbill@gmail.com',
  dpoName: 'Ferline GOUEFACK ZOGNI',
  dpoRole: 'Responsable de la protection des renseignements personnels (DPO)',
  website: 'STARTBILL.ca',
  dossierPdfUrl: '/assets/aistudio/STARTBILL_Dossier_juridique_13_documents_Projet_32635ca7.pdf',
  privacyPdfUrl: '/assets/aistudio/STARTBILL_Politique_de_confidentialite_Projet_3cc4ccaa.pdf'
};

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    id: 'politique-confidentialite',
    docNumber: 'DOC RGPD',
    title: 'Politique de confidentialité (Conformité RGPD & Loi 25)',
    shortTitle: 'Confidentialité & RGPD',
    category: 'rgpd_privacy',
    categoryLabel: 'Protection des Données & RGPD',
    summary: 'Règles de traitement des renseignements personnels, droits RGPD/Loi 25, finalités, hébergement et coordonnées du responsable de la protection des données.',
    versionDate: '4 novembre 2026',
    pdfUrl: LEGAL_COMPANY_INFO.privacyPdfUrl,
    tags: ['RGPD', 'Loi 25', 'LPRPDE', 'DPO', 'Données personnelles', 'Vie privée'],
    sections: [
      {
        title: '1. Qui sommes-nous ?',
        content: [
          'STARTBILL INC. (« STARTBILL », « nous ») développe une solution numérique de facturation et d’organisation administrative et financière destinée notamment aux travailleurs autonomes et aux petites entreprises.',
          'La présente politique explique comment nous traitons les renseignements personnels dans le cadre du site Web, des demandes de contact, du programme pilote et, lorsqu’ils sont disponibles, des services applicatifs STARTBILL.',
          'Responsable de la protection des renseignements personnels : Ferline GOUEFACK ZOGNI.',
          'Contact : contact.startbill@gmail.com.',
          'Adresse de correspondance de l’entreprise : 6-2160 Highway 7, suite 653, Vaughan, ON, Canada - L4K1W6.'
        ]
      },
      {
        title: '2. Quels renseignements pouvons-nous recueillir ?',
        content: [
          'Selon les fonctions utilisées, nous pouvons recueillir :',
          '(a) nom, prénom, entreprise, coordonnées professionnelles et pays;',
          '(b) informations de compte, identifiants et paramètres;',
          '(c) données de facturation, notamment noms et coordonnées des clients, descriptions de services, montants, taxes, échéances et statut des factures;',
          '(d) données de dépenses et documents téléversés, si cette fonctionnalité est disponible;',
          '(e) échanges avec notre équipe, réponses aux sondages et commentaires des utilisateurs pilotes;',
          '(f) données techniques nécessaires au fonctionnement et à la sécurité du service, telles que journaux d’accès, type d’appareil et adresse IP, selon les outils effectivement déployés.',
          'Nous demandons de ne pas transmettre de renseignements personnels ou financiers non nécessaires à l’utilisation du service. Les utilisateurs qui inscrivent les renseignements de leurs propres clients doivent disposer d’un fondement approprié pour le faire et respecter leurs obligations légales.'
        ]
      },
      {
        title: '3. Pourquoi utilisons-nous ces renseignements ?',
        content: [
          'Nous utilisons les renseignements pertinents pour répondre aux demandes, gérer les inscriptions, fournir les fonctionnalités demandées, créer et suivre les factures, assurer le soutien technique, prévenir les abus, protéger la plateforme, améliorer l’expérience utilisateur et respecter les obligations légales applicables.',
          'Les communications promotionnelles sont envoyées conformément aux règles applicables et aux choix de la personne concernée.'
        ]
      },
      {
        title: '4. Consentement et autres fondements applicables',
        content: [
          'Nous recueillons et utilisons les renseignements personnels avec le consentement requis ou selon un autre fondement autorisé par les lois applicables (exécution du contrat, respect des obligations légales).',
          'Lorsque la loi l’exige, nous expliquons les finalités avant la collecte et demandons un consentement distinct pour les usages qui le nécessitent. Vous pouvez retirer votre consentement lorsque cela est possible, sous réserve de restrictions légales ou contractuelles; certaines fonctionnalités pourraient alors ne plus être accessibles.'
        ]
      },
      {
        title: '5. Accès, fournisseurs et communication des données',
        content: [
          'L’accès aux renseignements est limité aux personnes qui en ont besoin pour leurs fonctions.',
          'Nous pouvons recourir à des prestataires techniques pour l’hébergement, l’authentification, les communications, l’analyse ou le soutien, uniquement selon les services réellement retenus.',
          'Nous ne vendons pas les renseignements personnels des utilisateurs. Toute communication à un tiers doit être justifiée, encadrée contractuellement et conforme aux lois applicables.'
        ]
      },
      {
        title: '6. Hébergement et transferts internationaux',
        content: [
          'STARTBILL peut servir des utilisateurs situés dans différents pays.',
          'Avant toute communication ou transfert de données hors du Québec ou du Canada (notamment vers l’Union Européenne ou les États-Unis), nous effectuons les évaluations des facteurs relatifs à la vie privée et prenons les mesures contractuelles et de protection requises par la législation applicable (Clauses Contractuelles Types, chiffrement renforcé).'
        ]
      },
      {
        title: '7. Sécurité des renseignements',
        content: [
          'Nous visons à mettre en place des mesures proportionnées à la sensibilité des renseignements, notamment des contrôles d’accès stricts, une gestion appropriée des identifiants et mots de passe salés et hachés, la protection des communications par chiffrement en transit (TLS/HTTPS) et au repos (AES-256), des sauvegardes régulières et une procédure formelle de gestion des incidents.',
          'Aucun système n’offre une sécurité absolue, mais nos normes d’ingénierie suivent les meilleures pratiques de l’industrie.'
        ]
      },
      {
        title: '8. Durée de conservation',
        content: [
          'Nous conservons les renseignements aussi longtemps que nécessaire pour les finalités annoncées et pour satisfaire aux obligations légales applicables (ex. exigences fiscales de conservation de 6 ans pour les pièces comptables), puis les supprimons ou les anonymisons de manière irréversible lorsque cela est permis et approprié.'
        ]
      },
      {
        title: '9. Vos droits et vos choix (Droits RGPD & Loi 25)',
        content: [
          'Selon les lois applicables (notamment le Règlement Général sur la Protection des Données et la Loi 25 québécoise) et votre situation, vous bénéficiez des droits suivants :',
          '• Droit d’accès aux renseignements personnels que nous détenons à votre sujet;',
          '• Droit de rectification des renseignements inexacts ou incomplets;',
          '• Droit à l’effacement (droit à l’oubli) de vos données dans les cas prévus par la loi;',
          '• Droit à la limitation du traitement et droit d’opposition;',
          '• Droit à la portabilité des données dans un format technologique structuré et couramment utilisé (JSON / CSV);',
          '• Droit de retirer votre consentement à tout moment.',
          'Pour exercer l’un de ces droits, adressez votre demande à notre DPO : contact.startbill@gmail.com. Une vérification d’identité pourra être requise pour protéger vos données.'
        ]
      },
      {
        title: '10. Témoins de connexion (cookies) et technologies similaires',
        content: [
          'Le site utilise des témoins indispensables à l’authentification et à la sécurité de votre session.',
          'Les traceurs non essentiels requièrent votre consentement explicite via notre bandeau de préférences. Vous pouvez modifier vos choix à tout moment depuis le lien de gestion des cookies situé dans le pied de page.'
        ]
      },
      {
        title: '11. Factures et renseignements concernant les clients de nos utilisateurs',
        content: [
          'Lorsqu’un utilisateur crée une facture, il peut y inscrire des renseignements sur ses propres clients. Ces renseignements sont traités sous l’autorité de l’utilisateur pour fournir le service de facturation.',
          'Les utilisateurs demeurent responsables de la licéité de la collecte des données de leurs clients. STARTBILL n’utilise jamais ces données de facturation à des fins publicitaires ou étrangères à l’exécution du service.'
        ]
      },
      {
        title: '12. Utilisateurs mineurs',
        content: [
          'STARTBILL s’adresse exclusivement aux professionnels, travailleurs autonomes et entreprises. Les services sont réservés aux personnes âgées de 18 ans et plus ayant la pleine capacité juridique de contracter.',
          'STARTBILL ne permet pas sciemment aux personnes mineures de souscrire ou de créer un compte.'
        ]
      },
      {
        title: '13. Incidents de confidentialité',
        content: [
          'En cas d’incident touchant des renseignements personnels présentant un risque de préjudice sérieux, nous appliquons immédiatement notre plan de réponse d’urgence, inscrivons l’événement au registre obligatoire et notifions sans délai les personnes concernées et les autorités de protection compétentes (ex. CAI au Québec, CPVP au Canada, CNIL en Europe).'
        ]
      },
      {
        title: '14. Modifications de la politique',
        content: [
          'Nous pouvons mettre à jour cette politique pour refléter les évolutions techniques ou réglementaires du service. La date de dernière mise à jour est toujours affichée en tête de document. En cas de modification substantielle, une notification sera adressée aux utilisateurs.'
        ]
      },
      {
        title: '15. Nous joindre',
        content: [
          'Pour toute question, demande d’accès, de rectification ou plainte concernant vos renseignements personnels :',
          'Courriel officiel DPO : contact.startbill@gmail.com',
          'Responsable : Ferline GOUEFACK ZOGNI',
          'Adresse postale : STARTBILL INC., 6-2160 Highway 7, suite 653, Vaughan, ON, Canada - L4K1W6.'
        ]
      }
    ]
  },
  {
    id: 'mentions-legales',
    docNumber: 'DOC 01',
    title: 'Mentions légales',
    shortTitle: 'Mentions légales',
    category: 'terms_contracts',
    categoryLabel: 'Conditions & Contrats',
    summary: 'Identification légale de la société éditrice STARTBILL INC., hébergement, propriété intellectuelle et responsabilités.',
    versionDate: '4 novembre 2026',
    pdfUrl: LEGAL_COMPANY_INFO.dossierPdfUrl,
    tags: ['Société fédérale', 'Éditeur', 'Hébergement', 'Propriété intellectuelle'],
    sections: [
      {
        title: '1. Identification de l’éditeur',
        content: [
          'Le site STARTBILL.ca et les services applicatifs associés sont édités par STARTBILL INC., société de régime fédéral canadien.',
          'Dénomination : STARTBILL INC.',
          'Siège social : 6-2160 Highway 7, suite 653 Vaughan, ON, Canada - L4K1W6.',
          'Numéro de société fédérale : 1001795209.',
          'Courriel de contact : contact.startbill@gmail.com.'
        ]
      },
      {
        title: '2. Objet du site',
        content: [
          'Le site présente un service logiciel de facturation et de gestion administrative et financière SaaS destiné aux entreprises et travailleurs indépendants.',
          'Les descriptions des fonctions, les disponibilités géographiques et les prix applicables sont actualisés à mesure du déploiement opérationnel.'
        ]
      },
      {
        title: '3. Hébergement et infrastructure',
        content: [
          'L’infrastructure cloud, les serveurs d’hébergement et les bases de données sécurisées sont déployés sur des centres de données sécurisés (Google Cloud Platform / Firebase) bénéficiant de certifications de conformité strictes (ISO 27001, SOC 2, HIPAA, conformité RGPD).'
        ]
      },
      {
        title: '4. Propriété intellectuelle',
        content: [
          'Les marques STARTBILL, logos, chartes graphiques, textes, logiciels et interfaces sont la propriété exclusive de STARTBILL INC. Toute reproduction, distribution ou exploitation non autorisée est strictement prohibée.'
        ]
      },
      {
        title: '5. Informations publiées et responsabilité',
        content: [
          'Les fonctionnalités d’aide au calcul de taxes et de ratios financiers ont une vocation d’organisation comptable et ne remplacent en aucun cas un avis professionnel individualisé d’un expert-comptable ou fiscaliste agréé.'
        ]
      },
      {
        title: '6. Liens, contact et mises à jour',
        content: [
          'Pour tout signalement ou question : contact.startbill@gmail.com.',
          'Date de dernière mise à jour : 4 novembre 2026.'
        ]
      }
    ]
  },
  {
    id: 'cgu',
    docNumber: 'DOC 02',
    title: 'Conditions générales d’utilisation (CGU)',
    shortTitle: 'CGU - Utilisation',
    category: 'terms_contracts',
    categoryLabel: 'Conditions & Contrats',
    summary: 'Règles régissant l’accès au service, admissibilité des comptes, obligations des utilisateurs et limites du service.',
    versionDate: '4 novembre 2026',
    pdfUrl: LEGAL_COMPANY_INFO.dossierPdfUrl,
    tags: ['CGU', 'Compte', 'Obligations', 'Accès'],
    sections: [
      {
        title: '1. Champ d’application et acceptation',
        content: [
          'Les présentes CGU encadrent l’accès au site et à l’application STARTBILL. La création d’un compte ou l’utilisation du service suppose l’acceptation pleine et entière des CGU en vigueur.'
        ]
      },
      {
        title: '2. Admissibilité et compte',
        content: [
          'L’utilisateur déclare avoir la pleine capacité juridique pour contracter. Il est responsable de la stricte confidentialité de ses identifiants de connexion et de toute action effectuée depuis son compte.'
        ]
      },
      {
        title: '3. Description du service',
        content: [
          'STARTBILL facilite l’émission de factures conformes, la gestion de devis, le suivi des dépenses, la tenue des fichiers clients et le calcul estimatif des taxes régionales selon le territoire de l’entreprise.'
        ]
      },
      {
        title: '4. Obligations de l’utilisateur',
        content: [
          'L’utilisateur garantit la véracité des montants, descriptions, mentions fiscales et justificatifs enregistrés. Il s’interdit d’utiliser STARTBILL pour toute activité frauduleuse, spam ou blanchiment.'
        ]
      },
      {
        title: '5. Données et confidentialité',
        content: [
          'L’utilisateur conserve l’entière propriété des données commerciales qu’il saisit. STARTBILL ne les traite que pour l’exécution et la sécurisation du service.'
        ]
      },
      {
        title: '6. Absence de conseil fiscal et limites',
        content: [
          'STARTBILL est une plateforme logicielle et non un cabinet d’expertise comptable. L’utilisateur reste seul responsable de ses déclarations officielles auprès des autorités fiscales.'
        ]
      }
    ]
  },
  {
    id: 'cgv',
    docNumber: 'DOC 03',
    title: 'Conditions générales de vente (CGV)',
    shortTitle: 'CGV - Ventes & Abonnements',
    category: 'terms_contracts',
    categoryLabel: 'Conditions & Contrats',
    summary: 'Modalités de souscription aux forfaits payants StartBill, tarification par devise, facturation Stripe et renouvellement.',
    versionDate: '4 novembre 2026',
    pdfUrl: LEGAL_COMPANY_INFO.dossierPdfUrl,
    tags: ['CGV', 'Tarifs', 'Stripe', 'Abonnement', 'Paiement'],
    sections: [
      {
        title: '1. Portée et information précontractuelle',
        content: [
          'Ces CGV régissent les abonnements payants proposés par STARTBILL. Avant toute commande, l’utilisateur reçoit le prix total, la devise applicable, les taxes et les modalités de renouvellement.'
        ]
      },
      {
        title: '2. Offres et tarifs',
        content: [
          'Les forfaits (Gratuit, Start, Pro) sont affichés avec distinction claire des devises régionales (CAD au Canada, FCFA en Afrique de l’Ouest, HTG en Haïti). Les réductions annuelles (ex. 20% d’économie) sont clairement détaillées avant validation.'
        ]
      },
      {
        title: '3. Paiement et facturation',
        content: [
          'Les paiements par carte bancaire sont traités par des prestataires de paiement certifiés PCI-DSS de niveau 1 (Stripe). STARTBILL ne conserve aucun numéro complet de carte bancaire sur ses serveurs.'
        ]
      },
      {
        title: '4. Annulation et résiliation',
        content: [
          'L’utilisateur peut annuler son abonnement à tout moment depuis son espace paramètres. L’accès aux fonctionnalités du forfait souscrit demeure actif jusqu’à la fin de la période de facturation en cours.'
        ]
      }
    ]
  },
  {
    id: 'politique-cookies',
    docNumber: 'DOC 04',
    title: 'Politique relative aux cookies (Témoins de connexion)',
    shortTitle: 'Politique des Cookies',
    category: 'rgpd_privacy',
    categoryLabel: 'Protection des Données & RGPD',
    summary: 'Inventaire des traceurs et témoins techniques utilisés, cookies de session indispensables et options de paramétrage.',
    versionDate: '4 novembre 2026',
    pdfUrl: LEGAL_COMPANY_INFO.dossierPdfUrl,
    tags: ['Cookies', 'Traceurs', 'Session', 'Consentement', 'ePrivacy'],
    sections: [
      {
        title: '1. Objet',
        content: [
          'La présente politique détaille l’utilisation des témoins de connexion (cookies) et technologies de stockage local sur STARTBILL.ca.'
        ]
      },
      {
        title: '2. Catégories de témoins',
        content: [
          '• Témoins strictement nécessaires : Authentification Firebase Auth, maintien du jeton de sécurité de session, mémorisation de la région fiscale choisie et préférences d’affichage.',
          '• Témoins analytiques et de performance : Aucun traceur publicitaire ou de profilage intrusif n’est utilisé sans consentement préalable explicite.'
        ]
      },
      {
        title: '3. Choix et contrôle du consentement',
        content: [
          'Conformément aux normes RGPD et de la Loi 25, les témoins non essentiels sont désactivés par défaut. Vous pouvez à tout moment accepter, refuser ou personnaliser vos préférences de cookies.'
        ]
      }
    ]
  },
  {
    id: 'remboursement-annulation',
    docNumber: 'DOC 05',
    title: 'Politique de remboursement et d’annulation',
    shortTitle: 'Remboursement & Annulation',
    category: 'terms_contracts',
    categoryLabel: 'Conditions & Contrats',
    summary: 'Règles d’annulation d’abonnement, gestion des incidents de facturation et respect des droits des consommateurs.',
    versionDate: '4 novembre 2026',
    pdfUrl: LEGAL_COMPANY_INFO.dossierPdfUrl,
    tags: ['Remboursement', 'Résiliation', 'Contrat', 'Garantie'],
    sections: [
      {
        title: '1. Priorité de la loi et transparence',
        content: [
          'Les dispositions impératives relatives à la protection du consommateur s’appliquent en priorité.',
          'Toute souscription fait l’objet d’un récapitulatif clair du montant facturé et des échéances de renouvellement.'
        ]
      },
      {
        title: '2. Procédure d’annulation',
        content: [
          'L’annulation s’effectue en un clic depuis les paramètres du compte ou par courriel à contact.startbill@gmail.com sans pénalité.'
        ]
      },
      {
        title: '3. Incidents techniques et facturations erronées',
        content: [
          'En cas d’anomalie technique, de double débit avéré ou d’interruption prolongée de service, STARTBILL procède au remboursement complet sur demande après vérification dans un délai de 5 à 10 jours ouvrés.'
        ]
      }
    ]
  },
  {
    id: 'politique-securite',
    docNumber: 'DOC 06',
    title: 'Politique de sécurité de l’information',
    shortTitle: 'Politique de Sécurité',
    category: 'security_compliance',
    categoryLabel: 'Sécurité & Gouvernance',
    summary: 'Mesures techniques et organisationnelles : chiffrement en transit TLS, chiffrement au repos AES-256, gestion des clés et contrôle des accès.',
    versionDate: '4 novembre 2026',
    pdfUrl: LEGAL_COMPANY_INFO.dossierPdfUrl,
    tags: ['Sécurité', 'Chiffrement', 'AES-256', 'TLS', 'Sauvegardes'],
    sections: [
      {
        title: '1. Principes fondamentaux',
        content: [
          'STARTBILL applique les principes de sécurité dès la conception (Security by Design) et par défaut (Security by Default) pour protéger l’ensemble des données financières et identifiants des utilisateurs.'
        ]
      },
      {
        title: '2. Mesures techniques de protection',
        content: [
          '• Chiffrement de toutes les communications par protocole TLS 1.3 avec certificats HTTPS stricts.',
          '• Chiffrement des bases de données au repos (AES-256) sur infrastructure certifiée.',
          '• Cloisonnement logique strict des données par identifiant utilisateur (UID) et règles de sécurité Firestore auditées.',
          '• Hachage robuste des mots de passe avec algorithme bcrypt salé.',
          '• Journalisation des accès d’administration et surveillance des anomalies.'
        ]
      },
      {
        title: '3. Sauvegardes et continuité d’activité',
        content: [
          'Des sauvegardes redondantes automatiques quotidiennes sont opérées avec réplication multi-zones pour garantir un rétablissement rapide en cas d’incident.'
        ]
      }
    ]
  },
  {
    id: 'conservation-suppression',
    docNumber: 'DOC 07',
    title: 'Conservation et suppression des données (Minimisation RGPD)',
    shortTitle: 'Conservation & Suppression',
    category: 'rgpd_privacy',
    categoryLabel: 'Protection des Données & RGPD',
    summary: 'Calendrier de conservation des pièces comptables, droit à l’effacement et procédures d’exportation sécurisée des données.',
    versionDate: '4 novembre 2026',
    pdfUrl: LEGAL_COMPANY_INFO.dossierPdfUrl,
    tags: ['RGPD', 'Effacement', 'Archivage', 'Minimisation', 'Export'],
    sections: [
      {
        title: '1. Principe de minimisation',
        content: [
          'STARTBILL applique le principe strict de minimisation : seules les données indispensables à la tenue de la facturation et au respect des obligations légales sont collectées.'
        ]
      },
      {
        title: '2. Délais de conservation',
        content: [
          '• Données de compte actif : Conservées pendant la durée de la relation contractuelle.',
          '• Factures et pièces justificatives : Conservées pendant la durée légale fiscale impérative (6 ans au Canada et normes comptables régionales correspondantes).',
          '• Comptes supprimés ou inactifs : Purge automatique des données après un délai de grâce permettant la récupération par l’utilisateur.'
        ]
      },
      {
        title: '3. Droit à la suppression et export',
        content: [
          'L’utilisateur peut exporter l’ensemble de ses factures et données comptables aux formats PDF et CSV à tout moment avant clôture de son compte.'
        ]
      }
    ]
  },
  {
    id: 'utilisation-acceptable',
    docNumber: 'DOC 08',
    title: 'Politique d’utilisation acceptable (AUP)',
    shortTitle: 'Utilisation Acceptable',
    category: 'security_compliance',
    categoryLabel: 'Sécurité & Gouvernance',
    summary: 'Comportements proscrits : factures fictives, blanchiment, tentatives d’intrusion, spam ou usurpation d’identité.',
    versionDate: '4 novembre 2026',
    pdfUrl: LEGAL_COMPANY_INFO.dossierPdfUrl,
    tags: ['AUP', 'Règles', 'Interdictions', 'Fraude'],
    sections: [
      {
        title: '1. Usages permis',
        content: [
          'STARTBILL doit être utilisé exclusivement pour des opérations commerciales licites et légitimes de facturation et de gestion d’entreprise.'
        ]
      },
      {
        title: '2. Usages strictement interdits',
        content: [
          'Sont formellement interdits : l’émission de factures fictives ou de complaisance, les tentatives d’ingénierie inverse, le contournement des mesures d’authentification, les tests de pénétration non autorisés et l’envoi de pourriels (spam).'
        ]
      },
      {
        title: '3. Sanctions en cas d’infraction',
        content: [
          'En cas de violation grave ou répétée, STARTBILL se réserve le droit de suspendre immédiatement le compte fautif et d’informer les autorités compétentes le cas échéant.'
        ]
      }
    ]
  },
  {
    id: 'accord-traitement-donnees-dpa',
    docNumber: 'DOC 09',
    title: 'Accord de traitement des données (DPA) — Modèle client professionnel',
    shortTitle: 'Accord DPA (Sous-traitance RGPD)',
    category: 'rgpd_privacy',
    categoryLabel: 'Protection des Données & RGPD',
    summary: 'Cadre contractuel de sous-traitance conforme à l’article 28 du RGPD : instructions documentées, sécurité, audits et assistance.',
    versionDate: '4 novembre 2026',
    pdfUrl: LEGAL_COMPANY_INFO.dossierPdfUrl,
    tags: ['DPA', 'RGPD Art 28', 'Sous-traitance', 'Audit', 'Sécurité'],
    sections: [
      {
        title: '1. Rôles respectifs',
        content: [
          'Dans le cadre du RGPD et des lois applicables, le Client professionnel agit en qualité de Responsable de traitement pour les données personnelles de ses propres clients finaux, et STARTBILL INC. agit en qualité de Sous-traitant.'
        ]
      },
      {
        title: '2. Obligations de STARTBILL',
        content: [
          'STARTBILL s’engage à ne traiter les données que sur instructions documentées du client, à garantir la stricte confidentialité du personnel ayant accès aux données, à déployer les mesures de sécurité requises et à assister le client dans l’exercice des droits de ses utilisateurs.'
        ]
      },
      {
        title: '3. Vérification de la conformité et audits',
        content: [
          'STARTBILL met à la disposition de ses clients professionnels les informations nécessaires pour attester du respect de ses obligations en matière de sécurité et de conformité RGPD, et accepte les demandes de vérification raisonnables selon les modalités prévues au contrat.'
        ]
      }
    ]
  },
  {
    id: 'accord-niveau-service-sla',
    docNumber: 'DOC 10',
    title: 'Accord de niveau de service (SLA) — Modèle d’engagement',
    shortTitle: 'Accord de Service (SLA)',
    category: 'terms_contracts',
    categoryLabel: 'Conditions & Contrats',
    summary: 'Engagements de disponibilité applicative, fenêtres de maintenance et procédures de prise en charge du support.',
    versionDate: '4 novembre 2026',
    pdfUrl: LEGAL_COMPANY_INFO.dossierPdfUrl,
    tags: ['SLA', 'Disponibilité', 'Uptime', 'Maintenance', 'Support'],
    sections: [
      {
        title: '1. Objectif de disponibilité',
        content: [
          'STARTBILL vise un taux de disponibilité mensuel élevé de ses serveurs applicatifs (objectif de 99,5%), hors fenêtres de maintenance planifiée communiquées préalablement.'
        ]
      },
      {
        title: '2. Niveaux de sévérité du support',
        content: [
          '• Critique : Service totalement inaccessible — Prise en charge prioritaire sous 4 heures.',
          '• Élevé : Fonction essentielle ralentie ou dégradée — Prise en charge sous 12 heures.',
          '• Normal : Question d’utilisation ou défaut mineur — Prise en charge sous 24 à 48 heures ouvrées.'
        ]
      }
    ]
  },
  {
    id: 'propriete-intellectuelle',
    docNumber: 'DOC 11',
    title: 'Politique de propriété intellectuelle',
    shortTitle: 'Propriété Intellectuelle',
    category: 'security_compliance',
    categoryLabel: 'Sécurité & Gouvernance',
    summary: 'Droits exclusifs sur la marque STARTBILL, code source et interfaces, et respect des droits de propriété des clients sur leurs contenus.',
    versionDate: '4 novembre 2026',
    pdfUrl: LEGAL_COMPANY_INFO.dossierPdfUrl,
    tags: ['Marque', 'Droits d’auteur', 'Licence', 'Logos'],
    sections: [
      {
        title: '1. Droits sur la plateforme STARTBILL',
        content: [
          'STARTBILL INC. détient l’ensemble des droits de propriété intellectuelle afférents au logiciel, à ses algorithmes, ses interfaces, sa base de code, sa marque et son identité visuelle.'
        ]
      },
      {
        title: '2. Droits du client sur ses données',
        content: [
          'Le client demeure propriétaire exclusif de ses logos, marques, données de facturation et documents d’entreprise téléversés sur la plateforme.'
        ]
      }
    ]
  },
  {
    id: 'gestion-incidents',
    docNumber: 'DOC 12',
    title: 'Politique de gestion des incidents de sécurité et confidentialité',
    shortTitle: 'Gestion des Incidents',
    category: 'security_compliance',
    categoryLabel: 'Sécurité & Gouvernance',
    summary: 'Protocole formel de détection, confinement, analyse d’impact, tenue du registre des incidents et notification obligatoire aux autorités.',
    versionDate: '4 novembre 2026',
    pdfUrl: LEGAL_COMPANY_INFO.dossierPdfUrl,
    tags: ['Incidents', 'Violation de données', 'Notification', 'Registre'],
    sections: [
      {
        title: '1. Détection et qualification',
        content: [
          'Tout incident de sécurité potentiel fait l’objet d’une qualification immédiate par l’équipe technique pour mesurer la portée, la criticité et la nature des données potentiellement affectées.'
        ]
      },
      {
        title: '2. Obligations légales de notification (RGPD & Loi 25)',
        content: [
          'Conformément à l’article 33 du RGPD et aux exigences de la Loi 25 au Québec, en présence d’un risque sérieux pour les droits et libertés des personnes, STARTBILL notifie l’autorité compétente dans un délai maximal de 72 heures et informe les personnes concernées avec recommandations pratiques de protection.'
        ]
      }
    ]
  },
  {
    id: 'support-reclamations',
    docNumber: 'DOC 13',
    title: 'Politique de support technique et de gestion des réclamations',
    shortTitle: 'Support & Réclamations',
    category: 'terms_contracts',
    categoryLabel: 'Conditions & Contrats',
    summary: 'Canaux officiels de contact, délais indicatifs de réponse, procédure d’escalade et traitement équitable des réclamations.',
    versionDate: '4 novembre 2026',
    pdfUrl: LEGAL_COMPANY_INFO.dossierPdfUrl,
    tags: ['Support', 'Réclamations', 'Assistance', 'Contact'],
    sections: [
      {
        title: '1. Canal officiel et prise de contact',
        content: [
          'STARTBILL centralise l’ensemble de ses demandes de support et réclamations à l’adresse électronique officielle : contact.startbill@gmail.com.',
          'Pour un traitement efficace, l’utilisateur est invité à préciser son identifiant de compte, la description détaillée de la demande et les éventuels messages d’erreur.'
        ]
      },
      {
        title: '2. Engagement de traitement et escalade',
        content: [
          'Chaque demande reçoit un accusé de réception automatique. Si la réponse initiale nécessite un réexamen, le dossier est transmis au responsable dédié pour une résolution amiable et diligente.'
        ]
      }
    ]
  }
];
