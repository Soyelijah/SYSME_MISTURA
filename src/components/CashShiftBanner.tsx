import React from 'react';
import { usePOS } from '../context/POSContext';
import { Lock, Unlock, AlertCircle, Coins, ArrowRight, ShieldCheck, Monitor, Smartphone, ChefHat } from 'lucide-react';
import { sound } from '../utils/sound';
import { hasUserPermission } from '../utils/permissions';

export const CashShiftBanner: React.FC = () => {
  const {
    currentShift,
    setIsCashShiftModalOpen,
    setCashModalMode,
    stationMode,
    setStationMode,
    currency,
    waiter,
    themeMode
  } = usePOS();

  const isLight = themeMode === 'vibrant-light';
  const canOpenClose = hasUserPermission(waiter, 'canOpenCloseCash');
  const canMoveCash = hasUserPermission(waiter, 'canCashMovements');

  // If cash register is NOT open
  if (!currentShift || currentShift.status !== 'open') {
    return (
      <div className="bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 text-white px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-black text-sm block leading-tight">
              ⚠️ Caja Central Cerrada — Se requiere Apertura de Turno
            </span>
            <span className="text-[11px] opacity-90">
              {canOpenClose
                ? 'Abra la caja para registrar el fondo inicial del turno.'
                : 'Solo Cajeras o Administradores pueden abrir caja e ingresar el fondo inicial.'}
            </span>
          </div>
        </div>

        {canOpenClose ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playTap();
                setCashModalMode('open');
                setIsCashShiftModalOpen(true);
              }}
              className="px-4 py-1.5 rounded-xl bg-white text-rose-700 hover:bg-rose-50 font-black text-xs shadow-md shadow-black/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Abrir Caja Ahora</span>
            </button>
          </div>
        ) : (
          <div className="text-[11px] font-medium bg-black/20 px-3 py-1 rounded-lg border border-white/20 text-white/90">
            Perfil Garzón: Esperando apertura de caja
          </div>
        )}
      </div>
    );
  }

  // If cash register is open: compact helpful bar
  return (
    <div className={`px-4 py-1.5 border-b flex flex-wrap items-center justify-between text-xs gap-2 transition-colors ${
      isLight ? 'bg-emerald-50/80 border-emerald-200/80 text-emerald-950' : 'bg-emerald-950/40 border-emerald-900/60 text-emerald-200'
    }`}>
      {/* Left: Shift Status */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="font-bold">
          Caja Abierta: <span className="font-mono">{currentShift.initialCash.toFixed(2)}{currency}</span> (Fondo)
        </span>
        <span className="opacity-60 hidden sm:inline">•</span>
        <span className="hidden sm:inline text-[11px] opacity-80">
          Iniciada por <strong>{currentShift.openedBy}</strong> a las {currentShift.openedAtTime}
        </span>
      </div>

      {/* Right: Actions & Privileges */}
      <div className="flex items-center gap-2">
        {canMoveCash && (
          <button
            onClick={() => {
              sound.playTap();
              setCashModalMode('movement');
              setIsCashShiftModalOpen(true);
            }}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all flex items-center gap-1 ${
              isLight
                ? 'bg-white hover:bg-emerald-100/50 border-emerald-300 text-emerald-800'
                : 'bg-emerald-900/60 hover:bg-emerald-800 border-emerald-700 text-emerald-100'
            }`}
          >
            <Coins className="w-3 h-3 text-emerald-500" />
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
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-black transition-all flex items-center gap-1 ${
              isLight
                ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500 shadow-xs'
                : 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500'
            }`}
          >
            <Lock className="w-3 h-3" />
            <span>Cerrar Caja (Z)</span>
          </button>
        )}

        {!canOpenClose && !canMoveCash && (
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
            isLight ? 'bg-emerald-100/70 border-emerald-300 text-emerald-800' : 'bg-emerald-900/40 border-emerald-800 text-emerald-300'
          }`}>
            Caja gestionada por: {currentShift.openedBy}
          </span>
        )}
      </div>
    </div>
  );
};
