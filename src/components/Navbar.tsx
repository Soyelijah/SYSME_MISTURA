import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import {
  LayoutGrid, ShoppingBag, ChefHat, QrCode, ReceiptText,
  Boxes, User, LogOut, Globe, Clock, Store, MonitorDot,
  Volume2, VolumeX, Maximize2, Minimize2, Sparkles, Utensils,
  Sun, Moon, Palette, CheckCircle2, ShieldCheck, Lock, Unlock,
  Coins, Settings, Smartphone, Monitor, ShieldAlert
} from 'lucide-react';
import { Language, ThemeMode } from '../types';
import { sound } from '../utils/sound';
import { isViewAllowedForUser, hasUserPermission, getRoleMetadata } from '../utils/permissions';
import { LanguageSelector } from './LanguageSelector';

export const Navbar: React.FC = () => {
  const {
    t, language, setLanguage, waiter, warehouse, terminal,
    activeView, setActiveView, setIsLoginModalOpen, sales, tables,
    themeMode, setThemeMode, restaurantBrand, currentShift,
    setIsCashShiftModalOpen, setCashModalMode, stationMode, setStationMode,
    logout
  } = usePOS();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [isSoundOn, setIsSoundOn] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
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

  return (
    <header className={`select-none sticky top-0 z-30 shadow-xl transition-colors duration-200 ${
      isLight
        ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800'
        : 'bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 text-white'
    }`}>
      {/* Top Brand & System Bar */}
      <div className={`px-3 sm:px-4 py-2 border-b flex flex-wrap items-center justify-between text-xs gap-2 transition-colors ${
        isLight
          ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-700'
          : 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-slate-300 border-slate-800/80'
      }`}>
        {/* Left: Official Restaurant Brand Logo & Version */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-500/20 ring-2 ring-indigo-400/40">
              <Utensils className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-black text-sm sm:text-base tracking-wider text-white drop-shadow-sm font-serif">
                  {restaurantBrand.name}
                </span>
                <span className="bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 font-extrabold text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider backdrop-blur-xs">
                  Dy Pos PRO
                </span>
              </div>
              <span className="text-[10px] font-medium text-indigo-200/80 hidden sm:block">
                {restaurantBrand.tagline}
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 bg-black/20 text-white px-2.5 py-1 rounded-lg border border-white/10 text-[11px] font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{terminal.name}</span>
            <span className="opacity-60">•</span>
            <span>{warehouse.name}</span>
          </div>

          {/* Quick Cash Status Indicator */}
          {hasUserPermission(waiter, 'canOpenCloseCash') ? (
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
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black border transition-all active:scale-95 ${
                currentShift
                  ? 'bg-emerald-500/30 text-emerald-100 border-emerald-400/40 hover:bg-emerald-500/40'
                  : 'bg-rose-500/30 text-rose-100 border-rose-400/40 hover:bg-rose-500/40'
              }`}
            >
              {currentShift ? <Unlock className="w-3.5 h-3.5 text-emerald-300" /> : <Lock className="w-3.5 h-3.5 text-rose-300" />}
              <span>{currentShift ? 'Caja Abierta' : 'Caja Cerrada'}</span>
            </button>
          ) : (
            <div
              title={currentShift ? 'Caja activa (Gestionada por Cajera/Admin)' : 'Caja cerrada'}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                currentShift
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                  : 'bg-slate-800/60 text-slate-300 border-slate-700'
              }`}
            >
              {currentShift ? <span className="w-2 h-2 rounded-full bg-emerald-400"></span> : <Lock className="w-3 h-3 text-slate-400" />}
              <span>{currentShift ? 'Caja Abierta' : 'Caja Cerrada'}</span>
            </div>
          )}
        </div>

        {/* Right: Quick Settings, Theme Mode Switcher, Sound & Waiter Info */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* THEME SELECTOR: Mode Color / Claro vs Mode Oscuro */}
          <div className="flex items-center bg-black/20 p-0.5 rounded-xl border border-white/20 text-[11px] font-bold">
            <button
              onClick={() => {
                sound.playTap();
                setThemeMode('vibrant-light');
              }}
              title="Modo Color Vivo (Diseño profesional de alta claridad para hostelería)"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                isLight
                  ? 'bg-white text-amber-700 font-black shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">{t.colorMode || 'Color Vivo'}</span>
            </button>
            <button
              onClick={() => {
                sound.playTap();
                setThemeMode('vibrant-dark');
              }}
              title="Modo Gourmet Oscuro con iluminaciones neón"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                !isLight
                  ? 'bg-slate-800 text-white font-black shadow-md border border-slate-700'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">{t.darkMode || 'Oscuro'}</span>
            </button>
          </div>

          {/* Sound FX Toggle */}
          <button
            onClick={handleToggleSound}
            title={isSoundOn ? "Sonido activado" : "Sonido silenciado"}
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-white border border-white/10 transition-colors"
          >
            {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-60" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={handleToggleFullscreen}
            title="Pantalla completa TPV"
            className="hidden sm:flex p-1.5 bg-black/20 hover:bg-black/30 text-white rounded-lg border border-white/10 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Real-time Clock */}
          <div className="flex items-center gap-1.5 font-mono text-white bg-black/25 px-2.5 py-1 rounded-lg border border-white/15 text-xs font-bold shadow-inner">
            <Clock className="w-3.5 h-3.5 text-yellow-300" />
            <span>{currentTime || '14:30:00'}</span>
          </div>

          {/* Language Switcher Component with flags */}
          <LanguageSelector variant="navbar" />

          {/* Waiter Profile Button */}
          <button
            id="user-switch-btn"
            onClick={() => {
              sound.playTap();
              setIsLoginModalOpen(true);
            }}
            title={t.switchUser || "Cambiar de usuario"}
            className="flex items-center gap-2 px-2.5 py-1 bg-white/15 hover:bg-white/25 text-white rounded-lg border border-white/20 transition-all shadow-sm active:scale-95"
          >
            <div className="w-5 h-5 rounded-full bg-white text-slate-900 flex items-center justify-center text-[11px] font-black uppercase">
              {waiter.name.charAt(0)}
            </div>
            <span className="font-bold text-xs max-w-[100px] truncate">{waiter.name}</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
              {waiter.role === 'admin' ? '🛡️ Admin' : waiter.role === 'cashier' ? '💰 Cajera' : waiter.role === 'kitchen' ? '🍳 Cocina' : '📱 Garzón'}
            </span>
          </button>

          {/* Lock / Logout Terminal Button */}
          <button
            id="terminal-lock-btn"
            onClick={() => {
              sound.playTap();
              logout();
            }}
            title={t.exit || "Cerrar sesión / Salir del sistema"}
            className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg border border-rose-400/50 text-xs font-black transition-all shadow-sm active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="inline">{t.exit || 'Salir'}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar with role-filtered tabs */}
      <div className={`px-2 sm:px-4 py-2.5 flex items-center justify-between gap-2 overflow-x-auto transition-colors ${
        isLight ? 'bg-slate-50' : 'bg-slate-900/90'
      }`}>
        <nav className="flex items-center gap-2 sm:gap-2.5">
          {/* Mesas / Salón (Garzones, Cajera, Admin) */}
          {isViewAllowedForUser('floor', waiter) && (
            <button
              id="nav-floor-btn"
              onClick={() => handleNavClick('floor')}
              className={`touch-btn flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all relative ${
                activeView === 'floor'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-600/40 ring-2 ring-blue-400 scale-[1.02]'
                  : isLight
                  ? 'bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 shadow-sm'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>{t.floorMap}</span>
              {occupiedCount > 0 && (
                <span className="bg-amber-400 text-slate-950 font-black text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-md">
                  {occupiedCount}
                </span>
              )}
            </button>
          )}

          {/* Ventas Abiertas (Garzones, Cajera, Admin) */}
          {isViewAllowedForUser('pending-sales', waiter) && (
            <button
              id="nav-pending-sales-btn"
              onClick={() => handleNavClick('pending-sales')}
              className={`touch-btn flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all relative ${
                activeView === 'pending-sales'
                  ? 'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/40 ring-2 ring-indigo-400 scale-[1.02]'
                  : isLight
                  ? 'bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 shadow-sm'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              <ReceiptText className="w-4 h-4" />
              <span>{t.openSales}</span>
              {openSalesCount > 0 && (
                <span className="bg-blue-500 text-white font-black text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-md">
                  {openSalesCount}
                </span>
              )}
            </button>
          )}

          {/* Comandero / TPV (Garzones, Cajera, Admin) */}
          {isViewAllowedForUser('pos', waiter) && (
            <button
              id="nav-pos-btn"
              onClick={() => handleNavClick('pos')}
              className={`touch-btn flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all ${
                activeView === 'pos'
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/40 ring-2 ring-emerald-400 scale-[1.02]'
                  : isLight
                  ? 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-200 shadow-sm'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t.pos}</span>
            </button>
          )}

          {/* Panel de Cocina KDS (Cocina, Admin) */}
          {isViewAllowedForUser('kitchen', waiter) && (
            <button
              id="nav-kitchen-btn"
              onClick={() => handleNavClick('kitchen')}
              className={`touch-btn flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all relative ${
                activeView === 'kitchen'
                  ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white shadow-lg shadow-orange-600/40 ring-2 ring-orange-400 scale-[1.02]'
                  : isLight
                  ? 'bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-600 border border-slate-200 shadow-sm'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>{t.kitchenPanel}</span>
              {kitchenOrdersCount > 0 && (
                <span className="bg-rose-500 text-white font-black text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center animate-bounce shadow-md">
                  {kitchenOrdersCount}
                </span>
              )}
            </button>
          )}

          {/* Carta Digital QR (Todos) */}
          {isViewAllowedForUser('menu', waiter) && (
            <button
              id="nav-menu-btn"
              onClick={() => handleNavClick('menu')}
              className={`touch-btn flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all ${
                activeView === 'menu'
                  ? 'bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 text-white shadow-lg shadow-teal-600/40 ring-2 ring-cyan-400 scale-[1.02]'
                  : isLight
                  ? 'bg-white text-slate-700 hover:bg-teal-50 hover:text-teal-600 border border-slate-200 shadow-sm'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>{t.digitalMenu}</span>
            </button>
          )}

          {/* Caja & Informes Arqueos (Cajera, Admin o con permiso canViewFinancialReports / canOpenCloseCash) */}
          {isViewAllowedForUser('reports', waiter) && (
            <button
              id="nav-reports-btn"
              onClick={() => handleNavClick('reports')}
              className={`touch-btn flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all ${
                activeView === 'reports'
                  ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-700 text-white shadow-lg shadow-purple-600/40 ring-2 ring-purple-400 scale-[1.02]'
                  : isLight
                  ? 'bg-white text-slate-700 hover:bg-purple-50 hover:text-purple-600 border border-slate-200 shadow-sm'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              <ReceiptText className="w-4 h-4" />
              <span>{t.cashReports}</span>
            </button>
          )}

          {/* Almacén & Stock (Admin o con permiso canEditCatalog) */}
          {isViewAllowedForUser('inventory', waiter) && (
            <button
              id="nav-inventory-btn"
              onClick={() => handleNavClick('inventory')}
              className={`touch-btn flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all ${
                activeView === 'inventory'
                  ? 'bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 text-white shadow-lg shadow-sky-600/40 ring-2 ring-sky-400 scale-[1.02]'
                  : isLight
                  ? 'bg-white text-slate-700 hover:bg-sky-50 hover:text-sky-600 border border-slate-200 shadow-sm'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>{t.inventory}</span>
            </button>
          )}

          {/* Panel de Administración & Privilegios (Admin o con permiso canManageUsers) */}
          {isViewAllowedForUser('admin', waiter) && (
            <button
              id="nav-admin-btn"
              onClick={() => handleNavClick('admin')}
              className={`touch-btn flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all ${
                activeView === 'admin'
                  ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 text-white shadow-lg shadow-violet-600/40 ring-2 ring-violet-400 scale-[1.02]'
                  : isLight
                  ? 'bg-white text-slate-700 hover:bg-violet-50 hover:text-violet-600 border border-slate-200 shadow-sm'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-violet-500" />
              <span>{t.adminPanel || 'Admin'}</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
