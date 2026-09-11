import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  Copy, 
  FileText, 
  Tag, 
  DollarSign, 
  Layers, 
  Sparkles, 
  Check, 
  X, 
  Briefcase, 
  ShoppingBag, 
  Clock, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { ProductItem, ScreenId } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { EmptyState } from './ui/EmptyState';
import { ConfirmModal } from './ui/ConfirmModal';
import { useRegional } from '../context/RegionalContext';

interface ProductsPageProps {
  products: ProductItem[];
  onAddProduct: (product: ProductItem) => void;
  onUpdateProduct: (product: ProductItem) => void;
  onDeleteProduct: (id: string) => void;
  onSelectProductForInvoice?: (product: ProductItem) => void;
  triggerToast: (msg: string) => void;
  setScreen: (screen: ScreenId) => void;
}

export default function ProductsPage({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onSelectProductForInvoice,
  triggerToast,
  setScreen
}: ProductsPageProps) {
  const { regionalSettings, currencySymbol, formatPrice } = useRegional();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    unitPrice: string;
    category: string;
    unit: string;
    taxApplicable: boolean;
    sku: string;
  }>({
    name: '',
    description: '',
    unitPrice: '',
    category: 'Service',
    unit: 'Forfait',
    taxApplicable: true,
    sku: ''
  });

  const categories = ['Tous', 'Service', 'Produit', 'Consultation', 'Forfait'];

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = 
      selectedCategory === 'Tous' || 
      (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  // Stats
  const totalCount = products.length;
  const servicesCount = products.filter(p => (p.category || '').toLowerCase().includes('service') || (p.category || '').toLowerCase().includes('consultation')).length;
  const productsCount = products.filter(p => (p.category || '').toLowerCase().includes('produit')).length;
  const avgPrice = totalCount > 0 ? products.reduce((acc, p) => acc + (p.unitPrice || 0), 0) / totalCount : 0;

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      unitPrice: '',
      category: 'Service',
      unit: 'Forfait',
      taxApplicable: true,
      sku: `REF-${Math.floor(1000 + Math.random() * 9000)}`
    });
    setShowModal(true);
  };

  const openEditModal = (product: ProductItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      unitPrice: product.unitPrice.toString(),
      category: product.category || 'Service',
      unit: product.unit || 'Forfait',
      taxApplicable: product.taxApplicable !== false,
      sku: product.sku || ''
    });
    setShowModal(true);
  };

  const handleDuplicate = (product: ProductItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const dupl: ProductItem = {
      ...product,
      id: `prod_${Date.now()}`,
      name: `${product.name} (Copie)`,
      sku: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString()
    };
    onAddProduct(dupl);
    triggerToast(`Produit "${dupl.name}" dupliqué avec succès.`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      triggerToast('Veuillez entrer le nom du produit ou service.');
      return;
    }

    const price = parseFloat(formData.unitPrice) || 0;

    if (editingProduct) {
      const updated: ProductItem = {
        ...editingProduct,
        name: formData.name.trim(),
        description: formData.description.trim(),
        unitPrice: price,
        category: formData.category,
        unit: formData.unit,
        taxApplicable: formData.taxApplicable,
        sku: formData.sku.trim()
      };
      onUpdateProduct(updated);
      triggerToast(`Produit "${updated.name}" mis à jour !`);
    } else {
      const newProduct: ProductItem = {
        id: `prod_${Date.now()}`,
        name: formData.name.trim(),
        description: formData.description.trim(),
        unitPrice: price,
        category: formData.category,
        unit: formData.unit,
        taxApplicable: formData.taxApplicable,
        sku: formData.sku.trim() || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString()
      };
      onAddProduct(newProduct);
      triggerToast(`Nouveau produit "${newProduct.name}" ajouté avec succès !`);
    }

    setShowModal(false);
  };

  const handleInvoiceWithProduct = (product: ProductItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onSelectProductForInvoice) {
      onSelectProductForInvoice(product);
    }
    setScreen('invoices');
    triggerToast(`Produit "${product.name}" prêt pour facturation.`);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto px-4 py-4 md:px-6 md:py-6 pb-20 max-w-6xl mx-auto w-full space-y-5">
      
      {/* Header with Module 4 Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-secondary-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-primary-50 text-primary-700 border border-primary-200">
              Module 4
            </span>
            <span className="text-xs font-semibold text-secondary-500">
              Catalogue Commercial
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-secondary-900 flex items-center gap-2 tracking-tight mt-1">
            <Package className="w-6 h-6 text-primary-600" /> Produits et services
          </h1>
          <p className="text-xs text-secondary-500 font-medium mt-0.5">
            Gérez vos prestations et tarifs pour les sélectionner directement lors de la création de vos factures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            onClick={openAddModal}
            className="shadow-sm"
          >
            <Plus className="w-4 h-4" /> Nouveau produit / service
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-secondary-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider block">
            Total Références
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-secondary-900">{totalCount}</span>
            <Package className="w-4 h-4 text-primary-500" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-secondary-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider block">
            Prestations / Services
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-blue-600">{servicesCount}</span>
            <Briefcase className="w-4 h-4 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-secondary-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider block">
            Produits Physiques
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-emerald-600">{productsCount}</span>
            <ShoppingBag className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-secondary-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider block">
            Prix Moyen Unitaire
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-black text-secondary-900">
              {formatPrice ? formatPrice(avgPrice) : `${avgPrice.toFixed(2)} ${currencySymbol || '$'}`}
            </span>
            <Tag className="w-4 h-4 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <Input
            placeholder="Rechercher par nom, description ou catégorie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4 stroke-[1.75]" />}
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition border whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-primary-600 text-white border-primary-600 shadow-2xs'
                  : 'bg-white text-secondary-600 border-secondary-200 hover:bg-secondary-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products List / Table */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={<Package className="w-8 h-8 stroke-[1.5]" />}
          title={searchQuery || selectedCategory !== 'Tous' ? "Aucun produit trouvé" : "Catalogue vide"}
          description={
            searchQuery || selectedCategory !== 'Tous'
              ? "Aucun produit ou prestation ne correspond à vos filtres actuels."
              : "Ajoutez vos premiers produits et services pour les réutiliser en un clic sur vos factures."
          }
          actionLabel="Ajouter un produit / service"
          onAction={openAddModal}
        />
      ) : (
        <div className="bg-white border border-secondary-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead className="sticky top-0 z-10 bg-secondary-50 shadow-sm">
                <tr>
                  <th className="py-3 px-4 sticky top-0 bg-secondary-50 border-b border-secondary-200 text-secondary-500 font-bold uppercase text-[10px] tracking-wider">
                    Nom & Description
                  </th>
                  <th className="py-3 px-4 sticky top-0 bg-secondary-50 border-b border-secondary-200 text-secondary-500 font-bold uppercase text-[10px] tracking-wider">
                    Type
                  </th>
                  <th className="py-3 px-4 sticky top-0 bg-secondary-50 border-b border-secondary-200 text-secondary-500 font-bold uppercase text-[10px] tracking-wider">
                    Unité
                  </th>
                  <th className="py-3 px-4 sticky top-0 bg-secondary-50 border-b border-secondary-200 text-secondary-500 font-bold uppercase text-[10px] tracking-wider text-right">
                    Prix Unitaire HT
                  </th>
                  <th className="py-3 px-4 sticky top-0 bg-secondary-50 border-b border-secondary-200 text-secondary-500 font-bold uppercase text-[10px] tracking-wider text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {filteredProducts.map((p) => {
                  const isService = (p.category || '').toLowerCase().includes('service') || (p.category || '').toLowerCase().includes('consult');
                  return (
                    <tr key={p.id} className="hover:bg-secondary-50/60 transition group">
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-secondary-900 flex items-center gap-1.5">
                          <span>{p.name}</span>
                          {p.sku && (
                            <span className="text-[9px] font-bold text-secondary-400 px-1.5 py-0.5 rounded bg-secondary-100">
                              {p.sku}
                            </span>
                          )}
                        </div>
                        {p.description && (
                          <p className="text-[11px] text-secondary-500 line-clamp-1 mt-0.5">
                            {p.description}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isService 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {p.category || 'Service'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-secondary-600 font-medium">
                        {p.unit || 'Forfait'}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-secondary-900">
                        {formatPrice ? formatPrice(p.unitPrice) : `${p.unitPrice.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => handleInvoiceWithProduct(p, e)}
                            className="px-2 py-1 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold text-[10px] flex items-center gap-1 transition"
                            title="Créer une facture avec ce produit"
                          >
                            <FileText className="w-3 h-3" />
                            <span className="hidden sm:inline">Facturer</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => openEditModal(p, e)}
                            className="p-1.5 rounded-lg text-secondary-500 hover:text-secondary-800 hover:bg-secondary-100 transition"
                            title="Modifier"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDuplicate(p, e)}
                            className="p-1.5 rounded-lg text-secondary-500 hover:text-secondary-800 hover:bg-secondary-100 transition"
                            title="Dupliquer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProductToDelete(p);
                            }}
                            className="p-1.5 rounded-lg text-error-500 hover:text-error-700 hover:bg-error-50 transition"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      {showModal && (
        <div className="fixed inset-0 bg-secondary-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg bg-white p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-secondary-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-secondary-900">
                  {editingProduct ? 'Modifier le produit / service' : 'Ajouter un produit ou service (Module 4)'}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowModal(false)} 
                className="text-secondary-400 hover:text-secondary-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-secondary-700 block mb-1">
                  Nom du produit ou service <span className="text-error-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Services de consultation, Développement web..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-secondary-50 border border-secondary-200 rounded-xl px-3.5 py-2 text-secondary-900 font-semibold focus:bg-white focus:border-primary-500 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-secondary-700 block mb-1">Type / Catégorie</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-secondary-50 border border-secondary-200 rounded-xl px-3 py-2 text-secondary-900 font-medium focus:bg-white transition outline-none"
                  >
                    <option value="Service">Service / Prestation</option>
                    <option value="Consultation">Consultation & Conseil</option>
                    <option value="Produit">Produit matériel / marchandise</option>
                    <option value="Forfait">Forfait / Abonnement récurrent</option>
                    <option value="Formation">Formation & Coaching</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-secondary-700 block mb-1">
                    Prix Unitaire HT ({regionalSettings?.currency || 'CAD'}) <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    className="w-full bg-secondary-50 border border-secondary-200 rounded-xl px-3 py-2 text-secondary-900 font-bold focus:bg-white focus:border-primary-500 outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-secondary-700 block mb-1">Unité de facturation</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-secondary-50 border border-secondary-200 rounded-xl px-3 py-2 text-secondary-900 font-medium focus:bg-white transition outline-none"
                  >
                    <option value="Forfait">Forfait global</option>
                    <option value="Heure">Par heure (/h)</option>
                    <option value="Jour">Par jour (/j)</option>
                    <option value="Unité">À l'unité (/u)</option>
                    <option value="Mois">Par mois (/mois)</option>
                    <option value="Projet">Par projet</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-secondary-700 block mb-1">Code référence / SKU</label>
                  <input
                    type="text"
                    placeholder="REF-1001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-secondary-50 border border-secondary-200 rounded-xl px-3 py-2 text-secondary-900 font-medium focus:bg-white focus:border-primary-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-secondary-700 block mb-1">
                  Description par défaut
                </label>
                <textarea
                  rows={2}
                  placeholder="Cette description apparaîtra automatiquement sur les factures émises..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-secondary-50 border border-secondary-200 rounded-xl px-3 py-2 text-secondary-900 font-medium focus:bg-white focus:border-primary-500 outline-none transition resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-secondary-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="sm"
                >
                  {editingProduct ? 'Enregistrer les modifications' : 'Ajouter au catalogue'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!productToDelete}
        title="Supprimer ce produit / service"
        message={`Êtes-vous sûr de vouloir supprimer "${productToDelete?.name}" de votre catalogue ? Vos factures existantes ne seront pas affectées.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={() => {
          if (productToDelete) {
            onDeleteProduct(productToDelete.id);
            triggerToast(`Produit "${productToDelete.name}" supprimé.`);
            setProductToDelete(null);
          }
        }}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
}
