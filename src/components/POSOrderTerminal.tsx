import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Product, ProductOption, SaleLine } from '../types';
import {
  Home, Paperclip, User, Printer, Power, Star, ChevronLeft, ChevronRight,
  Plus, Minus, Trash2, Scissors, ChefHat, Tag, Percent, MessageSquare,
  Search, Barcode, Grid, CreditCard, ArrowRightLeft, Clock, ShoppingBag,
  Check, AlertTriangle, ArrowUp, ArrowDown, HelpCircle, Utensils,
  Smartphone, Send, X, ShieldAlert, Sparkles, CheckCircle2, SlidersHorizontal, Flame
} from 'lucide-react';
import { sound } from '../utils/sound';
import { CHILE_IVA_PERCENT, calculateNetAndIva, formatCLP, roundCLP } from '../utils/currency';
import { hasUserPermission } from '../utils/permissions';
import { ProductOptionsModal } from './ProductOptionsModal';

export const POSOrderTerminal: React.FC = () => {
  const {
    t, activeSale, setActiveSale, categories, products, rates, selectedRateId,
    setSelectedRateId, addItemToActiveSale, updateSaleLine, removeSaleLine,
    sendActiveSaleToKitchen, transferTable, parkSale, cancelActiveSale,
    tables, setIsPaymentModalOpen, setPrintableTicket, setActiveView,
    waiter, setIsLoginModalOpen, logout, themeMode, stationMode, currency,
    clients, assignClientToActiveSale
  } = usePOS();

  // State for active category & page
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(categories[0]?.id || 1);
  const [productPage, setProductPage] = useState<number>(0);
  const [categoryPage, setCategoryPage] = useState<number>(0);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);

  // Mobile responsive view tab for !isWaiterMode (< lg screens) so categories & products are never pushed offscreen
  const [mobilePosTab, setMobilePosTab] = useState<'catalog' | 'ticket'>('catalog');

  // Client assignment modal
  const [isClientModalOpen, setIsClientModalOpen] = useState<boolean>(false);
  const [clientSearchQuery, setClientSearchQuery] = useState<string>('');

  // Kitchen block selector for new items (1, 2, 3, 4)
  const [activeKitchenBlock, setActiveKitchenBlock] = useState<number>(1);

  // Printer enabled state
  const [isPrinterEnabled, setIsPrinterEnabled] = useState<boolean>(true);

  // Mode: Touch Terminal vs Barcode / Manual
  const [terminalTab, setTerminalTab] = useState<'touch' | 'barcode'>('touch');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Keypad quantity buffer
  const [keypadBuffer, setKeypadBuffer] = useState<string>('1');

  // Mobile / Waiter specific states
  const [isMobileCartOpen, setIsMobileCartOpen] = useState<boolean>(false);
  const [kitchenSentToast, setKitchenSentToast] = useState<boolean>(false);

  const isLight = themeMode === 'vibrant-light';

  // Modals state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [transferTargetId, setTransferTargetId] = useState<number | null>(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState<boolean>(false);
  const [noteInput, setNoteInput] = useState<string>('');
  const [isCouponModalOpen, setIsCouponModalOpen] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState<string>('');
  const [isPendingSalesModalOpen, setIsPendingSalesModalOpen] = useState<boolean>(false);

  // Options & Modifiers Modal state
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState<boolean>(false);
  const [optionsTargetLineId, setOptionsTargetLineId] = useState<string | null>(null);
  const [optionsTargetProduct, setOptionsTargetProduct] = useState<Product | null>(null);
  const [pendingAddQty, setPendingAddQty] = useState<number | null>(null);
  const [optionsProductName, setOptionsProductName] = useState<string>('');
  const [optionsInitialSelected, setOptionsInitialSelected] = useState<string>('');
  const [optionsInitialNotes, setOptionsInitialNotes] = useState<string>('');

  // Role permissions
  const isWaiterMode = stationMode === 'waiter-mobile' || waiter.role === 'waiter';
  const canCharge = hasUserPermission(waiter, 'canCloseBills') || waiter.role === 'cashier' || waiter.role === 'admin';
  const canPrintPrebill = hasUserPermission(waiter, 'canPrintPrebills') || waiter.role === 'cashier' || waiter.role === 'admin';
  const canApplyDiscount = hasUserPermission(waiter, 'canApplyDiscounts');
  const canTransfer = hasUserPermission(waiter, 'canTransferTables');

  if (!activeSale) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 select-none bg-slate-900 text-slate-400">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4 bg-slate-800 border border-slate-700 text-amber-400 shadow-xl">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Ninguna comanda activa</h2>
        <p className="text-xs text-center max-w-sm mb-5 text-slate-400">
          Seleccione una mesa en el plano del salón para abrir o registrar comandas.
        </p>
        <button
          onClick={() => setActiveView('floor')}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Home className="w-4 h-4" />
          <span>Ir al Plano de Mesas</span>
        </button>
      </div>
    );
  }

  // Filter products by selected category or search
  const categoryProducts = products.filter(p => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q));
    }
    return p.categoryId === selectedCategoryId;
  });

  const PRODUCTS_PER_PAGE = isWaiterMode ? 50 : 24;
  const totalProductPages = Math.ceil(categoryProducts.length / PRODUCTS_PER_PAGE) || 1;
  const currentProducts = categoryProducts.slice(
    productPage * PRODUCTS_PER_PAGE,
    (productPage + 1) * PRODUCTS_PER_PAGE
  );

  const CATEGORIES_PER_PAGE = 12;
  const totalCategoryPages = Math.ceil(categories.length / CATEGORIES_PER_PAGE) || 1;
  const currentCategories = categories.slice(
    categoryPage * CATEGORIES_PER_PAGE,
    (categoryPage + 1) * CATEGORIES_PER_PAGE
  );

  const totalItemsCount = activeSale.items.reduce((sum, it) => sum + it.quantity, 0);

  const handleProductClick = (product: Product) => {
    sound.playTap();
    const qty = parseFloat(keypadBuffer) || 1;
    if (product.options && product.options.length > 0) {
      setOptionsTargetProduct(product);
      setPendingAddQty(qty);
      setOptionsTargetLineId(null);
      setOptionsProductName(product.name);
      setOptionsInitialSelected(product.options[0].name);
      setOptionsInitialNotes('');
      setIsOptionsModalOpen(true);
      setKeypadBuffer('1');
      return;
    }
    addItemToActiveSale(product, qty, undefined, undefined, activeKitchenBlock);
    setKeypadBuffer('1');
  };

  const handleSendToKitchen = () => {
    if (activeSale.items.length === 0) return;
    sound.playKitchenBell();
    sendActiveSaleToKitchen();
    setKitchenSentToast(true);
    setIsMobileCartOpen(false);
    setTimeout(() => {
      setKitchenSentToast(false);
    }, 4000);
  };

  const handleKeypadDigit = (digit: string) => {
    sound.playTap();
    if (keypadBuffer === '1' || keypadBuffer === '0') {
      setKeypadBuffer(digit);
    } else {
      setKeypadBuffer(prev => prev + digit);
    }
  };

  const handleKeypadClear = () => {
    sound.playTap();
    setKeypadBuffer('1');
  };

  const handleKeypadComma = () => {
    sound.playTap();
    if (!keypadBuffer.includes('.')) {
      setKeypadBuffer(prev => prev + '.');
    }
  };

  const handleKeypadMinus = () => {
    sound.playTap();
    if (selectedLineId) {
      const line = activeSale.items.find(i => i.id === selectedLineId);
      if (line) {
        if (line.quantity > 1) {
          updateSaleLine(line.id, { quantity: line.quantity - 1 });
        } else {
          removeSaleLine(line.id);
          setSelectedLineId(null);
        }
      }
    }
  };

  const handleLineMove = (lineId: string, direction: 'up' | 'down') => {
    sound.playTap();
    const index = activeSale.items.findIndex(i => i.id === lineId);
    if (index === -1) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= activeSale.items.length) return;

    const newItems = [...activeSale.items];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(newIndex, 0, moved);
    newItems.forEach((it, idx) => {
      it.lineId = idx + 1;
    });
    setActiveSale({
      ...activeSale,
      items: newItems,
    });
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    sound.playTap();
    const discountedItems = activeSale.items.map(item => ({
      ...item,
      discount: 10,
      total: roundCLP(item.unitPrice * item.quantity * 0.9),
    }));
    const itemsGross = discountedItems.reduce((sum, it) => sum + it.total, 0);
    const fee = activeSale.deliveryFee || 0;
    const { net, iva, gross } = calculateNetAndIva(itemsGross, CHILE_IVA_PERCENT);
    setActiveSale({
      ...activeSale,
      items: discountedItems,
      total: roundCLP(gross + fee),
      subtotal: net,
      taxTotal: iva,
    });
    setIsCouponModalOpen(false);
    setCouponCode('');
  };

  const handleApplyObservation = () => {
    sound.playTap();
    if (selectedLineId) {
      updateSaleLine(selectedLineId, { kitchenNotes: noteInput });
    } else {
      setActiveSale({
        ...activeSale,
        notes: noteInput,
      });
    }
    setIsNotesModalOpen(false);
  };

  const handleOpenOptionsModal = (lineId: string) => {
    sound.playTap();
    const line = activeSale.items.find(i => i.id === lineId);
    if (!line) return;
    setPendingAddQty(null);
    setOptionsTargetProduct(products.find(p => p.id === line.productId) || null);
    setOptionsTargetLineId(lineId);
    setOptionsProductName(line.productName);
    setOptionsInitialSelected(line.selectedOption || '');
    setOptionsInitialNotes(line.kitchenNotes || '');
    setIsOptionsModalOpen(true);
  };

  const handleApplyOptions = (selectedOptions: string, kitchenNotes: string, extraPrice?: number) => {
    if (pendingAddQty && optionsTargetProduct) {
      addItemToActiveSale(
        optionsTargetProduct,
        pendingAddQty,
        selectedOptions || undefined,
        kitchenNotes || undefined,
        activeKitchenBlock,
        extraPrice ?? 0
      );
      setPendingAddQty(null);
      setOptionsTargetProduct(null);
      return;
    }
    if (optionsTargetLineId) {
      updateSaleLine(optionsTargetLineId, {
        selectedOption: selectedOptions || undefined,
        kitchenNotes: kitchenNotes || undefined,
        modifiersExtraPrice: extraPrice ?? 0,
      });
    }
  };

  const formatMoney = (amount: number) => formatCLP(amount, currency, { spaced: true });

  // =========================================================================
  // 📱 SPECIALIZED WAITER / MOBILE COMANDERO VIEW
  // =========================================================================
  if (isWaiterMode) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden select-none bg-slate-950 text-slate-100 font-sans relative">
        
        {/* Toast Notification when sent to kitchen */}
        {kitchenSentToast && (
          <div className="absolute top-2 left-3 right-3 z-50 animate-in slide-in-from-top-4 duration-200">
            <div className="bg-emerald-600 text-white p-3 rounded-2xl shadow-2xl flex items-center justify-between border border-emerald-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
                <div>
                  <span className="font-black text-xs block">¡Comanda Enviada a Cocina!</span>
                  <span className="text-[10px] text-emerald-100 block">
                    {activeSale.tableName || `Mesa ${activeSale.tableNumber}`} • Notificación enviada al KDS
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playTap();
                  setActiveView('floor');
                }}
                className="px-2.5 py-1 bg-white text-emerald-900 rounded-xl font-black text-xs shadow-xs cursor-pointer active:scale-95 shrink-0"
              >
                Mesas
              </button>
            </div>
          </div>
        )}

        {/* 1. COMPACT WAITER HEADER */}
        <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 shrink-0 shadow-md">
          <div className="flex items-center justify-between gap-2">
            
            {/* Back to Floor Button */}
            <button
              onClick={() => {
                sound.playTap();
                setActiveView('floor');
              }}
              className="min-h-[40px] px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 text-white rounded-xl font-black text-xs flex items-center gap-1 cursor-pointer active:scale-95 shrink-0 shadow-xs"
            >
              <ChevronLeft className="w-4 h-4 text-sky-400" />
              <span>Mesas</span>
            </button>

            {/* Table Badge & Info */}
            <div className="flex items-center gap-1.5 truncate">
              <div className="min-h-[40px] bg-amber-500/20 border border-amber-500/40 text-amber-400 px-3 py-1.5 rounded-xl font-black text-xs truncate flex items-center gap-1.5 shadow-xs">
                <span>🍽️ {activeSale.tableName || `Mesa ${activeSale.tableNumber}`}</span>
              </div>
            </div>

            {/* Park / Save Table */}
            <button
              onClick={() => {
                sound.playTap();
                parkSale();
                setActiveView('floor');
              }}
              className="min-h-[40px] px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 rounded-xl font-black text-xs flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs shrink-0"
              title="Guardar comanda y volver"
            >
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Guardar</span>
            </button>
          </div>

          {/* Kitchen Course Block Selector (1º Plato, 2º Plato, Postres, Bebidas) */}
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-800/80 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0 mr-0.5">
              Marchar:
            </span>
            {[
              { id: 1, label: '1º Bloque' },
              { id: 2, label: '2º Bloque' },
              { id: 3, label: '3º Postres' },
              { id: 4, label: 'Bebidas' },
            ].map(b => (
              <button
                key={b.id}
                onClick={() => {
                  sound.playTap();
                  setActiveKitchenBlock(b.id);
                }}
                className={`min-h-[32px] px-2.5 py-1 rounded-lg text-[11px] font-black transition-all shrink-0 cursor-pointer active:scale-95 ${
                  activeKitchenBlock === b.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm ring-1 ring-amber-400'
                    : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. CATEGORIES HORIZONTAL SWIPER */}
        {/* 2. CATEGORIES PROMINENT HEADER & SWIPEABLE BAR (Waiter Mobile) */}
        <div className="bg-slate-900/95 border-b border-slate-800 px-3 py-2 shrink-0 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
            <span>Categorías ({categories.length})</span>
            <span className="text-blue-400">
              {categories.find(c => c.id === selectedCategoryId)?.name || 'Todas'}
            </span>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 min-w-max">
              {categories.map(cat => {
                const isSelected = selectedCategoryId === cat.id && !searchQuery;
                const prodCount = products.filter(p => p.categoryId === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      sound.playTap();
                      setSelectedCategoryId(cat.id);
                      setSearchQuery('');
                    }}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40 ring-2 ring-blue-400'
                        : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-blue-800 text-blue-100' : 'bg-slate-900 text-slate-400'
                    }`}>
                      {prodCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. SEARCH BAR */}
        <div className="px-3 pt-2 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar plato, trago o postre..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full min-h-[36px] bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold p-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 4. DISHES / PRODUCTS TOUCH GRID (Optimal density for phones) */}
        <div className="flex-1 overflow-y-auto px-3 py-2.5 pb-24">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
            {currentProducts.map(prod => {
              const isOutOfStock = prod.stock <= 0;
              const countInCart = activeSale.items
                .filter(it => it.productId === prod.id)
                .reduce((s, it) => s + it.quantity, 0);

              return (
                <button
                  key={prod.id}
                  disabled={isOutOfStock}
                  onClick={() => handleProductClick(prod)}
                  className={`min-h-[86px] p-2.5 rounded-xl border flex flex-col justify-between text-left transition-all relative active:scale-95 shadow-sm ${
                    isOutOfStock
                      ? 'bg-slate-900/40 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
                      : countInCart > 0
                      ? 'bg-slate-900 border-amber-500 text-white shadow-md shadow-amber-500/20 ring-1 ring-amber-500'
                      : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-100 hover:border-slate-700'
                  }`}
                >
                  {/* Item In Cart Quantity Badge */}
                  {countInCart > 0 && (
                    <div className="absolute top-1.5 right-1.5 bg-amber-500 text-slate-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                      {countInCart}
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-xs leading-snug line-clamp-2 pr-3">
                      {prod.name}
                    </h4>
                  </div>

                  <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between gap-1">
                    <span className="font-mono font-black text-xs text-amber-400">
                      {formatMoney(prod.price)}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-lg font-black border ${
                      prod.options && prod.options.length > 0
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-blue-600/30 text-blue-300 border-blue-500/40'
                    }`}>
                      {prod.options && prod.options.length > 0 ? 'Opciones' : '+1'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. STICKY BOTTOM COMANDA BAR (FLOATING ACTIONS) */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-2.5 sm:p-3 shadow-2xl">
          <div className="max-w-lg mx-auto flex items-center gap-2">
            
            {/* View Comanda Drawer Button */}
            <button
              onClick={() => {
                sound.playTap();
                setIsMobileCartOpen(true);
              }}
              className="flex-1 min-h-[48px] bg-slate-800 hover:bg-slate-750 active:bg-slate-700 border border-slate-700 text-white py-2 px-3 rounded-xl flex items-center justify-between shadow-md cursor-pointer active:scale-98 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                  {totalItemsCount}
                </div>
                <div className="text-left leading-tight">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Ver Comanda</span>
                  <span className="font-mono font-black text-xs sm:text-sm text-white">
                    {formatMoney(activeSale.total)}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Send to Kitchen Primary Button */}
            <button
              onClick={handleSendToKitchen}
              disabled={activeSale.items.length === 0}
              className={`min-h-[48px] py-2.5 px-4 sm:px-5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-lg transition-all active:scale-98 shrink-0 ${
                activeSale.items.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/40 ring-1 ring-emerald-400 cursor-pointer'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>MARCHAR</span>
            </button>
          </div>
        </div>

        {/* 6. MOBILE COMANDA SLIDE-UP DRAWER */}
        {isMobileCartOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-150">
            <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
              
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-base text-white flex items-center gap-2">
                    <span>📋 Comanda Mesa {activeSale.tableNumber}</span>
                    <span className="text-xs text-amber-400 font-mono font-bold">({totalItemsCount} items)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ajuste cantidades o agregue notas de cocina antes de marchar.
                  </p>
                </div>
                <button
                  onClick={() => setIsMobileCartOpen(false)}
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center cursor-pointer text-base"
                >
                  ✕
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 divide-y divide-slate-800/80">
                {activeSale.items.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm">
                    No ha agregado ningún producto a esta comanda.
                  </div>
                ) : (
                  activeSale.items.map(line => (
                    <div key={line.id} className="pt-3 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        
                        {/* Course & Full Product Name */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="text-[10px] bg-slate-800 text-amber-400 font-bold px-2 py-0.5 rounded-md border border-slate-700 shrink-0">
                              {line.courseBlock || 1}º Blq
                            </span>
                            <span className="font-mono font-bold text-xs text-amber-400/90 shrink-0">
                              {formatMoney(line.unitPrice)} c/u
                            </span>
                          </div>
                          
                          {/* Full Name Without Truncation */}
                          <h4 className="font-extrabold text-sm sm:text-base text-white leading-snug break-words">
                            {line.productName}
                          </h4>

                          {/* Selected Options Tags Display */}
                          {line.selectedOption && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {line.selectedOption.split(',').map((opt, idx) => (
                                <span
                                  key={idx}
                                  className="text-[11px] font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                >
                                  ✨ {opt.trim()}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Kitchen Notes */}
                          {line.kitchenNotes && (
                            <div className="mt-1 text-xs text-sky-300 italic flex items-center gap-1">
                              <span className="font-bold not-italic">Obs:</span>
                              <span className="break-words">{line.kitchenNotes}</span>
                            </div>
                          )}
                        </div>

                        {/* Total Price for line */}
                        <div className="text-right shrink-0">
                          <span className="font-mono font-black text-sm sm:text-base text-white block">
                            {formatMoney(line.total)}
                          </span>
                        </div>
                      </div>

                      {/* Line Action Buttons: Opciones, Obs, +/- and Trash */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/50">
                        
                        {/* Options & Notes Triggers */}
                        <div className="flex items-center gap-1.5">
                          {/* Dedicated Options Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenOptionsModal(line.id)}
                            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer transition-all"
                            title="Configurar opciones: término de carne, guarnición, para llevar, etc."
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Opciones</span>
                          </button>

                          {/* Observación Button */}
                          <button
                            type="button"
                            onClick={() => {
                              sound.playTap();
                              setSelectedLineId(line.id);
                              setNoteInput(line.kitchenNotes || '');
                              setIsNotesModalOpen(true);
                            }}
                            className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 border border-slate-700 active:scale-95 cursor-pointer"
                            title="Añadir nota de texto libre"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                            <span className="hidden sm:inline">Obs</span>
                          </button>
                        </div>

                        {/* Stepper & Delete */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              sound.playTap();
                              if (line.quantity > 1) {
                                updateSaleLine(line.id, { quantity: line.quantity - 1 });
                              } else {
                                removeSaleLine(line.id);
                              }
                            }}
                            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black flex items-center justify-center text-lg border border-slate-700 active:scale-95 cursor-pointer"
                          >
                            -
                          </button>

                          <span className="w-8 text-center font-mono font-black text-sm text-white">
                            {line.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              sound.playTap();
                              updateSaleLine(line.id, { quantity: line.quantity + 1 });
                            }}
                            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black flex items-center justify-center text-lg border border-slate-700 active:scale-95 cursor-pointer"
                          >
                            +
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              sound.playTap();
                              removeSaleLine(line.id);
                            }}
                            className="w-9 h-9 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 flex items-center justify-center border border-rose-800 active:scale-95 cursor-pointer ml-1"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-3.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-400 font-bold">Total Comanda:</span>
                  <span className="font-mono font-black text-lg text-amber-400">
                    {formatMoney(activeSale.total)}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>El cobro y cierre de cuenta se realiza exclusivamente en la Caja Principal.</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setIsMobileCartOpen(false)}
                    className="flex-1 min-h-[48px] rounded-2xl border border-slate-700 text-slate-300 font-bold text-xs sm:text-sm active:scale-98"
                  >
                    Seguir Pidiendo
                  </button>
                  <button
                    onClick={handleSendToKitchen}
                    disabled={activeSale.items.length === 0}
                    className="flex-1 min-h-[48px] rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>MARCHAR A COCINA</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Observaciones / Notas */}
        {isNotesModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="border border-slate-700 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl bg-slate-900 text-white">
              <div className="flex items-center justify-between border-b pb-3 border-slate-800">
                <h3 className="font-black text-sm flex items-center gap-2 text-white">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  Observación para Cocina
                </h3>
                <button
                  onClick={() => setIsNotesModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <textarea
                rows={3}
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                placeholder="Ej: Sin sal, término medio, salsa aparte..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
              />

              <div className="flex flex-wrap gap-1.5">
                {['Sin cebolla', 'Al punto', 'Bien cocido', 'Sin sal', 'Salsa aparte', 'Para llevar', 'Urgente', 'Sin hielo', 'Poco picante'].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNoteInput(prev => prev ? `${prev}, ${s}` : s)}
                    className="px-3 py-2 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 font-bold border border-slate-700"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNotesModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleApplyObservation}
                  className="min-h-[44px] px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-md active:scale-95"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Opciones & Modificadores de Cocina */}
        <ProductOptionsModal
          isOpen={isOptionsModalOpen}
          onClose={() => {
            setIsOptionsModalOpen(false);
            setPendingAddQty(null);
          }}
          productName={optionsProductName}
          product={optionsTargetProduct}
          confirmLabel={pendingAddQty ? 'Agregar a Comanda' : 'Aplicar Opciones'}
          initialSelectedOptions={optionsInitialSelected}
          initialKitchenNotes={optionsInitialNotes}
          onApply={handleApplyOptions}
          isLight={isLight}
        />
      </div>
    );
  }

  // =========================================================================
  // 🖥️ FULL DESKTOP CASHIER / ADMIN POS TERMINAL
  // =========================================================================
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none bg-[#0f172a] text-slate-100 font-sans">
      
      {/* 1. TOP SYSME HEADER BAR */}
      <div className="bg-[#1e293b] border-b border-slate-700 px-3 py-1.5 shrink-0 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: 3 Columns x 3 Rows Info Matrix */}
          <div className="grid grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-0.5 text-[11px] sm:text-xs font-mono font-bold leading-tight">
            {/* Row 1 */}
            <div className="text-slate-300">
              <span className="text-slate-400 font-normal">Venta:</span> <span className="text-white font-black">{activeSale.number || '34925'}</span>
            </div>
            <div className="text-slate-300">
              <span className="text-slate-400 font-normal">Ticket:</span> <span className="text-white font-black">{activeSale.ticketNumber || '22063'}</span>
            </div>
            <div className="text-slate-300">
              <span className="text-slate-400 font-normal">Empleado:</span> <span className="text-amber-400 font-black uppercase">{waiter.name || activeSale.waiterName || 'PIERRE'}</span>
              {activeSale.waiterName && activeSale.waiterName !== waiter.name && (
                <span className="text-[10px] text-slate-400 block font-normal">(Abierta por: {activeSale.waiterName})</span>
              )}
            </div>

            {/* Row 2 */}
            <div className="text-slate-300">
              <span className="text-slate-400 font-normal">Fecha:</span> <span className="text-white">{activeSale.date || '27-08-2026'}</span>
            </div>
            <div className="text-slate-300">
              <span className="text-slate-400 font-normal">Tpv:</span> <span className="text-white font-black">TPV1</span>
            </div>
            <div className="text-slate-300">
              <span className="text-slate-400 font-normal">Almacén:</span> <span className="text-white">01 - Local</span>
            </div>

            {/* Row 3 */}
            <div className="text-slate-300">
              <span className="text-slate-400 font-normal">Tarifa:</span> <span className="text-white">{activeSale.rateName || 'Default'}</span>
            </div>
            <div className="text-slate-300">
              <span className="text-slate-400 font-normal">Mesa:</span> <span className="text-emerald-400 font-black">{activeSale.tableName || `Mesa ${activeSale.tableNumber}`}</span>
            </div>
            <div className="text-slate-300">
              <span className="text-slate-400 font-normal">Cliente:</span>{' '}
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  setIsClientModalOpen(true);
                }}
                className="text-sky-300 hover:text-sky-200 underline decoration-dotted underline-offset-2 font-black cursor-pointer"
                title="Cambiar o asignar cliente"
              >
                {activeSale.customerName || 'Cliente General'}
              </button>
            </div>
          </div>

          {/* Right: Top Navigation Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Mapa del Salón */}
            <button
              id="btn-pos-floor-plan"
              onClick={() => {
                sound.playTap();
                setActiveView('floor');
              }}
              className="bg-linear-to-b from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white px-2.5 py-1.5 rounded-lg border border-blue-500/50 flex items-center gap-1.5 text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4 text-sky-300" />
              <span className="hidden md:inline">Mapa del Salón</span>
            </button>

            {/* Ventas Pendientes */}
            <button
              id="btn-pos-pending-sales"
              onClick={() => {
                sound.playTap();
                setIsPendingSalesModalOpen(true);
              }}
              className="bg-[#24334a] hover:bg-[#2c3e5a] text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-600 flex items-center gap-1.5 text-xs font-bold shadow-sm active:scale-95 transition-all relative cursor-pointer"
            >
              <Paperclip className="w-4 h-4 text-slate-300" />
              <span className="hidden lg:inline">Ventas Pendientes</span>
              <span className="bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full font-mono shadow-xs">
                {tables.filter(t => t.status === 'occupied').length}
              </span>
            </button>

            {/* Cambiar Empleado */}
            <button
              id="btn-pos-change-waiter"
              onClick={() => {
                sound.playTap();
                setIsLoginModalOpen(true);
              }}
              className="bg-[#24334a] hover:bg-[#2c3e5a] text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-600 flex items-center gap-1.5 text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <User className="w-4 h-4 text-slate-300" />
              <span className="hidden lg:inline">Cambiar Empleado</span>
            </button>

            {/* Impresora Habilitada (Only for Authorized Users) */}
            {canPrintPrebill && (
              <button
                id="btn-pos-printer-toggle"
                onClick={() => {
                  sound.playTap();
                  setIsPrinterEnabled(prev => !prev);
                }}
                className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer ${
                  isPrinterEnabled
                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-900 border-amber-500 font-black'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <Printer className="w-4 h-4 text-slate-900" />
                <span className="hidden sm:inline">Impresora Habilitada</span>
              </button>
            )}

            {/* SALIR */}
            <button
              id="btn-pos-exit"
              onClick={() => {
                sound.playTap();
                logout();
              }}
              className="bg-linear-to-b from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white px-2.5 py-1.5 rounded-lg border border-blue-400 flex items-center gap-1.5 text-xs font-black shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Power className="w-4 h-4 text-sky-200" />
              <span>SALIR</span>
            </button>
          </div>
        </div>

        {/* Sub-bar: Orden de Cocina Radio Selectors (1, 2, 3, 4) */}
        <div className="flex items-center gap-4 mt-1.5 pt-1 border-t border-slate-700/60 text-xs">
          <span className="text-slate-400 font-semibold">Orden de cocina:</span>
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4].map(block => (
              <label
                key={block}
                className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white font-bold"
              >
                <input
                  type="radio"
                  name="kitchenOrderRadio"
                  checked={activeKitchenBlock === block}
                  onChange={() => {
                    sound.playTap();
                    setActiveKitchenBlock(block);
                  }}
                  className="accent-blue-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span>{block}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* MOBILE (< lg) CLEAR SECTION SWITCHER SO CATEGORIES & PRODUCTS ARE NEVER HIDDEN OR JUMBLED */}
      <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-2.5 py-2 flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => {
            sound.playTap();
            setMobilePosTab('catalog');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mobilePosTab === 'catalog'
              ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-400'
              : 'bg-slate-800 text-slate-300 border border-slate-700'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Categorías y Carta</span>
        </button>
        <button
          type="button"
          onClick={() => {
            sound.playTap();
            setMobilePosTab('ticket');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mobilePosTab === 'ticket'
              ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-300'
              : 'bg-slate-800 text-slate-300 border border-slate-700'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Comanda ({totalItemsCount}) • {formatMoney(activeSale.total)}</span>
        </button>
      </div>

      {/* 2. MAIN SPLIT VIEW */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* LEFT PANEL: TICKET CANVAS + KEYPAD + ACTIONS */}
        <div className={`${mobilePosTab === 'ticket' ? 'flex flex-1 overflow-y-auto' : 'hidden'} lg:flex lg:flex-none w-full lg:w-[460px] xl:w-[490px] flex-col border-r border-slate-700 bg-slate-900 shrink-0`}>
          
          {/* TICKET TABLE */}
          <div className="flex-1 overflow-y-auto bg-[#fffde7] text-slate-900 flex flex-col border-b border-slate-700 shadow-inner">
            
            {/* Header Columns */}
            <div className="bg-[#334155] text-white text-[10px] sm:text-[11px] font-mono font-bold grid grid-cols-[24px_22px_1fr_65px_36px_40px_65px_22px_22px_18px_24px] items-center p-1 border-b border-slate-600 shrink-0">
              <span className="text-center">X</span>
              <span className="text-center">#</span>
              <span className="pl-1 truncate">Producto</span>
              <span className="text-right pr-1">Precio</span>
              <span className="text-center">Dto%</span>
              <span className="text-center">Cant</span>
              <span className="text-right pr-1">Total</span>
              <span className="text-center">Opc</span>
              <span className="text-center">Obs</span>
              <span className="text-center">C</span>
              <span className="text-center">↕</span>
            </div>

            {/* Ticket Line Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-amber-200/80 text-[11px] font-mono">
              {activeSale.items.length === 0 ? (
                <div className="p-4 text-center text-slate-400 font-sans text-xs italic">
                  Comanda vacía. Seleccione productos de la derecha para agregar.
                </div>
              ) : (
                activeSale.items.map((line, idx) => {
                  const isSelected = selectedLineId === line.id || (!selectedLineId && idx === activeSale.items.length - 1);

                  return (
                    <div
                      key={line.id}
                      onClick={() => setSelectedLineId(line.id)}
                      className={`grid grid-cols-[24px_22px_1fr_65px_36px_40px_65px_22px_22px_18px_24px] items-center p-1 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#bbdefb] text-blue-950 font-bold border-y border-blue-400'
                          : 'hover:bg-amber-100/80 text-slate-900'
                      }`}
                    >
                      {/* X Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playTap();
                          removeSaleLine(line.id);
                          if (selectedLineId === line.id) setSelectedLineId(null);
                        }}
                        className="w-5 h-5 rounded bg-blue-600 hover:bg-rose-600 text-white flex items-center justify-center shadow-xs mx-auto cursor-pointer"
                        title="Eliminar línea"
                      >
                        <Scissors className="w-3 h-3 rotate-90" />
                      </button>

                      {/* Line Number */}
                      <span className="text-center font-bold">{idx + 1}</span>

                      {/* Product Name */}
                      <div className="pl-1 font-sans font-bold text-xs pr-1" title={line.productName}>
                        <div className="flex items-center gap-1">
                          <span className="font-extrabold text-slate-900 leading-tight break-words">{line.productName}</span>
                          {(line.sentByWaiterName || line.waiterName) && (
                            <span className="text-[9px] bg-slate-800/10 text-slate-700 px-1 py-0.2 rounded font-mono font-bold shrink-0">
                              👤 {(line.sentByWaiterName || line.waiterName)?.split(' ')[0]}
                            </span>
                          )}
                        </div>
                        {line.selectedOption && (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {line.selectedOption.split(',').map((opt, oIdx) => (
                              <span key={oIdx} className="text-[9px] font-black px-1 py-0.2 rounded bg-amber-200 text-amber-900 border border-amber-300">
                                ✨ {opt.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                        {line.kitchenNotes && (
                          <span className="block text-[10px] text-amber-800 font-normal italic font-mono truncate">
                            Obs: {line.kitchenNotes}
                          </span>
                        )}
                      </div>

                      {/* Unit Price */}
                      <span className="text-right pr-1 font-bold">
                        {formatCLP(line.unitPrice, currency, { showSymbol: false })}
                      </span>

                      {/* Discount % */}
                      <span className="text-center text-rose-700 font-bold">
                        {line.discount > 0 ? `${line.discount}%` : ''}
                      </span>

                      {/* Quantity */}
                      <span className="text-center font-black bg-white/70 rounded px-0.5 border border-slate-300">
                        {line.quantity}
                      </span>

                      {/* Line Total */}
                      <span className="text-right pr-1 font-black text-slate-950">
                        {formatCLP(line.total, currency, { showSymbol: false })}
                      </span>

                      {/* Option button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenOptionsModal(line.id);
                        }}
                        className={`w-5 h-5 rounded text-[10px] font-black flex items-center justify-center mx-auto transition-colors cursor-pointer ${
                          line.selectedOption
                            ? 'bg-amber-400 text-slate-950 shadow-xs'
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                        }`}
                        title="Configurar opciones"
                      >
                        {line.selectedOption ? '★' : 'O'}
                      </button>

                      {/* Observation button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playTap();
                          setSelectedLineId(line.id);
                          setNoteInput(line.kitchenNotes || '');
                          setIsNotesModalOpen(true);
                        }}
                        className={`w-5 h-5 rounded text-[10px] font-black flex items-center justify-center mx-auto transition-colors cursor-pointer ${
                          line.kitchenNotes
                            ? 'bg-sky-400 text-slate-950 shadow-xs'
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                        }`}
                        title="Observaciones"
                      >
                        N
                      </button>

                      {/* Course Block */}
                      <span className="text-center font-mono font-black text-[10px] text-blue-800 bg-blue-100 rounded">
                        {line.courseBlock || 1}
                      </span>

                      {/* Line Up / Down */}
                      <div className="flex flex-col items-center justify-center text-[8px] leading-none">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLineMove(line.id, 'up');
                          }}
                          className="text-slate-500 hover:text-slate-900 leading-none"
                          title="Subir"
                        >
                          ▲
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLineMove(line.id, 'down');
                          }}
                          className="text-slate-500 hover:text-slate-900 leading-none"
                          title="Bajar"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Total Banner across bottom of ticket */}
            <div className="bg-black text-white px-4 py-2 flex items-center justify-between border-t-2 border-slate-800 shrink-0">
              <span className="text-xs font-mono font-bold text-slate-400">TOTAL COMANDA:</span>
              <div className="font-mono text-2xl font-black tracking-tight text-white flex items-center gap-1">
                <span>{formatMoney(activeSale.total)}</span>
              </div>
            </div>
          </div>

          {/* BOTTOM LEFT CONTROLS: SUBTABS + KEYPAD + ACTIONS */}
          <div className="bg-[#1e293b] p-2 border-t border-slate-700 space-y-2 shrink-0">
            
            {/* Sub-tabs: Calculadora Opciones & ★ + Opc. */}
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 bg-linear-to-b from-[#e2ecf5] to-[#c5dcee] text-slate-900 font-black text-xs rounded-t-lg border-t-2 border-x-2 border-[#8baecb] shadow-xs flex items-center gap-1.5"
              >
                <span>Calculadora Opciones</span>
              </button>
              <button
                onClick={() => {
                  sound.playTap();
                  if (!canApplyDiscount) {
                    alert('Acción restringida: Solamente usuarios con permisos autorizados pueden gestionar promociones.');
                    return;
                  }
                  setIsCouponModalOpen(true);
                }}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-t-lg border-t border-x border-slate-600 flex items-center gap-1 cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span>+ Opc.</span>
              </button>
            </div>

            {/* Keypad & Action Buttons Row */}
            <div className="flex gap-2">
              
              {/* Left Keypad Block */}
              <div className="w-44 bg-[#0f172a] p-1.5 rounded-xl border border-slate-700 space-y-1 shrink-0">
                <div className="flex items-center gap-1">
                  <button
                    id="btn-keypad-minus"
                    onClick={handleKeypadMinus}
                    className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-black text-base border border-slate-600 flex items-center justify-center active:scale-95 cursor-pointer"
                    title="Restar cantidad"
                  >
                    -
                  </button>
                  <div className="flex-1 bg-black border border-slate-700 rounded-lg px-2 h-8 flex items-center justify-between text-xs font-mono font-bold text-emerald-400">
                    <span className="text-slate-500 font-sans text-[10px]">Cant:</span>
                    <span>{keypadBuffer}</span>
                  </div>
                </div>

                {/* 3x4 Grid */}
                <div className="grid grid-cols-3 gap-1">
                  {['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', ',', 'C'].map((k) => {
                    const isClear = k === 'C';
                    const isComma = k === ',';

                    return (
                      <button
                        key={k}
                        id={`pos-pad-${k}`}
                        onClick={() => {
                          if (isClear) handleKeypadClear();
                          else if (isComma) handleKeypadComma();
                          else handleKeypadDigit(k);
                        }}
                        className={`h-8 rounded-lg font-black text-sm border shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer ${
                          isClear
                            ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border-rose-800'
                            : 'bg-linear-to-b from-[#eef4f9] to-[#d8e6f1] hover:from-white hover:to-[#c8ddec] text-slate-900 border-slate-300'
                        }`}
                      >
                        {k}
                      </button>
                    );
                  })}
                </div>

                {/* F6 Barcode button */}
                <button
                  onClick={() => setTerminalTab(prev => prev === 'touch' ? 'barcode' : 'touch')}
                  className="w-full h-7 rounded-lg bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-1 shadow-sm active:scale-95 cursor-pointer"
                >
                  <Barcode className="w-3.5 h-3.5" />
                  <span>F6 Código</span>
                </button>
              </div>

              {/* Right Action Buttons Grid */}
              <div className="flex-1 grid grid-cols-2 gap-1.5">
                {/* Dejar Pendiente */}
                <button
                  id="btn-action-park"
                  onClick={() => {
                    sound.playTap();
                    parkSale();
                  }}
                  className="bg-linear-to-b from-[#e8f1f8] to-[#c7ddec] hover:from-[#dbeaf5] hover:to-[#b6d2e6] border border-[#8baecb] text-slate-900 rounded-xl p-1.5 flex flex-col items-center justify-center text-center gap-1 shadow-xs active:scale-95 cursor-pointer"
                >
                  <Clock className="w-4 h-4 text-blue-700" />
                  <span className="text-[11px] font-black leading-tight">Dejar Pendiente</span>
                </button>

                {/* Asignar a Cliente */}
                <button
                  id="btn-action-client"
                  onClick={() => {
                    sound.playTap();
                    setIsClientModalOpen(true);
                  }}
                  className="bg-linear-to-b from-[#e8f1f8] to-[#c7ddec] hover:from-[#dbeaf5] hover:to-[#b6d2e6] border border-[#8baecb] text-slate-900 rounded-xl p-1.5 flex flex-col items-center justify-center text-center gap-1 shadow-xs active:scale-95 cursor-pointer"
                >
                  <User className="w-4 h-4 text-blue-700" />
                  <span className="text-[11px] font-black leading-tight truncate max-w-full px-1">
                    {activeSale.customerName ? activeSale.customerName.split(' ')[0] : 'Asignar a Cliente'}
                  </span>
                </button>

                {/* Asignar a Mesa */}
                <button
                  id="btn-action-table"
                  onClick={() => {
                    sound.playTap();
                    if (!canTransfer) {
                      alert('No cuenta con privilegios para traspasar mesas. Solicite autorización a su encargado.');
                      return;
                    }
                    setIsTransferModalOpen(true);
                  }}
                  className="bg-linear-to-b from-[#e8f1f8] to-[#c7ddec] hover:from-[#dbeaf5] hover:to-[#b6d2e6] border border-[#8baecb] text-slate-900 rounded-xl p-1.5 flex flex-col items-center justify-center text-center gap-1 shadow-xs active:scale-95 cursor-pointer"
                >
                  <ArrowRightLeft className="w-4 h-4 text-blue-700" />
                  <span className="text-[11px] font-black leading-tight">Asignar a Mesa</span>
                </button>

                {/* Añadir Observaciones */}
                <button
                  id="btn-action-obs"
                  onClick={() => {
                    sound.playTap();
                    if (selectedLineId) {
                      const line = activeSale.items.find(i => i.id === selectedLineId);
                      setNoteInput(line?.kitchenNotes || '');
                    }
                    setIsNotesModalOpen(true);
                  }}
                  className="bg-linear-to-b from-[#e8f1f8] to-[#c7ddec] hover:from-[#dbeaf5] hover:to-[#b6d2e6] border border-[#8baecb] text-slate-900 rounded-xl p-1.5 flex flex-col items-center justify-center text-center gap-1 shadow-xs active:scale-95 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-blue-700" />
                  <span className="text-[11px] font-black leading-tight">Añadir Observaciones</span>
                </button>

                {/* Enviar orden a Cocina */}
                <button
                  id="btn-action-kitchen"
                  onClick={handleSendToKitchen}
                  className="bg-linear-to-b from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 border border-amber-600 text-white rounded-xl p-1.5 flex flex-col items-center justify-center text-center gap-1 shadow-md active:scale-95 cursor-pointer"
                >
                  <ChefHat className="w-4 h-4" />
                  <span className="text-[11px] font-black leading-tight">Enviar orden Cocina</span>
                </button>

                {/* Insertar Cupón Promocional */}
                <button
                  id="btn-action-coupon"
                  onClick={() => {
                    sound.playTap();
                    if (!canApplyDiscount) {
                      alert('No cuenta con privilegios para aplicar descuentos o cupones. Función reservada a Cajera y Administrador.');
                      return;
                    }
                    setIsCouponModalOpen(true);
                  }}
                  className="bg-linear-to-b from-[#e8f1f8] to-[#c7ddec] hover:from-[#dbeaf5] hover:to-[#b6d2e6] border border-[#8baecb] text-slate-900 rounded-xl p-1.5 flex flex-col items-center justify-center text-center gap-1 shadow-xs active:scale-95 cursor-pointer"
                >
                  <Percent className="w-4 h-4 text-blue-700" />
                  <span className="text-[11px] font-black leading-tight">Insertar Cupón</span>
                </button>
              </div>
            </div>

            {/* Bottom Final Checkout Button */}
            {canCharge ? (
              <button
                id="btn-pos-checkout"
                onClick={() => {
                  sound.playTap();
                  setIsPaymentModalOpen(true);
                }}
                disabled={activeSale.items.length === 0}
                className={`w-full py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                  activeSale.items.length > 0
                    ? 'bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-600/30 active:scale-98'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>COBRAR COMANDA ({formatMoney(activeSale.total)})</span>
              </button>
            ) : (
              <div className="p-2 bg-slate-800/80 border border-slate-700 rounded-xl text-center text-xs text-slate-400 font-bold">
                🔒 El cobro final debe ser realizado en la Estación de Caja.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: CATEGORIES & PRODUCT GRID */}
        <div className={`${mobilePosTab === 'catalog' ? 'flex' : 'hidden'} lg:flex flex-1 flex-col bg-[#0f172a] overflow-hidden`}>
          
          {/* Top Tabs */}
          <div className="bg-[#1e293b] border-b border-slate-700 px-3 py-1.5 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTerminalTab('touch')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  terminalTab === 'touch'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Terminal Táctil</span>
                <span className="sm:hidden">Carta</span>
              </button>

              <button
                onClick={() => setTerminalTab('barcode')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  terminalTab === 'barcode'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Barcode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Código de Barras / Manual</span>
                <span className="sm:hidden">Código</span>
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative flex-1 max-w-[240px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* CATEGORIES GRID (Responsive: clean horizontal scroll strip on mobile, multi-column grid on desktop) */}
          <div className="bg-[#1e293b] p-2 border-b border-slate-700 shrink-0 space-y-1.5">
            <div className="flex items-center justify-between px-1 lg:hidden">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Categorías ({categories.length})
              </span>
              <span className="text-[11px] font-bold text-amber-300">
                {categories.find(c => c.id === selectedCategoryId)?.name || 'Todas'}
              </span>
            </div>

            {/* Mobile horizontal strip */}
            <div className="flex lg:hidden items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
              {categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id && !searchQuery;
                const count = products.filter(p => p.categoryId === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      sound.playTap();
                      setSelectedCategoryId(cat.id);
                      setProductPage(0);
                      setSearchQuery('');
                    }}
                    className={`shrink-0 px-3 py-2 rounded-xl border flex items-center gap-2 text-xs transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-[#fef08a] border-amber-400 text-slate-900 font-black shadow-md ring-2 ring-amber-400'
                        : 'bg-[#24334a] text-slate-200 border-slate-600 font-bold'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-[10px] px-1.5 rounded-md font-mono ${
                      isSelected ? 'bg-amber-300 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Desktop rich tile grid */}
            <div className="hidden lg:flex items-center gap-1.5">
              <div className="flex-1 grid grid-cols-6 xl:grid-cols-9 gap-1.5">
                {currentCategories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id && !searchQuery;
                  const isFavorites = cat.id === 100 || cat.name === 'FAVORITOS';

                  return (
                    <button
                      key={cat.id}
                      id={`cat-btn-${cat.id}`}
                      onClick={() => {
                        sound.playTap();
                        setSelectedCategoryId(cat.id);
                        setProductPage(0);
                        setSearchQuery('');
                      }}
                      className={`h-16 rounded-xl border flex flex-col items-center justify-between p-1 overflow-hidden transition-all text-center relative group active:scale-95 cursor-pointer ${
                        isSelected
                          ? 'bg-[#fef08a] border-amber-400 text-slate-900 font-black shadow-md ring-2 ring-amber-400 scale-[1.02]'
                          : 'bg-[#24334a] hover:bg-[#2c3e5a] border-slate-600 text-slate-200'
                      }`}
                    >
                      <div className="w-full h-8 rounded-lg overflow-hidden flex items-center justify-center bg-slate-800">
                        {isFavorites ? (
                          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                        ) : cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Utensils className="w-4 h-4 text-slate-400" />
                        )}
                      </div>

                      <span className="text-[10px] leading-tight font-bold line-clamp-1 w-full">
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {totalCategoryPages > 1 && (
                <button
                  onClick={() => {
                    sound.playTap();
                    setCategoryPage(prev => (prev + 1) % totalCategoryPages);
                  }}
                  className="w-10 h-16 rounded-xl bg-linear-to-tr from-blue-700 via-blue-500 to-sky-400 border-2 border-white shadow-md flex items-center justify-center text-white shrink-0 active:scale-95 cursor-pointer"
                  title="Más categorías"
                >
                  <ChevronRight className="w-6 h-6 stroke-[3]" />
                </button>
              )}
            </div>
          </div>

          {/* PRODUCTS GRID */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 flex flex-col justify-between">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-2">
              {currentProducts.map((prod) => {
                const isOutOfStock = prod.stock <= 0;

                return (
                  <button
                    key={prod.id}
                    id={`btn-prod-${prod.id}`}
                    disabled={isOutOfStock}
                    onClick={() => handleProductClick(prod)}
                    className={`h-16 sm:h-20 rounded-xl p-2 flex flex-col items-center justify-center text-center border-2 transition-all shadow-sm group active:scale-95 cursor-pointer ${
                      isOutOfStock
                        ? 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                        : 'bg-white hover:bg-slate-50 active:bg-blue-100 border-slate-200 hover:border-blue-400 text-slate-900 font-bold shadow-md hover:shadow-lg'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-extrabold line-clamp-2 leading-tight text-slate-900 group-hover:text-blue-600">
                      {prod.name}
                    </span>
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                      <span className="text-[11px] font-mono font-bold text-slate-600">
                        {formatMoney(prod.price)}
                      </span>
                      {prod.options && prod.options.length > 0 && (
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                          Opciones
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 shrink-0">
              <button
                disabled={productPage === 0}
                onClick={() => {
                  sound.playTap();
                  setProductPage(prev => Math.max(0, prev - 1));
                }}
                className={`w-10 h-10 rounded-full border-2 border-white shadow-md flex items-center justify-center transition-all ${
                  productPage === 0
                    ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'
                    : 'bg-linear-to-tr from-blue-700 via-blue-500 to-sky-400 text-white active:scale-95 cursor-pointer'
                }`}
              >
                <ChevronLeft className="w-6 h-6 stroke-[3]" />
              </button>

              <span className="text-xs font-mono font-bold text-slate-400">
                Página {productPage + 1} de {totalProductPages}
              </span>

              <button
                disabled={productPage >= totalProductPages - 1}
                onClick={() => {
                  sound.playTap();
                  setProductPage(prev => Math.min(totalProductPages - 1, prev + 1));
                }}
                className={`w-10 h-10 rounded-full border-2 border-white shadow-md flex items-center justify-center transition-all ${
                  productPage >= totalProductPages - 1
                    ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'
                    : 'bg-linear-to-tr from-blue-700 via-blue-500 to-sky-400 text-white active:scale-95 cursor-pointer'
                }`}
              >
                <ChevronRight className="w-6 h-6 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AUXILIARY MODALS */}

      {/* Notes / Observaciones Modal */}
      {isNotesModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className={`border rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 ${
            isLight ? 'bg-white border-slate-300 text-slate-900 shadow-slate-900/20' : 'bg-slate-900 border-slate-700 text-white shadow-black/80'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className={`font-black text-sm sm:text-base flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                Observaciones de Cocina
              </h3>
              <button
                onClick={() => setIsNotesModalOpen(false)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                ✕
              </button>
            </div>
            
            <div>
              <label className={`text-xs font-black block mb-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                Instrucciones para la comanda:
              </label>
              <textarea
                rows={3}
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Ej: Sin cebolla, muy hecho, salsa aparte..."
                className={`w-full border-2 rounded-xl p-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                }`}
              />
            </div>

            {/* Quick Suggestions */}
            <div>
              <span className={`text-[11px] font-bold block mb-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Sugerencias rápidas:</span>
              <div className="flex flex-wrap gap-1.5">
                {['Sin cebolla', 'Poco hecho', 'Al punto', 'Muy hecho', 'Sin sal', 'Salsa aparte', 'Urgente'].map(s => (
                  <button
                    key={s}
                    onClick={() => setNoteInput(prev => prev ? `${prev}, ${s}` : s)}
                    className={`px-2.5 py-1.5 text-[11px] rounded-lg border font-black transition-colors active:scale-95 cursor-pointer ${
                      isLight ? 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-900' : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className={`flex gap-2 justify-end pt-3 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <button
                onClick={() => setIsNotesModalOpen(false)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleApplyObservation}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-md active:scale-95 cursor-pointer"
              >
                Guardar Observación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Table Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className={`border rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 ${
            isLight ? 'bg-white border-slate-300 text-slate-900 shadow-slate-900/20' : 'bg-slate-900 border-slate-700 text-white shadow-black/80'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className={`font-black text-sm sm:text-base flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <ArrowRightLeft className="w-5 h-5 text-indigo-500" />
                Traspasar Comanda a otra Mesa
              </h3>
              <button
                onClick={() => {
                  setIsTransferModalOpen(false);
                  setTransferTargetId(null);
                }}
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                ✕
              </button>
            </div>

            <p className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Seleccione la mesa de destino para traspasar esta comanda:
            </p>

            <div className="grid grid-cols-4 gap-2 max-h-56 overflow-y-auto p-1">
              {tables.filter(t => t.id !== (activeSale.tableNumber ? parseInt(activeSale.tableNumber) : -1)).map(tbl => (
                <button
                  key={tbl.id}
                  onClick={() => setTransferTargetId(tbl.id)}
                  className={`p-2.5 rounded-xl border-2 text-center transition-all active:scale-95 cursor-pointer ${
                    transferTargetId === tbl.id
                      ? 'bg-indigo-600 text-white border-indigo-400 font-black shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-300'
                      : tbl.status === 'free'
                      ? isLight
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-200 border-emerald-700'
                      : isLight
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-900 border-rose-300'
                      : 'bg-rose-950/60 hover:bg-rose-900 text-rose-200 border-rose-700'
                  }`}
                >
                  <span className="text-xs font-black block">{tbl.name}</span>
                  <span className="text-[10px] font-bold opacity-90 block">
                    {tbl.status === 'free' ? 'Libre' : 'Ocupada'}
                  </span>
                </button>
              ))}
            </div>

            <div className={`flex gap-2 justify-end pt-3 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <button
                onClick={() => {
                  setIsTransferModalOpen(false);
                  setTransferTargetId(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Cancelar
              </button>
              <button
                disabled={!transferTargetId}
                onClick={() => {
                  if (transferTargetId) {
                    transferTable(transferTargetId);
                    setIsTransferModalOpen(false);
                    setTransferTargetId(null);
                  }
                }}
                className={`px-5 py-2 rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer ${
                  transferTargetId
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                }`}
              >
                Traspasar Mesa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promotional Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className={`border rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 ${
            isLight ? 'bg-white border-slate-300 text-slate-900 shadow-slate-900/20' : 'bg-slate-900 border-slate-700 text-white shadow-black/80'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className={`font-black text-sm sm:text-base flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Tag className="w-5 h-5 text-amber-500" />
                Cupón Promocional
              </h3>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                ✕
              </button>
            </div>

            <div>
              <label className={`text-xs font-black block mb-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                Ingrese código de cupón:
              </label>
              <input
                type="text"
                placeholder="Código cupón (ej: PROMO10)..."
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className={`w-full border-2 rounded-xl p-3 text-sm uppercase font-mono font-black focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-slate-950 border-slate-700 text-amber-300 placeholder-slate-500'
                }`}
              />
            </div>

            <div className={`flex gap-2 justify-end pt-3 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleApplyCoupon}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md active:scale-95 cursor-pointer"
              >
                Aplicar (-10%)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ventas Pendientes List Modal */}
      {isPendingSalesModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className={`border rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 ${
            isLight ? 'bg-white border-slate-300 text-slate-900 shadow-slate-900/20' : 'bg-slate-900 border-slate-700 text-white shadow-black/80'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className={`font-black text-sm sm:text-base flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Paperclip className="w-5 h-5 text-indigo-500" />
                Ventas Pendientes ({tables.filter(t => t.status === 'occupied').length})
              </h3>
              <button
                onClick={() => setIsPendingSalesModalOpen(false)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                ✕
              </button>
            </div>
            
            <div className={`divide-y max-h-72 overflow-y-auto rounded-xl border ${
              isLight ? 'divide-slate-200 border-slate-200 bg-slate-50' : 'divide-slate-800 border-slate-800 bg-slate-950'
            }`}>
              {tables.filter(t => t.status === 'occupied').length === 0 ? (
                <div className="p-6 text-center text-xs font-bold text-slate-400">
                  No hay ventas pendientes abiertas en este momento
                </div>
              ) : (
                tables.filter(t => t.status === 'occupied').map(t => (
                  <div
                    key={t.id}
                    onClick={() => {
                      sound.playTap();
                      setIsPendingSalesModalOpen(false);
                    }}
                    className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                      isLight ? 'hover:bg-indigo-50/70' : 'hover:bg-slate-800/80'
                    }`}
                  >
                    <div>
                      <span className={`font-black text-xs block ${isLight ? 'text-slate-900' : 'text-white'}`}>{t.name}</span>
                      <span className={`text-[11px] font-mono font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Abierta a las {t.openedAt || '14:00'} • {t.diners || 2} comensales
                      </span>
                    </div>
                    <span className="font-mono font-black text-amber-500 text-sm">
                      {formatMoney(t.total || 0)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Opciones & Modificadores de Cocina (Desktop) */}
      <ProductOptionsModal
        isOpen={isOptionsModalOpen}
        onClose={() => {
          setIsOptionsModalOpen(false);
          setPendingAddQty(null);
        }}
        productName={optionsProductName}
        product={optionsTargetProduct}
        confirmLabel={pendingAddQty ? 'Agregar a Comanda' : 'Aplicar Opciones'}
        initialSelectedOptions={optionsInitialSelected}
        initialKitchenNotes={optionsInitialNotes}
        onApply={handleApplyOptions}
        isLight={isLight}
      />

      {/* Modal: Asignar Cliente a Comanda */}
      {isClientModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className={`border rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl ${
            isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-sm sm:text-base flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                Asignar Cliente a Comanda
              </h3>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={clientSearchQuery}
                onChange={e => setClientSearchQuery(e.target.value)}
                placeholder="Buscar cliente por nombre, teléfono o RUT..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800">
              {clients
                .filter(c =>
                  !clientSearchQuery.trim() ||
                  c.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
                  (c.phone || '').includes(clientSearchQuery) ||
                  (c.taxId || '').toLowerCase().includes(clientSearchQuery.toLowerCase())
                )
                .map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      assignClientToActiveSale(c);
                      setIsClientModalOpen(false);
                    }}
                    className="w-full p-3 text-left flex items-center justify-between hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-black">{c.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {c.phone || 'Sin teléfono'} {c.taxId ? `• ${c.taxId}` : ''}
                      </div>
                    </div>
                    {activeSale.customerId === c.id && (
                      <Check className="w-4 h-4 text-emerald-500" />
                    )}
                  </button>
                ))}
            </div>

            <div className="flex justify-between gap-2 pt-2">
              {activeSale.customerId && (
                <button
                  type="button"
                  onClick={() => {
                    assignClientToActiveSale(null);
                    setIsClientModalOpen(false);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                >
                  Quitar Cliente
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsClientModalOpen(false)}
                className="ml-auto px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
