import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Bell, Utensils, Star, Flame, Clock, Wifi, ChevronRight,
  Plus, Minus, Sparkles, Heart, Eye, Check, X, ShieldAlert,
  Soup, Fish, Wheat, Sandwich, CupSoda, Beer, Coffee, Cake, GlassWater,
  ShoppingBag, PhoneCall, HelpCircle, Receipt, ArrowLeft, Info,
  SlidersHorizontal, ChevronDown, CheckCircle2, QrCode, Layers, Compass
} from 'lucide-react';
import { Product, Category, Table, RestaurantBrand, Language } from '../../types';
import { getCategoryTheme } from '../../utils/theme';
import { getCategoryMeta } from '../../utils/categoryMeta';
import { sound } from '../../utils/sound';
import { AVAILABLE_LANGUAGES } from '../../utils/language';
import { CartItem } from './MobileOrderDrawer';

interface MobileCustomerViewProps {
  categories: Category[];
  products: Product[];
  tables: Table[];
  restaurantBrand: RestaurantBrand;
  selectedTable: string;
  onSelectTable: (tableNum: string) => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  cart: CartItem[];
  onAddToCart: (product: Product, quantity?: number, selectedOptions?: string[], notes?: string) => void;
  onUpdateCartQuantity: (index: number, newQty: number) => void;
  onOpenDetailModal: (product: Product) => void;
  onOpenCartDrawer: () => void;
  onOpenCallWaiter: () => void;
  currencySymbol?: string;
}

export const MobileCustomerView: React.FC<MobileCustomerViewProps> = ({
  categories,
  products,
  tables,
  restaurantBrand,
  selectedTable,
  onSelectTable,
  language,
  onSelectLanguage,
  cart,
  onAddToCart,
  onUpdateCartQuantity,
  onOpenDetailModal,
  onOpenCartDrawer,
  onOpenCallWaiter,
  currencySymbol = '$'
}) => {
  // Navigation State: null means "Category Directory View", number means "Inside that specific Category"
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedDietary, setSelectedDietary] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showWifiInfo, setShowWifiInfo] = useState<boolean>(false);
  const [showTableSelector, setShowTableSelector] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'directory' | 'specials' | 'favorites'>('directory');

  // Category Icon Resolver
  const getCategoryIcon = (iconName?: string) => {
    switch (iconName?.toLowerCase()) {
      case 'soup': return <Soup className="w-3.5 h-3.5" />;
      case 'fish': return <Fish className="w-3.5 h-3.5" />;
      case 'wheat': return <Wheat className="w-3.5 h-3.5" />;
      case 'flame': return <Flame className="w-3.5 h-3.5" />;
      case 'sandwich': return <Sandwich className="w-3.5 h-3.5" />;
      case 'cupsoda': return <CupSoda className="w-3.5 h-3.5" />;
      case 'beer': return <Beer className="w-3.5 h-3.5" />;
      case 'coffee': return <Coffee className="w-3.5 h-3.5" />;
      case 'cake': return <Cake className="w-3.5 h-3.5" />;
      case 'glasswater': return <GlassWater className="w-3.5 h-3.5" />;
      case 'shoppingbag': return <ShoppingBag className="w-3.5 h-3.5" />;
      case 'star':
      default:
        return <Star className="w-3.5 h-3.5" />;
    }
  };

  // Dietary Filters definition
  const dietaryFilters = [
    { id: 'all', label: 'Todo', icon: '🍽️' },
    { id: 'chef', label: 'Chef Top', icon: '⭐' },
    { id: 'gluten-free', label: 'Sin Gluten', icon: '🌾' },
    { id: 'veggie', label: 'Veggie', icon: '🌱' },
    { id: 'spicy', label: 'Picante', icon: '🌶️' },
    { id: 'drinks', label: 'Bebidas', icon: '🍹' },
  ];

  // Active Category Object
  const currentCategory = useMemo(() => {
    if (selectedCategoryId === null) return null;
    return categories.find(c => c.id === selectedCategoryId) || null;
  }, [categories, selectedCategoryId]);

  // Filtered Products Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // 1. Favorites view override
      if (activeTab === 'favorites') {
        if (!favorites.includes(p.id)) return false;
      }

      // 2. Specials view override
      if (activeTab === 'specials') {
        if (p.price < 12 && p.categoryId !== 100 && p.categoryId !== 1 && p.categoryId !== 2) return false;
      }

      // 3. Search Query filter (global or category-specific)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = (p.description || '').toLowerCase().includes(q);
        const matchesAllergens = (p.allergens || []).some(a => a.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesAllergens) return false;
      } else if (activeTab === 'directory' && selectedCategoryId !== null) {
        // Must match selected category if we are drilled down
        if (p.categoryId !== selectedCategoryId) return false;
      }

      // 4. Dietary Filter
      if (selectedDietary === 'gluten-free') {
        return !p.allergens || !p.allergens.includes('Gluten');
      }
      if (selectedDietary === 'veggie') {
        return !p.allergens?.includes('Pescado') && !p.allergens?.includes('Crustáceos') && !p.allergens?.includes('Moluscos');
      }
      if (selectedDietary === 'spicy') {
        return p.description && (
          p.description.toLowerCase().includes('brava') ||
          p.description.toLowerCase().includes('picante') ||
          p.description.toLowerCase().includes('chile') ||
          p.description.toLowerCase().includes('pimienta')
        );
      }
      if (selectedDietary === 'drinks') {
        return [6, 7, 8, 10, 102, 103, 104, 105, 106, 107, 108].includes(p.categoryId);
      }
      if (selectedDietary === 'chef') {
        return p.price > 10 || p.isKitchen;
      }

      return true;
    });
  }, [products, selectedCategoryId, selectedDietary, searchQuery, activeTab, favorites]);

  // Featured chef specials carousel
  const chefSpecials = useMemo(() => {
    return products.filter(p => p.image && (p.price > 12 || p.categoryId === 100 || p.categoryId === 1 || p.categoryId === 2)).slice(0, 5);
  }, [products]);

  // Helper to check if a product is in cart and its quantity
  const getProductCartCount = (productId: number) => {
    const item = cart.find(c => c.product.id === productId);
    return item ? item.quantity : 0;
  };

  const getProductCartIndex = (productId: number) => {
    return cart.findIndex(c => c.product.id === productId);
  };

  const toggleFavorite = (productId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playTap();
    setFavorites(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handleSelectCategory = (catId: number) => {
    sound.playTap();
    setSelectedCategoryId(catId);
    setSearchQuery('');
    setSelectedDietary('all');
  };

  const handleBackToCategories = () => {
    sound.playTap();
    setSelectedCategoryId(null);
    setSearchQuery('');
    setSelectedDietary('all');
  };

  const totalCartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalCartAmount = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-6 w-full">
      {/* Smartphone Device Frame (iPhone 16 Pro Style Titanium Chassis) */}
      <div className="relative w-full max-w-[410px] h-[830px] max-h-[92vh] bg-slate-950 rounded-[50px] border-[10px] border-slate-800 shadow-[0_25px_70px_rgba(0,0,0,0.65)] ring-1 ring-slate-700/80 flex flex-col overflow-hidden select-none">
        
        {/* Dynamic Island / Hardware Sensors Header */}
        <div className="h-8 bg-slate-950 flex items-center justify-between px-7 pt-1.5 shrink-0 z-40">
          <span className="text-[11px] font-semibold text-slate-300 font-mono tracking-tight">14:30</span>

          {/* Dynamic Island Capsule */}
          <div className="w-24 h-4.5 bg-black rounded-full flex items-center justify-between px-2.5 shadow-inner">
            <div className="w-2 h-2 rounded-full bg-slate-800/80" />
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500/80 animate-pulse" />
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <Wifi className="w-3 h-3" />
            <span className="text-[10px] font-bold">5G</span>
            <div className="w-4 h-2 rounded-sm border border-slate-400 p-[1px] flex items-center">
              <div className="h-full w-3/4 bg-emerald-400 rounded-2xs" />
            </div>
          </div>
        </div>

        {/* ================= SCROLLABLE MOBILE APP CONTENT ================= */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none bg-slate-950 text-slate-100 flex flex-col relative pb-20">

          {/* 1. Header Banner & Restaurant Branding */}
          <div className="relative h-40 shrink-0 overflow-hidden bg-slate-900">
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80"
              alt="Restaurant Ambience"
              className="w-full h-full object-cover opacity-50 scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-black/40" />

            {/* Top Utility Icons Overlay */}
            <div className="absolute top-3 left-4 right-4 flex items-center justify-between z-10">
              {/* Table Selector Pill */}
              <button
                type="button"
                onClick={() => { sound.playTap(); setShowTableSelector(!showTableSelector); }}
                className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-[11px] font-black flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform"
              >
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                <span>Mesa {selectedTable}</span>
                <ChevronDown className="w-3 h-3 text-slate-300" />
              </button>

              {/* Language & Wifi Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => { sound.playTap(); setShowWifiInfo(!showWifiInfo); }}
                  className="w-7 h-7 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center active:scale-95 transition-all"
                  title="WiFi del local"
                >
                  <Wifi className="w-3.5 h-3.5 text-teal-300" />
                </button>

                <div className="flex bg-black/70 backdrop-blur-md border border-white/20 rounded-full p-0.5">
                  {AVAILABLE_LANGUAGES.map(item => (
                    <button
                      key={item.code}
                      onClick={() => { sound.playTap(); onSelectLanguage(item.code); }}
                      className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase transition-all flex items-center gap-0.5 ${
                        language === item.code ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                      title={item.nativeName}
                    >
                      <span>{item.flag}</span>
                      <span>{item.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Restaurant Profile Content in Hero */}
            <div className="absolute bottom-2.5 left-4 right-4 flex items-end justify-between z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-teal-500/20 text-teal-300 border border-teal-400/30 uppercase tracking-wider">
                    {restaurantBrand.name}
                  </span>
                  <span className="flex items-center text-[10px] font-bold text-amber-300 bg-black/50 px-1.5 py-0.5 rounded-md">
                    <Star className="w-2.5 h-2.5 fill-amber-300 mr-0.5" /> 4.9
                  </span>
                </div>
                <h2 className="text-base font-black tracking-tight text-white drop-shadow leading-tight">
                  {selectedCategoryId !== null ? currentCategory?.name : 'Carta Gastronómica'}
                </h2>
                <p className="text-[10px] text-slate-300 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>Mesa {selectedTable} • Pedidos directos a cocina</span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Table Switcher Dropdown (Conditional) */}
          <AnimatePresence>
            {showTableSelector && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-slate-900 border-b border-slate-800 p-3 overflow-hidden"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-2">
                  <span>Seleccionar mesa para autoservicio:</span>
                  <button onClick={() => setShowTableSelector(false)}>
                    <X className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {tables.slice(0, 16).map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        sound.playTap();
                        onSelectTable(t.number);
                        setShowTableSelector(false);
                      }}
                      className={`p-1.5 rounded-xl text-[11px] font-bold border transition-all text-center ${
                        selectedTable === t.number
                          ? 'bg-teal-600 text-white border-teal-500 shadow-md'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Mesa {t.number}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* WiFi Info Banner (Conditional) */}
          <AnimatePresence>
            {showWifiInfo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-gradient-to-r from-teal-950/80 to-slate-900 border-b border-teal-700/40 p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                    <Wifi className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-[11px]">
                    <div className="font-bold text-white">WiFi Clientes: <span className="font-mono text-teal-300">Mistura_Guest</span></div>
                    <div className="text-slate-400">Clave: <span className="font-mono text-amber-300 font-bold">Mistura2026</span></div>
                  </div>
                </div>
                <button
                  onClick={() => setShowWifiInfo(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 2. Quick Action Service Chips Bar */}
          <div className="p-2.5 grid grid-cols-2 gap-2 bg-slate-950/80 border-b border-slate-800/80">
            {/* Call Waiter */}
            <button
              type="button"
              onClick={() => { sound.playTap(); onOpenCallWaiter(); }}
              className="p-2 rounded-2xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 hover:border-amber-500 text-amber-300 flex items-center gap-2 active:scale-95 transition-all"
            >
              <div className="w-6 h-6 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Bell className="w-3 h-3" />
              </div>
              <div className="text-left min-w-0">
                <h4 className="text-[10px] font-black leading-none truncate">Llamar Garzón</h4>
                <p className="text-[8px] text-amber-400/80 truncate mt-0.5">Asistencia en mesa</p>
              </div>
            </button>

            {/* Request Bill / Quick Total */}
            <button
              type="button"
              onClick={() => { sound.playTap(); onOpenCallWaiter(); }}
              className="p-2 rounded-2xl bg-gradient-to-r from-teal-500/15 to-cyan-500/15 border border-teal-500/30 hover:border-teal-500 text-teal-300 flex items-center gap-2 active:scale-95 transition-all"
            >
              <div className="w-6 h-6 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                <Receipt className="w-3 h-3" />
              </div>
              <div className="text-left min-w-0">
                <h4 className="text-[10px] font-black leading-none truncate">Pedir la Cuenta</h4>
                <p className="text-[8px] text-teal-400/80 truncate mt-0.5">Tarjeta / Efectivo</p>
              </div>
            </button>
          </div>

          {/* 3. Search Bar with Live Global Filter */}
          <div className="px-3 pt-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={selectedCategoryId !== null ? `Buscar en ${currentCategory?.name}...` : "Buscar plato, ceviche, carne, vino..."}
                className="w-full pl-9 pr-8 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* VIEW SWITCHER: LEVEL 1 (CATEGORY DIRECTORY) vs LEVEL 2 (CATEGORY DISHES) */}
          {/* ========================================================================= */}

          {/* If Search is active, show search results directly */}
          {searchQuery.trim() ? (
            <div className="p-3 space-y-3 flex-1">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 text-teal-400 font-black text-xs uppercase tracking-wider">
                  <Search className="w-3.5 h-3.5" />
                  <span>Resultados ({filteredProducts.length})</span>
                </div>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[10px] text-slate-400 hover:text-white font-bold"
                >
                  Limpiar búsqueda
                </button>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="p-8 text-center rounded-3xl bg-slate-900/60 border border-slate-800 my-4 space-y-2">
                  <Utensils className="w-8 h-8 text-slate-600 mx-auto" />
                  <h4 className="font-bold text-xs text-slate-300">No hay platos que coincidan</h4>
                  <p className="text-[10px] text-slate-500 max-w-[200px] mx-auto">
                    Prueba con otro término o explora las categorías.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredProducts.map(product => {
                    const inCartQty = getProductCartCount(product.id);
                    const cartIdx = getProductCartIndex(product.id);
                    const isFav = favorites.includes(product.id);
                    const catName = categories.find(c => c.id === product.categoryId)?.name || '';

                    return (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => onOpenDetailModal(product)}
                        className="group p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 shadow-md flex gap-2.5 items-stretch cursor-pointer relative overflow-hidden transition-all"
                      >
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-950 shrink-0">
                          <img
                            src={product.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop&q=80'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={(e) => toggleFavorite(product.id, e)}
                            className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white"
                          >
                            <Heart className={`w-2.5 h-2.5 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                          </button>
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[8px] font-black uppercase text-teal-400 truncate">
                                {catName}
                              </span>
                            </div>
                            <h4 className="font-bold text-xs text-white leading-snug line-clamp-1">
                              {product.name}
                            </h4>
                            <p className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">
                              {product.description || 'Especialidad culinaria de la casa.'}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-800/80">
                            <span className="text-xs font-black font-mono text-amber-400">
                              {currencySymbol} {product.price.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>

                            {inCartQty > 0 ? (
                              <div
                                onClick={e => e.stopPropagation()}
                                className="flex items-center rounded-xl bg-teal-950 border border-teal-600 p-0.5"
                              >
                                <button
                                  type="button"
                                  onClick={() => onUpdateCartQuantity(cartIdx, inCartQty - 1)}
                                  className="w-5 h-5 flex items-center justify-center text-teal-300 hover:bg-teal-800 rounded"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-5 text-center text-[10px] font-mono font-bold text-teal-200">
                                  {inCartQty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onUpdateCartQuantity(cartIdx, inCartQty + 1)}
                                  className="w-5 h-5 flex items-center justify-center text-teal-300 hover:bg-teal-800 rounded"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddToCart(product, 1);
                                }}
                                className="px-2.5 py-1 rounded-xl bg-teal-600 text-white font-bold text-[10px] flex items-center gap-1 shadow-md active:scale-95"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Pedir</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : selectedCategoryId === null ? (
            /* ========================================================================= */
            /* LEVEL 1: CATEGORY DIRECTORY (CARDS SHOWCASE WITH HIGH-IMPACT VISUALS)      */
            /* ========================================================================= */
            <div className="space-y-4 pt-2">
              {/* Top Chef Suggestions Carousel */}
              {chefSpecials.length > 0 && activeTab === 'directory' && (
                <div className="space-y-2">
                  <div className="px-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <h3 className="text-xs font-black text-white uppercase tracking-wider">
                        Sugerencias del Chef
                      </h3>
                    </div>
                    <span className="text-[10px] text-slate-400">Favoritos de la casa</span>
                  </div>

                  {/* Horizontal Scroll Cards */}
                  <div className="flex items-stretch gap-2.5 overflow-x-auto px-3.5 pb-1 scrollbar-none snap-x">
                    {chefSpecials.map(spec => (
                      <motion.div
                        key={spec.id}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onOpenDetailModal(spec)}
                        className="w-40 shrink-0 snap-start rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 overflow-hidden shadow-lg flex flex-col justify-between cursor-pointer hover:border-amber-500/40 transition-all"
                      >
                        <div className="relative h-20 bg-slate-950 overflow-hidden">
                          <img
                            src={spec.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop&q=80'}
                            alt={spec.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/20" />
                          <button
                            type="button"
                            onClick={(e) => toggleFavorite(spec.id, e)}
                            className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white"
                          >
                            <Heart className={`w-2.5 h-2.5 ${favorites.includes(spec.id) ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                          </button>
                          <span className="absolute bottom-1 left-1.5 px-1 py-0.2 rounded text-[7px] font-black uppercase bg-amber-500 text-slate-950">
                            ⭐ Top
                          </span>
                        </div>

                        <div className="p-2 flex-1 flex flex-col justify-between">
                          <h4 className="font-bold text-[10px] text-white line-clamp-1">{spec.name}</h4>
                          <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-800/80">
                            <span className="text-[11px] font-black font-mono text-amber-400">
                              {currencySymbol} {spec.price.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart(spec, 1);
                              }}
                              className="w-5 h-5 rounded-md bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center shadow-md"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Directory Title & View Tabs */}
              <div className="px-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-teal-400" />
                    <h3 className="font-black text-xs text-white uppercase tracking-wider">
                      Categorías de la Carta
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full text-teal-300">
                    {categories.length} Secciones
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">
                  Toca cualquier tarjeta para ingresar y explorar los platos, ingredientes y recetas.
                </p>
              </div>

              {/* Category Cards Animated Grid (2 Columns) */}
              <div className="px-3.5 grid grid-cols-2 gap-2.5">
                {categories.map((cat, idx) => {
                  const theme = getCategoryTheme(cat.id);
                  const meta = getCategoryMeta(cat.id, cat.name);
                  const catProducts = products.filter(p => p.categoryId === cat.id);
                  const dishCount = catProducts.length;
                  const lowestPrice = catProducts.length > 0 ? Math.min(...catProducts.map(p => p.price)) : 0;

                  return (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.2 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleSelectCategory(cat.id)}
                      className="group relative rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-teal-500/60 overflow-hidden shadow-lg cursor-pointer flex flex-col justify-between h-44 transition-all"
                    >
                      {/* Cover Photo with Cinematic Gradient */}
                      <div className="relative h-24 overflow-hidden bg-slate-950">
                        <img
                          src={meta.coverImage || cat.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80'}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 opacity-90"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                        {/* Top Category Badge */}
                        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                          <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase text-white shadow-md bg-gradient-to-r ${theme.gradient}`}>
                            {meta.badgeText || 'Carta'}
                          </span>
                          <span className="w-5 h-5 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center text-white text-[10px]">
                            {getCategoryIcon(cat.icon)}
                          </span>
                        </div>

                        {/* Dish Counter Floating Pill */}
                        <div className="absolute bottom-1.5 left-2">
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-black font-mono bg-black/80 backdrop-blur-md text-teal-300 border border-teal-500/30">
                            {dishCount} platos
                          </span>
                        </div>
                      </div>

                      {/* Card Content Body */}
                      <div className="p-2.5 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-black text-[11px] text-white group-hover:text-teal-400 transition-colors leading-tight line-clamp-1">
                            {cat.name}
                          </h4>
                          <p className="text-[8px] text-slate-400 line-clamp-1 mt-0.5 leading-snug">
                            {meta.subtitle}
                          </p>
                        </div>

                        {/* Card Bottom CTA Link */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-teal-400 text-[9px] font-bold">
                          {lowestPrice > 0 ? (
                            <span className="text-slate-400 font-mono text-[8px]">
                              Desde <b className="text-amber-400 font-bold">{currencySymbol}{lowestPrice.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</b>
                            </span>
                          ) : (
                            <span>Explorar</span>
                          )}
                          <div className="flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            <span>Ver</span>
                            <ChevronRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* LEVEL 2: DRILL-DOWN CATEGORY PRODUCTS VIEW                                 */
            /* ========================================================================= */
            <div className="space-y-3 pt-2">
              {/* Back to Directory Button & Breadcrumbs */}
              <div className="px-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBackToCategories}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-teal-300 font-black text-[11px] flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>← Todas las Categorías</span>
                </button>

                <span className="text-[10px] font-mono text-slate-400 font-bold">
                  {filteredProducts.length} platos
                </span>
              </div>

              {/* Category Hero Showcase Banner */}
              {currentCategory && (
                <div className="px-3">
                  <div className="relative rounded-2xl overflow-hidden p-3.5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-md">
                    <img
                      src={getCategoryMeta(currentCategory.id, currentCategory.name).coverImage}
                      alt={currentCategory.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-25"
                      referrerPolicy="no-referrer"
                    />
                    <div className="relative z-10 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <div className={`p-1 rounded-md bg-gradient-to-r ${getCategoryTheme(currentCategory.id).gradient} text-white`}>
                          {getCategoryIcon(currentCategory.icon)}
                        </div>
                        <span className="text-[9px] font-black uppercase text-teal-300 tracking-wider">
                          Categoría Seleccionada
                        </span>
                      </div>
                      <h3 className="text-base font-black text-white leading-tight">
                        {currentCategory.name}
                      </h3>
                      <p className="text-[10px] text-slate-300 leading-relaxed max-w-xs">
                        {getCategoryMeta(currentCategory.id, currentCategory.name).subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Category Switcher Slider */}
              <div className="flex items-center gap-1.5 overflow-x-auto px-3 pb-1 scrollbar-none">
                {categories.map(cat => {
                  const isSelected = selectedCategoryId === cat.id;
                  const theme = getCategoryTheme(cat.id);

                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-black whitespace-nowrap transition-all flex items-center gap-1 shrink-0 border ${
                        isSelected
                          ? `bg-gradient-to-r ${theme.gradient} text-white border-white/30 shadow-md`
                          : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                      }`}
                    >
                      <span>{getCategoryIcon(cat.icon)}</span>
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dietary Filter Pills for this category */}
              <div className="flex items-center gap-1 overflow-x-auto px-3 scrollbar-none">
                {dietaryFilters.map(df => {
                  const isSelected = selectedDietary === df.id;
                  return (
                    <button
                      key={df.id}
                      onClick={() => { sound.playTap(); setSelectedDietary(df.id); }}
                      className={`px-2 py-0.5 rounded-lg text-[9px] font-bold whitespace-nowrap transition-all flex items-center gap-1 border ${
                        isSelected
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-xs'
                          : 'bg-slate-900/60 text-slate-500 border-slate-800/80 hover:text-slate-300'
                      }`}
                    >
                      <span>{df.icon}</span>
                      <span>{df.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Product List Cards inside Category */}
              <div className="p-3 space-y-2.5">
                {filteredProducts.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <Utensils className="w-7 h-7 text-slate-600 mx-auto" />
                    <h4 className="font-bold text-xs text-slate-300">No hay platos con este filtro</h4>
                    <p className="text-[9px] text-slate-500 max-w-[180px] mx-auto">
                      Prueba restableciendo los filtros dietéticos.
                    </p>
                    <button
                      onClick={() => setSelectedDietary('all')}
                      className="px-2.5 py-1 rounded-lg bg-teal-600 text-white font-bold text-[9px]"
                    >
                      Mostrar Todos los Platos
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredProducts.map(product => {
                      const inCartQty = getProductCartCount(product.id);
                      const cartIdx = getProductCartIndex(product.id);
                      const isFav = favorites.includes(product.id);

                      return (
                        <motion.div
                          key={product.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.15 }}
                          onClick={() => onOpenDetailModal(product)}
                          className="group p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 shadow-md flex gap-3 items-stretch cursor-pointer relative overflow-hidden transition-all active:scale-[0.99]"
                        >
                          {/* Dish Photo */}
                          <div className="relative w-22 h-22 rounded-xl overflow-hidden bg-slate-950 shrink-0">
                            <img
                              src={product.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop&q=80'}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            <button
                              type="button"
                              onClick={(e) => toggleFavorite(product.id, e)}
                              className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white"
                            >
                              <Heart className={`w-2.5 h-2.5 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                            </button>
                          </div>

                          {/* Dish Information */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <h4 className="font-black text-xs text-white group-hover:text-teal-400 transition-colors leading-snug line-clamp-1">
                                {product.name}
                              </h4>
                              <p className="text-[9px] text-slate-400 line-clamp-2 leading-relaxed mt-0.5">
                                {product.description || 'Plato elaborado al momento con ingredientes frescos de primera calidad.'}
                              </p>

                              {/* Allergens tags */}
                              {product.allergens && product.allergens.length > 0 && (
                                <div className="flex items-center gap-1 mt-1 flex-wrap">
                                  {product.allergens.slice(0, 2).map((a, i) => (
                                    <span key={i} className="px-1.5 py-0.2 rounded text-[7px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800/40">
                                      {a}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Bottom Row: Price & Add / Quantity Stepper */}
                            <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-800/60">
                              <span className="text-xs font-black font-mono text-amber-400">
                                {currencySymbol} {product.price.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>

                              {inCartQty > 0 ? (
                                <div
                                  onClick={e => e.stopPropagation()}
                                  className="flex items-center rounded-xl bg-teal-950 border border-teal-600 p-0.5"
                                >
                                  <button
                                    type="button"
                                    onClick={() => onUpdateCartQuantity(cartIdx, inCartQty - 1)}
                                    className="w-5 h-5 flex items-center justify-center text-teal-300 hover:bg-teal-800 rounded"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-5 text-center text-[10px] font-mono font-bold text-teal-200">
                                    {inCartQty}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => onUpdateCartQuantity(cartIdx, inCartQty + 1)}
                                    className="w-5 h-5 flex items-center justify-center text-teal-300 hover:bg-teal-800 rounded"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAddToCart(product, 1);
                                  }}
                                  className="px-2.5 py-1 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-md shadow-teal-600/30 active:scale-95 transition-all"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Pedir</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ================= 7. FLOATING ORDER BAR & BOTTOM APP BAR ================= */}
        <div className="absolute bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 p-2.5 space-y-1.5">
          {/* Active Cart Floating Action Button (If cart has items) */}
          {totalCartCount > 0 && (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { sound.playTap(); onOpenCartDrawer(); }}
              className="w-full py-2 px-3.5 rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 text-white font-black text-xs shadow-xl shadow-teal-600/30 flex items-center justify-between border border-teal-400/30"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-mono">
                  {totalCartCount}
                </div>
                <span>Enviar Comanda</span>
              </div>
              <span className="font-mono bg-black/25 px-2 py-0.5 rounded-lg text-amber-300">
                {currencySymbol} {totalCartAmount.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </motion.button>
          )}

          {/* Quick Bottom Navigation Icons */}
          <div className="flex items-center justify-around text-slate-400 pt-0.5">
            <button
              onClick={() => { sound.playTap(); setSelectedCategoryId(null); setSearchQuery(''); }}
              className={`flex flex-col items-center gap-0.5 text-[9px] font-bold ${
                selectedCategoryId === null && !searchQuery ? 'text-teal-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Categorías</span>
            </button>

            <button
              onClick={() => { sound.playTap(); onOpenCallWaiter(); }}
              className="flex flex-col items-center gap-0.5 text-[9px] font-bold text-amber-400 hover:text-amber-300"
            >
              <Bell className="w-4 h-4" />
              <span>Garzón</span>
            </button>

            <button
              onClick={() => { sound.playTap(); onOpenCartDrawer(); }}
              className="flex flex-col items-center gap-0.5 text-[9px] font-bold text-slate-400 hover:text-white relative"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 right-2 w-3.5 h-3.5 rounded-full bg-teal-500 text-slate-950 font-black text-[8px] flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
              <span>Comanda</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
