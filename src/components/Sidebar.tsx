import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import {
  LayoutDashboard,
  LayoutGrid,
  ShoppingBag,
  ChefHat,
  QrCode,
  ReceiptText,
  Boxes,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Utensils,
  Unlock,
  Lock,
  Menu,
  X,
  Bike,
  Users
} from 'lucide-react';
import { ActiveView } from '../types';
import { sound } from '../utils/sound';
import { isViewAllowedForUser, hasUserPermission, getRoleMetadata } from '../utils/permissions';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    waiter,
    restaurantBrand,
    themeMode,
    setThemeMode,
    currentShift,
    setIsCashShiftModalOpen,
    setCashModalMode,
    logout,
    tables,
    sales,
    stationMode,
    isMobileDevice,
    systemModules,
    customRoles,
    clients
  } = usePOS();

  const isLight = themeMode === 'vibrant-light';

  // Collapsible state (expanded by default on desktop)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sysme_sidebar_collapsed');
      return saved === 'true';
    }
    return false;
  });

  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isSoundOn, setIsSoundOn] = useState<boolean>(true);

  const toggleCollapse = () => {
    sound.playTap();
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sysme_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleToggleSound = () => {
    const newVal = sound.toggleSound();
    setIsSoundOn(newVal);
  };

  const handleNavClick = (view: ActiveView) => {
    sound.playTap();
    setActiveView(view);
    setIsMobileOpen(false);
  };

  // Live Counts for Badges
  const occupiedCount = tables.filter(t => t.status === 'occupied' || t.status === 'kitchen' || t.status === 'billed').length;
  const openSalesCount = sales.filter(s => s.status === 'open').length;
  const kitchenOrdersCount = sales.filter(s => s.status === 'open' && s.items.some(i => i.kitchenStatus === 'cooking' || i.kitchenStatus === 'pending')).length;
  const deliveryOrdersCount = sales.filter(s => s.status === 'open' && (s.orderType === 'delivery' || s.orderType === 'mostrador' || s.orderType === 'express')).length;

  // Role Badge Formatter (including manager, delivery & custom roles)
  const getRoleBadge = () => {
    const customRole = waiter.customRoleId
      ? customRoles.find(r => r.id === waiter.customRoleId)
      : undefined;
    const meta = getRoleMetadata(waiter.role);
    const title = customRole ? customRole.name : meta.label;

    switch (waiter.role) {
      case 'admin':
        return {
          title,
          badge: isLight ? 'bg-purple-100 text-purple-900 border-purple-200' : 'bg-purple-950/80 text-purple-200 border-purple-800/80',
          dot: 'bg-purple-500'
        };
      case 'manager':
        return {
          title,
          badge: isLight ? 'bg-indigo-100 text-indigo-900 border-indigo-200' : 'bg-indigo-950/80 text-indigo-200 border-indigo-800/80',
          dot: 'bg-indigo-500'
        };
      case 'cashier':
        return {
          title,
          badge: isLight ? 'bg-emerald-100 text-emerald-900 border-emerald-200' : 'bg-emerald-950/80 text-emerald-200 border-emerald-800/80',
          dot: 'bg-emerald-500'
        };
      case 'waiter':
        return {
          title,
          badge: isLight ? 'bg-blue-100 text-blue-900 border-blue-200' : 'bg-blue-950/80 text-blue-200 border-blue-800/80',
          dot: 'bg-blue-500'
        };
      case 'kitchen':
        return {
          title,
          badge: isLight ? 'bg-amber-100 text-amber-900 border-amber-200' : 'bg-amber-950/80 text-amber-200 border-amber-800/80',
          dot: 'bg-amber-500'
        };
      case 'delivery':
        return {
          title,
          badge: isLight ? 'bg-orange-100 text-orange-900 border-orange-200' : 'bg-orange-950/80 text-orange-200 border-orange-800/80',
          dot: 'bg-orange-500'
        };
      default:
        return {
          title,
          badge: 'bg-slate-800 text-slate-200',
          dot: 'bg-slate-400'
        };
    }
  };

  // Navigation Items with role-specific customization
  const navItems: {
    id: ActiveView;
    label: string;
    description: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: waiter.role === 'admin' ? 'Panel Ejecutivo' : 'Panel de Control',
      description: 'Métricas, ocupación y facturación',
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />
    },
    {
      id: 'floor',
      label: 'Salón & Mesas',
      description: 'Plano interactivo de salones',
      icon: <LayoutGrid className="w-5 h-5 shrink-0" />,
      badge: occupiedCount > 0 ? occupiedCount : undefined,
      badgeColor: 'bg-amber-400 text-slate-950'
    },
    {
      id: 'pos',
      label: 'Bar / TPV Comandas',
      description: 'Toma ágil de pedidos táctil',
      icon: <ShoppingBag className="w-5 h-5 shrink-0" />
    },
    {
      id: 'delivery',
      label: 'Delivery & Mostrador',
      description: 'Envíos, mostrador y express',
      icon: <Bike className="w-5 h-5 shrink-0" />,
      badge: deliveryOrdersCount > 0 ? deliveryOrdersCount : undefined,
      badgeColor: 'bg-orange-500 text-white'
    },
    {
      id: 'pending-sales',
      label: waiter.role === 'waiter' ? 'Mis Pedidos Activos' : 'Ventas Abiertas',
      description: 'Cuentas en curso de cobro',
      icon: <ReceiptText className="w-5 h-5 shrink-0" />,
      badge: openSalesCount > 0 ? openSalesCount : undefined,
      badgeColor: 'bg-blue-500 text-white'
    },
    {
      id: 'kitchen',
      label: 'Cocina / KDS',
      description: 'Monitor de marchas y partidas',
      icon: <ChefHat className="w-5 h-5 shrink-0" />,
      badge: kitchenOrdersCount > 0 ? kitchenOrdersCount : undefined,
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      id: 'menu',
      label: 'Carta QR & Mesas',
      description: 'Catálogo y códigos QR comensal',
      icon: <QrCode className="w-5 h-5 shrink-0" />
    },
    {
      id: 'clients',
      label: 'Clientes CRM',
      description: 'Cartera, direcciones y fidelización',
      icon: <Users className="w-5 h-5 shrink-0" />,
      badge: clients.length > 0 ? clients.length : undefined,
      badgeColor: 'bg-indigo-500 text-white'
    },
    {
      id: 'reports',
      label: 'Caja & Cierre Z',
      description: 'Arqueo de turnos e informes',
      icon: <ReceiptText className="w-5 h-5 shrink-0" />
    },
    {
      id: 'inventory',
      label: 'Almacén & Stock',
      description: 'Control de existencias e insumos',
      icon: <Boxes className="w-5 h-5 shrink-0" />
    },
    {
      id: 'admin',
      label: 'Administración',
      description: 'Personal, roles, tickets y ajustes',
      icon: <ShieldCheck className="w-5 h-5 shrink-0 text-violet-400" />
    }
  ];

  // Filter items allowed specifically for the user's role & active system modules
  const allowedNavItems = navItems.filter(item =>
    isViewAllowedForUser(item.id, waiter, stationMode, isMobileDevice, systemModules)
  );

  const roleInfo = getRoleBadge();

  return (
    <>
      {/* Mobile Hamburger Trigger (Top floating button on small screens) */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-2 left-2 z-50 p-2 rounded-xl bg-slate-900 text-white shadow-lg border border-slate-700 cursor-pointer"
        title="Abrir menú"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col justify-between transition-all duration-300 ease-in-out border-r select-none ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800 shadow-sm'
            : 'bg-slate-950 border-slate-800 text-slate-100'
        } ${
          isMobileOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header: Brand Logo & Collapse Toggle */}
        <div className={`p-4 border-b flex items-center justify-between gap-2 shrink-0 ${
          isLight ? 'border-slate-100 bg-slate-50/50' : 'border-slate-850 bg-slate-900/50'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 shrink-0">
              <Utensils className="w-5 h-5 text-white" />
            </div>

            {!isCollapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-black text-sm tracking-tight text-slate-900 dark:text-white truncate">
                    {restaurantBrand.name}
                  </h1>
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 uppercase shrink-0">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-medium">
                  TPV Gastronómico
                </p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle Button */}
          <button
            onClick={toggleCollapse}
            title={isCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
            className="hidden lg:flex p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer shrink-0"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Card inside Sidebar */}
        <div className={`p-3 border-b shrink-0 ${
          isLight ? 'border-slate-100 bg-slate-50/40' : 'border-slate-850 bg-slate-900/30'
        }`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="relative shrink-0">
              <img
                src={waiter.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={waiter.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-xl object-cover border-2 border-indigo-500/40 shadow-xs"
              />
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-950 ${roleInfo.dot}`} />
            </div>

            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="font-black text-xs text-slate-900 dark:text-white truncate">
                  {waiter.name.split(' ')[0]}
                </div>
                <div className="mt-0.5">
                  <span className={`inline-flex items-center text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border ${roleInfo.badge}`}>
                    {roleInfo.title}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation List - Filtered by User Role */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1.5 no-scrollbar">
          {!isCollapsed && (
            <div className="px-3 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Módulos Habilitados
            </div>
          )}

          {allowedNavItems.map(item => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                title={isCollapsed ? `${item.label} - ${item.description}` : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all relative cursor-pointer group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute left-1 top-2.5 bottom-2.5 w-1 rounded-full bg-white shadow-sm" />
                )}

                <div className={`transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-white' : isLight ? 'text-slate-500 group-hover:text-slate-900' : 'text-slate-400 group-hover:text-white'
                }`}>
                  {item.icon}
                </div>

                {!isCollapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <div className="truncate font-black text-xs leading-none">
                      {item.label}
                    </div>
                    <div className={`text-[10px] truncate mt-1 leading-none ${
                      isActive ? 'text-indigo-100' : 'text-slate-400 opacity-80'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                )}

                {/* Badge Count */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black min-w-[18px] text-center shadow-xs shrink-0 ${
                    item.badgeColor || 'bg-amber-400 text-slate-950'
                  } ${isCollapsed ? 'absolute top-1 right-2' : ''}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Actions & Status Section */}
        <div className={`p-3 border-t shrink-0 space-y-2.5 ${
          isLight ? 'border-slate-100 bg-slate-50/50' : 'border-slate-850 bg-slate-900/40'
        }`}>
          {/* Quick Cash Status Pill (if cashier or admin) */}
          {waiter.role !== 'waiter' && hasUserPermission(waiter, 'canOpenCloseCash') && (
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
              title={currentShift ? 'Caja activa (Clic para arqueo o cierre Z)' : 'Caja cerrada (Clic para abrir)'}
              className={`w-full py-1.5 px-2.5 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-between cursor-pointer ${
                currentShift
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <div className="flex items-center gap-1.5">
                {currentShift ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                {!isCollapsed && <span>{currentShift ? 'Caja Abierta' : 'Caja Cerrada'}</span>}
              </div>
              {!isCollapsed && currentShift && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          )}

          {/* Quick Utilities: Theme, Sound & Logout */}
          <div className={`flex items-center gap-1.5 ${isCollapsed ? 'flex-col' : 'justify-between'}`}>
            <div className="flex items-center gap-1">
              {/* Theme Toggle */}
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  setThemeMode(isLight ? 'vibrant-dark' : 'vibrant-light');
                }}
                title={isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                {isLight ? <Moon className="w-3.5 h-3.5 text-sky-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              {/* Sound Toggle */}
              <button
                type="button"
                onClick={handleToggleSound}
                title={isSoundOn ? 'Sonido FX activado' : 'Sonido silenciado'}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                {isSoundOn ? <Volume2 className="w-3.5 h-3.5 text-emerald-500" /> : <VolumeX className="w-3.5 h-3.5 opacity-40" />}
              </button>
            </div>

            {/* Logout / Lock Terminal Button */}
            <button
              onClick={() => {
                sound.playTap();
                logout();
              }}
              title="Cerrar sesión / Bloquear terminal"
              className={`p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white dark:text-rose-400 border border-rose-500/20 hover:border-rose-500 transition-all cursor-pointer flex items-center gap-1.5 ${
                !isCollapsed ? 'px-3 text-xs font-black' : ''
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              {!isCollapsed && <span>Salir</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
