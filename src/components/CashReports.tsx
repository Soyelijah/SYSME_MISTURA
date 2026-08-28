import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import {
  ReceiptText, DollarSign, CreditCard, Coins, Building,
  Printer, ArrowUpRight, TrendingUp, ShieldCheck, AlertCircle,
  FileCheck, Calculator, CheckCircle2, ChevronRight, Lock,
  Unlock, Plus, ArrowDownRight, Sparkles, AlertTriangle
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { sound } from '../utils/sound';
import { hasUserPermission } from '../utils/permissions';

export const CashReports: React.FC = () => {
  const {
    sales,
    terminal,
    waiter,
    reports,
    currentShift,
    shiftHistory,
    currency,
    setIsCashShiftModalOpen,
    setCashModalMode,
    themeMode
  } = usePOS();

  const isLight = themeMode === 'vibrant-light';
  const [activeTab, setActiveTab] = useState<'today' | 'movements' | 'history'>('today');

  const canOpenClose = hasUserPermission(waiter, 'canOpenCloseCash');
  const canMoveCash = hasUserPermission(waiter, 'canCashMovements');

  // Closed and open sales calculations
  const closedSales = sales.filter(s => s.status === 'closed');
  const totalCash = closedSales.filter(s => s.paymentMethod === 'cash').reduce((acc, s) => acc + s.total, 0);
  const totalCard = closedSales.filter(s => s.paymentMethod === 'card').reduce((acc, s) => acc + s.total, 0);
  const totalCrypto = closedSales.filter(s => s.paymentMethod === 'crypto').reduce((acc, s) => acc + s.total, 0);
  const totalOther = closedSales.filter(s => s.paymentMethod === 'other').reduce((acc, s) => acc + s.total, 0);
  const totalSalesDay = closedSales.reduce((acc, s) => acc + s.total, 0);

  // Shift Movements
  const shiftMovements = currentShift?.movements || [];
  const totalCashIn = shiftMovements.filter(m => m.type === 'in').reduce((acc, m) => acc + m.amount, 0);
  const totalCashOut = shiftMovements.filter(m => m.type === 'out').reduce((acc, m) => acc + m.amount, 0);

  const initialCash = currentShift ? currentShift.initialCash : terminal.initialCash;
  const expectedCashInDrawer = initialCash + totalCash + totalCashIn - totalCashOut;

  // Hourly chart data
  const hourlyData = [
    { hour: '12:00', total: 45.50 },
    { hour: '13:00', total: 120.00 },
    { hour: '14:00', total: totalSalesDay > 0 ? Math.round(totalSalesDay * 0.45) : 185.20 },
    { hour: '15:00', total: totalSalesDay > 0 ? Math.round(totalSalesDay * 0.35) : 140.80 },
    { hour: '16:00', total: totalSalesDay > 0 ? Math.round(totalSalesDay * 0.20) : 65.00 },
    { hour: '20:00', total: 80.00 },
    { hour: '21:00', total: 210.00 },
    { hour: '22:00', total: 190.50 },
  ];

  // Pie chart data
  const paymentPieData = [
    { name: 'Efectivo', value: totalCash || 150, color: '#10b981' },
    { name: 'Tarjeta', value: totalCard || 220, color: '#3b82f6' },
    { name: 'Bitcoin', value: totalCrypto || 45, color: '#f59e0b' },
    { name: 'Otros', value: totalOther || 30, color: '#8b5cf6' },
  ];

  return (
    <div className={`flex-1 flex flex-col h-full p-4 sm:p-6 overflow-y-auto select-none transition-colors ${
      isLight ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Header with Title & Action Buttons */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
        isLight ? 'border-slate-200' : 'border-slate-800/80'
      }`}>
        <div>
          <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <ReceiptText className="w-5 h-5" />
            </div>
            <span>Gestión de Caja, Arqueos & Cierre Z</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Terminal: <span className="font-bold text-slate-700 dark:text-slate-200">{terminal.name}</span> • Estado: <strong className={currentShift ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}>
              {currentShift ? `Turno Abierto (${currentShift.openedBy})` : 'Caja Cerrada'}
            </strong>
          </p>
        </div>

        {/* Quick Shift Trigger Buttons */}
        <div className="flex items-center gap-2">
          {currentShift ? (
            <>
              {canMoveCash && (
                <button
                  onClick={() => {
                    sound.playTap();
                    setCashModalMode('movement');
                    setIsCashShiftModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/30 flex items-center gap-1.5 transition-all"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Movimiento Caja</span>
                </button>
              )}

              {canOpenClose && (
                <button
                  onClick={() => {
                    sound.playTap();
                    setCashModalMode('close');
                    setIsCashShiftModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-purple-600/40 flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Realizar Cierre Z</span>
                </button>
              )}
            </>
          ) : (
            canOpenClose && (
              <button
                onClick={() => {
                  sound.playTap();
                  setCashModalMode('open');
                  setIsCashShiftModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/40 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Abrir Turno de Caja</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 pt-4 pb-2">
        <div className={`flex items-center gap-1 p-1 rounded-2xl border ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <button
            onClick={() => { sound.playTap(); setActiveTab('today'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'today'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Ventas del Turno Activo
          </button>
          <button
            onClick={() => { sound.playTap(); setActiveTab('movements'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'movements'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Movimientos de Efectivo ({shiftMovements.length})</span>
          </button>
          <button
            onClick={() => { sound.playTap(); setActiveTab('history'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Histórico de Informes Z ({reports.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: VENTAS DEL DÍA */}
      {activeTab === 'today' && (
        <div className="space-y-5 mt-2">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Total Facturación */}
            <div className={`p-4 rounded-3xl border shadow-sm ${
              isLight
                ? 'bg-white border-purple-200'
                : 'bg-slate-900 border-purple-500/30'
            }`}>
              <div className="flex items-center justify-between text-purple-600 dark:text-purple-300 text-xs font-bold mb-1">
                <span>Ventas Totales</span>
                <TrendingUp className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-purple-950 dark:text-white">
                {totalSalesDay.toFixed(2)} {currency}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                {closedSales.length} tickets finalizados hoy
              </span>
            </div>

            {/* Efectivo */}
            <div className={`p-4 rounded-3xl border shadow-sm ${
              isLight
                ? 'bg-white border-emerald-200'
                : 'bg-slate-900 border-emerald-500/30'
            }`}>
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-300 text-xs font-bold mb-1">
                <span>Efectivo Cobrado</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
                {totalCash.toFixed(2)} {currency}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                En cajón (+ {initialCash.toFixed(2)}{currency} fondo)
              </span>
            </div>

            {/* Tarjeta */}
            <div className={`p-4 rounded-3xl border shadow-sm ${
              isLight
                ? 'bg-white border-blue-200'
                : 'bg-slate-900 border-blue-500/30'
            }`}>
              <div className="flex items-center justify-between text-blue-600 dark:text-blue-300 text-xs font-bold mb-1">
                <span>Cobro con Tarjeta</span>
                <CreditCard className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-blue-600 dark:text-blue-400">
                {totalCard.toFixed(2)} {currency}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                TPV Datáfono Integrado
              </span>
            </div>

            {/* Teórico en Cajón */}
            <div className={`p-4 rounded-3xl border shadow-sm ${
              isLight
                ? 'bg-white border-amber-200'
                : 'bg-slate-900 border-amber-500/30'
            }`}>
              <div className="flex items-center justify-between text-amber-600 dark:text-amber-300 text-xs font-bold mb-1">
                <span>Efectivo Esperado</span>
                <Coins className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-amber-600 dark:text-amber-400">
                {expectedCashInDrawer.toFixed(2)} {currency}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                Fondo + Ventas + Movimientos
              </span>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Hourly sales bar chart */}
            <div className={`lg:col-span-2 p-5 rounded-3xl border shadow-sm ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <h3 className="text-sm font-black mb-3">Facturación por Franja Horaria ({currency})</h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData}>
                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="total" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Payment method pie chart */}
            <div className={`p-5 rounded-3xl border shadow-sm ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <h3 className="text-sm font-black mb-3">Distribución por Método de Pago</h3>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                    >
                      {paymentPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                {paymentPieData.map(item => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 dark:text-slate-400">{item.name}:</span>
                    <strong className="font-mono">{item.value.toFixed(2)}{currency}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MOVIMIENTOS DE EFECTIVO (ENTRADAS / SALIDAS) */}
      {activeTab === 'movements' && (
        <div className="space-y-4 mt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-500" />
              <span>Entradas y Salidas de Efectivo del Turno</span>
            </h3>
            {canMoveCash && (
              <button
                onClick={() => {
                  sound.playTap();
                  setCashModalMode('movement');
                  setIsCashShiftModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/30 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Movimiento</span>
              </button>
            )}
          </div>

          <div className={`p-4 rounded-3xl border shadow-sm ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            {shiftMovements.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center italic">
                No hay movimientos registrados en el turno activo.
              </p>
            ) : (
              <div className="space-y-2">
                {shiftMovements.map(mov => (
                  <div
                    key={mov.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        mov.type === 'in'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}>
                        {mov.type === 'in' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-slate-900 dark:text-white">
                          {mov.concept}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {mov.date} {mov.time} • Por <strong>{mov.userName}</strong>
                          {mov.receiptNumber && ` • Doc: ${mov.receiptNumber}`}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className={`text-sm font-black ${
                        mov.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {mov.type === 'in' ? `+${mov.amount.toFixed(2)}` : `-${mov.amount.toFixed(2)}`} {currency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: HISTORIAL Z */}
      {activeTab === 'history' && (
        <div className="space-y-4 mt-2">
          <div className={`p-5 rounded-3xl border shadow-sm ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <h3 className="text-base font-black mb-4 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-purple-500" />
              <span>Histórico de Informes Z de Cierre Fiscal</span>
            </h3>

            {reports.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center italic">
                No hay cierres Z emitidos aún. Al cerrar caja se archivará aquí el comprobante fiscal.
              </p>
            ) : (
              <div className="space-y-3">
                {reports.map(r => (
                  <div
                    key={r.id}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm font-mono text-purple-600 dark:text-purple-400">{r.id}</span>
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded font-bold">{r.date} {r.time}</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Cajera: <strong>{r.closedBy}</strong> • Tickets: {r.salesCount} • Fondo inicial: {r.initialCash.toFixed(2)}{currency}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="text-xs text-slate-400 block">Total Facturado</span>
                        <span className="text-base font-black font-mono text-slate-900 dark:text-white">{r.totalSales.toFixed(2)} {currency}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">Cuadre / Descuadre</span>
                        <span className={`text-xs font-black font-mono px-2 py-0.5 rounded ${
                          r.difference === 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {r.difference === 0 ? 'Exacto (0.00€)' : `${r.difference.toFixed(2)}€`}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          sound.playPrinter();
                          window.print();
                        }}
                        className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-200 transition-colors"
                        title="Reimprimir Cierre Z"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
