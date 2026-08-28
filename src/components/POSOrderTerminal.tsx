import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Product, ProductOption, SaleLine } from '../types';
import {
  Home, Paperclip, User, Printer, Power, Star, ChevronLeft, ChevronRight,
  Plus, Minus, Trash2, Scissors, ChefHat, Tag, Percent, MessageSquare,
  Search, Barcode, Grid, CreditCard, ArrowRightLeft, Clock, ShoppingBag,
  Check, AlertTriangle, ArrowUp, ArrowDown, HelpCircle, Utensils
} from 'lucide-react';
import { sound } from '../utils/sound';
import { hasUserPermission } from '../utils/permissions';

export const POSOrderTerminal: React.FC = () => {
  const {
    t, activeSale, setActiveSale, categories, products, rates, selectedRateId,
    setSelectedRateId, addItemToActiveSale, updateSaleLine, removeSaleLine,
    sendActiveSaleToKitchen, transferTable, parkSale, cancelActiveSale,
    tables, setIsPaymentModalOpen, setPrintableTicket, setActiveView,
    waiter, setIsLoginModalOpen, logout, themeMode
  } = usePOS();

  // State for active category & page
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(categories[0]?.id || 1);
  const [productPage, setProductPage] = useState<number>(0);
  const [categoryPage, setCategoryPage] = useState<number>(0);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);

  // Kitchen block selector for new items (1, 2, 3, 4)
  const [activeKitchenBlock, setActiveKitchenBlock] = useState<number>(1);

  // Printer enabled state
  const [isPrinterEnabled, setIsPrinterEnabled] = useState<boolean>(true);

  // Mode: Touch Terminal vs Barcode / Manual
  const [terminalTab, setTerminalTab] = useState<'touch' | 'barcode'>('touch');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Keypad quantity buffer
  const [keypadBuffer, setKeypadBuffer] = useState<string>('1');

  const isLight = themeMode === 'vibrant-light';

  // Modals state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [transferTargetId, setTransferTargetId] = useState<number | null>(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState<boolean>(false);
  const [noteInput, setNoteInput] = useState<string>('');
  const [isCouponModalOpen, setIsCouponModalOpen] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState<string>('');
  const [isPendingSalesModalOpen, setIsPendingSalesModalOpen] = useState<boolean>(false);

  if (!activeSale) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 select-none bg-slate-900 text-slate-400">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4 bg-slate-800 border border-slate-700 text-amber-400 shadow-xl">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Ninguna comanda activa</h2>
        <p className="text-xs text-center max-w-sm mb-5 text-slate-400">
          Seleccione una mesa en el plano del salón para abrir o crear una comanda.
        </p>
        <button
          onClick={() => setActiveView('floor')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-2"
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

  const PRODUCTS_PER_PAGE = 24;
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

  const handleProductClick = (product: Product) => {
    sound.playTap();
    const qty = parseFloat(keypadBuffer) || 1;
    addItemToActiveSale(product, qty, undefined, undefined, activeKitchenBlock);
    setKeypadBuffer('1');
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
    // update line numbering
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
    // 10% discount on all items
    const discountedItems = activeSale.items.map(item => ({
      ...item,
      discount: 10,
      total: Math.round(item.unitPrice * item.quantity * 0.9 * 100) / 100,
    }));
    const newTotal = discountedItems.reduce((sum, it) => sum + it.total, 0);
    setActiveSale({
      ...activeSale,
      items: discountedItems,
      total: newTotal,
      subtotal: Math.round((newTotal / 1.1) * 100) / 100,
      taxTotal: Math.round((newTotal - newTotal / 1.1) * 100) / 100,
    });
    setIsCouponModalOpen(false);
    setCouponCode('');
  };

  const handleApplyObservation = () => {
    if (selectedLineId && noteInput.trim()) {
      sound.playTap();
      updateSaleLine(selectedLineId, {
        kitchenNotes: noteInput.trim(),
      });
      setNoteInput('');
      setIsNotesModalOpen(false);
    }
  };

  // Format currency helper
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 2,
    }).format(amount).replace('CLP', '$');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none bg-[#0f172a] text-slate-100 font-sans">
      
      {/* =========================================================================
          1. TOP SYSME HEADER BAR (Exact 3-Row Grid + Top Action Buttons + Course Radio)
      ========================================================================= */}
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
              <span className="text-slate-400 font-normal">Cliente:</span> <span className="text-white">1</span>
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
              className="bg-linear-to-b from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white px-2.5 py-1.5 rounded-lg border border-blue-500/50 flex items-center gap-1.5 text-xs font-bold shadow-md active:scale-95 transition-all"
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
              className="bg-[#24334a] hover:bg-[#2c3e5a] text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-600 flex items-center gap-1.5 text-xs font-bold shadow-sm active:scale-95 transition-all relative"
            >
              <Paperclip className="w-4 h-4 text-slate-300" />
              <span className="hidden lg:inline">Ventas Pendientes</span>
              <span className="bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full font-mono shadow-xs">
                15
              </span>
            </button>

            {/* Cambiar Empleado */}
            <button
              id="btn-pos-change-waiter"
              onClick={() => {
                sound.playTap();
                setIsLoginModalOpen(true);
              }}
              className="bg-[#24334a] hover:bg-[#2c3e5a] text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-600 flex items-center gap-1.5 text-xs font-bold shadow-sm active:scale-95 transition-all"
            >
              <User className="w-4 h-4 text-slate-300" />
              <span className="hidden lg:inline">Cambiar Empleado</span>
            </button>

            {/* Impresora Habilitada */}
            <button
              id="btn-pos-printer-toggle"
              onClick={() => {
                sound.playTap();
                setIsPrinterEnabled(prev => !prev);
              }}
              className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-bold shadow-sm active:scale-95 transition-all ${
                isPrinterEnabled
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-900 border-amber-500 font-black'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Printer className="w-4 h-4 text-slate-900" />
              <span className="hidden sm:inline">Impresora Habilitada</span>
            </button>

            {/* SALIR */}
            <button
              id="btn-pos-exit"
              onClick={() => {
                sound.playTap();
                logout();
              }}
              className="bg-linear-to-b from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white px-2.5 py-1.5 rounded-lg border border-blue-400 flex items-center gap-1.5 text-xs font-black shadow-md active:scale-95 transition-all"
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

      {/* =========================================================================
          2. MAIN SPLIT VIEW (Left Ticket Stream + Right Category & Products)
      ========================================================================= */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* =====================================================================
            LEFT PANEL: YELLOW TICKET CANVAS + KEYPAD + ACTIONS
        ===================================================================== */}
        <div className="w-full lg:w-[460px] xl:w-[490px] flex flex-col border-r border-slate-700 bg-slate-900 shrink-0">
          
          {/* TICKET TABLE (Yellow Background Canvas #ffff99 / #fef08a) */}
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
                        className="w-5 h-5 rounded bg-blue-600 hover:bg-rose-600 text-white flex items-center justify-center shadow-xs mx-auto"
                        title="Eliminar línea"
                      >
                        <Scissors className="w-3 h-3 rotate-90" />
                      </button>

                      {/* Line Number */}
                      <span className="text-center font-bold">{idx + 1}</span>

                      {/* Product Name */}
                      <div className="pl-1 truncate font-sans font-bold text-xs" title={line.productName}>
                        <div className="truncate flex items-center gap-1">
                          <span>{line.productName}</span>
                          {(line.sentByWaiterName || line.waiterName) && (
                            <span className="text-[9px] bg-slate-800/10 text-slate-700 px-1 py-0.2 rounded font-mono font-bold shrink-0">
                              👤 {(line.sentByWaiterName || line.waiterName)?.split(' ')[0]}
                            </span>
                          )}
                        </div>
                        {line.kitchenNotes && (
                          <span className="block text-[10px] text-amber-800 font-normal italic font-mono truncate">
                            Obs: {line.kitchenNotes}
                          </span>
                        )}
                      </div>

                      {/* Unit Price */}
                      <span className="text-right pr-1 font-bold">
                        {line.unitPrice.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>

                      {/* Discount % */}
                      <span className="text-center text-rose-700 font-bold">
                        {line.discount > 0 ? `${line.discount}%` : ''}
                      </span>

                      {/* Quantity */}
                      <span className="text-center font-black bg-white/70 rounded px-0.5 border border-slate-300">
                        {line.quantity.toFixed(3).replace('.', ',')}
                      </span>

                      {/* Line Total */}
                      <span className="text-right pr-1 font-black text-slate-950">
                        {line.total.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>

                      {/* Option button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playTap();
                          setSelectedLineId(line.id);
                        }}
                        className="w-4 h-4 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold flex items-center justify-center mx-auto"
                        title="Opciones"
                      >
                        {line.selectedOption ? '+' : 'v'}
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
                        className="w-4 h-4 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold flex items-center justify-center mx-auto"
                        title="Observaciones"
                      >
                        v
                      </button>

                      {/* Course Block (1, 2, 3) */}
                      <span className="text-center font-bold text-[10px] text-slate-700">
                        {line.kitchenBlock || 1}
                      </span>

                      {/* Move Line Up / Down */}
                      <div className="flex flex-col items-center justify-center gap-0.5">
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

            {/* Solid Black Total Banner across bottom of ticket */}
            <div className="bg-black text-white px-4 py-2 flex items-center justify-between border-t-2 border-slate-800 shrink-0">
              <span className="text-xs font-mono font-bold text-slate-400">TOTAL COMANDA:</span>
              <div className="font-mono text-2xl font-black tracking-tight text-white flex items-center gap-1">
                <span>{activeSale.total.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $</span>
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
                  setIsCouponModalOpen(true);
                }}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-t-lg border-t border-x border-slate-600 flex items-center gap-1"
              >
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span>+ Opc.</span>
              </button>
            </div>

            {/* Keypad & Action Buttons Row */}
            <div className="flex gap-2">
              
              {/* Left Keypad Block */}
              <div className="w-44 bg-[#0f172a] p-1.5 rounded-xl border border-slate-700 space-y-1 shrink-0">
                {/* Quantity input & Minus button */}
                <div className="flex items-center gap-1">
                  <button
                    id="btn-keypad-minus"
                    onClick={handleKeypadMinus}
                    className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-black text-base border border-slate-600 flex items-center justify-center active:scale-95"
                    title="Restar cantidad"
                  >
                    -
                  </button>
                  <div className="flex-1 bg-black border border-slate-700 rounded-lg px-2 h-8 flex items-center justify-between text-xs font-mono font-bold text-emerald-400">
                    <span className="text-slate-500 font-sans text-[10px]">Cant:</span>
                    <span>{keypadBuffer}</span>
                  </div>
                </div>

                {/* 3x4 Grid (7 8 9, 4 5 6, 1 2 3, 0 , C) */}
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
                        className={`h-8 rounded-lg font-black text-sm border shadow-xs transition-all active:scale-95 flex items-center justify-center ${
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
                  className="w-full h-7 rounded-lg bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-1 shadow-sm active:scale-95"
                >
                  <Barcode className="w-3.5 h-3.5" />
                  <span>F6 Código</span>
                </button>
              </div>

              {/* Right Action Buttons Grid (2 cols x 3 rows) */}
              <div className="flex-1 grid grid-cols-2 gap-1.5">
                {/* Dejar Pendiente */}
                <button
                  id="btn-action-park"
                  onClick={() => {
                    sound.playTap();
                    parkSale();
                  }}
                  className="bg-linear-to-b from-[#e8f1f8] to-[#c7ddec] hover:from-[#dbeaf5] hover:to-[#b6d2e6] border border-[#8baecb] text-slate-900 rounded-xl p-1.5 flex flex-col items-center justify-center text-center gap-1 shadow-xs active:scale-95"
                >
                  <Clock className="w-4 h-4 text-blue-700" />
                  <span className="text-[11px] font-black leading-tight">Dejar Pendiente</span>
                </button>

                {/* Asignar a Cliente */}
                <button
                  id="btn-action-client"
                  onClick={() => sound.playTap()}
                  className="bg-linear-to-b from-[#e8f1f8] to-[#c7ddec] hover:from-[#dbeaf5] hover:to-[#b6d2e6] border border-[#8baecb] text-slate-900 rounded-xl p-1.5 flex flex-col items-center justify-center text-center gap-1 shadow-xs active:scale-95"
                >
                  <User className="w-4 h-4 text-blue-700" />
                  <span className="text-[11px] font-black leading-tight">Asignar a Cliente</span>
                </button>

                {/* Asignar a Mesa */}
                <button
                  id="btn-action-table"
                  onClick={() => {
                    sound.playTap();
                    if (!hasUserPermission(waiter, 'canTransferTables')) {
                      alert('No cuenta con privilegios para traspasar mesas. Solicite autorización a su encargado.');
                      return;
                    }
                    setIsTransferModalOpen(true);
                  }}
                  className="bg-linear-to-b from-[#e8f1f8] to-[#c7ddec] hover:from-[#dbeaf5] hover:to-[#b6d2e6] border border-[#8baecb] text-slate-900 rounded-xl p-1.5 flex flex-col items-center justify-center text-center gap-1 shadow-xs active:scale-95"
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
                  className="bg-linear-to-b from-[#e8f1f8] to-[#c7ddec] hover:from-[#dbeaf5] hover:to-[#b6d2e6] border border-[#8baecb] text-slate-900 rounded-xl p-1.5 flex flex-col items-center justify-center text-center gap-1 shadow-xs active:scale-95"
                >
                  <MessageSquare className="w-4 h-4 text-blue-700" />
                  <span className="text-[11px] font-black leading-tight">Añadir Observaciones</span>
                </button>

                {/* Enviar orden a Cocina */}
                <button
                  id="btn-action-kitchen"
                  onClick={() => {
                    sound.playKitchenBell();
                    sendActiveSaleToKitchen();
                  }}
                  className="bg-linear-to-b from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 border border-amber-600 text-white rounded-xl p-1.5 flex flex-col items-center justify-center text-center gap-1 shadow-md active:scale-95"
                >
                  <ChefHat className="w-4 h-4" />
                  <span className="text-[11px] font-black leading-tight">Enviar orden Cocina</span>
                </button>

                {/* Insertar Cupón Promocional */}
                <button
                  id="btn-action-coupon"
                  onClick={() => {
                    sound.playTap();
                    if (!hasUserPermission(waiter, 'canApplyDiscounts')) {
                      alert('No cuenta con privilegios para aplicar descuentos o cupones. Función reservada a Cajera y Administrador.');
                      return;
                    }
                    setIsCouponModalOpen(true);
                  }}
                  className="bg-linear-to-b from-[#e8f1f8] to-[#c7ddec] hover:from-[#dbeaf5] hover:to-[#b6d2e6] border border-[#8baecb] text-slate-900 rounded-xl p-1.5 flex flex-col items-center justify-center text-center gap-1 shadow-xs active:scale-95"
                >
                  <Percent className="w-4 h-4 text-blue-700" />
                  <span className="text-[11px] font-black leading-tight">Insertar Cupón</span>
                </button>
              </div>
            </div>

            {/* Bottom Final Checkout Button */}
            <button
              id="btn-pos-checkout"
              onClick={() => {
                sound.playTap();
                setIsPaymentModalOpen(true);
              }}
              disabled={activeSale.items.length === 0}
              className={`w-full py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                activeSale.items.length > 0
                  ? 'bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-600/30 active:scale-98'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>COBRAR COMANDA ({activeSale.total.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $)</span>
            </button>
          </div>
        </div>

        {/* =====================================================================
            RIGHT PANEL: CATEGORIES & PRODUCT GRID
        ===================================================================== */}
        <div className="flex-1 flex flex-col bg-[#0f172a] overflow-hidden">
          
          {/* Top Tabs: Terminal Táctil vs Código de Barras / Manual */}
          <div className="bg-[#1e293b] border-b border-slate-700 px-3 py-1 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTerminalTab('touch')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
                  terminalTab === 'touch'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Terminal Táctil</span>
              </button>

              <button
                onClick={() => setTerminalTab('barcode')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
                  terminalTab === 'barcode'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Barcode className="w-3.5 h-3.5" />
                <span>Código de Barras / Manual</span>
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative w-48 sm:w-64">
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

          {/* CATEGORIES GRID (with images & star icon) */}
          <div className="bg-[#1e293b] p-2 border-b border-slate-700 shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="flex-1 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 xl:grid-cols-9 gap-1.5">
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
                      className={`h-16 rounded-xl border flex flex-col items-center justify-between p-1 overflow-hidden transition-all text-center relative group active:scale-95 ${
                        isSelected
                          ? 'bg-[#fef08a] border-amber-400 text-slate-900 font-black shadow-md ring-2 ring-amber-400 scale-[1.02]'
                          : 'bg-[#24334a] hover:bg-[#2c3e5a] border-slate-600 text-slate-200'
                      }`}
                    >
                      {/* Image or Star Thumbnail */}
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

                      {/* Category Title */}
                      <span className="text-[10px] leading-tight font-bold line-clamp-1 w-full">
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Next Category Page Arrow (Circular blue arrow) */}
              {totalCategoryPages > 1 && (
                <button
                  onClick={() => {
                    sound.playTap();
                    setCategoryPage(prev => (prev + 1) % totalCategoryPages);
                  }}
                  className="w-10 h-16 rounded-xl bg-linear-to-tr from-blue-700 via-blue-500 to-sky-400 border-2 border-white shadow-md flex items-center justify-center text-white shrink-0 active:scale-95"
                  title="Más categorías"
                >
                  <ChevronRight className="w-6 h-6 stroke-[3]" />
                </button>
              )}
            </div>
          </div>

          {/* PRODUCTS GRID (Clean White Buttons matching Screenshots 2 & 3) */}
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
                    className={`h-16 sm:h-20 rounded-xl p-2 flex flex-col items-center justify-center text-center border-2 transition-all shadow-sm group active:scale-95 ${
                      isOutOfStock
                        ? 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                        : 'bg-white hover:bg-slate-50 active:bg-blue-100 border-slate-200 hover:border-blue-400 text-slate-900 font-bold shadow-md hover:shadow-lg'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-extrabold line-clamp-2 leading-tight text-slate-900 group-hover:text-blue-600">
                      {prod.name}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-600 mt-1">
                      {prod.price.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Pagination Controls with Blue Circular Arrows (<) (>) */}
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
                    : 'bg-linear-to-tr from-blue-700 via-blue-500 to-sky-400 text-white active:scale-95'
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
                    : 'bg-linear-to-tr from-blue-700 via-blue-500 to-sky-400 text-white active:scale-95'
                }`}
              >
                <ChevronRight className="w-6 h-6 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. AUXILIARY MODALS (Observaciones, Asignar Mesa, Cupón, Ventas Pendientes)
      ========================================================================= */}

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
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
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
                    className={`px-2.5 py-1.5 text-[11px] rounded-lg border font-black transition-colors active:scale-95 ${
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
                className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleApplyObservation}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-md active:scale-95"
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
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
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
                  className={`p-2.5 rounded-xl border-2 text-center transition-all active:scale-95 ${
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
                className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${
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
                className={`px-5 py-2 rounded-xl text-xs font-black shadow-md transition-all active:scale-95 ${
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
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
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
                className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleApplyCoupon}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md active:scale-95"
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
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
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
                      {t.total?.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'} $
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
