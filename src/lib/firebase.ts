import { 
  collection, 
  doc, 
  getDocs, 
  getDocFromServer,
  setDoc, 
  deleteDoc, 
  writeBatch,
  query,
  where
} from 'firebase/firestore';
import { auth, db, storage, googleProvider } from '../firebase/config';
import { Invoice, Expense, Client } from '../types';

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

// Validate Connection to Firestore per Firebase Skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore backend is operating in offline mode or waiting for connection.");
    }
  }
}
testConnection();

// Invoices collection helper - Strictly isolated by authenticated userId
export async function getInvoicesFromFirestore(userId?: string): Promise<Invoice[]> {
  const targetUid = userId || auth.currentUser?.uid;
  if (!targetUid) {
    // Unauthenticated or new session: return clean empty list
    return [];
  }

  try {
    const qInvoices = query(collection(db, 'invoices'), where('userId', '==', targetUid));
    const querySnapshot = await getDocs(qInvoices);
    const invoices: Invoice[] = [];
    querySnapshot.forEach((docSnap) => {
      invoices.push(docSnap.data() as Invoice);
    });
    return invoices.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  } catch (error) {
    console.warn('Error fetching user invoices from Firestore:', error);
    return [];
  }
}

export async function saveInvoiceToFirestore(invoice: Invoice, userId?: string): Promise<void> {
  try {
    const targetUid = userId || invoice.userId || auth.currentUser?.uid;
    const invoiceToSave: Invoice = {
      ...invoice,
      userId: targetUid || invoice.userId || ''
    };
    await setDoc(doc(db, 'invoices', invoice.id), invoiceToSave, { merge: true });
  } catch (error) {
    console.error('Error saving invoice:', error);
  }
}

export async function deleteInvoiceFromFirestore(invoiceId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'invoices', invoiceId));
  } catch (error) {
    console.error('Error deleting invoice:', error);
  }
}

// Expenses collection helper - Strictly isolated by authenticated userId
export async function getExpensesFromFirestore(userId?: string): Promise<Expense[]> {
  const targetUid = userId || auth.currentUser?.uid;
  if (!targetUid) {
    return [];
  }

  try {
    const qExpenses = query(collection(db, 'expenses'), where('userId', '==', targetUid));
    const querySnapshot = await getDocs(qExpenses);
    const expenses: Expense[] = [];
    querySnapshot.forEach((docSnap) => {
      expenses.push(docSnap.data() as Expense);
    });
    return expenses.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  } catch (error) {
    console.warn('Error fetching user expenses from Firestore:', error);
    return [];
  }
}

export async function saveExpenseToFirestore(expense: Expense, userId?: string): Promise<void> {
  try {
    const targetUid = userId || expense.userId || auth.currentUser?.uid;
    const expenseToSave: Expense = {
      ...expense,
      userId: targetUid || expense.userId || ''
    };
    await setDoc(doc(db, 'expenses', expense.id), expenseToSave, { merge: true });
  } catch (error) {
    console.error('Error saving expense:', error);
  }
}

export async function deleteExpenseFromFirestore(expenseId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'expenses', expenseId));
  } catch (error) {
    console.error('Error deleting expense:', error);
  }
}

// Clients collection helper - Strictly isolated by authenticated userId
export async function getClientsFromFirestore(userId?: string): Promise<Client[]> {
  const targetUid = userId || auth.currentUser?.uid;
  if (!targetUid) {
    return [];
  }

  try {
    const qClients = query(collection(db, 'clients'), where('userId', '==', targetUid));
    const querySnapshot = await getDocs(qClients);
    const clients: Client[] = [];
    querySnapshot.forEach((docSnap) => {
      clients.push(docSnap.data() as Client);
    });
    return clients.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } catch (error) {
    console.warn('Error fetching user clients from Firestore:', error);
    return [];
  }
}

export async function saveClientToFirestore(client: Client, userId?: string): Promise<void> {
  try {
    const targetUid = userId || client.userId || auth.currentUser?.uid;
    const clientToSave: Client = {
      ...client,
      userId: targetUid || client.userId || ''
    };
    await setDoc(doc(db, 'clients', client.id), clientToSave, { merge: true });
  } catch (error) {
    console.error('Error saving client:', error);
  }
}

export async function deleteClientFromFirestore(clientId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'clients', clientId));
  } catch (error) {
    console.error('Error deleting client:', error);
  }
}

// Reset data helper - Deletes only documents belonging to the authenticated user; NO re-seeding
export async function resetFirestoreData(userId?: string): Promise<void> {
  const targetUid = userId || auth.currentUser?.uid;
  if (!targetUid) return;

  try {
    // Delete only user's invoices
    const invSnap = await getDocs(query(collection(db, 'invoices'), where('userId', '==', targetUid)));
    const batch1 = writeBatch(db);
    invSnap.forEach((docSnap) => {
      batch1.delete(docSnap.ref);
    });
    await batch1.commit();

    // Delete only user's expenses
    const expSnap = await getDocs(query(collection(db, 'expenses'), where('userId', '==', targetUid)));
    const batch2 = writeBatch(db);
    expSnap.forEach((docSnap) => {
      batch2.delete(docSnap.ref);
    });
    await batch2.commit();

    // Delete only user's clients
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
