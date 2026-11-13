import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePOS } from '../context/POSContext';
import {
  QrCode, Smartphone, Sparkles, Flame, Printer, Star,
  Soup, Fish, Wheat, Sandwich, CupSoda, Beer, Coffee, Cake,
  GlassWater, Heart, Search, Filter, Bell, ShoppingBag, Plus,
  Minus, Info, Check, ArrowRight, ArrowLeft, Globe, Wifi, Clock, Utensils,
  ChevronRight, Eye, ShieldCheck, Share2, Layers, Compass, Copy, ExternalLink
} from 'lucide-react';
import { Product, Language } from '../types';
import { getCategoryTheme } from '../utils/theme';
import { getCategoryMeta } from '../utils/categoryMeta';
import { sound } from '../utils/sound';
import { formatCLP } from '../utils/currency';
import { AVAILABLE_LANGUAGES } from '../utils/language';
import { DishDetailModal } from './digital-menu/DishDetailModal';
import { MobileOrderDrawer, CartItem } from './digital-menu/MobileOrderDrawer';
import { CallWaiterModal } from './digital-menu/CallWaiterModal';
import { QRStandModal } from './digital-menu/QRStandModal';
import { MobileCustomerView } from './digital-menu/MobileCustomerView';

export const DigitalMenu: React.FC = () => {
  const { categories, products, language, setLanguage, tables, themeMode, restaurantBrand, currency } = usePOS();
  const isLight = themeMode === 'vibrant-light';

  // Navigation State: null = "Directory of Animated Category Cards", number = "Drill-down to that specific category"
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedDietary, setSelectedDietary] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<'grid' | 'mobile'>('grid');
  const [selectedTableForQR, setSelectedTableForQR] = useState<string>('1');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  // Modals & Drawers
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCallWaiterOpen, setIsCallWaiterOpen] = useState<boolean>(false);
  const [showQRStandModal, setShowQRStandModal] = useState<boolean>(false);
  const [activeLanguage, setActiveLanguage] = useState<Language>(language || 'es');

  // Interactive Cart for Customer simulation
  const [cart, setCart] = useState<CartItem[]>([]);

  // Category Icon Resolver
  const getCategoryIcon = (iconName?: string) => {
    switch (iconName?.toLowerCase()) {
      case 'soup': return <Soup className="w-4 h-4" />;
      case 'fish': return <Fish className="w-4 h-4" />;
      case 'wheat': return <Wheat className="w-4 h-4" />;
      case 'flame': return <Flame className="w-4 h-4" />;
      case 'sandwich': return <Sandwich className="w-4 h-4" />;
      case 'cupsoda': return <CupSoda className="w-4 h-4" />;
      case 'beer': return <Beer className="w-4 h-4" />;
      case 'coffee': return <Coffee className="w-4 h-4" />;
      case 'cake': return <Cake className="w-4 h-4" />;
      case 'glasswater': return <GlassWater className="w-4 h-4" />;
      case 'shoppingbag': return <ShoppingBag className="w-4 h-4" />;
      case 'star':
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  // Dietary Filters definition
  const dietaryFilters = [
    { id: 'all', label: 'Toda la Carta', icon: '🍽️' },
    { id: 'chef', label: 'Especialidades Chef', icon: '⭐' },
    { id: 'gluten-free', label: 'Sin Gluten', icon: '🌾' },
    { id: 'veggie', label: 'Vegetariano / Ligero', icon: '🌱' },
    { id: 'spicy', label: 'Picante', icon: '🌶️' },
    { id: 'drinks', label: 'Bebidas & Cavas', icon: '🍷' },
  ];

  // Active Category Object
  const currentCategory = useMemo(() => {
    if (selectedCategoryId === null) return null;
    return categories.find(c => c.id === selectedCategoryId) || null;
  }, [categories, selectedCategoryId]);

  // Filtered Products Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // 1. Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = (p.description || '').toLowerCase().includes(q);
        const matchesAllergens = (p.allergens || []).some(a => a.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesAllergens) return false;
      } else if (selectedCategoryId !== null) {
        // Only apply category filtering if we are inside a category
        if (p.categoryId !== selectedCategoryId) return false;
      }

      // 2. Dietary Filter
      if (selectedDietary === 'gluten-free') {
        return !p.allergens || !p.allergens.includes('Gluten');
      }
      if (selectedDietary === 'veggie') {
        return !p.allergens?.includes('Pescado') && !p.allergens?.includes('Crustáceos') && !p.allergens?.includes('Moluscos');
      }
      if (selectedDietary === 'spicy') {
        return p.description && (
          p.description.toLowerCase().includes('ají') ||
          p.description.toLowerCase().includes('aji') ||
          p.description.toLowerCase().includes('rocoto') ||
          p.description.toLowerCase().includes('brava') ||
          p.description.toLowerCase().includes('picante') ||
          p.description.toLowerCase().includes('macho') ||
          p.description.toLowerCase().includes('pimienta')
        );
      }
      if (selectedDietary === 'drinks') {
        return [100, 6, 102, 7, 8, 103].includes(p.categoryId);
      }
      if (selectedDietary === 'chef') {
        return p.price >= 15500 || p.isKitchen;
      }

      return true;
    });
  }, [products, selectedCategoryId, selectedDietary, searchQuery]);

  // Featured chef specials (top picks)
  const chefSpecials = useMemo(() => {
    return products.filter(p => p.image && (p.price >= 15500 || p.categoryId === 100 || p.categoryId === 1 || p.categoryId === 2)).slice(0, 4);
  }, [products]);

  // Helper to check if a product is in cart and its quantity
  const getProductCartCount = (productId: string) => {
    const item = cart.find(c => c.product.id === productId);
    return item ? item.quantity : 0;
  };

  const getProductCartIndex = (productId: string) => {
    return cart.findIndex(c => c.product.id === productId);
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1, selectedOptions: string[] = [], notes = '', extraPrice = 0) => {
    sound.playSuccess();
    setCart(prev => {
      const existingIdx = prev.findIndex(
        item =>
          item.product.id === product.id &&
          JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions) &&
          item.notes === notes
      );
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += quantity;
        return next;
      } else {
        return [...prev, {
          product,
          quantity,
          selectedOptions,
          notes,
          unitPrice: product.price + extraPrice
        }];
      }
    });
  };

  const handleUpdateCartQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      setCart(prev => prev.filter((_, i) => i !== index));
    } else {
      setCart(prev => prev.map((item, i) => i === index ? { ...item, quantity: newQty } : item));
    }
  };

  const handleRemoveCartItem = (index: number) => {
    sound.playTap();
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCart([]);
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
    <div className={`flex-1 flex flex-col h-full overflow-y-auto select-none transition-colors ${
      isLight ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Top Navigation & Controls Bar (Compact & Space-saving) */}
      <div className={`sticky top-0 z-30 p-2.5 sm:px-5 backdrop-blur-xl border-b transition-colors ${
        isLight ? 'bg-white/95 border-slate-200' : 'bg-slate-950/95 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Header Title with Branding */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 via-cyan-500 to-emerald-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
                  <span>Carta Digital QR</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30 uppercase">
                    En Vivo
                  </span>
                </h1>
              </div>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Language Switcher */}
            <div className={`flex items-center p-0.5 rounded-xl border ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              {AVAILABLE_LANGUAGES.map(item => (
                <button
                  key={item.code}
                  onClick={() => { sound.playTap(); setActiveLanguage(item.code); setLanguage(item.code); }}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition-all flex items-center gap-1 ${
                    activeLanguage === item.code
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={item.nativeName}
                >
                  <span>{item.flag}</span>
                  <span className="uppercase">{item.code}</span>
                </button>
              ))}
            </div>

            {/* View Mode Toggle (Grid vs Mobile Simulator) */}
            <div className={`flex items-center p-0.5 rounded-xl border ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <button
                onClick={() => { sound.playTap(); setPreviewMode('grid'); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                  previewMode === 'grid'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Catálogo</span>
              </button>
              <button
                onClick={() => { sound.playTap(); setPreviewMode('mobile'); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                  previewMode === 'mobile'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Móvil</span>
              </button>
            </div>

            {/* Table QR Stand Generator Button */}
            <button
              id="print-qr-stand-btn"
              onClick={() => { sound.playTap(); setShowQRStandModal(true); }}
              className="touch-btn px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Soporte QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area based on Mode */}
      {previewMode === 'grid' ? (
        /* ================= DESKTOP / TABLET GASTRONOMIC CATALOG VIEW ================= */
        <div className="p-3 sm:p-5 space-y-4 max-w-7xl mx-auto w-full">
          {/* Restaurant Hero Presentation Card (Slim & Compact) */}
          <div className={`relative rounded-2xl overflow-hidden p-4 sm:p-5 shadow-md border ${
            isLight
              ? 'bg-slate-900 border-teal-600/30 text-white'
              : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="max-w-2xl space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-teal-500/20 text-teal-300 border border-teal-400/30 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                    {restaurantBrand.name}
                  </span>
                  <span className="flex items-center text-amber-300 text-[10px] font-black bg-black/40 px-2 py-0.5 rounded-full border border-amber-400/30">
                    <Star className="w-3 h-3 fill-amber-300 mr-1" /> 4.9 (480+ reviews)
                  </span>
                  <span className="flex items-center text-emerald-300 text-[10px] font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <Clock className="w-3 h-3 mr-1" /> Cocina Abierta
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-black tracking-tight leading-tight">
                  Carta Gastronómica & Coctelería de Autor
                </h2>
                <p className="text-xs text-slate-300 line-clamp-1">
                  {restaurantBrand.tagline || 'Cocina fusión y tradicional con producto de temporada, pescados frescos de lonja y carnes maduradas a la brasa.'}
                </p>
              </div>

              {/* Live QR Code Station for Customer Scanning */}
              <div className="bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/15 flex flex-col sm:flex-row items-center gap-3.5 shrink-0">
                {/* Live Real Scannable QR Image */}
                <div className="p-1.5 bg-white rounded-xl shadow-lg border border-slate-200 shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                      typeof window !== 'undefined'
                        ? `${window.location.origin}${window.location.pathname}?mode=customer&table=${selectedTableForQR}`
                        : `https://dypos.app/?mode=customer&table=${selectedTableForQR}`
                    )}&margin=2`}
                    alt={`QR Mesa ${selectedTableForQR}`}
                    className="w-18 h-18 sm:w-20 sm:h-20 object-contain"
                  />
                </div>

                {/* Table Control & Explanation */}
                <div className="space-y-1.5 text-center sm:text-left min-w-[200px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-black text-teal-300">
                      QR de Mesa Escaneable
                    </span>
                    <select
                      value={selectedTableForQR}
                      onChange={e => { sound.playTap(); setSelectedTableForQR(e.target.value); }}
                      className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-2 py-0.5 rounded-lg border border-white/20 outline-none cursor-pointer"
                    >
                      {tables.slice(0, 25).map(t => (
                        <option key={t.id} value={t.number} className="bg-slate-900 text-white">
                          {t.name} (Nº {t.number})
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="text-[10px] text-slate-300 leading-tight">
                    Enfoca la cámara del móvil aquí para abrir la carta interactiva con fotos y pedidos.
                  </p>

                  {/* Actions for Manager / Staff */}
                  <div className="flex items-center gap-1.5 pt-0.5 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => { sound.playTap(); setPreviewMode('mobile'); }}
                      className="px-2 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                      title="Probar en simulador móvil"
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>Probar Carta</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sound.playTap();
                        const url = `${window.location.origin}${window.location.pathname}?mode=customer&table=${selectedTableForQR}`;
                        navigator.clipboard.writeText(url).then(() => {
                          setCopiedUrl(true);
                          sound.playSuccess();
                          setTimeout(() => setCopiedUrl(false), 2500);
                        }).catch(() => {});
                      }}
                      className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                      title="Copiar enlace directo de la mesa"
                    >
                      {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUrl ? '¡Copiado!' : 'Copiar URL'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { sound.playTap(); setShowQRStandModal(true); }}
                      className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer"
                      title="Imprimir soporte físico para sobremesa"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Soporte</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chef Recommended Highlights Strip (Visible on Level 1) */}
          {selectedCategoryId === null && !searchQuery && chefSpecials.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-black text-sm uppercase tracking-wider">
                    Sugerencias Destacadas del Chef
                  </h3>
                </div>
                <span className="text-xs text-slate-500">Platos más aclamados por nuestros comensales</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {chefSpecials.map(spec => (
                  <motion.div
                    key={spec.id}
                    whileHover={{ y: -4 }}
                    onClick={() => setSelectedProductForDetail(spec)}
                    className={`cursor-pointer rounded-3xl p-3 border shadow-lg flex items-center gap-3 transition-all ${
                      isLight
                        ? 'bg-gradient-to-r from-amber-50/70 to-white border-amber-200 hover:border-amber-400'
                        : 'bg-gradient-to-r from-amber-950/20 to-slate-900 border-amber-800/40 hover:border-amber-500'
                    }`}
                  >
                    <img
                      src={spec.image}
                      alt={spec.name}
                      className="w-16 h-16 rounded-2xl object-cover shrink-0 shadow-md"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-wide">
                        Especialidad
                      </span>
                      <h4 className="font-bold text-xs truncate">{spec.name}</h4>
                      <span className="text-xs font-black font-mono text-teal-600 dark:text-teal-400 mt-0.5 block">
                        {formatCLP(spec.price, currency)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* LEVEL 1: CATEGORIES DIRECTORY VIEW (ANIMATED INTERACTIVE CARDS)           */}
          {/* ========================================================================= */}
          {selectedCategoryId === null && !searchQuery ? (
            <div className="space-y-6">
              {/* Search and Filter Bar at Directory Root */}
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl border shadow-xs ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
              }`}>
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Buscar plato, ingrediente o alérgeno en toda la carta..."
                    className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs border font-medium outline-none transition-all ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-teal-500'
                        : 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-teal-400'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold hidden sm:inline">
                    Explora nuestras especialidades:
                  </span>
                  <span className={`px-3 py-1 rounded-xl text-xs font-black border ${
                    isLight ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                  }`}>
                    {categories.length} Categorías
                  </span>
                </div>
              </div>

              {/* Directory Section Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                      <Compass className="w-4 h-4" />
                    </div>
                    <h3 className={`font-black text-lg tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Explorar la Carta por Categorías
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Selecciona cualquier categoría para ingresar y descubrir los platos, recetas e ingredientes.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 hidden md:inline font-bold">
                  {products.length} platos en total
                </span>
              </div>

              {/* Animated Category Cards Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map((cat, index) => {
                  const theme = getCategoryTheme(cat.id);
                  const meta = getCategoryMeta(cat.id, cat.name);
                  const catProducts = products.filter(p => p.categoryId === cat.id);
                  const dishCount = catProducts.length;
                  const lowestPrice = catProducts.length > 0 ? Math.min(...catProducts.map(p => p.price)) : 0;
                  const sampleDishNames = catProducts.slice(0, 2).map(p => p.name);

                  return (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.25 }}
                      whileHover={{ y: -6, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`group relative rounded-3xl border overflow-hidden shadow-lg hover:shadow-2xl cursor-pointer flex flex-col justify-between transition-all ${
                        isLight
                          ? 'bg-white border-slate-200 hover:border-teal-500 hover:shadow-teal-500/10'
                          : 'bg-slate-900/90 border-slate-800 hover:border-teal-500/80 hover:shadow-teal-500/10'
                      }`}
                    >
                      {/* Image Header with Gradient & Badges */}
                      <div className="relative h-44 overflow-hidden bg-slate-950">
                        <img
                          src={meta.coverImage || cat.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80'}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase text-white shadow-lg bg-gradient-to-r ${theme.gradient}`}>
                            {meta.badgeText || 'Carta'}
                          </span>
                          <span className="w-8 h-8 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center text-white shadow-md">
                            {getCategoryIcon(cat.icon)}
                          </span>
                        </div>

                        {/* Bottom Pill on photo: Dish count and price */}
                        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between">
                          <span className="px-2.5 py-1 rounded-xl text-xs font-black font-mono bg-black/80 backdrop-blur-md text-teal-300 border border-teal-500/30 shadow-md">
                            {dishCount} {dishCount === 1 ? 'Plato' : 'Platos'}
                          </span>
                          {lowestPrice > 0 && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-black/70 text-amber-300 backdrop-blur-md">
                              Desde {formatCLP(lowestPrice, currency)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Content Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h4 className={`text-base font-black tracking-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1 ${
                            isLight ? 'text-slate-900' : 'text-slate-100'
                          }`}>
                            {cat.name}
                          </h4>
                          <p className={`text-xs mt-1 line-clamp-2 leading-relaxed font-medium ${
                            isLight ? 'text-slate-600' : 'text-slate-400'
                          }`}>
                            {meta.subtitle}
                          </p>

                          {/* Sample dishes pill preview */}
                          {sampleDishNames.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {sampleDishNames.map((name, i) => (
                                <span key={i} className={`px-2 py-0.5 rounded-md text-[10px] font-medium border truncate max-w-[130px] ${
                                  isLight
                                    ? 'bg-slate-100 text-slate-700 border-slate-200'
                                    : 'bg-slate-800/80 text-slate-300 border-slate-700/60'
                                }`}>
                                  • {name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Action CTA Row */}
                        <div className={`pt-3 border-t flex items-center justify-between text-xs font-black transition-colors ${
                          isLight ? 'border-slate-100 text-teal-700' : 'border-slate-800 text-teal-400'
                        }`}>
                          <span>Ver {dishCount} especialidades</span>
                          <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            <span>Ingresar</span>
                            <ChevronRight className="w-4 h-4" />
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
            <div className="space-y-6">
              {/* Back to Categories Navigation Bar & Breadcrumb */}
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl border ${
                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
              }`}>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleBackToCategories}
                    className="px-4 py-2 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs shadow-lg shadow-teal-600/20 flex items-center gap-2 active:scale-95 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>← Volver a Todas las Categorías</span>
                  </button>

                  <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span>Carta</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-teal-600 dark:text-teal-400 font-black">{currentCategory?.name || 'Búsqueda'}</span>
                  </div>
                </div>

                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-bold">
                  {filteredProducts.length} productos en esta sección
                </span>
              </div>

              {/* Category Hero Showcase Banner */}
              {currentCategory && !searchQuery && (
                <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
                  <img
                    src={getCategoryMeta(currentCategory.id, currentCategory.name).coverImage}
                    alt={currentCategory.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-20"
                    referrerPolicy="no-referrer"
                  />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-xl bg-gradient-to-r ${getCategoryTheme(currentCategory.id).gradient} text-white shadow-md`}>
                          {getCategoryIcon(currentCategory.icon)}
                        </div>
                        <span className="text-xs font-black uppercase text-teal-400 tracking-wider">
                          Categoría Seleccionada
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {currentCategory.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {getCategoryMeta(currentCategory.id, currentCategory.name).subtitle}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-teal-300 font-mono font-black text-sm">
                        {products.filter(p => p.categoryId === currentCategory.id).length} Platos Disponibles
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Jump Category Switcher Slider */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                <button
                  type="button"
                  onClick={handleBackToCategories}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap flex items-center gap-1.5 shrink-0 border transition-all ${
                    isLight
                      ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-xs'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-teal-500" />
                  <span>Ver Directorio</span>
                </button>

                {categories.map(cat => {
                  const isSelected = selectedCategoryId === cat.id;
                  const theme = getCategoryTheme(cat.id);
                  const count = products.filter(p => p.categoryId === cat.id).length;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 shrink-0 border ${
                        isSelected
                          ? `bg-gradient-to-r ${theme.gradient} text-white border-white/30 shadow-lg ${theme.glowColor}`
                          : isLight
                          ? 'bg-white text-slate-700 hover:text-slate-950 border-slate-200 shadow-xs hover:border-teal-400'
                          : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                      }`}
                    >
                      <span>{getCategoryIcon(cat.icon)}</span>
                      <span>{cat.name}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        isSelected ? 'bg-black/30 text-white' : isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search & Dietary Filters inside Category */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={currentCategory ? `Buscar en ${currentCategory.name}...` : "Buscar plato..."}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs border font-medium outline-none transition-all ${
                      isLight
                        ? 'bg-white border-slate-200 text-slate-900 focus:border-teal-500 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-100 focus:border-teal-400'
                    }`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-200"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {/* Dietary Filter Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {dietaryFilters.map(df => {
                    const isSelected = selectedDietary === df.id;
                    return (
                      <button
                        key={df.id}
                        onClick={() => { sound.playTap(); setSelectedDietary(df.id); }}
                        className={`px-3 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-500 shadow-md font-black'
                            : isLight
                            ? 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                        }`}
                      >
                        <span>{df.icon}</span>
                        <span>{df.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Products Bento & Grid View */}
              <div className="space-y-4">
                {filteredProducts.length === 0 ? (
                  <div className={`p-12 text-center rounded-3xl border ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                  }`}>
                    <Utensils className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-50" />
                    <h4 className="font-bold text-base">No se encontraron platos</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Prueba cambiando los filtros dietéticos o el término de búsqueda para ver más opciones de la carta.
                    </p>
                    <button
                      onClick={() => { setSearchQuery(''); setSelectedDietary('all'); }}
                      className="mt-4 px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-md"
                    >
                      Restablecer Filtros
                    </button>
                  </div>
                ) : (
                  <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                  >
                    <AnimatePresence>
                      {filteredProducts.map(prod => {
                        const inCartQty = getProductCartCount(prod.id);
                        const cartIdx = getProductCartIndex(prod.id);

                        return (
                          <motion.div
                            key={prod.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className={`group rounded-3xl border overflow-hidden shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between ${
                              isLight
                                ? 'bg-white border-slate-200 hover:border-teal-500/50'
                                : 'bg-slate-900/90 border-slate-800 hover:border-teal-500/50'
                            }`}
                          >
                            {/* Dish Photo */}
                            <div
                              onClick={() => setSelectedProductForDetail(prod)}
                              className="h-48 overflow-hidden relative bg-slate-950 cursor-pointer"
                            >
                              <img
                                src={prod.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80'}
                                alt={prod.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                              {/* Top Action / Badges */}
                              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                                {prod.allergens && prod.allergens.length > 0 ? (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 backdrop-blur-md text-amber-300 border border-amber-400/30">
                                    {prod.allergens.slice(0, 2).join(', ')}
                                  </span>
                                ) : <span />}

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    sound.playTap();
                                    setSelectedProductForDetail(prod);
                                  }}
                                  className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all"
                                  title="Ver detalles gastronómicos"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Price Badge on photo bottom */}
                              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                                <span className="text-xl font-black text-amber-300 font-mono drop-shadow-md">
                                  {formatCLP(prod.price, currency)}
                                </span>
                              </div>
                            </div>

                            {/* Content Card Body */}
                            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                              <div
                                onClick={() => setSelectedProductForDetail(prod)}
                                className="cursor-pointer"
                              >
                                <h4 className={`font-black text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1 ${
                                  isLight ? 'text-slate-900' : 'text-slate-100'
                                }`}>
                                  {prod.name}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mt-1">
                                  {prod.description || 'Elaborado diariamente con productos de temporada y receta tradicional.'}
                                </p>
                              </div>

                              {/* Card Bottom Actions */}
                              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedProductForDetail(prod)}
                                  className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                                >
                                  <span>Detalles</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>

                                {inCartQty > 0 ? (
                                  <div
                                    onClick={e => e.stopPropagation()}
                                    className="flex items-center rounded-xl bg-teal-950 border border-teal-600 p-1"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateCartQuantity(cartIdx, inCartQty - 1)}
                                      className="w-6 h-6 flex items-center justify-center text-teal-300 hover:bg-teal-800 rounded-lg"
                                    >
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="w-6 text-center text-xs font-mono font-bold text-teal-200">
                                      {inCartQty}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateCartQuantity(cartIdx, inCartQty + 1)}
                                      className="w-6 h-6 flex items-center justify-center text-teal-300 hover:bg-teal-800 rounded-lg"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (prod.options && prod.options.length > 0) {
                                        sound.playTap();
                                        setSelectedProductForDetail(prod);
                                      } else {
                                        handleAddToCart(prod, 1);
                                      }
                                    }}
                                    className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-600/20 transition-all"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>{prod.options && prod.options.length > 0 ? 'Elegir' : 'Pedir'}</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ================= SMARTPHONE SIMULATOR VIEW ================= */
        <MobileCustomerView
          categories={categories}
          products={products}
          tables={tables}
          restaurantBrand={restaurantBrand}
          selectedTable={selectedTableForQR}
          onSelectTable={setSelectedTableForQR}
          language={activeLanguage}
          onSelectLanguage={(lang) => { setActiveLanguage(lang); setLanguage(lang); }}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateCartQuantity={handleUpdateCartQuantity}
          onOpenDetailModal={setSelectedProductForDetail}
          onOpenCartDrawer={() => setIsCartOpen(true)}
          onOpenCallWaiter={() => setIsCallWaiterOpen(true)}
          currencySymbol={currency}
        />
      )}

      {/* Floating Bottom Cart Bubble for Desktop View */}
      {previewMode === 'grid' && totalCartCount > 0 && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <button
            onClick={() => { sound.playTap(); setIsCartOpen(true); }}
            className="px-5 py-3.5 rounded-3xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 text-white shadow-2xl shadow-teal-600/40 font-black text-xs sm:text-sm flex items-center gap-3 border border-teal-400/40 hover:scale-105 transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs">
              {totalCartCount}
            </div>
            <span>Mi Comanda en Mesa</span>
            <span className="bg-black/25 px-2.5 py-1 rounded-xl font-mono">
              {formatCLP(totalCartAmount, currency)}
            </span>
          </button>
        </motion.div>
      )}

      {/* Dish Detail Modal */}
      {selectedProductForDetail && (
        <DishDetailModal
          product={selectedProductForDetail}
          onClose={() => setSelectedProductForDetail(null)}
          onAddToCart={(prod, qty, opts, notes, extraPrice) => handleAddToCart(prod, qty, opts, notes, extraPrice)}
          isLight={isLight}
          currencySymbol={currency}
        />
      )}

      {/* Mobile / Customer Cart Drawer */}
      <MobileOrderDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        selectedTable={selectedTableForQR}
        isLight={isLight}
        currencySymbol={currency}
      />

      {/* Call Waiter Modal */}
      <CallWaiterModal
        isOpen={isCallWaiterOpen}
        onClose={() => setIsCallWaiterOpen(false)}
        selectedTable={selectedTableForQR}
        isLight={isLight}
      />

      {/* Physical Table QR Stand Generator & Print Modal */}
      <QRStandModal
        isOpen={showQRStandModal}
        onClose={() => setShowQRStandModal(false)}
        tables={tables}
        selectedTableNumber={selectedTableForQR}
        onSelectTableNumber={setSelectedTableForQR}
        restaurantBrand={restaurantBrand}
        isLight={isLight}
      />
    </div>
  );
};
