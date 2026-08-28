import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import {
  ShieldCheck, Users, UtensilsCrossed, Settings, Plus, Edit2, Trash2,
  Check, X, DollarSign, Image, Package, Layers, KeyRound, Smartphone,
  Monitor, ChefHat, Save, AlertTriangle, Sparkles, Filter, Search,
  Sliders, Shield, Lock, Eye, ShoppingCart, Percent, Hash, Building, Database
} from 'lucide-react';
import { Waiter, Category, Product, UserRole, UserPermissions } from '../types';
import { sound } from '../utils/sound';
import { DEFAULT_ADMIN_PERMISSIONS, DEFAULT_CASHIER_PERMISSIONS, DEFAULT_WAITER_PERMISSIONS, DEFAULT_KITCHEN_PERMISSIONS } from '../data/mockData';
import { DatabaseManager } from './DatabaseManager';

export const AdminPanel: React.FC = () => {
  const {
    waiters,
    addWaiter,
    updateWaiter,
    deleteWaiter,
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
    waiter: currentAuthUser
  } = usePOS();

  const isLight = themeMode === 'vibrant-light';
  const [activeTab, setActiveTab] = useState<'users' | 'catalog' | 'settings' | 'database'>('users');

  // Check if current user has admin permissions
  const isAdmin = currentAuthUser.role === 'admin' || currentAuthUser.permissions?.canManageUsers;

  // USER MODAL STATE
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [userFormData, setUserFormData] = useState<{
    name: string;
    pin: string;
    role: UserRole;
    email: string;
    phone: string;
    avatar: string;
    permissions: UserPermissions;
  }>({
    name: '',
    pin: '1234',
    role: 'waiter',
    email: '',
    phone: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    permissions: { ...DEFAULT_WAITER_PERMISSIONS },
  });

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
    price: 12.00,
    buyPrice: 4.50,
    iva: 10,
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

  // USER ACTIONS
  const handleOpenNewUser = () => {
    setEditingUserId(null);
    setUserFormData({
      name: '',
      pin: '1234',
      role: 'waiter',
      email: '',
      phone: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      permissions: { ...DEFAULT_WAITER_PERMISSIONS },
    });
    setIsUserModalOpen(true);
  };

  const handleEditUser = (u: Waiter) => {
    setEditingUserId(u.id);
    setUserFormData({
      name: u.name,
      pin: u.pin,
      role: u.role,
      email: u.email || '',
      phone: u.phone || '',
      avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      permissions: u.permissions || (
        u.role === 'admin' ? DEFAULT_ADMIN_PERMISSIONS :
        u.role === 'cashier' ? DEFAULT_CASHIER_PERMISSIONS :
        u.role === 'kitchen' ? DEFAULT_KITCHEN_PERMISSIONS : DEFAULT_WAITER_PERMISSIONS
      ),
    });
    setIsUserModalOpen(true);
  };

  const handleUserRoleChange = (newRole: UserRole) => {
    const defaultPerms = newRole === 'admin'
      ? DEFAULT_ADMIN_PERMISSIONS
      : newRole === 'cashier'
      ? DEFAULT_CASHIER_PERMISSIONS
      : newRole === 'kitchen'
      ? DEFAULT_KITCHEN_PERMISSIONS
      : DEFAULT_WAITER_PERMISSIONS;

    setUserFormData(prev => ({
      ...prev,
      role: newRole,
      permissions: { ...defaultPerms },
    }));
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.name.trim() || !userFormData.pin) return;

    sound.playTap();
    if (editingUserId) {
      updateWaiter(editingUserId, userFormData);
    } else {
      addWaiter(userFormData);
    }
    setIsUserModalOpen(false);
  };

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
      price: 12.00,
      buyPrice: 4.50,
      iva: 10,
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
      price: prod.price,
      buyPrice: prod.buyPrice || 0,
      iva: prod.iva || 10,
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
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
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
            Gestión centralizada de usuarios, roles, privilegios de caja, catálogo de productos y terminales.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className={`flex items-center gap-1.5 p-1 rounded-2xl border self-start sm:self-auto ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
        }`}>
          <button
            onClick={() => { sound.playTap(); setActiveTab('users'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Usuarios & Privilegios ({waiters.length})</span>
          </button>
          <button
            onClick={() => { sound.playTap(); setActiveTab('catalog'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'catalog'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Catálogo & Categorías</span>
          </button>
          <button
            onClick={() => { sound.playTap(); setActiveTab('database'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'database'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>Base de Datos (Data Studio)</span>
          </button>
          <button
            onClick={() => { sound.playTap(); setActiveTab('settings'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Configuración TPV & Red</span>
          </button>
        </div>
      </div>

      {/* TAB 1: GESTIÓN DE USUARIOS Y PRIVILEGIOS */}
      {activeTab === 'users' && (
        <div className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black flex items-center gap-2">
                <span>Personal del Restaurante y Permisos de Acceso</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure los roles de Cajeras, Administradores, Garzones y Cocina con su PIN y privilegios.
              </p>
            </div>

            <button
              onClick={handleOpenNewUser}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Usuario</span>
            </button>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {waiters.map(u => {
              const perms = u.permissions || (
                u.role === 'admin' ? DEFAULT_ADMIN_PERMISSIONS :
                u.role === 'cashier' ? DEFAULT_CASHIER_PERMISSIONS :
                u.role === 'kitchen' ? DEFAULT_KITCHEN_PERMISSIONS : DEFAULT_WAITER_PERMISSIONS
              );

              return (
                <div
                  key={u.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isLight ? 'bg-white border-slate-200 shadow-sm hover:shadow-md' : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={u.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-500/40 shadow-sm"
                        />
                        <div>
                          <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{u.name}</span>
                          </div>
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider mt-0.5 ${
                            u.role === 'admin'
                              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                              : u.role === 'cashier'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : u.role === 'kitchen'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                          }`}>
                            {u.role === 'admin' ? '🛡️ Administrador / Gerente' :
                             u.role === 'cashier' ? '💰 Cajera Principal' :
                             u.role === 'kitchen' ? '🍳 Cocina / Chef KDS' : '📱 Garzón / Camarero'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono text-xs">
                        <span className="text-[10px] text-slate-400 block">PIN</span>
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 font-black">
                          {u.pin}
                        </span>
                      </div>
                    </div>

                    {/* Permissions Mini Matrix */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1.5">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Privilegios asignados:</div>
                      <div className="grid grid-cols-2 gap-1 text-[10px]">
                        <div className={`flex items-center gap-1 ${perms.canOpenCloseCash ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 opacity-60'}`}>
                          {perms.canOpenCloseCash ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3" />}
                          <span>Abrir/Cerrar Caja Z</span>
                        </div>
                        <div className={`flex items-center gap-1 ${perms.canCashMovements ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 opacity-60'}`}>
                          {perms.canCashMovements ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3" />}
                          <span>Entradas/Salidas Caja</span>
                        </div>
                        <div className={`flex items-center gap-1 ${perms.canCancelSales ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 opacity-60'}`}>
                          {perms.canCancelSales ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3" />}
                          <span>Anular Ventas</span>
                        </div>
                        <div className={`flex items-center gap-1 ${perms.canApplyDiscounts ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 opacity-60'}`}>
                          {perms.canApplyDiscounts ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3" />}
                          <span>Aplicar Descuentos</span>
                        </div>
                        <div className={`flex items-center gap-1 ${perms.canEditCatalog ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 opacity-60'}`}>
                          {perms.canEditCatalog ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3" />}
                          <span>Modificar Catálogo</span>
                        </div>
                        <div className={`flex items-center gap-1 ${perms.canViewFinancialReports ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 opacity-60'}`}>
                          {perms.canViewFinancialReports ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3" />}
                          <span>Informes Financieros</span>
                        </div>
                        <div className={`flex items-center gap-1 ${perms.canTransferTables ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 opacity-60'}`}>
                          {perms.canTransferTables ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3" />}
                          <span>Traspasar Mesas</span>
                        </div>
                        <div className={`flex items-center gap-1 ${perms.canManageUsers ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 opacity-60'}`}>
                          {perms.canManageUsers ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3" />}
                          <span>Administrar Usuarios</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => { sound.playTap(); handleEditUser(u); }}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                    {waiters.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar al usuario ${u.name}?`)) {
                            sound.playTap();
                            deleteWaiter(u.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/60 text-slate-400 transition-all"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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
                      isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
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
                        <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                          {count} platos
                        </span>
                      </div>
                      <div className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                        {cat.name}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
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
                          className="text-slate-400 hover:text-rose-500"
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
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-500" />
                  <span>Productos y Precios</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
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
                  className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800 text-white'
                  }`}
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSelectedCatalogCategory('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCatalogCategory === 'all'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
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
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
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
                      isLight ? 'bg-white border-slate-200 shadow-sm hover:shadow-md' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] text-slate-400 block font-medium truncate">
                            {cat?.name || 'General'}
                          </span>
                          <h3 className="font-black text-xs text-slate-900 dark:text-white line-clamp-1">
                            {prod.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1 font-mono">
                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                              {prod.price.toFixed(2)} {currency}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              (IVA {prod.iva}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stock & Kitchen Status */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-[11px]">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">Stock:</span>
                          <strong className={`font-mono ${prod.stock <= prod.minStock ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>
                            {prod.stock} uds
                          </strong>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          prod.available
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        }`}>
                          {prod.available ? 'En Carta' : 'Agotado'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => handleEditProduct(prod)}
                        className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1"
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
          <div className={`p-5 rounded-3xl border shadow-sm space-y-3 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <Monitor className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Modo de Estación y Sincronización en Red Local
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Simule cómo interactúan la computadora principal (Caja Master) y los dispositivos móviles de los garzones.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => { sound.playTap(); setStationMode('master-pc'); }}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  stationMode === 'master-pc'
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 ring-2 ring-blue-400/40 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  {stationMode === 'master-pc' && <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">Activo</span>}
                </div>
                <div className="font-black text-xs text-slate-900 dark:text-white">🖥️ PC Servidor Central / Caja</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Apertura/cierre de turnos, arqueos Z, cobro en barra y control total de la base de datos.
                </div>
              </button>

              <button
                onClick={() => { sound.playTap(); setStationMode('waiter-mobile'); }}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  stationMode === 'waiter-mobile'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 ring-2 ring-emerald-400/40 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  {stationMode === 'waiter-mobile' && <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">Activo</span>}
                </div>
                <div className="font-black text-xs text-slate-900 dark:text-white">📱 Comandero Garzón (Móvil/Tablet)</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Toma de comandas en mesa, envío instantáneo a cocina y consulta del estado de mesas.
                </div>
              </button>

              <button
                onClick={() => { sound.playTap(); setStationMode('kitchen-kds'); }}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  stationMode === 'kitchen-kds'
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 ring-2 ring-amber-400/40 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <ChefHat className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  {stationMode === 'kitchen-kds' && <span className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded-full font-bold">Activo</span>}
                </div>
                <div className="font-black text-xs text-slate-900 dark:text-white">🍳 Pantalla de Cocina (KDS)</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Recepción de comandas agrupadas por orden de marcha y tiempos de pase.
                </div>
              </button>
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
            className={`p-5 rounded-3xl border shadow-sm space-y-4 ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Building className="w-4 h-4 text-blue-500" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Datos Fiscales y Parámetros del Restaurante
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-500 dark:text-slate-400">Nombre Comercial</label>
                <input
                  type="text"
                  value={brandFormData.name}
                  onChange={(e) => setBrandFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500 dark:text-slate-400">Eslogan / Tipo de Cocina</label>
                <input
                  type="text"
                  value={brandFormData.tagline}
                  onChange={(e) => setBrandFormData(prev => ({ ...prev, tagline: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500 dark:text-slate-400">NIF / CIF / RUT</label>
                <input
                  type="text"
                  value={brandFormData.cif}
                  onChange={(e) => setBrandFormData(prev => ({ ...prev, cif: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500 dark:text-slate-400">Símbolo de Moneda</label>
                <select
                  value={brandFormData.currency}
                  onChange={(e) => setBrandFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                >
                  <option value="€">Euro (€)</option>
                  <option value="$">Dólar ($ / USD)</option>
                  <option value="S/">Sol Peruano (S/)</option>
                  <option value="MXN$">Peso Mexicano (MXN$)</option>
                  <option value="COP$">Peso Colombiano (COP$)</option>
                  <option value="CLP$">Peso Chileno (CLP$)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500 dark:text-slate-400">Dirección</label>
                <input
                  type="text"
                  value={brandFormData.address}
                  onChange={(e) => setBrandFormData(prev => ({ ...prev, address: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500 dark:text-slate-400">Teléfono</label>
                <input
                  type="text"
                  value={brandFormData.phone}
                  onChange={(e) => setBrandFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-500 dark:text-slate-400">Mensaje Pie de Ticket</label>
              <input
                type="text"
                value={brandFormData.ticketFooter}
                onChange={(e) => setBrandFormData(prev => ({ ...prev, ticketFooter: e.target.value }))}
                className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all active:scale-95"
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

      {/* USER MODAL */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 select-none overflow-y-auto">
          <div className={`border rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl transition-colors my-auto ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span>{editingUserId ? 'Editar Usuario / Empleado' : 'Crear Nuevo Usuario'}</span>
              </h3>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Nombre Completo</label>
                  <input
                    type="text"
                    value={userFormData.name}
                    onChange={(e) => setUserFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: VALENTINA (Cajera)"
                    required
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500">PIN de Acceso (4 dígitos)</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={userFormData.pin}
                    onChange={(e) => setUserFormData(prev => ({ ...prev, pin: e.target.value }))}
                    placeholder="1234"
                    required
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold tracking-widest text-center ${
                      isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Rol del Empleado</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'cashier', label: 'Cajera', icon: '💰' },
                    { id: 'admin', label: 'Admin/Gerente', icon: '🛡️' },
                    { id: 'waiter', label: 'Garzón', icon: '📱' },
                    { id: 'kitchen', label: 'Cocina', icon: '🍳' },
                  ].map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleUserRoleChange(r.id as UserRole)}
                      className={`p-2 rounded-xl border text-center font-bold transition-all ${
                        userFormData.role === r.id
                          ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                          : isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-700'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="text-sm">{r.icon}</div>
                      <div className="text-[11px] mt-0.5">{r.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Granular Permissions Config */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 block">
                  Matriz de Privilegios Personalizados
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userFormData.permissions.canOpenCloseCash}
                      onChange={(e) => setUserFormData(prev => ({
                        ...prev,
                        permissions: { ...prev.permissions, canOpenCloseCash: e.target.checked }
                      }))}
                      className="rounded text-blue-600 w-4 h-4"
                    />
                    <span>Abrir y Cerrar Caja (Z)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userFormData.permissions.canCashMovements}
                      onChange={(e) => setUserFormData(prev => ({
                        ...prev,
                        permissions: { ...prev.permissions, canCashMovements: e.target.checked }
                      }))}
                      className="rounded text-blue-600 w-4 h-4"
                    />
                    <span>Entradas/Salidas de Caja</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userFormData.permissions.canCancelSales}
                      onChange={(e) => setUserFormData(prev => ({
                        ...prev,
                        permissions: { ...prev.permissions, canCancelSales: e.target.checked }
                      }))}
                      className="rounded text-blue-600 w-4 h-4"
                    />
                    <span>Anular Ventas / Platos</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userFormData.permissions.canApplyDiscounts}
                      onChange={(e) => setUserFormData(prev => ({
                        ...prev,
                        permissions: { ...prev.permissions, canApplyDiscounts: e.target.checked }
                      }))}
                      className="rounded text-blue-600 w-4 h-4"
                    />
                    <span>Aplicar Descuentos</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userFormData.permissions.canEditCatalog}
                      onChange={(e) => setUserFormData(prev => ({
                        ...prev,
                        permissions: { ...prev.permissions, canEditCatalog: e.target.checked }
                      }))}
                      className="rounded text-blue-600 w-4 h-4"
                    />
                    <span>Editar Catálogo y Precios</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userFormData.permissions.canViewFinancialReports}
                      onChange={(e) => setUserFormData(prev => ({
                        ...prev,
                        permissions: { ...prev.permissions, canViewFinancialReports: e.target.checked }
                      }))}
                      className="rounded text-blue-600 w-4 h-4"
                    />
                    <span>Ver Informes Financieros</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userFormData.permissions.canTransferTables}
                      onChange={(e) => setUserFormData(prev => ({
                        ...prev,
                        permissions: { ...prev.permissions, canTransferTables: e.target.checked }
                      }))}
                      className="rounded text-blue-600 w-4 h-4"
                    />
                    <span>Traspasar Mesas</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userFormData.permissions.canManageUsers}
                      onChange={(e) => setUserFormData(prev => ({
                        ...prev,
                        permissions: { ...prev.permissions, canManageUsers: e.target.checked }
                      }))}
                      className="rounded text-blue-600 w-4 h-4"
                    />
                    <span>Administrar Usuarios</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/30"
                >
                  {editingUserId ? 'Actualizar Usuario' : 'Guardar Usuario'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 select-none">
          <div className={`border rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl transition-colors ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-base">
                {editingCategoryId ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Nombre de Categoría</label>
                <input
                  type="text"
                  value={catFormData.name}
                  onChange={(e) => setCatFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Entrantes & Tapas Gourmet"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-bold ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500">URL Imagen de Portada</label>
                <input
                  type="url"
                  value={catFormData.image}
                  onChange={(e) => setCatFormData(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md"
                >
                  {editingCategoryId ? 'Actualizar Categoría' : 'Crear Categoría'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
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
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-base">
                {editingProductId ? 'Editar Producto del Menú' : 'Nuevo Producto'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Nombre del Plato / Bebida</label>
                  <input
                    type="text"
                    value={prodFormData.name}
                    onChange={(e) => setProdFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Pulpo Braseado a la Gallega"
                    required
                    className={`w-full px-3 py-2 rounded-xl border font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Categoría</label>
                  <select
                    value={prodFormData.categoryId}
                    onChange={(e) => setProdFormData(prev => ({ ...prev, categoryId: Number(e.target.value) }))}
                    className={`w-full px-3 py-2 rounded-xl border font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700 text-white'
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
                  <label className="font-bold text-slate-500">PVP con IVA ({currency})</label>
                  <input
                    type="number"
                    step="0.05"
                    value={prodFormData.price}
                    onChange={(e) => setProdFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2 rounded-xl border font-mono font-black ${
                      isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Coste / Compra ({currency})</label>
                  <input
                    type="number"
                    step="0.05"
                    value={prodFormData.buyPrice}
                    onChange={(e) => setProdFormData(prev => ({ ...prev, buyPrice: parseFloat(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2 rounded-xl border font-mono ${
                      isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500">IVA (%)</label>
                  <select
                    value={prodFormData.iva}
                    onChange={(e) => setProdFormData(prev => ({ ...prev, iva: Number(e.target.value) }))}
                    className={`w-full px-3 py-2 rounded-xl border font-mono ${
                      isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  >
                    <option value={10}>10% (Hostelería)</option>
                    <option value={21}>21% (General / Alcohol)</option>
                    <option value={4}>4% (Superreducido)</option>
                    <option value={0}>0% (Exento)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Stock Disponible (uds)</label>
                  <input
                    type="number"
                    value={prodFormData.stock}
                    onChange={(e) => setProdFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2 rounded-xl border font-mono font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Orden de Cocina (Bloque KDS)</label>
                  <select
                    value={prodFormData.kitchenBlock}
                    onChange={(e) => setProdFormData(prev => ({ ...prev, kitchenBlock: Number(e.target.value) }))}
                    className={`w-full px-3 py-2 rounded-xl border ${
                      isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  >
                    <option value={1}>1º Bloque: Entrantes & Bebidas</option>
                    <option value={2}>2º Bloque: Platos Fuertes</option>
                    <option value={3}>3º Bloque: Postres & Cafés</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500">URL Imagen de Producto</label>
                <input
                  type="url"
                  value={prodFormData.image}
                  onChange={(e) => setProdFormData(prev => ({ ...prev, image: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-xl border ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md"
                >
                  {editingProductId ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
