import React, { useState, useMemo } from 'react';
import { usePOS } from '../context/POSContext';
import { Sale, Waiter } from '../types';
import { INITIAL_WAITERS } from '../data/mockData';
import {
  FileText, ArrowRight, Printer, CreditCard, Filter, Search,
  Users, Clock, Calendar, Utensils, Sparkles, RefreshCw,
  Eye, Plus, ChevronRight, CheckCircle2, AlertCircle, ShoppingBag,
  ArrowRightLeft, Layers, UserCheck, ArrowLeft
} from 'lucide-react';
import { sound } from '../utils/sound';
import { CHILE_IVA_PERCENT, calculateNetAndIva, formatCLP } from '../utils/currency';
import { hasUserPermission } from '../utils/permissions';

export const PendingSalesView: React.FC = () => {
  const {
    sales = [], activeSale, setActiveSale, setSelectedRateId,
    setActiveView, openTable, tables = [], waiters = INITIAL_WAITERS, waiter, setWaiter,
    setIsPaymentModalOpen, setPrintableTicket, printPreTicket, themeMode, stationMode, currency
  } = usePOS();

  const isLight = themeMode === 'vibrant-light';
  const isWaiterUser = waiter.role === 'waiter' || stationMode === 'waiter-mobile';
  const canCharge = hasUserPermission(waiter, 'canCharge') && !isWaiterUser;
  const canPrintPrebill = hasUserPermission(waiter, 'canPrintPrebill') && !isWaiterUser;
  const waiterList = waiters && waiters.length > 0 ? waiters : INITIAL_WAITERS;

  // Filters
  const [selectedWaiterId, setSelectedWaiterId] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterPreticket, setFilterPreticket] = useState<'all' | 'printed' | 'not_printed'>('all');
  const [sortField, setSortField] = useState<'id' | 'date' | 'time' | 'table' | 'total'>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);

  // Filter open sales only
  const openSales = useMemo(() => {
    return (sales || []).filter(s => s && s.status === 'open');
  }, [sales]);

  // Apply filters
  const filteredSales = useMemo(() => {
    return openSales.filter(s => {
      // Filter by waiter
      if (selectedWaiterId !== 'all' && s.waiterId !== selectedWaiterId) {
        return false;
      }
      // Filter by pre-ticket
      if (filterPreticket === 'printed' && !s.preticketPrinted) return false;
      if (filterPreticket === 'not_printed' && s.preticketPrinted) return false;
      // Filter by search (id, table, waiter, product name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNumber = (s.number || '').toLowerCase().includes(q) || String(s.id).includes(q);
        const matchesTable = (s.tableName || '').toLowerCase().includes(q) || (s.tableNumber || '').toLowerCase().includes(q);
        const matchesWaiter = (s.waiterName || '').toLowerCase().includes(q);
        const matchesProduct = (s.items || []).some(i => (i.productName || '').toLowerCase().includes(q));
        if (!matchesNumber && !matchesTable && !matchesWaiter && !matchesProduct) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === 'id') comparison = a.id - b.id;
      else if (sortField === 'table') comparison = (a.tableName || '').localeCompare(b.tableName || '');
      else if (sortField === 'total') comparison = (a.total || 0) - (b.total || 0);
      else if (sortField === 'time') comparison = (a.time || '').localeCompare(b.time || '');
      else if (sortField === 'date') comparison = (a.date || '').localeCompare(b.date || '');
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [openSales, selectedWaiterId, filterPreticket, searchQuery, sortField, sortDirection]);

  // Aggregate stats
  const totalAmount = openSales.reduce((acc, s) => acc + s.total, 0);
  const totalPreticketPrinted = openSales.filter(s => s.preticketPrinted).length;
  const filteredTotal = filteredSales.reduce((acc, s) => acc + s.total, 0);

  const handleOpenSale = (sale: Sale) => {
    sound.playTap();
    setActiveSale(sale);
    setSelectedRateId(sale.rateId);
    setActiveView('pos');
  };

  const handleDirectCharge = (sale: Sale, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playTap();
    setActiveSale(sale);
    setSelectedRateId(sale.rateId);
    setIsPaymentModalOpen(true);
  };

  const handlePrintPreticket = (sale: Sale, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playPrint();
    printPreTicket(sale);
  };

  const handleSort = (field: 'id' | 'date' | 'time' | 'table' | 'total') => {
    sound.playTap();
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const activeSelectedSale = openSales.find(s => s.id === selectedSaleId) || filteredSales[0] || null;

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden select-none font-sans ${
      isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      
      {/* ========================================================
          1. HEADER & ACTION TOOLBAR (Modern, intuitive & professional)
      ======================================================== */}
      <div className={`px-4 py-3 border-b flex flex-wrap items-center justify-between gap-3 shadow-xs shrink-0 ${
        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playTap();
              setActiveView('floor');
            }}
            className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-black transition-all ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900 shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 shadow-xs'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Plano de Mesas</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-blue-700 dark:text-blue-400">
                VENTAS ABIERTAS
              </h1>
              <span className="bg-blue-600 text-white font-black text-xs px-2.5 py-0.5 rounded-full shadow-xs">
                {openSales.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
              Gestión centralizada de comandas y cuentas activas
            </p>
          </div>
        </div>

        {/* Global Stats Badges */}
        <div className="flex items-center gap-2 text-xs">
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 font-bold ${
            isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs' : 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
          }`}>
            <span className="text-[11px] text-slate-700 dark:text-slate-300 font-bold">Total Activo:</span>
            <span className="font-mono font-black text-sm text-emerald-700 dark:text-emerald-400">
              {formatCLP(totalAmount, currency)}
            </span>
          </div>

          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 font-bold ${
            isLight ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-xs' : 'bg-amber-950/50 border-amber-800 text-amber-300'
          }`}>
            <span className="text-[11px] text-slate-700 dark:text-slate-300 font-bold">Pre-tickets:</span>
            <span className="font-mono font-black text-sm text-amber-700 dark:text-amber-400">
              {totalPreticketPrinted}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. FILTER & SEARCH BAR
      ======================================================== */}
      <div className={`px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-2.5 text-xs shrink-0 ${
        isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-900/60 border-slate-800/80'
      }`}>
        {/* Left: Garzones Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
          <span className="text-slate-700 dark:text-slate-400 font-black uppercase text-[10px] mr-1 hidden sm:inline shrink-0">
            Garzón:
          </span>
          <button
            onClick={() => {
              sound.playTap();
              setSelectedWaiterId('all');
            }}
            className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all shrink-0 cursor-pointer ${
              selectedWaiterId === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : isLight
                ? 'bg-white text-slate-800 hover:bg-slate-200 border border-slate-300 shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            TODOS ({openSales.length})
          </button>

          {waiterList.map(w => {
            const count = openSales.filter(s => s.waiterId === w.id).length;
            if (count === 0 && selectedWaiterId !== w.id) return null;
            const cleanName = w.name.replace(/\s*\([^)]*\)/g, '').trim();
            return (
              <button
                key={w.id}
                onClick={() => {
                  sound.playTap();
                  setSelectedWaiterId(w.id);
                }}
                className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  selectedWaiterId === w.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isLight
                    ? 'bg-white text-slate-800 hover:bg-slate-200 border border-slate-300 shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <span>{cleanName}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  selectedWaiterId === w.id
                    ? 'bg-blue-800 text-white'
                    : isLight
                    ? 'bg-slate-200 text-slate-900 font-black'
                    : 'bg-slate-700 text-slate-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Search & Preticket filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Preticket Filter */}
          <div className={`flex items-center rounded-xl p-0.5 border shrink-0 ${
            isLight ? 'bg-slate-200 border-slate-300' : 'bg-slate-800 border-slate-700'
          }`}>
            <button
              onClick={() => { sound.playTap(); setFilterPreticket('all'); }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-colors cursor-pointer ${
                filterPreticket === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isLight
                  ? 'text-slate-800 hover:text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => { sound.playTap(); setFilterPreticket('printed'); }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-colors cursor-pointer ${
                filterPreticket === 'printed'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : isLight
                  ? 'text-slate-800 hover:text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Con Pre-ticket
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar venta, mesa..."
              className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold ${
                isLight ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 shadow-xs' : 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400'
              }`}
            />
          </div>
        </div>
      </div>

      {/* ========================================================
          3. MAIN TABLE / CONTENT AREA
      ======================================================== */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left/Main Column: The High-Contrast Data Table (Matching Screenshot 2) */}
        <div className={`flex-1 flex flex-col overflow-hidden border-r ${
          isLight ? 'border-slate-300 bg-white text-slate-900' : 'border-slate-800 bg-slate-950 text-slate-100'
        }`}>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-xs border-collapse">
              {/* Header */}
              <thead className={`sticky top-0 z-10 font-black tracking-wider uppercase text-[11px] select-none ${
                isLight ? 'bg-slate-200 text-slate-900 border-b border-slate-300' : 'bg-slate-900 text-slate-300 border-b border-slate-800'
              }`}>
                <tr>
                  <th onClick={() => handleSort('id')} className="py-2.5 px-3 cursor-pointer hover:text-blue-600">
                    Nro. {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('date')} className="py-2.5 px-3 cursor-pointer hover:text-blue-600 hidden sm:table-cell">
                    Fecha {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('time')} className="py-2.5 px-3 cursor-pointer hover:text-blue-600">
                    Hora {sortField === 'time' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('table')} className="py-2.5 px-3 cursor-pointer hover:text-blue-600 font-black text-blue-700 dark:text-blue-400">
                    Mesa {sortField === 'table' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-2.5 px-3">
                    Garzón
                  </th>
                  <th className="py-2.5 px-3 hidden md:table-cell">
                    Tarifa
                  </th>
                  <th className="py-2.5 px-3 text-center">
                    Pre-ticket
                  </th>
                  <th className="py-2.5 px-3 text-right hidden lg:table-cell">
                    Sub-total
                  </th>
                  <th className="py-2.5 px-3 text-right hidden lg:table-cell">
                    IVA
                  </th>
                  <th onClick={() => handleSort('total')} className="py-2.5 px-3 text-right cursor-pointer hover:text-blue-600 font-black">
                    Total {sortField === 'total' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-2.5 px-3 text-center">
                    Acción
                  </th>
                </tr>
              </thead>

              {/* Rows */}
              <tbody className={`divide-y font-medium ${isLight ? 'divide-slate-200 text-slate-900' : 'divide-slate-800/60 text-slate-100'}`}>
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-400">
                      <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="font-bold text-sm">No se encontraron ventas con los filtros aplicados</p>
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale, idx) => {
                    const isSelected = selectedSaleId === sale.id;
                    return (
                      <tr
                        key={sale.id}
                        onClick={() => setSelectedSaleId(sale.id)}
                        onDoubleClick={() => handleOpenSale(sale)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? isLight ? 'bg-blue-100/90 font-bold text-slate-950 border-l-4 border-blue-600' : 'bg-blue-950/60 font-bold border-l-4 border-blue-500'
                            : idx % 2 === 0
                            ? isLight ? 'bg-white hover:bg-slate-100' : 'bg-slate-950 hover:bg-slate-900/80'
                            : isLight ? 'bg-slate-50 hover:bg-slate-100' : 'bg-slate-900/40 hover:bg-slate-900/80'
                        }`}
                      >
                        {/* Nro */}
                        <td className="py-2.5 px-3 font-mono font-black text-slate-900 dark:text-slate-100">
                          {sale.number || sale.id}
                        </td>

                        {/* Fecha */}
                        <td className="py-2.5 px-3 text-slate-700 dark:text-slate-400 hidden sm:table-cell font-mono text-[11px] font-bold">
                          {sale.date}
                        </td>

                        {/* Hora */}
                        <td className="py-2.5 px-3 text-slate-800 dark:text-slate-300 font-mono text-[11px] font-bold">
                          {sale.time}
                        </td>

                        {/* Mesa */}
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded font-black text-xs ${
                            sale.tableNumber === 'BARRA' || !sale.tableNumber
                              ? isLight ? 'bg-slate-200 text-slate-800 border border-slate-300' : 'bg-slate-800 text-slate-300'
                              : 'bg-blue-600 text-white shadow-xs'
                          }`}>
                            {sale.tableName || `Mesa ${sale.tableNumber}`}
                          </span>
                        </td>

                        {/* Garzón */}
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                          {sale.waiterName || 'Sin asignar'}
                        </td>

                        {/* Tarifa */}
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 hidden md:table-cell font-medium">
                          {sale.rateName || 'Default'}
                        </td>

                        {/* Pre-ticket */}
                        <td className="py-2.5 px-3 text-center">
                          {sale.preticketPrinted ? (
                            <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded shadow-xs">
                              <Printer className="w-3 h-3" />
                              <span>IMPRESO</span>
                            </span>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-mono font-bold">
                              No
                            </span>
                          )}
                        </td>

                        {/* Subtotal */}
                        <td className="py-2.5 px-3 text-right font-mono text-slate-800 dark:text-slate-400 hidden lg:table-cell font-bold">
                          {formatCLP(sale.subtotal, currency)}
                        </td>

                        {/* IVA */}
                        <td className="py-2.5 px-3 text-right font-mono text-slate-800 dark:text-slate-400 hidden lg:table-cell font-bold">
                          {formatCLP(sale.taxTotal, currency)}
                        </td>

                        {/* Total */}
                        <td className="py-2.5 px-3 text-right font-mono font-black text-sm text-emerald-700 dark:text-emerald-400">
                          {formatCLP(sale.total, currency)}
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenSale(sale)}
                              title="Abrir comanda"
                              className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-transform active:scale-95 shadow-xs flex items-center gap-1 text-xs cursor-pointer"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Ver</span>
                            </button>
                            {canCharge && (
                              <button
                                onClick={(e) => handleDirectCharge(sale, e)}
                                title="Cobrar directo"
                                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-transform active:scale-95 shadow-xs cursor-pointer"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Table Summary Status Bar */}
          <div className={`px-4 py-3 border-t flex flex-wrap items-center justify-between text-xs font-bold gap-3 shrink-0 ${
            isLight ? 'bg-slate-200/90 text-slate-800 border-slate-300' : 'bg-slate-900 text-slate-200 border-slate-800'
          }`}>
            <div className="flex items-center gap-3 sm:gap-4">
              <span>Registros: <strong className="text-slate-950 dark:text-white font-black bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{filteredSales.length}</strong></span>
              <span className="hidden sm:inline opacity-40">•</span>
              <span className="hidden sm:inline text-slate-600 dark:text-slate-400">Doble clic para acceder directo</span>
            </div>

            <div className="flex items-center gap-4 font-mono">
              <span className="text-slate-700 dark:text-slate-300 font-bold">
                Neto: <strong className="text-slate-950 dark:text-slate-100 font-black">{formatCLP(calculateNetAndIva(filteredTotal, CHILE_IVA_PERCENT).net, currency)}</strong>
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 text-sm font-black bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-800">
                Total: {formatCLP(filteredTotal, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Preview & Direct Action Drawer for selected Sale */}
        {activeSelectedSale && (
          <div className={`w-full md:w-80 lg:w-96 flex flex-col shrink-0 border-t md:border-t-0 md:border-l overflow-hidden ${
            isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
          }`}>
            {/* Top Preview Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              isLight ? 'bg-slate-100/90 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
            }`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase">Venta #{activeSelectedSale.number}</span>
                  <span className="bg-blue-600 text-white font-black text-xs px-2 py-0.5 rounded-lg shadow-xs">
                    {activeSelectedSale.tableName || `Mesa ${activeSelectedSale.tableNumber}`}
                  </span>
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-400 mt-1 font-medium">
                  Garzón: <strong className="text-slate-900 dark:text-slate-200 font-bold">{activeSelectedSale.waiterName?.replace(/\s*\([^)]*\)/g, '').trim()}</strong> • {activeSelectedSale.time}
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-mono font-black text-emerald-700 dark:text-emerald-400">
                  {formatCLP(activeSelectedSale.total, currency)}
                </div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400 font-bold">
                  {(activeSelectedSale.items || []).length} productos
                </div>
              </div>
            </div>

            {/* Products in Sale */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 no-scrollbar sm:scroll-auto">
              <div className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-2 flex items-center justify-between">
                <span>Detalle de Comanda</span>
                <span className="text-[10px] font-normal text-slate-500">Mesa activa</span>
              </div>

              {(!activeSelectedSale.items || activeSelectedSale.items.length === 0) ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs font-medium">
                  Sin productos añadidos
                </div>
              ) : (
                (activeSelectedSale.items || []).map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs shadow-xs ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800/60 border-slate-700/60 text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-blue-600 text-white font-black flex items-center justify-center text-[10px]">
                        {item.quantity}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">{item.productName}</div>
                        {(item.selectedOption || item.kitchenNotes) && (
                          <div className="text-[10px] text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-700 mt-0.5 font-bold">
                            {item.selectedOption ? `Opc: ${item.selectedOption}` : `Nota: ${item.kitchenNotes}`}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="font-mono font-black text-slate-900 dark:text-slate-200">
                      {formatCLP(item.total, currency)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Direct Action Buttons on Selected Sale */}
            <div className={`p-3 border-t flex flex-col gap-2 ${
              isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800'
            }`}>
              <button
                onClick={() => handleOpenSale(activeSelectedSale)}
                className="w-full min-h-[44px] py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>ENTRAR A LA COMANDA</span>
              </button>

              {(canPrintPrebill || canCharge) && (
                <div className="grid grid-cols-2 gap-2">
                  {canPrintPrebill && (
                    <button
                      onClick={(e) => handlePrintPreticket(activeSelectedSale, e)}
                      className={`py-2 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        activeSelectedSale.preticketPrinted
                          ? 'bg-amber-500 text-slate-950 border-amber-600 font-black'
                          : isLight
                          ? 'bg-white hover:bg-slate-200 border-slate-300 text-slate-900 shadow-xs'
                          : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                      }`}
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Pre-ticket</span>
                    </button>
                  )}

                  {canCharge && (
                    <button
                      onClick={(e) => handleDirectCharge(activeSelectedSale, e)}
                      className="py-2 px-3 rounded-xl font-black text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Cobrar</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
