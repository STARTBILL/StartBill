import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  FileText, 
  Percent, 
  UserPlus, 
  Info, 
  Search, 
  ChevronRight, 
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Settings,
  Flame,
  Zap
} from 'lucide-react';
import { NotificationItem, ScreenId, SmartAlert, AlertSeverity, AlertType } from '../types';
import { 
  generateSmartAlerts, 
  getAlertsFromFirestore, 
  markAlertAsReadInFirestore, 
  deleteAlertFromFirestore 
} from '../lib/alerts';

interface NotificationsPageProps {
  setScreen: (screen: ScreenId) => void;
  setSelectedInvoiceId?: (id: string | null) => void;
  triggerToast: (msg: string) => void;
  currentUser?: any;
  totalRevenue?: number;
  totalTax?: number;
  dbInvoices?: any[];
  isPro?: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export default function NotificationsPage({
  setScreen,
  setSelectedInvoiceId,
  triggerToast,
  currentUser,
  totalRevenue = 0,
  totalTax = 0,
  dbInvoices = [],
  isPro = false
}: NotificationsPageProps) {
  // Generate live smart alerts based on Canadian tax rules
  const liveSmartAlerts = generateSmartAlerts(
    currentUser?.uid || 'user-default',
    totalRevenue,
    totalTax,
    dbInvoices,
    isPro
  );

  const smartNotifs: NotificationItem[] = liveSmartAlerts.map(a => ({
    id: a.id,
    title: a.title,
    message: a.message,
    timestamp: 'Alertes fiscales',
    category: 'alert',
    severity: a.severity,
    alertType: a.type,
    isRead: a.isRead,
    actionUrl: a.actionUrl,
    actionLabel: a.actionLabel,
    targetId: a.targetId
  }));

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    return [...smartNotifs, ...INITIAL_NOTIFICATIONS];
  });

  useEffect(() => {
    setNotifications(prev => {
      const existingNotifIds = new Set(prev.map(n => n.id));
      const newItems = smartNotifs.filter(sn => !existingNotifIds.has(sn.id));
      if (newItems.length > 0) {
        return [...newItems, ...prev];
      }
      return prev;
    });
  }, [totalRevenue, totalTax, dbInvoices.length, isPro]);

  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'danger' | 'warning' | 'invoice' | 'tax'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => {
      markAlertAsReadInFirestore(n.id, true);
      return { ...n, isRead: true };
    }));
    triggerToast('Toutes les notifications et alertes ont été marquées comme lues.');
  };

  const handleClearRead = () => {
    const readIds = notifications.filter(n => n.isRead).map(n => n.id);
    readIds.forEach(id => deleteAlertFromFirestore(id));
    setNotifications(prev => prev.filter(n => !n.isRead));
    triggerToast('Les notifications lues ont été supprimées.');
  };

  const toggleReadStatus = (id: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id) {
        const nextIsRead = !n.isRead;
        markAlertAsReadInFirestore(id, nextIsRead);
        return { ...n, isRead: nextIsRead };
      }
      return n;
    }));
  };

  const handleDeleteNotif = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteAlertFromFirestore(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    triggerToast('Notification supprimée.');
  };

  const filteredNotifications = notifications.filter(n => {
    // Tab filter
    if (filterTab === 'unread' && n.isRead) return false;
    if (filterTab === 'danger' && n.severity !== 'danger') return false;
    if (filterTab === 'warning' && n.severity !== 'warning') return false;
    if (filterTab === 'invoice' && n.category !== 'invoice' && n.alertType !== 'invoice_overdue') return false;
    if (filterTab === 'tax' && n.category !== 'tax' && !['gst_threshold', 'gst_exceeded', 'taxes_reserved', 'tax_savings'].includes(n.alertType || '')) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
    }

    return true;
  });

  const getCategoryBadge = (item: NotificationItem) => {
    if (item.category === 'alert' || item.severity) {
      switch (item.severity) {
        case 'danger':
          return {
            icon: AlertCircle,
            bg: 'bg-rose-100 text-rose-800 border-rose-200',
            label: 'OBLIGATION / DANGER'
          };
        case 'warning':
          return {
            icon: AlertTriangle,
            bg: 'bg-amber-100 text-amber-800 border-amber-200',
            label: 'AVERTISSEMENT'
          };
        case 'info':
          return {
            icon: Info,
            bg: 'bg-blue-100 text-blue-800 border-blue-200',
            label: 'CONSEIL FISCAL'
          };
        case 'success':
          return {
            icon: CheckCircle2,
            bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            label: 'CONFORME'
          };
      }
    }

    switch (item.category) {
      case 'invoice':
        return {
          icon: FileText,
          bg: 'bg-blue-50 text-blue-600 border-blue-200/60',
          label: 'Facturation'
        };
      case 'tax':
        return {
          icon: Percent,
          bg: 'bg-amber-50 text-amber-600 border-amber-200/60',
          label: 'Impôts & Taxes'
        };
      case 'client':
        return {
          icon: UserPlus,
          bg: 'bg-purple-50 text-purple-600 border-purple-200/60',
          label: 'Client'
        };
      case 'system':
        return {
          icon: ShieldCheck,
          bg: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
          label: 'Système'
        };
      default:
        return {
          icon: Info,
          bg: 'bg-slate-50 text-slate-600 border-slate-200',
          label: 'Information'
        };
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-5 md:px-6 md:py-7 pb-28 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Centre de Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs animate-pulse">
                {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium max-w-2xl">
            Suivez les échéances de factures, les rappels de taxes TPS/TVQ pour le Québec et les mises à jour de votre compte StartBill.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 text-xs font-bold py-2 px-3 rounded-xl border border-slate-200 transition shadow-2xs cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-blue-600" />
            <span>Tout marquer comme lu</span>
          </button>
          
          <button
            onClick={handleClearRead}
            className="flex items-center gap-1.5 bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 text-xs font-bold py-2 px-3 rounded-xl border border-slate-200 hover:border-red-200 transition shadow-2xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Effacer les lues</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Total Notifications
            </span>
            <span className="text-xl font-black text-slate-900">
              {notifications.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block mb-0.5">
              Non Lues
            </span>
            <span className="text-xl font-black text-blue-600">
              {unreadCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-amber-100 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block mb-0.5">
              Rappels Prioritaires
            </span>
            <span className="text-xl font-black text-amber-700">
              {notifications.filter(n => n.category === 'tax' || n.category === 'invoice').length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters & Search Controls */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Toutes ({notifications.length})
            </button>

            <button
              onClick={() => setFilterTab('unread')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                filterTab === 'unread'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Non lues</span>
              {unreadCount > 0 && (
                <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setFilterTab('danger')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterTab === 'danger'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Urgences 🚨
            </button>

            <button
              onClick={() => setFilterTab('warning')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterTab === 'warning'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Avertissements ⚠️
            </button>

            <button
              onClick={() => setFilterTab('invoice')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterTab === 'invoice'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Factures
            </button>

            <button
              onClick={() => setFilterTab('tax')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterTab === 'tax'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Impôts & Taxes
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une alerte..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />
          </div>

        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((n) => {
            const badge = getCategoryBadge(n);
            const Icon = badge.icon;

            return (
              <div
                key={n.id}
                onClick={() => toggleReadStatus(n.id)}
                className={`group relative bg-white border rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !n.isRead
                    ? 'border-blue-200/90 bg-blue-50/20 shadow-2xs hover:shadow-md hover:border-blue-300'
                    : 'border-slate-200/70 opacity-90 hover:opacity-100 hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                {/* Unread indicator bar */}
                {!n.isRead && (
                  <div className="absolute top-4 left-0 bottom-4 w-1 bg-blue-600 rounded-r-full" />
                )}

                <div className="flex items-start gap-3.5 min-w-0 flex-1 pl-1">
                  {/* Category Icon */}
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${badge.bg}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-300" />
                        {n.timestamp}
                      </span>
                      {!n.isRead && (
                        <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.2 rounded-full">
                          Nouveau
                        </span>
                      )}
                    </div>

                    <h3 className={`text-sm tracking-tight ${!n.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                      {n.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                </div>

                {/* Actions Block */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0 w-full sm:w-auto justify-between sm:justify-end">
                  {n.actionUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (n.targetId && setSelectedInvoiceId) {
                          setSelectedInvoiceId(n.targetId);
                        }
                        setScreen(n.actionUrl!);
                      }}
                      className="flex items-center gap-1 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold py-1.5 px-3 rounded-xl border border-blue-200/60 transition cursor-pointer group/btn"
                    >
                      <span>{n.actionLabel || 'Ouvrir'}</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition" />
                    </button>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleReadStatus(n.id);
                      }}
                      title={n.isRead ? 'Marquer comme non lu' : 'Marquer comme lu'}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                    >
                      <CheckCircle2 className={`w-4 h-4 ${n.isRead ? 'text-emerald-500' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => handleDeleteNotif(n.id, e)}
                      title="Supprimer"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center space-y-3">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl mx-auto flex items-center justify-center">
              <Bell className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-slate-900">
              Aucune notification trouvée
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Aucun résultat ne correspond à votre filtre actuel ou à votre recherche.
            </p>
            {(filterTab !== 'all' || searchQuery !== '') && (
              <button
                onClick={() => {
                  setFilterTab('all');
                  setSearchQuery('');
                }}
                className="mt-2 text-xs font-bold text-blue-600 hover:underline"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer Info Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-4 md:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold tracking-wide uppercase text-blue-300">
              Alertes automatiques activées
            </h4>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              StartBill scrute vos factures impayées et règles de taxes au Québec pour vous éviter des pénalités d'impayé.
            </p>
          </div>
        </div>
        <button
          onClick={() => setScreen('settings')}
          className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-4 rounded-xl border border-white/20 transition shrink-0 cursor-pointer flex items-center gap-1.5"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Préférences d’alertes</span>
        </button>
      </div>

    </div>
  );
}
