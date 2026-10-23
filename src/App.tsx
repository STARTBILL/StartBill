import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Invoice, Expense, Client, ScreenId, InvoiceStatus } from './types';
import { INITIAL_INVOICES, INITIAL_EXPENSES, INITIAL_CLIENTS } from './data';
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
  resetFirestoreData
} from './lib/firebase';

import { RegionalProvider } from './context/RegionalContext';
import { AuthProvider } from './context/AuthContext';
import { auth, db } from './firebase/config';

export default function App() {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [activeUserRegion, setActiveUserRegion] = useState<'canada' | 'afrique' | 'haiti'>('canada');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);

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

  // Keep localStorage and URL hash in sync with active screen
  const setScreenPersisted = (screen: ScreenId) => {
    setCurrentScreen(screen);
    try {
      localStorage.setItem('startbill_active_screen', screen);
      window.location.hash = screen;
    } catch {}
  };

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

  // Sync data with Firestore strictly isolated by user ID and registered region
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !user.isAnonymous) {
        try {
          setIsLoading(true);
          // 1. Charger la région d'inscription de l'utilisateur depuis son document de profil
          let registeredRegion: 'canada' | 'afrique' | 'haiti' = 'canada';
          try {
            const userSnap = await getDoc(doc(db, 'users', user.uid));
            if (userSnap.exists()) {
              const reg = userSnap.data()?.region;
              if (reg && ['canada', 'afrique', 'haiti'].includes(reg)) {
                registeredRegion = reg;
              }
            }
          } catch (profileErr) {
            console.warn('Cloisonnement : profil utilisateur non chargé immédiatement, repli région par défaut :', profileErr);
          }
          setActiveUserRegion(registeredRegion);

          // 2. Règle absolue : requête Firestore filtrée obligatoirement par userId ET par region d'inscription
          const [dbInvoices, dbExpenses, dbClients] = await Promise.all([
            getInvoicesFromFirestore(user.uid, registeredRegion),
            getExpensesFromFirestore(user.uid, registeredRegion),
            getClientsFromFirestore(user.uid, registeredRegion)
          ]);
          setInvoices(dbInvoices);
          setExpenses(dbExpenses);
          setClients(dbClients);
          setIsDbConnected(true);
        } catch (err) {
          console.error('Error loading data from Firebase:', err);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Logged out / unauthenticated: strictly empty workspace
        setInvoices([]);
        setExpenses([]);
        setClients([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Interactive CRUD updates with user isolation and strict non-negative value enforcement
  const handleAddInvoice = async (newInv: Invoice) => {
    const uid = auth.currentUser?.uid || '';
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

    const scopedInv: Invoice = {
      ...newInv,
      subtotal: cleanSubtotal,
      tps: cleanTps,
      tvq: cleanTvq,
      total: cleanTotal,
      amountPaid: cleanAmountPaid,
      remainingBalance: cleanRemaining,
      items: cleanItems.length > 0 ? cleanItems : newInv.items,
      userId: newInv.userId || uid,
      region: activeUserRegion
    };
    setInvoices(prev => [scopedInv, ...prev]);
    await saveInvoiceToFirestore(scopedInv, uid, activeUserRegion);

    // Also update client's amountDue if the invoice is not paid
    if (scopedInv.status !== 'Payée') {
      setClients(prev => prev.map(cli => {
        if (cli.name === scopedInv.clientName) {
          const updated = { 
            ...cli, 
            amountDue: parseFloat(Math.max(0, (cli.amountDue || 0) + scopedInv.total).toFixed(2)), 
            userId: cli.userId || uid,
            region: activeUserRegion
          };
          saveClientToFirestore(updated, uid, activeUserRegion);
          return updated;
        }
        return cli;
      }));
    }
  };

  const handleAddExpense = async (newExp: Expense) => {
    const uid = auth.currentUser?.uid || '';
    const cleanHt = parseFloat(Math.max(0, newExp.amountHt || 0).toFixed(2));
    const cleanTps = parseFloat(Math.max(0, newExp.tps || 0).toFixed(2));
    const cleanTvq = parseFloat(Math.max(0, newExp.tvq || 0).toFixed(2));
    const cleanTot = parseFloat(Math.max(0, newExp.total || (cleanHt + cleanTps + cleanTvq)).toFixed(2));

    const scopedExp: Expense = {
      ...newExp,
      amountHt: cleanHt,
      tps: cleanTps,
      tvq: cleanTvq,
      total: cleanTot,
      userId: newExp.userId || uid,
      region: activeUserRegion
    };
    setExpenses(prev => [scopedExp, ...prev]);
    await saveExpenseToFirestore(scopedExp, uid, activeUserRegion);
  };

  const handleUpdateExpense = async (updatedExp: Expense) => {
    const uid = auth.currentUser?.uid || '';
    const cleanHt = parseFloat(Math.max(0, updatedExp.amountHt || 0).toFixed(2));
    const cleanTps = parseFloat(Math.max(0, updatedExp.tps || 0).toFixed(2));
    const cleanTvq = parseFloat(Math.max(0, updatedExp.tvq || 0).toFixed(2));
    const cleanTot = parseFloat(Math.max(0, updatedExp.total || (cleanHt + cleanTps + cleanTvq)).toFixed(2));

    const scopedExp: Expense = {
      ...updatedExp,
      amountHt: cleanHt,
      tps: cleanTps,
      tvq: cleanTvq,
      total: cleanTot,
      userId: updatedExp.userId || uid,
      region: activeUserRegion
    };
    setExpenses(prev => prev.map(exp => exp.id === scopedExp.id ? scopedExp : exp));
    await saveExpenseToFirestore(scopedExp, uid, activeUserRegion);
  };

  const handleAddClient = async (newCli: Client) => {
    const uid = auth.currentUser?.uid || '';
    const scopedCli: Client = {
      ...newCli,
      amountDue: parseFloat(Math.max(0, newCli.amountDue || 0).toFixed(2)),
      userId: newCli.userId || uid,
      region: activeUserRegion
    };
    setClients(prev => [...prev, scopedCli]);
    await saveClientToFirestore(scopedCli, uid, activeUserRegion);
  };

  const handleUpdateClient = async (updatedCli: Client) => {
    const uid = auth.currentUser?.uid || '';
    const scopedCli: Client = {
      ...updatedCli,
      amountDue: parseFloat(Math.max(0, updatedCli.amountDue || 0).toFixed(2)),
      userId: updatedCli.userId || uid,
      region: activeUserRegion
    };
    setClients(prev => prev.map(c => c.id === scopedCli.id ? scopedCli : c));
    await saveClientToFirestore(scopedCli, uid, activeUserRegion);
  };

  const handleDeleteClient = async (id: string) => {
    const existingClient = clients.find(c => c.id === id);
    setClients(prev => prev.filter(c => c.id !== id));
    try {
      await deleteClientFromFirestore(id);
    } catch (err) {
      console.error('Erreur lors de la suppression définitive du client:', err);
      if (existingClient) {
        setClients(prev => [...prev, existingClient]);
      }
      throw err;
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

    const sanitizedInv: Invoice = {
      ...updatedInv,
      subtotal: cleanSubtotal,
      tps: cleanTps,
      tvq: cleanTvq,
      total: cleanTotal,
      amountPaid: cleanAmountPaid,
      remainingBalance: cleanRemaining,
      items: cleanItems.length > 0 ? cleanItems : updatedInv.items
    };

    setInvoices(prev => prev.map(inv => {
      if (inv.id === sanitizedInv.id) {
        const oldOutstanding = getInvoiceOutstanding(inv);
        const newOutstanding = getInvoiceOutstanding(sanitizedInv);
        const diff = newOutstanding - oldOutstanding;
        if (diff !== 0) {
          setClients(prevCli => prevCli.map(c => {
            if (c.name === inv.clientName) {
              const updated = { ...c, amountDue: parseFloat(Math.max(0, (c.amountDue || 0) + diff).toFixed(2)) };
              saveClientToFirestore(updated);
              return updated;
            }
            return c;
          }));
        }
        return sanitizedInv;
      }
      return inv;
    }));
    await saveInvoiceToFirestore(sanitizedInv);
  };

  const handleUpdateInvoiceStatus = async (id: string, status: InvoiceStatus) => {
    let matchedInv: Invoice | undefined;
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        const total = Math.max(0, inv.total || 0);
        let updatedRemaining = Math.max(0, inv.remainingBalance !== undefined ? inv.remainingBalance : total);
        let updatedAmountPaid = Math.max(0, inv.amountPaid || 0);
        if (status === 'Payée' || status === 'paid') {
          updatedRemaining = 0;
          updatedAmountPaid = total;
        } else if (status === 'Envoyée' || status === 'Brouillon') {
          updatedRemaining = total;
          updatedAmountPaid = 0;
        } else if (status === 'Partiellement payée' || status === 'partial') {
          updatedAmountPaid = (inv.amountPaid !== undefined && inv.amountPaid > 0) ? Math.min(total, Math.max(0, inv.amountPaid)) : parseFloat((total / 2).toFixed(2));
          updatedRemaining = parseFloat(Math.max(0, total - updatedAmountPaid).toFixed(2));
        }
        matchedInv = { 
          ...inv, 
          status,
          remainingBalance: updatedRemaining,
          amountPaid: updatedAmountPaid,
          paymentStatus: (status === 'Payée' || status === 'paid') ? 'paid' : (status === 'Partiellement payée' || status === 'partial') ? 'partial' : undefined
        };
        
        const oldOutstanding = getInvoiceOutstanding(inv);
        const newOutstanding = getInvoiceOutstanding(matchedInv);
        const diff = newOutstanding - oldOutstanding;
        if (diff !== 0) {
          setClients(prevCli => prevCli.map(c => {
            if (c.name === inv.clientName) {
              const updated = { ...c, amountDue: parseFloat(Math.max(0, c.amountDue + diff).toFixed(2)) };
              saveClientToFirestore(updated);
              return updated;
            }
            return c;
          }));
        }
        return matchedInv!;
      }
      return inv;
    }));
    if (matchedInv) {
      await saveInvoiceToFirestore(matchedInv);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    const inv = invoices.find(i => i.id === id);
    if (inv && inv.status !== 'Payée') {
      setClients(prevCli => prevCli.map(c => {
        if (c.name === inv.clientName) {
          const updated = { ...c, amountDue: Math.max(0, parseFloat(((c.amountDue || 0) - (inv.total || 0)).toFixed(2))) };
          saveClientToFirestore(updated, auth.currentUser?.uid, activeUserRegion);
          return updated;
        }
        return c;
      }));
    }
    setInvoices(prev => prev.filter(i => i.id !== id));
    try {
      await deleteInvoiceFromFirestore(id);
    } catch (err) {
      console.error('Erreur lors de la suppression définitive de la facture:', err);
      if (inv) {
        setInvoices(prev => [inv, ...prev]);
      }
      throw err;
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const exp = expenses.find(e => e.id === id);
    setExpenses(prev => prev.filter(e => e.id !== id));
    try {
      await deleteExpenseFromFirestore(id);
    } catch (err) {
      console.error('Erreur lors de la suppression définitive de la dépense:', err);
      if (exp) {
        setExpenses(prev => [exp, ...prev]);
      }
      throw err;
    }
  };

  // Reset all to initial state in Firestore
  const handleResetData = async () => {
    setIsLoading(true);
    await resetFirestoreData();
    const dbInvoices = await getInvoicesFromFirestore();
    const dbExpenses = await getExpensesFromFirestore();
    const dbClients = await getClientsFromFirestore();
    setInvoices(dbInvoices);
    setExpenses(dbExpenses);
    setClients(dbClients);
    setScreenPersisted('dashboard');
    setSelectedInvoiceId(null);
    setSelectedExpenseId(null);
    setIsLoading(false);
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <RegionalProvider>
          <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none selection:bg-blue-500/30 selection:text-white">
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
              onResetData={handleResetData}
            />
          </div>
        </RegionalProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
