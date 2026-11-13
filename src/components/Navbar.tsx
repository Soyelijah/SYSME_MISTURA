import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import {
  LayoutGrid, ShoppingBag, ChefHat, QrCode, ReceiptText,
  Boxes, User, LogOut, Globe, Clock, Store, MonitorDot,
  Volume2, VolumeX, Maximize2, Minimize2, Sparkles, Utensils,
  Sun, Moon, Palette, CheckCircle2, ShieldCheck, Lock, Unlock,
  Coins, Settings, Smartphone, Monitor, ShieldAlert, ChevronDown,
  LayoutDashboard
} from 'lucide-react';
import { Language, ThemeMode } from '../types';
import { sound } from '../utils/sound';
import { isViewAllowedForUser, hasUserPermission, getRoleMetadata } from '../utils/permissions';
import { LanguageSelector } from './LanguageSelector';
import { UserSessionSheet } from './UserSessionSheet';

export const Navbar: React.FC = () => {
  const {
    t, language, setLanguage, waiter, warehouse, terminal,
    activeView, setActiveView, setIsLoginModalOpen, sales, tables,
    themeMode, setThemeMode, restaurantBrand, currentShift,
    setIsCashShiftModalOpen, setCashModalMode, stationMode, setStationMode,
    logout, isMobileDevice, isMobileWaiter
  } = usePOS();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [isSoundOn, setIsSoundOn] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isUserSheetOpen, setIsUserSheetOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSound = () => {
    const newVal = sound.toggleSound();
    setIsSoundOn(newVal);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Counts for live badges
  const occupiedCount = tables.filter(t => t.status === 'occupied' || t.status === 'kitchen' || t.status === 'billed').length;
  const openSalesCount = sales.filter(s => s.status === 'open').length;
  const kitchenOrdersCount = sales.filter(s => s.status === 'open' && s.items.some(i => i.kitchenStatus === 'cooking' || i.kitchenStatus === 'pending')).length;

  const handleNavClick = (viewName: any) => {
    sound.playTap();
    setActiveView(viewName);
  };

  const isLight = themeMode === 'vibrant-light';

  // If on mobile / waiter mode and taking an order in POS terminal,
  // hide master Navbar to give 100% of the screen to the order taking workflow
  if ((isMobileDevice || stationMode === 'waiter-mobile') && activeView === 'pos') {
    return null;
  }

  return (
    <header className={`select-none sticky top-0 z-30 shadow-sm transition-colors duration-200 ${
      isLight
        ? 'bg-white border-b border-slate-200 text-slate-800'
        : 'bg-slate-950 border-b border-slate-800/80 text-white'
    }`}>
      {/* Top Brand & System Bar (Ultra-sleek & space-efficient) */}
      <div className={`px-2 sm:px-3 py-1 sm:py-1.5 border-b flex items-center justify-between text-xs gap-2 transition-colors ${
        isLight
          ? 'bg-slate-900 text-white border-slate-800'
          : 'bg-slate-950 text-slate-300 border-slate-800/80'
      }`}>
        {/* Left: Official Restaurant Brand Logo & Version */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-blue-600 text-white flex items-center justify-center font-black shadow-xs shrink-0">
              <Utensils className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-black text-xs sm:text-sm tracking-wide text-white font-serif truncate">
                {restaurantBrand.name}
              </span>
              <span className="bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 font-extrabold text-[8px] sm:text-[9px] px-1 py-0.2 rounded uppercase tracking-wider hidden sm:inline-block">
                PRO
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 bg-white/10 text-white px-2 py-0.5 rounded-md border border-white/10 text-[10px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{terminal.name}</span>
            <span className="opacity-40">•</span>
            <span>{warehouse.name}</span>
          </div>

          {/* Quick Cash Status Indicator (Desktop only) */}
          {stationMode !== 'waiter-mobile' && waiter.role !== 'waiter' && (
            hasUserPermission(waiter, 'canOpenCloseCash') ? (
              <button
                onClick={() => {
                  sound.playTap();
                  if (currentShift) {
                    setCashModalMode('close');
                  } else {
                    setCashModalMode('open');
                  }
                  setIsCashShiftModalOpen(true);
                }}
                className={`hidden md:flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all active:scale-95 cursor-pointer ${
                  currentShift
                    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30 hover:bg-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-200 border-rose-400/30 hover:bg-rose-500/30'
                }`}
              >
                {currentShift ? <Unlock className="w-3 h-3 text-emerald-300" /> : <Lock className="w-3 h-3 text-rose-300" />}
                <span>{currentShift ? 'Caja Abierta' : 'Caja Cerrada'}</span>
              </button>
            ) : (
              <div
                title={currentShift ? 'Caja activa (Gestionada por Cajera/Admin)' : 'Caja cerrada'}
                className={`hidden md:flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                  currentShift
                    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                    : 'bg-slate-800/60 text-slate-300 border-slate-700'
                }`}
              >
                {currentShift ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> : <Lock className="w-3 h-3 text-slate-400" />}
                <span>{currentShift ? 'Caja Abierta' : 'Caja Cerrada'}</span>
              </div>
            )
          )}
        </div>

        {/* Right: Quick Settings, Theme Mode Switcher, Sound & Waiter Info */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* THEME SELECTOR: Mode Color vs Oscuro */}
          <div className="flex items-center bg-black/30 p-0.5 rounded-lg border border-white/10 text-[10px] font-bold">
            <button
              onClick={() => {
                sound.playTap();
                setThemeMode(isLight ? 'vibrant-dark' : 'vibrant-light');
              }}
              title={isLight ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
              className="p-1 rounded transition-all text-white/90 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              {isLight ? (
                <Sun className="w-3 h-3 text-amber-400" />
              ) : (
                <Moon className="w-3 h-3 text-sky-400" />
              )}
            </button>
          </div>

          {/* Sound FX Toggle */}
          <button
            onClick={handleToggleSound}
            title={isSoundOn ? "Sonido activado" : "Sonido silenciado"}
            className="p-1 rounded-lg bg-black/30 hover:bg-black/40 text-white border border-white/10 transition-colors cursor-pointer"
          >
            {isSoundOn ? <Volume2 className="w-3 h-3 text-emerald-400" /> : <VolumeX className="w-3 h-3 opacity-50" />}
          </button>

          {/* Real-time Clock (Desktop only) */}
          <div className="hidden md:flex items-center gap-1 font-mono text-white bg-black/30 px-2 py-0.5 rounded-md border border-white/10 text-[10px] font-bold">
            <Clock className="w-3 h-3 text-yellow-300" />
            <span>{currentTime || '14:30:00'}</span>
          </div>

          {/* Language Selector */}
          <LanguageSelector variant="navbar" />

          {/* Executive Waiter Profile Pill */}
          <button
            id="user-switch-btn"
            onClick={() => {
              sound.playTap();
              setIsUserSheetOpen(true);
            }}
            title="Ver perfil de usuario y opciones de sesión"
            className="flex items-center gap-1.5 px-2 py-0.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/15 transition-all shadow-xs active:scale-95 cursor-pointer max-w-[120px] sm:max-w-[160px]"
          >
            <div className="relative shrink-0">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white text-slate-900 flex items-center justify-center text-[9px] sm:text-[10px] font-black uppercase shadow-xs">
                {waiter.name.charAt(0)}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-1 ring-slate-900" />
            </div>
            
            <div className="min-w-0 text-left">
              <span className="font-extrabold text-[10px] sm:text-xs truncate block leading-tight">
                {waiter.name.split(' ')[0]}
              </span>
            </div>

            <ChevronDown className="w-2.5 h-2.5 opacity-70 hidden sm:block shrink-0" />
          </button>

          {/* Lock / Logout Terminal Button (Desktop only) */}
          <button
            id="terminal-lock-btn"
            onClick={() => {
              sound.playTap();
              logout();
            }}
            title={t.exit || "Cerrar sesión / Salir del sistema"}
            className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded-md border border-rose-400/40 text-[10px] font-black transition-all shadow-xs active:scale-95 shrink-0 cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            <span>{t.exit || 'Salir'}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar with role-filtered tabs */}
      <div className={`px-2 sm:px-3 py-1 sm:py-1.5 flex items-center justify-start sm:justify-between gap-1 overflow-x-auto no-scrollbar transition-colors ${
        isLight ? 'bg-slate-50 border-b border-slate-200' : 'bg-slate-900/90 border-b border-slate-800/80'
      }`}>
        <nav className="flex items-center gap-1 sm:gap-1.5 w-max">
          {/* Panel Principal Dashboard (Cajera, Admin) */}
          {isViewAllowedForUser('dashboard', waiter, stationMode, isMobileDevice) && (
            <button
              id="nav-dashboard-btn"
              onClick={() => handleNavClick('dashboard')}
              className={`touch-btn flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-black text-xs transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                activeView === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isLight
                  ? 'bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 shadow-xs'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
              <span>Panel</span>
            </button>
          )}

          {/* Mesas / Salón (Garzones, Cajera, Admin) */}
          {isViewAllowedForUser('floor', waiter, stationMode, isMobileDevice) && (
            <button
              id="nav-floor-btn"
              onClick={() => handleNavClick('floor')}
              className={`touch-btn flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-black text-xs transition-all relative shrink-0 whitespace-nowrap cursor-pointer ${
                activeView === 'floor'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isLight
                  ? 'bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 shadow-xs'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
              <span>Mesas</span>
              {occupiedCount > 0 && (
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow-xs">
                  {occupiedCount}
                </span>
              )}
            </button>
          )}

          {/* Ventas Abiertas (Garzones, Cajera, Admin) */}
          {isViewAllowedForUser('pending-sales', waiter, stationMode, isMobileDevice) && (
            <button
              id="nav-pending-sales-btn"
              onClick={() => handleNavClick('pending-sales')}
              className={`touch-btn flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-black text-xs transition-all relative shrink-0 whitespace-nowrap ${
                activeView === 'pending-sales'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isLight
                  ? 'bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 shadow-xs'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              <ReceiptText className="w-3.5 h-3.5 shrink-0" />
              <span>{t.openSales}</span>
              {openSalesCount > 0 && (
                <span className="bg-blue-500 text-white font-black text-[10px] px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow-xs">
                  {openSalesCount}
                </span>
              )}
            </button>
          )}

          {/* Comandero / TPV (Garzones, Cajera, Admin - Desktop or when not on floor) */}
          {isViewAllowedForUser('pos', waiter, stationMode, isMobileDevice) && (
            <button
              id="nav-pos-btn"
              onClick={() => handleNavClick('pos')}
              className={`touch-btn flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-black text-xs transition-all shrink-0 whitespace-nowrap ${
                activeView === 'pos'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : isLight
                  ? 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-200 shadow-xs'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span>{t.pos}</span>
            </button>
          )}

          {/* Panel de Cocina KDS (Cocina, Admin) */}
          {isViewAllowedForUser('kitchen', waiter, stationMode, isMobileDevice) && (
            <button
              id="nav-kitchen-btn"
              onClick={() => handleNavClick('kitchen')}
              className={`touch-btn flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-black text-xs transition-all relative shrink-0 ${
                activeView === 'kitchen'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : isLight
                  ? 'bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-600 border border-slate-200 shadow-xs'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.kitchenPanel}</span>
              {kitchenOrdersCount > 0 && (
                <span className="bg-rose-500 text-white font-black text-[10px] px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow-xs">
                  {kitchenOrdersCount}
                </span>
              )}
            </button>
          )}

          {/* Carta Digital QR (Todos) */}
          {isViewAllowedForUser('menu', waiter, stationMode, isMobileDevice) && (
            <button
              id="nav-menu-btn"
              onClick={() => handleNavClick('menu')}
              className={`touch-btn flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-black text-xs transition-all shrink-0 ${
                activeView === 'menu'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : isLight
                  ? 'bg-white text-slate-700 hover:bg-teal-50 hover:text-teal-600 border border-slate-200 shadow-xs'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{t.digitalMenu}</span>
            </button>
          )}

          {/* Caja & Informes Arqueos (Cajera, Admin) */}
          {isViewAllowedForUser('reports', waiter, stationMode, isMobileDevice) && (
            <button
              id="nav-reports-btn"
              onClick={() => handleNavClick('reports')}
              className={`touch-btn flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-black text-xs transition-all shrink-0 ${
                activeView === 'reports'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : isLight
                  ? 'bg-white text-slate-700 hover:bg-purple-50 hover:text-purple-600 border border-slate-200 shadow-xs'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              <ReceiptText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.cashReports}</span>
            </button>
          )}

          {/* Almacén & Stock (Admin) */}
          {isViewAllowedForUser('inventory', waiter, stationMode, isMobileDevice) && (
            <button
              id="nav-inventory-btn"
              onClick={() => handleNavClick('inventory')}
              className={`touch-btn flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-black text-xs transition-all shrink-0 ${
                activeView === 'inventory'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : isLight
                  ? 'bg-white text-slate-700 hover:bg-sky-50 hover:text-sky-600 border border-slate-200 shadow-xs'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.inventory}</span>
            </button>
          )}

          {/* Panel de Administración & Privilegios (Admin) */}
          {isViewAllowedForUser('admin', waiter, stationMode, isMobileDevice) && (
            <button
              id="nav-admin-btn"
              onClick={() => handleNavClick('admin')}
              className={`touch-btn flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-black text-xs transition-all shrink-0 ${
                activeView === 'admin'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : isLight
                  ? 'bg-white text-slate-700 hover:bg-violet-50 hover:text-violet-600 border border-slate-200 shadow-xs'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-violet-500" />
              <span className="hidden sm:inline">{t.adminPanel || 'Admin'}</span>
            </button>
          )}
        </nav>
      </div>

      {/* Modern User Profile & Session Sheet */}
      <UserSessionSheet
        isOpen={isUserSheetOpen}
        onClose={() => setIsUserSheetOpen(false)}
      />
    </header>
  );
};
