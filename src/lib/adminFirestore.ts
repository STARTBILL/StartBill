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
// SEED DEFAULT DATA - PERMANENTLY DISABLED FOR PRODUCTION
// -------------------------------------------------------------
export async function seedInitialAdminData(): Promise<void> {
  // Strictly no-op: Automatic seeding is permanently disabled in production.
  // New workspaces and accounts remain 100% empty and isolated.
  return Promise.resolve();
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
