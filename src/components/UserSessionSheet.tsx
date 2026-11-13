import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import {
  User, ShieldCheck, Lock, LogOut, Sun, Moon, Volume2, VolumeX,
  X, Check, Sparkles, ChevronRight, Store, MonitorDot, Clock,
  Smartphone, Coins, ChefHat, KeyRound, AlertCircle, RefreshCw, ArrowLeft
} from 'lucide-react';
import { sound } from '../utils/sound';
import { Waiter } from '../types';

interface UserSessionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserSessionSheet: React.FC<UserSessionSheetProps> = ({ isOpen, onClose }) => {
  const {
    waiter,
    waiters,
    loginUser,
    logout,
    themeMode,
    setThemeMode,
    restaurantBrand,
    terminal,
    warehouse,
    currentShift,
  } = usePOS();

  const isLight = themeMode === 'vibrant-light';
  const [viewMode, setViewMode] = useState<'profile' | 'switch-list' | 'pin-pad'>('profile');
  const [selectedUserToSwitch, setSelectedUserToSwitch] = useState<Waiter | null>(null);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [isSoundOn, setIsSoundOn] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleToggleSound = () => {
    const newVal = sound.toggleSound();
    setIsSoundOn(newVal);
  };

  const getRoleMetadata = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          title: 'Administrador / Gerente',
          pill: 'bg-purple-600 text-white border-purple-500',
          badgeBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-400/30',
          icon: ShieldCheck,
          emoji: '🛡️'
        };
      case 'manager':
        return {
          title: 'Encargado / Manager',
          pill: 'bg-indigo-600 text-white border-indigo-500',
          badgeBg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-400/30',
          icon: ShieldCheck,
          emoji: '👔'
        };
      case 'cashier':
        return {
          title: 'Cajera Principal',
          pill: 'bg-emerald-600 text-white border-emerald-500',
          badgeBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-400/30',
          icon: Coins,
          emoji: '💰'
        };
      case 'kitchen':
        return {
          title: 'Cocina / Chef KDS',
          pill: 'bg-amber-600 text-white border-amber-500',
          badgeBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-400/30',
          icon: ChefHat,
          emoji: '🍳'
        };
      case 'delivery':
        return {
          title: 'Repartidor / Delivery',
          pill: 'bg-orange-600 text-white border-orange-500',
          badgeBg: 'bg-orange-500/15 text-orange-600 dark:text-orange-300 border-orange-400/30',
          icon: Smartphone,
          emoji: '🛵'
        };
      case 'waiter':
      default:
        return {
          title: 'Garzón / Sala',
          pill: 'bg-blue-600 text-white border-blue-500',
          badgeBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-400/30',
          icon: Smartphone,
          emoji: '📱'
        };
    }
  };

  const roleMeta = getRoleMetadata(waiter.role);

  const handleDigit = (digit: string) => {
    sound.playTap();
    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      setPinError(null);

      if (nextPin.length === 4 && selectedUserToSwitch) {
        verifyPinAndSwitch(nextPin, selectedUserToSwitch);
      }
    }
  };

  const handleBackspace = () => {
    sound.playTap();
    setPinInput(prev => prev.slice(0, -1));
    setPinError(null);
  };

  const handleClear = () => {
    sound.playTap();
    setPinInput('');
    setPinError(null);
  };

  const verifyPinAndSwitch = (pinToTest: string, userToLogin: Waiter) => {
    const success = loginUser(userToLogin, pinToTest);
    if (success) {
      sound.playSuccess();
      setViewMode('profile');
      setSelectedUserToSwitch(null);
      setPinInput('');
      onClose();
    } else {
      sound.playBeep();
      setPinError('PIN incorrecto. Inténtelo de nuevo.');
      setPinInput('');
    }
  };

  const handleClose = () => {
    sound.playTap();
    setViewMode('profile');
    setSelectedUserToSwitch(null);
    setPinInput('');
    setPinError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-3 sm:p-4 sm:pt-14 select-none pointer-events-none animate-in fade-in duration-150">
      
      {/* Non-intrusive backdrop: transparent and subtle, leaves workspace 100% visible */}
      <div className="fixed inset-0 z-40 bg-black/15 pointer-events-auto" onClick={handleClose} />

      {/* Floating Popover Container anchored at top right */}
      <div className={`pointer-events-auto relative w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden z-50 my-auto sm:my-0 transition-all ${
        isLight
          ? 'bg-white border-slate-300 text-slate-900 shadow-slate-950/20'
          : 'bg-slate-900 border-slate-800 text-white shadow-black/80'
      }`}>

        {/* Top Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-950/80 border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            {viewMode !== 'profile' ? (
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  if (viewMode === 'pin-pad') {
                    setViewMode('switch-list');
                    setPinInput('');
                    setPinError(null);
                  } else {
                    setViewMode('profile');
                  }
                }}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                  isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title="Volver"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
                <User className="w-4 h-4" />
              </div>
            )}

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block leading-tight">
                {viewMode === 'profile' ? 'Sesión de Trabajo' : viewMode === 'switch-list' ? 'Cambio Rápido' : 'Seguridad PIN'}
              </span>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                {viewMode === 'profile' ? 'Perfil del Usuario' : viewMode === 'switch-list' ? 'Seleccionar Garzón' : 'Confirmar Ingreso'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
              isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">

          {/* VIEW 1: Main Active Profile */}
          {viewMode === 'profile' && (
            <>
              {/* User Hero Identity Box */}
              <div className={`p-4 rounded-2xl border relative overflow-hidden ${
                isLight
                  ? 'bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-white border-indigo-200 shadow-xs'
                  : 'bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border-indigo-900/60 shadow-inner'
              }`}>
                <div className="flex items-center gap-3.5">
                  <div className="relative shrink-0">
                    <img
                      src={waiter.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={waiter.name}
                      referrerPolicy="no-referrer"
                      className="w-13 h-13 rounded-2xl object-cover border-2 border-indigo-500 shadow-md"
                    />
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center" title="Activo">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider ${roleMeta.badgeBg}`}>
                        {roleMeta.emoji} {roleMeta.title}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        ID: #{String(waiter.id).padStart(3, '0')}
                      </span>
                    </div>

                    <h2 className="text-base font-black tracking-tight truncate mt-1 text-slate-900 dark:text-white">
                      {waiter.name}
                    </h2>

                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                      <Store className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{terminal.name}</span>
                      <span className="opacity-40">•</span>
                      <span>{warehouse.name}</span>
                    </p>
                  </div>
                </div>

                {/* Shift status row */}
                <div className={`mt-3 pt-3 border-t flex items-center justify-between text-xs font-bold ${
                  isLight ? 'border-indigo-100 text-slate-700' : 'border-indigo-950 text-slate-300'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${currentShift ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span>{currentShift ? 'Turno de Caja Abierto' : 'Sin Turno de Caja'}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Sesión Segura</span>
                  </span>
                </div>
              </div>

              {/* Action: Switch User Button */}
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  setViewMode('switch-list');
                }}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-[0.99] cursor-pointer ${
                  isLight
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-900 shadow-2xs'
                    : 'bg-slate-950/70 hover:bg-slate-800 border-slate-800 text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm">Cambiar de Garzón / Usuario</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Alternar turno rápidamente con PIN ({waiters.length} disponibles)
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {/* Preferences Row: Theme & Sound */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    sound.playTap();
                    setThemeMode(isLight ? 'vibrant-dark' : 'vibrant-light');
                  }}
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                    isLight
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800 shadow-2xs'
                      : 'bg-slate-950/70 hover:bg-slate-800 border-slate-800 text-white'
                  }`}
                >
                  {isLight ? <Sun className="w-4 h-4 text-amber-500 shrink-0" /> : <Moon className="w-4 h-4 text-sky-400 shrink-0" />}
                  <span className="truncate">{isLight ? 'Modo Claro' : 'Modo Oscuro'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleSound}
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                    isLight
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800 shadow-2xs'
                      : 'bg-slate-950/70 hover:bg-slate-800 border-slate-800 text-white'
                  }`}
                >
                  {isSoundOn ? <Volume2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <VolumeX className="w-4 h-4 opacity-50 shrink-0" />}
                  <span className="truncate">{isSoundOn ? 'Sonido Activado' : 'Silencio'}</span>
                </button>
              </div>

              {/* Exit / Logout Button */}
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  handleClose();
                  logout();
                }}
                className="w-full p-3.5 bg-rose-600 hover:bg-rose-500 active:scale-[0.99] text-white rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md shadow-rose-600/30 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Bloquear Terminal / Salir del Sistema</span>
              </button>
            </>
          )}

          {/* VIEW 2: Switch User List */}
          {viewMode === 'switch-list' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Seleccione el usuario que ingresará:
              </label>

              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                {waiters.filter(w => w.active !== false).map(u => {
                  const isCurrent = u.id === waiter.id;
                  const uMeta = getRoleMetadata(u.role);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        sound.playTap();
                        setSelectedUserToSwitch(u);
                        setViewMode('pin-pad');
                        setPinInput('');
                        setPinError(null);
                      }}
                      className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400'
                          : isLight
                          ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                          : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
                      }`}
                    >
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={u.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-xl object-cover shrink-0 border border-white/40 shadow-2xs"
                      />
                      <div className="min-w-0 flex-1">
                        <span className={`text-xs font-black block truncate ${isCurrent ? 'text-white' : ''}`}>
                          {u.name.split(' ')[0]}
                        </span>
                        <span className={`text-[9px] font-bold block uppercase tracking-wider ${
                          isCurrent ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {uMeta.emoji} {u.role === 'admin' ? 'Admin' : u.role === 'manager' ? 'Manager' : u.role === 'cashier' ? 'Cajera' : u.role === 'kitchen' ? 'Cocina' : u.role === 'delivery' ? 'Reparto' : 'Garzón'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 3: Numeric Keypad for PIN */}
          {viewMode === 'pin-pad' && selectedUserToSwitch && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-3 p-3 rounded-2xl border border-indigo-500/30 bg-indigo-500/5">
                <img
                  src={selectedUserToSwitch.avatar || ''}
                  alt={selectedUserToSwitch.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-xl object-cover border-2 border-indigo-500"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Ingresar como:</span>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white truncate">{selectedUserToSwitch.name}</h4>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    Ingrese el PIN de 4 dígitos
                  </span>
                </div>
              </div>

              {/* PIN Dots */}
              <div className="text-center space-y-1 py-1">
                <div className="flex justify-center gap-3 py-1">
                  {[0, 1, 2, 3].map(idx => (
                    <div
                      key={idx}
                      className={`w-3.5 h-3.5 rounded-full transition-all ${
                        idx < pinInput.length
                          ? 'bg-indigo-600 scale-110 shadow-sm shadow-indigo-600'
                          : isLight
                          ? 'bg-slate-200 border-2 border-slate-300'
                          : 'bg-slate-800 border-2 border-slate-700'
                      }`}
                    />
                  ))}
                </div>
                {pinError && (
                  <span className="text-rose-600 dark:text-rose-400 text-xs font-bold block animate-bounce">
                    {pinError}
                  </span>
                )}
              </div>

              {/* Numeric Keypad */}
              <div className="grid grid-cols-3 gap-1.5">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map(k => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      if (k === 'C') handleClear();
                      else if (k === '⌫') handleBackspace();
                      else handleDigit(k);
                    }}
                    className={`h-11 rounded-xl font-mono text-sm font-black transition-all active:scale-95 flex items-center justify-center cursor-pointer ${
                      k === 'C'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                        : k === '⌫'
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        : isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 shadow-2xs'
                        : 'bg-slate-950 hover:bg-slate-800 text-white border border-slate-800'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className={`px-5 py-3.5 border-t flex items-center justify-end ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <button
            type="button"
            onClick={handleClose}
            className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
              isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
