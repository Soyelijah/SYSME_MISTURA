import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import { Waiter } from '../types';
import {
  ShieldCheck,
  Lock,
  Unlock,
  User,
  Utensils,
  Sun,
  Moon,
  Clock,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { sound } from '../utils/sound';
import { LanguageSelector } from './LanguageSelector';

export const LoginScreen: React.FC = () => {
  const {
    t,
    waiters,
    customRoles,
    loginUser,
    restaurantBrand,
    terminal,
    warehouse,
    themeMode,
    setThemeMode
  } = usePOS();

  const isLight = themeMode === 'vibrant-light';
  const activeWaiters = waiters.filter(w => w.active !== false);

  // Active selected user for PIN entry
  const [selectedUser, setSelectedUser] = useState<Waiter>(() => {
    const admin = activeWaiters.find(w => w.role === 'admin');
    return admin || activeWaiters[0] || waiters[0];
  });

  const [pinInput, setPinInput] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Physical Keyboard handler for PIN input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleClear();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleEnter();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pinInput, selectedUser]);

  const handleDigit = (digit: string) => {
    sound.playTap();
    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      setPinError(null);

      // Auto submit on 4th digit
      if (nextPin.length === 4) {
        verifyPin(nextPin, selectedUser);
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

  const handleEnter = () => {
    if (pinInput.length > 0) {
      verifyPin(pinInput, selectedUser);
    }
  };

  const verifyPin = (pinToTest: string, userToLogin: Waiter) => {
    setIsAuthenticating(true);
    setTimeout(() => {
      const success = loginUser(userToLogin, pinToTest);
      if (success) {
        sound.playSuccess();
      } else {
        sound.playBeep();
        setPinError('PIN de seguridad incorrecto. Inténtelo nuevamente.');
        setPinInput('');
        setIsAuthenticating(false);
      }
    }, 150);
  };

  // Helper role badge formatting
  const getRoleBadge = (user: Waiter) => {
    const custom = user.customRoleId ? customRoles.find(r => r.id === user.customRoleId) : undefined;
    switch (user.role) {
      case 'admin':
        return {
          label: custom ? custom.name : 'Administrador',
          badgeClass: isLight
            ? 'bg-purple-100 text-purple-900 border-purple-200'
            : 'bg-purple-950/80 text-purple-200 border-purple-800/80',
          icon: '🛡️'
        };
      case 'manager':
        return {
          label: custom ? custom.name : 'Encargado / Manager',
          badgeClass: isLight
            ? 'bg-indigo-100 text-indigo-900 border-indigo-200'
            : 'bg-indigo-950/80 text-indigo-200 border-indigo-800/80',
          icon: '👔'
        };
      case 'cashier':
        return {
          label: custom ? custom.name : 'Cajera Principal',
          badgeClass: isLight
            ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
            : 'bg-emerald-950/80 text-emerald-200 border-emerald-800/80',
          icon: '💰'
        };
      case 'waiter':
        return {
          label: custom ? custom.name : 'Garzón / Sala',
          badgeClass: isLight
            ? 'bg-blue-100 text-blue-900 border-blue-200'
            : 'bg-blue-950/80 text-blue-200 border-blue-800/80',
          icon: '📱'
        };
      case 'kitchen':
        return {
          label: custom ? custom.name : 'Cocina / KDS',
          badgeClass: isLight
            ? 'bg-amber-100 text-amber-900 border-amber-200'
            : 'bg-amber-950/80 text-amber-200 border-amber-800/80',
          icon: '🍳'
        };
      case 'delivery':
        return {
          label: custom ? custom.name : 'Repartidor',
          badgeClass: isLight
            ? 'bg-orange-100 text-orange-900 border-orange-200'
            : 'bg-orange-950/80 text-orange-200 border-orange-800/80',
          icon: '🛵'
        };
      default:
        return {
          label: custom ? custom.name : 'Personal',
          badgeClass: isLight
            ? 'bg-slate-100 text-slate-800 border-slate-200'
            : 'bg-slate-800 text-slate-200 border-slate-700',
          icon: '👤'
        };
    }
  };

  const formatDisplayName = (name: string) => {
    return name.replace(/\s*\([^)]*\)/g, '').trim();
  };

  return (
    <div className={`min-h-screen w-full flex flex-col justify-between select-none overflow-x-hidden transition-colors duration-200 ${
      isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Top Header */}
      <header className={`px-3 sm:px-6 py-2.5 sm:py-3 border-b shadow-xs ${
        isLight
          ? 'bg-slate-900 text-white border-slate-800'
          : 'bg-slate-900/90 backdrop-blur-md border-slate-800 text-slate-100'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Brand */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-500/20 shrink-0">
              <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-black text-sm sm:text-lg tracking-wider text-white font-serif truncate">
                  {restaurantBrand.name}
                </span>
                <span className="bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  PRO
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-indigo-200/80 font-medium truncate hidden xs:block">
                {restaurantBrand.tagline}
              </p>
            </div>
          </div>

          {/* Terminal Info */}
          <div className="hidden lg:flex items-center gap-2 bg-white/10 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-white/10 dark:border-slate-700 text-xs font-semibold text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{terminal.name}</span>
            <span className="opacity-40">•</span>
            <span>{warehouse.name}</span>
          </div>

          {/* Right Quick Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Theme switcher */}
            <div className="flex items-center bg-black/30 dark:bg-slate-800/80 p-0.5 rounded-xl border border-white/15 dark:border-slate-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => { sound.playTap(); setThemeMode(isLight ? 'vibrant-dark' : 'vibrant-light'); }}
                title={isLight ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white cursor-pointer"
              >
                {isLight ? <Moon className="w-3.5 h-3.5 text-sky-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            </div>

            {/* Language Switcher */}
            <LanguageSelector variant="login" />

            {/* Clock */}
            <div className="hidden sm:flex items-center gap-1.5 font-mono text-white bg-black/30 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl border border-white/15 dark:border-slate-700 text-xs font-bold shadow-inner">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentTime || '14:30:00'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Lock / Login Gateway Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col justify-center">
        {/* Welcome Headline */}
        <div className="text-center mb-4 sm:mb-6">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2 shadow-xs border ${
            isLight
              ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
              : 'bg-indigo-950/60 border-indigo-800/80 text-indigo-300'
          }`}>
            <Lock className="w-3.5 h-3.5 text-indigo-500" />
            <span>Terminal Seguro • Control de Acceso</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Inicio de Sesión de Personal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 capitalize mt-0.5">
            {currentDate}
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          {/* LEFT: Employee Profile Selection */}
          <div className={`lg:col-span-6 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border shadow-lg flex flex-col justify-between ${
            isLight
              ? 'bg-white border-slate-200/90 shadow-slate-200/60'
              : 'bg-slate-900 border-slate-800 shadow-slate-950/50'
          }`}>
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    1. Seleccione su Usuario
                  </h2>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-mono">
                  {activeWaiters.length} operadores
                </span>
              </div>

              {/* Grid of Users (No PIN or credential visible) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 max-h-[300px] sm:max-h-[340px] overflow-y-auto pr-1 no-scrollbar sm:scroll-auto">
                {activeWaiters.map(u => {
                  const isSelected = selectedUser.id === u.id;
                  const badge = getRoleBadge(u);
                  const cleanName = formatDisplayName(u.name);

                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        sound.playTap();
                        setSelectedUser(u);
                        setPinInput('');
                        setPinError(null);
                      }}
                      className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all relative flex items-center gap-2.5 sm:gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30 scale-[1.01] ring-2 ring-indigo-400'
                          : isLight
                          ? 'bg-slate-50/80 border-slate-200 text-slate-800 hover:bg-indigo-50/50 hover:border-indigo-200'
                          : 'bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-800/80'
                      }`}
                    >
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={cleanName}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover shrink-0 border border-black/10 dark:border-white/10 shadow-xs"
                      />
                      <div className="flex-1 min-w-0">
                        <div className={`font-black text-xs sm:text-sm truncate ${
                          isSelected ? 'text-white' : isLight ? 'text-slate-900' : 'text-white'
                        }`}>
                          {cleanName}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider border ${
                            isSelected
                              ? 'bg-white/20 text-white border-white/30'
                              : badge.badgeClass
                          }`}>
                            {badge.icon} {badge.label}
                          </span>
                        </div>
                      </div>

                      {/* Active status lock indicator */}
                      <div className={`flex items-center gap-1 text-[10px] font-bold ${
                        isSelected ? 'text-indigo-100' : 'text-slate-400'
                      }`}>
                        <Lock className="w-3 h-3" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Security Notice for Staff Only */}
            <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-black text-slate-800 dark:text-slate-200 block">
                    Acceso Exclusivo para Personal Autorizado
                  </span>
                  <span>
                    El alta de nuevos operadores y la asignación de permisos se gestiona estrictamente por el Administrador desde el Panel de Administración.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Numeric Keypad & PIN Entry (Credentials 100% hidden) */}
          <div className={`lg:col-span-6 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border shadow-lg flex flex-col justify-between ${
            isLight
              ? 'bg-white border-slate-200/90 shadow-slate-200/60'
              : 'bg-slate-900 border-slate-800 shadow-slate-950/50'
          }`}>
            {/* Selected User Header Card */}
            <div>
              <div className={`p-2.5 sm:p-3 rounded-2xl border flex items-center justify-between gap-3 mb-3 ${
                isLight ? 'bg-indigo-50/60 border-indigo-200/80' : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={selectedUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={selectedUser.name}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border-2 border-indigo-500 shadow-xs shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600 dark:text-indigo-400 block">
                      Operador:
                    </span>
                    <h3 className={`font-black text-xs sm:text-sm truncate ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      {formatDisplayName(selectedUser.name)}
                    </h3>
                  </div>
                </div>
                <div className={`text-[10px] px-2 py-0.5 rounded-lg font-black uppercase border shrink-0 ${getRoleBadge(selectedUser).badgeClass}`}>
                  {getRoleBadge(selectedUser).icon} {getRoleBadge(selectedUser).label}
                </div>
              </div>

              {/* PIN Dots Display */}
              <div className="text-center my-2 sm:my-3">
                <div className="flex items-center justify-center gap-2 mb-1.5">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Ingrese el código PIN de 4 dígitos:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="text-[10px] text-slate-400 hover:text-indigo-500 cursor-pointer flex items-center gap-1"
                  >
                    {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
                
                {/* Visual PIN Mask */}
                <div className="flex items-center justify-center gap-2.5 sm:gap-3 my-2">
                  {[0, 1, 2, 3].map(index => {
                    const isFilled = pinInput.length > index;
                    return (
                      <div
                        key={index}
                        className={`w-5 h-5 rounded-full transition-all flex items-center justify-center font-mono font-black text-xs ${
                          isFilled
                            ? showPin
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-indigo-600 ring-4 ring-indigo-400/30 scale-110'
                            : isLight
                            ? 'bg-slate-200 border border-slate-300'
                            : 'bg-slate-800 border border-slate-700'
                        }`}
                      >
                        {isFilled && showPin && pinInput[index]}
                      </div>
                    );
                  })}
                </div>

                {pinError && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/40 px-3 py-1 rounded-xl border border-rose-200 dark:border-rose-800/60 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{pinError}</span>
                  </div>
                )}
              </div>

              {/* Touchscreen Keypad (3x4 Grid) */}
              <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleDigit(digit)}
                    disabled={isAuthenticating}
                    className={`h-11 sm:h-13 rounded-2xl font-mono text-lg sm:text-xl font-black transition-all active:scale-95 shadow-xs flex items-center justify-center cursor-pointer ${
                      isLight
                        ? 'bg-slate-50 hover:bg-indigo-50/60 text-slate-800 border border-slate-200/90 active:bg-indigo-600 active:text-white'
                        : 'bg-slate-950 hover:bg-slate-800 text-white border border-slate-800 active:bg-indigo-600'
                    }`}
                  >
                    {digit}
                  </button>
                ))}

                {/* Clear 'C' */}
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isAuthenticating}
                  className={`h-11 sm:h-13 rounded-2xl font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center justify-center cursor-pointer ${
                    isLight
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                      : 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-800/50'
                  }`}
                >
                  Limpiar (C)
                </button>

                {/* '0' */}
                <button
                  type="button"
                  onClick={() => handleDigit('0')}
                  disabled={isAuthenticating}
                  className={`h-11 sm:h-13 rounded-2xl font-mono text-lg sm:text-xl font-black transition-all active:scale-95 shadow-xs flex items-center justify-center cursor-pointer ${
                    isLight
                      ? 'bg-slate-50 hover:bg-indigo-50/60 text-slate-800 border border-slate-200/90 active:bg-indigo-600 active:text-white'
                      : 'bg-slate-950 hover:bg-slate-800 text-white border border-slate-800 active:bg-indigo-600'
                  }`}
                >
                  0
                </button>

                {/* Backspace ⌫ */}
                <button
                  type="button"
                  onClick={handleBackspace}
                  disabled={isAuthenticating}
                  className={`h-11 sm:h-13 rounded-2xl font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center justify-center cursor-pointer ${
                    isLight
                      ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                      : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 border border-amber-800/50'
                  }`}
                >
                  Borrar ⌫
                </button>
              </div>
            </div>

            {/* Submit / Unlock Button */}
            <div className="mt-3 sm:mt-4 pt-2">
              <button
                type="button"
                onClick={handleEnter}
                disabled={pinInput.length === 0 || isAuthenticating}
                className={`w-full py-2.5 sm:py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer ${
                  pinInput.length > 0
                    ? 'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white shadow-indigo-600/30 hover:from-indigo-500 hover:to-blue-500'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
                }`}
              >
                <Unlock className="w-4 h-4" />
                <span>Desbloquear Terminal TPV</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer info */}
      <footer className={`px-4 py-2.5 text-center text-xs border-t ${
        isLight
          ? 'text-slate-500 bg-white/70 border-slate-200'
          : 'text-slate-400 bg-slate-950/80 border-slate-800'
      }`}>
        <span className="font-semibold">{restaurantBrand.name}</span> • <span>{restaurantBrand.address}</span> • <span>NIF: {restaurantBrand.cif}</span>
      </footer>
    </div>
  );
};
