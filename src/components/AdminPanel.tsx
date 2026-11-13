import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import {
  ShieldCheck, Users, UtensilsCrossed, Settings, Plus, Edit2, Trash2,
  Check, Package, Layers, Smartphone,
  Monitor, ChefHat, Save, Search,
  Sliders, Shield, Building, Database,
  QrCode, ArrowRight, ExternalLink, HelpCircle, Wifi, Printer, SlidersHorizontal
} from 'lucide-react';
import { Category, Product } from '../types';
import { sound } from '../utils/sound';
import { CHILE_IVA_PERCENT, formatCLP, normalizeCurrencySymbol, roundCLP } from '../utils/currency';
import { DatabaseManager } from './DatabaseManager';
import { UsersDirectoryManager } from './admin/UsersDirectoryManager';
import { RolesPermissionsManager } from './admin/RolesPermissionsManager';
import { ModifiersManager } from './admin/ModifiersManager';
import { TicketCustomizationSettings } from './admin/TicketCustomizationSettings';
import { PrintAreasManager } from './admin/PrintAreasManager';
import { SystemModulesSettings } from './admin/SystemModulesSettings';

type AdminTab =
  | 'users'
  | 'roles'
  | 'catalog'
  | 'modifiers'
  | 'tickets'
  | 'print-areas'
  | 'modules'
  | 'database'
  | 'settings';

export const AdminPanel: React.FC = () => {
  const {
    waiters,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    restaurantBrand,
    updateRestaurantBrand,
    currency,
    themeMode,
    stationMode,
    setStationMode,
    setActiveView
  } = usePOS();

  const isLight = themeMode === 'vibrant-light';
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // CATEGORY MODAL STATE
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [catFormData, setCatFormData] = useState<{
    name: string;
    icon: string;
    color: string;
    image: string;
    order: number;
  }>({
    name: '',
    icon: 'Utensils',
    color: 'from-amber-500 to-orange-600',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    order: categories.length + 1,
  });

  // PRODUCT MODAL STATE
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // QR & STATION MODAL STATE
  const [qrModalStation, setQrModalStation] = useState<'waiter-mobile' | 'kitchen-kds' | null>(null);
  const [isStationGuideOpen, setIsStationGuideOpen] = useState<boolean>(false);
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<number | 'all'>('all');
  const [prodFormData, setProdFormData] = useState<{
    name: string;
    categoryId: number;
    price: number;
    buyPrice: number;
    iva: number;
    stock: number;
    minStock: number;
    image: string;
    isKitchen: boolean;
    kitchenBlock: number;
    description: string;
    allergens: string[];
    available: boolean;
  }>({
    name: '',
    categoryId: categories[0]?.id || 1,
    price: 12000,
    buyPrice: 4500,
    iva: CHILE_IVA_PERCENT,
    stock: 20,
    minStock: 5,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
    isKitchen: true,
    kitchenBlock: 1,
    description: '',
    allergens: [],
    available: true,
  });

  // RESTAURANT BRAND FORM STATE
  const [brandFormData, setBrandFormData] = useState(restaurantBrand);

  // CATEGORY ACTIONS
  const handleOpenNewCategory = () => {
    setEditingCategoryId(null);
    setCatFormData({
      name: '',
      icon: 'Utensils',
      color: 'from-amber-500 to-orange-600',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
      order: categories.length + 1,
    });
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setCatFormData({
      name: cat.name,
      icon: cat.icon || 'Utensils',
      color: cat.color || 'from-amber-500 to-orange-600',
      image: cat.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
      order: cat.order || 1,
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormData.name.trim()) return;

    sound.playTap();
    if (editingCategoryId) {
      updateCategory(editingCategoryId, catFormData);
    } else {
      addCategory(catFormData);
    }
    setIsCategoryModalOpen(false);
  };

  // PRODUCT ACTIONS
  const handleOpenNewProduct = () => {
    setEditingProductId(null);
    setProdFormData({
      name: '',
      categoryId: selectedCatalogCategory === 'all' ? (categories[0]?.id || 1) : Number(selectedCatalogCategory),
      price: 12000,
      buyPrice: 4500,
      iva: CHILE_IVA_PERCENT,
      stock: 20,
      minStock: 5,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
      isKitchen: true,
      kitchenBlock: 1,
      description: '',
      allergens: [],
      available: true,
    });
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProdFormData({
      name: prod.name,
      categoryId: prod.categoryId,
      price: roundCLP(prod.price),
      buyPrice: roundCLP(prod.buyPrice || 0),
      iva: prod.iva ?? CHILE_IVA_PERCENT,
      stock: prod.stock,
      minStock: prod.minStock || 5,
      image: prod.image,
      isKitchen: prod.isKitchen,
      kitchenBlock: prod.kitchenBlock || 1,
      description: prod.description || '',
      allergens: prod.allergens || [],
      available: prod.available ?? true,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodFormData.name.trim()) return;

    sound.playTap();
    if (editingProductId) {
      updateProduct(editingProductId, prodFormData);
    } else {
      addProduct(prodFormData);
    }
    setIsProductModalOpen(false);
  };

  // Filtered products for catalog
  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCatalogCategory === 'all' || p.categoryId === Number(selectedCatalogCategory);
    const matchSearch = p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      categories.find(c => c.id === p.categoryId)?.name.toLowerCase().includes(catalogSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className={`flex-1 flex flex-col h-full overflow-y-auto select-none transition-colors p-4 sm:p-6 ${
      isLight ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Header with Title & Main Tabs */}
      <div className={`flex flex-col gap-3.5 pb-4 border-b ${
        isLight ? 'border-slate-200' : 'border-slate-800/80'
      }`}>
        <div>
          <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span>Panel de Administración & Configuración</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gestión integral de usuarios, roles granulares, opciones y modificadores, áreas de impresión, tickets y módulos del sistema.
          </p>
        </div>

        {/* Scrollable Modular Tab Switcher */}
        <div className={`flex items-center gap-1.5 p-1.5 rounded-2xl border overflow-x-auto no-scrollbar ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
        }`}>
          {[
            { id: 'users' as AdminTab, label: `Usuarios (${waiters.length})`, icon: Users },
            { id: 'roles' as AdminTab, label: 'Roles & Permisos', icon: Shield },
            { id: 'catalog' as AdminTab, label: 'Catálogo & Categorías', icon: UtensilsCrossed },
            { id: 'modifiers' as AdminTab, label: 'Opciones & Modificadores', icon: Sliders },
            { id: 'tickets' as AdminTab, label: 'Tickets & Formato', icon: Printer },
            { id: 'print-areas' as AdminTab, label: 'Áreas de Impresión', icon: Layers },
            { id: 'modules' as AdminTab, label: 'Módulos del Sistema', icon: SlidersHorizontal },
            { id: 'database' as AdminTab, label: 'Base de Datos', icon: Database },
            { id: 'settings' as AdminTab, label: 'TPV & Red', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => { sound.playTap(); setActiveTab(tab.id); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : isLight
                    ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB: USUARIOS CREADOS (ADMIN-ONLY) */}
      {activeTab === 'users' && (
        <div className="mt-4">
          <UsersDirectoryManager />
        </div>
      )}

      {/* TAB: ROLES Y PERMISOS PERSONALIZADOS */}
      {activeTab === 'roles' && (
        <div className="mt-4">
          <RolesPermissionsManager />
        </div>
      )}

      {/* TAB: OPCIONES Y MODIFICADORES */}
      {activeTab === 'modifiers' && (
        <div className="mt-4">
          <ModifiersManager />
        </div>
      )}

      {/* TAB: PERSONALIZACIÓN DE TICKETS */}
      {activeTab === 'tickets' && (
        <div className="mt-4">
          <TicketCustomizationSettings />
        </div>
      )}

      {/* TAB: ÁREAS DE IMPRESIÓN */}
      {activeTab === 'print-areas' && (
        <div className="mt-4">
          <PrintAreasManager />
        </div>
      )}

      {/* TAB: MÓDULOS DEL SISTEMA */}
      {activeTab === 'modules' && (
        <div className="mt-4">
          <SystemModulesSettings />
        </div>
      )}

      {/* TAB 2: CATÁLOGO DE PRODUCTOS Y CATEGORÍAS */}
      {activeTab === 'catalog' && (
        <div className="space-y-6 mt-4">
          {/* Categories Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-500" />
                  <span>Categorías del Menú</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Organice los platos y bebidas en familias visuales.
                </p>
              </div>

              <button
                onClick={handleOpenNewCategory}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/30 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva Categoría</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {categories.map(cat => {
                const count = products.filter(p => p.categoryId === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className={`p-3 rounded-2xl border relative group overflow-hidden flex flex-col justify-between ${
                      isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="w-full h-16 rounded-xl overflow-hidden relative">
                        <img
                          src={cat.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80'}
                          alt={cat.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                          {count} platos
                        </span>
                      </div>
                      <div className={`font-extrabold text-xs truncate ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}>
                        {cat.name}
                      </div>
                    </div>

                    <div className={`flex items-center justify-between pt-2 mt-2 border-t ${
                      isLight ? 'border-slate-100' : 'border-slate-800'
                    }`}>
                      <button
                        onClick={() => handleEditCategory(cat)}
                        className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                      >
                        Editar
                      </button>
                      {categories.length > 1 && (
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar la categoría "${cat.name}"?`)) {
                              deleteCategory(cat.id);
                            }
                          }}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Products Section */}
          <div className={`space-y-3 pt-4 border-t ${
            isLight ? 'border-slate-200' : 'border-slate-800'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-500" />
                  <span>Productos y Precios</span>
                </h2>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Edición de PVP, control de stock y asignación de cocina.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenNewProduct}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Producto</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Buscar producto por nombre..."
                  className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${
                    isLight ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400' : 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500'
                  }`}
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSelectedCatalogCategory('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCatalogCategory === 'all'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  Todos ({products.length})
                </button>
                {categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCatalogCategory(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCatalogCategory === c.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {filteredProducts.map(prod => {
                const cat = categories.find(c => c.id === prod.categoryId);
                return (
                  <div
                    key={prod.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                      isLight ? 'bg-white border-slate-200 shadow-xs hover:shadow-md' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          referrerPolicy="no-referrer"
                          className={`w-14 h-14 rounded-xl object-cover border shrink-0 ${
                            isLight ? 'border-slate-200' : 'border-slate-800'
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <span className={`text-[10px] block font-semibold truncate ${
                            isLight ? 'text-slate-500' : 'text-slate-400'
                          }`}>
                            {cat?.name || 'General'}
                          </span>
                          <h3 className={`font-black text-xs line-clamp-1 ${
                            isLight ? 'text-slate-900' : 'text-white'
                          }`}>
                            {prod.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1 font-mono">
                            <span className={`text-sm font-black ${
                              isLight ? 'text-emerald-600' : 'text-emerald-400'
                            }`}>
                              {formatCLP(prod.price, currency)}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              (IVA {prod.iva}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stock & Kitchen Status */}
                      <div className={`flex items-center justify-between p-2 rounded-xl text-[11px] ${
                        isLight ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-slate-200'
                      }`}>
                        <div className="flex items-center gap-1">
                          <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Stock:</span>
                          <strong className={`font-mono ${prod.stock <= prod.minStock ? 'text-rose-500' : isLight ? 'text-slate-900 font-bold' : 'text-slate-300'}`}>
                            {prod.stock} uds
                          </strong>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          prod.available
                            ? isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-950/60 text-emerald-300'
                            : isLight ? 'bg-rose-100 text-rose-800' : 'bg-rose-950/60 text-rose-300'
                        }`}>
                          {prod.available ? 'En Carta' : 'Agotado'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={`flex items-center justify-between pt-2 mt-2 border-t ${
                      isLight ? 'border-slate-100' : 'border-slate-800'
                    }`}>
                      <button
                        onClick={() => handleEditProduct(prod)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          isLight
                            ? 'bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-600'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar producto "${prod.name}"?`)) {
                            deleteProduct(prod.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONFIGURACIÓN TPV, NEGOCIO & RED */}
      {activeTab === 'settings' && (
        <div className="space-y-6 mt-4 max-w-4xl">
          {/* Station Mode Architecture Guide */}
          <div className={`p-5 rounded-3xl border shadow-xs space-y-4 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-extrabold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Modos de Estación y Sincronización en Red Local
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                    Active el perfil en este equipo o genere códigos QR para conectar celulares y tablets.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { sound.playTap(); setIsStationGuideOpen(true); }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isLight
                    ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-800'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>¿Cómo activar en cada equipo?</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              {/* Station 1: Master PC */}
              <div
                className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                  stationMode === 'master-pc'
                    ? isLight
                      ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/30 shadow-xs'
                      : 'bg-blue-950/60 border-blue-400 ring-2 ring-blue-400/40 shadow-sm'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    : 'bg-slate-950 border-slate-800 opacity-80 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Monitor className="w-4 h-4" />
                    </div>
                    {stationMode === 'master-pc' ? (
                      <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold shadow-xs">
                        Activo en esta pantalla
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Caja Principal
                      </span>
                    )}
                  </div>
                  <div className={`font-black text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    🖥️ PC Servidor / Caja
                  </div>
                  <p className={`text-[11px] mt-1.5 leading-relaxed ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                    Apertura/cierre de turnos Z, cobro en barra, control total de inventario y base de datos.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setStationMode('master-pc');
                      setActiveView('floor');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Usar Modo Caja</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Station 2: Mobile Waiter */}
              <div
                className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                  stationMode === 'waiter-mobile'
                    ? isLight
                      ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/30 shadow-xs'
                      : 'bg-emerald-950/60 border-emerald-400 ring-2 ring-emerald-400/40 shadow-sm'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    : 'bg-slate-950 border-slate-800 opacity-80 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    {stationMode === 'waiter-mobile' ? (
                      <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold shadow-xs">
                        Activo en esta pantalla
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Celular / Tablet
                      </span>
                    )}
                  </div>
                  <div className={`font-black text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    📱 Comandero Garzón
                  </div>
                  <p className={`text-[11px] mt-1.5 leading-relaxed ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                    Toma rápida de comandas en mesas, envío instantáneo a cocina y bloqueo de caja registradora.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setStationMode('waiter-mobile');
                      setActiveView('floor');
                    }}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Probar Modo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setQrModalStation('waiter-mobile');
                    }}
                    title="Ver Código QR para escanear con el móvil del camarero"
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                      isLight
                        ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>QR</span>
                  </button>
                </div>
              </div>

              {/* Station 3: Kitchen KDS */}
              <div
                className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                  stationMode === 'kitchen-kds'
                    ? isLight
                      ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/30 shadow-xs'
                      : 'bg-amber-950/60 border-amber-400 ring-2 ring-amber-400/40 shadow-sm'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    : 'bg-slate-950 border-slate-800 opacity-80 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <ChefHat className="w-4 h-4" />
                    </div>
                    {stationMode === 'kitchen-kds' ? (
                      <span className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded-full font-bold shadow-xs">
                        Activo en esta pantalla
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Tablet / TV Cocina
                      </span>
                    )}
                  </div>
                  <div className={`font-black text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    🍳 Pantalla de Cocina (KDS)
                  </div>
                  <p className={`text-[11px] mt-1.5 leading-relaxed ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                    Recepción de pedidos por bloques de marcha (1ºs, 2ºs, postres) con avisos sonoros y tiempos de pase.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setStationMode('kitchen-kds');
                      setActiveView('kitchen');
                    }}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Abrir Cocina</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setQrModalStation('kitchen-kds');
                    }}
                    title="Ver Código QR para escanear en la pantalla de la cocina"
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                      isLight
                        ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>QR</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Restaurant Fiscal & Brand Settings Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sound.playTap();
              updateRestaurantBrand(brandFormData);
              alert('Configuración guardada correctamente.');
            }}
            className={`p-5 rounded-3xl border shadow-xs space-y-4 ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className={`flex items-center gap-2 pb-2 border-b ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <Building className="w-4 h-4 text-blue-500" />
              <h3 className={`font-extrabold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Datos Fiscales y Parámetros del Restaurante
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="space-y-1">
                <label className={`font-bold block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Nombre Comercial
                </label>
                <input
                  type="text"
                  value={brandFormData.name}
                  onChange={(e) => setBrandFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white'
                      : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className={`font-bold block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Eslogan / Tipo de Cocina
                </label>
                <input
                  type="text"
                  value={brandFormData.tagline}
                  onChange={(e) => setBrandFormData(prev => ({ ...prev, tagline: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white'
                      : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className={`font-bold block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  NIF / CIF / RUT
                </label>
                <input
                  type="text"
                  value={brandFormData.cif}
                  onChange={(e) => setBrandFormData(prev => ({ ...prev, cif: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white'
                      : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className={`font-bold block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Moneda Oficial del Sistema
                </label>
                <select
                  value={normalizeCurrencySymbol(brandFormData.currency) === 'CLP$' ? 'CLP$' : '$'}
                  onChange={(e) => setBrandFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white'
                      : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                >
                  <option value="$">Peso Chileno ($ CLP)</option>
                  <option value="CLP$">Peso Chileno (CLP$)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className={`font-bold block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Dirección
                </label>
                <input
                  type="text"
                  value={brandFormData.address}
                  onChange={(e) => setBrandFormData(prev => ({ ...prev, address: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white'
                      : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className={`font-bold block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Teléfono
                </label>
                <input
                  type="text"
                  value={brandFormData.phone}
                  onChange={(e) => setBrandFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white'
                      : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className={`font-bold block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Mensaje Pie de Ticket
              </label>
              <input
                type="text"
                value={brandFormData.ticketFooter}
                onChange={(e) => setBrandFormData(prev => ({ ...prev, ticketFooter: e.target.value }))}
                className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white'
                    : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Configuración General</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: CONTROL TOTAL DE BASE DE DATOS */}
      {activeTab === 'database' && (
        <div className="mt-4">
          <DatabaseManager />
        </div>
      )}



      {/* CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 select-none">
          <div className={`border rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl transition-colors ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className={`flex items-center justify-between pb-2 border-b ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <h3 className="font-black text-base">
                {editingCategoryId ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className={`font-bold block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Nombre de Categoría
                </label>
                <input
                  type="text"
                  value={catFormData.name}
                  onChange={(e) => setCatFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Entrantes & Tapas Gourmet"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-bold transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500'
                      : 'bg-slate-950 border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className={`font-bold block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  URL Imagen de Portada
                </label>
                <input
                  type="url"
                  value={catFormData.image}
                  onChange={(e) => setCatFormData(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500'
                      : 'bg-slate-950 border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500'
                  }`}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md cursor-pointer"
                >
                  {editingCategoryId ? 'Actualizar Categoría' : 'Crear Categoría'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className={`px-4 py-3 rounded-xl font-bold border transition-all cursor-pointer ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 select-none overflow-y-auto">
          <div className={`border rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl transition-colors my-auto ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className={`flex items-center justify-between pb-2 border-b ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <h3 className="font-black text-base">
                {editingProductId ? 'Editar Producto del Menú' : 'Nuevo Producto'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={`font-bold block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Nombre del Plato / Bebida
                  </label>
                  <input
                    type="text"
                    value={prodFormData.name}
                    onChange={(e) => setProdFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Pulpo Braseado a la Gallega"
                    required
                    className={`w-full px-3 py-2 rounded-xl border font-bold transition-all ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                        : 'bg-slate-950 border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`font-bold block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Categoría
                  </label>
                  <select
                    value={prodFormData.categoryId}
                    onChange={(e) => setProdFormData(prev => ({ ...prev, categoryId: Number(e.target.value) }))}
                    className={`w-full px-3 py-2 rounded-xl border font-bold transition-all ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                        : 'bg-slate-950 border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                    }`}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className={`font-bold block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    PVP con IVA ({currency})
                  </label>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={prodFormData.price}
                    onChange={(e) => setProdFormData(prev => ({ ...prev, price: roundCLP(parseFloat(e.target.value) || 0) }))}
                    className={`w-full px-3 py-2 rounded-xl border font-mono font-black transition-all ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                        : 'bg-slate-950 border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`font-bold block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Coste / Compra ({currency})
                  </label>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={prodFormData.buyPrice}
                    onChange={(e) => setProdFormData(prev => ({ ...prev, buyPrice: roundCLP(parseFloat(e.target.value) || 0) }))}
                    className={`w-full px-3 py-2 rounded-xl border font-mono transition-all ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                        : 'bg-slate-950 border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`font-bold block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    IVA (%)
                  </label>
                  <select
                    value={prodFormData.iva}
                    onChange={(e) => setProdFormData(prev => ({ ...prev, iva: Number(e.target.value) }))}
                    className={`w-full px-3 py-2 rounded-xl border font-mono font-bold transition-all ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                        : 'bg-slate-950 border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                    }`}
                  >
                    <option value={19}>19% (IVA General Chile)</option>
                    <option value={0}>0% (Exento)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={`font-bold block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Stock Disponible (uds)
                  </label>
                  <input
                    type="number"
                    value={prodFormData.stock}
                    onChange={(e) => setProdFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2 rounded-xl border font-mono font-bold transition-all ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                        : 'bg-slate-950 border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`font-bold block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Orden de Cocina (Bloque KDS)
                  </label>
                  <select
                    value={prodFormData.kitchenBlock}
                    onChange={(e) => setProdFormData(prev => ({ ...prev, kitchenBlock: Number(e.target.value) }))}
                    className={`w-full px-3 py-2 rounded-xl border font-bold transition-all ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                        : 'bg-slate-950 border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                    }`}
                  >
                    <option value={1}>1º Bloque: Entrantes & Bebidas</option>
                    <option value={2}>2º Bloque: Platos Fuertes</option>
                    <option value={3}>3º Bloque: Postres & Cafés</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className={`font-bold block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  URL Imagen de Producto
                </label>
                <input
                  type="url"
                  value={prodFormData.image}
                  onChange={(e) => setProdFormData(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  className={`w-full px-3 py-2 rounded-xl border transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                      : 'bg-slate-950 border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                  }`}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md cursor-pointer"
                >
                  {editingProductId ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className={`px-4 py-3 rounded-xl font-bold border transition-all cursor-pointer ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QR CODE & CONNECTION ENLACE FOR STATIONS */}
      {qrModalStation && (() => {
        const stationUrl = typeof window !== 'undefined'
          ? (() => {
              try {
                const url = new URL(window.location.href);
                return `${url.origin}${url.pathname}?station=${qrModalStation}`;
              } catch {
                return `${window.location.origin}/?station=${qrModalStation}`;
              }
            })()
          : '';

        const handleCopyLink = () => {
          sound.playSuccess();
          if (stationUrl) {
            if (navigator.clipboard) {
              navigator.clipboard.writeText(stationUrl);
            }
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2500);
          }
        };

        const handleOpenTab = () => {
          sound.playTap();
          if (typeof window !== 'undefined' && stationUrl) {
            window.open(stationUrl, '_blank');
          }
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
            <div className={`border rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl transition-colors text-center ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="font-extrabold text-sm flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-blue-500" />
                  {qrModalStation === 'waiter-mobile' ? '📱 Acceso Garzón (Celular)' : '👨‍🍳 Acceso Pantalla Cocina'}
                </span>
                <button
                  onClick={() => setQrModalStation(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  {qrModalStation === 'waiter-mobile'
                    ? 'Abra la cámara del celular del garzón y apunte a este código QR para entrar directamente al comandero táctil optimizado.'
                    : 'Escanee este código con la tablet o monitor de cocina para activar el KDS de pedidos en vivo.'}
                </p>

                {/* Real QR SVG Display */}
                <div className="p-3 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center shadow-inner mx-auto w-fit">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(stationUrl)}&margin=6`}
                    alt="Código QR de Conexión TPV"
                    className="w-44 h-44 rounded-lg object-contain bg-white"
                  />
                  <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-500 mt-1.5">
                    <Wifi className="w-3 h-3 text-emerald-500" />
                    <span>Conexión Instantánea por Red Local / Web</span>
                  </div>
                </div>

                {/* URL Input Display */}
                <div className="w-full">
                  <input
                    type="text"
                    readOnly
                    value={stationUrl}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className={`w-full text-[11px] font-mono px-2.5 py-1.5 rounded-lg border text-center select-all truncate ${
                      isLight ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  />
                </div>

                {/* Direct Link Copier */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      copiedLink
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace Directo'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenTab}
                    title="Abrir en pestaña nueva"
                    className="py-2 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Probar</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    sound.playTap();
                    setStationMode(qrModalStation);
                    setActiveView(qrModalStation === 'waiter-mobile' ? 'floor' : 'kitchen');
                    setQrModalStation(null);
                  }}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-md cursor-pointer ${
                    qrModalStation === 'waiter-mobile'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-amber-600 hover:bg-amber-500'
                  }`}
                >
                  {qrModalStation === 'waiter-mobile' ? 'Activar Comandero en esta Pantalla' : 'Activar Cocina en esta Pantalla'}
                </button>
                <button
                  type="button"
                  onClick={() => setQrModalStation(null)}
                  className={`w-full py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL: SIMPLE STEP-BY-STEP STATION GUIDE */}
      {isStationGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className={`border rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl transition-colors max-h-[90vh] overflow-y-auto ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  💡
                </div>
                <h3 className="font-extrabold text-sm">
                  Guía Fácil: ¿Cómo conectar tu restaurante?
                </h3>
              </div>
              <button
                onClick={() => setIsStationGuideOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className={`p-3.5 rounded-2xl border ${
                isLight ? 'bg-blue-50/70 border-blue-200' : 'bg-blue-950/40 border-blue-900'
              }`}>
                <div className="font-black text-blue-700 dark:text-blue-300 text-sm flex items-center gap-2">
                  <span>1. 🖥️ Computadora de Caja Principal</span>
                </div>
                <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                  Es la pantalla de la barra donde estás ahora. Permite cobrar, emitir tickets fiscales, hacer arqueos Z y administrar el inventario.
                </p>
              </div>

              <div className={`p-3.5 rounded-2xl border ${
                isLight ? 'bg-emerald-50/70 border-emerald-200' : 'bg-emerald-950/40 border-emerald-900'
              }`}>
                <div className="font-black text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
                  <span>2. 📱 Celulares de los Garzones (Camareros)</span>
                </div>
                <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                  1. Conecte el teléfono al <strong>Wi-Fi del restaurante</strong>.<br/>
                  2. Toque el botón <strong>"QR"</strong> en la tarjeta verde de arriba y escanee con la cámara del celular.<br/>
                  3. El garzón ingresa su PIN personal de 4 dígitos y podrá tomar comandas en las mesas al instante.
                </p>
              </div>

              <div className={`p-3.5 rounded-2xl border ${
                isLight ? 'bg-amber-50/70 border-amber-200' : 'bg-amber-950/40 border-amber-900'
              }`}>
                <div className="font-black text-amber-700 dark:text-amber-300 text-sm flex items-center gap-2">
                  <span>3. 🍳 Pantalla o Tablet de Cocina (KDS)</span>
                </div>
                <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                  1. En la tablet de cocina, abra el navegador o escanee el <strong>QR de Cocina</strong>.<br/>
                  2. La pantalla quedará fija mostrando los pedidos en tiempo real con sonido de campana y aviso por bloques (1ºs, 2ºs y postres).
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsStationGuideOpen(false)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Entendido, ¡gracias!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
