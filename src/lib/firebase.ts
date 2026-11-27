import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  deleteDoc, 
  writeBatch,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { auth, db, storage, googleProvider } from '../firebase/config';
import { Invoice, Expense, Client, CompanyProfile } from '../types';

export { auth, db, storage, googleProvider };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Recursively removes undefined values from objects/arrays before passing to Firestore,
 * preventing "Unsupported field value: undefined" rejections on setDoc/updateDoc.
 */
export function sanitizeForFirestore<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
    const cleaned: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
      if (val !== undefined) {
        cleaned[key] = sanitizeForFirestore(val);
      }
    });
    return cleaned as T;
  }
  return value;
}

// Invoices collection helper - Strictly isolated by authenticated userId and registered region
export async function getInvoicesFromFirestore(userId?: string, region?: 'canada' | 'afrique' | 'haiti' | string): Promise<Invoice[]> {
  const targetUid = userId || auth.currentUser?.uid;
  if (!targetUid) {
    return [];
  }

  try {
    const qInvoices = query(collection(db, 'invoices'), where('userId', '==', targetUid));
    const querySnapshot = await getDocs(qInvoices);
    const invoices: Invoice[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as Invoice;
      if (!region || !data.region || data.region === region) {
        invoices.push({
          ...data,
          id: data.id || docSnap.id
        });
      }
    });
    return invoices.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  } catch (error) {
    console.warn('Error fetching user invoices from Firestore:', error);
    throw error;
  }
}

export function subscribeUserInvoices(
  userId: string,
  region: 'canada' | 'afrique' | 'haiti' | string | undefined,
  onData: (invoices: Invoice[], fromCache: boolean) => void,
  onError?: (err: unknown) => void
): () => void {
  const qInvoices = query(collection(db, 'invoices'), where('userId', '==', userId));
  return onSnapshot(
    qInvoices,
    (querySnapshot) => {
      const invoices: Invoice[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as Invoice;
        if (!region || !data.region || data.region === region) {
          invoices.push({
            ...data,
            id: data.id || docSnap.id
          });
        }
      });
      invoices.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      onData(invoices, querySnapshot.metadata.fromCache);
    },
    (error) => {
      console.warn('Firestore invoices listener warning:', error);
      if (onError) onError(error);
    }
  );
}

export async function saveInvoiceToFirestore(invoice: Invoice, userId?: string, region?: 'canada' | 'afrique' | 'haiti' | string): Promise<void> {
  const targetUid = userId || auth.currentUser?.uid || invoice.userId;
  if (!targetUid) {
    // Guest / unauthenticated mode persists locally in scoped localStorage cache
    return;
  }
  try {
    const targetRegion = region || invoice.region || 'canada';
    const invoiceToSave = sanitizeForFirestore({
      ...invoice,
      userId: targetUid,
      region: targetRegion,
      updatedAt: new Date().toISOString()
    });
    await setDoc(doc(db, 'invoices', invoice.id), invoiceToSave, { merge: true });
  } catch (error) {
    console.error('Error saving invoice:', error);
    handleFirestoreError(error, OperationType.WRITE, `invoices/${invoice.id}`);
  }
}

export async function deleteInvoiceFromFirestore(invoiceId: string): Promise<void> {
  if (!invoiceId || !auth.currentUser?.uid) return;
  try {
    await deleteDoc(doc(db, 'invoices', invoiceId));

    const q = query(
      collection(db, 'invoices'),
      where('userId', '==', auth.currentUser.uid),
      where('id', '==', invoiceId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (error) {
    console.error(`[Firestore] Échec de la suppression de la facture ${invoiceId}:`, error);
    handleFirestoreError(error, OperationType.DELETE, `invoices/${invoiceId}`);
  }
}

// Expenses collection helper - Strictly isolated by authenticated userId and registered region
export async function getExpensesFromFirestore(userId?: string, region?: 'canada' | 'afrique' | 'haiti' | string): Promise<Expense[]> {
  const targetUid = userId || auth.currentUser?.uid;
  if (!targetUid) {
    return [];
  }

  try {
    const qExpenses = query(collection(db, 'expenses'), where('userId', '==', targetUid));
    const querySnapshot = await getDocs(qExpenses);
    const expenses: Expense[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as Expense;
      if (!region || !data.region || data.region === region) {
        expenses.push({
          ...data,
          id: data.id || docSnap.id
        });
      }
    });
    return expenses.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  } catch (error) {
    console.warn('Error fetching user expenses from Firestore:', error);
    throw error;
  }
}

export function subscribeUserExpenses(
  userId: string,
  region: 'canada' | 'afrique' | 'haiti' | string | undefined,
  onData: (expenses: Expense[], fromCache: boolean) => void,
  onError?: (err: unknown) => void
): () => void {
  const qExpenses = query(collection(db, 'expenses'), where('userId', '==', userId));
  return onSnapshot(
    qExpenses,
    (querySnapshot) => {
      const expenses: Expense[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as Expense;
        if (!region || !data.region || data.region === region) {
          expenses.push({
            ...data,
            id: data.id || docSnap.id
          });
        }
      });
      expenses.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      onData(expenses, querySnapshot.metadata.fromCache);
    },
    (error) => {
      console.warn('Firestore expenses listener warning:', error);
      if (onError) onError(error);
    }
  );
}

export async function saveExpenseToFirestore(expense: Expense, userId?: string, region?: 'canada' | 'afrique' | 'haiti' | string): Promise<void> {
  const targetUid = userId || auth.currentUser?.uid || expense.userId;
  if (!targetUid) {
    return;
  }
  try {
    const targetRegion = region || expense.region || 'canada';
    const expenseToSave = sanitizeForFirestore({
      ...expense,
      userId: targetUid,
      region: targetRegion,
      updatedAt: new Date().toISOString()
    });
    await setDoc(doc(db, 'expenses', expense.id), expenseToSave, { merge: true });
  } catch (error) {
    console.error('Error saving expense:', error);
    handleFirestoreError(error, OperationType.WRITE, `expenses/${expense.id}`);
  }
}

export async function deleteExpenseFromFirestore(expenseId: string): Promise<void> {
  if (!expenseId || !auth.currentUser?.uid) return;
  try {
    await deleteDoc(doc(db, 'expenses', expenseId));

    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', auth.currentUser.uid),
      where('id', '==', expenseId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (error) {
    console.error(`[Firestore] Échec de la suppression de la dépense ${expenseId}:`, error);
    handleFirestoreError(error, OperationType.DELETE, `expenses/${expenseId}`);
  }
}

// Clients collection helper - Strictly isolated by authenticated userId and registered region
export async function getClientsFromFirestore(userId?: string, region?: 'canada' | 'afrique' | 'haiti' | string): Promise<Client[]> {
  const targetUid = userId || auth.currentUser?.uid;
  if (!targetUid) {
    return [];
  }

  try {
    const qClients = query(collection(db, 'clients'), where('userId', '==', targetUid));
    const querySnapshot = await getDocs(qClients);
    const clients: Client[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as Client;
      if (!region || !data.region || data.region === region) {
        clients.push({
          ...data,
          id: data.id || docSnap.id
        });
      }
    });
    return clients.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } catch (error) {
    console.warn('Error fetching user clients from Firestore:', error);
    throw error;
  }
}

export function subscribeUserClients(
  userId: string,
  region: 'canada' | 'afrique' | 'haiti' | string | undefined,
  onData: (clients: Client[], fromCache: boolean) => void,
  onError?: (err: unknown) => void
): () => void {
  const qClients = query(collection(db, 'clients'), where('userId', '==', userId));
  return onSnapshot(
    qClients,
    (querySnapshot) => {
      const clients: Client[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as Client;
        if (!region || !data.region || data.region === region) {
          clients.push({
            ...data,
            id: data.id || docSnap.id
          });
        }
      });
      clients.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      onData(clients, querySnapshot.metadata.fromCache);
    },
    (error) => {
      console.warn('Firestore clients listener warning:', error);
      if (onError) onError(error);
    }
  );
}

export async function saveClientToFirestore(client: Client, userId?: string, region?: 'canada' | 'afrique' | 'haiti' | string): Promise<void> {
  const targetUid = userId || auth.currentUser?.uid || client.userId;
  if (!targetUid) {
    return;
  }
  try {
    const targetRegion = region || client.region || 'canada';
    const clientToSave = sanitizeForFirestore({
      ...client,
      userId: targetUid,
      region: targetRegion,
      updatedAt: new Date().toISOString()
    });
    await setDoc(doc(db, 'clients', client.id), clientToSave, { merge: true });
  } catch (error) {
    console.error('Error saving client:', error);
    handleFirestoreError(error, OperationType.WRITE, `clients/${client.id}`);
  }
}

export async function deleteClientFromFirestore(clientId: string): Promise<void> {
  if (!clientId || !auth.currentUser?.uid) return;
  try {
    await deleteDoc(doc(db, 'clients', clientId));

    const q = query(
      collection(db, 'clients'),
      where('userId', '==', auth.currentUser.uid),
      where('id', '==', clientId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (error) {
    console.error(`[Firestore] Échec de la suppression du client ${clientId}:`, error);
    handleFirestoreError(error, OperationType.DELETE, `clients/${clientId}`);
  }
}

export async function saveUserCompaniesToFirestore(
  userId: string,
  companies: CompanyProfile[],
  activeCompanyId?: string
): Promise<void> {
  if (!userId) return;
  try {
    const payload = sanitizeForFirestore({
      companies,
      activeCompanyId: activeCompanyId || companies[0]?.id || '',
      updatedAt: new Date().toISOString()
    });
    await setDoc(doc(db, 'users', userId), payload, { merge: true });
  } catch (error) {
    console.warn('Notice saving user companies to Firestore:', error);
  }
}

export async function getUserCompaniesFromFirestore(userId: string): Promise<{ companies: CompanyProfile[]; activeCompanyId?: string } | null> {
  if (!userId) return null;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data?.companies) && data.companies.length > 0) {
        return {
          companies: data.companies as CompanyProfile[],
          activeCompanyId: data.activeCompanyId as string | undefined
        };
      }
    }
    return null;
  } catch (error) {
    console.warn('Notice reading user companies from Firestore:', error);
    return null;
  }
}

// Reset data helper - Deletes only documents belonging to the authenticated user; NO re-seeding
export async function resetFirestoreData(userId?: string): Promise<void> {
  const targetUid = userId || auth.currentUser?.uid;
  if (!targetUid) return;

  try {
    const invSnap = await getDocs(query(collection(db, 'invoices'), where('userId', '==', targetUid)));
    const batch1 = writeBatch(db);
    invSnap.forEach((docSnap) => {
      batch1.delete(docSnap.ref);
    });
    await batch1.commit();

    const expSnap = await getDocs(query(collection(db, 'expenses'), where('userId', '==', targetUid)));
    const batch2 = writeBatch(db);
    expSnap.forEach((docSnap) => {
      batch2.delete(docSnap.ref);
    });
    await batch2.commit();

    const cliSnap = await getDocs(query(collection(db, 'clients'), where('userId', '==', targetUid)));
    const batch3 = writeBatch(db);
    cliSnap.forEach((docSnap) => {
      batch3.delete(docSnap.ref);
    });
    await batch3.commit();
  } catch (error) {
    console.error('Error resetting firestore data:', error);
  }
}
