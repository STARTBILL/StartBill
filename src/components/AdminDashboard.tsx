import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CreditCard, 
  FileText, 
  DollarSign, 
  BookOpen, 
  Bell, 
  Globe, 
  TrendingUp, 
  ShieldCheck, 
  ShieldAlert,
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  UserPlus, 
  RefreshCw, 
  Eye, 
  Download, 
  Zap, 
  Sparkles, 
  X, 
  ChevronRight, 
  ArrowUpRight,
  Sliders,
  Check,
  Building2,
  Calendar,
  Layers,
  Radio,
  Settings
} from 'lucide-react';
import { 
  AdminUser, 
  AdminSubscription, 
  AdminPayment, 
  LearningArticle, 
  GlobalAlert, 
  RegionalSettingConfig,
  seedInitialAdminData,
  getAllAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  getAllAdminSubscriptions,
  saveAdminSubscription,
  getAllAdminPayments,
  saveAdminPayment,
  getAllLearningArticles,
  saveLearningArticle,
  deleteLearningArticle,
  getAllAdminAlerts,
  saveAdminAlert,
  deleteAdminAlert,
  getAllAdminRegionalSettings,
  saveAdminRegionalSetting
} from '../lib/adminFirestore';
import { Invoice, ScreenId } from '../types';
import { useAuth } from '../context/AuthContext';
import { isSuperAdminEmail, SUPER_ADMIN_EMAIL } from '../lib/authSecurity';

interface AdminDashboardProps {
  setScreen: (screen: ScreenId) => void;
  triggerToast: (msg: string) => void;
  invoices?: Invoice[];
}

export default function AdminDashboard({ setScreen, triggerToast, invoices = [] }: AdminDashboardProps) {
  const { user: authUser, firebaseUser } = useAuth();
  const currentEmail = (authUser?.email || firebaseUser?.email || '').trim().toLowerCase();
  const isAuthorized = isSuperAdminEmail(currentEmail);

  const [activeTab, setActiveTab] = useState<
    'stats' | 'users' | 'subscriptions' | 'invoices' | 'payments' | 'articles' | 'alerts' | 'regional' | 'settings'
  >('stats');

  // State collections
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [articles, setArticles] = useState<LearningArticle[]>([]);
  const [alerts, setAlerts] = useState<GlobalAlert[]>([]);
  const [regionalConfigs, setRegionalConfigs] = useState<RegionalSettingConfig[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters and Modals
  const [userSearch, setUserSearch] = useState('');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [articleSearch, setArticleSearch] = useState('');

  // Edit Modals
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState<Partial<AdminUser>>({
    email: '',
    fullName: '',
    role: 'user',
    plan: 'free',
    region: 'canada',
    status: 'active'
  });

  // Article Modal
  const [editingArticle, setEditingArticle] = useState<LearningArticle | null>(null);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [articleForm, setArticleForm] = useState<Partial<LearningArticle>>({
    title: '',
    category: 'Fiscalité',
    excerpt: '',
    content: '',
    author: 'Équipe StartBill',
    readTime: '5 min',
    published: true,
    targetRegion: 'all'
  });

  // Broadcast Alert Modal
  const [showAlertModal, setShowAlertModal] = useState(false);

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    appName: 'StartBill Canada',
    maintenanceMode: false,
    enforce2FA: true,
    sessionTimeoutMinutes: 60,
    maxFailedAttempts: 5,
    emailAlertsEnabled: true,
    adminEmailNotifications: 'admin@startbill.com',
    backupFrequency: 'daily',
    allowPublicSignups: true,
    stripeWebhookActive: true
  });
  const [alertForm, setAlertForm] = useState<Partial<GlobalAlert>>({
    title: '',
    message: '',
    severity: 'info',
    isGlobal: true,
    targetRegion: 'all'
  });

  // Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newPayment, setNewPayment] = useState<Partial<AdminPayment>>({
    userEmail: '',
    amount: 0,
    currency: 'CAD',
    method: 'Interac e-Transfer',
    status: 'success',
    date: new Date().toISOString().split('T')[0]
  });

  // Load all admin data from Firestore (Guarded by Super Admin authorization)
  const loadData = async () => {
    if (!isAuthorized) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      await seedInitialAdminData();
      const [uList, sList, pList, aList, alList, rList] = await Promise.all([
        getAllAdminUsers(),
        getAllAdminSubscriptions(),
        getAllAdminPayments(),
        getAllLearningArticles(),
        getAllAdminAlerts(),
        getAllAdminRegionalSettings()
      ]);
      setUsers(uList);
      setSubscriptions(sList);
      setPayments(pList);
      setArticles(aList);
      setAlerts(alList);
      setRegionalConfigs(rList);
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
      triggerToast('Erreur lors du chargement des données d\'administration.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [isAuthorized]);

  // Handlers for User actions
  const handleSaveUserRole = async (userToUpdate: AdminUser, newRole: 'admin' | 'user') => {
    try {
      const updated = { ...userToUpdate, role: newRole };
      await updateAdminUser(updated);
      setUsers(prev => prev.map(u => u.uid === updated.uid ? updated : u));
      triggerToast(`Rôle de ${userToUpdate.email} mis à jour : ${newRole.toUpperCase()}`);
    } catch (err) {
      triggerToast('Erreur lors de la modification du rôle.');
    }
  };

  const handleSaveUserPlan = async (userToUpdate: AdminUser, newPlan: 'free' | 'pro' | 'enterprise') => {
    try {
      const updated = { ...userToUpdate, plan: newPlan };
      await updateAdminUser(updated);
      setUsers(prev => prev.map(u => u.uid === updated.uid ? updated : u));
      triggerToast(`Plan de ${userToUpdate.email} modifié pour ${newPlan.toUpperCase()}`);
    } catch (err) {
      triggerToast('Erreur lors de la mise à jour du plan.');
    }
  };

  const handleToggleUserStatus = async (userToUpdate: AdminUser) => {
    try {
      const nextStatus: 'active' | 'suspended' = userToUpdate.status === 'suspended' ? 'active' : 'suspended';
      const updated: AdminUser = { ...userToUpdate, status: nextStatus };
      await updateAdminUser(updated);
      setUsers(prev => prev.map(u => u.uid === updated.uid ? updated : u));
      triggerToast(`Statut du compte ${userToUpdate.email} : ${nextStatus.toUpperCase()}`);
    } catch (err) {
      triggerToast('Erreur lors du changement de statut.');
    }
  };

  const handleCreateNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email) return;
    try {
      const generatedUid = 'usr_' + Date.now();
      const userObj: AdminUser = {
        uid: generatedUid,
        email: newUser.email,
        fullName: newUser.fullName || 'Nouvel Utilisateur',
        role: newUser.role || 'user',
        plan: newUser.plan || 'free',
        region: newUser.region || 'canada',
        status: newUser.status || 'active',
        createdAt: new Date().toISOString()
      };
      await updateAdminUser(userObj);
      setUsers(prev => [userObj, ...prev]);
      setShowAddUserModal(false);
      setNewUser({ email: '', fullName: '', role: 'user', plan: 'free', region: 'canada', status: 'active' });
      triggerToast(`Compte utilisateur créé avec succès : ${userObj.email}`);
    } catch (err) {
      triggerToast('Erreur lors de la création de l\'utilisateur.');
    }
  };

  // Article handlers
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleForm.title || !articleForm.content) return;
    try {
      const articleId = editingArticle ? editingArticle.id : 'art_' + Date.now();
      const articleObj: LearningArticle = {
        id: articleId,
        title: articleForm.title || '',
        slug: articleForm.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'article',
        category: (articleForm.category as any) || 'Fiscalité',
        excerpt: articleForm.excerpt || '',
        content: articleForm.content || '',
        author: articleForm.author || 'Équipe StartBill',
        readTime: articleForm.readTime || '5 min',
        published: articleForm.published ?? true,
        targetRegion: articleForm.targetRegion || 'all',
        createdAt: editingArticle ? editingArticle.createdAt : new Date().toISOString(),
        viewsCount: editingArticle ? editingArticle.viewsCount : 0
      };
      await saveLearningArticle(articleObj);
      if (editingArticle) {
        setArticles(prev => prev.map(a => a.id === articleId ? articleObj : a));
      } else {
        setArticles(prev => [articleObj, ...prev]);
      }
      setShowArticleModal(false);
      setEditingArticle(null);
      triggerToast(`Article enregistré : ${articleObj.title}`);
    } catch (err) {
      triggerToast('Erreur lors de l\'enregistrement de l\'article.');
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      await deleteLearningArticle(id);
      setArticles(prev => prev.filter(a => a.id !== id));
      triggerToast('Article supprimé du centre d\'apprentissage.');
    } catch (err) {
      triggerToast('Erreur lors de la suppression de l\'article.');
    }
  };

  // Broadcast Alert handler
  const handleBroadcastAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertForm.title || !alertForm.message) return;
    try {
      const alertObj: GlobalAlert = {
        id: 'alert_' + Date.now(),
        title: alertForm.title || '',
        message: alertForm.message || '',
        severity: alertForm.severity || 'info',
        isGlobal: true,
        targetRegion: alertForm.targetRegion || 'all',
        createdAt: new Date().toISOString()
      };
      await saveAdminAlert(alertObj);
      setAlerts(prev => [alertObj, ...prev]);
      setShowAlertModal(false);
      setAlertForm({ title: '', message: '', severity: 'info', isGlobal: true, targetRegion: 'all' });
      triggerToast('Alerte globale diffusée à l\'ensemble des utilisateurs.');
    } catch (err) {
      triggerToast('Erreur lors de la diffusion de l\'alerte.');
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      await deleteAdminAlert(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
      triggerToast('Alerte retirée du système.');
    } catch (err) {
      triggerToast('Erreur lors de la suppression.');
    }
  };

  // Regional Settings handler
  const handleSaveRegional = async (config: RegionalSettingConfig) => {
    try {
      await saveAdminRegionalSetting(config);
      setRegionalConfigs(prev => prev.map(r => r.id === config.id ? config : r));
      triggerToast(`Paramètres régionaux pour ${config.name} sauvegardés.`);
    } catch (err) {
      triggerToast('Erreur lors de la sauvegarde des paramètres régionales.');
    }
  };

  // Payment Handler
  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.userEmail || !newPayment.amount) return;
    try {
      const paymentObj: AdminPayment = {
        id: 'pay_' + Date.now(),
        userId: 'usr_manual',
        userEmail: newPayment.userEmail || '',
        amount: Number(newPayment.amount),
        currency: newPayment.currency || 'CAD',
        method: newPayment.method || 'Interac e-Transfer',
        status: newPayment.status || 'success',
        date: newPayment.date || new Date().toISOString().split('T')[0],
        transactionRef: 'MAN-' + Math.floor(100000 + Math.random() * 900000)
      };
      await saveAdminPayment(paymentObj);
      setPayments(prev => [paymentObj, ...prev]);
      setShowPaymentModal(false);
      setNewPayment({ userEmail: '', amount: 0, currency: 'CAD', method: 'Interac e-Transfer', status: 'success', date: new Date().toISOString().split('T')[0] });
      triggerToast('Transaction enregistrée avec succès.');
    } catch (err) {
      triggerToast('Erreur lors de l\'enregistrement du paiement.');
    }
  };

  // Calculations for Stats
  const totalUsersCount = users.length;
  const adminUsersCount = users.filter(u => u.role === 'admin').length;
  const activeProCount = users.filter(u => u.plan === 'pro' || u.plan === 'enterprise').length;
  const totalVolumeInvoices = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
  const totalPaymentsSuccess = payments.filter(p => p.status === 'success').reduce((acc, p) => acc + p.amount, 0);
  const totalArticlesCount = articles.length;

  // STRICT ACCESS CONTROL GUARD: Only contact.startbill@gmail.com is allowed
  if (!isAuthorized) {
    return (
      <div className="w-full min-h-[550px] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white border border-rose-200 rounded-3xl p-8 shadow-xl shadow-rose-500/5 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider">
              Accès strictement restreint
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Espace Administrateur Protégé
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cet espace d'administration globale est strictement réservé au Super Administrateur (<strong className="text-slate-800">{SUPER_ADMIN_EMAIL}</strong>), quelle que soit votre région d'exploitation (Canada, Afrique, Haïti).
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-1.5 text-xs">
            <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
              <span>Compte connecté :</span>
              <span className="font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {currentEmail || 'Non connecté'}
              </span>
            </div>
            <div className="text-[11px] text-rose-600 font-semibold pt-1 border-t border-slate-200/60 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>Privilèges administrateur non accordés.</span>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={() => setScreen('dashboard')}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              Retourner au Tableau de bord
            </button>

            <button
              type="button"
              onClick={() => setScreen('login')}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Se connecter avec le compte administrateur
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-10 space-y-8 pb-32">
      
      {/* Admin Banner Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Espace Administrateur HQ StartBill</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{SUPER_ADMIN_EMAIL}</span>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Tableau de Bord Administrateur
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-2xl">
              Supervision globale et gestion centralisée des utilisateurs, abonnements, factures, passerelles de paiement et configurations multi-régionales (Canada 🇨🇦, Afrique 🌍, Haïti 🇭🇹).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition flex items-center gap-2 cursor-pointer shadow-md"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
              <span>Actualiser</span>
            </button>

            <button
              onClick={() => setScreen('dashboard')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span>Vue Application Client</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for the 8 Admin Sections */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
        {[
          { id: 'stats', label: 'Statistiques Globales', icon: TrendingUp },
          { id: 'users', label: 'Utilisateurs', icon: Users, badge: totalUsersCount },
          { id: 'subscriptions', label: 'Abonnements', icon: CreditCard, badge: activeProCount },
          { id: 'invoices', label: 'Factures Système', icon: FileText, badge: invoices.length },
          { id: 'payments', label: 'Paiements', icon: DollarSign, badge: payments.length },
          { id: 'articles', label: 'Centre d\'Apprentissage', icon: BookOpen, badge: totalArticlesCount },
          { id: 'alerts', label: 'Alertes & Diffusion', icon: Bell, badge: alerts.length },
          { id: 'regional', label: 'Paramètres Régionaux', icon: Globe, badge: regionalConfigs.length },
          { id: 'settings', label: 'Paramètres Système', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 rounded-2xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md font-extrabold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SECTION 1: STATISTIQUES GLOBALES */}
      {activeTab === 'stats' && (
        <div className="space-y-8">
          {/* Executive KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Utilisateurs</span>
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900">{totalUsersCount}</span>
                <span className="text-xs text-emerald-600 font-bold ml-2">({adminUsersCount} admins)</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Inscrits sur les 3 régions StartBill</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Abonnés Payants</span>
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900">{activeProCount}</span>
                <span className="text-xs text-emerald-600 font-bold ml-2">Plans Pro / Enterprise</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Taux de conversion ~{Math.round((activeProCount/Math.max(1, totalUsersCount))*100)}%</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Volume Factures</span>
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900">${totalVolumeInvoices.toLocaleString('fr-CA', { minimumFractionDigits: 2 })}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">{invoices.length} factures générées dans l'application</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Paiements Traités</span>
                <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900">${totalPaymentsSuccess.toLocaleString('fr-CA', { minimumFractionDigits: 2 })}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Flux Interac, Stripe & Mobile Money</p>
            </div>
          </div>

          {/* Regional Performance Distribution */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>Répartition Régionale de la Plateforme</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Canada (CAD $)', flag: '🇨🇦', count: users.filter(u => u.region === 'canada').length, color: 'bg-blue-600' },
                { name: 'Haïti (HTG G)', flag: '🇭🇹', count: users.filter(u => u.region === 'haiti').length, color: 'bg-amber-600' },
                { name: 'Afrique de l\'Ouest (FCFA)', flag: '🌍', count: users.filter(u => u.region === 'afrique').length, color: 'bg-emerald-600' }
              ].map((r) => {
                const percent = Math.round((r.count / Math.max(1, totalUsersCount)) * 100);
                return (
                  <div key={r.name} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{r.flag} {r.name}</span>
                      <span className="text-xs font-extrabold text-slate-900">{r.count} utilis. ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${r.color} rounded-full`} style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: GESTION DES UTILISATEURS */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/90">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par nom, email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Créer un Administrateur / Utilisateur</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Utilisateur</th>
                    <th className="p-4">Rôle</th>
                    <th className="p-4">Plan Abonnement</th>
                    <th className="p-4">Région</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4">Date création</th>
                    <th className="p-4 text-right">Actions Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {users
                    .filter(u => u.email?.toLowerCase().includes(userSearch.toLowerCase()) || u.fullName?.toLowerCase().includes(userSearch.toLowerCase()))
                    .map((u, uIdx) => (
                      <tr key={u.uid || `user-${uIdx}`} className="hover:bg-slate-50/80 transition">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{u.fullName || 'Sans Nom'}</div>
                          <div className="text-[11px] text-slate-500">{u.email}</div>
                          <div className="text-[10px] font-mono text-slate-400">UID: {u.uid}</div>
                        </td>
                        <td className="p-4">
                          <select
                            value={u.role || 'user'}
                            onChange={(e) => handleSaveUserRole(u, e.target.value as any)}
                            className={`text-xs font-bold px-2.5 py-1 rounded-xl border cursor-pointer ${
                              u.role === 'admin'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            <option value="user">Utilisateur (user)</option>
                            <option value="admin">Administrateur (admin)</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <select
                            value={u.plan || 'free'}
                            onChange={(e) => handleSaveUserPlan(u, e.target.value as any)}
                            className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer"
                          >
                            <option value="free">Gratuit (Free)</option>
                            <option value="pro">Pro ($19.99/m)</option>
                            <option value="enterprise">Entreprise ($99/m)</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <span className="uppercase font-bold text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                            {u.region || 'canada'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full ${
                            u.status === 'suspended'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'suspended' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                            {u.status === 'suspended' ? 'Suspendu' : 'Actif'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 text-[11px]">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-CA') : 'ND'}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-amber-50 hover:text-amber-700 transition border border-slate-200 cursor-pointer"
                          >
                            {u.status === 'suspended' ? 'Activer' : 'Suspendre'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: LES ABONNEMENTS */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Gestion des Abonnements StartBill</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-4">ID Abonnement</th>
                    <th className="p-4">Utilisateur</th>
                    <th className="p-4">Formule</th>
                    <th className="p-4">Prix / Fréquence</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4">Prochain Renouvellement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {subscriptions.map((s, sIdx) => (
                    <tr key={s.id || `sub-${sIdx}`} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-mono font-bold text-slate-900">{s.id}</td>
                      <td className="p-4 text-slate-700">{s.userEmail}</td>
                      <td className="p-4">
                        <span className="font-extrabold uppercase text-[10px] px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {s.plan}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        {s.amount} {s.currency} / {s.interval === 'monthly' ? 'mois' : 'an'}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {s.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{s.nextBillingDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: LES FACTURES SYSTEME */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Toutes les Factures du Système ({invoices.length})</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-4">ID Facture</th>
                    <th className="p-4">Client</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Montant Total</th>
                    <th className="p-4">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {invoices.map((inv, invIdx) => (
                    <tr key={inv.id || `inv-${invIdx}`} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-bold text-blue-600">{inv.id}</td>
                      <td className="p-4 font-bold text-slate-900">{inv.clientName}</td>
                      <td className="p-4 text-slate-500">{inv.date}</td>
                      <td className="p-4 font-extrabold text-slate-900">
                        ${inv.total.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} {inv.currency || 'CAD'}
                      </td>
                      <td className="p-4">
                        <span className={`font-extrabold text-[10px] px-2.5 py-1 rounded-xl ${
                          inv.status === 'Payée' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: LES PAIEMENTS */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Historique Global des Paiements</span>
            </h3>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Enregistrer un Paiement Manuel</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-4">ID Transaction</th>
                  <th className="p-4">Utilisateur</th>
                  <th className="p-4">Méthode de Paiement</th>
                  <th className="p-4">Montant</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {payments.map((p, pIdx) => (
                  <tr key={p.id || `pay-${pIdx}`} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-mono font-bold text-slate-900">{p.id} ({p.transactionRef})</td>
                    <td className="p-4 text-slate-700">{p.userEmail}</td>
                    <td className="p-4 font-bold text-slate-800">{p.method}</td>
                    <td className="p-4 font-black text-slate-900">{p.amount} {p.currency}</td>
                    <td className="p-4">
                      <span className={`font-bold text-[10px] px-2 py-0.5 rounded-full ${
                        p.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">{p.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 6: ARTICLES CENTRE D'APPRENTISSAGE */}
      {activeTab === 'articles' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Centre d'Apprentissage & Formation StartBill</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">Gestion des guides fiscaux et articles explicatifs pour entrepreneurs.</p>
            </div>
            <button
              onClick={() => {
                setEditingArticle(null);
                setArticleForm({ title: '', category: 'Fiscalité', excerpt: '', content: '', author: 'Équipe StartBill', readTime: '5 min', published: true, targetRegion: 'all' });
                setShowArticleModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Créer un Article</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map((art, aIdx) => (
              <div key={art.id || `art-${aIdx}`} className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                      {art.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{art.readTime}</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 leading-snug">{art.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{art.excerpt}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">Auteur: {art.author}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingArticle(art);
                        setArticleForm(art);
                        setShowArticleModal(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteArticle(art.id)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 7: ALERTES & DIFFUSION GLOBALE */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" />
                <span>Alertes Systèmes & Notifications Diffusées</span>
              </h3>
            </div>
            <button
              onClick={() => setShowAlertModal(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Bell className="w-4 h-4" />
              <span>Diffuser une Alerte Globale</span>
            </button>
          </div>

          <div className="space-y-3">
            {alerts.map((al, alIdx) => (
              <div key={al.id || `alert-${alIdx}`} className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                      al.severity === 'danger' ? 'bg-red-100 text-red-800' :
                      al.severity === 'warning' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {al.severity}
                    </span>
                    <h4 className="text-xs font-black text-slate-900">{al.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600">{al.message}</p>
                </div>
                <button
                  onClick={() => handleDeleteAlert(al.id)}
                  className="text-red-500 hover:text-red-700 text-xs font-bold p-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 8: PARAMETRES REGIONAUX */}
      {activeTab === 'regional' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {regionalConfigs.map((cfg, cfgIdx) => (
              <div key={cfg.id || `reg-${cfgIdx}`} className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 text-sm">{cfg.name}</h4>
                  <span className="font-extrabold text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">
                    {cfg.currency} ({cfg.currencySymbol})
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-500 block">Taux TPS / GST par défaut</label>
                    <input
                      type="number"
                      step="0.001"
                      value={cfg.defaultGst}
                      onChange={(e) => {
                        const updated = { ...cfg, defaultGst: parseFloat(e.target.value) };
                        handleSaveRegional(updated);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-500 block">Taux TVQ / QST / PST par défaut</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={cfg.defaultQst || cfg.defaultPst}
                      onChange={(e) => {
                        const updated = { ...cfg, defaultQst: parseFloat(e.target.value) };
                        handleSaveRegional(updated);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-slate-700">Canal Régional Actif</span>
                    <input
                      type="checkbox"
                      checked={cfg.isChannelActive}
                      onChange={(e) => {
                        const updated = { ...cfg, isChannelActive: e.target.checked };
                        handleSaveRegional(updated);
                      }}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 9: PARAMÈTRES SYSTÈME (Sécurité, Notifications, App) */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <span>Paramètres de Sécurité, Notifications & Application</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Gérez la configuration globale de la plateforme StartBill, la sécurité 2FA et la distribution des alertes.
              </p>
            </div>
            <button
              onClick={() => triggerToast('Paramètres mis à jour avec succès !')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Enregistrer les modifications
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Sécurité */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Sécurité & Authentification</h4>
                  <span className="text-[10px] text-slate-400 font-medium">Contrôle d'accès et 2FA</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <div>
                    <span className="font-bold text-slate-800 block">Exiger 2FA Administrateurs</span>
                    <span className="text-[10px] text-slate-400">Authentification à deux facteurs</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemSettings.enforce2FA}
                    onChange={(e) => setSystemSettings({ ...systemSettings, enforce2FA: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Inactivité maximale session (min)</label>
                  <input
                    type="number"
                    value={systemSettings.sessionTimeoutMinutes}
                    onChange={(e) => setSystemSettings({ ...systemSettings, sessionTimeoutMinutes: parseInt(e.target.value) || 30 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Max tentatives de connexion avant blocage</label>
                  <input
                    type="number"
                    value={systemSettings.maxFailedAttempts}
                    onChange={(e) => setSystemSettings({ ...systemSettings, maxFailedAttempts: parseInt(e.target.value) || 5 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* 2. Notifications */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Notifications & Alertes</h4>
                  <span className="text-[10px] text-slate-400 font-medium">Flux courriel et webhooks</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <div>
                    <span className="font-bold text-slate-800 block">Notifications Courriels Système</span>
                    <span className="text-[10px] text-slate-400">Emails transactionnels Firebase</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemSettings.emailAlertsEnabled}
                    onChange={(e) => setSystemSettings({ ...systemSettings, emailAlertsEnabled: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Adresse de réception des alertes admin</label>
                  <input
                    type="email"
                    value={systemSettings.adminEmailNotifications}
                    onChange={(e) => setSystemSettings({ ...systemSettings, adminEmailNotifications: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <div>
                    <span className="font-bold text-slate-800 block">Webhook Stripe & Paiement Sync</span>
                    <span className="text-[10px] text-slate-400">Synchronisation automatique</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemSettings.stripeWebhookActive}
                    onChange={(e) => setSystemSettings({ ...systemSettings, stripeWebhookActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 3. Application */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Application & Plateforme</h4>
                  <span className="text-[10px] text-slate-400 font-medium">Informations et maintenance</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nom Public de l'Application</label>
                  <input
                    type="text"
                    value={systemSettings.appName}
                    onChange={(e) => setSystemSettings({ ...systemSettings, appName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <div>
                    <span className="font-bold text-slate-800 block">Autoriser les Inscriptions Publiques</span>
                    <span className="text-[10px] text-slate-400">Création de compte autonome</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemSettings.allowPublicSignups}
                    onChange={(e) => setSystemSettings({ ...systemSettings, allowPublicSignups: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-900">
                  <div>
                    <span className="font-extrabold text-rose-900 block">Mode Maintenance</span>
                    <span className="text-[10px] text-rose-600">Bloque l'accès aux non-admins</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemSettings.maintenanceMode}
                    onChange={(e) => setSystemSettings({ ...systemSettings, maintenanceMode: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add User */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Créer un Compte Administrateur / Utilisateur</h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewUser} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nom Complet</label>
                <input
                  type="text"
                  required
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  placeholder="Ex: Admin StartBill"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Adresse Courriel *</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="admin@startbill.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Rôle dans Firebase</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  >
                    <option value="user">Utilisateur (user)</option>
                    <option value="admin">Administrateur (admin)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Plan Initial</label>
                  <select
                    value={newUser.plan}
                    onChange={(e) => setNewUser({ ...newUser, plan: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition cursor-pointer mt-2"
              >
                Enregistrer l'utilisateur
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Article */}
      {showArticleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">
                {editingArticle ? 'Modifier l\'Article' : 'Nouveau Guide / Article de Formation'}
              </h3>
              <button onClick={() => setShowArticleModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Titre de l'Article *</label>
                <input
                  type="text"
                  required
                  value={articleForm.title}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  placeholder="Ex: Guide des déductions fiscales au Canada 2026"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Catégorie</label>
                  <select
                    value={articleForm.category}
                    onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  >
                    <option value="Fiscalité">Fiscalité</option>
                    <option value="Facturation">Facturation</option>
                    <option value="Trésorerie">Trésorerie</option>
                    <option value="Légal">Légal</option>
                    <option value="Conseils">Conseils</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Région Cible</label>
                  <select
                    value={articleForm.targetRegion}
                    onChange={(e) => setArticleForm({ ...articleForm, targetRegion: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  >
                    <option value="all">Toutes les Régions</option>
                    <option value="canada">Canada uniquement</option>
                    <option value="afrique">Afrique uniquement</option>
                    <option value="haiti">Haïti uniquement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Extrait (Résumé rapide)</label>
                <input
                  type="text"
                  value={articleForm.excerpt}
                  onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                  placeholder="Court résumé en 1-2 phrases"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Contenu de l'Article *</label>
                <textarea
                  required
                  rows={6}
                  value={articleForm.content}
                  onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                  placeholder="Rédigez le contenu explicatif..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-mono text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition cursor-pointer mt-2"
              >
                Enregistrer l'article
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Broadcast Alert */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Diffuser une Alerte Globale</h3>
              <button onClick={() => setShowAlertModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcastAlert} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Titre de l'Alerte *</label>
                <input
                  type="text"
                  required
                  value={alertForm.title}
                  onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
                  placeholder="Ex: Rappel Déclaration TPS/TVQ"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Message d'Information *</label>
                <textarea
                  required
                  rows={3}
                  value={alertForm.message}
                  onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })}
                  placeholder="Message diffusé aux utilisateurs..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sévérité</label>
                  <select
                    value={alertForm.severity}
                    onChange={(e) => setAlertForm({ ...alertForm, severity: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  >
                    <option value="info">Information (Bleu)</option>
                    <option value="warning">Avertissement (Jaune)</option>
                    <option value="danger">Urgent / Danger (Rouge)</option>
                    <option value="success">Succès (Vert)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cible</label>
                  <select
                    value={alertForm.targetRegion}
                    onChange={(e) => setAlertForm({ ...alertForm, targetRegion: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  >
                    <option value="all">Tous les pays</option>
                    <option value="canada">Canada</option>
                    <option value="afrique">Afrique</option>
                    <option value="haiti">Haïti</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition cursor-pointer mt-2"
              >
                Envoyer la notification
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Manual Payment */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Saisir un Paiement Manuel</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPayment} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Client / Utilisateur *</label>
                <input
                  type="email"
                  required
                  value={newPayment.userEmail}
                  onChange={(e) => setNewPayment({ ...newPayment, userEmail: e.target.value })}
                  placeholder="client@entreprise.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Montant *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Devise</label>
                  <select
                    value={newPayment.currency}
                    onChange={(e) => setNewPayment({ ...newPayment, currency: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  >
                    <option value="CAD">CAD ($)</option>
                    <option value="HTG">HTG (G)</option>
                    <option value="XOF">XOF (FCFA)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Méthode de Paiement</label>
                <select
                  value={newPayment.method}
                  onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                >
                  <option value="Interac e-Transfer">Interac e-Transfer</option>
                  <option value="Carte bancaire / Stripe">Carte bancaire / Stripe</option>
                  <option value="MonCash Mobile Money">MonCash Mobile Money</option>
                  <option value="Orange Money / Wave">Orange Money / Wave</option>
                  <option value="Virement bancaire">Virement bancaire</option>
                  <option value="Chèque / Espèces">Chèque / Espèces</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition cursor-pointer mt-2"
              >
                Enregistrer la transaction
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
