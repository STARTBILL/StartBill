import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  writeBatch 
} from 'firebase/firestore';
import { db } from './firebase';
import { SUPER_ADMIN_EMAIL, isSuperAdminEmail } from './authSecurity';

export interface AdminUser {
  uid: string;
  email: string;
  role: 'admin' | 'user';
  firstName?: string;
  lastName?: string;
  fullName?: string;
  companyName?: string;
  plan?: 'free' | 'pro' | 'enterprise';
  region?: 'canada' | 'afrique' | 'haiti';
  status?: 'active' | 'suspended';
  createdAt: string;
  updatedAt?: string;
}

export interface AdminSubscription {
  id: string;
  userId: string;
  userEmail: string;
  plan: 'free' | 'pro' | 'enterprise';
  amount: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  startDate: string;
  nextBillingDate: string;
  region?: string;
}

export interface AdminPayment {
  id: string;
  invoiceId?: string;
  userId: string;
  userEmail: string;
  amount: number;
  currency: string;
  method: string;
  status: 'success' | 'pending' | 'failed' | 'refunded';
  date: string;
  transactionRef?: string;
  notes?: string;
}

export interface LearningArticle {
  id: string;
  title: string;
  slug: string;
  category: 'Fiscalité' | 'Facturation' | 'Trésorerie' | 'Légal' | 'Conseils' | 'Général';
  excerpt: string;
  content: string;
  author: string;
  readTime: string;
  published: boolean;
  targetRegion: 'all' | 'canada' | 'afrique' | 'haiti';
  createdAt: string;
  updatedAt?: string;
  viewsCount?: number;
}

export interface GlobalAlert {
  id: string;
  userId?: string;
  title: string;
  message: string;
  severity: 'info' | 'success' | 'warning' | 'danger';
  isRead?: boolean;
  isGlobal: boolean;
  targetRegion?: 'all' | 'canada' | 'afrique' | 'haiti';
  createdAt: string;
  actionUrl?: string;
}

export interface RegionalSettingConfig {
  id: 'canada' | 'afrique' | 'haiti';
  name: string;
  currency: string;
  currencySymbol: string;
  defaultGst: number;
  defaultPst: number;
  defaultQst: number;
  isChannelActive: boolean;
  supportedPaymentMethods: string[];
}

// -------------------------------------------------------------
// SEED DEFAULT DATA
// -------------------------------------------------------------
export async function seedInitialAdminData(): Promise<void> {
  try {
    // 1. Ensure Super Admin User (contact.startbill@gmail.com) exists
    const superAdminDocRef = doc(db, 'users', 'super_admin_contact');
    const superAdminSnap = await getDoc(superAdminDocRef);
    if (!superAdminSnap.exists()) {
      await setDoc(superAdminDocRef, {
        uid: 'super_admin_contact',
        email: SUPER_ADMIN_EMAIL,
        role: 'admin',
        firstName: 'Super',
        lastName: 'Admin',
        fullName: 'Super Administrateur StartBill',
        companyName: 'StartBill Global HQ',
        plan: 'enterprise',
        region: 'canada',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // 2. Also ensure legacy admin user exists
    const adminDocRef = doc(db, 'users', 'admin_uid');
    const adminSnap = await getDoc(adminDocRef);
    if (!adminSnap.exists()) {
      await setDoc(adminDocRef, {
        uid: 'admin_uid',
        email: 'admin@startbill.com',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'StartBill',
        fullName: 'Admin StartBill',
        companyName: 'StartBill HQ Inc.',
        plan: 'enterprise',
        region: 'canada',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // 2. Seed Users if empty
    const usersSnap = await getDocs(collection(db, 'users'));
    if (usersSnap.size <= 1) {
      const sampleUsers: AdminUser[] = [
        {
          uid: 'user_ferline_01',
          email: 'ferline.zogni@startbill.ca',
          role: 'user',
          firstName: 'Ferline',
          lastName: 'Zogni',
          fullName: 'Ferline Zogni',
          companyName: 'Studio Graphique Montréal',
          plan: 'pro',
          region: 'canada',
          status: 'active',
          createdAt: '2026-01-15T10:00:00.000Z'
        },
        {
          uid: 'user_mamadou_02',
          email: 'mamadou.diallo@startbill.afrique',
          role: 'user',
          firstName: 'Mamadou',
          lastName: 'Diallo',
          fullName: 'Mamadou Diallo',
          companyName: 'TechSenegal Sarl',
          plan: 'free',
          region: 'afrique',
          status: 'active',
          createdAt: '2026-02-01T14:30:00.000Z'
        },
        {
          uid: 'user_jean_03',
          email: 'jean.baptiste@startbill.ht',
          role: 'user',
          firstName: 'Jean-Baptiste',
          lastName: 'Pierre',
          fullName: 'Jean-Baptiste Pierre',
          companyName: 'Haiti Logistics SA',
          plan: 'pro',
          region: 'haiti',
          status: 'active',
          createdAt: '2026-03-10T09:15:00.000Z'
        }
      ];

      for (const u of sampleUsers) {
        await setDoc(doc(db, 'users', u.uid), u, { merge: true });
      }
    }

    // 3. Seed Subscriptions if empty
    const subsSnap = await getDocs(collection(db, 'subscriptions'));
    if (subsSnap.empty) {
      const sampleSubs: AdminSubscription[] = [
        {
          id: 'sub_001',
          userId: 'user_ferline_01',
          userEmail: 'ferline.zogni@startbill.ca',
          plan: 'pro',
          amount: 19.99,
          currency: 'CAD',
          interval: 'monthly',
          status: 'active',
          startDate: '2026-01-15',
          nextBillingDate: '2026-08-15',
          region: 'canada'
        },
        {
          id: 'sub_002',
          userId: 'user_jean_03',
          userEmail: 'jean.baptiste@startbill.ht',
          plan: 'pro',
          amount: 2500,
          currency: 'HTG',
          interval: 'monthly',
          status: 'active',
          startDate: '2026-03-10',
          nextBillingDate: '2026-08-10',
          region: 'haiti'
        },
        {
          id: 'sub_003',
          userId: 'admin_uid',
          userEmail: 'admin@startbill.com',
          plan: 'enterprise',
          amount: 99.00,
          currency: 'CAD',
          interval: 'monthly',
          status: 'active',
          startDate: '2026-01-01',
          nextBillingDate: '2026-08-01',
          region: 'canada'
        }
      ];

      for (const s of sampleSubs) {
        await setDoc(doc(db, 'subscriptions', s.id), s);
      }
    }

    // 4. Seed Payments if empty
    const paymentsSnap = await getDocs(collection(db, 'payments'));
    if (paymentsSnap.empty) {
      const samplePayments: AdminPayment[] = [
        {
          id: 'pay_101',
          invoiceId: 'FACT-2026-001',
          userId: 'user_ferline_01',
          userEmail: 'ferline.zogni@startbill.ca',
          amount: 1149.71,
          currency: 'CAD',
          method: 'Interac e-Transfer',
          status: 'success',
          date: '2026-05-12',
          transactionRef: 'INT-998124'
        },
        {
          id: 'pay_102',
          invoiceId: 'FACT-2026-002',
          userId: 'user_jean_03',
          userEmail: 'jean.baptiste@startbill.ht',
          amount: 45000,
          currency: 'HTG',
          method: 'MonCash Mobile Money',
          status: 'success',
          date: '2026-05-18',
          transactionRef: 'MC-881204'
        },
        {
          id: 'pay_103',
          invoiceId: 'FACT-2026-003',
          userId: 'user_mamadou_02',
          userEmail: 'mamadou.diallo@startbill.afrique',
          amount: 350000,
          currency: 'XOF',
          method: 'Orange Money',
          status: 'pending',
          date: '2026-05-22',
          transactionRef: 'OM-332910'
        }
      ];

      for (const p of samplePayments) {
        await setDoc(doc(db, 'payments', p.id), p);
      }
    }

    // 5. Seed Learning Articles if empty
    const articlesSnap = await getDocs(collection(db, 'learning_articles'));
    if (articlesSnap.empty) {
      const sampleArticles: LearningArticle[] = [
        {
          id: 'art_01',
          title: 'Guide complet TPS et TVQ 2026 au Québec',
          slug: 'guide-tps-tvq-quebec-2026',
          category: 'Fiscalité',
          excerpt: 'Tout ce que les travailleurs autonomes doivent savoir sur les registres TPS (5%) et TVQ (9.975%) et le seuil de 30 000 $ CAD.',
          content: `Le régime de la TPS et de la TVQ est obligatoire pour toute entreprise dont le chiffre d'affaires dépasse 30 000 $ CAD au cours de quatre trimestres civils consécutifs.

### Principales règles :
1. **Seuil de petit fournisseur** : 30 000 $ sur 12 mois.
2. **Méthode rapide d'imputation** : Réduit les calculs complexes pour les petites PME.
3. **Remboursement des taxes d'intrants (RTI/ITR)** : Vous réclamez la TPS/TVQ payée sur vos dépenses admissibles.

Conservez vos pièces justificatives pendant un minimum de 6 ans.`,
          author: 'Équipe Fiscale StartBill',
          readTime: '5 min',
          published: true,
          targetRegion: 'canada',
          createdAt: '2026-04-01T10:00:00.000Z',
          viewsCount: 342
        },
        {
          id: 'art_02',
          title: 'Comment gérer les impayés et relancer un client en retard',
          slug: 'gestion-des-impayes-et-relances',
          category: 'Facturation',
          excerpt: 'Procédures étape par étape, modèles de messages de relance polis et automatisation des pénalités de retard.',
          content: `Les retards de paiement fragilisent la trésorerie des PME et indépendants.

### Étapes recommandées :
1. **J+3 après échéance** : Premier rappel courtois par email.
2. **J+10** : Appel téléphonique ou message direct avec récapitulatif du solde restant.
3. **J+20** : Mise en demeure officielle par courrier recommandé avec intérêts de retard.

Pensez à configurer les rappels automatiques dans StartBill.`,
          author: 'Ferline Zogni',
          readTime: '4 min',
          published: true,
          targetRegion: 'all',
          createdAt: '2026-04-12T11:20:00.000Z',
          viewsCount: 518
        },
        {
          id: 'art_03',
          title: 'Facturation électronique et Mobile Money en Afrique de l\'Ouest',
          slug: 'facturation-mobile-money-afrique',
          category: 'Trésorerie',
          excerpt: 'Optimiser la collecte de paiements via Wave, Orange Money et MTN MoMo tout en restant conforme fiscalement.',
          content: `Le paiement mobile s'est imposé comme le canal maître des transactions commerciales en Afrique de l'Ouest.

### Bonnes pratiques :
- Générer un QR Code de paiement directement sur les factures PDF.
- Valider automatiquement la référence de transaction mobile dans StartBill.
- Archiver les justificatifs de transfert pour la conformité fiscale locale.`,
          author: 'Mamadou Diallo',
          readTime: '6 min',
          published: true,
          targetRegion: 'afrique',
          createdAt: '2026-05-02T08:45:00.000Z',
          viewsCount: 289
        }
      ];

      for (const a of sampleArticles) {
        await setDoc(doc(db, 'learning_articles', a.id), a);
      }
    }

    // 6. Seed Global Alerts if empty
    const alertsSnap = await getDocs(collection(db, 'alerts'));
    if (alertsSnap.empty) {
      const sampleAlerts: GlobalAlert[] = [
        {
          id: 'alert_sys_01',
          title: 'Mise à jour Fiscale Canada 2026',
          message: 'Les formulaires de déclaration trimestrielle TPS/TVQ sont désormais disponibles au téléchargement dans l\'onglet Impôts.',
          severity: 'info',
          isGlobal: true,
          targetRegion: 'canada',
          createdAt: '2026-05-01T08:00:00.000Z'
        },
        {
          id: 'alert_sys_02',
          title: 'Maintenance planifiée du réseau de paiement',
          message: 'Une maintenance des passerelles Interac et Mobile Money aura lieu ce dimanche entre 02h00 et 04h00 UTC.',
          severity: 'warning',
          isGlobal: true,
          targetRegion: 'all',
          createdAt: '2026-05-15T12:00:00.000Z'
        }
      ];

      for (const al of sampleAlerts) {
        await setDoc(doc(db, 'alerts', al.id), al);
      }
    }

    // 7. Seed Regional Settings if empty
    const regSnap = await getDocs(collection(db, 'regionalSettings'));
    if (regSnap.empty) {
      const sampleRegs: RegionalSettingConfig[] = [
        {
          id: 'canada',
          name: 'Canada (Québec / Provinces)',
          currency: 'CAD',
          currencySymbol: '$',
          defaultGst: 0.05,
          defaultPst: 0.09975,
          defaultQst: 0.09975,
          isChannelActive: true,
          supportedPaymentMethods: ['Interac e-Transfer', 'Carte de crédit', 'Virement bancaire', 'Chèque']
        },
        {
          id: 'afrique',
          name: 'Afrique de l\'Ouest & Centrale',
          currency: 'XOF',
          currencySymbol: 'FCFA',
          defaultGst: 0.18,
          defaultPst: 0,
          defaultQst: 0,
          isChannelActive: true,
          supportedPaymentMethods: ['Orange Money', 'Wave', 'MTN MoMo', 'Espèces', 'Virement']
        },
        {
          id: 'haiti',
          name: 'Haïti',
          currency: 'HTG',
          currencySymbol: 'G',
          defaultGst: 0.10,
          defaultPst: 0,
          defaultQst: 0,
          isChannelActive: true,
          supportedPaymentMethods: ['MonCash', 'Natcash', 'Virement BRH', 'Chèque', 'Espèces']
        }
      ];

      for (const r of sampleRegs) {
        await setDoc(doc(db, 'regionalSettings', r.id), r);
      }
    }

  } catch (err) {
    console.error('Error seeding initial admin data:', err);
  }
}

// -------------------------------------------------------------
// USER MANAGEMENT API
// -------------------------------------------------------------
export async function getAllAdminUsers(): Promise<AdminUser[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const list: AdminUser[] = [];
    snap.forEach(d => {
      list.push(d.data() as AdminUser);
    });
    return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (err) {
    console.error('Error fetching admin users:', err);
    return [];
  }
}

export async function updateAdminUser(user: AdminUser): Promise<void> {
  try {
    // Prevent demoting the Super Admin account
    if (isSuperAdminEmail(user.email)) {
      user.role = 'admin';
      user.plan = 'enterprise';
    }

    const ref = doc(db, 'users', user.uid);
    await setDoc(ref, {
      ...user,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('Error updating admin user:', err);
    throw err;
  }
}

export async function deleteAdminUser(uid: string): Promise<void> {
  if (uid === 'super_admin_contact') {
    throw new Error('Le compte Super Administrateur principal ne peut pas être supprimé.');
  }
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      const data = snap.data();
      if (isSuperAdminEmail(data.email)) {
        throw new Error('Le compte Super Administrateur principal ne peut pas être supprimé.');
      }
    }
    await deleteDoc(doc(db, 'users', uid));
  } catch (err) {
    console.error('Error deleting admin user:', err);
    throw err;
  }
}

// -------------------------------------------------------------
// SUBSCRIPTION MANAGEMENT API
// -------------------------------------------------------------
export async function getAllAdminSubscriptions(): Promise<AdminSubscription[]> {
  try {
    const snap = await getDocs(collection(db, 'subscriptions'));
    const list: AdminSubscription[] = [];
    snap.forEach(d => list.push(d.data() as AdminSubscription));
    return list;
  } catch (err) {
    console.error('Error fetching subscriptions:', err);
    return [];
  }
}

export async function saveAdminSubscription(sub: AdminSubscription): Promise<void> {
  try {
    await setDoc(doc(db, 'subscriptions', sub.id), sub, { merge: true });
  } catch (err) {
    console.error('Error saving subscription:', err);
    throw err;
  }
}

// -------------------------------------------------------------
// PAYMENT LOGS API
// -------------------------------------------------------------
export async function getAllAdminPayments(): Promise<AdminPayment[]> {
  try {
    const snap = await getDocs(collection(db, 'payments'));
    const list: AdminPayment[] = [];
    snap.forEach(d => list.push(d.data() as AdminPayment));
    return list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  } catch (err) {
    console.error('Error fetching payments:', err);
    return [];
  }
}

export async function saveAdminPayment(payment: AdminPayment): Promise<void> {
  try {
    await setDoc(doc(db, 'payments', payment.id), payment, { merge: true });
  } catch (err) {
    console.error('Error saving payment:', err);
    throw err;
  }
}

// -------------------------------------------------------------
// LEARNING CENTER ARTICLES API
// -------------------------------------------------------------
export async function getAllLearningArticles(): Promise<LearningArticle[]> {
  try {
    const snap = await getDocs(collection(db, 'learning_articles'));
    const list: LearningArticle[] = [];
    snap.forEach(d => list.push(d.data() as LearningArticle));
    return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (err) {
    console.error('Error fetching learning articles:', err);
    return [];
  }
}

export async function saveLearningArticle(article: LearningArticle): Promise<void> {
  try {
    await setDoc(doc(db, 'learning_articles', article.id), article, { merge: true });
  } catch (err) {
    console.error('Error saving learning article:', err);
    throw err;
  }
}

export async function deleteLearningArticle(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'learning_articles', id));
  } catch (err) {
    console.error('Error deleting learning article:', err);
    throw err;
  }
}

// -------------------------------------------------------------
// ALERTS & BROADCAST NOTIFICATIONS API
// -------------------------------------------------------------
export async function getAllAdminAlerts(): Promise<GlobalAlert[]> {
  try {
    const snap = await getDocs(collection(db, 'alerts'));
    const list: GlobalAlert[] = [];
    snap.forEach(d => list.push(d.data() as GlobalAlert));
    return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (err) {
    console.error('Error fetching admin alerts:', err);
    return [];
  }
}

export async function saveAdminAlert(alert: GlobalAlert): Promise<void> {
  try {
    await setDoc(doc(db, 'alerts', alert.id), alert, { merge: true });
  } catch (err) {
    console.error('Error saving admin alert:', err);
    throw err;
  }
}

export async function deleteAdminAlert(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'alerts', id));
  } catch (err) {
    console.error('Error deleting alert:', err);
    throw err;
  }
}

// -------------------------------------------------------------
// REGIONAL SETTINGS API
// -------------------------------------------------------------
export async function getAllAdminRegionalSettings(): Promise<RegionalSettingConfig[]> {
  try {
    const snap = await getDocs(collection(db, 'regionalSettings'));
    const list: RegionalSettingConfig[] = [];
    snap.forEach(d => {
      const data = d.data() as RegionalSettingConfig;
      list.push({
        ...data,
        id: data.id || (d.id as any) || 'canada',
      });
    });
    return list;
  } catch (err) {
    console.error('Error fetching regional settings:', err);
    return [];
  }
}

export async function saveAdminRegionalSetting(setting: RegionalSettingConfig): Promise<void> {
  try {
    const docId = setting?.id || (setting as any)?.code || (setting as any)?.region || 'canada';
    const payload = { ...setting, id: docId };
    await setDoc(doc(db, 'regionalSettings', docId), payload, { merge: true });
  } catch (err) {
    console.error('Error saving regional setting:', err);
    throw err;
  }
}
