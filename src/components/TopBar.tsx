import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import {
  Clock,
  Store,
  MonitorDot,
  Globe,
  User,
  ChevronDown,
  Sparkles,
  LogOut
} from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { UserSessionSheet } from './UserSessionSheet';
import { sound } from '../utils/sound';

export const TopBar: React.FC = () => {
  const {
    activeView,
    waiter,
    terminal,
    warehouse,
    restaurantBrand,
    themeMode,
    isMobileDevice,
    stationMode,
    logout
  } = usePOS();

  const isLight = themeMode === 'vibrant-light';
  const [currentTime, setCurrentTime] = useState<string>('');
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

  // Title by Active View
  const getViewTitle = () => {
    switch (activeView) {
      case 'dashboard':
        return { title: 'Panel de Control Principal', subtitle: 'Resumen ejecutivo en tiempo real' };
      case 'floor':
        return { title: 'Salón & Mesas', subtitle: 'Plano interactivo de salones y comandas' };
      case 'pos':
        return { title: 'Bar / TPV Comandas', subtitle: 'Terminal de venta y toma rápida de pedidos' };
      case 'delivery':
        return { title: 'Delivery & Mostrador', subtitle: 'Flujo de envíos a domicilio, pedidos mostrador y express' };
      case 'pending-sales':
        return { title: 'Ventas Abiertas', subtitle: 'Comandas activas pendientes de cobro' };
      case 'kitchen':
        return { title: 'Monitor de Cocina KDS', subtitle: 'Pases de comandas, tiempos y partidas' };
      case 'menu':
        return { title: 'Carta Digital QR', subtitle: 'Catálogo gastronómico y códigos QR de mesa' };
      case 'clients':
        return { title: 'Clientes & Fidelización', subtitle: 'Directorio de clientes, direcciones de entrega y envío rápido' };
      case 'reports':
        return { title: 'Caja & Cierre Z', subtitle: 'Arqueo de turnos e informes fiscales' };
      case 'inventory':
        return { title: 'Almacén & Stock', subtitle: 'Control de existencias e insumos' };
      case 'admin':
        return { title: 'Panel de Administración', subtitle: 'Personal, roles, permisos, impresión y módulos' };
      default:
        return { title: 'Dy Pos Gastrobar', subtitle: 'Sistema de Gestión Gastronómico' };
    }
  };

  const { title, subtitle } = getViewTitle();

  // If on mobile / waiter taking orders, hide top bar for 100% full screen focus
  if ((isMobileDevice || stationMode === 'waiter-mobile') && activeView === 'pos') {
    return null;
  }

  return (
    <header className={`px-4 sm:px-6 py-2.5 border-b select-none flex items-center justify-between gap-4 shrink-0 transition-colors ${
      isLight
        ? 'bg-white border-slate-200 text-slate-800'
        : 'bg-slate-950/90 backdrop-blur-md border-slate-800 text-slate-100'
    }`}>
      {/* Left: Active Page Breadcrumb & Title */}
      <div className="flex items-center gap-2 min-w-0 pl-10 lg:pl-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white truncate">
              {title}
            </h2>
            <span className="hidden md:inline-block text-[10px] text-slate-400 dark:text-slate-500 font-bold">
              /
            </span>
            <span className="hidden md:inline-block text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
              {subtitle}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Terminal, Clock & Language */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Terminal Info Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{terminal.name}</span>
          <span className="opacity-40">•</span>
          <span>{warehouse.name}</span>
        </div>

        {/* Clock */}
        <div className="hidden sm:flex items-center gap-1.5 font-mono text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>{currentTime || '14:30:00'}</span>
        </div>

        {/* Language Switcher */}
        <LanguageSelector variant="navbar" />

        {/* User Profile Pill */}
        <button
          onClick={() => { sound.playTap(); setIsUserSheetOpen(!isUserSheetOpen); }}
          title="Ver perfil de usuario y alternar turno"
          className="flex items-center gap-2 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
        >
          <img
            src={waiter.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={waiter.name}
            referrerPolicy="no-referrer"
            className="w-5 h-5 rounded-full object-cover"
          />
          <span className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[90px] hidden sm:inline-block">
            {waiter.name.split(' ')[0]}
          </span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {/* Direct One-Click Logout / Lock Button */}
        <button
          onClick={() => {
            sound.playTap();
            logout();
          }}
          title="Cerrar sesión / Bloquear terminal directamente"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white dark:text-rose-400 dark:hover:text-white border border-rose-500/20 hover:border-rose-500 text-xs font-black transition-all cursor-pointer shadow-2xs active:scale-95"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>

      <UserSessionSheet
        isOpen={isUserSheetOpen}
        onClose={() => setIsUserSheetOpen(false)}
      />
    </header>
  );
};
