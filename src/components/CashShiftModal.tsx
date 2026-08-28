import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import {
  Lock, Unlock, DollarSign, ArrowDownRight, ArrowUpRight, Calculator,
  FileSpreadsheet, ShieldAlert, CheckCircle2, XCircle, Printer, Coins,
  Clock, User, AlertTriangle, Building, CreditCard, Sparkles, RefreshCw, ShieldX
} from 'lucide-react';
import { sound } from '../utils/sound';
import { hasUserPermission } from '../utils/permissions';

export const CashShiftModal: React.FC = () => {
  const {
    isCashShiftModalOpen,
    setIsCashShiftModalOpen,
    cashModalMode,
    setCashModalMode,
    currentShift,
    openCashShift,
    addCashMovement,
    closeCashShift,
    sales,
    terminal,
    waiter,
    currency,
    themeMode,
    setPrintableTicket
  } = usePOS();

  const isLight = themeMode === 'vibrant-light';
  const canOpenClose = hasUserPermission(waiter, 'canOpenCloseCash');
  const canMoveCash = hasUserPermission(waiter, 'canCashMovements');

  // State for Open Shift
  const [initialCashInput, setInitialCashInput] = useState<number>(250.00);
  const [openNotes, setOpenNotes] = useState<string>('Apertura de turno de caja general');

  // State for Movements (In / Out)
  const [movType, setMovType] = useState<'in' | 'out'>('out');
  const [movAmount, setMovAmount] = useState<number>(25.00);
  const [movConcept, setMovConcept] = useState<string>('');
  const [movCategory, setMovCategory] = useState<'supplier' | 'advance' | 'deposit' | 'petty_cash' | 'change' | 'other'>('supplier');
  const [movReceipt, setMovReceipt] = useState<string>('');

  // State for Close Shift & Arqueo Denominations
  const [billCounts, setBillCounts] = useState<Record<string, number>>({
    '500': 0, '200': 0, '100': 0, '50': 2, '20': 4, '10': 5, '5': 6,
    '2': 10, '1': 15, '0.50': 10, '0.20': 15, '0.10': 20
  });
  const [closeNotes, setOpenCloseNotes] = useState<string>('Cuadre de caja fin de turno');
  const [lastClosedReport, setLastClosedReport] = useState<any>(null);

  // Sales totals for active shift
  const closedSales = sales.filter(s => s.status === 'closed');
  const cashSales = closedSales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.total, 0);
  const cardSales = closedSales.filter(s => s.paymentMethod === 'card').reduce((sum, s) => sum + s.total, 0);
  const cryptoSales = closedSales.filter(s => s.paymentMethod === 'crypto').reduce((sum, s) => sum + s.total, 0);
  const otherSales = closedSales.filter(s => s.paymentMethod === 'other').reduce((sum, s) => sum + s.total, 0);
  const totalSales = closedSales.reduce((sum, s) => sum + s.total, 0);

  const shiftMovements = currentShift?.movements || [];
  const totalCashIn = shiftMovements.filter(m => m.type === 'in').reduce((acc, m) => acc + m.amount, 0);
  const totalCashOut = shiftMovements.filter(m => m.type === 'out').reduce((acc, m) => acc + m.amount, 0);

  const initialShiftCash = currentShift ? currentShift.initialCash : terminal.initialCash;
  const expectedCashInDrawer = initialShiftCash + cashSales + totalCashIn - totalCashOut;

  // Calculated counted cash from denominations
  const totalCountedCash = Object.entries(billCounts).reduce((sum, [denom, count]) => {
    return sum + parseFloat(denom) * (count || 0);
  }, 0);

  const difference = Math.round((totalCountedCash - expectedCashInDrawer) * 100) / 100;

  if (!isCashShiftModalOpen) return null;

  const handleOpenShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playCashRegister();
    openCashShift(initialCashInput, openNotes);
    setIsCashShiftModalOpen(false);
  };

  const handleMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movConcept.trim() || movAmount <= 0) return;
    sound.playCashRegister();
    addCashMovement({
      type: movType,
      amount: Number(movAmount),
      concept: movConcept,
      category: movCategory,
      receiptNumber: movReceipt,
    });
    setMovConcept('');
    setMovReceipt('');
    setIsCashShiftModalOpen(false);
  };

  const handleCloseShiftSubmit = () => {
    sound.playCashRegister();
    const res = closeCashShift(totalCountedCash, closeNotes);
    setLastClosedReport(res.report);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 select-none overflow-y-auto">
      <div className={`border rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-5 shadow-2xl transition-colors my-auto ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md ${
              cashModalMode === 'open'
                ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                : cashModalMode === 'close'
                ? 'bg-purple-600 text-white shadow-purple-600/30'
                : 'bg-amber-500 text-white shadow-amber-500/30'
            }`}>
              {cashModalMode === 'open' && <Unlock className="w-5 h-5" />}
              {cashModalMode === 'close' && <Lock className="w-5 h-5" />}
              {cashModalMode === 'movement' && <Coins className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">
                {cashModalMode === 'open' && 'Apertura de Caja & Inicio de Turno'}
                {cashModalMode === 'close' && 'Cierre de Caja & Arqueo Z'}
                {cashModalMode === 'movement' && 'Movimiento de Efectivo en Caja'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Responsable: <strong className="text-slate-700 dark:text-slate-200">{waiter.name}</strong> • {terminal.name}
              </p>
            </div>
          </div>

          <button
            onClick={() => { sound.playTap(); setIsCashShiftModalOpen(false); }}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/60 flex items-center justify-center font-bold text-slate-400 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Sub-navigation if shift is open */}
        {currentShift && (canMoveCash || canOpenClose) && (
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            {canMoveCash && (
              <button
                onClick={() => { sound.playTap(); setCashModalMode('movement'); }}
                className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  cashModalMode === 'movement'
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Coins className="w-4 h-4" />
                <span>Entrada / Salida de Efectivo</span>
              </button>
            )}
            {canOpenClose && (
              <button
                onClick={() => { sound.playTap(); setCashModalMode('close'); }}
                className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  cashModalMode === 'close'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Cierre de Caja (Arqueo Z)</span>
              </button>
            )}
          </div>
        )}

        {/* ACCESS DENIED STATE IF LACKING PERMISSIONS */}
        {((cashModalMode === 'open' || cashModalMode === 'close') && !canOpenClose) || (cashModalMode === 'movement' && !canMoveCash) ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
              <ShieldX className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white">
                Acceso Restringido
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                El usuario actual (<strong>{waiter.name}</strong>) tiene perfil de <strong>{waiter.role === 'waiter' ? 'Garzón' : waiter.role}</strong> y no cuenta con privilegios para abrir, cerrar o mover fondos de caja.
              </p>
            </div>
            <button
              onClick={() => { sound.playTap(); setIsCashShiftModalOpen(false); }}
              className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all shadow-md"
            >
              Entendido / Cerrar
            </button>
          </div>
        ) : (
          <>
            {/* MODE 1: APERTURA DE CAJA */}
            {cashModalMode === 'open' && (
              <form onSubmit={handleOpenShiftSubmit} className="space-y-4">
                <div className={`p-4 rounded-2xl border ${
                  isLight
                    ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                    : 'bg-emerald-950/40 border-emerald-700/80 text-emerald-100'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isLight ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-slate-950'
                    }`}>
                      <Unlock className="w-4 h-4" />
                    </div>
                    <div className="text-xs space-y-1">
                      <p className={`font-black ${isLight ? 'text-emerald-950' : 'text-emerald-200'}`}>
                        Al abrir caja, se iniciará el turno central y se habilitarán los comanderos móviles de los garzones.
                      </p>
                      <p className={`font-semibold ${isLight ? 'text-emerald-800' : 'text-emerald-300'}`}>
                        Indique el dinero en efectivo que queda como fondo de cambio en el cajón portamonedas.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`block text-xs font-black uppercase tracking-wider ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    Fondo Inicial en Efectivo ({currency})
                  </label>
                  <div className="relative">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black font-mono ${
                      isLight ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                      {currency}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={initialCashInput}
                      onChange={(e) => setInitialCashInput(parseFloat(e.target.value) || 0)}
                      className={`w-full pl-12 pr-4 py-3.5 rounded-2xl text-2xl font-black font-mono border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-950' : 'bg-slate-950 border-slate-700 text-white'
                      }`}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[100, 150, 200, 250, 300, 500].map(amount => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => { sound.playTap(); setInitialCashInput(amount); }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black border transition-all ${
                          initialCashInput === amount
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30'
                            : isLight
                            ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 hover:border-slate-400'
                            : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        {amount}{currency}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={`block text-xs font-bold ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    Observaciones de Apertura
                  </label>
                  <input
                    type="text"
                    value={openNotes}
                    onChange={(e) => setOpenNotes(e.target.value)}
                    placeholder="Ej: Turno mañana, cajón revisado con cambio de 1€ y 2€..."
                    className={`w-full px-4 py-3 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-950 placeholder-slate-400' : 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-600/30 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Confirmar y Abrir Turno de Caja ({initialCashInput.toFixed(2)}{currency})</span>
                </button>
              </form>
            )}

            {/* MODE 2: MOVIMIENTOS DE CAJA (ENTRADA / SALIDA / GASTO) */}
            {cashModalMode === 'movement' && (
              <form onSubmit={handleMovementSubmit} className="space-y-4">
                {/* Type selector */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { sound.playTap(); setMovType('in'); }}
                    className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-black transition-all ${
                      movType === 'in'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-emerald-50 hover:border-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4 text-emerald-300 stroke-[3]" />
                    <span>Entrada de Efectivo (+)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { sound.playTap(); setMovType('out'); }}
                    className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-black transition-all ${
                      movType === 'out'
                        ? 'bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-600/30'
                        : isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-rose-50 hover:border-rose-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 text-rose-300 stroke-[3]" />
                    <span>Salida / Retiro de Caja (-)</span>
                  </button>
                </div>

                {/* Amount */}
                <div className="space-y-1.5">
                  <label className={`block text-xs font-black uppercase tracking-wider ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    Importe del Movimiento ({currency})
                  </label>
                  <div className="relative">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black font-mono ${
                      isLight ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                      {currency}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.10"
                      value={movAmount}
                      onChange={(e) => setMovAmount(parseFloat(e.target.value) || 0)}
                      className={`w-full pl-12 pr-4 py-3.5 rounded-2xl text-xl font-black font-mono border focus:outline-none focus:ring-2 ${
                        movType === 'in' ? 'focus:ring-emerald-500' : 'focus:ring-rose-500'
                      } ${isLight ? 'bg-slate-50 border-slate-300 text-slate-950' : 'bg-slate-950 border-slate-700 text-white'}`}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className={`block text-xs font-bold ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    Categoría del Movimiento
                  </label>
                  <select
                    value={movCategory}
                    onChange={(e: any) => setMovCategory(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl text-xs font-black border focus:outline-none ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-950' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  >
                    <option value="supplier">Pago a Proveedor (Verduras, Hielo, Bebidas)</option>
                    <option value="change">Aporte de Cambio / Monedas adicionales</option>
                    <option value="advance">Anticipo / Retiro de Personal</option>
                    <option value="petty_cash">Caja Chica / Gasto Menor Urgente</option>
                    <option value="deposit">Ingreso Extraordinario</option>
                    <option value="other">Otro Movimiento Justificado</option>
                  </select>
                </div>

                {/* Concept & Receipt */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className={`block text-xs font-bold ${
                      isLight ? 'text-slate-700' : 'text-slate-300'
                    }`}>
                      Concepto / Motivo
                    </label>
                    <input
                      type="text"
                      value={movConcept}
                      onChange={(e) => setMovConcept(e.target.value)}
                      placeholder="Ej: Pago factura proveedor panadería..."
                      required
                      className={`w-full px-4 py-3 rounded-xl text-xs font-medium border focus:outline-none ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-950 placeholder-slate-400' : 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                      }`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={`block text-xs font-bold ${
                      isLight ? 'text-slate-700' : 'text-slate-300'
                    }`}>
                      Nº Ticket / Factura (Opcional)
                    </label>
                    <input
                      type="text"
                      value={movReceipt}
                      onChange={(e) => setMovReceipt(e.target.value)}
                      placeholder="Ej: FAC-2026-99"
                      className={`w-full px-4 py-3 rounded-xl text-xs font-medium border focus:outline-none ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-950 placeholder-slate-400' : 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-4 rounded-2xl text-white font-black text-sm shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 ${
                    movType === 'in'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
                      : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-600/30'
                  }`}
                >
                  {movType === 'in' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  <span>Registrar {movType === 'in' ? 'Entrada' : 'Salida'} ({movAmount.toFixed(2)}{currency})</span>
                </button>
              </form>
            )}

            {/* MODE 3: CIERRE DE CAJA & ARQUEO Z */}
            {cashModalMode === 'close' && (
              <div className="space-y-4">
                {!lastClosedReport ? (
                  <>
                    {/* Real-time shift breakdown card */}
                    <div className={`p-4 rounded-2xl border space-y-3 ${
                      isLight ? 'bg-slate-100/90 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                    }`}>
                      <div className="text-xs font-black uppercase tracking-wider flex items-center justify-between">
                        <span className={isLight ? 'text-slate-800' : 'text-slate-300'}>Resumen Teórico del Turno</span>
                        <span className="text-purple-600 dark:text-purple-400 font-mono font-bold bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                          ID: {currentShift?.id || 'SHIFT-01'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        <div className={`p-3 rounded-xl border ${
                          isLight ? 'bg-white border-slate-300 text-slate-900 shadow-xs' : 'bg-slate-900 border-slate-800 text-slate-100'
                        }`}>
                          <span className={`block text-[11px] font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Fondo Inicial</span>
                          <span className="font-mono font-black text-base block mt-0.5">{initialShiftCash.toFixed(2)}{currency}</span>
                        </div>
                        <div className={`p-3 rounded-xl border ${
                          isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs' : 'bg-emerald-950/50 border-emerald-700/80 text-emerald-100'
                        }`}>
                          <span className={`block text-[11px] font-black ${isLight ? 'text-emerald-800' : 'text-emerald-300'}`}>Ventas Efectivo</span>
                          <span className="font-mono font-black text-base text-emerald-700 dark:text-emerald-300 block mt-0.5">+{cashSales.toFixed(2)}{currency}</span>
                        </div>
                        <div className={`p-3 rounded-xl border ${
                          isLight ? 'bg-blue-50 border-blue-300 text-blue-950 shadow-xs' : 'bg-blue-950/50 border-blue-700/80 text-blue-100'
                        }`}>
                          <span className={`block text-[11px] font-black ${isLight ? 'text-blue-800' : 'text-blue-300'}`}>Ventas Tarjetas</span>
                          <span className="font-mono font-black text-base text-blue-700 dark:text-blue-300 block mt-0.5">{cardSales.toFixed(2)}{currency}</span>
                        </div>
                        <div className={`p-3 rounded-xl border ${
                          isLight ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-xs' : 'bg-amber-950/50 border-amber-700/80 text-amber-100'
                        }`}>
                          <span className={`block text-[11px] font-black ${isLight ? 'text-amber-900' : 'text-amber-300'}`}>Entradas/Salidas</span>
                          <span className={`font-mono font-black text-base block mt-0.5 ${
                            totalCashIn >= totalCashOut ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                          }`}>
                            {totalCashIn >= totalCashOut ? `+${(totalCashIn - totalCashOut).toFixed(2)}` : `-${(totalCashOut - totalCashIn).toFixed(2)}`}{currency}
                          </span>
                        </div>
                      </div>

                      <div className={`flex items-center justify-between pt-2.5 border-t text-xs ${
                        isLight ? 'border-slate-300' : 'border-slate-800'
                      }`}>
                        <span className={`font-black ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Efectivo Teórico Esperado en Cajón:</span>
                        <span className="font-mono font-black text-lg text-purple-700 dark:text-purple-400 bg-purple-500/10 px-3 py-1 rounded-xl border border-purple-500/30">
                          {expectedCashInDrawer.toFixed(2)}{currency}
                        </span>
                      </div>
                    </div>

                    {/* Arqueo de Billetes y Monedas */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-black uppercase tracking-wider flex items-center gap-1.5 ${
                          isLight ? 'text-slate-700' : 'text-slate-300'
                        }`}>
                          <Calculator className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span>Conteo Físico de Billetes y Monedas</span>
                        </span>
                        <span className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                          Total Contado:{' '}
                          <strong className="font-mono font-black text-sm text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-300 dark:border-purple-800">
                            {totalCountedCash.toFixed(2)}{currency}
                          </strong>
                        </span>
                      </div>

                      <div className={`grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2.5 rounded-2xl border ${
                        isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800'
                      }`}>
                        {Object.keys(billCounts).map(denom => (
                          <div
                            key={denom}
                            className={`flex flex-col items-center p-1.5 rounded-xl border text-center shadow-xs transition-all ${
                              isLight
                                ? 'bg-white border-slate-300 text-slate-900 focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-200'
                                : 'bg-slate-900 border-slate-700 text-slate-100 focus-within:border-purple-400'
                            }`}
                          >
                            <span className={`text-[11px] font-black font-mono ${
                              isLight ? 'text-slate-700' : 'text-slate-300'
                            }`}>
                              {denom}{currency}
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={billCounts[denom] || ''}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setBillCounts(prev => ({ ...prev, [denom]: val }));
                              }}
                              placeholder="0"
                              className={`w-full text-center text-xs font-black font-mono py-1 rounded-md mt-0.5 outline-none ${
                                isLight
                                  ? 'bg-slate-100 text-slate-950 border border-slate-200 focus:bg-white focus:border-purple-500'
                                  : 'bg-slate-800 text-white border border-slate-700 focus:bg-slate-950 focus:border-purple-400'
                              }`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Live Cuadre / Diferencia Indicator */}
                    <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-sm ${
                      difference === 0
                        ? isLight
                          ? 'bg-emerald-100/90 border-emerald-400 text-emerald-950'
                          : 'bg-emerald-950/60 border-emerald-600 text-emerald-100'
                        : difference > 0
                        ? isLight
                          ? 'bg-blue-100/90 border-blue-400 text-blue-950'
                          : 'bg-blue-950/60 border-blue-600 text-blue-100'
                        : isLight
                        ? 'bg-rose-100/90 border-rose-400 text-rose-950'
                        : 'bg-rose-950/60 border-rose-600 text-rose-100'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          difference === 0
                            ? 'bg-emerald-600 text-white'
                            : difference > 0
                            ? 'bg-blue-600 text-white'
                            : 'bg-rose-600 text-white'
                        }`}>
                          {difference === 0 ? (
                            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                          ) : difference > 0 ? (
                            <Sparkles className="w-6 h-6 stroke-[2.5]" />
                          ) : (
                            <AlertTriangle className="w-6 h-6 stroke-[2.5] animate-bounce" />
                          )}
                        </div>
                        <div>
                          <div className="font-black text-sm sm:text-base">
                            {difference === 0 ? '¡Caja Cuadrada Exacta!' : difference > 0 ? 'Sobrante en Caja' : 'Faltante / Descuadre en Caja'}
                          </div>
                          <div className={`text-xs font-semibold ${
                            isLight
                              ? difference === 0 ? 'text-emerald-900' : difference > 0 ? 'text-blue-900' : 'text-rose-900'
                              : 'text-slate-200'
                          }`}>
                            {difference === 0 ? 'El dinero físico coincide perfectamente con el cálculo del sistema' : difference > 0 ? 'Hay más dinero en cajón del registrado por el sistema' : 'Falta dinero en cajón respecto al cálculo del sistema'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xl sm:text-2xl font-black font-mono tracking-tight">
                          {difference >= 0 ? `+${difference.toFixed(2)}` : difference.toFixed(2)} {currency}
                        </div>
                      </div>
                    </div>

                    {/* Close notes */}
                    <div className="space-y-1">
                      <label className={`block text-xs font-bold ${
                        isLight ? 'text-slate-700' : 'text-slate-300'
                      }`}>
                        Observaciones del Cierre Z
                      </label>
                      <input
                        type="text"
                        value={closeNotes}
                        onChange={(e) => setOpenCloseNotes(e.target.value)}
                        placeholder="Ej: Cierre de turno verificado por cajera y supervisor..."
                        className={`w-full px-4 py-3 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          isLight ? 'bg-slate-50 border-slate-300 text-slate-950 placeholder-slate-400' : 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                        }`}
                      />
                    </div>

                    <button
                      onClick={handleCloseShiftSubmit}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-purple-600/40 active:scale-98 transition-all flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Realizar Cierre Z Oficial & Bloquear Turno</span>
                    </button>
                  </>
                ) : (
                  /* Success Screen with Printable Z Ticket preview */
                  <div className="space-y-4 text-center py-2">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>
                        ¡Cierre Z {lastClosedReport.id} Generado con Éxito!
                      </h3>
                      <p className={`text-xs mt-1 font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        La caja ha sido cerrada y los datos han sido archivados en el historial fiscal.
                      </p>
                    </div>

                    {/* Printable Report Summary */}
                    <div className={`p-5 rounded-2xl border text-left font-mono text-xs space-y-2 shadow-inner ${
                      isLight ? 'bg-white border-slate-300 text-slate-950' : 'bg-slate-950 border-slate-800 text-white'
                    }`}>
                      <div className="flex justify-between border-b border-dashed pb-2 font-black">
                        <span>INFORME FISCAL Z</span>
                        <span>{lastClosedReport.date} {lastClosedReport.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>Responsable Cierre:</span>
                        <span className="font-bold">{lastClosedReport.closedBy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>Fondo Inicial:</span>
                        <span className="font-bold">{lastClosedReport.initialCash.toFixed(2)}{currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>Ventas Efectivo:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{lastClosedReport.cashSales.toFixed(2)}{currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>Ventas Tarjeta:</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">{lastClosedReport.cardSales.toFixed(2)}{currency}</span>
                      </div>
                      <div className="flex justify-between font-black border-t pt-2 text-sm">
                        <span>TOTAL VENTAS:</span>
                        <span>{lastClosedReport.totalSales.toFixed(2)}{currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>Efectivo Contado:</span>
                        <span className="font-black text-purple-600 dark:text-purple-400">{lastClosedReport.cashCounted.toFixed(2)}{currency}</span>
                      </div>
                      <div className={`flex justify-between font-black pt-1 border-t border-dashed ${
                        lastClosedReport.difference === 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        <span>DIFERENCIA / DESCUADRE:</span>
                        <span>{lastClosedReport.difference >= 0 ? `+${lastClosedReport.difference.toFixed(2)}` : lastClosedReport.difference.toFixed(2)}{currency}</span>
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-2">
                      <button
                        onClick={() => {
                          sound.playPrinter();
                          window.print();
                        }}
                        className="flex-1 py-3.5 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center gap-2 hover:bg-purple-500 shadow-md shadow-purple-600/30"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Imprimir Ticket Z</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsCashShiftModalOpen(false);
                          setLastClosedReport(null);
                        }}
                        className={`flex-1 py-3.5 rounded-xl font-bold text-xs border ${
                          isLight
                            ? 'bg-slate-200 border-slate-300 text-slate-800 hover:bg-slate-300'
                            : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        Cerrar Ventana
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
        </>
      )}
      </div>
    </div>
  );
};
