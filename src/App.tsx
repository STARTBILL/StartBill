import { useState, useEffect } from 'react';
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

export default function App() {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);

  // Active Screen ID in phone simulator (default to dashboard)
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('dashboard');

  // Selected sub items for detail screens
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);

  // Sync data with Firestore on mount
  useEffect(() => {
    async function loadFirebaseData() {
      try {
        setIsLoading(true);
        const [dbInvoices, dbExpenses, dbClients] = await Promise.all([
          getInvoicesFromFirestore(),
          getExpensesFromFirestore(),
          getClientsFromFirestore()
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
    }
    loadFirebaseData();
  }, []);

  // Interactive CRUD updates
  const handleAddInvoice = async (newInv: Invoice) => {
    setInvoices(prev => [newInv, ...prev]);
    await saveInvoiceToFirestore(newInv);

    // Also update client's amountDue if the invoice is not paid
    if (newInv.status !== 'Payée') {
      setClients(prev => prev.map(cli => {
        if (cli.name === newInv.clientName) {
          const updated = { ...cli, amountDue: parseFloat((cli.amountDue + newInv.total).toFixed(2)) };
          saveClientToFirestore(updated);
          return updated;
        }
        return cli;
      }));
    }
  };

  const handleAddExpense = async (newExp: Expense) => {
    setExpenses(prev => [newExp, ...prev]);
    await saveExpenseToFirestore(newExp);
  };

  const handleUpdateExpense = async (updatedExp: Expense) => {
    setExpenses(prev => prev.map(exp => exp.id === updatedExp.id ? updatedExp : exp));
    await saveExpenseToFirestore(updatedExp);
  };

  const handleAddClient = async (newCli: Client) => {
    setClients(prev => [...prev, newCli]);
    await saveClientToFirestore(newCli);
  };

  const handleUpdateClient = async (updatedCli: Client) => {
    setClients(prev => prev.map(c => c.id === updatedCli.id ? updatedCli : c));
    await saveClientToFirestore(updatedCli);
  };

  const handleDeleteClient = async (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    await deleteClientFromFirestore(id);
  };

  const getInvoiceOutstanding = (inv: Invoice): number => {
    if (inv.status === 'Payée' || inv.status === 'paid') {
      return 0;
    }
    if (inv.remainingBalance !== undefined) {
      return inv.remainingBalance;
    }
    return inv.total;
  };

  const handleUpdateInvoice = async (updatedInv: Invoice) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === updatedInv.id) {
        const oldOutstanding = getInvoiceOutstanding(inv);
        const newOutstanding = getInvoiceOutstanding(updatedInv);
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
        return updatedInv;
      }
      return inv;
    }));
    await saveInvoiceToFirestore(updatedInv);
  };

  const handleUpdateInvoiceStatus = async (id: string, status: InvoiceStatus) => {
    let matchedInv: Invoice | undefined;
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        let updatedRemaining = inv.remainingBalance;
        let updatedAmountPaid = inv.amountPaid;
        if (status === 'Payée' || status === 'paid') {
          updatedRemaining = 0;
          updatedAmountPaid = inv.total;
        } else if (status === 'Envoyée' || status === 'Brouillon') {
          updatedRemaining = inv.total;
          updatedAmountPaid = 0;
        } else if (status === 'Partiellement payée' || status === 'partial') {
          updatedAmountPaid = (inv.amountPaid !== undefined && inv.amountPaid > 0) ? inv.amountPaid : parseFloat((inv.total / 2).toFixed(2));
          updatedRemaining = parseFloat(Math.max(0, inv.total - updatedAmountPaid).toFixed(2));
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
          const updated = { ...c, amountDue: Math.max(0, parseFloat((c.amountDue - inv.total).toFixed(2))) };
          saveClientToFirestore(updated);
          return updated;
        }
        return c;
      }));
    }
    setInvoices(prev => prev.filter(i => i.id !== id));
    await deleteInvoiceFromFirestore(id);
  };

  const handleDeleteExpense = async (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    await deleteExpenseFromFirestore(id);
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
    setCurrentScreen('dashboard');
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
              setScreen={setCurrentScreen}
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
