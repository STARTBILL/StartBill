import { useState, useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Invoice, Expense, Client, ScreenId, InvoiceStatus } from './types';
import DeviceSimulator from './components/DeviceSimulator';
import { ErrorBoundary } from './components/ErrorBoundary';
import {
  getInvoicesFromFirestore,
  saveInvoiceToFirestore,
  deleteInvoiceFromFirestore,
  getExpensesFromFirestore,
  saveExpenseToFirestore,
  deleteExpenseFromFirestore,
  getClientsFromFirestore,
  saveClientToFirestore,
  deleteClientFromFirestore,
  subscribeUserInvoices,
  subscribeUserExpenses,
  subscribeUserClients,
  sanitizeForFirestore,
  resetFirestoreData
} from './lib/firebase';

import { RegionalProvider } from './context/RegionalContext';
import { AuthProvider } from './context/AuthContext';
import { auth, db } from './firebase/config';
import { DEFAULT_ACTIVE_REGION, resolveActiveRegion } from './config/featureFlags';

const CACHE_KEY_PREFIX = 'startbill_cache_v2';

function getCacheKey(kind: 'invoices' | 'expenses' | 'clients', scope: string): string {
  return `${CACHE_KEY_PREFIX}_${kind}_${scope}`;
}

function readScopedCache<T>(kind: 'invoices' | 'expenses' | 'clients', scope: string): T[] {
  try {
    const raw = localStorage.getItem(getCacheKey(kind, scope));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function writeScopedCache<T>(kind: 'invoices' | 'expenses' | 'clients', scope: string, data: T[]): void {
  try {
    localStorage.setItem(getCacheKey(kind, scope), JSON.stringify(data));
  } catch {}
}

function mergePendingItems<T extends { id: string }>(serverItems: T[], currentItems: T[], pendingIds: Set<string>): T[] {
  if (pendingIds.size === 0) return serverItems;
  const serverMap = new Map(serverItems.map(item => [item.id, item]));
  const merged = [...serverItems];
  currentItems.forEach(localItem => {
    if (pendingIds.has(localItem.id) && !serverMap.has(localItem.id)) {
      merged.unshift(localItem);
    }
  });
  return merged;
}

export default function App() {
  const initialScope = auth.currentUser && !auth.currentUser.isAnonymous ? auth.currentUser.uid : 'guest';
  const [activeScope, setActiveScope] = useState<string>(initialScope);
  const activeScopeRef = useRef<string>(initialScope);

  const [invoices, setInvoices] = useState<Invoice[]>(() => readScopedCache<Invoice>('invoices', initialScope));
  const [expenses, setExpenses] = useState<Expense[]>(() => readScopedCache<Expense>('expenses', initialScope));
  const [clients, setClients] = useState<Client[]>(() => readScopedCache<Client>('clients', initialScope));
  const [activeUserRegion, setActiveUserRegion] = useState<'canada' | 'afrique' | 'haiti'>(DEFAULT_ACTIVE_REGION);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);

  const invoicesRef = useRef<Invoice[]>(invoices);
  const expensesRef = useRef<Expense[]>(expenses);
  const clientsRef = useRef<Client[]>(clients);
  const pendingInvoiceIds = useRef<Set<string>>(new Set());
  const pendingExpenseIds = useRef<Set<string>>(new Set());
  const pendingClientIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    invoicesRef.current = invoices;
    writeScopedCache('invoices', activeScopeRef.current, invoices);
  }, [invoices]);

  useEffect(() => {
    expensesRef.current = expenses;
    writeScopedCache('expenses', activeScopeRef.current, expenses);
  }, [expenses]);

  useEffect(() => {
    clientsRef.current = clients;
    writeScopedCache('clients', activeScopeRef.current, clients);
  }, [clients]);

  // Active Screen ID with persistence across page refresh
  const [currentScreen, setCurrentScreen] = useState<ScreenId>(() => {
    try {
      const hash = window.location.hash.replace(/^#\/?/, '').trim() as ScreenId;
      if (hash) return hash;
      const saved = localStorage.getItem('startbill_active_screen') as ScreenId;
      if (saved) return saved;
    } catch {}
    return 'landing';
  });

  const setScreenPersisted = useCallback((screen: ScreenId) => {
    setCurrentScreen(screen);
    try {
      localStorage.setItem('startbill_active_screen', screen);
      window.location.hash = screen;
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('startbill_active_screen', currentScreen);
      if (window.location.hash.replace(/^#\/?/, '') !== currentScreen) {
        window.location.hash = currentScreen;
      }
    } catch {}
  }, [currentScreen]);

  // Synchronize browser back/forward buttons with active screen
  useEffect(() => {
    const handleHashChange = () => {
      try {
        const hash = window.location.hash.replace(/^#\/?/, '').trim() as ScreenId;
        if (hash && hash !== currentScreen) {
          setCurrentScreen(hash);
        }
      } catch {}
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentScreen]);

  // Selected sub items for detail screens
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);

  const subscribeToUserData = useCallback((uid: string, registeredRegion: 'canada' | 'afrique' | 'haiti') => {
    const unsubInv = subscribeUserInvoices(
      uid,
      registeredRegion,
      (serverInvoices, fromCache) => {
        if (fromCache && serverInvoices.length === 0 && invoicesRef.current.length > 0) {
          return;
        }
        serverInvoices.forEach(inv => pendingInvoiceIds.current.delete(inv.id));
        const merged = mergePendingItems(serverInvoices, invoicesRef.current, pendingInvoiceIds.current);
        setInvoices(merged);
        writeScopedCache('invoices', uid, merged);
        setIsDbConnected(true);
        setDbError(null);
        setIsLoading(false);
      },
      () => {
        // Keep cached data on transient network/offline error
        setIsDbConnected(false);
        setIsLoading(false);
      }
    );

    const unsubExp = subscribeUserExpenses(
      uid,
      registeredRegion,
      (serverExpenses, fromCache) => {
        if (fromCache && serverExpenses.length === 0 && expensesRef.current.length > 0) {
          return;
        }
        serverExpenses.forEach(exp => pendingExpenseIds.current.delete(exp.id));
        const merged = mergePendingItems(serverExpenses, expensesRef.current, pendingExpenseIds.current);
        setExpenses(merged);
        writeScopedCache('expenses', uid, merged);
        setIsDbConnected(true);
        setIsLoading(false);
      },
      () => {
        setIsDbConnected(false);
        setIsLoading(false);
      }
    );

    const unsubCli = subscribeUserClients(
      uid,
      registeredRegion,
      (serverClients, fromCache) => {
        if (fromCache && serverClients.length === 0 && clientsRef.current.length > 0) {
          return;
        }
        serverClients.forEach(cli => pendingClientIds.current.delete(cli.id));
        const merged = mergePendingItems(serverClients, clientsRef.current, pendingClientIds.current);
        setClients(merged);
        writeScopedCache('clients', uid, merged);
        setIsDbConnected(true);
        setIsLoading(false);
      },
      () => {
        setIsDbConnected(false);
        setIsLoading(false);
      }
    );

    return () => {
      unsubInv();
      unsubExp();
      unsubCli();
    };
  }, []);

  // Sync data with Firestore strictly isolated by user ID and registered region;
  // preserve guest-scoped localStorage cache when unauthenticated.
  useEffect(() => {
    let cleanupListeners: (() => void) | null = null;
    let isMounted = true;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (cleanupListeners) {
        cleanupListeners();
        cleanupListeners = null;
      }

      if (user && !user.isAnonymous) {
        const uid = user.uid;
        activeScopeRef.current = uid;
        setActiveScope(uid);
        setDbError(null);

        // Immediately hydrate from uid-scoped localStorage cache so nothing flashes empty on refresh
        const cachedInvoices = readScopedCache<Invoice>('invoices', uid);
        const cachedExpenses = readScopedCache<Expense>('expenses', uid);
        const cachedClients = readScopedCache<Client>('clients', uid);
        setInvoices(cachedInvoices);
        setExpenses(cachedExpenses);
        setClients(cachedClients);

        const hasCachedData = cachedInvoices.length > 0 || cachedExpenses.length > 0 || cachedClients.length > 0;
        if (!hasCachedData) {
          setIsLoading(true);
        }

        let registeredRegion: 'canada' | 'afrique' | 'haiti' = DEFAULT_ACTIVE_REGION;
        try {
          const userSnap = await getDoc(doc(db, 'users', uid));
          if (userSnap.exists()) {
            const reg = userSnap.data()?.region;
            if (reg && ['canada', 'afrique', 'haiti'].includes(reg)) {
              registeredRegion = resolveActiveRegion(reg);
            }
          }
        } catch (profileErr) {
          console.warn('Cloisonnement : profil utilisateur non chargé immédiatement, repli région par défaut :', profileErr);
        }

        if (!isMounted) return;
        setActiveUserRegion(registeredRegion);

        // Subscribe in realtime to user-isolated Firestore collections
        cleanupListeners = subscribeToUserData(uid, registeredRegion);
      } else {
        // Guest / unauthenticated ("Non connecté") mode: keep guest-scoped local persistence intact across refreshes & navigation
        activeScopeRef.current = 'guest';
        setActiveScope('guest');
        setActiveUserRegion(DEFAULT_ACTIVE_REGION);
        setInvoices(readScopedCache<Invoice>('invoices', 'guest'));
        setExpenses(readScopedCache<Expense>('expenses', 'guest'));
        setClients(readScopedCache<Client>('clients', 'guest'));
        setDbError(null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
      if (cleanupListeners) cleanupListeners();
    };
  }, [subscribeToUserData]);

  const handleRetryFirestoreSync = useCallback(async () => {
    const uid = auth.currentUser && !auth.currentUser.isAnonymous ? auth.currentUser.uid : null;
    if (!uid) return;
    setIsLoading(true);
    setDbError(null);
    try {
      const [dbInvoices, dbExpenses, dbClients] = await Promise.all([
        getInvoicesFromFirestore(uid, activeUserRegion),
        getExpensesFromFirestore(uid, activeUserRegion),
        getClientsFromFirestore(uid, activeUserRegion)
      ]);
      setInvoices(dbInvoices);
      setExpenses(dbExpenses);
      setClients(dbClients);
      setIsDbConnected(true);
    } catch (err) {
      console.error('Error retrying Firestore load:', err);
      setIsDbConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [activeUserRegion]);

  const getActiveCompanyFallback = () => {
    try {
      const saved = localStorage.getItem('startbill_active_company');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id) return { id: parsed.id, name: parsed.companyName || 'Mon Entreprise' };
      }
    } catch {}
    return { id: 'comp_sante', name: 'Santé.Inc' };
  };

  // Interactive CRUD updates with user isolation, immediate cache write, and strict undefined sanitization
  const handleAddInvoice = async (newInv: Invoice) => {
    const uid = auth.currentUser && !auth.currentUser.isAnonymous ? auth.currentUser.uid : '';
    const scope = uid || 'guest';
    const activeComp = getActiveCompanyFallback();
    const cleanItems = (newInv.items || []).map(it => {
      const q = Math.max(0, it.quantity || 0);
      const p = Math.max(0, it.unitPrice || 0);
      return {
        ...it,
        quantity: q,
        unitPrice: p,
        total: parseFloat(Math.max(0, q * p).toFixed(2))
      };
    });

    const cleanSubtotal = parseFloat(Math.max(0, newInv.subtotal || 0).toFixed(2));
    const cleanTps = parseFloat(Math.max(0, newInv.tps || 0).toFixed(2));
    const cleanTvq = parseFloat(Math.max(0, newInv.tvq || 0).toFixed(2));
    const cleanTotal = parseFloat(Math.max(0, newInv.total || 0).toFixed(2));
    const cleanAmountPaid = parseFloat(Math.max(0, newInv.amountPaid || 0).toFixed(2));
    const cleanRemaining = parseFloat(Math.max(0, newInv.remainingBalance !== undefined ? newInv.remainingBalance : (cleanTotal - cleanAmountPaid)).toFixed(2));

    const scopedInv: Invoice = sanitizeForFirestore({
      ...newInv,
      subtotal: cleanSubtotal,
      tps: cleanTps,
      tvq: cleanTvq,
      total: cleanTotal,
      amountPaid: cleanAmountPaid,
      remainingBalance: cleanRemaining,
      items: cleanItems.length > 0 ? cleanItems : newInv.items,
      userId: uid || newInv.userId || 'guest',
      region: activeUserRegion,
      companyId: newInv.companyId || activeComp.id,
      companyName: newInv.companyName || activeComp.name
    });

    if (uid) pendingInvoiceIds.current.add(scopedInv.id);
    const nextInvoices = [scopedInv, ...invoicesRef.current.filter(i => i.id !== scopedInv.id)];
    invoicesRef.current = nextInvoices;
    setInvoices(nextInvoices);
    writeScopedCache('invoices', scope, nextInvoices);

    if (scopedInv.status !== 'Payée' && scopedInv.status !== 'paid') {
      const clientsToSync: Client[] = [];
      const nextClients = clientsRef.current.map(cli => {
        if (cli.name === scopedInv.clientName) {
          const updated = sanitizeForFirestore({
            ...cli,
            amountDue: parseFloat(Math.max(0, (cli.amountDue || 0) + scopedInv.total).toFixed(2)),
            userId: uid || cli.userId || 'guest',
            region: activeUserRegion,
            companyId: cli.companyId || scopedInv.companyId,
            companyName: cli.companyName || scopedInv.companyName
          });
          clientsToSync.push(updated);
          return updated;
        }
        return cli;
      });
      if (clientsToSync.length > 0) {
        clientsRef.current = nextClients;
        setClients(nextClients);
        writeScopedCache('clients', scope, nextClients);
      }
      if (uid) {
        for (const cli of clientsToSync) {
          saveClientToFirestore(cli, uid, activeUserRegion).catch(err => console.warn('Sync client due notice:', err));
        }
      }
    }

    if (uid) {
      await saveInvoiceToFirestore(scopedInv, uid, activeUserRegion);
      pendingInvoiceIds.current.delete(scopedInv.id);
    }
  };

  const handleAddExpense = async (newExp: Expense) => {
    const uid = auth.currentUser && !auth.currentUser.isAnonymous ? auth.currentUser.uid : '';
    const scope = uid || 'guest';
    const activeComp = getActiveCompanyFallback();
    const cleanHt = parseFloat(Math.max(0, newExp.amountHt || 0).toFixed(2));
    const cleanTps = parseFloat(Math.max(0, newExp.tps || 0).toFixed(2));
    const cleanTvq = parseFloat(Math.max(0, newExp.tvq || 0).toFixed(2));
    const cleanTot = parseFloat(Math.max(0, newExp.total || (cleanHt + cleanTps + cleanTvq)).toFixed(2));

    const scopedExp: Expense = sanitizeForFirestore({
      ...newExp,
      amountHt: cleanHt,
      tps: cleanTps,
      tvq: cleanTvq,
      total: cleanTot,
      userId: uid || newExp.userId || 'guest',
      region: activeUserRegion,
      companyId: newExp.companyId || activeComp.id,
      companyName: newExp.companyName || activeComp.name
    });

    if (uid) pendingExpenseIds.current.add(scopedExp.id);
    const nextExpenses = [scopedExp, ...expensesRef.current.filter(e => e.id !== scopedExp.id)];
    expensesRef.current = nextExpenses;
    setExpenses(nextExpenses);
    writeScopedCache('expenses', scope, nextExpenses);

    if (uid) {
      await saveExpenseToFirestore(scopedExp, uid, activeUserRegion);
      pendingExpenseIds.current.delete(scopedExp.id);
    }
  };

  const handleUpdateExpense = async (updatedExp: Expense) => {
    const uid = auth.currentUser && !auth.currentUser.isAnonymous ? auth.currentUser.uid : '';
    const scope = uid || 'guest';
    const activeComp = getActiveCompanyFallback();
    const cleanHt = parseFloat(Math.max(0, updatedExp.amountHt || 0).toFixed(2));
    const cleanTps = parseFloat(Math.max(0, updatedExp.tps || 0).toFixed(2));
    const cleanTvq = parseFloat(Math.max(0, updatedExp.tvq || 0).toFixed(2));
    const cleanTot = parseFloat(Math.max(0, updatedExp.total || (cleanHt + cleanTps + cleanTvq)).toFixed(2));

    const scopedExp: Expense = sanitizeForFirestore({
      ...updatedExp,
      amountHt: cleanHt,
      tps: cleanTps,
      tvq: cleanTvq,
      total: cleanTot,
      userId: uid || updatedExp.userId || 'guest',
      region: activeUserRegion,
      companyId: updatedExp.companyId || activeComp.id,
      companyName: updatedExp.companyName || activeComp.name
    });

    const nextExpenses = expensesRef.current.map(exp => exp.id === scopedExp.id ? scopedExp : exp);
    expensesRef.current = nextExpenses;
    setExpenses(nextExpenses);
    writeScopedCache('expenses', scope, nextExpenses);

    if (uid) {
      await saveExpenseToFirestore(scopedExp, uid, activeUserRegion);
    }
  };

  const handleAddClient = async (newCli: Client) => {
    const uid = auth.currentUser && !auth.currentUser.isAnonymous ? auth.currentUser.uid : '';
    const scope = uid || 'guest';
    const activeComp = getActiveCompanyFallback();
    const scopedCli: Client = sanitizeForFirestore({
      ...newCli,
      amountDue: parseFloat(Math.max(0, newCli.amountDue || 0).toFixed(2)),
      userId: uid || newCli.userId || 'guest',
      region: activeUserRegion,
      companyId: newCli.companyId || activeComp.id,
      companyName: newCli.companyName || activeComp.name
    });

    if (uid) pendingClientIds.current.add(scopedCli.id);
    const nextClients = [...clientsRef.current.filter(c => c.id !== scopedCli.id), scopedCli];
    clientsRef.current = nextClients;
    setClients(nextClients);
    writeScopedCache('clients', scope, nextClients);

    if (uid) {
      await saveClientToFirestore(scopedCli, uid, activeUserRegion);
      pendingClientIds.current.delete(scopedCli.id);
    }
  };

  const handleUpdateClient = async (updatedCli: Client) => {
    const uid = auth.currentUser && !auth.currentUser.isAnonymous ? auth.currentUser.uid : '';
    const scope = uid || 'guest';
    const activeComp = getActiveCompanyFallback();
    const scopedCli: Client = sanitizeForFirestore({
      ...updatedCli,
      amountDue: parseFloat(Math.max(0, updatedCli.amountDue || 0).toFixed(2)),
      userId: uid || updatedCli.userId || 'guest',
      region: activeUserRegion,
      companyId: updatedCli.companyId || activeComp.id,
      companyName: updatedCli.companyName || activeComp.name
    });

    const nextClients = clientsRef.current.map(c => c.id === scopedCli.id ? scopedCli : c);
    clientsRef.current = nextClients;
    setClients(nextClients);
    writeScopedCache('clients', scope, nextClients);

    if (uid) {
      await saveClientToFirestore(scopedCli, uid, activeUserRegion);
    }
  };

  const handleDeleteClient = async (id: string) => {
    const uid = auth.currentUser && !auth.currentUser.isAnonymous ? auth.currentUser.uid : '';
    const scope = uid || 'guest';
    const existingClient = clientsRef.current.find(c => c.id === id);
    const nextClients = clientsRef.current.filter(c => c.id !== id);
    clientsRef.current = nextClients;
    setClients(nextClients);
    writeScopedCache('clients', scope, nextClients);

    if (uid) {
      try {
        await deleteClientFromFirestore(id);
      } catch (err) {
        console.error('Erreur lors de la suppression définitive du client:', err);
        if (existingClient) {
          const restored = [...clientsRef.current, existingClient];
          clientsRef.current = restored;
          setClients(restored);
          writeScopedCache('clients', scope, restored);
        }
        throw err;
      }
    }
  };

  const getInvoiceOutstanding = (inv: Invoice): number => {
    if (inv.status === 'Payée' || inv.status === 'paid') {
      return 0;
    }
    if (inv.remainingBalance !== undefined) {
      return Math.max(0, inv.remainingBalance);
    }
    return Math.max(0, inv.total || 0);
  };

  const handleUpdateInvoice = async (updatedInv: Invoice) => {
    const uid = auth.currentUser && !auth.currentUser.isAnonymous ? auth.currentUser.uid : '';
    const scope = uid || 'guest';
    const cleanItems = (updatedInv.items || []).map(it => {
      const q = Math.max(0, it.quantity || 0);
      const p = Math.max(0, it.unitPrice || 0);
      return {
        ...it,
        quantity: q,
        unitPrice: p,
        total: parseFloat(Math.max(0, q * p).toFixed(2))
      };
    });

    const cleanTotal = parseFloat(Math.max(0, updatedInv.total || 0).toFixed(2));
    const cleanSubtotal = parseFloat(Math.max(0, updatedInv.subtotal || 0).toFixed(2));
    const cleanTps = parseFloat(Math.max(0, updatedInv.tps || 0).toFixed(2));
    const cleanTvq = parseFloat(Math.max(0, updatedInv.tvq || 0).toFixed(2));
    const cleanAmountPaid = parseFloat(Math.max(0, updatedInv.amountPaid || 0).toFixed(2));
    const cleanRemaining = parseFloat(Math.max(0, updatedInv.remainingBalance !== undefined ? updatedInv.remainingBalance : (cleanTotal - cleanAmountPaid)).toFixed(2));

    const existingInv = invoicesRef.current.find(inv => inv.id === updatedInv.id);
    const sanitizedInv: Invoice = sanitizeForFirestore({
      ...updatedInv,
      subtotal: cleanSubtotal,
      tps: cleanTps,
      tvq: cleanTvq,
      total: cleanTotal,
      amountPaid: cleanAmountPaid,
      remainingBalance: cleanRemaining,
      items: cleanItems.length > 0 ? cleanItems : updatedInv.items,
      userId: uid || updatedInv.userId || 'guest',
      region: activeUserRegion
    });

    const nextInvoices = invoicesRef.current.map(inv => inv.id === sanitizedInv.id ? sanitizedInv : inv);
    invoicesRef.current = nextInvoices;
    setInvoices(nextInvoices);
    writeScopedCache('invoices', scope, nextInvoices);

    if (existingInv) {
      const diff = getInvoiceOutstanding(sanitizedInv) - getInvoiceOutstanding(existingInv);
      if (diff !== 0) {
        const clientsToSync: Client[] = [];
        const nextClients = clientsRef.current.map(c => {
          if (c.name === existingInv.clientName) {
            const updated = sanitizeForFirestore({ ...c, amountDue: parseFloat(Math.max(0, (c.amountDue || 0) + diff).toFixed(2)) });
            clientsToSync.push(updated);
            return updated;
          }
          return c;
        });
        if (clientsToSync.length > 0) {
          clientsRef.current = nextClients;
          setClients(nextClients);
          writeScopedCache('clients', scope, nextClients);
          if (uid) {
            for (const cli of clientsToSync) {
              saveClientToFirestore(cli, uid, activeUserRegion).catch(err => console.warn('Sync client due notice:', err));
            }
          }
        }
      }
    }

    if (uid) {
      await saveInvoiceToFirestore(sanitizedInv, uid, activeUserRegion);
    }
  };

  const handleUpdateInvoiceStatus = async (id: string, status: InvoiceStatus) => {
    const uid = auth.currentUser && !auth.currentUser.isAnonymous ? auth.currentUser.uid : '';
    const scope = uid || 'guest';
    const existingInv = invoicesRef.current.find(inv => inv.id === id);
    if (!existingInv) return;

    const total = Math.max(0, existingInv.total || 0);
    let updatedRemaining = Math.max(0, existingInv.remainingBalance !== undefined ? existingInv.remainingBalance : total);
    let updatedAmountPaid = Math.max(0, existingInv.amountPaid || 0);
    if (status === 'Payée' || status === 'paid') {
      updatedRemaining = 0;
      updatedAmountPaid = total;
    } else if (status === 'Envoyée' || status === 'Brouillon') {
      updatedRemaining = total;
      updatedAmountPaid = 0;
    } else if (status === 'Partiellement payée' || status === 'partial') {
      updatedAmountPaid = (existingInv.amountPaid !== undefined && existingInv.amountPaid > 0) ? Math.min(total, Math.max(0, existingInv.amountPaid)) : parseFloat((total / 2).toFixed(2));
      updatedRemaining = parseFloat(Math.max(0, total - updatedAmountPaid).toFixed(2));
    }

    const baseUpdated: Invoice = {
      ...existingInv,
      status,
      remainingBalance: updatedRemaining,
      amountPaid: updatedAmountPaid,
      userId: uid || existingInv.userId || 'guest',
      region: activeUserRegion
    };
    if (status === 'Payée' || status === 'paid') {
      baseUpdated.paymentStatus = 'paid';
    } else if (status === 'Partiellement payée' || status === 'partial') {
      baseUpdated.paymentStatus = 'partial';
    } else {
      delete baseUpdated.paymentStatus;
    }

    const matchedInv = sanitizeForFirestore(baseUpdated);
    const nextInvoices = invoicesRef.current.map(inv => inv.id === id ? matchedInv : inv);
    invoicesRef.current = nextInvoices;
    setInvoices(nextInvoices);
    writeScopedCache('invoices', scope, nextInvoices);

    const diff = getInvoiceOutstanding(matchedInv) - getInvoiceOutstanding(existingInv);
    if (diff !== 0) {
      const clientsToSync: Client[] = [];
      const nextClients = clientsRef.current.map(c => {
        if (c.name === existingInv.clientName) {
          const updated = sanitizeForFirestore({ ...c, amountDue: parseFloat(Math.max(0, (c.amountDue || 0) + diff).toFixed(2)) });
          clientsToSync.push(updated);
          return updated;
        }
        return c;
      });
      if (clientsToSync.length > 0) {
        clientsRef.current = nextClients;
        setClients(nextClients);
        writeScopedCache('clients', scope, nextClients);
        if (uid) {
          for (const cli of clientsToSync) {
            saveClientToFirestore(cli, uid, activeUserRegion).catch(err => console.warn('Sync client due notice:', err));
          }
        }
      }
    }

    if (uid) {
      await saveInvoiceToFirestore(matchedInv, uid, activeUserRegion);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    const uid = auth.currentUser && !auth.currentUser.isAnonymous ? auth.currentUser.uid : '';
    const scope = uid || 'guest';
    const inv = invoicesRef.current.find(i => i.id === id);

    if (inv && inv.status !== 'Payée' && inv.status !== 'paid') {
      const clientsToSync: Client[] = [];
      const nextClients = clientsRef.current.map(c => {
        if (c.name === inv.clientName) {
          const updated = sanitizeForFirestore({ ...c, amountDue: Math.max(0, parseFloat(((c.amountDue || 0) - (inv.total || 0)).toFixed(2))) });
          clientsToSync.push(updated);
          return updated;
        }
        return c;
      });
      if (clientsToSync.length > 0) {
        clientsRef.current = nextClients;
        setClients(nextClients);
        writeScopedCache('clients', scope, nextClients);
        if (uid) {
          for (const cli of clientsToSync) {
            saveClientToFirestore(cli, uid, activeUserRegion).catch(err => console.warn('Sync client due notice:', err));
          }
        }
      }
    }

    const nextInvoices = invoicesRef.current.filter(i => i.id !== id);
    invoicesRef.current = nextInvoices;
    setInvoices(nextInvoices);
    writeScopedCache('invoices', scope, nextInvoices);

    if (uid) {
      try {
        await deleteInvoiceFromFirestore(id);
      } catch (err) {
        console.error('Erreur lors de la suppression définitive de la facture:', err);
        if (inv) {
          const restored = [inv, ...invoicesRef.current];
          invoicesRef.current = restored;
          setInvoices(restored);
          writeScopedCache('invoices', scope, restored);
        }
        throw err;
      }
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const uid = auth.currentUser && !auth.currentUser.isAnonymous ? auth.currentUser.uid : '';
    const scope = uid || 'guest';
    const exp = expensesRef.current.find(e => e.id === id);
    const nextExpenses = expensesRef.current.filter(e => e.id !== id);
    expensesRef.current = nextExpenses;
    setExpenses(nextExpenses);
    writeScopedCache('expenses', scope, nextExpenses);

    if (uid) {
      try {
        await deleteExpenseFromFirestore(id);
      } catch (err) {
        console.error('Erreur lors de la suppression définitive de la dépense:', err);
        if (exp) {
          const restored = [exp, ...expensesRef.current];
          expensesRef.current = restored;
          setExpenses(restored);
          writeScopedCache('expenses', scope, restored);
        }
        throw err;
      }
    }
  };

  // Reset all user data in Firestore and local cache
  const handleResetData = async () => {
    const uid = auth.currentUser && !auth.currentUser.isAnonymous ? auth.currentUser.uid : '';
    const scope = uid || 'guest';
    setIsLoading(true);
    try {
      if (uid) {
        await resetFirestoreData(uid);
      }
      setInvoices([]);
      setExpenses([]);
      setClients([]);
      writeScopedCache('invoices', scope, []);
      writeScopedCache('expenses', scope, []);
      writeScopedCache('clients', scope, []);
      setScreenPersisted('dashboard');
      setSelectedInvoiceId(null);
      setSelectedExpenseId(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <RegionalProvider>
          <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none selection:bg-blue-500/30 selection:text-white" data-scope={activeScope}>
            <DeviceSimulator
              invoices={invoices}
              expenses={expenses}
              clients={clients}
              currentScreen={currentScreen}
              setScreen={setScreenPersisted}
              selectedInvoiceId={selectedInvoiceId}
              setSelectedInvoiceId={setSelectedInvoiceId}
              selectedExpenseId={selectedExpenseId}
              setSelectedExpenseId={setSelectedExpenseId}
              onAddInvoice={handleAddInvoice}
              onAddExpense={handleAddExpense}
              onAddClient={handleAddClient}
              onUpdateClient={handleUpdateClient}
              onDeleteClient={handleDeleteClient}
              onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
              onDeleteInvoice={handleDeleteInvoice}
              onDeleteExpense={handleDeleteExpense}
              onUpdateInvoice={handleUpdateInvoice}
              onUpdateExpense={handleUpdateExpense}
              isDbConnected={isDbConnected}
              isLoading={isLoading}
              dbError={dbError}
              onRetrySync={handleRetryFirestoreSync}
              onResetData={handleResetData}
            />
          </div>
        </RegionalProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
