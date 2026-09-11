import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDocFromServer,
  setDoc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { Invoice, Expense, Client } from '../types';
import { INITIAL_INVOICES, INITIAL_EXPENSES, INITIAL_CLIENTS } from '../data';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);
export const storage = getStorage(app);

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

// Invoices collection helper
export async function getInvoicesFromFirestore(): Promise<Invoice[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'invoices'));
    if (querySnapshot.empty) {
      // Seed initial invoices into Firestore if collection is empty
      for (const inv of INITIAL_INVOICES) {
        setDoc(doc(db, 'invoices', inv.id), inv).catch(() => {});
      }
      return INITIAL_INVOICES;
    }
    const invoices: Invoice[] = [];
    querySnapshot.forEach((doc) => {
      invoices.push(doc.data() as Invoice);
    });
    return invoices.sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    console.warn('Firestore unreachable or offline, using initial invoices fallback:', error);
    return INITIAL_INVOICES;
  }
}

export async function saveInvoiceToFirestore(invoice: Invoice): Promise<void> {
  try {
    await setDoc(doc(db, 'invoices', invoice.id), invoice);
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

// Expenses collection helper
export async function getExpensesFromFirestore(): Promise<Expense[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'expenses'));
    if (querySnapshot.empty) {
      // Seed initial expenses into Firestore if empty
      for (const exp of INITIAL_EXPENSES) {
        setDoc(doc(db, 'expenses', exp.id), exp).catch(() => {});
      }
      return INITIAL_EXPENSES;
    }
    const expenses: Expense[] = [];
    querySnapshot.forEach((doc) => {
      expenses.push(doc.data() as Expense);
    });
    return expenses.sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    console.warn('Firestore unreachable or offline, using initial expenses fallback:', error);
    return INITIAL_EXPENSES;
  }
}

export async function saveExpenseToFirestore(expense: Expense): Promise<void> {
  try {
    await setDoc(doc(db, 'expenses', expense.id), expense);
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

// Clients collection helper
export async function getClientsFromFirestore(): Promise<Client[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'clients'));
    if (querySnapshot.empty) {
      // Seed initial clients into Firestore if empty
      for (const cli of INITIAL_CLIENTS) {
        setDoc(doc(db, 'clients', cli.id), cli).catch(() => {});
      }
      return INITIAL_CLIENTS;
    }
    const clients: Client[] = [];
    querySnapshot.forEach((doc) => {
      clients.push(doc.data() as Client);
    });
    return clients;
  } catch (error) {
    console.warn('Firestore unreachable or offline, using initial clients fallback:', error);
    return INITIAL_CLIENTS;
  }
}

export async function saveClientToFirestore(client: Client): Promise<void> {
  try {
    await setDoc(doc(db, 'clients', client.id), client);
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

export async function resetFirestoreData(): Promise<void> {
  try {
    // Delete all invoices
    const invSnap = await getDocs(collection(db, 'invoices'));
    const batch1 = writeBatch(db);
    invSnap.forEach((docSnap) => {
      batch1.delete(docSnap.ref);
    });
    await batch1.commit();

    // Delete all expenses
    const expSnap = await getDocs(collection(db, 'expenses'));
    const batch2 = writeBatch(db);
    expSnap.forEach((docSnap) => {
      batch2.delete(docSnap.ref);
    });
    await batch2.commit();

    // Delete all clients
    const cliSnap = await getDocs(collection(db, 'clients'));
    const batch3 = writeBatch(db);
    cliSnap.forEach((docSnap) => {
      batch3.delete(docSnap.ref);
    });
    await batch3.commit();

    // Re-seed initial data
    for (const inv of INITIAL_INVOICES) {
      await setDoc(doc(db, 'invoices', inv.id), inv);
    }
    for (const exp of INITIAL_EXPENSES) {
      await setDoc(doc(db, 'expenses', exp.id), exp);
    }
    for (const cli of INITIAL_CLIENTS) {
      await setDoc(doc(db, 'clients', cli.id), cli);
    }
  } catch (error) {
    console.error('Error resetting firestore data:', error);
  }
}
