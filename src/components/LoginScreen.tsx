import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import { Waiter, Language, ThemeMode } from '../types';
import {
  ShieldCheck, Lock, Unlock, User, ChefHat, Sparkles,
  Clock, Utensils, Sun, Moon, Volume2, VolumeX, CheckCircle2,
  AlertCircle, Smartphone, Monitor, ChevronRight, Zap, RefreshCw
} from 'lucide-react';
import { sound } from '../utils/sound';
import { LanguageSelector } from './LanguageSelector';

export const LoginScreen: React.FC = () => {
  const {
    t,
    waiters,
    loginUser,
    quickLogin,
    restaurantBrand,
    terminal,
    warehouse,
    themeMode,
    setThemeMode,
    language,
    setLanguage
  } = usePOS();

  const isLight = themeMode === 'vibrant-light';

  // Active selected user for PIN entry
  const [selectedUser, setSelectedUser] = useState<Waiter>(() => {
    // Default to the first admin or first waiter
    const admin = waiters.find(w => w.role === 'admin');
    return admin || waiters[0];
  });

  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
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
        setPinError(`PIN incorrecto. (Sugerencia de prueba: ${userToLogin.pin})`);
        setPinInput('');
        setIsAuthenticating(false);
      }
    }, 150);
  };

  const handleDirectQuickLogin = (userToLogin: Waiter) => {
    sound.playSuccess();
    quickLogin(userToLogin);
  };

  // Helper role badge formatting
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrador / Gerente', color: 'bg-purple-600 text-white', icon: '🛡️' };
      case 'cashier':
        return { label: 'Cajera Principal', color: 'bg-emerald-600 text-white', icon: '💰' };
      case 'waiter':
        return { label: 'Garzón / Sala', color: 'bg-blue-600 text-white', icon: '📱' };
      case 'kitchen':
        return { label: 'Cocina / Chef KDS', color: 'bg-amber-600 text-white', icon: '🍳' };
      default:
        return { label: 'Personal', color: 'bg-slate-600 text-white', icon: '👤' };
    }
  };

  return (
    <div className={`min-h-screen w-screen flex flex-col justify-between select-none overflow-y-auto transition-colors duration-200 ${
      isLight
        ? 'bg-slate-100 text-slate-800'
        : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Top Header: Brand, System Info & Quick Controls */}
      <header className={`px-4 sm:px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 shadow-md ${
        isLight
          ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-700'
          : 'bg-slate-900 border-slate-800 text-slate-200'
      }`}>
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-400/40">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg sm:text-xl tracking-wider text-white font-serif">
                {restaurantBrand.name}
              </span>
              <span className="bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                Dy Pos PRO
              </span>
            </div>
            <p className="text-xs text-indigo-200/80 font-medium">
              {restaurantBrand.tagline}
            </p>
          </div>
        </div>

        {/* Terminal Info */}
        <div className="hidden md:flex items-center gap-2 bg-black/20 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-white/10 dark:border-slate-700 text-xs font-semibold text-white">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{terminal.name}</span>
          <span className="opacity-40">•</span>
          <span>{warehouse.name}</span>
        </div>

        {/* Right Quick Controls: Theme, Language & Clock */}
        <div className="flex items-center gap-3">
          {/* Theme switcher */}
          <div className="flex items-center bg-black/20 dark:bg-slate-800/80 p-0.5 rounded-xl border border-white/20 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => { sound.playTap(); setThemeMode('vibrant-light'); }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                isLight ? 'bg-white text-amber-700 font-black shadow-md' : 'text-white/80 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">{t.colorMode || 'Color'}</span>
            </button>
            <button
              onClick={() => { sound.playTap(); setThemeMode('vibrant-dark'); }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                !isLight ? 'bg-slate-700 text-white font-black shadow-md' : 'text-white/80 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">{t.darkMode || 'Oscuro'}</span>
            </button>
          </div>

          {/* Language Switcher Component */}
          <LanguageSelector variant="login" />

          {/* Clock */}
          <div className="hidden sm:flex items-center gap-1.5 font-mono text-white bg-black/25 dark:bg-slate-800/90 px-3 py-1 rounded-xl border border-white/15 dark:border-slate-700 text-xs font-bold shadow-inner">
            <Clock className="w-3.5 h-3.5 text-yellow-300" />
            <span>{currentTime || '14:30:00'}</span>
          </div>
        </div>
      </header>

      {/* Main Lock / Login Gateway Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {/* Welcome Headline */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>{t.lockedTerminal || 'Terminal Bloqueado'} • {t.pinPrompt || 'Inicie Sesión para Acceder'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {t.loginHeader || 'Control de Acceso de Personal'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 capitalize mt-1">
            {currentDate}
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* LEFT: Employee Profile Selection */}
          <div className={`lg:col-span-6 p-5 sm:p-6 rounded-3xl border shadow-xl flex flex-col justify-between ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" />
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    1. {t.selectUser || 'Seleccione su Usuario'}
                  </h2>
                </div>
                <span className="text-xs text-slate-400 font-bold">
                  {waiters.length} {t.employee.toLowerCase()}s
                </span>
              </div>

              {/* Grid of Users */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                {waiters.map(u => {
                  const isSelected = selectedUser.id === u.id;
                  const badge = getRoleBadge(u.role);

                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        sound.playTap();
                        setSelectedUser(u);
                        setPinInput('');
                        setPinError(null);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all relative flex items-center gap-3 ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30 scale-[1.02] ring-2 ring-blue-400'
                          : isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-blue-50/60 hover:border-blue-300'
                          : 'bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={u.name}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-xl object-cover shrink-0 border-2 border-white/40 shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-xs sm:text-sm truncate">
                          {u.name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                            isSelected ? 'bg-white/20 text-white' : badge.color
                          }`}>
                            {badge.icon} {badge.label.split('/')[0]}
                          </span>
                        </div>
                      </div>

                      {/* Demo PIN hint indicator */}
                      <div className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        PIN: {u.pin}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick 1-Click Demo Login Bar */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 mb-2">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Acceso Rápido Directo (Demo 1-Click):</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {waiters.slice(0, 4).map(u => (
                  <button
                    key={`quick-${u.id}`}
                    onClick={() => handleDirectQuickLogin(u)}
                    title={`Entrar directamente como ${u.name}`}
                    className="p-1.5 text-[10px] font-black rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all truncate text-center shadow-xs"
                  >
                    {u.role === 'admin' ? '🛡️ Admin' : u.role === 'cashier' ? '💰 Cajera' : u.role === 'kitchen' ? '🍳 Cocina' : '📱 Garzón'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Numeric Keypad & PIN Entry */}
          <div className={`lg:col-span-6 p-5 sm:p-6 rounded-3xl border shadow-xl flex flex-col justify-between ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            {/* Selected User Header Card */}
            <div>
              <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 mb-4 ${
                isLight ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex items-center gap-3">
                  <img
                    src={selectedUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={selectedUser.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-xl object-cover border-2 border-blue-500 shadow-sm"
                  />
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-600 dark:text-blue-400 block">
                      Usuario Seleccionado:
                    </span>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">
                      {selectedUser.name}
                    </h3>
                  </div>
                </div>
                <div className={`text-[10px] px-2 py-1 rounded-lg font-black uppercase ${getRoleBadge(selectedUser.role).color}`}>
                  {getRoleBadge(selectedUser.role).icon} {selectedUser.role}
                </div>
              </div>

              {/* PIN Dots Display */}
              <div className="text-center my-3">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                  Ingrese el PIN de 4 dígitos (Sugerencia: <strong className="font-mono text-blue-600 dark:text-blue-400">{selectedUser.pin}</strong>)
                </div>
                
                <div className="flex items-center justify-center gap-3 my-2">
                  {[0, 1, 2, 3].map(index => {
                    const isFilled = pinInput.length > index;
                    return (
                      <div
                        key={index}
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-all transform ${
                          isFilled
                            ? 'bg-blue-600 ring-4 ring-blue-400/40 scale-110'
                            : isLight
                            ? 'bg-slate-200 border-2 border-slate-300'
                            : 'bg-slate-800 border-2 border-slate-700'
                        }`}
                      />
                    );
                  })}
                </div>

                {pinError && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-rose-500 font-bold bg-rose-500/10 px-3 py-1 rounded-xl border border-rose-500/20 animate-shake mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{pinError}</span>
                  </div>
                )}
              </div>

              {/* Touchscreen Keypad (3x4 Grid) */}
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5 max-w-xs mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
                  <button
                    key={digit}
                    onClick={() => handleDigit(digit)}
                    disabled={isAuthenticating}
                    className={`h-12 sm:h-14 rounded-2xl font-mono text-lg sm:text-xl font-black transition-all active:scale-95 shadow-sm flex items-center justify-center ${
                      isLight
                        ? 'bg-slate-50 hover:bg-blue-50 text-slate-800 border border-slate-200 active:bg-blue-600 active:text-white'
                        : 'bg-slate-950 hover:bg-slate-800 text-white border border-slate-800 active:bg-blue-600'
                    }`}
                  >
                    {digit}
                  </button>
                ))}

                {/* Clear 'C' */}
                <button
                  onClick={handleClear}
                  disabled={isAuthenticating}
                  className={`h-12 sm:h-14 rounded-2xl font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center justify-center ${
                    isLight
                      ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                      : 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-800/50'
                  }`}
                >
                  Limpiar (C)
                </button>

                {/* '0' */}
                <button
                  onClick={() => handleDigit('0')}
                  disabled={isAuthenticating}
                  className={`h-12 sm:h-14 rounded-2xl font-mono text-lg sm:text-xl font-black transition-all active:scale-95 shadow-sm flex items-center justify-center ${
                    isLight
                      ? 'bg-slate-50 hover:bg-blue-50 text-slate-800 border border-slate-200 active:bg-blue-600 active:text-white'
                      : 'bg-slate-950 hover:bg-slate-800 text-white border border-slate-800 active:bg-blue-600'
                  }`}
                >
                  0
                </button>

                {/* Backspace ⌫ */}
                <button
                  onClick={handleBackspace}
                  disabled={isAuthenticating}
                  className={`h-12 sm:h-14 rounded-2xl font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center justify-center ${
                    isLight
                      ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                      : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 border border-amber-800/50'
                  }`}
                >
                  Borrar ⌫
                </button>
              </div>
            </div>

            {/* Submit / Unlock Button */}
            <div className="mt-4 pt-3">
              <button
                onClick={handleEnter}
                disabled={pinInput.length === 0 || isAuthenticating}
                className={`w-full py-3 sm:py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 ${
                  pinInput.length > 0
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-blue-600/40 hover:from-blue-500 hover:to-indigo-500'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
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
      <footer className="p-3 text-center text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800">
        <span>Sistema TPV Gastronómico Profesional</span> • <span>{restaurantBrand.address}</span> • <span>NIF: {restaurantBrand.cif}</span>
      </footer>
    </div>
  );
};
