import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  FileText,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Check,
  Briefcase
} from 'lucide-react';
import { ScreenId } from '../types';
import { useRegionalContext } from '../context/RegionalContext';
import { REGIONS } from '../data/regions';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, getDoc, collection, getDocs, addDoc } from 'firebase/firestore';

interface CompanySetupPageProps {
  setScreen: (screen: ScreenId) => void;
  triggerToast?: (msg: string) => void;
}

export interface CompanyProfile {
  id: string;
  companyName: string;
  ownerName: string;
  legalStatus: string;
  industry: string;
  logoUrl?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  taxId1?: string; // TPS (ARC)
  taxId2?: string; // TVQ / NEQ
  defaultPaymentMethod: string;
  paymentTerms: string;
  invoiceFooterNote?: string;
  region: 'canada' | 'afrique' | 'haiti';
  isDefault?: boolean;
}

const INDUSTRY_OPTIONS = [
  "Commerce de détail",
  "E-commerce",
  "Services professionnels",
  "Consultant / Freelance",
  "Technologies de l'information (TI)",
  "Construction et rénovation",
  "Immobilier",
  "Transport et logistique",
  "Restaurant, café et alimentation",
  "Santé et bien-être",
  "Beauté et esthétique",
  "Éducation et formation",
  "Création, design et médias",
  "Photographie et audiovisuel",
  "Agriculture et agroalimentaire",
  "Hôtellerie et tourisme",
  "Réparation et maintenance",
  "Sport et loisirs",
  "Fabric",
  "Autre"
];

export default function CompanySetupPage({
  setScreen,
  triggerToast
}: CompanySetupPageProps) {
  const { region: activeRegion } = useRegionalContext();
  const regionConfig = REGIONS[activeRegion] || REGIONS.canada;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Multi-companies state
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState<string>('default');

  // Form State for Active Company
  const [companyName, setCompanyName] = useState('Mon Entreprise');
  const [ownerName, setOwnerName] = useState('Nouvel Utilisateur');
  const [legalStatus, setLegalStatus] = useState('Travailleur autonome / Particulier');
  const [industry, setIndustry] = useState('Services professionnels');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [email, setEmail] = useState('ferline028@gmail.com');
  const [phone, setPhone] = useState(
    activeRegion === 'canada' ? '+1 (514) 000-0000' : activeRegion === 'afrique' ? '+221 77 000 0000' : '+509 0000 0000'
  );
  const [address, setAddress] = useState('123 Rue Principale');
  const [city, setCity] = useState(
    activeRegion === 'canada' ? 'Montréal' : activeRegion === 'afrique' ? 'Dakar' : 'Port-au-Prince'
  );
  const [taxId1, setTaxId1] = useState(activeRegion === 'canada' ? '123456789 RT 0001' : '');
  const [taxId2, setTaxId2] = useState(activeRegion === 'canada' ? '1234567890 TQ 0001' : '');
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState(
    activeRegion === 'canada' ? 'Virement Interac' : activeRegion === 'afrique' ? 'Wave / Orange Money' : 'MonCash'
  );
  const [paymentTerms, setPaymentTerms] = useState('Payable sous 30 jours (Standard)');
  const [isSaving, setIsSaving] = useState(false);

  // Load existing companies from LocalStorage & Firestore
  useEffect(() => {
    const storageKey = `startbill_companies_${activeRegion}`;
    const saved = localStorage.getItem(storageKey);
    let loadedCompanies: CompanyProfile[] = [];

    if (saved) {
      try {
        loadedCompanies = JSON.parse(saved);
      } catch (e) {
        console.warn('Error parsing local companies', e);
      }
    }

    if (loadedCompanies.length === 0) {
      // Default initial company
      const initialComp: CompanyProfile = {
        id: 'comp_default_' + Date.now(),
        companyName: 'Mon Entreprise',
        ownerName: 'Nouvel Utilisateur',
        legalStatus: 'Travailleur autonome / Particulier',
        industry: 'Services professionnels',
        logoUrl: '',
        email: 'ferline028@gmail.com',
        phone: activeRegion === 'canada' ? '+1 (514) 000-0000' : activeRegion === 'afrique' ? '+221 77 000 0000' : '+509 0000 0000',
        address: '123 Rue Principale',
        city: activeRegion === 'canada' ? 'Montréal' : activeRegion === 'afrique' ? 'Dakar' : 'Port-au-Prince',
        taxId1: activeRegion === 'canada' ? '123456789 RT 0001' : '',
        taxId2: activeRegion === 'canada' ? '1234567890 TQ 0001' : '',
        defaultPaymentMethod: activeRegion === 'canada' ? 'Virement Interac' : activeRegion === 'afrique' ? 'Wave / Orange Money' : 'MonCash',
        paymentTerms: 'Payable sous 30 jours (Standard)',
        region: activeRegion,
        isDefault: true
      };
      loadedCompanies = [initialComp];
    }

    setCompanies(loadedCompanies);
    setActiveCompanyId(loadedCompanies[0].id);
    populateForm(loadedCompanies[0]);

    // Try loading from Firestore for authenticated user
    const user = auth.currentUser;
    if (user) {
      getDoc(doc(db, 'users', user.uid)).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.email) setEmail(data.email);
          if (data.fullName) setOwnerName(data.fullName);
          if (data.companyName) setCompanyName(data.companyName);
          if (data.phone) setPhone(data.phone);
          if (data.logoUrl) setLogoUrl(data.logoUrl);
        }
      }).catch((e) => console.warn('Notice Firestore user sync:', e));
    }
  }, [activeRegion]);

  const populateForm = (comp: CompanyProfile) => {
    setCompanyName(comp.companyName || 'Mon Entreprise');
    setOwnerName(comp.ownerName || 'Nouvel Utilisateur');
    setLegalStatus(comp.legalStatus || 'Travailleur autonome / Particulier');
    setIndustry(comp.industry || 'Services professionnels');
    setLogoUrl(comp.logoUrl || '');
    setEmail(comp.email || 'ferline028@gmail.com');
    setPhone(comp.phone || '+1 (514) 000-0000');
    setAddress(comp.address || '123 Rue Principale');
    setCity(comp.city || (activeRegion === 'canada' ? 'Montréal' : 'Dakar'));
    setTaxId1(comp.taxId1 || '');
    setTaxId2(comp.taxId2 || '');
    setDefaultPaymentMethod(comp.defaultPaymentMethod || (activeRegion === 'canada' ? 'Virement Interac' : 'Wave / Orange Money'));
    setPaymentTerms(comp.paymentTerms || 'Payable sous 30 jours (Standard)');
  };

  const handleSelectCompany = (comp: CompanyProfile) => {
    setActiveCompanyId(comp.id);
    populateForm(comp);
  };

  const handleAddNewCompany = () => {
    const newComp: CompanyProfile = {
      id: `comp_${Date.now()}`,
      companyName: `Entreprise ${companies.length + 1}`,
      ownerName: ownerName || 'Nouvel Utilisateur',
      legalStatus: 'Travailleur autonome / Particulier',
      industry: 'Services professionnels',
      logoUrl: '',
      email: email || 'contact@monentreprise.com',
      phone: phone || '+1 (514) 000-0000',
      address: '123 Rue Principale',
      city: city || 'Montréal',
      taxId1: activeRegion === 'canada' ? '123456789 RT 0001' : '',
      taxId2: activeRegion === 'canada' ? '1234567890 TQ 0001' : '',
      defaultPaymentMethod: defaultPaymentMethod || 'Virement Interac',
      paymentTerms: 'Payable sous 30 jours (Standard)',
      region: activeRegion,
      isDefault: false
    };

    const updated = [...companies, newComp];
    setCompanies(updated);
    setActiveCompanyId(newComp.id);
    populateForm(newComp);
    localStorage.setItem(`startbill_companies_${activeRegion}`, JSON.stringify(updated));
    if (triggerToast) {
      triggerToast(`Nouvelle entreprise "${newComp.companyName}" ajoutée.`);
    }
  };

  // Logo file upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        if (triggerToast) triggerToast('Le fichier est trop volumineux (max 2 Mo).');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setLogoUrl(result);
        if (triggerToast) triggerToast('Logo importé avec succès !');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updatedCompany: CompanyProfile = {
      id: activeCompanyId,
      companyName: companyName.trim() || 'Mon Entreprise',
      ownerName: ownerName.trim(),
      legalStatus,
      industry,
      logoUrl,
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      taxId1: activeRegion === 'canada' ? taxId1.trim() : undefined,
      taxId2: activeRegion === 'canada' ? taxId2.trim() : undefined,
      defaultPaymentMethod,
      paymentTerms,
      region: activeRegion,
      isDefault: true
    };

    // Update companies list
    const updatedList = companies.map(c => c.id === activeCompanyId ? updatedCompany : c);
    setCompanies(updatedList);
    localStorage.setItem(`startbill_companies_${activeRegion}`, JSON.stringify(updatedList));
    localStorage.setItem('startbill_active_company', JSON.stringify(updatedCompany));

    try {
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, 'users', user.uid), {
          companyName: updatedCompany.companyName,
          fullName: updatedCompany.ownerName || user.displayName || 'Entrepreneur',
          legalStatus: updatedCompany.legalStatus,
          industry: updatedCompany.industry,
          logoUrl: updatedCompany.logoUrl || '',
          email: updatedCompany.email || user.email,
          phone: updatedCompany.phone,
          address: updatedCompany.address,
          city: updatedCompany.city,
          taxId1: updatedCompany.taxId1 || '',
          taxId2: updatedCompany.taxId2 || '',
          defaultPaymentMethod: updatedCompany.defaultPaymentMethod,
          paymentTerms: updatedCompany.paymentTerms,
          region: activeRegion,
          currency: regionConfig.currency,
          currencySymbol: regionConfig.currencySymbol,
          hasCompletedCompanySetup: true,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }

      if (triggerToast) {
        triggerToast('Profil d’entreprise enregistré avec succès !');
      }
      setScreen('welcome_dashboard');
    } catch (err) {
      console.warn('Saved locally, Firestore sync error:', err);
      if (triggerToast) {
        triggerToast('Profil enregistré localement.');
      }
      setScreen('welcome_dashboard');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 font-sans flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-10 selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        
        {/* Top Bar: Clean Header & Active Region Badge */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              StartBill
            </span>
          </div>

          {/* Region Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              Région active :
            </span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs font-black text-slate-800">
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-extrabold text-slate-600 uppercase">
                {activeRegion === 'canada' ? 'CA' : activeRegion === 'afrique' ? 'AF' : 'HT'}
              </span>
              <span>{activeRegion === 'canada' ? 'Canada' : activeRegion === 'afrique' ? 'Afrique' : 'Haïti'}</span>
              <span className="text-[#3855F6] font-bold">({regionConfig.currency})</span>
            </div>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Configurez votre profil d'entreprise
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-3xl">
            Ces informations apparaîtront sur vos factures, devis et rapports comptables adaptés à la fiscalité de votre région.
          </p>
        </div>

        {/* Multi-Companies Selector Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-[#3855F6]" />
              <span>Vos entreprises ({regionConfig.name}) :</span>
            </span>

            {companies.map((comp) => {
              const isSelected = comp.id === activeCompanyId;
              return (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => handleSelectCompany(comp)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#3855F6] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70 border border-slate-200/60'
                  }`}
                >
                  <span>{comp.companyName || 'Entreprise sans nom'}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleAddNewCompany}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#3855F6] text-xs font-bold transition cursor-pointer border border-blue-200 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter une autre entreprise</span>
          </button>
        </div>

        {/* Main Setup Form Grid */}
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Form Sections (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. INFORMATIONS GÉNÉRALES */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#3855F6] flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
                    1. INFORMATIONS GÉNÉRALES
                  </h2>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Identification de votre structure
                  </span>
                </div>
              </div>

              {/* Logo Upload Section */}
              <div className="space-y-2">
                <label className="font-extrabold text-[11px] text-slate-700 uppercase tracking-wider block">
                  LOGO DE L'ENTREPRISE
                </label>
                <div className="flex items-center gap-4">
                  {logoUrl ? (
                    <div className="relative w-16 h-16 rounded-2xl border border-slate-200 bg-slate-50 p-1 flex items-center justify-center overflow-hidden group">
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-2xl cursor-pointer"
                        title="Supprimer le logo"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/svg+xml"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="company-logo-input"
                    />
                    <label
                      htmlFor="company-logo-input"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition border border-slate-200"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#3855F6]" />
                      <span>{logoUrl ? 'Changer le logo' : 'Importer le logo'}</span>
                    </label>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Formats recommandés : PNG, JPG, SVG (Max 2 Mo)
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Fields: General Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Nom commercial de l'entreprise <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Mon Entreprise"
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-[#3855F6]/20 focus:border-[#3855F6] transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Nom du propriétaire / Responsable
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Nouvel Utilisateur"
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-[#3855F6]/20 focus:border-[#3855F6] transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Forme juridique</label>
                  <select
                    value={legalStatus}
                    onChange={(e) => setLegalStatus(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-medium focus:bg-white transition"
                  >
                    <option value="Travailleur autonome / Particulier">Travailleur autonome / Particulier</option>
                    <option value="Entreprise individuelle">Entreprise individuelle</option>
                    <option value="Société par actions (Inc. / Corp)">Société par actions (Inc. / Corp)</option>
                    <option value="SARL / SAS">SARL / SAS</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Secteur d'activité</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-medium focus:bg-white transition"
                  >
                    {INDUSTRY_OPTIONS.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. NUMÉROS FISCAUX (ONLY SHOWN FOR CANADA) */}
            {activeRegion === 'canada' && (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
                      2. NUMÉROS FISCAUX
                    </h2>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Numéros TPS/TVQ et NEQ
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Numéro de TPS / TVH (ARC)
                    </label>
                    <input
                      type="text"
                      value={taxId1}
                      onChange={(e) => setTaxId1(e.target.value)}
                      placeholder="123456789 RT 0001"
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-[#3855F6]/20 focus:border-[#3855F6] transition"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Numéro de TVQ / NEQ (Revenu Québec)
                    </label>
                    <input
                      type="text"
                      value={taxId2}
                      onChange={(e) => setTaxId2(e.target.value)}
                      placeholder="1234567890 TQ 0001"
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-[#3855F6]/20 focus:border-[#3855F6] transition"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. COORDONNÉES & PAIEMENT (Numbered 2 if non-Canada, 3 if Canada) */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
                    {activeRegion === 'canada' ? '3. COORDONNÉES & PAIEMENT' : '2. COORDONNÉES & PAIEMENT'}
                  </h2>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Adresse, contact et coordonnées pour encaisser
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Courriel professionnel</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ferline028@gmail.com"
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-[#3855F6]/20 focus:border-[#3855F6] transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Téléphone de contact</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (514) 000-0000"
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-[#3855F6]/20 focus:border-[#3855F6] transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Adresse postale</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Rue Principale"
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-[#3855F6]/20 focus:border-[#3855F6] transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ville</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={activeRegion === 'canada' ? 'Montréal' : activeRegion === 'afrique' ? 'Dakar' : 'Port-au-Prince'}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-[#3855F6]/20 focus:border-[#3855F6] transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mode de paiement préféré</label>
                  <select
                    value={defaultPaymentMethod}
                    onChange={(e) => setDefaultPaymentMethod(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-medium focus:bg-white transition"
                  >
                    {activeRegion === 'canada' && (
                      <>
                        <option value="Virement Interac">Virement Interac</option>
                        <option value="Carte bancaire / Stripe">Carte bancaire / Stripe</option>
                        <option value="Virement bancaire direct">Virement bancaire direct</option>
                        <option value="Chèque">Chèque</option>
                      </>
                    )}
                    {activeRegion === 'afrique' && (
                      <>
                        <option value="Wave / Orange Money">Wave / Orange Money</option>
                        <option value="MTN Mobile Money">MTN Mobile Money</option>
                        <option value="Virement bancaire">Virement bancaire</option>
                        <option value="Espèces / Chèque">Espèces / Chèque</option>
                      </>
                    )}
                    {activeRegion === 'haiti' && (
                      <>
                        <option value="MonCash">MonCash</option>
                        <option value="Natcash">Natcash</option>
                        <option value="Virement bancaire (SOGEBANK / UNIBANK)">Virement bancaire (SOGEBANK / UNIBANK)</option>
                        <option value="Espèces (Cash)">Espèces (Cash)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Délai de règlement par défaut</label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-medium focus:bg-white transition"
                  >
                    <option value="Payable sous 30 jours (Standard)">Payable sous 30 jours (Standard)</option>
                    <option value="Paiement à réception">Paiement à réception (Immédiat)</option>
                    <option value="Payable sous 15 jours">Payable sous 15 jours</option>
                    <option value="Payable sous 60 jours">Payable sous 60 jours</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Live Invoice Preview & Actions Card */}
          <div className="space-y-6">
            
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-4 sticky top-4">
              
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#3855F6]" />
                  <span>APERÇU DE VOTRE EN-TÊTE</span>
                </span>
                <span className="text-[10px] font-bold text-[#3855F6] bg-blue-50 px-2 py-0.5 rounded-full">
                  Facture type
                </span>
              </div>

              {/* Invoice Preview Box */}
              <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 max-w-[170px]">
                    {logoUrl ? (
                      <div className="w-10 h-10 mb-1 rounded-lg overflow-hidden bg-white border border-slate-200 p-0.5">
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                      </div>
                    ) : null}
                    <h3 className="font-black text-slate-900 text-sm leading-tight">
                      {companyName || 'Mon Entreprise'}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight">
                      {industry}
                    </p>
                    <p className="text-[10px] text-slate-600 truncate">{email}</p>
                    {address && <p className="text-[10px] text-slate-500">{address}, {city}</p>}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-black text-[#3855F6] bg-blue-100/70 px-2 py-0.5 rounded">
                      FACTURE
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">#FACT-2026-001</p>
                  </div>
                </div>

                {/* Tax Numbers Preview (Canada) */}
                {activeRegion === 'canada' && (taxId1 || taxId2) && (
                  <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 space-y-0.5">
                    {taxId1 && <p><span className="font-bold text-slate-700">TPS :</span> {taxId1}</p>}
                    {taxId2 && <p><span className="font-bold text-slate-700">TVQ :</span> {taxId2}</p>}
                  </div>
                )}

                {/* Payment terms line */}
                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-600">
                  <span className="font-bold text-slate-800 block mb-0.5">Mode de règlement :</span>
                  <p className="truncate">{defaultPaymentMethod} • {paymentTerms.replace('Payable sous ', '')}</p>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#3855F6] hover:bg-[#2A46E0] active:scale-[0.99] text-white text-xs font-black shadow-md transition flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>{isSaving ? 'Enregistrement...' : 'Enregistrer & Continuer vers le Welcome'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Skip Step Link */}
              <button
                type="button"
                onClick={() => setScreen('welcome_dashboard')}
                className="w-full py-2 px-4 rounded-xl text-slate-500 hover:text-slate-900 text-xs font-semibold transition cursor-pointer text-center"
              >
                Passer cette étape pour l'instant
              </button>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
}
