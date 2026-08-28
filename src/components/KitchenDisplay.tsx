import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import {
  ChefHat, Clock, CheckCircle2, AlertTriangle, Filter,
  Sparkles, CheckCheck, RefreshCw, Eye, Flame, BellRing, Utensils,
  LogOut, UserCheck, ShieldCheck, Lock
} from 'lucide-react';
import { Sale } from '../types';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';

export const KitchenDisplay: React.FC = () => {
  const { sales, markKitchenItemServed, markAllKitchenItemsServed, themeMode, waiter, logout, setIsLoginModalOpen } = usePOS();
  const [filterBlock, setFilterBlock] = useState<number | 'all'>('all');
  const isLight = themeMode === 'vibrant-light';

  // Timer refresh ticker every 15 seconds
  const [, setTick] = useState<number>(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 15000);
    return () => clearInterval(timer);
  }, []);

  // Filter open sales that have items for kitchen
  const kitchenSales = sales.filter(s =>
    s.status === 'open' &&
    s.items.some(item => item.kitchenStatus === 'cooking' || item.kitchenStatus === 'pending' || item.kitchenStatus === 'ready')
  );

  const getElapsedTimeInMinutes = (createdAt: string): number => {
    try {
      const start = new Date(createdAt).getTime();
      const now = new Date().getTime();
      return Math.max(0, Math.floor((now - start) / (1000 * 60)));
    } catch {
      return 5;
    }
  };

  const handleServeItem = (saleId: number, itemId: string) => {
    sound.playKitchenBell();
    markKitchenItemServed(saleId, itemId);
  };

  const handleServeAll = (saleId: number) => {
    sound.playKitchenBell();
    markAllKitchenItemsServed(saleId);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {}
  };

  return (
    <div className={`flex-1 flex flex-col h-full p-4 sm:p-6 overflow-y-auto select-none transition-colors ${
      isLight ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* KDS Header with vibrant status */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b ${
        isLight ? 'border-slate-200' : 'border-slate-800/80'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 border border-amber-400/50 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
            <ChefHat className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black flex items-center gap-2.5">
              <span>Panel de Cocina Táctil (KDS)</span>
              <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs px-3 py-0.5 rounded-full font-black shadow-md shadow-amber-600/30">
                {kitchenSales.length} Comandas en Curso
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Control de tiempos y orden de preparación para cocina y pase</p>
          </div>
        </div>

        {/* Course Filters & Session Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter by Block / Course */}
          <div className={`flex items-center gap-1.5 p-1 rounded-2xl border shadow-inner ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <span className="text-xs text-slate-500 dark:text-slate-400 px-2.5 flex items-center gap-1 font-bold">
              <Filter className="w-3.5 h-3.5 text-amber-500" /> Pase:
            </span>
            <button
              onClick={() => {
                sound.playTap();
                setFilterBlock('all');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                filterBlock === 'all'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todos
            </button>
            {[
              { id: 1, label: '1º Entrantes' },
              { id: 2, label: '2º Principales' },
              { id: 3, label: '3º Postres' },
            ].map(blk => (
              <button
                key={blk.id}
                onClick={() => {
                  sound.playTap();
                  setFilterBlock(blk.id);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  filterBlock === blk.id
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {blk.label}
              </button>
            ))}
          </div>

          {/* Quick Exit & Switch User Controls */}
          <div className="flex items-center gap-2">
            <button
              id="kds-switch-user-btn"
              onClick={() => {
                sound.playTap();
                setIsLoginModalOpen(true);
              }}
              title="Cambiar a Garzón, Cajera o Administrador"
              className={`px-3 py-2 rounded-2xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                isLight
                  ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Cambiar Usuario</span>
            </button>

            <button
              id="kds-logout-btn"
              onClick={() => {
                sound.playTap();
                logout();
              }}
              title="Cerrar sesión de Cocina y volver a la pantalla de PIN"
              className="px-3.5 py-2 rounded-2xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white border border-rose-500 transition-all flex items-center gap-1.5 shadow-md shadow-rose-600/30 active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir del Sistema</span>
            </button>
          </div>
        </div>
      </div>

      {/* Orders Stream Grid */}
      {kitchenSales.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
          <div className={`w-20 h-20 rounded-3xl border flex items-center justify-center mb-4 shadow-xl ${
            isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-600' : 'bg-emerald-950/80 border-emerald-600/40 text-emerald-400'
          }`}>
            <CheckCheck className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black">¡Cocina al día! Sin comandas pendientes</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1.5 leading-relaxed">
            Todas las comandas de salón y terraza han sido completadas y servidas. Las nuevas comandas aparecerán aquí con alerta sonora automática.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 mt-4">
          {kitchenSales.map((sale) => {
            const elapsed = getElapsedTimeInMinutes(sale.createdAt);
            const isUrgent = elapsed >= 20;
            const isWarning = elapsed >= 10 && elapsed < 20;

            const blocks = [1, 2, 3].filter(b => filterBlock === 'all' || filterBlock === b);

            return (
              <div
                key={sale.id}
                id={`kds-card-${sale.id}`}
                className={`flex flex-col rounded-3xl overflow-hidden border shadow-2xl transition-all ${
                  isUrgent
                    ? isLight ? 'bg-white border-rose-500 ring-2 ring-rose-400' : 'bg-slate-900 border-rose-500 ring-1 ring-rose-500'
                    : isWarning
                    ? isLight ? 'bg-white border-amber-500 ring-2 ring-amber-400' : 'bg-slate-900 border-amber-500/80'
                    : isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}
              >
                {/* Header with High-Contrast Color Alert */}
                <div className={`p-4 border-b flex items-center justify-between ${
                  isUrgent
                    ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white'
                    : isWarning
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                    : isLight
                    ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white'
                    : 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-slate-800 text-slate-200'
                }`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-lg text-white tracking-wide">
                        {sale.tableName}
                      </span>
                      <span className="text-xs bg-black/30 px-2 py-0.5 rounded-md font-bold text-white">
                        {sale.diners} pax
                      </span>
                    </div>
                    <span className="text-[11px] opacity-90 block font-mono mt-0.5">
                      Abierta por: {sale.waiterName} {sale.currentWaiterName && sale.currentWaiterName !== sale.waiterName ? `(Comandando: ${sale.currentWaiterName})` : ''} • #{sale.number}
                    </span>
                  </div>

                  {/* Timer Badge */}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-black shadow-md ${
                    isUrgent
                      ? 'bg-white text-rose-700 animate-pulse shadow-md ring-2 ring-white/50'
                      : isWarning
                      ? 'bg-white text-amber-900 shadow-md'
                      : 'bg-emerald-500 text-white shadow-sm'
                  }`}>
                    <Clock className="w-4 h-4" />
                    <span>{elapsed} min</span>
                  </div>
                </div>

                {/* Body / Kitchen Blocks */}
                <div className="p-3.5 flex-1 space-y-3.5 overflow-y-auto max-h-[380px]">
                  {blocks.map(blockNum => {
                    const blockItems = sale.items.filter(i =>
                      i.kitchenBlock === blockNum &&
                      (i.kitchenStatus === 'cooking' || i.kitchenStatus === 'pending' || i.kitchenStatus === 'ready')
                    );

                    if (blockItems.length === 0) return null;

                    return (
                      <div key={blockNum} className="space-y-2">
                        <div className="text-[11px] font-black uppercase tracking-wider flex items-center justify-between">
                          <span className={`flex items-center gap-1.5 ${
                            blockNum === 1 ? 'text-blue-600 dark:text-blue-400' :
                            blockNum === 2 ? 'text-amber-600 dark:text-amber-400' :
                            'text-pink-600 dark:text-pink-400'
                          }`}>
                            <span className={`w-2.5 h-2.5 rounded-full ${
                              blockNum === 1 ? 'bg-blue-500' :
                              blockNum === 2 ? 'bg-amber-500' :
                              'bg-pink-500'
                            }`} />
                            <span>{blockNum}º Pase {blockNum === 1 ? '(Entrantes)' : blockNum === 2 ? '(Principales)' : '(Postres)'}</span>
                          </span>
                        </div>

                        <div className="space-y-2">
                          {blockItems.map(item => {
                            return (
                              <div
                                key={item.id}
                                className={`flex items-start justify-between gap-2.5 p-3 rounded-2xl border transition-all shadow-sm group ${
                                  isLight
                                    ? 'bg-slate-50 border-slate-200 hover:border-amber-400'
                                    : 'bg-slate-950/90 border-slate-800/90 hover:border-amber-500/50'
                                }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-black text-xs flex items-center justify-center font-mono shadow-sm">
                                      {item.quantity}x
                                    </span>
                                    <span className={`font-extrabold text-xs sm:text-sm transition-colors ${
                                      isLight ? 'text-slate-800 group-hover:text-amber-600' : 'text-slate-100 group-hover:text-amber-300'
                                    }`}>
                                      {item.productName}
                                    </span>
                                  </div>

                                  {/* Employee Attribution Badge & Time */}
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border ${
                                      (item.sentByWaiterName || item.waiterName) && (item.sentByWaiterName || item.waiterName) !== sale.waiterName
                                        ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700'
                                        : isLight
                                        ? 'bg-slate-200/80 text-slate-700 border-slate-300'
                                        : 'bg-slate-800 text-slate-300 border-slate-700'
                                    }`}>
                                      <span className="text-[11px]">👤</span>
                                      <span>Pedido por: <strong className="uppercase">{item.sentByWaiterName || item.waiterName || sale.waiterName}</strong></span>
                                      {item.addedAtTime && <span className="opacity-70 font-normal">({item.addedAtTime})</span>}
                                    </span>
                                  </div>

                                  {(item.selectedOption || item.kitchenNotes || item.observations) && (
                                    <div className={`text-xs px-2.5 py-1 rounded-xl mt-1.5 font-bold border ${
                                      isLight
                                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                                        : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                                    }`}>
                                      {item.selectedOption && `• ${item.selectedOption} `}
                                      {item.kitchenNotes && `[${item.kitchenNotes}] `}
                                      {item.observations}
                                    </div>
                                  )}
                                </div>

                                <button
                                  id={`serve-item-btn-${item.id}`}
                                  onClick={() => handleServeItem(sale.id, item.id)}
                                  className="touch-btn px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-sm transition-all shrink-0"
                                >
                                  Listo ✓
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Button: Marcar Todo Servido */}
                <div className={`p-3 border-t ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}>
                  <button
                    id={`serve-all-btn-${sale.id}`}
                    onClick={() => handleServeAll(sale.id)}
                    className="touch-btn w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Marcar Comanda Completa Servida</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
