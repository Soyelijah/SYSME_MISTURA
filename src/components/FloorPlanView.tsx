import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import { Table, TableStatus, Sale, Waiter } from '../types';
import { INITIAL_WAITERS } from '../data/mockData';
import { EmployeePasswordModal } from './EmployeePasswordModal';
import {
  Users, Clock, Plus, ArrowRightLeft, Sparkles,
  Utensils, Sun, Wine, CheckCircle2, AlertCircle, ShoppingBag,
  Layers, Grid, Eye, CreditCard, ChefHat, FileText, Filter,
  ChevronLeft, ChevronRight, LogOut, RefreshCw, CheckSquare, Square,
  Receipt, Flame, Zap
} from 'lucide-react';
import { sound } from '../utils/sound';

export const FloorPlanView: React.FC = () => {
  const {
    t, salons, selectedSalonId, setSelectedSalonId,
    tables, openTable, createSale, sales, setActiveSale, setSelectedRateId,
    setActiveView, logout, waiter, setWaiter, themeMode
  } = usePOS();

  const isLight = themeMode === 'vibrant-light';

  // Density & View Preferences (Dy Pos modern grid)
  const [tableDensity, setTableDensity] = useState<'compact' | 'medium' | 'large'>('compact');
  const [floorTheme, setFloorTheme] = useState<'modern' | 'slate' | 'parquet' | 'minimal'>('modern');
  const [statusFilter, setStatusFilter] = useState<'all' | TableStatus>('all');
  
  // State for Employee Password Modal when clicking occupied table
  const [selectedOccupiedTable, setSelectedOccupiedTable] = useState<Table | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);

  // Auto-refresh simulation
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [refreshSeconds, setRefreshSeconds] = useState<number>(471);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setRefreshSeconds(prev => (prev <= 1 ? 471 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleManualRefresh = () => {
    sound.playTap();
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshSeconds(471);
    }, 400);
  };

  // Filter tables by active salon and status
  const currentSalonTables = tables.filter(tbl => {
    if (tbl.salonId !== selectedSalonId) return false;
    if (statusFilter !== 'all' && tbl.status !== statusFilter) return false;
    return true;
  });

  const activeSalon = salons.find(s => s.id === selectedSalonId) || salons[0];

  // Unassigned open sales (Sin Mesa Asignada / Barra)
  const unassignedSales = sales.filter(s => 
    s.status === 'open' && (s.tableNumber === 'BARRA' || s.tableNumber === 'DIR' || !s.tableNumber)
  );

  const handleTableClick = (table: Table) => {
    sound.playTap();
    const isFree = table.status === 'free' && !table.currentSaleId;
    if (isFree) {
      // Free table -> Direct enter
      openTable(table);
    } else {
      // Occupied table -> Open Employee Password Modal
      setSelectedOccupiedTable(table);
      setIsPasswordModalOpen(true);
    }
  };

  const handlePasswordAccept = (authWaiter: Waiter, targetTable: Table) => {
    setWaiter(authWaiter);
    setIsPasswordModalOpen(false);
    setSelectedOccupiedTable(null);
    openTable(targetTable);
  };

  const handlePasswordCancel = () => {
    setIsPasswordModalOpen(false);
    setSelectedOccupiedTable(null);
  };

  const handleOpenUnassignedSale = (sale: Sale) => {
    sound.playTap();
    setActiveSale(sale);
    setSelectedRateId(sale.rateId);
    setActiveView('pos');
  };

  const handleNextSalon = () => {
    sound.playTap();
    const currentIndex = salons.findIndex(s => s.id === selectedSalonId);
    const nextIndex = (currentIndex + 1) % salons.length;
    setSelectedSalonId(salons[nextIndex].id);
  };

  const handlePrevSalon = () => {
    sound.playTap();
    const currentIndex = salons.findIndex(s => s.id === selectedSalonId);
    const prevIndex = (currentIndex - 1 + salons.length) % salons.length;
    setSelectedSalonId(salons[prevIndex].id);
  };

  // Salon Color mappings (Modern Dy Pos branding)
  const salonColors: Record<number, { bg: string; text: string; active: string }> = {
    1: { bg: 'from-blue-600 to-indigo-600', text: 'text-blue-500', active: 'bg-blue-600 text-white shadow-blue-600/30' },
    2: { bg: 'from-emerald-600 to-teal-600', text: 'text-emerald-500', active: 'bg-emerald-600 text-white shadow-emerald-600/30' },
    3: { bg: 'from-amber-600 to-orange-600', text: 'text-amber-500', active: 'bg-amber-600 text-white shadow-amber-600/30' },
    4: { bg: 'from-purple-600 to-fuchsia-600', text: 'text-purple-500', active: 'bg-purple-600 text-white shadow-purple-600/30' },
  };

  return (
    <div className={`flex-1 flex flex-col h-full select-none overflow-hidden transition-colors ${
      isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* ========================================================
          1. TOP DY POS HEADER BAR (MODERN SALON CONTROLS)
      ======================================================== */}
      <div className={`px-3 py-2.5 sm:px-4 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-sm border-b transition-colors ${
        isLight
          ? 'bg-white/95 backdrop-blur-md border-slate-200 text-slate-800'
          : 'bg-slate-900/95 backdrop-blur-md border-slate-800 text-slate-100'
      }`}>
        {/* Salon Indicator & Quick Selector Tabs */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-bold">
          {/* Salones Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
            {salons.map(s => {
              const isSelected = s.id === selectedSalonId;
              const sColor = salonColors[s.id] || salonColors[1];
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    sound.playTap();
                    setSelectedSalonId(s.id);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                    isSelected
                      ? `bg-gradient-to-r ${sColor.bg} text-white shadow-md shadow-indigo-600/20 scale-[1.02]`
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>

          {/* Color Legend (Modern Dy Pos Palette) */}
          <div className="hidden lg:flex items-center gap-3 sm:gap-4 pl-3 border-l border-slate-200 dark:border-slate-800">
            {/* Libre */}
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-emerald-500 rounded-md border border-emerald-400 shadow-sm block"></span>
              <span className="text-slate-600 dark:text-slate-400 text-[11px] font-semibold">Libre</span>
            </div>

            {/* Ocupada */}
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-rose-500 rounded-md border border-rose-400 shadow-sm block"></span>
              <span className="text-slate-600 dark:text-slate-400 text-[11px] font-semibold">Ocupada</span>
            </div>

            {/* Pre-ticket Impreso / Cobro */}
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-purple-600 rounded-md border border-purple-400 shadow-sm block"></span>
              <span className="text-slate-600 dark:text-slate-400 text-[11px] font-semibold">Cuenta / Pre-ticket</span>
            </div>
          </div>
        </div>

        {/* View & Density Controls + Navigation Pill Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Density / Size Selector */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 text-[11px] font-bold">
            <button
              onClick={() => { sound.playTap(); setTableDensity('compact'); }}
              title="Modo Matriz Dy Pos 10x"
              className={`px-3 py-1 rounded-xl transition-all ${
                tableDensity === 'compact'
                  ? 'bg-indigo-600 text-white font-black shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Matriz 10x
            </button>
            <button
              onClick={() => { sound.playTap(); setTableDensity('medium'); }}
              title="Tarjetas Táctiles Medias"
              className={`px-3 py-1 rounded-xl transition-all ${
                tableDensity === 'medium'
                  ? 'bg-indigo-600 text-white font-black shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Medio
            </button>
            <button
              onClick={() => { sound.playTap(); setTableDensity('large'); }}
              title="Detalle Ampliado"
              className={`px-3 py-1 rounded-xl transition-all ${
                tableDensity === 'large'
                  ? 'bg-indigo-600 text-white font-black shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Detallado
            </button>
          </div>

          {/* Floor Theme Toggle */}
          <button
            onClick={() => {
              sound.playTap();
              setFloorTheme(prev => 
                prev === 'modern' ? 'slate' : prev === 'slate' ? 'parquet' : prev === 'parquet' ? 'minimal' : 'modern'
              );
            }}
            title="Cambiar diseño de piso de salón"
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-sm"
          >
            {floorTheme === 'modern' ? '🏛️ Moderno' : floorTheme === 'slate' ? '🌑 Pizarra' : floorTheme === 'parquet' ? '🪵 Madera' : '⚪ Estudio'}
          </button>

          {/* Navigation Buttons (Anterior, Siguiente, Salir) */}
          <button
            onClick={handlePrevSalon}
            className="touch-btn px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-sm flex items-center gap-1 border border-slate-300 dark:border-slate-700"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          <button
            onClick={handleNextSalon}
            className="touch-btn px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-sm flex items-center gap-1 border border-slate-300 dark:border-slate-700"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => { sound.playTap(); logout(); }}
            className="touch-btn px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-black shadow-sm flex items-center gap-1 border border-rose-200 dark:border-rose-900/60"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          2. MAIN FLOOR / TABLE CANVAS (MODERN DY POS PALETTE)
      ======================================================== */}
      <div className={`flex-1 p-3 sm:p-5 overflow-y-auto ${
        floorTheme === 'modern'
          ? (isLight ? 'dypos-modern-floor' : 'dypos-dark-floor')
          : floorTheme === 'slate'
          ? 'dypos-slate-floor'
          : floorTheme === 'parquet'
          ? 'dypos-parquet-floor'
          : (isLight ? 'bg-slate-100' : 'bg-slate-950')
      }`}>
        <div className="max-w-[1550px] mx-auto">
          {/* Density Grid Container */}
          <div className={
            tableDensity === 'compact'
              ? 'grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-10 xl:grid-cols-10 gap-2.5 sm:gap-3.5'
              : tableDensity === 'medium'
              ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3.5 sm:gap-4'
              : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5'
          }>
            {currentSalonTables.map(table => {
              const isFree = table.status === 'free';
              const isOccupied = !isFree;

              // Find active sale or table ticket details
              const currentSale = table.currentSaleId
                ? sales.find(s => s.id === table.currentSaleId && s.status === 'open')
                : null;

              const ticketNum = currentSale ? currentSale.number : (table.ticketNumber || (table.currentSaleId ? String(table.currentSaleId) : ''));
              const isPrinted = currentSale ? currentSale.preticketPrinted : (table.preticketPrinted || table.status === 'billed');
              const totalAmount = currentSale ? currentSale.total : (table.total || 0);

              // ----------------------------------------------------
              // A. DY POS MODERN COMPACT MATRIX (10x Grid)
              // ----------------------------------------------------
              if (tableDensity === 'compact') {
                return (
                  <button
                    key={table.id}
                    id={`table-btn-${table.id}`}
                    onClick={() => handleTableClick(table)}
                    title={isOccupied ? `${table.name} - Ticket #${ticketNum} • Atendiendo: ${currentSale?.currentWaiterName || currentSale?.waiterName || table.currentWaiterName || 'Camarero'} (${totalAmount.toFixed(2)}€)` : `${table.name} - Libre`}
                    className={`touch-btn relative aspect-square rounded-2xl flex flex-col justify-between p-2 font-bold transition-all shadow-md border-2 hover:scale-[1.03] active:scale-95 ${
                      isFree
                        ? isLight
                          ? 'bg-gradient-to-b from-white to-emerald-50/80 border-emerald-400/90 text-emerald-950 shadow-emerald-500/10 hover:border-emerald-500'
                          : 'bg-gradient-to-b from-emerald-950/60 to-slate-900 border-emerald-500/60 text-emerald-300 shadow-emerald-950/40 hover:border-emerald-400'
                        : isPrinted
                        ? isLight
                          ? 'bg-gradient-to-b from-purple-50 to-indigo-100 border-purple-500 text-purple-950 shadow-purple-500/20'
                          : 'bg-gradient-to-b from-purple-900 to-slate-900 border-purple-400 text-purple-200 shadow-purple-900/40'
                        : isLight
                        ? 'bg-gradient-to-b from-rose-500 to-rose-600 border-rose-400 text-white shadow-rose-600/30'
                        : 'bg-gradient-to-b from-rose-600 to-rose-800 border-rose-400 text-white shadow-rose-950/50'
                    }`}
                  >
                    {/* Header of Table Box */}
                    <div className="w-full flex items-center justify-between text-[11px] leading-none font-mono">
                      {isOccupied ? (
                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                          isLight && !isPrinted ? 'bg-black/30 text-white' : 'bg-white/20 text-current'
                        }`}>
                          #{ticketNum}
                        </span>
                      ) : (
                        <span className="text-[10px] opacity-60 font-sans">{table.seats}p</span>
                      )}

                      {isOccupied && isPrinted && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                      )}
                    </div>

                    {/* Middle of Table Box: Status Icon or Receipt */}
                    <div className="flex-1 flex items-center justify-center my-0.5">
                      {isOccupied ? (
                        <div className={`w-6 h-7 rounded-md border flex flex-col items-center justify-center p-0.5 shadow-sm ${
                          isPrinted
                            ? 'bg-amber-300 border-amber-500 text-amber-950'
                            : 'bg-white border-slate-300 text-slate-800'
                        }`}>
                          <div className="w-4 h-0.5 bg-current mb-0.5 rounded-full opacity-80"></div>
                          <div className="w-3 h-0.5 bg-current mb-0.5 rounded-full opacity-70"></div>
                          <div className="w-4 h-0.5 bg-current rounded-full opacity-80"></div>
                        </div>
                      ) : (
                        <div className={`w-3.5 h-3.5 rounded-full ${
                          isLight ? 'bg-emerald-500/20 text-emerald-600' : 'bg-emerald-400/20 text-emerald-400'
                        } flex items-center justify-center`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        </div>
                      )}
                    </div>

                    {/* Footer of Table Box: Table Name */}
                    <div className="w-full text-center">
                      <span className="text-[11px] sm:text-xs font-black tracking-tight drop-shadow-xs truncate block">
                        {table.name}
                      </span>
                    </div>
                  </button>
                );
              }

              // ----------------------------------------------------
              // B. MEDIUM & LARGE TACTILE MODES
              // ----------------------------------------------------
              return (
                <button
                  key={table.id}
                  id={`table-btn-${table.id}`}
                  onClick={() => handleTableClick(table)}
                  className={`touch-btn relative rounded-3xl flex flex-col justify-between p-3.5 font-bold transition-all shadow-lg border-2 hover:scale-[1.02] active:scale-95 ${
                    isFree
                      ? isLight
                        ? 'bg-gradient-to-b from-white to-emerald-50 border-emerald-300 text-slate-800 shadow-emerald-500/10'
                        : 'bg-gradient-to-b from-slate-900 to-emerald-950/40 border-emerald-500/40 text-white'
                      : isPrinted
                      ? isLight
                        ? 'bg-gradient-to-b from-purple-500 to-indigo-600 border-purple-400 text-white shadow-purple-600/30'
                        : 'bg-gradient-to-b from-purple-800 to-indigo-950 border-purple-500 text-white'
                      : isLight
                      ? 'bg-gradient-to-b from-rose-500 to-rose-600 border-rose-400 text-white shadow-rose-600/30'
                      : 'bg-gradient-to-b from-rose-700 to-slate-900 border-rose-500 text-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-black bg-black/20 px-2 py-0.5 rounded-lg font-mono">
                      {isOccupied ? `#${ticketNum}` : `${table.seats} plazas`}
                    </span>
                    {isOccupied && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                        isPrinted ? 'bg-amber-300 text-slate-950' : 'bg-white text-slate-950'
                      }`}>
                        {isPrinted ? 'CUENTA IMPRESA' : 'ABIERTA'}
                      </span>
                    )}
                  </div>

                  <div className="my-3 text-center">
                    <h4 className="text-base sm:text-lg font-black tracking-tight">{table.name}</h4>
                    {isOccupied && totalAmount > 0 && (
                      <span className="text-sm sm:text-base font-black text-amber-300 font-mono block mt-1">
                        {totalAmount.toFixed(2)} €
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-center font-bold opacity-80">
                    {isFree ? 'Toque para abrir comanda' : `Atiende: ${currentSale?.currentWaiterName || currentSale?.waiterName || 'Garzón'}`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================
          3. BOTTOM BAR (Sin Mesa Asignada & Refresco Automático)
      ======================================================== */}
      <div className={`px-3 py-2.5 sm:px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 text-xs font-bold border-t transition-colors ${
        isLight
          ? 'bg-white border-slate-200 text-slate-700'
          : 'bg-slate-950 border-slate-800 text-slate-300'
      }`}>
        {/* Left Side: Sin Mesa Asignada Tickets List */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">Tickets de Barra:</span>
          
          <div className="flex items-center gap-1.5">
            {unassignedSales.length === 0 ? (
              <span className="text-slate-400 text-[11px] font-normal italic">Sin pedidos pendientes en barra</span>
            ) : (
              unassignedSales.map(sale => {
                const isPrinted = sale.preticketPrinted;

                return (
                  <button
                    key={sale.id}
                    onClick={() => handleOpenUnassignedSale(sale)}
                    title={`Ticket #${sale.number} - Total: ${sale.total.toFixed(2)}€`}
                    className={`touch-btn flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all shrink-0 min-w-[42px] ${
                      isLight
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 hover:border-indigo-500 text-slate-800'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-indigo-400 text-slate-200'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold block mb-0.5">
                      #{sale.number}
                    </span>
                    <div className={`w-4 h-5 rounded-md border flex flex-col items-center justify-center p-0.5 ${
                      isPrinted
                        ? 'bg-amber-300 border-amber-500 text-amber-950'
                        : 'bg-white border-slate-400 text-slate-800'
                    }`}>
                      <div className="w-2.5 h-0.5 bg-current mb-0.5 rounded-full"></div>
                      <div className="w-2 h-0.5 bg-current rounded-full"></div>
                    </div>
                  </button>
                );
              })
            )}

            {/* Nueva Venta Rápida Directa */}
            <button
              onClick={() => {
                sound.playTap();
                const newSale = createSale(undefined, 1);
                setActiveSale(newSale);
                setActiveView('pos');
              }}
              className="touch-btn ml-2 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Venta Rápida Barra</span>
            </button>
          </div>
        </div>

        {/* Right Side: Refresco Automático */}
        <div className="flex items-center gap-3 text-xs shrink-0 self-end sm:self-auto">
          {/* Checkbox Refresco Automático */}
          <button
            onClick={() => {
              sound.playTap();
              setAutoRefresh(prev => !prev);
            }}
            className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            {autoRefresh ? (
              <CheckSquare className="w-4 h-4 text-emerald-500" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span className="font-semibold text-[11px]">Sincronización:</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{refreshSeconds}s</span>
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={handleManualRefresh}
            title="Sincronizar mapa de mesas ahora"
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Password Modal when tapping Occupied Table */}
      <EmployeePasswordModal
        isOpen={isPasswordModalOpen}
        table={selectedOccupiedTable}
        waiters={INITIAL_WAITERS}
        currentWaiter={waiter}
        onAccept={handlePasswordAccept}
        onCancel={handlePasswordCancel}
      />
    </div>
  );
};
